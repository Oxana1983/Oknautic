"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { sendNewRequestEmail, sendOfferAcceptedEmail, toEmailLocale, type EmailLocale } from "@/lib/email";
import type { CartItem } from "@/lib/cart-context";
import { distanceKm } from "@/lib/utils";

type RfqInput = {
  name: string;
  email: string;
  phone: string;
  comment: string;
  delivery: { city: string; country: string; lat: number; lng: number } | null;
  items: CartItem[];
};

function validDelivery(d: RfqInput["delivery"]) {
  return (
    !!d &&
    typeof d.city === "string" && d.city.trim().length > 0 && d.city.length <= 120 &&
    typeof d.country === "string" && d.country.length <= 120 &&
    Number.isFinite(d.lat) && Math.abs(d.lat) <= 90 &&
    Number.isFinite(d.lng) && Math.abs(d.lng) <= 180
  );
}

export async function submitRfq(
  data: RfqInput
): Promise<{ error?: string; requiresAuth?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { requiresAuth: true };
  if (!validDelivery(data.delivery)) return { error: "delivery" };
  const delivery = data.delivery!;

  // Look up each product by SKU to get DB IDs for routing
  const rows = await Promise.all(
    data.items.map(async (item) => {
      const { data: product } = await supabase
        .from("products")
        .select("id, brand_id, category_id")
        .eq("sku", item.sku)
        .maybeSingle();

      return {
        customer_id: user.id,
        product_id: product?.id ?? null,
        brand_id: product?.brand_id ?? null,
        category_id: product?.category_id ?? null,
        sku: item.sku,
        product_name: item.name,
        product_photo: item.image ?? null,
        variant_attrs: item.selectedVariants
          ? (item.selectedVariants as Record<string, string>)
          : null,
        quantity: item.quantity,
        // City-level only; the exact address is shared after acceptance
        delivery_area: [delivery.city.trim(), delivery.country.trim()].filter(Boolean).join(", "),
        delivery_country: delivery.country.trim() || null,
        delivery_lat: delivery.lat,
        delivery_lng: delivery.lng,
        delivery_address: "",
        delivery_datetime: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        buyer_name: data.name,
        buyer_phone: data.phone,
        buyer_email: user.email ?? null,
        additional_comment: data.comment || null,
      };
    })
  );

  const { data: inserted, error } = await supabase
    .from("quote_requests")
    .insert(rows)
    .select("id, sku, product_name, quantity");
  if (error) return { error: error.message };

  // Notify sellers whose inventory matches each new request.
  // after() keeps the serverless function alive until emails are sent.
  // Sellers get emails in their own language; the buyer's is the fallback.
  const fallbackLocale = toEmailLocale(await getLocale());
  after(() => notifyMatchingSellers(inserted ?? [], delivery, fallbackLocale));

  revalidatePath("/[locale]/account/requests", "page");
  return {};
}

type Admin = ReturnType<typeof createAdminClient>;

// Catalog name in the recipient's language, else the name stored on the request
async function localizedProductName(admin: Admin, sku: string, locale: EmailLocale, fallback: string) {
  const { data: product } = await admin
    .from("products")
    .select("name, name_i18n")
    .eq("sku", sku)
    .limit(1)
    .maybeSingle();
  const i18n = (product?.name_i18n ?? {}) as Record<string, string>;
  return i18n[locale] || product?.name || fallback;
}

async function notifyMatchingSellers(
  requests: { id: string; sku: string; product_name: string; quantity: number }[],
  delivery: { lat: number; lng: number },
  fallbackLocale: EmailLocale
) {
  if (!requests.length) return;
  const admin = createAdminClient();

  for (const req of requests) {
    // Find sellers who have this SKU in inventory with notifications enabled
    const { data: matches } = await admin
      .from("seller_inventory")
      .select("seller_id, profiles!inner(email_notifications_quotes, locale, lat, lng, service_radius_km)")
      .eq("sku", req.sku)
      .eq("is_available", true)
      .gt("quantity", 0);

    for (const m of matches ?? []) {
      const profile = m.profiles as {
        email_notifications_quotes: boolean;
        locale: string | null;
        lat: number | null;
        lng: number | null;
        service_radius_km: number | null;
      } | null;
      if (!profile?.email_notifications_quotes) continue;

      // Same rule as is_request_routed_to_me: outside the radius → not routed
      const km = distanceKm(profile, delivery);
      if (profile.service_radius_km != null && km != null && km > profile.service_radius_km) continue;

      const { data: { user: seller } } = await admin.auth.admin.getUserById(m.seller_id);
      if (seller?.email) {
        const locale = profile.locale ? toEmailLocale(profile.locale) : fallbackLocale;
        await sendNewRequestEmail(seller.email, locale, {
          productName: await localizedProductName(admin, req.sku, locale, req.product_name),
          sku: req.sku,
          quantity: req.quantity,
          requestId: req.id,
        });
      }
    }
  }
}

export async function acceptOffer(
  offerId: string,
  requestId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Mark request as completed. trg_on_offer_accepted marks the offer as
  // accepted; trg_validate_accepted_offer rejects offers of other requests,
  // withdrawn offers, and already-closed requests.
  const { data: updated, error: reqError } = await supabase
    .from("quote_requests")
    .update({ accepted_offer_id: offerId, status: "completed" })
    .eq("id", requestId)
    .eq("customer_id", user.id)
    .eq("status", "in_progress")
    .select("id");

  if (reqError) return { error: reqError.message };
  if (!updated?.length) return { error: "Запрос уже закрыт или не найден" };

  // Email the winning seller
  const fallbackLocale = toEmailLocale(await getLocale());
  after(() => notifySellerOfAcceptance(offerId, requestId, fallbackLocale));

  revalidatePath("/[locale]/account/requests/[id]", "page");
  revalidatePath("/[locale]/account/offers", "page");
  return {};
}

async function notifySellerOfAcceptance(offerId: string, requestId: string, fallbackLocale: EmailLocale) {
  const admin = createAdminClient();

  const { data: offer } = await admin
    .from("offers")
    .select("seller_id, profiles!inner(email_notifications_offers, locale)")
    .eq("id", offerId)
    .single();

  if (!offer) return;
  const profile = offer.profiles as { email_notifications_offers: boolean; locale: string | null } | null;
  if (!profile?.email_notifications_offers) return;

  const { data: req } = await admin
    .from("quote_requests")
    .select("product_name, sku, buyer_name, buyer_phone, buyer_email")
    .eq("id", requestId)
    .single();

  if (!req) return;

  const { data: { user: seller } } = await admin.auth.admin.getUserById(offer.seller_id);
  if (!seller?.email) return;

  const locale = profile.locale ? toEmailLocale(profile.locale) : fallbackLocale;
  await sendOfferAcceptedEmail(seller.email, locale, {
    productName: await localizedProductName(admin, req.sku, locale, req.product_name),
    sku: req.sku,
    buyerName: req.buyer_name,
    buyerPhone: req.buyer_phone,
    buyerEmail: req.buyer_email,
    requestId,
  });
}

export async function closeRequest(
  requestId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("quote_requests")
    .update({ status: "closed" })
    .eq("id", requestId)
    .eq("customer_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/account/requests/[id]", "page");
  revalidatePath("/[locale]/account/requests", "page");
  return {};
}
