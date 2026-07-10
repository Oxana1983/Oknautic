"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { submitOffer, withdrawOffer } from "@/lib/offer-actions";
import type { OfferInput } from "@/lib/offer-actions";

type ExistingOffer = {
  id: string;
  price_per_unit: number;
  currency: string;
  available_quantity: number;
  delivery_datetime: string;
  is_new: boolean;
  warranty_months: number;
  includes_vat: boolean;
  allows_pickup: boolean;
  in_stock: boolean;
  payment_cash: boolean;
  payment_cashless: boolean;
  comment: string | null;
  status: string;
};

type Props = {
  requestId: string;
  requestedQty: number;
  existingOffer: ExistingOffer | null;
  inventoryPrice?: number | null;
  inventoryCurrency?: string | null;
};

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 mt-0.5 ${
          checked ? "bg-teal-500" : "bg-navy-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      <div>
        <p className="text-sm text-navy-800 leading-snug">{label}</p>
        {description && <p className="text-xs text-navy-400 mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

export function OfferForm({ requestId, requestedQty, existingOffer, inventoryPrice, inventoryCurrency }: Props) {
  const t = useTranslations("offerForm");
  const router = useRouter();
  const isAccepted = existingOffer?.status === "accepted";

  const [form, setForm] = useState({
    price_per_unit: existingOffer?.price_per_unit?.toString() ?? inventoryPrice?.toString() ?? "",
    currency: existingOffer?.currency ?? inventoryCurrency ?? "EUR",
    available_quantity: existingOffer?.available_quantity?.toString() ?? requestedQty.toString(),
    delivery_datetime: existingOffer
      ? existingOffer.delivery_datetime.split("T")[0]
      : tomorrow(),
    is_new: existingOffer?.is_new ?? true,
    warranty_months: existingOffer?.warranty_months?.toString() ?? "0",
    includes_vat: existingOffer?.includes_vat ?? false,
    allows_pickup: existingOffer?.allows_pickup ?? false,
    in_stock: existingOffer?.in_stock ?? true,
    payment_cash: existingOffer?.payment_cash ?? false,
    payment_cashless: existingOffer?.payment_cashless ?? true,
    comment: existingOffer?.comment ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    setError("");
    if (!form.price_per_unit || Number(form.price_per_unit) <= 0) {
      setError(t("errorPrice"));
      return;
    }
    if (!form.delivery_datetime) {
      setError(t("errorDelivery"));
      return;
    }
    if (Number(form.available_quantity) > requestedQty) {
      setError(t("errorQty", { max: requestedQty }));
      return;
    }

    setSaving(true);
    const payload: OfferInput = {
      quote_request_id: requestId,
      price_per_unit: Number(form.price_per_unit),
      currency: form.currency,
      available_quantity: Number(form.available_quantity) || requestedQty,
      delivery_datetime: new Date(form.delivery_datetime).toISOString(),
      is_new: form.is_new,
      warranty_months: Number(form.warranty_months) || 0,
      includes_vat: form.includes_vat,
      allows_pickup: form.allows_pickup,
      in_stock: form.in_stock,
      payment_cash: form.payment_cash,
      payment_cashless: form.payment_cashless,
      comment: form.comment.trim(),
    };
    const result = await submitOffer(payload);
    setSaving(false);

    if (result?.error) { setError(result.error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleWithdraw() {
    if (!existingOffer) return;
    setWithdrawing(true);
    const result = await withdrawOffer(existingOffer.id, requestId);
    setWithdrawing(false);
    if (!result?.error) router.refresh();
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
      className="space-y-5"
    >
      {isAccepted && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-50 border border-teal-200 text-sm text-teal-700">
          <CheckCircle2 size={16} className="shrink-0" />
          {t("accepted")}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Price row */}
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <div>
          <label className="block text-xs font-medium text-navy-600 mb-1.5">
            {t("pricePerUnit")}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.price_per_unit}
            onChange={(e) => set("price_per_unit", e.target.value)}
            disabled={isAccepted}
            className={inputCls}
          />
          {inventoryPrice && !existingOffer && (
            <p className="text-[11px] text-navy-400 mt-1">
              {t("fromInventory", { price: inventoryPrice, currency: inventoryCurrency ?? "" })}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-navy-600 mb-1.5">{t("currency")}</label>
          <select
            value={form.currency}
            onChange={(e) => set("currency", e.target.value)}
            disabled={isAccepted}
            className={inputCls}
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="RUB">RUB</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      {/* Qty + delivery */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-navy-600 mb-1.5">
            {t("quantity")} <span className="text-navy-400 font-normal">({t("quantityMax", { max: requestedQty })})</span>
          </label>
          <input
            type="number"
            min="1"
            max={requestedQty}
            value={form.available_quantity}
            onChange={(e) => set("available_quantity", e.target.value)}
            disabled={isAccepted}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-navy-600 mb-1.5">
            {t("deliveryDate")}
          </label>
          <input
            type="date"
            value={form.delivery_datetime}
            onChange={(e) => set("delivery_datetime", e.target.value)}
            disabled={isAccepted}
            className={inputCls}
          />
        </div>
      </div>

      {/* Condition */}
      <div>
        <p className="text-xs font-medium text-navy-600 mb-2">{t("condition")}</p>
        <div className="grid grid-cols-2 gap-2">
          {([true, false] as const).map((isNew) => (
            <button
              key={String(isNew)}
              type="button"
              disabled={isAccepted}
              onClick={() => set("is_new", isNew)}
              className={`py-2 rounded-xl border text-sm font-medium transition-all ${
                form.is_new === isNew
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-navy-200 text-navy-500 hover:border-navy-400"
              }`}
            >
              {isNew ? t("conditionNew") : t("conditionUsed")}
            </button>
          ))}
        </div>
      </div>

      {/* Warranty */}
      <div>
        <label className="block text-xs font-medium text-navy-600 mb-1.5">
          {t("warranty")}
        </label>
        <input
          type="number"
          min="0"
          placeholder="0"
          value={form.warranty_months}
          onChange={(e) => set("warranty_months", e.target.value)}
          disabled={isAccepted}
          className={inputCls + " max-w-[140px]"}
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3 py-2 border-t border-navy-100">
        <Toggle
          checked={form.in_stock}
          onChange={(v) => set("in_stock", v)}
          label={t("inStock")}
          description={t("inStockDesc")}
        />
        <Toggle
          checked={form.includes_vat}
          onChange={(v) => set("includes_vat", v)}
          label={t("includesVat")}
        />
        <Toggle
          checked={form.allows_pickup}
          onChange={(v) => set("allows_pickup", v)}
          label={t("allowsPickup")}
        />
        <Toggle
          checked={form.payment_cash}
          onChange={(v) => set("payment_cash", v)}
          label={t("paymentCash")}
        />
        <Toggle
          checked={form.payment_cashless}
          onChange={(v) => set("payment_cashless", v)}
          label={t("paymentCashless")}
        />
      </div>

      {/* Comment */}
      <div>
        <label className="block text-xs font-medium text-navy-600 mb-1.5">
          {t("comment")}
        </label>
        <textarea
          rows={3}
          placeholder={t("commentPlaceholder")}
          value={form.comment}
          onChange={(e) => set("comment", e.target.value)}
          disabled={isAccepted}
          className={inputCls + " h-auto resize-none py-2.5"}
        />
      </div>

      {!isAccepted && (
        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            className="flex-1 gap-1.5"
          >
            {saved
              ? <><CheckCircle2 size={15} /> {t("sent")}</>
              : existingOffer
                ? t("updateOffer")
                : t("submitOffer")
            }
          </Button>

          {existingOffer && (
            <Button
              type="button"
              variant="outline"
              size="md"
              loading={withdrawing}
              onClick={() => void handleWithdraw()}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              {t("withdraw")}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
