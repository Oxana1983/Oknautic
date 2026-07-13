"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, AlertCircle, ShoppingBag, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { signUp } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition";

const checkboxCls =
  "mt-0.5 h-4 w-4 shrink-0 rounded border border-navy-300 text-teal-600 focus:ring-teal-400 accent-teal-600 cursor-pointer";

export function RegisterForm() {
  const searchParams = useSearchParams();

  const rawName = searchParams.get("name") ?? "";
  const nameParts = rawName.trim().split(/\s+/);
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");

  const [state, action, isPending] = useActionState(signUp, null);
  const defaultRole = searchParams.get("role") === "seller" ? "seller" : "customer";
  const [role, setRole] = useState<"customer" | "seller">(defaultRole);

  const t = useTranslations("auth");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [sellerTermsAccepted, setSellerTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const canSubmit = termsAccepted && (role !== "seller" || sellerTermsAccepted);

  return (
    <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-8">
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">{t("registerTitle")}</h1>
      <p className="text-sm text-navy-500 mb-6">{t("registerSubtitle")}</p>

      {state?.error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 mb-5">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{state.error}</p>
        </div>
      )}

      <form action={action} className="space-y-4">
        {/* Role picker */}
        <div>
          <p className="text-xs font-medium text-navy-600 mb-2">{t("accountType")}</p>
          <div className="grid grid-cols-2 gap-3">
            {(["customer", "seller"] as const).map((r) => {
              const isActive = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                    isActive
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-navy-200 text-navy-600 hover:border-navy-400"
                  }`}
                >
                  {r === "customer"
                    ? <ShoppingBag size={20} className={isActive ? "text-teal-500" : "text-navy-400"} />
                    : <Store size={20} className={isActive ? "text-teal-500" : "text-navy-400"} />
                  }
                  {r === "customer" ? t("buyer") : t("seller")}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="role" value={role} />
        </div>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="first_name" className="flex items-center gap-1.5 text-xs font-medium text-navy-600 mb-1.5">
              <User size={12} />{t("firstName")}
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              autoComplete="given-name"
              placeholder={t("firstNamePlaceholder")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-xs font-medium text-navy-600 mb-1.5">
              {t("lastName")}
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              autoComplete="family-name"
              placeholder={t("lastNamePlaceholder")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-medium text-navy-600 mb-1.5">
            <Mail size={12} />Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ivan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="password" className="flex items-center gap-1.5 text-xs font-medium text-navy-600 mb-1.5">
            <Lock size={12} />{t("password")} * <span className="text-navy-400 font-normal">{t("passwordMin")}</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputCls}
          />
        </div>

        {/* Legal checkboxes */}
        <div className="space-y-3 pt-1">
          {/* Terms of Use — mandatory */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="terms_accepted"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className={checkboxCls}
            />
            <span className="text-xs text-navy-600 leading-relaxed">
              {t("agreeTerms")}{" "}
              <Link href="/terms-of-use" target="_blank" className="underline hover:text-navy-900">
                {t("termsOfUse")}
              </Link>{" "}
              <span className="text-red-500">*</span>
            </span>
          </label>

          {/* Seller Terms — mandatory for sellers */}
          {role === "seller" && (
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="seller_terms_accepted"
                checked={sellerTermsAccepted}
                onChange={(e) => setSellerTermsAccepted(e.target.checked)}
                className={checkboxCls}
              />
              <span className="text-xs text-navy-600 leading-relaxed">
                {t("agreeSellerTerms")}{" "}
                <Link href="/seller-terms" target="_blank" className="underline hover:text-navy-900">
                  {t("sellerTermsLabel")}
                </Link>{" "}
                <span className="text-red-500">*</span>
              </span>
            </label>
          )}

          {/* Privacy Policy — static notice, no checkbox */}
          <p className="text-xs text-navy-400 leading-relaxed pl-0.5">
            {t("privacyNotice")}{" "}
            <Link href="/privacy-policy" target="_blank" className="underline hover:text-navy-600">
              {t("privacyPolicy")}
            </Link>.
          </p>

          {/* Marketing consent — optional */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="marketing_consent"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className={checkboxCls}
            />
            <span className="text-xs text-navy-500 leading-relaxed">
              {t("marketingConsent")}
            </span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          loading={isPending}
          disabled={!canSubmit || isPending}
        >
          {isPending ? t("creatingAccount") : t("createAccount")}
        </Button>
      </form>
    </div>
  );
}
