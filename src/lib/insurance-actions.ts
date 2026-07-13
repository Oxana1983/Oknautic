"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
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
  // Meta
  locale?: string;
  _hp?: string;
};

const T = {
  ru: {
    adminBadge: "OKnautic · Страхование",
    adminTitle: "Новая заявка на расчёт страховки",
    adminSubject: (desc: string) => `Новая заявка на страхование — ${desc}`,
    supabaseNote: (id: string) => `Просмотрите заявку в Supabase: insurance_leads, id = ${id}`,
    fName: "Имя", fEmail: "Email", fPhone: "Телефон",
    fVesselType: "Тип судна", fBrandModel: "Марка / Модель", fYearBuilt: "Год постройки",
    fLength: "Длина (м)", fHull: "Материал корпуса", fValue: "Стоимость (EUR)",
    fFlag: "Страна флага", fNavArea: "Район плавания", fHomePort: "Порт приписки",
    fUsage: "Использование", fSeason: "Сезонность",
    fExp: "Стаж (лет)", fLicense: "Есть лицензия", fClaims: "Страховые случаи (5 лет)",
    fClaimsDetails: "Описание случаев", fCoverage: "Покрытие", fDeductible: "Франшиза",
    fInsurer: "Текущий страховщик", fPolicyEnd: "Окончание полиса",
    fComment: "Комментарий", fLeadId: "ID заявки",
    yes: "Да", no: "Нет",
    clientSubject: (id: string) => `Заявка на страхование принята — ${id}`,
    clientTitle: "Заявка принята!",
    clientGreeting: (name: string) => `Здравствуйте, <strong>${name}</strong>!`,
    clientBody: "Мы получили вашу заявку на расчёт страховки и передали её нашему страховому брокеру. Ожидайте ответа в течение <strong>24 часов</strong>.",
    clientAppNumLabel: "Номер заявки",
    clientNote: "Если у вас возникнут вопросы — ответьте на это письмо или свяжитесь с нами через сайт.",
    clientFooter: "OKnautic — маркетплейс морских запчастей и услуг",
  },
  en: {
    adminBadge: "OKnautic · Insurance",
    adminTitle: "New insurance quote request",
    adminSubject: (desc: string) => `New insurance application — ${desc}`,
    supabaseNote: (id: string) => `View in Supabase: insurance_leads, id = ${id}`,
    fName: "Name", fEmail: "Email", fPhone: "Phone",
    fVesselType: "Vessel type", fBrandModel: "Make / Model", fYearBuilt: "Year built",
    fLength: "Length (m)", fHull: "Hull material", fValue: "Value (EUR)",
    fFlag: "Flag country", fNavArea: "Navigation area", fHomePort: "Home port",
    fUsage: "Usage", fSeason: "Season",
    fExp: "Experience (years)", fLicense: "Has license", fClaims: "Claims (last 5 years)",
    fClaimsDetails: "Claims details", fCoverage: "Coverage", fDeductible: "Deductible",
    fInsurer: "Current insurer", fPolicyEnd: "Policy renewal",
    fComment: "Comment", fLeadId: "Lead ID",
    yes: "Yes", no: "No",
    clientSubject: (id: string) => `Insurance application received — ${id}`,
    clientTitle: "Application received!",
    clientGreeting: (name: string) => `Dear <strong>${name}</strong>,`,
    clientBody: "We have received your insurance quote request and forwarded it to our insurance broker. You will receive a response within <strong>24 hours</strong>.",
    clientAppNumLabel: "Application number",
    clientNote: "If you have any questions, reply to this email or contact us through the website.",
    clientFooter: "OKnautic — marine parts & services marketplace",
  },
  it: {
    adminBadge: "OKnautic · Assicurazione",
    adminTitle: "Nuova richiesta di preventivo assicurativo",
    adminSubject: (desc: string) => `Nuova richiesta assicurativa — ${desc}`,
    supabaseNote: (id: string) => `Vedi in Supabase: insurance_leads, id = ${id}`,
    fName: "Nome", fEmail: "Email", fPhone: "Telefono",
    fVesselType: "Tipo imbarcazione", fBrandModel: "Marca / Modello", fYearBuilt: "Anno costruzione",
    fLength: "Lunghezza (m)", fHull: "Materiale scafo", fValue: "Valore (EUR)",
    fFlag: "Paese bandiera", fNavArea: "Area di navigazione", fHomePort: "Porto base",
    fUsage: "Utilizzo", fSeason: "Stagione",
    fExp: "Esperienza (anni)", fLicense: "Ha patente", fClaims: "Sinistri (ultimi 5 anni)",
    fClaimsDetails: "Dettagli sinistri", fCoverage: "Copertura", fDeductible: "Franchigia",
    fInsurer: "Assicuratore attuale", fPolicyEnd: "Scadenza polizza",
    fComment: "Commento", fLeadId: "ID richiesta",
    yes: "Sì", no: "No",
    clientSubject: (id: string) => `Richiesta assicurativa ricevuta — ${id}`,
    clientTitle: "Richiesta ricevuta!",
    clientGreeting: (name: string) => `Gentile <strong>${name}</strong>,`,
    clientBody: "Abbiamo ricevuto la sua richiesta di preventivo assicurativo e l'abbiamo inoltrata al nostro broker. Riceverà una risposta entro <strong>24 ore</strong>.",
    clientAppNumLabel: "Numero richiesta",
    clientNote: "Per qualsiasi domanda, risponda a questa email o contatti tramite il sito.",
    clientFooter: "OKnautic — marketplace di ricambi e servizi nautici",
  },
} as const;

type Locale = keyof typeof T;
function tr(locale?: string) {
  return T[(locale as Locale) in T ? (locale as Locale) : "ru"];
}

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

  const adminSupabase = createAdminClient();
  const { data: inserted, error: dbError } = await adminSupabase
    .from("insurance_leads")
    .insert({
      user_id: user?.id ?? null,
      full_name: data.full_name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      preferred_language: data.locale ?? null,
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

  await sendEmails(data, leadId);

  revalidatePath("/insurance");
  return { id: leadId };
}

async function sendEmails(data: InsuranceFormData, leadId: string) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const t = tr(data.locale);
  const shortId = leadId.slice(0, 8).toUpperCase();

  const vesselDesc = `${data.vessel_type}${data.length_m ? `, ${data.length_m}m` : ""}, €${Number(data.vessel_value_eur).toLocaleString()}`;

  const allFields: [string, string][] = [
    [t.fName, data.full_name],
    [t.fEmail, data.email],
    [t.fPhone, data.phone || "—"],
    ["---", ""],
    [t.fVesselType, data.vessel_type],
    [t.fBrandModel, [data.brand, data.model].filter(Boolean).join(" ") || "—"],
    [t.fYearBuilt, data.year_built || "—"],
    [t.fLength, data.length_m || "—"],
    [t.fHull, data.hull_material || "—"],
    [t.fValue, `€${Number(data.vessel_value_eur).toLocaleString()}`],
    [t.fFlag, data.flag_country || "—"],
    ["---", ""],
    [t.fNavArea, data.navigation_area],
    [t.fHomePort, data.home_port || "—"],
    [t.fUsage, data.usage_type],
    [t.fSeason, data.season],
    ["---", ""],
    [t.fExp, data.skipper_experience_years || "—"],
    [t.fLicense, data.has_license ? t.yes : t.no],
    [t.fClaims, data.claims_last_5_years ? t.yes : t.no],
    [t.fClaimsDetails, data.claims_details || "—"],
    ["---", ""],
    [t.fCoverage, data.coverage_types.join(", ") || "—"],
    [t.fDeductible, data.deductible_preference || "—"],
    [t.fInsurer, data.current_insurer || "—"],
    [t.fPolicyEnd, data.policy_renewal_date || "—"],
    ["---", ""],
    [t.fComment, data.comment || "—"],
    [t.fLeadId, shortId],
  ];

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
      subject: t.adminSubject(vesselDesc),
      html: `
<!DOCTYPE html>
<html lang="${data.locale ?? "ru"}">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Inter',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d8e9f5">
        <tr><td style="background:#0b1e35;padding:24px 32px">
          <p style="margin:0;color:#7aafd8;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600">${t.adminBadge}</p>
        </td></tr>
        <tr><td style="padding:28px 32px">
          <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#0b1e35">${t.adminTitle}</p>
          <p style="margin:0 0 20px;font-size:13px;color:#4a85c2">${vesselDesc}</p>
          <table cellpadding="0" cellspacing="0" style="width:100%">${rows}</table>
          <p style="margin:20px 0 0;font-size:11px;color:#7aafd8">${t.supabaseNote(leadId)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    }).catch((err) => console.error("Admin insurance email failed:", err));
  }

  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: t.clientSubject(shortId),
    html: `
<!DOCTYPE html>
<html lang="${data.locale ?? "ru"}">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Inter',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #9de6e6">
        <tr><td style="background:#073b3b;padding:24px 32px">
          <p style="margin:0 0 4px;color:#5dd0d0;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600">OKnautic</p>
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700">${t.clientTitle}</p>
        </td></tr>
        <tr><td style="padding:28px 32px">
          <p style="margin:0 0 16px;font-size:15px;color:#0b1e35">${t.clientGreeting(data.full_name)}</p>
          <p style="margin:0 0 16px;font-size:14px;color:#0b1e35;line-height:1.6">${t.clientBody}</p>
          <table style="background:#e6fafa;border-radius:12px;padding:16px 20px;margin-bottom:24px;width:100%;box-sizing:border-box" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:11px;color:#4a85c2;text-transform:uppercase;letter-spacing:1px;padding-bottom:6px">${t.clientAppNumLabel}</td>
            </tr>
            <tr>
              <td style="font-size:22px;font-weight:700;color:#073b3b;font-family:monospace">${shortId}</td>
            </tr>
          </table>
          <p style="margin:0;font-size:13px;color:#4a85c2">${t.clientNote}</p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #ccf4f4">
          <p style="margin:0;font-size:11px;color:#7aafd8">
            <a href="${BASE_URL}" style="color:#0e9494">OKnautic</a> — ${t.clientFooter}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch((err) => console.error("Client insurance email failed:", err));
}
