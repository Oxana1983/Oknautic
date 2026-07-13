import { getTranslations } from "next-intl/server";
import { Shield, Clock, BadgeCheck, Anchor } from "lucide-react";
import type { Metadata } from "next";
import { InsuranceForm } from "@/components/insurance/insurance-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("insurance");
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default async function InsurancePage() {
  const t = await getTranslations("insurance");

  const BENEFITS = [
    { icon: <BadgeCheck size={20} />, title: t("benefit1Title"), desc: t("benefit1Desc") },
    { icon: <Clock size={20} />,      title: t("benefit2Title"), desc: t("benefit2Desc") },
    { icon: <Shield size={20} />,     title: t("benefit3Title"), desc: t("benefit3Desc") },
    { icon: <Anchor size={20} />,     title: t("benefit4Title"), desc: t("benefit4Desc") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <p className="text-xs font-mono text-teal-400 uppercase tracking-widest mb-4">{t("tag")}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-5 max-w-2xl">
            {t("title")}
          </h1>
          <p className="text-navy-200 text-lg leading-relaxed max-w-xl">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white border-b border-navy-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                  {b.icon}
                </div>
                <div>
                  <p className="font-display font-semibold text-navy-900 text-sm mb-1">{b.title}</p>
                  <p className="text-xs text-navy-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Left: info */}
          <div className="lg:col-span-2">
            <p className="text-xs font-mono text-teal-600 uppercase tracking-widest mb-3">{t("tag")}</p>
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">{t("formTitle")}</h2>
            <p className="text-navy-500 text-sm leading-relaxed mb-6">{t("subtitle")}</p>
            <div className="hidden lg:flex flex-col gap-3 mt-8">
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                    {b.icon}
                  </div>
                  <span className="text-sm text-navy-600">{b.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form card */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6 sm:p-8">
              <InsuranceForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
