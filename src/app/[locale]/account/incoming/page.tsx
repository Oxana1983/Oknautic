import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Settings } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { IncomingList } from "@/components/seller/incoming-list";
import type { IncomingItem } from "@/components/seller/incoming-list";

export const dynamic = "force-dynamic";

export default async function IncomingPage() {
  const t = await getTranslations("incoming");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/incoming");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, inbox_read_at")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "seller") redirect("/account/requests");

  // Fallback baseline: requests before inbox_read_at are considered already seen
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

  // Sellers have no direct SELECT on quote_requests (migration 022) — the
  // RPC applies routing and masks buyer contacts until acceptance
  const hasInventory = sellerSkus.length > 0 || sellerProductIds.length > 0;
  const sellerSkuSet = new Set(sellerSkus);
  const sellerProductIdSet = new Set(sellerProductIds);

  const { data: routedReqs, error } = await supabase.rpc("get_seller_quote_requests");
  const toRow = (r: NonNullable<typeof routedReqs>[number]) => ({
    id: r.id,
    sku: r.sku,
    product_id: r.product_id,
    product_name: r.product_name,
    product_photo: r.product_photo,
    quantity: r.quantity,
    status: r.status,
    created_at: r.created_at,
    buyer_name: r.buyer_name,
    delivery_area: r.delivery_area,
    distance_km: r.distance_km,
  });

  const activeReqsFiltered = hasInventory
    ? (routedReqs ?? [])
        .filter(
          (r) =>
            r.status === "in_progress" &&
            !allArchivedIds.has(r.id) &&
            (sellerSkuSet.has(r.sku) || (!!r.product_id && sellerProductIdSet.has(r.product_id)))
        )
        .map(toRow)
    : [];

  const softArchivedSet = new Set(softArchivedIds);
  const archivedReqs = (routedReqs ?? [])
    .filter((r) => softArchivedSet.has(r.id))
    .map(toRow);

  // Offers for all visible requests
  const allIds = [
    ...activeReqsFiltered.map((r) => r.id),
    ...archivedReqs.map((r) => r.id),
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

  // Fetch current product names by SKU to override stale/localized stored names
  const allSkus = [...new Set([
    ...activeReqsFiltered.map((r) => r.sku),
    ...archivedReqs.map((r) => r.sku),
  ].filter(Boolean))];
  const { data: productNames } =
    allSkus.length > 0
      ? await supabase.from("products").select("sku, name").in("sku", allSkus)
      : { data: [] };
  const productNameMap = new Map((productNames ?? []).map((p) => [p.sku, p.name]));

  // Per-request read status
  const { data: readRows } =
    allIds.length > 0
      ? await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from("seller_request_reads" as any)
          .select("quote_request_id")
          .eq("seller_id", user.id)
          .in("quote_request_id", allIds)
      : { data: [] };

  const readSet = new Set(((readRows ?? []) as unknown as { quote_request_id: string }[]).map((r) => r.quote_request_id));

  // isNew: not individually read AND not before the legacy inbox_read_at baseline
  function isNew(r: { id: string; created_at: string }) {
    if (readSet.has(r.id)) return false;
    if (inboxReadAt && new Date(r.created_at) <= inboxReadAt) return false;
    return true;
  }

  const toItem = (r: typeof activeReqsFiltered[number], checkNew = false): IncomingItem => ({
    ...r,
    product_name: productNameMap.get(r.sku) ?? r.product_name,
    hasOffer: offeredSet.has(r.id),
    isNew: checkNew ? isNew(r) : false,
  });

  const activeItems = activeReqsFiltered.map((r) => toItem(r, true));
  const archiveItems = archivedReqs.map((r) => toItem(r, false));

  const { count: brandCatCount } = await supabase
    .from("seller_brand_categories")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-bold text-navy-900">{t("title")}</h1>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {t("loadError")} {error.message}
        </div>
      )}

      {(brandCatCount ?? 0) === 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardBody className="p-4 flex items-start gap-3">
            <Settings size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">{t("setupTitle")}</p>
              <p className="text-xs text-amber-600 mt-0.5">
                {t("setupDesc")}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      <IncomingList activeItems={activeItems} archiveItems={archiveItems} />
    </div>
  );
}
