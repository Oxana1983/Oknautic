import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft, Package, Calendar, MessageSquare,
  CheckCircle2, Mail, Phone, Send
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { OfferForm } from "@/components/seller/offer-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function cleanPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export default async function IncomingDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/account/incoming/${id}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "seller") redirect("/account/requests");

  const { data: req } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("id", id)
    .neq("status", "deleted")
    .maybeSingle();

  if (!req) notFound();

  const { data: existingOffer } = await supabase
    .from("offers")
    .select("*")
    .eq("quote_request_id", id)
    .eq("seller_id", user.id)
    .maybeSingle();

  // Try matching by product_id first, fall back to sku
  let inventoryItem: { price: number | null; currency: string } | null = null;
  if (req.product_id) {
    const { data, error: e1 } = await supabase
      .from("seller_inventory")
      .select("price, currency")
      .eq("seller_id", user.id)
      .eq("product_id", req.product_id)
      .maybeSingle();
    console.log("[offer] product_id lookup:", req.product_id, "→ data:", data, "err:", e1?.message);
    inventoryItem = data;
  }
  if (!inventoryItem) {
    const { data, error: e2 } = await supabase
      .from("seller_inventory")
      .select("price, currency")
      .eq("seller_id", user.id)
      .eq("sku", req.sku)
      .maybeSingle();
    console.log("[offer] sku lookup:", req.sku, "→ data:", data, "err:", e2?.message);
    inventoryItem = data;
  }
  // numeric from PostgreSQL may arrive as string — coerce to number
  const inventoryPrice = inventoryItem?.price != null ? Number(inventoryItem.price) : null;
  const inventoryCurrency = inventoryItem?.currency ?? null;
  console.log("[offer] final inventoryPrice:", inventoryPrice, inventoryCurrency);

  const variantAttrs = req.variant_attrs as Record<string, string> | null;
  const isOpen = req.status === "in_progress";

  // Contacts revealed only when THIS seller's offer was accepted
  const offerAccepted =
    existingOffer &&
    req.accepted_offer_id === existingOffer.id &&
    existingOffer.status === "accepted";

  // Buyer name: prefer new field, fall back to parsing legacy additional_comment
  const buyerName = req.buyer_name
    ?? (req.additional_comment ? req.additional_comment.split(" · ")[0] : null)
    ?? "Покупатель";

  const phone = req.buyer_phone ?? null;
  const email = req.buyer_email ?? null;

  // Legacy comment (old rows had "Name · Phone · Comment", new rows have only comment)
  const comment = req.buyer_name
    ? req.additional_comment                           // new row: comment only
    : req.additional_comment?.split(" · ").slice(2).join(" · ") ?? null; // legacy: strip name+phone

  return (
    <div>
      <Link
        href="/account/incoming"
        className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Входящие запросы
      </Link>

      <h1 className="font-display text-xl font-bold text-navy-900 mb-6">
        {req.product_name}
      </h1>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Left */}
        <div className="space-y-4">
          {/* Product card */}
          <Card>
            <CardBody className="p-5">
              <h2 className="font-display font-semibold text-navy-800 mb-4">Детали запроса</h2>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl border border-navy-100 bg-navy-50 relative overflow-hidden shrink-0">
                  {req.product_photo ? (
                    <Image src={req.product_photo} alt={req.product_name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-navy-300">
                      <Package size={24} strokeWidth={1.2} />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2 text-sm">
                  <p className="font-mono text-xs text-navy-400">{req.sku}</p>
                  {variantAttrs && Object.keys(variantAttrs).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(variantAttrs).map(([k, v]) => (
                        <span key={k} className="text-[10px] bg-navy-100 text-navy-600 px-2 py-0.5 rounded-full">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-navy-500">
                    <div className="flex items-center gap-1.5">
                      <Package size={12} className="text-navy-300" />
                      Количество: <span className="font-semibold text-navy-800">{req.quantity} шт.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-navy-300" />
                      Создан: <span className="text-navy-700">{fmt(req.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {comment && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-navy-50 text-xs text-navy-600">
                  <MessageSquare size={13} className="text-navy-400 shrink-0 mt-0.5" />
                  <span>{comment}</span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Buyer card */}
          <Card className={offerAccepted ? "border-teal-200" : ""}>
            <CardBody className="p-5">
              <h2 className="font-display font-semibold text-navy-800 mb-3">Покупатель</h2>

              {offerAccepted ? (
                /* ── ACCEPTED: show full contacts ── */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-50 border border-teal-100">
                    <CheckCircle2 size={16} className="text-teal-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-teal-800">Покупатель выбрал ваше предложение!</p>
                      <p className="text-xs text-teal-600">Свяжитесь с ним для оформления сделки</p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-navy-800">{buyerName}</p>

                  <div className="space-y-2">
                    {email && (
                      <a
                        href={`mailto:${email}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-navy-100 hover:border-teal-300 hover:bg-teal-50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-navy-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                          <Mail size={15} className="text-navy-500 group-hover:text-teal-600" />
                        </div>
                        <div>
                          <p className="text-[11px] text-navy-400">Email</p>
                          <p className="text-sm font-medium text-navy-800">{email}</p>
                        </div>
                      </a>
                    )}
                    {phone && (
                      <a
                        href={`tel:${phone}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-navy-100 hover:border-teal-300 hover:bg-teal-50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-navy-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                          <Phone size={15} className="text-navy-500 group-hover:text-teal-600" />
                        </div>
                        <div>
                          <p className="text-[11px] text-navy-400">Телефон</p>
                          <p className="text-sm font-medium text-navy-800">{phone}</p>
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Messenger buttons */}
                  {phone && (
                    <div>
                      <p className="text-xs text-navy-400 mb-2">Написать в мессенджер:</p>
                      <div className="flex flex-wrap gap-2">
                        <MessengerBtn
                          href={`https://wa.me/${cleanPhone(phone)}`}
                          label="WhatsApp"
                          color="bg-[#25D366]"
                          icon={<WhatsAppIcon />}
                        />
                        <MessengerBtn
                          href={`viber://chat?number=%2B${cleanPhone(phone)}`}
                          label="Viber"
                          color="bg-[#7360F2]"
                          icon={<ViberIcon />}
                        />
                        <MessengerBtn
                          href={`https://t.me/+${cleanPhone(phone)}`}
                          label="Telegram"
                          color="bg-[#229ED9]"
                          icon={<Send size={14} />}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ── NOT ACCEPTED: show only name ── */
                <div className="space-y-2">
                  <p className="text-sm text-navy-700 font-medium">{buyerName}</p>
                  <p className="text-xs text-navy-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-300 inline-block" />
                    Контакты появятся, если покупатель выберет ваше предложение
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {!isOpen && !offerAccepted && (
            <div className="p-4 rounded-xl bg-navy-50 border border-navy-100 text-sm text-navy-500 text-center">
              Запрос закрыт — предложения больше не принимаются
            </div>
          )}
        </div>

        {/* Right: offer form — hidden once offer is accepted */}
        {existingOffer?.status !== "accepted" && (
          <div className="lg:sticky lg:top-24">
            <Card>
              <CardBody className="p-5">
                <h2 className="font-display font-semibold text-navy-800 mb-5">
                  {existingOffer
                    ? existingOffer.status === "withdrawn"
                      ? "Предложение отозвано"
                      : "Ваше предложение"
                    : "Создать предложение"
                  }
                </h2>

                {existingOffer?.status === "withdrawn" ? (
                  <div className="text-sm text-navy-400 text-center py-4">
                    Вы отозвали предложение по этому запросу
                  </div>
                ) : isOpen ? (
                  <OfferForm
                    requestId={req.id}
                    requestedQty={req.quantity}
                    existingOffer={existingOffer ?? null}
                    inventoryPrice={inventoryPrice}
                    inventoryCurrency={inventoryCurrency}
                  />
                ) : (
                  <div className="text-sm text-navy-400 text-center py-4">
                    Запрос закрыт покупателем
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function MessengerBtn({
  href, label, color, icon
}: {
  href: string; label: string; color: string; icon: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium ${color} hover:opacity-90 transition-opacity`}
    >
      {icon}
      {label}
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.105.549 4.082 1.51 5.797L.057 23.882l6.204-1.628A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.85 0-3.58-.5-5.07-1.37l-.36-.215-3.73.979.996-3.638-.234-.374A10 10 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  );
}

function ViberIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.4 0C6.8.1 2.6 2.3.5 6.1c-1.3 2.5-1.3 5.4-.5 8.1.7 2.4 2.1 4.5 4 6.1l.2 3.7 3.5-1.9c1.2.4 2.5.6 3.8.6 4.7 0 8.8-2.9 10.5-7.1C23.8 11 23 5.8 19.9 2.8 17.6.9 14.5-.1 11.4 0zm4.1 16.2c-.6.6-1.2 1-2 1.1-.4 0-.8-.1-1.5-.4-1.4-.6-2.7-1.5-3.8-2.6-1.1-1.1-2-2.4-2.5-3.8-.3-.8-.4-1.5-.4-2.2 0-.8.4-1.5 1-2.1.6-.5 1.2-.8 1.9-.8.1 0 .2 0 .3.1.3.1.5.4 1 1.3.3.5.6 1 .9 1.4.2.3.1.5-.1.7L9.6 10c-.2.2-.3.5-.1.7.5 1 1.2 2 2.2 2.9 1 .9 2 1.5 3.1 1.8.3.1.5 0 .7-.2l.8-1c.2-.3.5-.4.7-.2.4.3.9.6 1.4.9.9.5 1.2.7 1.3 1 0 .2-.1.5-.2.3z"/>
    </svg>
  );
}
