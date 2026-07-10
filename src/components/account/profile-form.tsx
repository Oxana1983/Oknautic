"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { updateProfile } from "@/lib/profile-actions";

type Props = {
  email: string;
  initialData: { first_name: string; last_name: string; phone: string; role: string };
};

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition";

export function ProfileForm({ email, initialData }: Props) {
  const t = useTranslations("profile");
  const [form, setForm] = useState({
    first_name: initialData.first_name,
    last_name: initialData.last_name,
    phone: initialData.phone,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const result = await updateProfile(form);
    setSaving(false);
    if (result?.error) { setError(result.error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void handleSave(); }} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-navy-600 mb-1.5">{t("email")}</label>
        <input value={email} disabled className={inputCls + " bg-navy-50 text-navy-400 cursor-default"} />
        <p className="text-[11px] text-navy-400 mt-1">{t("emailReadonly")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-navy-600 mb-1.5">{t("firstName")}</label>
          <input
            value={form.first_name}
            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            placeholder={t("firstNamePlaceholder")}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-navy-600 mb-1.5">{t("lastName")}</label>
          <input
            value={form.last_name}
            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
            placeholder={t("lastNamePlaceholder")}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-navy-600 mb-1.5">{t("phone")}</label>
        <input
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+7 900 000 00 00"
          type="tel"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-navy-600 mb-1.5">{t("accountType")}</label>
        <input
          value={initialData.role === "seller" ? t("roleSeller") : t("roleCustomer")}
          disabled
          className={inputCls + " bg-navy-50 text-navy-400 cursor-default"}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" variant="primary" size="md" loading={saving} className="gap-1.5">
        {saved ? <><CheckCircle2 size={15} /> {t("saved")}</> : t("save")}
      </Button>
    </form>
  );
}
