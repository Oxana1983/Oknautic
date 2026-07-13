"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const FROM = "OKnautic <noreply@oknautic.com>";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oknautic.com";

export type ContactFormData = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  _hp?: string;
};

export async function submitContactMessage(
  data: ContactFormData
): Promise<{ error?: string; id?: string }> {
  if (data._hp) return { error: "Bot detected" };
  if (!data.name?.trim()) return { error: "name required" };
  if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { error: "email invalid" };
  if (!data.message?.trim()) return { error: "message required" };

  const supabase = createAdminClient();

  const { data: inserted, error: dbError } = await supabase
    .from("contact_messages")
    .insert({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      message: data.message.trim(),
    })
    .select("id")
    .single();

  if (dbError) return { error: dbError.message };

  await sendEmails(data);

  return { id: inserted.id as string };
}

async function sendEmails(data: ContactFormData) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (adminEmail) {
    await resend.emails.send({
      from: FROM,
      to: adminEmail,
      subject: `Новое сообщение с сайта — ${data.name}`,
      html: `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Inter',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d8e9f5">
        <tr><td style="background:#0b1e35;padding:24px 32px">
          <p style="margin:0;color:#7aafd8;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600">OKnautic · Обратная связь</p>
        </td></tr>
        <tr><td style="padding:28px 32px">
          <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#0b1e35">Новое сообщение с сайта</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px">
            <tr>
              <td style="padding:4px 12px 4px 0;font-size:12px;color:#4a85c2;white-space:nowrap;width:80px">Имя</td>
              <td style="padding:4px 0;font-size:13px;color:#0b1e35;font-weight:500">${data.name}</td>
            </tr>
            <tr>
              <td style="padding:4px 12px 4px 0;font-size:12px;color:#4a85c2">Email</td>
              <td style="padding:4px 0;font-size:13px;color:#0b1e35;font-weight:500">${data.email}</td>
            </tr>
            ${data.phone ? `<tr>
              <td style="padding:4px 12px 4px 0;font-size:12px;color:#4a85c2">Телефон</td>
              <td style="padding:4px 0;font-size:13px;color:#0b1e35;font-weight:500">${data.phone}</td>
            </tr>` : ""}
          </table>
          <div style="background:#edf4fb;border-radius:12px;padding:16px 20px">
            <p style="margin:0 0 6px;font-size:11px;color:#4a85c2;text-transform:uppercase;letter-spacing:1px">Сообщение</p>
            <p style="margin:0;font-size:14px;color:#0b1e35;line-height:1.6;white-space:pre-wrap">${data.message}</p>
          </div>
          <p style="margin:20px 0 0">
            <a href="mailto:${data.email}" style="display:inline-block;background:#0e9494;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 24px;border-radius:10px">
              Ответить на ${data.email} →
            </a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    }).catch((err) => console.error("Admin contact email failed:", err));
  }

  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: "Ваше сообщение получено — OKnautic",
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
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700">Сообщение получено</p>
        </td></tr>
        <tr><td style="padding:28px 32px">
          <p style="margin:0 0 16px;font-size:15px;color:#0b1e35">Здравствуйте, <strong>${data.name}</strong>!</p>
          <p style="margin:0 0 16px;font-size:14px;color:#0b1e35;line-height:1.6">
            Мы получили ваше сообщение и ответим в течение рабочего дня.
          </p>
          <div style="background:#edf4fb;border-radius:12px;padding:16px 20px;margin-bottom:20px">
            <p style="margin:0 0 6px;font-size:11px;color:#4a85c2;text-transform:uppercase;letter-spacing:1px">Ваше сообщение</p>
            <p style="margin:0;font-size:13px;color:#0b1e35;line-height:1.6;white-space:pre-wrap">${data.message}</p>
          </div>
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
  }).catch((err) => console.error("Client contact email failed:", err));
}
