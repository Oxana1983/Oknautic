import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { CatalogFilters } from "@/components/catalog/filters";
import { MobileFiltersButton } from "@/components/catalog/mobile-filters";
import { ProductCard } from "@/components/catalog/product-card";
import { CATEGORIES } from "@/lib/mock-data";
import type { Product } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ brand?: string; q?: string }>;
};

async function fetchByCategory(categorySlug: string, brandSlug?: string, q?: string): Promise<Product[]> {
  const supabase = await createClient();

  // Resolve slug → id
  const { data: catRow } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!catRow) return [];

  // Include subcategories (products are assigned to leaf categories, not roots)
  const { data: children } = await supabase
    .from("categories")
    .select("id")
    .eq("parent_id", catRow.id);

  const categoryIds = [catRow.id, ...(children ?? []).map((c: any) => c.id)];

  const { data } = await supabase
    .from("products")
    .select("id, sku, name, description, photos, brand:brands!brand_id(name, slug), cat:categories!category_id(slug)")
    .eq("is_active", true)
    .in("category_id", categoryIds)
    .order("name");

  let products: Product[] = (data ?? [])
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      brand: p.brand?.name ?? "",
      category: p.cat?.slug ?? "",
      description: p.description ?? "",
      image: p.photos?.[0] ?? undefined,
      images: p.photos ?? [],
      hasVariants: false,
    }));

  if (brandSlug) {
    products = products.filter((p) => p.brand.toLowerCase() === brandSlug.toLowerCase());
  }
  if (q) {
    const ql = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(ql) ||
        p.sku.toLowerCase().includes(ql) ||
        p.brand.toLowerCase().includes(ql)
    );
  }
  return products;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const t = await getTranslations("catalog");
  const tCat = await getTranslations("categories");
  const tRfq = await getTranslations("rfq");
  const { category } = await params;
  const sp = await searchParams;

  const cat = CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();

  const catLabel = tCat(cat.slug as Parameters<typeof tCat>[0]);
  const products = await fetchByCategory(category, sp.brand, sp.q);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-navy-400 mb-5">
        <Link href="/" className="hover:text-navy-700 transition-colors">{tRfq("home")}</Link>
        <ChevronRight size={14} />
        <Link href="/catalog" className="hover:text-navy-700 transition-colors">{t("title")}</Link>
        <ChevronRight size={14} />
        <span className="text-navy-700 font-medium">{catLabel}</span>
      </nav>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 flex items-center gap-2">
            <span>{cat.emoji}</span>
            {catLabel}
          </h1>
          <p className="text-sm text-navy-400 mt-0.5">{t("count", { count: products.length })}</p>
        </div>
        <Suspense>
          <MobileFiltersButton />
        </Suspense>
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block w-52 shrink-0">
          <Suspense>
            <CatalogFilters />
          </Suspense>
        </div>
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-display font-semibold text-navy-700 mb-1">{t("noResults")}</p>
              <p className="text-sm text-navy-400">{t("noResultsHint")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
