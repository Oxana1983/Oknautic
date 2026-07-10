"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { upsertInventoryRows } from "@/lib/inventory-actions";

const CURRENCIES = ["EUR", "USD", "GBP", "RUB", "TRY"];

const CATEGORY_SLUGS = [
  "navigation", "anchoring", "deck-hardware", "mooring",
  "engines", "electrical", "safety", "rigging",
] as const;

const EMPTY = {
  sku: "", product_name: "", brand: "", category: "", quantity: "1",
  price: "", currency: "EUR", location_city: "", location_country: "",
  photo_url: "", is_new: "true",
};

export function AddInventoryItem({ onAdded }: { onAdded?: () => void }) {
  const t = useTranslations("inventory");
  const tCat = useTranslations("categories");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function set(field: keyof typeof EMPTY, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.sku.trim()) { setError(t("validationSku")); return; }
    if (!form.product_name.trim()) { setError(t("validationName")); return; }
    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty < 0) { setError(t("validationQty")); return; }

    startTransition(async () => {
      const res = await upsertInventoryRows([{
        sku: form.sku.trim(),
        product_name: form.product_name.trim(),
        brand: form.brand.trim() || undefined,
        category: form.category || undefined,
        photo_url: form.photo_url.trim() || undefined,
        is_new: form.is_new === "true",
        quantity: qty,
        price: form.price ? parseFloat(form.price) : undefined,
        currency: form.currency || "EUR",
        location_city: form.location_city.trim() || undefined,
        location_country: form.location_country.trim() || undefined,
      }]);

      if (res.error) { setError(res.error); return; }
      setSuccess(true);
      setForm(EMPTY);
      router.refresh();
      onAdded?.();
      setTimeout(() => { setSuccess(false); setOpen(false); }, 1500);
    });
  }

  function handleClose() {
    setOpen(false);
    setForm(EMPTY);
    setError(null);
    setSuccess(false);
  }

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        <Plus size={15} />
        {t("addItem")}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
              <h2 className="font-display font-semibold text-navy-900">{t("addItemTitle")}</h2>
              <button onClick={handleClose} className="p-1.5 rounded-lg text-navy-400 hover:bg-navy-50 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-navy-600 mb-1">
                    SKU <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="GRM-ECHOMAP94SV"
                    className="w-full h-9 px-3 rounded-lg border border-navy-200 text-sm font-mono placeholder:text-navy-300 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-600 mb-1">{t("brand")}</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    placeholder="Garmin"
                    className="w-full h-9 px-3 rounded-lg border border-navy-200 text-sm placeholder:text-navy-300 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-600 mb-1">
                  {t("name")} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.product_name}
                  onChange={(e) => set("product_name", e.target.value)}
                  placeholder="Garmin ECHOMAP Ultra 94sv"
                  className="w-full h-9 px-3 rounded-lg border border-navy-200 text-sm placeholder:text-navy-300 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-600 mb-1">{t("category")}</label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-navy-200 text-sm bg-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                >
                  <option value="">{t("noCategoryLabel")}</option>
                  {CATEGORY_SLUGS.map((slug) => (
                    <option key={slug} value={slug}>{tCat(slug)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-navy-600 mb-1">
                    {t("quantity")} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={(e) => set("quantity", e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-navy-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-600 mb-1">{t("price")}</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0.00"
                    className="w-full h-9 px-3 rounded-lg border border-navy-200 text-sm placeholder:text-navy-300 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-600 mb-1">{t("currency")}</label>
                  <select
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-navy-200 text-sm bg-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  >
                    {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-600 mb-2">{t("condition")}</label>
                <div className="flex gap-2">
                  {[{ v: "true", label: t("conditionNew") }, { v: "false", label: t("conditionUsed") }].map(({ v, label }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => set("is_new", v)}
                      className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-colors ${
                        form.is_new === v
                          ? "border-teal-400 bg-teal-50 text-teal-700"
                          : "border-navy-200 text-navy-500 hover:bg-navy-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-600 mb-1">{t("photoUrl")}</label>
                <input
                  type="url"
                  value={form.photo_url}
                  onChange={(e) => set("photo_url", e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full h-9 px-3 rounded-lg border border-navy-200 text-sm placeholder:text-navy-300 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-navy-600 mb-1">{t("city")}</label>
                  <input
                    type="text"
                    value={form.location_city}
                    onChange={(e) => set("location_city", e.target.value)}
                    placeholder="Antibes"
                    className="w-full h-9 px-3 rounded-lg border border-navy-200 text-sm placeholder:text-navy-300 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-600 mb-1">{t("country")}</label>
                  <input
                    type="text"
                    value={form.location_country}
                    onChange={(e) => set("location_country", e.target.value)}
                    placeholder="France"
                    className="w-full h-9 px-3 rounded-lg border border-navy-200 text-sm placeholder:text-navy-300 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">
                  <AlertCircle size={13} className="shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-700">
                  <CheckCircle2 size={13} className="shrink-0" />
                  {t("addItemSuccess")}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" size="md" className="flex-1" onClick={handleClose}>
                  {t("cancel")}
                </Button>
                <Button type="submit" variant="primary" size="md" className="flex-1" loading={isPending}>
                  <Plus size={15} />
                  {t("add")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
