"use client";

import { useState } from "react";
import { LayoutGrid, LayoutList, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "./product-card";
import { MobileFiltersButton } from "./mobile-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { CATEGORIES } from "@/lib/mock-data";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/mock-data";

function ProductCardList({ product }: { product: Product }) {
  const t = useTranslations("catalog");
  const category = CATEGORIES.find((c) => c.slug === product.category);
  const { addItem } = useCart();

  return (
    <div className="group bg-white rounded-xl border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all flex gap-3 p-3">
      <Link href={`/product/${product.id}`} className="shrink-0">
        <div className="w-20 h-20 rounded-lg border border-navy-100 bg-navy-50 relative overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="80px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-navy-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
              <span className="text-[9px] font-mono">{t("noPhoto")}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex flex-wrap gap-1">
          <Badge variant="brand">{product.brand}</Badge>
          {category && <Badge variant="category">{category.label}</Badge>}
        </div>
        <Link href={`/product/${product.id}`}>
          <p className="text-sm font-semibold text-navy-900 leading-snug line-clamp-2 group-hover:text-navy-700 transition-colors">
            {product.name}
          </p>
        </Link>
        <p className="text-xs font-mono text-navy-400">{product.sku}</p>
      </div>

      <div className="shrink-0 flex flex-col items-end justify-between gap-2">
        <button className="p-1.5 rounded-lg text-navy-400 hover:text-gold-500 hover:bg-gold-50 transition-colors">
          <Star size={15} />
        </button>
        <Button variant="primary" size="sm" className="text-xs whitespace-nowrap" onClick={() => addItem(product)}>
          <ShoppingCart size={13} />
          {t("addToCart")}
        </Button>
      </div>
    </div>
  );
}

export function CatalogView({ products }: { products: Product[] }) {
  const t = useTranslations("catalog");
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="flex-1 min-w-0">
      {/* Mobile toolbar: view toggle + filters */}
      <div className="flex items-center gap-2 mb-4 lg:hidden">
        <button
          onClick={() => setView(view === "grid" ? "list" : "grid")}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-navy-200 text-sm text-navy-600 hover:bg-navy-50 transition-colors"
          aria-label="Toggle view"
        >
          {view === "grid" ? <LayoutList size={15} /> : <LayoutGrid size={15} />}
          {view === "grid" ? t("listView") : t("gridView")}
        </button>
        <div className="ml-auto">
          <MobileFiltersButton />
        </div>
      </div>

      {/* Products */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((p) => (
            <ProductCardList key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
