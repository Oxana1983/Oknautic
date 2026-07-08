"use client";

import { useEffect } from "react";
import { markAcceptedRead } from "@/lib/notification-actions";

export function MarkAcceptedRead() {
  useEffect(() => { void markAcceptedRead(); }, []);
  return null;
}
