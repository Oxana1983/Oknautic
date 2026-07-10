"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import { useState } from 'react';

const LOCALE_LABELS: Record<string, string> = {
  ru: 'RU',
  en: 'EN',
  it: 'IT',
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next as any });
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 px-2 h-9 rounded-lg text-sm font-medium text-navy-600 hover:bg-navy-50 transition-colors"
        aria-label="Switch language"
      >
        <Globe size={15} className="text-navy-400" />
        <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-navy-100 shadow-lg z-40 py-1 min-w-[80px]">
            {routing.locales.map(l => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  l === locale
                    ? 'text-teal-600 font-semibold bg-teal-50'
                    : 'text-navy-700 hover:bg-navy-50'
                }`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
