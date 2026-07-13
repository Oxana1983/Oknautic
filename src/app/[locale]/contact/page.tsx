import { getTranslations } from "next-intl/server";
import { Mail, MessageSquare, Clock } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-mono text-teal-600 uppercase tracking-widest mb-3">{t("tag")}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-3">{t("title")}</h1>
        <p className="text-navy-500 text-base leading-relaxed max-w-lg">{t("subtitle")}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10 items-start">
        {/* Left: contact info */}
        <div className="lg:col-span-1 space-y-5">
          <h2 className="font-display text-sm font-semibold text-navy-900 uppercase tracking-wider">
            {t("infoTitle")}
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-xs text-navy-400 mb-0.5">{t("emailLabel")}</p>
                <a
                  href={`mailto:${t("emailValue")}`}
                  className="text-sm font-medium text-navy-800 hover:text-teal-600 transition-colors"
                >
                  {t("emailValue")}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                <MessageSquare size={16} />
              </div>
              <div>
                <p className="text-xs text-navy-400 mb-0.5">{t("telegramLabel")} / {t("whatsappLabel")}</p>
                <a
                  href="https://t.me/oknautic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-navy-800 hover:text-teal-600 transition-colors"
                >
                  {t("telegramValue")}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-xs text-navy-400 mb-0.5">{t("workingHoursLabel")}</p>
                <p className="text-sm font-medium text-navy-800">{t("workingHoursValue")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-navy-100 shadow-sm p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold text-navy-900 mb-6">{t("formTitle")}</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
