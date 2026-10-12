"use client";

import { useEffect } from "react";
import { markRequestRead } from "@/lib/notification-actions";
import { useUnreadCounts } from "@/components/notifications/unread-counts";

export function MarkRequestRead({ requestId }: { requestId: string }) {
  const { refresh } = useUnreadCounts();
  useEffect(() => { void markRequestRead(requestId).then(refresh); }, [requestId, refresh]);
  return null;
}
