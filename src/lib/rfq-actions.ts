"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
        delivery_location: "TBD",
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

  const { error } = await supabase.from("quote_requests").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/account/requests");
  return {};
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

  revalidatePath(`/account/requests/${requestId}`);
  revalidatePath("/account/offers");
  return {};
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
