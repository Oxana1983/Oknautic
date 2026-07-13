import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("footer");

  const LINKS = {
    buyers: [
      { href: "/catalog",          label: t("catalog") },
      { href: "/rfq/new",          label: t("submitRequest") },
      { href: "/account/requests", label: t("cabinet") },
    ],
    sellers: [
      { href: "/sellers",          label: t("becomeSeller") },
      { href: "/account/incoming", label: t("cabinet") },
    ],
    company: [
      { href: "/about",      label: t("about") },
      { href: "/how",        label: t("how") },
      { href: "/insurance",  label: t("insurance") },
      { href: "/contact",    label: t("contacts") },
    ],
  };

  return (
    <footer className="bg-navy-900 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt="OKnautic"
                width={120}
                height={49}
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-navy-200 leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* Company — next to logo on mobile */}
          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-3">{t("company")}</h3>
            <ul className="space-y-2">
              {LINKS.company.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-navy-300 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Buyers */}
          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-3">{t("buyers")}</h3>
            <ul className="space-y-2">
              {LINKS.buyers.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-navy-300 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-3">{t("sellers")}</h3>
            <ul className="space-y-2">
              {LINKS.sellers.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-navy-300 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-navy-400">
            © 2026 OKnautic. {t("rights")}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/terms-of-use" className="text-xs text-navy-400 hover:text-white transition-colors">
              {t("terms")}
            </Link>
            <Link href="/seller-terms" className="text-xs text-navy-400 hover:text-white transition-colors">
              {t("sellerTerms")}
            </Link>
            <Link href="/privacy-policy" className="text-xs text-navy-400 hover:text-white transition-colors">
              {t("privacy")}
            </Link>
            <Link href="/legal-notice" className="text-xs text-navy-400 hover:text-white transition-colors">
              {t("legalNotice")}
            </Link>
            <Link href="/contact" className="text-xs text-navy-400 hover:text-white transition-colors">
              {t("contacts")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
