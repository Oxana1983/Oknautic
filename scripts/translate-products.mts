/**
 * Batch-translate all products using Claude API.
 * Adds ru + it name translations and en/ru/it descriptions.
 *
 * Run: npx tsx scripts/translate-products.mts
 */

import Anthropic from "@anthropic-ai/sdk";

const SUPABASE_URL = "https://kgiipxccnquatppaywle.supabase.co";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;

if (!SERVICE_KEY)  throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY not set");

const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

const headers = {
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

type Product = {
  id: string;
  sku: string;
  name: string;
};

type Translation = {
  id: string;
  name_i18n: { ru: string; it: string };
  description_i18n: { en: string; ru: string; it: string };
};

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=id,sku,name&is_active=eq.true&order=name`,
    { headers }
  );
  const data = await res.json();
  if (!res.ok || !Array.isArray(data)) {
    throw new Error(`Failed to fetch products: ${JSON.stringify(data)}`);
  }
  return (data as any[]).map((p: any) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
  }));
}

async function translateBatch(products: Product[]): Promise<Translation[]> {
  const list = products
    .map((p, i) => `${i + 1}. ID:${p.id} | SKU:${p.sku} | Name:${p.name}`)
    .join("\n");

  const prompt = `You are a professional translator for a marine equipment B2B marketplace.

For each product below, return a JSON array. Each object must have:
- "id": the product ID (copy exactly)
- "name_ru": Russian name (translate the English product name naturally; keep brand name and model number unchanged, translate only type/description words. E.g. "Garmin ECHOMAP Ultra 94sv Chartplotter" → "Картплоттер Garmin ECHOMAP Ultra 94sv")
- "name_it": Italian name (same principle — keep brand/model, translate type words)
- "desc_en": English description (2 sentences, professional, factual, suitable for a marine parts catalog)
- "desc_ru": Russian description (same content, natural Russian, 2 sentences)
- "desc_it": Italian description (same content, natural Italian, 2 sentences)

Products:
${list}

Return ONLY a valid JSON array, no markdown, no explanation.`;

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text.trim();
  // Strip markdown code fences if present
  const json = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const raw = JSON.parse(json) as Array<{
    id: string;
    name_ru: string;
    name_it: string;
    desc_en: string;
    desc_ru: string;
    desc_it: string;
  }>;

  return raw.map((r) => ({
    id: r.id,
    name_i18n: { ru: r.name_ru, it: r.name_it },
    description_i18n: { en: r.desc_en, ru: r.desc_ru, it: r.desc_it },
  }));
}

async function updateProduct(t: Translation) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=eq.${t.id}`,
    {
      method: "PATCH",
      headers: { ...headers, "Prefer": "return=minimal" },
      body: JSON.stringify({
        name_i18n: t.name_i18n,
        description_i18n: t.description_i18n,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to update ${t.id}: ${err}`);
  }
}

async function main() {
  console.log("Fetching products...");
  const products = await fetchProducts();
  console.log(`Found ${products.length} products`);

  // Batch by 15 to stay well within token limits
  const BATCH = 15;
  let translated = 0;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    console.log(`\nTranslating batch ${Math.floor(i / BATCH) + 1} (${batch.length} products)...`);

    const results = await translateBatch(batch);
    console.log(`  Got ${results.length} translations, uploading...`);

    for (const t of results) {
      await updateProduct(t);
      process.stdout.write(".");
    }

    console.log(`\n  Batch done. Progress: ${Math.min(i + BATCH, products.length)}/${products.length}`);

    // Small pause between batches to be kind to the API
    if (i + BATCH < products.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n✓ Done. Translated ${translated || products.length} products.`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
