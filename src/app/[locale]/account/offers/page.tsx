import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileText, Package, ChevronRight, CheckCircle2, Clock, XCircle, Ban } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { MarkAcceptedRead } from "@/components/seller/mark-accepted-read";

export const dynamic = "force-dynamic";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

function fmtPrice(price: number, currency: string) {
  return `${price.toLocaleString("ru-RU")} ${currency}`;
}

type OfferStatus = "pending" | "accepted" | "withdrawn" | "closed";

const OFFER_BADGE: Record<OfferStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  pending:   { label: "Ожидает ответа",    cls: "bg-blue-50 text-blue-600",    icon: <Clock size={11} /> },
  accepted:  { label: "Принято!",           cls: "bg-teal-50 text-teal-700",    icon: <CheckCircle2 size={11} /> },
  withdrawn: { label: "Отозвано",           cls: "bg-navy-100 text-navy-400",   icon: <XCircle size={11} /> },
  closed:    { label: "Закрыто покупателем", cls: "bg-navy-100 text-navy-500",   icon: <Ban size={11} /> },
};

export default async function MyOffersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/offers");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "seller") redirect("/account/requests");

  const { data: offers, error } = await supabase
    .from("offers")
    .select("id, quote_request_id, price_per_unit, currency, available_quantity, delivery_datetime, status, created_at, is_new, warranty_months")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch quote_request details for each offer
  const requestIds = (offers ?? []).map((o) => o.quote_request_id);
  const { data: requests } =
    requestIds.length > 0
      ? await supabase
          .from("quote_requests")
          .select("id, product_name, product_photo, sku, quantity, status")
          .in("id", requestIds)
      : { data: [] };

  const reqMap = Object.fromEntries((requests ?? []).map((r) => [r.id, r]));

  return (
    <div>
      <MarkAcceptedRead />
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-bold text-navy-900">Мои предложения</h1>
        {offers && offers.length > 0 && (
          <span className="text-xs text-navy-400">{offers.length} всего</span>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          Ошибка загрузки: {error.message}
        </div>
      )}

      {!offers || offers.length === 0 ? (
        <Card>
          <CardBody className="py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-navy-50 flex items-center justify-center">
              <FileText size={24} strokeWidth={1.2} className="text-navy-300" />
            </div>
            <div>
              <p className="font-display font-semibold text-navy-700 mb-1">Предложений пока нет</p>
              <p className="text-sm text-navy-400">
                Откройте входящие запросы и отправьте своё первое предложение
              </p>
            </div>
            <Link href="/account/incoming" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              Входящие запросы →
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => {
            const req = reqMap[offer.quote_request_id];
            const effectiveStatus: OfferStatus =
              offer.status === "pending" && req?.status === "closed" ? "closed" : (offer.status as OfferStatus);
            const badge = OFFER_BADGE[effectiveStatus] ?? OFFER_BADGE.pending;

            return (
              <Link key={offer.id} href={`/account/incoming/${offer.quote_request_id}`}>
                <Card className={`hover:border-teal-200 hover:shadow-sm transition-all ${
                  effectiveStatus === "accepted" ? "border-teal-200 bg-teal-50/20" :
                  effectiveStatus === "closed"   ? "opacity-60" : ""
                }`}>
                  <CardBody className="p-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-xl border border-navy-100 bg-navy-50 relative overflow-hidden shrink-0">
                        {req?.product_photo ? (
                          <Image src={req.product_photo} alt={req.product_name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-navy-300">
                            <Package size={18} strokeWidth={1.2} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-navy-800 leading-snug">
                              {req?.product_name ?? "Запрос удалён"}
                            </p>
                            <p className="text-xs font-mono text-navy-400 mt-0.5">{req?.sku}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
                            {badge.icon}{badge.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-navy-400">
                          <span className="font-semibold text-navy-800 text-sm">
                            {fmtPrice(offer.price_per_unit, offer.currency)}
                          </span>
                          <span>{offer.is_new ? "Новый" : "Б/У"}</span>
                          {offer.warranty_months > 0 && (
                            <span>Гарантия {offer.warranty_months} мес.</span>
                          )}
                          <span className="ml-auto">{fmt(offer.created_at)}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-navy-300 shrink-0" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
