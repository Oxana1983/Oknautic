"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

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

function toBrandSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function upsertInventoryRows(
  rows: InventoryRow[]
): Promise<{ error?: string; count?: number }> {
  const supabase = await createClient();
  const admin = await createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const skus = rows.map((r) => r.sku.trim());

  // ── Step 1: find products already in catalog ──────────────────────────────
  const { data: existingProducts } = await supabase
    .from("products")
    .select("id, sku")
    .in("sku", skus);

  const skuToProductId: Record<string, string> = Object.fromEntries(
    (existingProducts ?? []).map((p) => [p.sku, p.id])
  );

  // ── Step 2: for missing SKUs, get-or-create brands then products ──────────
  const newRows = rows.filter((r) => !skuToProductId[r.sku.trim()]);

  if (newRows.length > 0) {
    // Collect unique brand names (non-empty)
    const brandNames = [...new Set(
      newRows.map((r) => r.brand?.trim()).filter(Boolean) as string[]
    )];

    const brandNameToId: Record<string, string> = {};

    if (brandNames.length > 0) {
      // Fetch existing brands
      const { data: existingBrands } = await admin
        .from("brands")
        .select("id, name")
        .in("name", brandNames);

      for (const b of existingBrands ?? []) brandNameToId[b.name] = b.id;

      // Create brands that don't exist yet
      const missingBrandNames = brandNames.filter((n) => !brandNameToId[n]);
      if (missingBrandNames.length > 0) {
        const { data: created } = await admin
          .from("brands")
          .upsert(
            missingBrandNames.map((name) => ({
              name,
              slug: toBrandSlug(name),
              is_active: true,
            })),
            { onConflict: "slug" }
          )
          .select("id, name");

        for (const b of created ?? []) brandNameToId[b.name] = b.id;
      }
    }

    // Create products for new SKUs
    const productsToInsert = newRows.map((r) => ({
      sku: r.sku.trim(),
      name: r.product_name.trim(),
      brand_id: r.brand?.trim() ? brandNameToId[r.brand.trim()] ?? null : null,
      avg_price: r.price ?? null,
      currency: r.currency ?? "EUR",
      is_active: true,
    }));

    // Insert one-by-one to tolerate brand_id+sku uniqueness conflicts gracefully
    const { data: createdProducts } = await admin
      .from("products")
      .insert(productsToInsert)
      .select("id, sku");

    for (const p of createdProducts ?? []) skuToProductId[p.sku] = p.id;
  }

  // ── Step 3: upsert into seller_inventory ─────────────────────────────────
  const payload = rows.map((r) => ({
    seller_id: user.id,
    product_id: skuToProductId[r.sku.trim()] ?? null,
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
  revalidatePath("/catalog");
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
