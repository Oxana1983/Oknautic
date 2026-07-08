import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Inbox, Package, ChevronRight, Settings } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  in_progress: "Активный",
  completed:   "Завершён",
  closed:      "Закрыт",
};
const STATUS_STYLE: Record<string, string> = {
  in_progress: "bg-blue-50 text-blue-600",
  completed:   "bg-navy-100 text-navy-500",
  closed:      "bg-navy-100 text-navy-400",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export default async function IncomingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/incoming");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "seller") redirect("/account/requests");

  // RLS filters by seller_brand_categories automatically
  const { data: requests, error } = await supabase
    .from("quote_requests")
    .select("id, sku, product_name, product_photo, quantity, status, created_at, additional_comment")
    .eq("status", "in_progress")
    .order("created_at", { ascending: false });

  // Check if seller has brand/category setup
  const { count: brandCatCount } = await supabase
    .from("seller_brand_categories")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", user.id);

  // Check which requests already have an offer from this seller
  const requestIds = (requests ?? []).map((r) => r.id);
  const { data: myOffers } =
    requestIds.length > 0
      ? await supabase
          .from("offers")
          .select("quote_request_id")
          .eq("seller_id", user.id)
          .neq("status", "withdrawn")
          .in("quote_request_id", requestIds)
      : { data: [] };

  const offeredSet = new Set((myOffers ?? []).map((o) => o.quote_request_id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-bold text-navy-900">Входящие запросы</h1>
        {requests && requests.length > 0 && (
          <span className="text-xs text-navy-400">{requests.length} активных</span>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          Ошибка загрузки: {error.message}
        </div>
      )}

      {/* No brand/category setup warning */}
      {(brandCatCount ?? 0) === 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardBody className="p-4 flex items-start gap-3">
            <Settings size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Настройте категории товаров</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Чтобы получать запросы, добавьте бренды и категории в профиле продавца.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {!requests || requests.length === 0 ? (
        <Card>
          <CardBody className="py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-navy-50 flex items-center justify-center">
              <Inbox size={24} strokeWidth={1.2} className="text-navy-300" />
            </div>
            <div>
              <p className="font-display font-semibold text-navy-700 mb-1">Запросов пока нет</p>
              <p className="text-sm text-navy-400">
                {(brandCatCount ?? 0) === 0
                  ? "Добавьте бренды и категории в профиль, чтобы начать получать запросы"
                  : "Входящие запросы по вашим категориям появятся здесь"}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const hasOffer = offeredSet.has(req.id);
            return (
              <Link key={req.id} href={`/account/incoming/${req.id}`}>
                <Card className="hover:border-teal-200 hover:shadow-sm transition-all">
                  <CardBody className="p-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-xl border border-navy-100 bg-navy-50 relative overflow-hidden shrink-0">
                        {req.product_photo ? (
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
                            <p className="text-sm font-semibold text-navy-800 leading-snug">{req.product_name}</p>
                            <p className="text-xs font-mono text-navy-400 mt-0.5">{req.sku}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[req.status] ?? "bg-navy-100 text-navy-500"}`}>
                              {STATUS_LABEL[req.status] ?? req.status}
                            </span>
                            {hasOffer && (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">
                                Предложено
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-navy-400">
                          <span>Кол-во: <span className="text-navy-600 font-medium">{req.quantity}</span></span>
                          <span className="ml-auto">{fmt(req.created_at)}</span>
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
