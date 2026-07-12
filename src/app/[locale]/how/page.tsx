import { ArrowRight, Search, Send, CheckCircle2, Package, Upload, Bell, Handshake } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("how");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

type StepProps = {
  number: string;
  stepLabel: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
};

function Step({ number, stepLabel, icon, title, desc }: StepProps) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 flex flex-col items-center">
        <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
          {icon}
        </div>
        <div className="w-px flex-1 bg-navy-100 mt-3" />
      </div>
      <div className="pb-8">
        <p className="text-[11px] font-mono text-teal-500 mb-1">{stepLabel} {number}</p>
        <h3 className="font-display font-semibold text-navy-900 text-base mb-1.5">{title}</h3>
        <p className="text-sm text-navy-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default async function HowItWorksPage() {
  const t = await getTranslations("how");

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="mb-3">
          <span className="text-xs text-navy-400 uppercase tracking-widest">{t("platform")} </span>
          <span className="text-sm font-extrabold text-navy-700" style={{ fontFamily: "var(--font-brand)" }}>OKnautic</span>
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
          {t("title")}
        </h1>
        <p className="text-navy-500 text-lg max-w-xl mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-16 gap-y-2">
        {/* Buyers */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-navy-900 flex items-center justify-center text-white text-xs font-bold">{t("buyersLetter")}</div>
            <h2 className="font-display font-bold text-navy-900 text-lg">{t("buyersTitle")}</h2>
          </div>

          <Step number="1" stepLabel={t("stepLabel")} icon={<Search size={20} />} title={t("b1Title")} desc={t("b1Desc")} />
          <Step number="2" stepLabel={t("stepLabel")} icon={<Send size={20} />} title={t("b2Title")} desc={t("b2Desc")} />
          <Step number="3" stepLabel={t("stepLabel")} icon={<CheckCircle2 size={20} />} title={t("b3Title")} desc={t("b3Desc")} />

          <div className="mt-2 ml-16">
            <Button variant="primary" size="md" asChild>
              <Link href="/catalog">
                <Package size={16} />
                {t("browseCatalog")}
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Divider on mobile */}
        <div className="sm:hidden border-t border-navy-100 my-8" />

        {/* Sellers */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white text-xs font-bold">{t("sellersLetter")}</div>
            <h2 className="font-display font-bold text-navy-900 text-lg">{t("sellersTitle")}</h2>
          </div>

          <Step number="1" stepLabel={t("stepLabel")} icon={<Upload size={20} />} title={t("s1Title")} desc={t("s1Desc")} />
          <Step number="2" stepLabel={t("stepLabel")} icon={<Bell size={20} />} title={t("s2Title")} desc={t("s2Desc")} />
          <Step number="3" stepLabel={t("stepLabel")} icon={<Handshake size={20} />} title={t("s3Title")} desc={t("s3Desc")} />

          <div className="mt-2 ml-16">
            <Button variant="outline" size="md" asChild>
              <Link href="/register?role=seller">
                {t("becomeSeller")}
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 border-t border-navy-100 pt-12">
        <h2 className="font-display font-bold text-navy-900 text-xl mb-8 text-center">{t("faqTitle")}</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {(["1", "2", "3", "4"] as const).map((n) => (
            <div key={n} className="p-5 rounded-xl bg-navy-50 border border-navy-100">
              <p className="font-display font-semibold text-navy-800 text-sm mb-2">
                {t(`faq${n}Q` as Parameters<typeof t>[0])}
              </p>
              <p className="text-sm text-navy-500 leading-relaxed">
                {t(`faq${n}A` as Parameters<typeof t>[0])}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 bg-navy-900 rounded-2xl px-6 py-10 text-center">
        <h3 className="font-display text-xl font-bold text-white mb-2">{t("ctaTitle")}</h3>
        <p className="text-navy-300 text-sm mb-6">{t("ctaDesc")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="secondary" size="md" asChild>
            <Link href="/catalog">
              <Package size={16} />
              {t("toCatalog")}
            </Link>
          </Button>
          <Button variant="outline" size="md" asChild>
            <Link href="/register" className="text-white border-white/30 hover:bg-white/10">
              {t("register")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
