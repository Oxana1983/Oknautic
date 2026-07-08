"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markOffersRead } from "@/lib/notification-actions";

export function BuyerBell() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  const fetchCount = useCallback(async () => {
    const supabase = createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("offers_read_at")
      .single();

    if (!profile?.offers_read_at) {
      setCount(0);
      return;
    }

    const { count } = await supabase
      .from("offers")
      .select("*", { count: "exact", head: true })
      .gt("created_at", profile.offers_read_at)
      .neq("status", "withdrawn");

    setCount(count ?? 0);
  }, []);

  useEffect(() => {
    fetchCount();

    const supabase = createClient();
    const channel = supabase
      .channel("buyer-offers")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "offers" },
        () => { void fetchCount(); }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [fetchCount]);

  async function handleClick() {
    await markOffersRead();
    setCount(0);
    router.push("/account/requests");
  }

  return (
    <button
      onClick={() => void handleClick()}
      className="relative p-2 rounded-lg text-navy-500 hover:bg-navy-50 transition-colors"
      aria-label={`Мои запросы${count > 0 ? ` (${count} новых предложений)` : ""}`}
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
