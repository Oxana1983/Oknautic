import { Suspense } from "react";
import { CatalogFilters } from "@/components/catalog/filters";
import { MobileFiltersButton } from "@/components/catalog/mobile-filters";
import { ProductCard } from "@/components/catalog/product-card";
import { filterProducts } from "@/lib/mock-data";

type Props = {
  searchParams: Promise<{ brand?: string; q?: string; sort?: string }>;
};

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const products = filterProducts({ brand: params.brand, q: params.q });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Каталог</h1>
          <p className="text-sm text-navy-400 mt-0.5">{products.length} товаров</p>
        </div>
        <div className="flex items-center gap-2">
          <Suspense>
            <MobileFiltersButton />
          </Suspense>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop */}
        <div className="hidden lg:block w-52 shrink-0">
          <Suspense>
            <CatalogFilters />
          </Suspense>
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <Empty />
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

function Empty() {
  return (
    <div className="text-center py-20">
      <p className="text-4xl mb-3">🔍</p>
      <p className="font-display font-semibold text-navy-700 mb-1">Ничего не найдено</p>
      <p className="text-sm text-navy-400">Попробуйте изменить фильтры или поисковый запрос</p>
    </div>
  );
}
