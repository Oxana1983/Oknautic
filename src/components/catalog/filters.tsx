"use client";

import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { CATEGORIES, BRANDS } from "@/lib/mock-data";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

export function CatalogFilters() {
  const t = useTranslations("catalog");
  const tCat = useTranslations("categories");
  const tNav = useTranslations("nav");

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeBrand = searchParams.get("brand") ?? "";
  const activeCategory = pathname.startsWith("/catalog/")
    ? pathname.replace("/catalog/", "")
    : "";

  function buildHref(category: string, brand: string) {
    const base = category ? `/catalog/${category}` : "/catalog";
    return brand ? `${base}?brand=${brand}` : base;
  }

  function clearBrand() {
    const base = activeCategory ? `/catalog/${activeCategory}` : "/catalog";
    router.push(base);
  }

  return (
    <aside className="w-full">
      {/* Active filters */}
      {(activeCategory || activeBrand) && (
        <div className="mb-5 flex flex-wrap gap-2">
          {activeCategory && (
            <Link
              href={activeBrand ? `/catalog?brand=${activeBrand}` : "/catalog"}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-100 text-navy-700 text-xs font-medium hover:bg-navy-200 transition-colors"
            >
              {tCat(activeCategory as Parameters<typeof tCat>[0])}
              <X size={12} />
            </Link>
          )}
          {activeBrand && (
            <button
              onClick={clearBrand}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-100 text-teal-700 text-xs font-medium hover:bg-teal-200 transition-colors"
            >
              {activeBrand}
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Categories */}
      <div className="mb-6">
        <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-2 font-display">
          {t("categoriesTitle")}
        </p>
        <ul className="space-y-0.5">
          <li>
            <Link
              href={activeBrand ? `/catalog?brand=${activeBrand}` : "/catalog"}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                !activeCategory
                  ? "bg-navy-800 text-white font-medium"
                  : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
              )}
            >
              {tNav("allCategories")}
            </Link>
          </li>
          {CATEGORIES.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={buildHref(cat.slug, activeBrand)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  activeCategory === cat.slug
                    ? "bg-navy-800 text-white font-medium"
                    : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                )}
              >
                <span>{cat.emoji}</span>
                {tCat(cat.slug as Parameters<typeof tCat>[0])}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      <div>
        <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-2 font-display">
          {t("brandsTitle")}
        </p>
        <ul className="space-y-0.5">
          {BRANDS.map((brand) => (
            <li key={brand}>
              <Link
                href={buildHref(activeCategory, brand.toLowerCase())}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  activeBrand === brand.toLowerCase()
                    ? "bg-teal-600 text-white font-medium"
                    : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                )}
              >
                {brand}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
