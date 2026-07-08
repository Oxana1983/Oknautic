"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markInboxRead } from "@/lib/notification-actions";

export function SellerBell() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  const fetchCount = useCallback(async () => {
    const supabase = createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("inbox_read_at")
      .single();

    // NULL means first-ever login — start at 0, not "all requests unread"
    if (!profile?.inbox_read_at) {
      setCount(0);
      return;
    }

    const { count } = await supabase
      .from("quote_requests")
      .select("*", { count: "exact", head: true })
      .gt("created_at", profile.inbox_read_at)
      .neq("status", "deleted");

    setCount(count ?? 0);
  }, []);

  useEffect(() => {
    fetchCount();

    // Realtime: re-fetch count when a new request is inserted.
    // Supabase applies RLS on the channel — only events visible to this seller come through.
    const supabase = createClient();
    const channel = supabase
      .channel("seller-incoming")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "quote_requests" },
        () => { void fetchCount(); }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [fetchCount]);

  async function handleClick() {
    await markInboxRead();
    setCount(0);
    router.push("/account/incoming");
  }

  return (
    <button
      onClick={() => void handleClick()}
      className="relative p-2 rounded-lg text-navy-500 hover:bg-navy-50 transition-colors"
      aria-label={`Входящие запросы${count > 0 ? ` (${count})` : ""}`}
    >
      <Bell size={20} />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
