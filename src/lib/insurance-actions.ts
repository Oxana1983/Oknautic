"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const FROM = "OKnautic <noreply@oknautic.com>";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oknautic.com";

export type InsuranceFormData = {
  // Vessel
  vessel_type: string;
  brand?: string;
  model?: string;
  year_built?: string;
  length_m?: string;
  hull_material?: string;
  vessel_value_eur: string;
  flag_country?: string;
  // Navigation
  navigation_area: string;
  home_port?: string;
  usage_type: string;
  season: string;
  // Experience
  skipper_experience_years?: string;
  has_license: boolean;
  claims_last_5_years: boolean;
  claims_details?: string;
  // Coverage
  coverage_types: string[];
  deductible_preference?: string;
  current_insurer?: string;
  policy_renewal_date?: string;
  // Contact
  full_name: string;
  email: string;
  phone?: string;
  comment?: string;
  consent: boolean;
  // Honeypot
  _hp?: string;
};

function validateData(data: InsuranceFormData): string | null {
  if (data._hp) return "Bot detected";
  if (!data.vessel_type) return "vessel_type required";
  if (!data.vessel_value_eur || isNaN(Number(data.vessel_value_eur)) || Number(data.vessel_value_eur) <= 0) return "vessel_value_eur invalid";
  if (!data.navigation_area) return "navigation_area required";
  if (!data.usage_type) return "usage_type required";
  if (!data.season) return "season required";
  if (!data.full_name?.trim()) return "full_name required";
  if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "email invalid";
  if (!data.consent) return "consent required";
  return null;
}

export async function submitInsuranceLead(
  data: InsuranceFormData
): Promise<{ error?: string; id?: string }> {
  const validationError = validateData(data);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: inserted, error: dbError } = await supabase
    .from("insurance_leads")
    .insert({
      user_id: user?.id ?? null,
      full_name: data.full_name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      preferred_language: null,
      vessel_type: data.vessel_type,
      brand: data.brand?.trim() || null,
      model: data.model?.trim() || null,
      year_built: data.year_built ? parseInt(data.year_built) : null,
      length_m: data.length_m ? parseFloat(data.length_m) : null,
      hull_material: data.hull_material || null,
      vessel_value_eur: Number(data.vessel_value_eur),
      flag_country: data.flag_country?.trim() || null,
      navigation_area: data.navigation_area,
      home_port: data.home_port?.trim() || null,
      usage_type: data.usage_type,
      season: data.season,
      skipper_experience_years: data.skipper_experience_years ? parseInt(data.skipper_experience_years) : null,
      has_license: data.has_license,
      claims_last_5_years: data.claims_last_5_years,
      claims_details: data.claims_details?.trim() || null,
      coverage_types: data.coverage_types.length > 0 ? data.coverage_types : null,
      deductible_preference: data.deductible_preference?.trim() || null,
      current_insurer: data.current_insurer?.trim() || null,
      policy_renewal_date: data.policy_renewal_date || null,
      comment: data.comment?.trim() || null,
      status: "new",
    })
    .select("id")
    .single();

  if (dbError) return { error: dbError.message };

  const leadId = inserted.id as string;

  void sendEmails(data, leadId);

  revalidatePath("/insurance");
  return { id: leadId };
}

async function sendEmails(data: InsuranceFormData, leadId: string) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const shortId = leadId.slice(0, 8).toUpperCase();

  const vesselDesc = `${data.vessel_type}${data.length_m ? `, ${data.length_m}м` : ""}, €${Number(data.vessel_value_eur).toLocaleString("ru")}`;
  const subject = `Новая заявка на страхование — ${vesselDesc}`;

  const allFields = [
    ["Имя", data.full_name],
    ["Email", data.email],
    ["Телефон", data.phone || "—"],
    ["---", ""],
    ["Тип судна", data.vessel_type],
    ["Марка / Модель", [data.brand, data.model].filter(Boolean).join(" ") || "—"],
    ["Год постройки", data.year_built || "—"],
    ["Длина (м)", data.length_m || "—"],
    ["Материал корпуса", data.hull_material || "—"],
    ["Стоимость (EUR)", `€${Number(data.vessel_value_eur).toLocaleString("ru")}`],
    ["Страна флага", data.flag_country || "—"],
    ["---", ""],
    ["Район плавания", data.navigation_area],
    ["Порт приписки", data.home_port || "—"],
    ["Использование", data.usage_type],
    ["Сезонность", data.season],
    ["---", ""],
    ["Стаж (лет)", data.skipper_experience_years || "—"],
    ["Есть лицензия", data.has_license ? "Да" : "Нет"],
    ["Страховые случаи (5 лет)", data.claims_last_5_years ? "Да" : "Нет"],
    ["Описание случаев", data.claims_details || "—"],
    ["---", ""],
    ["Покрытие", data.coverage_types.join(", ") || "—"],
    ["Франшиза", data.deductible_preference || "—"],
    ["Текущий страховщик", data.current_insurer || "—"],
    ["Окончание полиса", data.policy_renewal_date || "—"],
    ["---", ""],
    ["Комментарий", data.comment || "—"],
    ["ID заявки", shortId],
  ] satisfies [string, string][];

  const rows = allFields
    .map(([k, v]) =>
      k === "---"
        ? `<tr><td colspan="2" style="padding:4px 0;border-top:1px solid #d8e9f5;font-size:1px">&nbsp;</td></tr>`
        : `<tr>
            <td style="padding:4px 12px 4px 0;font-size:12px;color:#4a85c2;white-space:nowrap;vertical-align:top">${k}</td>
            <td style="padding:4px 0;font-size:13px;color:#0b1e35;font-weight:500">${v}</td>
          </tr>`
    )
    .join("");

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    await resend.emails.send({
      from: FROM,
      to: adminEmail,
      subject,
      html: `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Inter',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d8e9f5">
        <tr><td style="background:#0b1e35;padding:24px 32px">
          <p style="margin:0;color:#7aafd8;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600">OKnautic · Страхование</p>
        </td></tr>
        <tr><td style="padding:28px 32px">
          <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#0b1e35">Новая заявка на расчёт страховки</p>
          <p style="margin:0 0 20px;font-size:13px;color:#4a85c2">${vesselDesc}</p>
          <table cellpadding="0" cellspacing="0" style="width:100%">${rows}</table>
          <p style="margin:20px 0 0;font-size:11px;color:#7aafd8">Просмотрите заявку в Supabase: insurance_leads, id = ${leadId}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    }).catch((err) => console.error("Admin insurance email failed:", err));
  }

  // Confirmation to client
  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: `Заявка на страхование принята — ${shortId}`,
    html: `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Inter',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #9de6e6">
        <tr><td style="background:#073b3b;padding:24px 32px">
          <p style="margin:0 0 4px;color:#5dd0d0;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600">OKnautic</p>
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700">Заявка принята!</p>
        </td></tr>
        <tr><td style="padding:28px 32px">
          <p style="margin:0 0 16px;font-size:15px;color:#0b1e35">Здравствуйте, <strong>${data.full_name}</strong>!</p>
          <p style="margin:0 0 16px;font-size:14px;color:#0b1e35;line-height:1.6">
            Мы получили вашу заявку на расчёт страховки и передали её нашему страховому брокеру.
            Ожидайте ответа в течение <strong>24 часов</strong>.
          </p>
          <table style="background:#e6fafa;border-radius:12px;padding:16px 20px;margin-bottom:24px;width:100%;box-sizing:border-box" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:11px;color:#4a85c2;text-transform:uppercase;letter-spacing:1px;padding-bottom:6px">Номер заявки</td>
            </tr>
            <tr>
              <td style="font-size:22px;font-weight:700;color:#073b3b;font-family:monospace">${shortId}</td>
            </tr>
          </table>
          <p style="margin:0;font-size:13px;color:#4a85c2">
            Если у вас возникнут вопросы — ответьте на это письмо или свяжитесь с нами через сайт.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #ccf4f4">
          <p style="margin:0;font-size:11px;color:#7aafd8">
            <a href="${BASE_URL}" style="color:#0e9494">OKnautic</a> — маркетплейс морских запчастей и услуг
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch((err) => console.error("Client insurance email failed:", err));
}
