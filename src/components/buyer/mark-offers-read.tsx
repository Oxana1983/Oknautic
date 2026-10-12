"use client";

import { useEffect } from "react";
import { markOffersRead } from "@/lib/notification-actions";
import { useUnreadCounts } from "@/components/notifications/unread-counts";

export function MarkOffersRead() {
  const { refresh } = useUnreadCounts();
  useEffect(() => { void markOffersRead().then(refresh); }, [refresh]);
  return null;
}
