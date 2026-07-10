"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateInventoryItem, deleteInventoryItem } from "@/lib/inventory-actions";

type Item = {
  id: string;
  sku: string;
  product_name: string;
  brand?: string | null;
  quantity: number;
  price?: number | null;
  currency: string;
  location_city?: string | null;
  location_country?: string | null;
  is_available: boolean;
};

export function InventoryTable({ items: initial }: { items: Item[] }) {
  const t = useTranslations("inventory");
  const [items, setItems] = useState<Item[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Item>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function startEdit(item: Item) {
    setEditing(item.id);
    setDraft({
      quantity: item.quantity,
      price: item.price ?? undefined,
      location_city: item.location_city ?? "",
      location_country: item.location_country ?? "",
      is_available: item.is_available,
    });
    setError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setDraft({});
  }

  function saveEdit(item: Item) {
    startTransition(async () => {
      const res = await updateInventoryItem(item.id, {
        quantity: Number(draft.quantity ?? 0),
        price: draft.price ? Number(draft.price) : undefined,
        location_city: draft.location_city || undefined,
        location_country: draft.location_country || undefined,
        is_available: draft.is_available ?? item.is_available,
      });
      if (res.error) { setError(res.error); return; }
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, ...draft, quantity: Number(draft.quantity ?? 0), price: draft.price ? Number(draft.price) : null }
            : i
        )
      );
      setEditing(null);
    });
  }

  function deleteItem(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    startTransition(async () => {
      const res = await deleteInventoryItem(id);
      if (res.error) { setError(res.error); return; }
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  }

  return (
    <div className="overflow-x-auto">
      {error && (
        <div className="m-4 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">{error}</div>
      )}
      <table className="w-full text-sm">
        <thead className="bg-navy-50 border-b border-navy-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-navy-500 w-36">SKU</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-navy-500">{t("tableName")}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-navy-500 w-24">{t("tableQty")}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-navy-500 w-32">{t("tablePrice")}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-navy-500 w-32">{t("tableCity")}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-navy-500 w-24">{t("tableStatus")}</th>
            <th className="px-4 py-3 w-20" />
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-50">
          {items.map((item) => {
            const isEditing = editing === item.id;
            const qty = isEditing ? (draft.quantity ?? item.quantity) : item.quantity;

            return (
              <tr key={item.id} className={`bg-white hover:bg-navy-50/40 transition-colors ${isPending && isEditing ? "opacity-60" : ""}`}>
                {/* SKU */}
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-navy-600">{item.sku}</span>
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <p className="text-navy-800 font-medium text-xs leading-tight">{item.product_name}</p>
                  {item.brand && <p className="text-[11px] text-navy-400">{item.brand}</p>}
                </td>

                {/* Quantity */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      value={draft.quantity ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, quantity: Number(e.target.value) }))}
                      className="w-20 px-2 py-1 rounded-lg border border-navy-200 text-xs focus:outline-none focus:border-teal-400"
                    />
                  ) : (
                    <span className={`text-sm font-semibold ${qty > 0 ? "text-navy-800" : "text-navy-300"}`}>
                      {qty}
                    </span>
                  )}
                </td>

                {/* Price */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={draft.price ?? ""}
                      placeholder="—"
                      onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-28 px-2 py-1 rounded-lg border border-navy-200 text-xs focus:outline-none focus:border-teal-400"
                    />
                  ) : (
                    <span className="text-xs text-navy-600">
                      {item.price ? `${Number(item.price).toLocaleString()} ${item.currency}` : "—"}
                    </span>
                  )}
                </td>

                {/* Location */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        value={draft.location_city ?? ""}
                        placeholder={t("city")}
                        onChange={(e) => setDraft((d) => ({ ...d, location_city: e.target.value }))}
                        className="w-28 px-2 py-1 rounded-lg border border-navy-200 text-xs focus:outline-none focus:border-teal-400"
                      />
                      <input
                        type="text"
                        value={draft.location_country ?? ""}
                        placeholder={t("country")}
                        onChange={(e) => setDraft((d) => ({ ...d, location_country: e.target.value }))}
                        className="w-28 px-2 py-1 rounded-lg border border-navy-200 text-xs focus:outline-none focus:border-teal-400"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-navy-500">
                      {[item.location_city, item.location_country].filter(Boolean).join(", ") || "—"}
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, is_available: !d.is_available }))}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      {draft.is_available
                        ? <ToggleRight size={18} className="text-teal-500" />
                        : <ToggleLeft size={18} className="text-navy-300" />
                      }
                      <span className={draft.is_available ? "text-teal-600" : "text-navy-400"}>
                        {draft.is_available ? t("statusAvailable") : t("statusHidden")}
                      </span>
                    </button>
                  ) : (
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                      item.is_available && item.quantity > 0
                        ? "bg-teal-50 text-teal-700 border-teal-100"
                        : "bg-navy-50 text-navy-400 border-navy-100"
                    }`}>
                      {item.is_available && item.quantity > 0 ? t("statusInStock") : item.quantity === 0 ? t("statusZero") : t("statusHidden")}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(item)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                          title={t("save")}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-navy-400 hover:bg-navy-50 transition-colors"
                          title={t("cancel")}
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition-colors"
                          title={t("edit")}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 rounded-lg text-navy-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title={t("deleteBtn")}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
