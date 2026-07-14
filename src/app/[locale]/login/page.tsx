"use client";

import { useActionState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { signIn } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [state, action, isPending] = useActionState(signIn, null);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="OKnautic" width={140} height={57} className="h-10 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-8">
          <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">{t("loginTitle")}</h1>
          <p className="text-sm text-navy-500 mb-6">{t("loginSubtitle")}</p>

          {state?.error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 mb-5">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-medium text-navy-600 mb-1.5">
                <Mail size={12} />Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="ivan@example.com"
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="flex items-center gap-1.5 text-xs font-medium text-navy-600">
                  <Lock size={12} />{t("password")}
                </label>
                <Link href="/forgot-password" className="text-xs text-teal-600 hover:text-teal-700">
                  {t("forgotPassword")}
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputCls}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={isPending}
            >
              {isPending ? t("signingIn") : t("signIn")}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-navy-500 mt-6">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-teal-600 hover:text-teal-700 font-medium">
            {t("registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
