import { getTranslations } from "next-intl/server";
import { Mail, Clock } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ContactForm } from "@/components/contact/contact-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let prefill: { name: string; email: string; phone: string } | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("id", user.id)
      .single();

    prefill = {
      name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "",
      email: user.email ?? "",
      phone: profile?.phone ?? "",
    };
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="grid lg:grid-cols-3 gap-8 items-start">

        {/* Left: title + contact info */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <p className="text-xs font-mono text-teal-600 uppercase tracking-widest mb-2">{t("tag")}</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-2">{t("title")}</h1>
            <p className="text-navy-500 text-sm leading-relaxed">{t("subtitle")}</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-navy-900 uppercase tracking-wider">{t("infoTitle")}</p>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                <Mail size={14} />
              </div>
              <div>
                <p className="text-[11px] text-navy-400 mb-0.5">{t("emailLabel")}</p>
                <a href={`mailto:${t("emailValue")}`} className="text-sm font-medium text-navy-800 hover:text-teal-600 transition-colors">
                  {t("emailValue")}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                <Clock size={14} />
              </div>
              <div>
                <p className="text-[11px] text-navy-400 mb-0.5">{t("workingHoursLabel")}</p>
                <p className="text-sm font-medium text-navy-800">{t("workingHoursValue")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-navy-100 shadow-sm p-5 sm:p-6">
          <h2 className="font-display text-base font-bold text-navy-900 mb-4">{t("formTitle")}</h2>
          <ContactForm prefill={prefill} />
        </div>

      </div>
    </div>
  );
}
