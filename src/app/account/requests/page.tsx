import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileText, Package, ChevronRight, MessageSquare } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  in_progress: "В обработке",
  completed:   "Завершён",
  closed:      "Закрыт",
};

const STATUS_STYLE: Record<string, string> = {
  in_progress: "bg-blue-50 text-blue-600",
  completed:   "bg-teal-50 text-teal-700",
  closed:      "bg-navy-100 text-navy-500",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export default async function RequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/requests");

  // Separate queries to avoid RLS issues with embedded offers
  const { data: requests, error } = await supabase
    .from("quote_requests")
    .select("id, sku, product_name, product_photo, quantity, status, created_at, variant_attrs")
    .eq("customer_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  // Count offers per request (only non-withdrawn)
  const requestIds = (requests ?? []).map((r) => r.id);
  const { data: offerCounts } =
    requestIds.length > 0
      ? await supabase
          .from("offers")
          .select("quote_request_id")
          .in("quote_request_id", requestIds)
          .neq("status", "withdrawn")
      : { data: [] };

  const countMap: Record<string, number> = {};
  for (const o of offerCounts ?? []) {
    countMap[o.quote_request_id] = (countMap[o.quote_request_id] ?? 0) + 1;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-bold text-navy-900">Мои запросы</h1>
        <Link href="/catalog" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          + Новый запрос
        </Link>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          Ошибка загрузки: {error.message}
        </div>
      )}

      {!requests || requests.length === 0 ? (
        <Card>
          <CardBody className="py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-navy-50 flex items-center justify-center">
              <FileText size={24} strokeWidth={1.2} className="text-navy-300" />
            </div>
            <div>
              <p className="font-display font-semibold text-navy-700 mb-1">Запросов пока нет</p>
              <p className="text-sm text-navy-400">Добавьте товары в корзину и отправьте запрос цен</p>
            </div>
            <Link href="/catalog" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              Перейти в каталог →
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const activeOffers = countMap[req.id] ?? 0;
            return (
              <Link key={req.id} href={`/account/requests/${req.id}`}>
                <Card className="hover:border-teal-200 hover:shadow-sm transition-all">
                  <CardBody className="p-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl border border-navy-100 bg-navy-50 relative overflow-hidden shrink-0">
                        {req.product_photo ? (
                          <Image src={req.product_photo} alt={req.product_name} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-navy-300">
                            <Package size={20} strokeWidth={1.2} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-navy-800 leading-snug">{req.product_name}</p>
                            <p className="text-xs font-mono text-navy-400 mt-0.5">{req.sku}</p>
                          </div>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[req.status] ?? "bg-navy-100 text-navy-500"}`}>
                            {STATUS_LABEL[req.status] ?? req.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-navy-400">
                          <span>Кол-во: <span className="text-navy-600 font-medium">{req.quantity}</span></span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={11} />
                            {activeOffers > 0
                              ? <span className="text-teal-600 font-medium">{activeOffers} предложений</span>
                              : "нет предложений"
                            }
                          </span>
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
