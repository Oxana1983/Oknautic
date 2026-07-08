import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { MarkInboxRead } from "@/components/seller/mark-inbox-read";
import { IncomingList } from "@/components/seller/incoming-list";
import type { IncomingItem } from "@/components/seller/incoming-list";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ view?: string }> };

export default async function IncomingPage({ searchParams }: Props) {
  const { view } = await searchParams;
  const isArchive = view === "archive";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/incoming");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "seller") redirect("/account/requests");

  // Get archived IDs for this seller
  const { data: archivedRows } = await supabase
    .from("seller_request_archive")
    .select("quote_request_id")
    .eq("seller_id", user.id);

  const archivedIds = new Set((archivedRows ?? []).map((r) => r.quote_request_id));
  const archiveCount = archivedIds.size;

  // Fetch all routed requests (RLS filters automatically)
  const { data: allRequests, error } = await supabase
    .from("quote_requests")
    .select("id, sku, product_name, product_photo, quantity, status, created_at, buyer_name, additional_comment")
    .eq("status", "in_progress")
    .order("created_at", { ascending: false });

  // Split into active / archived
  const activeRequests = (allRequests ?? []).filter((r) => !archivedIds.has(r.id));
  const archivedRequests = (allRequests ?? []).filter((r) => archivedIds.has(r.id));
  const visibleRequests = isArchive ? archivedRequests : activeRequests;

  // Which requests already have an offer from this seller
  const visibleIds = visibleRequests.map((r) => r.id);
  const { data: myOffers } =
    visibleIds.length > 0
      ? await supabase
          .from("offers")
          .select("quote_request_id")
          .eq("seller_id", user.id)
          .neq("status", "withdrawn")
          .in("quote_request_id", visibleIds)
      : { data: [] };

  const offeredSet = new Set((myOffers ?? []).map((o) => o.quote_request_id));

  const items: IncomingItem[] = visibleRequests.map((r) => ({
    ...r,
    hasOffer: offeredSet.has(r.id),
  }));

  // Check brand/category setup
  const { count: brandCatCount } = await supabase
    .from("seller_brand_categories")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", user.id);

  return (
    <div>
      <MarkInboxRead />

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-bold text-navy-900">Входящие запросы</h1>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          Ошибка загрузки: {error.message}
        </div>
      )}

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

      <IncomingList
        items={items}
        isArchive={isArchive}
        activeCount={activeRequests.length}
        archiveCount={archiveCount}
      />
    </div>
  );
}
