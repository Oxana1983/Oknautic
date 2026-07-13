"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitContactMessage } from "@/lib/contact-actions";

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition";
const labelCls = "block text-xs font-medium text-navy-600 mb-1.5";

type Errors = { name?: string; email?: string; message?: string };

type Prefill = { name: string; email: string; phone: string } | null;

export function ContactForm({ prefill }: { prefill?: Prefill }) {
  const t = useTranslations("contact");
  const locale = useLocale();

  const [form, setForm] = useState({
    name: prefill?.name ?? "",
    email: prefill?.email ?? "",
    phone: prefill?.phone ?? "",
    message: "",
    _hp: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!form.name.trim()) e.name = t("errorName");
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("errorEmail");
    if (!form.message.trim()) e.message = t("errorMessage");
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError("");
    const result = await submitContactMessage({ ...form, locale });
    setSubmitting(false);

    if (result.error) { setSubmitError(result.error); return; }
    setSuccess(true);
  }

  function handleReset() {
    setForm({ name: "", email: "", phone: "", message: "", _hp: "" });
    setErrors({});
    setSubmitError("");
    setSuccess(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center py-10">
        <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mb-4">
          <CheckCircle2 size={28} className="text-teal-500" />
        </div>
        <h3 className="font-display text-xl font-bold text-navy-900 mb-2">{t("successTitle")}</h3>
        <p className="text-navy-500 text-sm mb-6 max-w-xs">{t("successDesc")}</p>
        <button onClick={handleReset} className="text-sm text-teal-600 hover:text-teal-700 underline">
          {t("successNew")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Honeypot */}
      <input
        type="text" name="_hp" value={form._hp}
        onChange={(e) => set("_hp", e.target.value)}
        tabIndex={-1} aria-hidden style={{ display: "none" }}
      />

      <div className="grid sm:grid-cols-2 gap-3">
        {/* Message — spans full height on left */}
        <div className="flex flex-col sm:row-span-3">
          <label htmlFor="message" className={labelCls}>{t("message")}</label>
          <textarea
            id="message"
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder={t("messagePlaceholder")}
            className={
              inputCls +
              " flex-1 resize-none h-36 sm:h-full" +
              (errors.message ? " border-red-300 bg-red-50" : "")
            }
          />
          {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
        </div>

        {/* Right column fields */}
        <div>
          <label htmlFor="name" className={labelCls}>{t("name")}</label>
          <input
            id="name" type="text" value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("namePlaceholder")}
            className={inputCls + (errors.name ? " border-red-300 bg-red-50" : "")}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="phone" className={labelCls}>{t("phone")}</label>
          <input
            id="phone" type="tel" value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder={t("phonePlaceholder")}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelCls}>{t("email")}</label>
          <input
            id="email" type="email" value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder={t("emailPlaceholder")}
            className={inputCls + (errors.email ? " border-red-300 bg-red-50" : "")}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      {submitError && <p className="text-sm text-red-500">{submitError}</p>}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" variant="primary" size="md" loading={submitting} className="gap-1.5">
          <Send size={15} />
          {submitting ? t("submitting") : t("submit")}
        </Button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 h-9 rounded-xl border border-navy-200 text-sm font-medium text-navy-600 hover:bg-navy-50 transition-colors"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
