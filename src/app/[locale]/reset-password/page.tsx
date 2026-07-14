"use client";

import { useEffect, useState, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { updatePassword } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [state, action, isPending] = useActionState(updatePassword, null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setLinkError(t("invalidResetLink"));
      return;
    }
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setLinkError(t("invalidResetLink"));
      else setReady(true);
    });
  }, [searchParams, t]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="OKnautic" width={140} height={57} className="h-10 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-8">
          {state?.success ? (
            /* Success */
            <div className="text-center py-2">
              <div className="flex justify-center mb-4">
                <CheckCircle2 size={48} className="text-teal-500" />
              </div>
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-2">
                {t("passwordUpdated")}
              </h1>
              <p className="text-sm text-navy-500 mb-6">{t("passwordUpdatedDesc")}</p>
              <Link href="/login">
                <Button variant="primary" size="lg" className="w-full">
                  {t("signIn")}
                </Button>
              </Link>
            </div>
          ) : linkError ? (
            /* Invalid link */
            <div className="text-center py-2">
              <div className="flex justify-center mb-4">
                <AlertCircle size={48} className="text-red-400" />
              </div>
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-2">
                {t("resetPasswordTitle")}
              </h1>
              <p className="text-sm text-red-500 mb-6">{linkError}</p>
              <Link href="/forgot-password">
                <Button variant="outline" size="lg" className="w-full">
                  {t("sendResetLink")}
                </Button>
              </Link>
            </div>
          ) : (
            /* Form */
            <>
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">
                {t("resetPasswordTitle")}
              </h1>
              <p className="text-sm text-navy-500 mb-6">{t("resetPasswordSubtitle")}</p>

              {state?.error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 mb-5">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">
                    {state.error === "mismatch" ? t("passwordMismatch") : state.error}
                  </p>
                </div>
              )}

              <form action={action} className="space-y-4">
                <div>
                  <label htmlFor="password" className="flex items-center gap-1.5 text-xs font-medium text-navy-600 mb-1.5">
                    <Lock size={12} />{t("newPassword")}
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
                    disabled={!ready}
                  />
                </div>

                <div>
                  <label htmlFor="confirm" className="flex items-center gap-1.5 text-xs font-medium text-navy-600 mb-1.5">
                    <Lock size={12} />{t("confirmPassword")}
                  </label>
                  <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={inputCls}
                    disabled={!ready}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  loading={isPending}
                  disabled={!ready || isPending}
                >
                  {isPending ? t("savingPassword") : t("savePassword")}
                </Button>
              </form>
            </>
          )}
        </div>

        {!state?.success && (
          <p className="text-center text-sm text-navy-500 mt-6">
            <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
              ← {t("backToSignIn")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
