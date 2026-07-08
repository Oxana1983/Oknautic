"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type InventoryRow = {
  sku: string;
  product_name: string;
  brand?: string;
  quantity: number;
  price?: number;
  currency?: string;
  location_city?: string;
  location_country?: string;
};

export async function upsertInventoryRows(
  rows: InventoryRow[]
): Promise<{ error?: string; count?: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Match SKUs to products table to fill product_id
  const skus = rows.map((r) => r.sku);
  const { data: products } = await supabase
    .from("products")
    .select("id, sku")
    .in("sku", skus);
  const skuToId = Object.fromEntries((products ?? []).map((p) => [p.sku, p.id]));

  const payload = rows.map((r) => ({
    seller_id: user.id,
    product_id: skuToId[r.sku] ?? null,
    sku: r.sku.trim(),
    product_name: r.product_name.trim(),
    brand: r.brand?.trim() || null,
    quantity: Math.max(0, r.quantity),
    price: r.price ?? null,
    currency: r.currency ?? "EUR",
    location_city: r.location_city?.trim() || null,
    location_country: r.location_country?.trim() || null,
    is_available: true,
  }));

  const { error } = await supabase
    .from("seller_inventory")
    .upsert(payload, { onConflict: "seller_id,sku" });

  if (error) return { error: error.message };
  revalidatePath("/account/inventory");
  return { count: payload.length };
}

export async function updateInventoryItem(
  id: string,
  data: { quantity: number; price?: number; location_city?: string; location_country?: string; is_available: boolean }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("seller_inventory")
    .update(data)
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/account/inventory");
  return {};
}

export async function deleteInventoryItem(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("seller_inventory")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/account/inventory");
  return {};
}
