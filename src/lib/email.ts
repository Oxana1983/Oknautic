// Server-only helpers (not server actions): called from server actions after()
import { Resend } from "resend";
import { escapeHtml } from "@/lib/utils";

const FROM = "OKnautic <noreply@oknautic.com>";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oknautic.com";

export type EmailLocale = "ru" | "en" | "it";

const T = {
  ru: {
    newSubject: (product: string) => `Новый запрос: ${product}`,
    newTitle: "Новый запрос на товар",
    newLead: "Покупатель запрашивает позицию из вашего склада",
    product: "Товар",
    quantity: "Количество",
    pcs: "шт.",
    newCta: "Открыть запрос и ответить →",
    linkFallback: "Если кнопка не работает, перейдите по ссылке:",
    newFooter: "Вы получили это письмо, потому что этот товар есть в вашем складе на OKnautic.",
    manage: "Управляйте уведомлениями в",
    manageLink: "настройках профиля",
    acceptedSubject: (product: string) => `✓ Ваше предложение принято: ${product}`,
    acceptedTitle: "Предложение принято! 🎉",
    buyerContacts: "Контакты покупателя:",
    phone: "Телефон",
    acceptedCta: "Открыть заявку →",
    buyerFallback: "Покупатель",
  },
  en: {
    newSubject: (product: string) => `New request: ${product}`,
    newTitle: "New product request",
    newLead: "A buyer is requesting an item from your inventory",
    product: "Product",
    quantity: "Quantity",
    pcs: "pcs",
    newCta: "Open request and reply →",
    linkFallback: "If the button doesn't work, follow this link:",
    newFooter: "You received this email because this item is in your OKnautic inventory.",
    manage: "Manage notifications in your",
    manageLink: "profile settings",
    acceptedSubject: (product: string) => `✓ Your offer was accepted: ${product}`,
    acceptedTitle: "Offer accepted! 🎉",
    buyerContacts: "Buyer contacts:",
    phone: "Phone",
    acceptedCta: "Open request →",
    buyerFallback: "Buyer",
  },
  it: {
    newSubject: (product: string) => `Nuova richiesta: ${product}`,
    newTitle: "Nuova richiesta di prodotto",
    newLead: "Un acquirente richiede un articolo del suo magazzino",
    product: "Prodotto",
    quantity: "Quantità",
    pcs: "pz",
    newCta: "Apri la richiesta e rispondi →",
    linkFallback: "Se il pulsante non funziona, apra questo link:",
    newFooter: "Ha ricevuto questa email perché questo articolo è nel suo magazzino OKnautic.",
    manage: "Gestisca le notifiche nelle",
    manageLink: "impostazioni del profilo",
    acceptedSubject: (product: string) => `✓ La sua offerta è stata accettata: ${product}`,
    acceptedTitle: "Offerta accettata! 🎉",
    buyerContacts: "Contatti dell'acquirente:",
    phone: "Telefono",
    acceptedCta: "Apri la richiesta →",
    buyerFallback: "Acquirente",
  },
} as const;

export function toEmailLocale(locale?: string | null): EmailLocale {
  return locale === "en" || locale === "it" || locale === "ru" ? locale : "ru";
}

// Seller receives a new buyer request matching their inventory
export async function sendNewRequestEmail(to: string, locale: EmailLocale, data: {
  productName: string;
  sku: string;
  quantity: number;
  requestId: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const t = T[locale];
  const link = `${BASE_URL}/${locale}/account/incoming/${data.requestId}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: t.newSubject(data.productName),
    html: `
<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Inter',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d8e9f5">
        <!-- Header -->
        <tr>
          <td style="background:#0b1e35;padding:24px 32px">
            <p style="margin:0;color:#7aafd8;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600">OKnautic</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0b1e35">${t.newTitle}</p>
            <p style="margin:0 0 24px;font-size:14px;color:#4a85c2">${t.newLead}</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#edf4fb;border-radius:12px;margin-bottom:24px">
              <tr>
                <td style="padding:20px 24px">
                  <p style="margin:0 0 4px;font-size:11px;color:#4a85c2;text-transform:uppercase;letter-spacing:1px">${t.product}</p>
                  <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#0b1e35">${escapeHtml(data.productName)}</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-right:32px">
                        <p style="margin:0 0 2px;font-size:11px;color:#4a85c2">SKU</p>
                        <p style="margin:0;font-size:13px;font-weight:600;color:#0b1e35;font-family:monospace">${escapeHtml(data.sku)}</p>
                      </td>
                      <td>
                        <p style="margin:0 0 2px;font-size:11px;color:#4a85c2">${t.quantity}</p>
                        <p style="margin:0;font-size:13px;font-weight:600;color:#0b1e35">${data.quantity} ${t.pcs}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <a href="${link}" style="display:inline-block;background:#0e9494;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px">
              ${t.newCta}
            </a>

            <p style="margin:24px 0 0;font-size:12px;color:#7aafd8">
              ${t.linkFallback}<br>
              <a href="${link}" style="color:#0e9494">${link}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #d8e9f5">
            <p style="margin:0;font-size:11px;color:#7aafd8">
              ${t.newFooter}
              ${t.manage} <a href="${BASE_URL}/${locale}/account/profile" style="color:#0e9494">${t.manageLink}</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch(() => {
    // Email errors must not break the main flow
  });
}

// Seller's offer was accepted by the buyer
export async function sendOfferAcceptedEmail(to: string, locale: EmailLocale, data: {
  productName: string;
  sku: string;
  buyerName: string | null;
  buyerPhone: string | null;
  buyerEmail: string | null;
  requestId: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const t = T[locale];
  const link = `${BASE_URL}/${locale}/account/incoming/${data.requestId}`;

  const contactRows = [
    data.buyerEmail ? `<tr><td style="padding:6px 0;font-size:12px;color:#4a85c2;width:80px">Email</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#0b1e35">${escapeHtml(data.buyerEmail)}</td></tr>` : "",
    data.buyerPhone ? `<tr><td style="padding:6px 0;font-size:12px;color:#4a85c2">${t.phone}</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#0b1e35">${escapeHtml(data.buyerPhone)}</td></tr>` : "",
  ].join("");

  await resend.emails.send({
    from: FROM,
    to,
    subject: t.acceptedSubject(data.productName),
    html: `
<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Inter',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #9de6e6">
        <!-- Header -->
        <tr>
          <td style="background:#073b3b;padding:24px 32px">
            <p style="margin:0 0 4px;color:#5dd0d0;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600">OKnautic</p>
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700">${t.acceptedTitle}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#0b1e35">${escapeHtml(data.productName)}</p>
            <p style="margin:0 0 24px;font-size:12px;color:#4a85c2;font-family:monospace">${escapeHtml(data.sku)}</p>

            <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0b1e35">${t.buyerContacts}</p>
            <table style="background:#e6fafa;border-radius:12px;padding:16px 20px;margin-bottom:24px;width:100%;box-sizing:border-box" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#073b3b">${escapeHtml(data.buyerName ?? t.buyerFallback)}</p>
                  <table cellpadding="0" cellspacing="0">
                    ${contactRows}
                  </table>
                </td>
              </tr>
            </table>

            <a href="${link}" style="display:inline-block;background:#0e9494;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px">
              ${t.acceptedCta}
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #ccf4f4">
            <p style="margin:0;font-size:11px;color:#7aafd8">
              ${t.manage} <a href="${BASE_URL}/${locale}/account/profile" style="color:#0e9494">${t.manageLink}</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch(() => {
    // Email errors must not break the main flow
  });
}
