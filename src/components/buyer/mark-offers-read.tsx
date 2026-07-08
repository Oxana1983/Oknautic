"use client";

import { useEffect } from "react";
import { markOffersRead } from "@/lib/notification-actions";

export function MarkOffersRead() {
  useEffect(() => { void markOffersRead(); }, []);
  return null;
}
