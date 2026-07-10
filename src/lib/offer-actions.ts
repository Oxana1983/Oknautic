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

  // Server-side guard: quantity must not exceed what the buyer requested
  const { data: req } = await supabase
    .from("quote_requests")
    .select("quantity")
    .eq("id", data.quote_request_id)
    .single();

  if (req && data.available_quantity > req.quantity) {
    return { error: `Количество не может превышать запрошенное (${req.quantity} шт.)` };
  }

  const { error } = await supabase.from("offers").upsert(
    { ...data, seller_id: user.id },
    { onConflict: "quote_request_id,seller_id" }
  );

  if (error) return { error: error.message };

  revalidatePath(`/account/incoming/${data.quote_request_id}`);
  revalidatePath("/account/incoming");
  revalidatePath("/account/offers");
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

  revalidatePath(`/account/incoming/${requestId}`);
  revalidatePath("/account/incoming");
  revalidatePath("/account/offers");
  return {};
}
