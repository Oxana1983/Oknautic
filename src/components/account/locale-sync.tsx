"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { rememberLocale } from "@/lib/profile-actions";

// Stores the signed-in user's current UI language for transactional emails
export function LocaleSync() {
  const locale = useLocale();
  useEffect(() => { void rememberLocale(locale); }, [locale]);
  return null;
}
