import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { CatalogFilters } from "@/components/catalog/filters";
import { MobileFiltersButton } from "@/components/catalog/mobile-filters";
import { ProductCard } from "@/components/catalog/product-card";
import type { Product } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ brand?: string; q?: string }>;
};

async function fetchProducts(brandSlug?: string, q?: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, sku, name, description, photos, brand:brands!brand_id(name, slug), cat:categories!category_id(slug)")
    .eq("is_active", true)
    .order("name");

  let products: Product[] = (data ?? []).map((p: any) => ({
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

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const products = await fetchProducts(params.brand, params.q);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Каталог</h1>
          <p className="text-sm text-navy-400 mt-0.5">{products.length} товаров</p>
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
              <p className="font-display font-semibold text-navy-700 mb-1">Ничего не найдено</p>
              <p className="text-sm text-navy-400">Попробуйте изменить фильтры или поисковый запрос</p>
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
