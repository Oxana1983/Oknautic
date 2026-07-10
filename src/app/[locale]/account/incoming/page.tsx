import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { MarkInboxRead } from "@/components/seller/mark-inbox-read";
import { IncomingList } from "@/components/seller/incoming-list";
import type { IncomingItem } from "@/components/seller/incoming-list";

export const dynamic = "force-dynamic";

const SELECT = "id, sku, product_name, product_photo, quantity, status, created_at, buyer_name";

export default async function IncomingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/incoming");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, inbox_read_at")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "seller") redirect("/account/requests");

  const inboxReadAt = profile?.inbox_read_at ? new Date(profile.inbox_read_at) : null;

  // Get seller's inventory to filter requests
  const { data: inventory } = await supabase
    .from("seller_inventory")
    .select("sku, product_id")
    .eq("seller_id", user.id);

  const sellerSkus = [...new Set((inventory ?? []).map((i) => i.sku))];
  const sellerProductIds = [...new Set(
    (inventory ?? []).map((i) => i.product_id).filter((id): id is string => !!id)
  )];

  // Get archive records
  const { data: archivedRows } = await supabase
    .from("seller_request_archive")
    .select("quote_request_id, is_permanent")
    .eq("seller_id", user.id);

  const allArchivedIds = new Set((archivedRows ?? []).map((r) => r.quote_request_id));
  const softArchivedIds = Array.from(
    new Set((archivedRows ?? []).filter((r) => !r.is_permanent).map((r) => r.quote_request_id))
  );

  // Fetch active requests only for products this seller carries
  const hasInventory = sellerSkus.length > 0 || sellerProductIds.length > 0;
  const orParts: string[] = [];
  if (sellerSkus.length > 0) orParts.push(`sku.in.(${sellerSkus.map((s) => `"${s}"`).join(",")})`);
  if (sellerProductIds.length > 0) orParts.push(`product_id.in.(${sellerProductIds.join(",")})`);

  const { data: activeReqs, error } = hasInventory
    ? await supabase
        .from("quote_requests")
        .select(SELECT)
        .eq("status", "in_progress")
        .or(orParts.join(","))
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  const activeReqsFiltered = (activeReqs ?? []).filter((r) => !allArchivedIds.has(r.id));

  // Fetch archived requests by ID (any status)
  const { data: archivedReqs } =
    softArchivedIds.length > 0
      ? await supabase
          .from("quote_requests")
          .select(SELECT)
          .in("id", softArchivedIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  // Offers for all visible requests
  const allIds = [
    ...activeReqsFiltered.map((r) => r.id),
    ...(archivedReqs ?? []).map((r) => r.id),
  ];
  const { data: myOffers } =
    allIds.length > 0
      ? await supabase
          .from("offers")
          .select("quote_request_id")
          .eq("seller_id", user.id)
          .neq("status", "withdrawn")
          .in("quote_request_id", allIds)
      : { data: [] };

  const offeredSet = new Set((myOffers ?? []).map((o) => o.quote_request_id));

  const toItem = (r: typeof activeReqsFiltered[number], checkNew = false): IncomingItem => ({
    ...r,
    hasOffer: offeredSet.has(r.id),
    isNew: checkNew && inboxReadAt ? new Date(r.created_at) > inboxReadAt : false,
  });

  const activeItems = activeReqsFiltered.map((r) => toItem(r, true));
  const archiveItems = (archivedReqs ?? []).map((r) => toItem(r, false));

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

      <IncomingList activeItems={activeItems} archiveItems={archiveItems} />
    </div>
  );
}
