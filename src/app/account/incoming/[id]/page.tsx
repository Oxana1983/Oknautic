import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Package, Calendar, MessageSquare } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { OfferForm } from "@/components/seller/offer-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
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

  // RLS ensures seller can only see routed requests
  const { data: req } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("id", id)
    .neq("status", "deleted")
    .maybeSingle();

  if (!req) notFound();

  // Fetch seller's existing offer for this request
  const { data: existingOffer } = await supabase
    .from("offers")
    .select("*")
    .eq("quote_request_id", id)
    .eq("seller_id", user.id)
    .maybeSingle();

  const variantAttrs = req.variant_attrs as Record<string, string> | null;
  const isOpen = req.status === "in_progress";

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
        {/* Left: request details */}
        <div className="space-y-4">
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

              {req.additional_comment && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-navy-50 text-xs text-navy-600">
                  <MessageSquare size={13} className="text-navy-400 shrink-0 mt-0.5" />
                  <span>{req.additional_comment}</span>
                </div>
              )}
            </CardBody>
          </Card>

          {!isOpen && (
            <div className="p-4 rounded-xl bg-navy-50 border border-navy-100 text-sm text-navy-500 text-center">
              Запрос закрыт — предложения больше не принимаются
            </div>
          )}
        </div>

        {/* Right: offer form */}
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
                />
              ) : (
                <div className="text-sm text-navy-400 text-center py-4">
                  Запрос закрыт покупателем
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
