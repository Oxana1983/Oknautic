"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/mock-data";
import { CATEGORIES } from "@/lib/mock-data";

export function ProductCard({ product }: { product: Product }) {
  const category = CATEGORIES.find((c) => c.slug === product.category);
  const { addItem } = useCart();

  return (
    <div className="group bg-white rounded-xl border border-navy-100 hover:border-teal-200 hover:shadow-md transition-all flex flex-col overflow-hidden">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="block aspect-[4/3] relative overflow-hidden bg-navy-50">
        {product.image ? (
          <Image
            src={product.image!}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-navy-300">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            <span className="text-[10px] font-mono">нет фото</span>
          </div>
        )}
        {product.hasVariants && (
          <span className="absolute top-2 right-2 text-[10px] font-mono font-medium bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded z-10">
            варианты
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex flex-wrap gap-1">
          <Badge variant="brand">{product.brand}</Badge>
          {category && <Badge variant="category">{category.label}</Badge>}
        </div>

        <Link href={`/product/${product.id}`} className="block">
          <h3 className="font-display font-semibold text-navy-900 text-sm leading-snug line-clamp-2 group-hover:text-navy-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs font-mono text-navy-400">{product.sku}</p>

        <p className="text-xs text-navy-500 leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={() => addItem(product)}
        >
          <ShoppingCart size={14} />
          Запросить цену
        </Button>
        <button className="shrink-0 p-2 rounded-lg text-navy-400 hover:text-gold-500 hover:bg-gold-50 transition-colors">
          <Star size={16} />
        </button>
      </div>
    </div>
  );
}
