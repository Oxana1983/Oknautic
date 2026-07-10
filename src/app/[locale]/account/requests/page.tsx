import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MarkOffersRead } from "@/components/buyer/mark-offers-read";
import { RequestsList } from "@/components/buyer/requests-list";
import type { BuyerRequestItem } from "@/components/buyer/requests-list";

export const dynamic = "force-dynamic";

const SELECT = "id, sku, product_name, product_photo, quantity, status, created_at";

export default async function RequestsPage() {
  const t = await getTranslations("requests");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/requests");

  // Archive records for this buyer
  const { data: archivedRows } = await supabase
    .from("buyer_request_archive")
    .select("quote_request_id, is_permanent")
    .eq("buyer_id", user.id);

  const allArchivedIds = new Set((archivedRows ?? []).map((r) => r.quote_request_id));
  const softArchivedIds = Array.from(
    new Set((archivedRows ?? []).filter((r) => !r.is_permanent).map((r) => r.quote_request_id))
  );

  // Fetch active requests
  const { data: activeReqs, error } = await supabase
    .from("quote_requests")
    .select(SELECT)
    .eq("customer_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  const activeReqsFiltered = (activeReqs ?? []).filter((r) => !allArchivedIds.has(r.id));

  // Fetch archived requests by ID (any status)
  const { data: archivedReqs } =
    softArchivedIds.length > 0
      ? await supabase
          .from("quote_requests")
          .select(SELECT)
          .eq("customer_id", user.id)
          .in("id", softArchivedIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  // Count offers for all visible requests
  const allIds = [
    ...activeReqsFiltered.map((r) => r.id),
    ...(archivedReqs ?? []).map((r) => r.id),
  ];
  const { data: offerRows } =
    allIds.length > 0
      ? await supabase
          .from("offers")
          .select("quote_request_id")
          .in("quote_request_id", allIds)
          .neq("status", "withdrawn")
      : { data: [] };

  const countMap: Record<string, number> = {};
  for (const o of offerRows ?? []) {
    countMap[o.quote_request_id] = (countMap[o.quote_request_id] ?? 0) + 1;
  }

  const toItem = (r: typeof activeReqsFiltered[number]): BuyerRequestItem => ({
    ...r,
    offerCount: countMap[r.id] ?? 0,
  });

  const activeItems = activeReqsFiltered.map(toItem);
  const archiveItems = (archivedReqs ?? []).map(toItem);

  return (
    <div>
      <MarkOffersRead />
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-bold text-navy-900">{t("title")}</h1>
        <Link href="/catalog" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          {t("newRequest")}
        </Link>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {t("loadError")} {error.message}
        </div>
      )}

      <RequestsList activeItems={activeItems} archiveItems={archiveItems} />
    </div>
  );
}
