"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export type InventoryRow = {
  sku: string;
  product_name: string;
  brand?: string;
  category?: string;
  photo_url?: string;
  quantity: number;
  price?: number;
  currency?: string;
  location_city?: string;
  location_country?: string;
};

function toBrandSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Brand → root category slug heuristic
const BRAND_CATEGORY_SLUG: Record<string, string> = {
  // Navigation
  "garmin": "navigation", "raymarine": "navigation", "simrad": "navigation",
  "furuno": "navigation", "b&g": "navigation", "bg": "navigation",
  "humminbird": "navigation", "standard horizon": "navigation",
  "navionics": "navigation", "airmar": "navigation",
  // Engines
  "volvo penta": "engines", "yanmar": "engines", "mtu": "engines",
  "caterpillar": "engines", "cummins": "engines", "mercruiser": "engines",
  "honda": "engines", "tohatsu": "engines", "suzuki": "engines",
  // Anchoring
  "lewmar": "anchoring", "maxwell": "anchoring", "lofrans": "anchoring",
  "quick": "anchoring", "muir": "anchoring",
  // Deck Hardware
  "harken": "deck-hardware", "ronstan": "deck-hardware",
  "spinlock": "deck-hardware", "antal": "deck-hardware",
  // Rigging
  "selden": "rigging", "navtec": "rigging", "sta-lok": "rigging",
  // Electrical
  "victron": "electrical", "mastervolt": "electrical", "xantrex": "electrical",
  "victron energy": "electrical",
  // Safety
  "plastimo": "safety", "ocean signal": "safety", "acr": "safety",
  "kannad": "safety", "mcmurdo": "safety", "jotron": "safety",
  "viking": "safety",
};

function guessCategorySlug(brand?: string): string | null {
  if (!brand) return null;
  return BRAND_CATEGORY_SLUG[brand.toLowerCase()] ?? null;
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
  // Use admin client to see ALL products (including is_active=false)
  const { data: existingProducts } = await admin
    .from("products")
    .select("id, sku")
    .in("sku", skus);

  const skuToProductId: Record<string, string> = Object.fromEntries(
    (existingProducts ?? []).map((p) => [p.sku, p.id])
  );

  // ── Step 2: for missing SKUs, get-or-create brands then products ──────────
  const newRows = rows.filter((r) => !skuToProductId[r.sku.trim()]);

  if (newRows.length > 0) {
    // Fetch all categories once for matching
    const { data: allCategories } = await admin
      .from("categories")
      .select("id, slug, name");

    const slugTocat: Record<string, string> = {};
    const nameTocat: Record<string, string> = {};
    for (const c of allCategories ?? []) {
      slugTocat[c.slug] = c.id;
      nameTocat[c.name.toLowerCase()] = c.id;
    }

    function resolveCategoryId(row: InventoryRow): string | null {
      if (row.category) {
        const s = row.category.trim().toLowerCase();
        return slugTocat[s] ?? nameTocat[s] ?? null;
      }
      const guessed = guessCategorySlug(row.brand);
      return guessed ? slugTocat[guessed] ?? null : null;
    }

    // Collect unique brand names (non-empty)
    const brandNames = [...new Set(
      newRows.map((r) => r.brand?.trim()).filter(Boolean) as string[]
    )];

    const brandNameToId: Record<string, string> = {};

    if (brandNames.length > 0) {
      const { data: existingBrands } = await admin
        .from("brands")
        .select("id, name")
        .in("name", brandNames);

      for (const b of existingBrands ?? []) brandNameToId[b.name] = b.id;

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

    // Create products — ignoreDuplicates prevents errors on race conditions
    const productsToInsert = newRows.map((r) => ({
      sku: r.sku.trim(),
      name: r.product_name.trim(),
      brand_id: r.brand?.trim() ? brandNameToId[r.brand.trim()] ?? null : null,
      category_id: resolveCategoryId(r),
      avg_price: r.price ?? null,
      currency: r.currency ?? "EUR",
      photos: r.photo_url?.trim() ? [r.photo_url.trim()] : [],
      is_active: true,
    }));

    const { data: createdProducts } = await admin
      .from("products")
      .upsert(productsToInsert, { ignoreDuplicates: true, onConflict: "brand_id,sku" })
      .select("id, sku");

    for (const p of createdProducts ?? []) skuToProductId[p.sku] = p.id;

    // For already-existing products — update photo if seller provided URL
    const photoUpdates = rows.filter(
      (r) => r.photo_url?.trim() && skuToProductId[r.sku.trim()]
        && !newRows.find((n) => n.sku.trim() === r.sku.trim())
    );
    for (const r of photoUpdates) {
      await admin
        .from("products")
        .update({ photos: [r.photo_url!.trim()] })
        .eq("id", skuToProductId[r.sku.trim()]);
    }
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
