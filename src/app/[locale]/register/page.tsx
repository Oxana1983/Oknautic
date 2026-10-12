import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { OKnauticLogo } from "@/components/ui/logo";
import { RegisterForm } from "@/components/auth/register-form";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const t = await getTranslations("auth");
  const { next } = await searchParams;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <OKnauticLogo className="h-10 w-auto" />
          </Link>
        </div>

        <Suspense fallback={<div className="h-96 rounded-2xl bg-white border border-navy-100 shadow-sm animate-pulse" />}>
          <RegisterForm />
        </Suspense>

        <p className="text-center text-sm text-navy-500 mt-6">
          {t("alreadyHaveAccount")}{" "}
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="text-teal-600 hover:text-teal-700 font-medium">
            {t("signInLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
