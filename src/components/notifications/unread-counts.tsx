"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUnreadCounts, type UnreadCounts } from "@/lib/notification-actions";

type Ctx = { counts: UnreadCounts; refresh: () => Promise<void> };

const EMPTY: UnreadCounts = { incoming: 0, accepted: 0, offers: 0 };
const UnreadCountsContext = createContext<Ctx>({ counts: EMPTY, refresh: async () => {} });

// Shared by the header bell and the account sidebar so both always agree.
// Refetches on navigation, every minute, on offer changes, and on refresh()
// (called by the Mark*Read components once their write has finished).
export function UnreadCountsProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const [counts, setCounts] = useState<UnreadCounts>(EMPTY);
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      setCounts(await getUnreadCounts());
    } catch {
      // keep the previous counts on a network error
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    getUnreadCounts()
      .then((c) => { if (!cancelled) setCounts(c); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [enabled, pathname]);

  useEffect(() => {
    if (!enabled) return;
    // New requests can't be pushed via realtime (sellers have no SELECT on
    // quote_requests), so poll; offers changes arrive via realtime
    const poll = setInterval(() => { void refresh(); }, 60_000);
    const supabase = createClient();
    const channel = supabase
      .channel("unread-offers")
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" },
        () => { void refresh(); })
      .subscribe();
    return () => {
      clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [enabled, refresh]);

  return (
    <UnreadCountsContext.Provider value={{ counts: enabled ? counts : EMPTY, refresh }}>
      {children}
    </UnreadCountsContext.Provider>
  );
}

export function useUnreadCounts() {
  return useContext(UnreadCountsContext);
}

export function UnreadBadge({ count, className = "" }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={
        "min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none " +
        className
      }
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
