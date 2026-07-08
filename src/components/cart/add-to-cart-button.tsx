"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import type { Product, VariantGroup } from "@/lib/mock-data";

export function AddToCartButton({
  product,
  variantGroups,
}: {
  product: Product;
  variantGroups?: VariantGroup[];
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries((variantGroups ?? []).map((g) => [g.name, g.options[0].value]))
  );

  function handleAdd() {
    addItem(product, Object.keys(selected).length > 0 ? selected : undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Variant picker (inline here so selection is tied to add action) */}
      {variantGroups && variantGroups.length > 0 && (
        <div className="space-y-3 py-4 border-y border-navy-100">
          {variantGroups.map((group) => (
            <div key={group.name}>
              <p className="text-xs font-medium text-navy-500 mb-2 font-display">
                {group.name}:{" "}
                <span className="text-navy-800">
                  {group.options.find((o) => o.value === selected[group.name])?.label}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {group.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelected((prev) => ({ ...prev, [group.name]: opt.value }))}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      selected[group.name] === opt.value
                        ? "border-navy-800 bg-navy-800 text-white"
                        : "border-navy-200 text-navy-700 hover:border-navy-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant={added ? "outline" : "primary"}
          size="lg"
          className="flex-1 transition-all"
          onClick={handleAdd}
        >
          {added ? (
            <>
              <Check size={18} className="text-teal-600" />
              <span className="text-teal-600">Добавлено</span>
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              Запросить цену
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
