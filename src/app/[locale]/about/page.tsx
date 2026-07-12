import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Package, MessageSquare, UserCheck, Handshake } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  const buyerPoints = ["forBuyers1", "forBuyers2", "forBuyers3", "forBuyers4"] as const;
  const sellerPoints = ["forSellers1", "forSellers2", "forSellers3", "forSellers4"] as const;

  const HOW = [
    { icon: <Package size={20} />, title: t("how1Title"), desc: t("how1Desc") },
    { icon: <MessageSquare size={20} />, title: t("how2Title"), desc: t("how2Desc") },
    { icon: <UserCheck size={20} />, title: t("how3Title"), desc: t("how3Desc") },
    { icon: <Handshake size={20} />, title: t("how4Title"), desc: t("how4Desc") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
          <p className="text-xs font-mono text-teal-400 uppercase tracking-widest mb-4">{t("tag")}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-5 max-w-2xl">
            {t("title")}
          </h1>
          <p className="text-navy-200 text-lg leading-relaxed max-w-2xl">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white border-b border-navy-100">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-mono text-teal-600 uppercase tracking-widest mb-3">{t("missionTag")}</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-5">{t("missionTitle")}</h2>
              <p className="text-navy-500 leading-relaxed mb-4">{t("missionText1")}</p>
              <p className="text-navy-500 leading-relaxed">{t("missionText2")}</p>
            </div>

            {/* For buyers / sellers */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-5 rounded-xl bg-navy-50 border border-navy-100">
                <h3 className="font-display font-semibold text-navy-900 text-sm mb-4">{t("forBuyersTitle")}</h3>
                <ul className="space-y-2.5">
                  {buyerPoints.map((k) => (
                    <li key={k} className="flex items-start gap-2 text-xs text-navy-600 leading-relaxed">
                      <CheckCircle2 size={13} className="text-teal-500 shrink-0 mt-0.5" />
                      {t(k)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 rounded-xl bg-teal-50 border border-teal-100">
                <h3 className="font-display font-semibold text-navy-900 text-sm mb-4">{t("forSellersTitle")}</h3>
                <ul className="space-y-2.5">
                  {sellerPoints.map((k) => (
                    <li key={k} className="flex items-start gap-2 text-xs text-navy-600 leading-relaxed">
                      <CheckCircle2 size={13} className="text-teal-500 shrink-0 mt-0.5" />
                      {t(k)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <p className="text-xs font-mono text-teal-600 uppercase tracking-widest mb-3 text-center">{t("howTag")}</p>
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-10 text-center">{t("howTitle")}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW.map((step, i) => (
            <div key={i} className="relative">
              {i < HOW.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-navy-100 z-0" style={{ width: "calc(100% - 2.5rem)", left: "calc(2.5rem)" }} />
              )}
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
                  {step.icon}
                </div>
                <p className="text-[10px] font-mono text-teal-500 mb-1">0{i + 1}</p>
                <h3 className="font-display font-semibold text-navy-900 text-sm mb-2">{step.title}</h3>
                <p className="text-xs text-navy-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-navy-900 rounded-2xl px-6 py-12 text-center">
          <h3 className="font-display text-2xl font-bold text-white mb-3">{t("ctaTitle")}</h3>
          <p className="text-navy-300 text-sm mb-8 max-w-md mx-auto">{t("ctaDesc")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/catalog">
                <Package size={16} />
                {t("ctaBuyer")}
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/register?role=seller" className="text-white border-white/30 hover:bg-white/10">
                {t("ctaSeller")}
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
