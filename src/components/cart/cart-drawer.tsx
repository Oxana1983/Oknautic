"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, clearCart, itemCount } = useCart();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-96 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-navy-100 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-navy-600" />
            <span className="font-display font-semibold text-navy-800">
              Запрос цен
            </span>
            {itemCount > 0 && (
              <span className="text-xs font-mono bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg text-navy-400 hover:bg-navy-50 transition-colors"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-navy-400 px-6">
              <ShoppingCart size={40} strokeWidth={1.2} />
              <p className="font-display font-semibold text-navy-600">Корзина пуста</p>
              <p className="text-sm text-center text-navy-400">
                Добавьте товары из каталога, чтобы запросить цену у поставщиков
              </p>
              <Button variant="outline" size="sm" onClick={closeCart} asChild>
                <Link href="/catalog">Перейти в каталог</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-navy-50 py-2">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3 px-5 py-4">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg border border-navy-100 bg-navy-50 relative overflow-hidden shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-navy-300">
                        <ShoppingCart size={20} strokeWidth={1.2} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-navy-400 mb-0.5">{item.brand}</p>
                    <Link
                      href={`/product/${item.productId}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-navy-800 hover:text-teal-600 line-clamp-2 leading-snug transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs font-mono text-navy-400 mt-0.5">{item.sku}</p>

                    {/* Variants */}
                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(item.selectedVariants).map(([k, v]) => (
                          <span key={k} className="text-[10px] bg-navy-100 text-navy-600 px-1.5 py-0.5 rounded">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Qty + remove */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-navy-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="px-2 py-1 text-navy-500 hover:bg-navy-50 transition-colors"
                          aria-label="Уменьшить"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-sm font-mono text-navy-800 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="px-2 py-1 text-navy-500 hover:bg-navy-50 transition-colors"
                          aria-label="Увеличить"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 rounded-lg text-navy-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-navy-100 px-5 py-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-sm text-navy-500">
              <span>Товаров в запросе:</span>
              <span className="font-mono font-medium text-navy-800">{itemCount} шт.</span>
            </div>

            <Button variant="primary" size="lg" className="w-full" asChild>
              <Link href="/rfq/new" onClick={closeCart}>
                Отправить запрос цен
                <ArrowRight size={16} />
              </Link>
            </Button>

            <button
              onClick={clearCart}
              className="w-full text-xs text-navy-400 hover:text-red-500 transition-colors py-1"
            >
              Очистить корзину
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
