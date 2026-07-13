"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  ShoppingCart, CheckCircle2, ArrowLeft, Trash2,
  Minus, Plus, User, Mail, Phone, MessageSquare,
  Package, UserPlus, LogIn,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useTranslations } from "next-intl";
import { submitRfq } from "@/lib/rfq-actions";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

type FormState = { name: string; email: string; phone: string; comment: string };
type Status = "idle" | "submitting" | "success" | "success_guest";

type Props = {
  prefill: { name: string; email: string; phone: string } | null;
  isAuthenticated: boolean;
};

function generateRfqNumber() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RFQ-${d}-${rand}`;
}

// ── Field component (module level to prevent unmount on re-render) ──────────

function Field({
  icon, label, id, type = "text", value, error, placeholder, textarea, onChange,
}: {
  icon: React.ReactNode; label: string; id: string;
  type?: string; value: string; error?: string; placeholder: string;
  textarea?: boolean; onChange: (val: string) => void;
}) {
  const cls = `w-full px-3 py-2.5 rounded-xl border text-sm text-navy-900 placeholder:text-navy-400
    focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition bg-white
    ${error ? "border-red-300 bg-red-50" : "border-navy-200"}`;

  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium text-navy-600 mb-1.5">
        {icon}{label}
      </label>
      {textarea ? (
        <textarea
          id={id} rows={3} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          id={id} type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function RfqForm({ prefill, isAuthenticated }: Props) {
  const { items, removeItem, updateQty, clearCart, itemCount } = useCart();
  const t = useTranslations("rfq");

  const [form, setForm] = useState<FormState>({
    name: prefill?.name ?? "",
    email: prefill?.email ?? "",
    phone: prefill?.phone ?? "",
    comment: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [rfqNumber, setRfqNumber] = useState("");
  const [submittedCount, setSubmittedCount] = useState(0);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  useEffect(() => {
    if (prefill) {
      setForm((f) => ({
        ...f,
        name: f.name || prefill.name,
        email: f.email || prefill.email,
        phone: f.phone || prefill.phone,
      }));
    }
  }, [prefill]);

  function validate() {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = t("errorName");
    if (!form.email.trim()) e.email = t("errorEmail");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("errorEmailInvalid");
    if (!form.phone.trim()) e.phone = t("errorPhone");
    return e;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus("submitting");

    try {
      const result = await submitRfq({ ...form, items });

      if (result?.requiresAuth) {
        const num = generateRfqNumber();
        setRfqNumber(num);
        setSubmittedCount(itemCount);
        setStatus("success_guest");
        clearCart();
        return;
      }

      if (result?.error) {
        setErrors({ comment: result.error });
        setStatus("idle");
        return;
      }

      const num = generateRfqNumber();
      setRfqNumber(num);
      setSubmittedCount(itemCount);
      setStatus("success");
      clearCart();
    } catch (err) {
      setErrors({ comment: err instanceof Error ? err.message : t("errorSubmit") });
      setStatus("idle");
    }
  }

  // Empty cart
  if (items.length === 0 && status === "idle") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <ShoppingCart size={48} strokeWidth={1.2} className="text-navy-300" />
        <h1 className="font-display text-xl font-bold text-navy-800">{t("emptyTitle")}</h1>
        <p className="text-sm text-navy-500">{t("emptyDesc")}</p>
        <Button variant="primary" asChild>
          <Link href="/catalog">{t("toCatalog")}</Link>
        </Button>
      </div>
    );
  }

  // Success (authenticated — saved to DB)
  if (status === "success") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-teal-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 mb-2">{t("successTitle")}</h1>
          <p className="text-sm text-navy-500">{t("successDesc")}</p>
        </div>
        <Card className="w-full text-left">
          <CardBody className="py-4 px-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-navy-500">{t("successRequestNum")}</span>
              <span className="font-mono text-sm font-bold text-navy-800">{rfqNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-navy-500">{t("successSentTo")}</span>
              <span className="text-sm text-navy-700">{form.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-navy-500">{t("successItemCount")}</span>
              <span className="text-sm font-medium text-navy-700">{t("itemsCountDetail", { count: submittedCount })}</span>
            </div>
          </CardBody>
        </Card>
        <p className="text-xs text-navy-400">{t("successTrack")}</p>
        <div className="flex gap-3">
          <Button variant="primary" asChild>
            <Link href="/account/requests">{t("myRequests")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/catalog">{t("toCatalogBtn")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Success guest — request not saved, offer registration
  if (status === "success_guest") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-teal-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 mb-2">{t("guestSuccessTitle")}</h1>
          <p className="text-sm text-navy-500">
            {t("guestSuccessDesc", { count: submittedCount })}
          </p>
        </div>

        <Card className="w-full text-left">
          <CardBody className="py-4 px-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-navy-500">{t("guestRequestNum")}</span>
              <span className="font-mono text-sm font-bold text-navy-800">{rfqNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-navy-500">{t("guestContact")}</span>
              <span className="text-sm text-navy-700">{form.email}</span>
            </div>
          </CardBody>
        </Card>

        {/* Register prompt */}
        <div className="w-full rounded-2xl border border-teal-200 bg-teal-50 p-5 text-left">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
              <UserPlus size={18} className="text-teal-600" />
            </div>
            <div>
              <p className="font-display font-semibold text-navy-800 text-sm">{t("registerTitle")}</p>
              <p className="text-xs text-navy-500 mt-0.5 leading-relaxed">
                {t("registerDesc")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" asChild className="flex-1">
              <Link href={`/register?name=${encodeURIComponent(form.name)}&email=${encodeURIComponent(form.email)}&next=/rfq/new`}>
                <UserPlus size={14} />
                {t("registerBtn")}
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href="/login?next=/rfq/new">
                <LogIn size={14} />
                {t("loginBtn")}
              </Link>
            </Button>
          </div>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <Link href="/catalog">{t("continueGuest")}</Link>
        </Button>
      </div>
    );
  }

  // Form
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-navy-400 mb-6">
        <Link href="/" className="hover:text-navy-700 transition-colors">{t("home")}</Link>
        <span>/</span>
        <span className="text-navy-700 font-medium">{t("title")}</span>
      </nav>

      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">{t("title")}</h1>
      <p className="text-sm text-navy-500 mb-8">{t("subtitle")}</p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left: cart items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold text-navy-800">
              {t("items")} <span className="text-navy-400 font-normal">({itemCount})</span>
            </h2>
            <button
              onClick={clearCart}
              className="text-xs text-navy-400 hover:text-red-500 transition-colors"
            >
              {t("clearAll")}
            </button>
          </div>

          {items.map((item) => (
            <Card key={item.productId}>
              <CardBody className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl border border-navy-100 bg-navy-50 relative overflow-hidden shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-navy-300">
                        <Package size={24} strokeWidth={1.2} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono text-navy-400">{item.brand}</p>
                        <Link
                          href={`/product/${item.productId}`}
                          className="text-sm font-semibold text-navy-800 hover:text-teal-600 transition-colors leading-snug"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs font-mono text-navy-400 mt-0.5">{item.sku}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 rounded-lg text-navy-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {Object.entries(item.selectedVariants).map(([k, v]) => (
                          <span key={k} className="text-[10px] bg-navy-100 text-navy-600 px-2 py-0.5 rounded-full">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-navy-500">{t("qty")}</span>
                      <div className="flex items-center border border-navy-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="px-2 py-1 text-navy-500 hover:bg-navy-50 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm font-mono text-navy-800 min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="px-2 py-1 text-navy-500 hover:bg-navy-50 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium mt-2"
          >
            <ArrowLeft size={14} />
            {t("addMore")}
          </Link>
        </div>

        {/* Right: form */}
        <div className="lg:sticky lg:top-24">
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-navy-800">{t("contactDetails")}</h2>
                {isAuthenticated ? (
                  <span className="text-[11px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    {t("filledFromProfile")}
                  </span>
                ) : (
                  <Link href="/login?next=/rfq/new" className="text-[11px] text-navy-400 hover:text-teal-600 transition-colors">
                    {t("loginForAutofill")}
                  </Link>
                )}
              </div>

              <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="space-y-4" noValidate>
                <Field
                  icon={<User size={12} />}
                  label={t("fieldName")}
                  id="name"
                  placeholder={t("namePlaceholder")}
                  value={form.name}
                  error={errors.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                />
                <Field
                  icon={<Mail size={12} />}
                  label="Email *"
                  id="email"
                  type="email"
                  placeholder="ivan@example.com"
                  value={form.email}
                  error={errors.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                />
                <Field
                  icon={<Phone size={12} />}
                  label={t("fieldPhone")}
                  id="phone"
                  type="tel"
                  placeholder={t("phonePlaceholder")}
                  value={form.phone}
                  error={errors.phone}
                  onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                />
                <Field
                  icon={<MessageSquare size={12} />}
                  label={t("fieldComment")}
                  id="comment"
                  placeholder={t("commentPlaceholder")}
                  value={form.comment}
                  error={errors.comment}
                  textarea
                  onChange={(v) => setForm((f) => ({ ...f, comment: v }))}
                />

                <div className="rounded-xl bg-navy-50 border border-navy-100 px-4 py-3 text-[11px] text-navy-500 leading-relaxed">
                  Your request, including the requested products, quantities, delivery area and requested delivery
                  date, will be shared with matching independent Sellers so that they can prepare quotations. Your
                  name and exact delivery address are shared with a Seller only when you contact them or confirm
                  their offer. Please do not include unnecessary personal or sensitive information in your request.
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={status === "submitting"}
                >
                  {status === "submitting" ? t("submitting") : t("submit")}
                </Button>

                <p className="text-[11px] text-navy-400 text-center leading-relaxed">
                  {t("termsPrefix")}{" "}
                  <Link href="/terms-of-use" className="underline hover:text-navy-600">
                    {t("termsLink")}
                  </Link>
                </p>
              </form>
            </CardBody>
          </Card>

          {/* Info block */}
          <div className="mt-4 p-4 rounded-xl bg-teal-50 border border-teal-100 space-y-2">
            {[t("infoLine1"), t("infoLine2"), t("infoLine3")].map((text) => (
              <div key={text} className="flex items-start gap-2 text-xs text-teal-700">
                <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-teal-500" />
                {text}
              </div>
            ))}
          </div>

          {/* Not logged in hint */}
          {!isAuthenticated && (
            <div className="mt-3 p-3 rounded-xl bg-white border border-navy-100 flex items-center gap-2.5">
              <UserPlus size={16} className="text-navy-300 shrink-0" />
              <p className="text-xs text-navy-500 leading-snug">
                <Link href="/login?next=/rfq/new" className="text-teal-600 font-medium hover:underline">{t("loginHintLink")}</Link>
                {" "}{t("loginHint")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
