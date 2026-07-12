import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import {
  Package, ArrowLeft, Clock, CheckCircle2, XCircle,
  Truck, ShieldCheck, CreditCard, Banknote, Star
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { AcceptOfferButton, CloseRequestButton } from "@/components/account/request-actions";

type Props = { params: Promise<{ id: string }> };

const STATUS_STYLE: Record<string, string> = {
  in_progress: "bg-blue-50 text-blue-600 border-blue-100",
  completed:   "bg-teal-50 text-teal-700 border-teal-100",
  closed:      "bg-navy-100 text-navy-500 border-navy-200",
};

export default async function RequestDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("requests");
  const locale = await getLocale();

  function fmt(iso: string) {
    return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  }
  function fmtShort(iso: string) {
    return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short" });
  }

  const STATUS_LABEL: Record<string, string> = {
    in_progress: t("statusInProgress"),
    completed:   t("statusCompleted"),
    closed:      t("statusClosed"),
  };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/account/requests/${id}`);

  const { data: req } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("id", id)
    .eq("customer_id", user.id)
    .neq("status", "deleted")
    .single();

  if (!req) notFound();

  // Resolve current product name from products table
  let resolvedProductName = req.product_name;
  {
    const { data: product } = req.product_id
      ? await supabase.from("products").select("name").eq("id", req.product_id).maybeSingle()
      : await supabase.from("products").select("name").eq("sku", req.sku).maybeSingle();
    if (product?.name) resolvedProductName = product.name;
  }

  const { data: offersRaw } = await supabase
    .from("offers")
    .select("*")
    .eq("quote_request_id", id)
    .neq("status", "withdrawn")
    .order("created_at", { ascending: true });

  // In-stock offers shown first
  const offers = (offersRaw ?? []).sort((a, b) => {
    if (a.in_stock === b.in_stock) return 0;
    return a.in_stock ? -1 : 1;
  });

  // Fetch seller company names for offers
  const sellerIds = (offers ?? []).map((o) => o.seller_id);
  const { data: companies } =
    sellerIds.length > 0
      ? await supabase
          .from("seller_companies")
          .select("seller_id, company_name, logo_url")
          .in("seller_id", sellerIds)
      : { data: [] };

  const companyMap = Object.fromEntries(
    (companies ?? []).map((c) => [c.seller_id, c])
  );

  const variantAttrs = req.variant_attrs as Record<string, string> | null;
  const isActive = req.status === "in_progress";

  return (
    <div>
      {/* Back */}
      <Link
        href="/account/requests"
        className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        {t("title")}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-xl font-bold text-navy-900 leading-snug">{resolvedProductName}</h1>
          <p className="text-xs font-mono text-navy-400 mt-0.5">{req.sku}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full border shrink-0 ${STATUS_STYLE[req.status] ?? "bg-navy-100 text-navy-500 border-navy-200"}`}>
          {STATUS_LABEL[req.status] ?? req.status}
        </span>
      </div>

      {/* Request card */}
      <Card className="mb-6">
        <CardBody className="p-5">
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
            <div className="flex-1 space-y-2">
              {variantAttrs && Object.keys(variantAttrs).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Object.entries(variantAttrs).map(([k, v]) => (
                    <span key={k} className="text-[10px] bg-navy-100 text-navy-600 px-2 py-0.5 rounded-full">
                      {k}: {v}
                    </span>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-navy-500">
                <span>{t("quantity")} <b className="text-navy-800">{req.quantity}</b></span>
                <span>{t("createdAt")} <b className="text-navy-800">{fmt(req.created_at)}</b></span>
                {req.additional_comment && (
                  <span className="col-span-2">{t("comment")} <b className="text-navy-800">{req.additional_comment}</b></span>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Offers */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-navy-800">
          {t("suppliersOffers")}{" "}
          <span className="text-navy-400 font-normal text-sm">
            ({(offers ?? []).length})
          </span>
        </h2>
        {isActive && (
          <CloseRequestButton requestId={req.id} />
        )}
      </div>

      {(!offers || offers.length === 0) ? (
        <Card>
          <CardBody className="py-12 flex flex-col items-center gap-3 text-center">
            <Clock size={32} strokeWidth={1.2} className="text-navy-300" />
            <div>
              <p className="font-display font-semibold text-navy-600">{t("waitingOffers")}</p>
              <p className="text-sm text-navy-400 mt-1">{t("waitingOffersDesc")}</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {offers.map((offer, idx) => {
            const company = companyMap[offer.seller_id];
            const isAccepted = offer.status === "accepted" || req.accepted_offer_id === offer.id;
            const canAccept = isActive && !isAccepted;

            return (
              <Card
                key={offer.id}
                className={isAccepted ? "border-teal-300 bg-teal-50/30" : ""}
              >
                <CardBody className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-navy-800">
                        {company?.company_name ?? `${t("supplier")} ${idx + 1}`}
                      </p>
                      <p className="text-xs text-navy-400">{t("offerFrom", { date: fmtShort(offer.created_at) })}</p>
                    </div>
                    {isAccepted && (
                      <span className="flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-100 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={12} />
                        {t("accepted")}
                      </span>
                    )}
                  </div>

                  {/* Price + delivery */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-navy-50 rounded-xl p-3">
                      <p className="text-xs text-navy-400 mb-0.5">{t("pricePerUnit")}</p>
                      <p className="text-xl font-bold text-navy-900">
                        {Number(offer.price_per_unit).toLocaleString(locale)}
                        <span className="text-sm font-normal text-navy-400 ml-1">{offer.currency}</span>
                      </p>
                      <p className="text-xs text-navy-500 mt-0.5">
                        {t("qty")} <span className="font-medium text-navy-700">{offer.available_quantity}</span>
                      </p>
                      <p className="text-xs text-navy-500 mt-0.5">
                        {t("total")} <span className="font-medium text-navy-700">{(Number(offer.price_per_unit) * offer.available_quantity).toLocaleString(locale)} {offer.currency}</span>
                      </p>
                    </div>
                    <div className={`rounded-xl p-3 ${offer.in_stock ? "bg-teal-50 border border-teal-100" : "bg-navy-50"}`}>
                      <p className="text-xs text-navy-400 mb-1">{t("delivery")}</p>
                      {offer.in_stock ? (
                        <p className="text-sm font-semibold text-teal-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-500 inline-block shrink-0" />
                          {t("inStock")}
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-navy-600 flex items-center gap-1.5">
                          <Truck size={14} className="text-navy-400 shrink-0" />
                          {t("onOrder")}
                        </p>
                      )}
                      <p className="text-xs text-navy-500 mt-0.5">
                        {t("shipBy", { date: fmtShort(offer.delivery_datetime) })}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge active={offer.is_new} icon={<Star size={11} />} label={offer.is_new ? t("conditionNew") : t("conditionUsed")} />
                    {offer.warranty_months > 0 && (
                      <Badge active icon={<ShieldCheck size={11} />} label={t("warranty", { months: offer.warranty_months })} />
                    )}
                    {offer.includes_vat && (
                      <Badge active icon={<CheckCircle2 size={11} />} label={t("vatIncluded")} />
                    )}
                    {offer.payment_cash && (
                      <Badge active icon={<Banknote size={11} />} label={t("paymentCash")} />
                    )}
                    {offer.payment_cashless && (
                      <Badge active icon={<CreditCard size={11} />} label={t("paymentCashless")} />
                    )}
                    {offer.allows_pickup && (
                      <Badge active icon={<Package size={11} />} label={t("allowsPickup")} />
                    )}
                  </div>

                  {offer.comment && (
                    <p className="text-xs text-navy-500 bg-navy-50 rounded-lg px-3 py-2 mb-4">
                      {offer.comment}
                    </p>
                  )}

                  {canAccept && (
                    <AcceptOfferButton offerId={offer.id} requestId={req.id} />
                  )}

                  {!isActive && !isAccepted && req.status === "completed" && (
                    <p className="text-xs text-navy-400 flex items-center gap-1.5 mt-1">
                      <XCircle size={12} />
                      {t("notSelected")}
                    </p>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Badge({ active, icon, label }: { active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
      active
        ? "bg-teal-50 text-teal-700 border-teal-100"
        : "bg-navy-50 text-navy-400 border-navy-100"
    }`}>
      {icon}{label}
    </span>
  );
}
