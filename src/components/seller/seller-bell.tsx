"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markInboxRead } from "@/lib/notification-actions";

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

    // New incoming requests
    let requestCount = 0;
    if (profile?.inbox_read_at) {
      const { count } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true })
        .gt("created_at", profile.inbox_read_at)
        .neq("status", "deleted");
      requestCount = count ?? 0;
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

  async function handleClick() {
    // If there are accepted offers pending → go to My Offers first
    if (counts.accepted > 0 && counts.requests === 0) {
      router.push("/account/offers");
    } else {
      await markInboxRead();
      setCounts((c) => ({ ...c, requests: 0 }));
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
