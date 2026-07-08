import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CatalogFilters } from "@/components/catalog/filters";
import { MobileFiltersButton } from "@/components/catalog/mobile-filters";
import { ProductCard } from "@/components/catalog/product-card";
import { filterProducts, getCategory } from "@/lib/mock-data";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ brand?: string; q?: string }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const sp = await searchParams;

  const cat = getCategory(category);
  if (!cat) notFound();

  const products = filterProducts({ category, brand: sp.brand, q: sp.q });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-navy-400 mb-5">
        <Link href="/" className="hover:text-navy-700 transition-colors">Главная</Link>
        <ChevronRight size={14} />
        <Link href="/catalog" className="hover:text-navy-700 transition-colors">Каталог</Link>
        <ChevronRight size={14} />
        <span className="text-navy-700 font-medium">{cat.label}</span>
      </nav>

      {/* Page header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 flex items-center gap-2">
            <span>{cat.emoji}</span>
            {cat.label}
          </h1>
          <p className="text-sm text-navy-400 mt-0.5">{products.length} товаров</p>
        </div>
        <Suspense>
          <MobileFiltersButton />
        </Suspense>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block w-52 shrink-0">
          <Suspense>
            <CatalogFilters />
          </Suspense>
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-display font-semibold text-navy-700 mb-1">Ничего не найдено</p>
              <p className="text-sm text-navy-400">Попробуйте изменить фильтры</p>
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
