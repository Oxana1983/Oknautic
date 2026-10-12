"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OfferInput = {
  quote_request_id: string;
  price_per_unit: number;
  currency: string;
  available_quantity: number;
  delivery_datetime: string;
  is_new: boolean;
  warranty_months: number;
  includes_vat: boolean;
  allows_pickup: boolean;
  in_stock: boolean;
  payment_cash: boolean;
  payment_cashless: boolean;
  comment: string;
};

export async function submitOffer(data: OfferInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Server-side guard: request must be open, routed to this seller, and
  // quantity must not exceed what the buyer requested (also enforced by
  // the trg_guard_offer_write DB trigger)
  const { data: reqs } = await supabase.rpc("get_seller_quote_requests", {
    p_ids: [data.quote_request_id],
  });
  const req = reqs?.[0];
  if (!req || req.status !== "in_progress") {
    return { error: "Запрос недоступен для предложений" };
  }
  if (data.available_quantity > req.quantity) {
    return { error: `Количество не может превышать запрошенное (${req.quantity} шт.)` };
  }

  // Explicit field list: server actions accept arbitrary objects at runtime,
  // so never spread client input into the row (e.g. status: "accepted")
  const { error } = await supabase.from("offers").upsert(
    {
      quote_request_id: data.quote_request_id,
      seller_id: user.id,
      price_per_unit: data.price_per_unit,
      currency: data.currency,
      available_quantity: data.available_quantity,
      delivery_datetime: data.delivery_datetime,
      is_new: data.is_new,
      warranty_months: data.warranty_months,
      includes_vat: data.includes_vat,
      allows_pickup: data.allows_pickup,
      in_stock: data.in_stock,
      payment_cash: data.payment_cash,
      payment_cashless: data.payment_cashless,
      comment: data.comment,
      // re-submitting after a withdrawal makes the offer active again
      status: "pending",
    },
    { onConflict: "quote_request_id,seller_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/[locale]/account/incoming", "page");
  revalidatePath("/[locale]/account/offers", "page");
  return {};
}

export async function withdrawOffer(
  offerId: string,
  requestId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("offers")
    .update({ status: "withdrawn" })
    .eq("id", offerId)
    .eq("seller_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/account/incoming", "page");
  revalidatePath("/[locale]/account/offers", "page");
  return {};
}
