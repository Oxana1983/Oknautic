"use client";

import { useEffect } from "react";
import { markInboxRead } from "@/lib/notification-actions";

// Invisible component — marks all incoming requests as read on mount.
// Placed on /account/incoming so the bell count resets when the seller opens the page.
export function MarkInboxRead() {
  useEffect(() => { void markInboxRead(); }, []);
  return null;
}
