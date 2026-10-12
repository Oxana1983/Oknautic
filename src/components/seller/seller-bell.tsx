"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useUnreadCounts, UnreadBadge } from "@/components/notifications/unread-counts";

export function SellerBell() {
  const { counts } = useUnreadCounts();
  const router = useRouter();
  const total = counts.incoming + counts.accepted;

  function handleClick() {
    if (counts.accepted > 0 && counts.incoming === 0) {
      router.push("/account/offers");
    } else {
      router.push("/account/incoming");
    }
  }

  const label = [
    counts.incoming > 0 ? `${counts.incoming} новых запросов` : "",
    counts.accepted > 0 ? `${counts.accepted} предложений принято` : "",
  ].filter(Boolean).join(", ");

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-lg text-navy-500 hover:bg-navy-50 transition-colors"
      aria-label={total > 0 ? label : "Уведомления"}
    >
      <Bell size={20} />
      <UnreadBadge count={total} className="absolute top-0.5 right-0.5" />
    </button>
  );
}
