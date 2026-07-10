import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ru', 'en', 'it'],
  defaultLocale: 'ru',
  localePrefix: 'always',
});
