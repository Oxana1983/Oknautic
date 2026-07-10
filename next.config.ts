import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "kgiipxccnquatppaywle.supabase.co" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fishermans-marine.com" },
      { protocol: "https", hostname: "d73v3rdaoqh96.cloudfront.net" },
      { protocol: "https", hostname: "nvnmarine.com" },
      { protocol: "https", hostname: "www.furuno.com" },
      { protocol: "https", hostname: "webshop.vetus.com" },
      { protocol: "https", hostname: "www.lewmar.com" },
      { protocol: "https", hostname: "www.lofrans.com" },
      { protocol: "https", hostname: "www.go2marine.com" },
      { protocol: "https", hostname: "ab-marineservice.com" },
      { protocol: "https", hostname: "theyachtrigger.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
