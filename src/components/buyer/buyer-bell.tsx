"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useUnreadCounts, UnreadBadge } from "@/components/notifications/unread-counts";

export function BuyerBell() {
  const { counts } = useUnreadCounts();
  const router = useRouter();

  // My Requests marks offers as read on open (MarkOffersRead)
  return (
    <button
      onClick={() => router.push("/account/requests")}
      className="relative p-2 rounded-lg text-navy-500 hover:bg-navy-50 transition-colors"
      aria-label={`Мои запросы${counts.offers > 0 ? ` (${counts.offers} новых предложений)` : ""}`}
    >
      <Bell size={20} />
      <UnreadBadge count={counts.offers} className="absolute top-0.5 right-0.5" />
    </button>
  );
}
