import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  { slug: "navigation",    label: "Навигация" },
  { slug: "anchoring",     label: "Якорное снаряжение" },
  { slug: "deck-hardware", label: "Палубное оборудование" },
  { slug: "mooring",       label: "Швартовка" },
  { slug: "engines",       label: "Двигатели" },
  { slug: "electrical",    label: "Электрика" },
  { slug: "safety",        label: "Безопасность" },
  { slug: "rigging",       label: "Такелаж" },
];

const LINKS = {
  buyers: [
    { href: "/catalog",   label: "Каталог запчастей" },
    { href: "/rfq",       label: "Мои запросы (RFQ)" },
    { href: "/orders",    label: "История заказов" },
    { href: "/cart",      label: "Корзина" },
  ],
  sellers: [
    { href: "/sellers",         label: "Стать продавцом" },
    { href: "/seller/offers",   label: "Мои предложения" },
    { href: "/seller/products", label: "Мои товары" },
    { href: "/seller/stats",    label: "Статистика" },
  ],
  company: [
    { href: "/about",   label: "О платформе" },
    { href: "/how",     label: "Как это работает" },
    { href: "/contact", label: "Контакты" },
    { href: "/help",    label: "Помощь" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt="OKnautic"
                width={120}
                height={49}
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-navy-200 leading-relaxed max-w-56">
              B2B/B2C маркетплейс для профессионалов яхтенной отрасли. Запчасти, оборудование, снаряжение.
            </p>
          </div>

          {/* Buyers */}
          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-3">Покупателям</h3>
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
            <h3 className="font-display font-semibold text-white text-sm mb-3">Продавцам</h3>
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

          {/* Company */}
          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-3">Компания</h3>
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
        </div>

        {/* Categories */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-3">
            Категории
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/catalog/${cat.slug}`}
                className="text-xs text-navy-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-navy-400">
            © 2026 OKnautic. Все права защищены.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-navy-400 hover:text-white transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="text-xs text-navy-400 hover:text-white transition-colors">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
