"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Counts = { requests: number; accepted: number };

export function SellerBell() {
  const [counts, setCounts] = useState<Counts>({ requests: 0, accepted: 0 });
  const router = useRouter();

  const fetchCounts = useCallback(async () => {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("inbox_read_at, accepted_read_at")
      .single();

    // New incoming requests — count those not yet individually read
    let requestCount = 0;
    const { data: inventory } = await supabase
      .from("seller_inventory")
      .select("sku, product_id")
      .eq("seller_id", user.id);

    const skus = [...new Set((inventory ?? []).map((i) => i.sku))];
    const productIds = [...new Set(
      (inventory ?? []).map((i) => i.product_id).filter((id): id is string => !!id)
    )];

    if (skus.length > 0 || productIds.length > 0) {
      const orParts: string[] = [];
      if (skus.length > 0) orParts.push(`sku.in.(${skus.map((s) => `"${s}"`).join(",")})`);
      if (productIds.length > 0) orParts.push(`product_id.in.(${productIds.join(",")})`);

      // All matching requests
      let query = supabase
        .from("quote_requests")
        .select("id, created_at")
        .eq("status", "in_progress")
        .or(orParts.join(","));

      // Legacy baseline: skip requests older than inbox_read_at
      if (profile?.inbox_read_at) {
        query = query.gt("created_at", profile.inbox_read_at);
      }

      const { data: allRequests } = await query;
      const allIds = (allRequests ?? []).map((r) => r.id);

      if (allIds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: readRows } = await (supabase as any)
          .from("seller_request_reads")
          .select("quote_request_id")
          .eq("seller_id", user.id)
          .in("quote_request_id", allIds);

        const readSet = new Set(((readRows ?? []) as { quote_request_id: string }[]).map((r) => r.quote_request_id));
        requestCount = allIds.filter((id) => !readSet.has(id)).length;
      }
    }

    // Accepted offers (buyer chose this seller's offer)
    let acceptedCount = 0;
    if (profile?.accepted_read_at) {
      const { count } = await supabase
        .from("offers")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("status", "accepted")
        .gt("updated_at", profile.accepted_read_at);
      acceptedCount = count ?? 0;
    }

    setCounts({ requests: requestCount, accepted: acceptedCount });
  }, []);

  useEffect(() => {
    fetchCounts();

    const supabase = createClient();

    // New incoming requests
    const reqChannel = supabase
      .channel("seller-incoming")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "quote_requests" },
        () => { void fetchCounts(); })
      .subscribe();

    // Offer accepted (status UPDATE on offers table)
    const offerChannel = supabase
      .channel("seller-offers-accepted")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "offers" },
        () => { void fetchCounts(); })
      .subscribe();

    return () => {
      void supabase.removeChannel(reqChannel);
      void supabase.removeChannel(offerChannel);
    };
  }, [fetchCounts]);

  const total = counts.requests + counts.accepted;

  function handleClick() {
    if (counts.accepted > 0 && counts.requests === 0) {
      router.push("/account/offers");
    } else {
      router.push("/account/incoming");
    }
  }

  const label = [
    counts.requests > 0 ? `${counts.requests} новых запросов` : "",
    counts.accepted > 0 ? `${counts.accepted} предложений принято` : "",
  ].filter(Boolean).join(", ");

  return (
    <button
      onClick={() => void handleClick()}
      className="relative p-2 rounded-lg text-navy-500 hover:bg-navy-50 transition-colors"
      aria-label={total > 0 ? label : "Уведомления"}
    >
      <Bell size={20} />
      {total > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
          {total > 99 ? "99+" : total}
        </span>
      )}
    </button>
  );
}
