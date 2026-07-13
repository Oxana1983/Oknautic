"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendNewRequestEmail, sendOfferAcceptedEmail } from "@/lib/email";
import type { CartItem } from "@/lib/cart-context";

type RfqInput = {
  name: string;
  email: string;
  phone: string;
  comment: string;
  items: CartItem[];
};

export async function submitRfq(
  data: RfqInput
): Promise<{ error?: string; requiresAuth?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { requiresAuth: true };

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
        delivery_area: "TBD",
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

  // Notify sellers whose inventory matches each new request
  void notifyMatchingSellers(inserted ?? []);

  revalidatePath("/account/requests");
  return {};
}

async function notifyMatchingSellers(
  requests: { id: string; sku: string; product_name: string; quantity: number }[]
) {
  if (!requests.length) return;
  const admin = createAdminClient();

  for (const req of requests) {
    // Find sellers who have this SKU in inventory with notifications enabled
    const { data: matches } = await admin
      .from("seller_inventory")
      .select("seller_id, profiles!inner(email_notifications_quotes)")
      .eq("sku", req.sku)
      .eq("is_available", true)
      .gt("quantity", 0);

    for (const m of matches ?? []) {
      const profile = m.profiles as { email_notifications_quotes: boolean } | null;
      if (!profile?.email_notifications_quotes) continue;

      const { data: { user: seller } } = await admin.auth.admin.getUserById(m.seller_id);
      if (seller?.email) {
        await sendNewRequestEmail(seller.email, {
          productName: req.product_name,
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

  // Mark request as completed
  const { error: reqError } = await supabase
    .from("quote_requests")
    .update({ accepted_offer_id: offerId, status: "completed" })
    .eq("id", requestId)
    .eq("customer_id", user.id);

  if (reqError) return { error: reqError.message };

  // Mark the winning offer as accepted
  const { error: offerError } = await supabase
    .from("offers")
    .update({ status: "accepted" })
    .eq("id", offerId)
    .eq("quote_request_id", requestId);

  if (offerError) return { error: offerError.message };

  // Email the winning seller
  void notifySellerOfAcceptance(offerId, requestId);

  revalidatePath(`/account/requests/${requestId}`);
  revalidatePath("/account/offers");
  return {};
}

async function notifySellerOfAcceptance(offerId: string, requestId: string) {
  const admin = createAdminClient();

  const { data: offer } = await admin
    .from("offers")
    .select("seller_id, profiles!inner(email_notifications_offers)")
    .eq("id", offerId)
    .single();

  if (!offer) return;
  const profile = offer.profiles as { email_notifications_offers: boolean } | null;
  if (!profile?.email_notifications_offers) return;

  const { data: req } = await admin
    .from("quote_requests")
    .select("product_name, sku, buyer_name, buyer_phone, buyer_email")
    .eq("id", requestId)
    .single();

  if (!req) return;

  const { data: { user: seller } } = await admin.auth.admin.getUserById(offer.seller_id);
  if (!seller?.email) return;

  await sendOfferAcceptedEmail(seller.email, {
    productName: req.product_name,
    sku: req.sku,
    buyerName: req.buyer_name ?? "Покупатель",
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

  revalidatePath(`/account/requests/${requestId}`);
  revalidatePath("/account/requests");
  return {};
}
