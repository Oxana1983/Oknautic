import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { slug: "navigation",    label: "Навигация",              emoji: "🧭" },
  { slug: "anchoring",     label: "Якорное снаряжение",     emoji: "⚓" },
  { slug: "deck-hardware", label: "Палубное оборудование",  emoji: "🔩" },
  { slug: "mooring",       label: "Швартовка",              emoji: "🪢" },
  { slug: "engines",       label: "Двигатели",              emoji: "⚙️" },
  { slug: "electrical",    label: "Электрика",              emoji: "⚡" },
  { slug: "safety",        label: "Безопасность",           emoji: "🦺" },
  { slug: "rigging",       label: "Такелаж",                emoji: "🎿" },
];

const BRANDS = ["Garmin", "Raymarine", "Maxwell", "Lewmar", "Vetus", "Plastimo", "Navico", "Furuno"];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-xl">
            <Badge variant="category" className="mb-4">
              Маркетплейс морских запчастей
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-4">
              Найдите нужную деталь. Получите лучшую цену.
            </h1>
            <p className="text-navy-200 text-lg leading-relaxed mb-8">
              Запросите коммерческое предложение у проверенных поставщиков. Сравните цены, выберите лучшее.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/catalog">
                  <Package size={18} />
                  Смотреть каталог
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/how" className="text-white border-white/30 hover:bg-white/10">
                  Как это работает
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-navy-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid sm:grid-cols-3 gap-6">
            <Step
              icon={<Package size={22} className="text-teal-600" />}
              step="1"
              title="Добавьте в корзину"
              desc="Найдите нужные запчасти в каталоге и добавьте в список запроса."
            />
            <Step
              icon={<Send size={22} className="text-teal-600" />}
              step="2"
              title="Отправьте запрос"
              desc="Мы автоматически направим запрос релевантным поставщикам."
            />
            <Step
              icon={<ShieldCheck size={22} className="text-teal-600" />}
              step="3"
              title="Выберите лучшее"
              desc="Сравните предложения по цене, срокам и условиям гарантии."
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">Категории</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalog/${cat.slug}`}
              className="group flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-xl bg-white border border-navy-100 hover:border-teal-300 hover:shadow-md transition-all text-center"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-sm font-medium font-display text-navy-700 group-hover:text-navy-900 leading-tight">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="border-t border-navy-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <p className="text-xs font-medium text-navy-400 uppercase tracking-wider text-center mb-6">
            Популярные бренды
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {BRANDS.map((brand) => (
              <Link
                key={brand}
                href={`/catalog?brand=${brand.toLowerCase()}`}
                className="px-4 py-2 rounded-lg bg-navy-50 border border-navy-200 text-sm font-display font-medium text-navy-700 hover:bg-navy-100 hover:border-navy-300 transition-colors"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for sellers */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-navy-900 rounded-2xl px-6 py-10 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image
                src="/logo.png"
                alt="OKnautic"
                width={90}
                height={36}
                className="h-7 w-auto brightness-0 invert opacity-70"
                loading="eager"
              />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-1">
              Получайте целевые запросы
            </h3>
            <p className="text-navy-300 text-sm max-w-md">
              Мы направляем запросы только тем поставщикам, у которых есть нужный бренд и категория. Никакого спама.
            </p>
          </div>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/sellers">
              Стать продавцом
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Step({
  icon,
  step,
  title,
  desc,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs font-mono text-teal-600 mb-0.5">Шаг {step}</p>
        <h3 className="font-display font-semibold text-navy-900 text-sm mb-1">{title}</h3>
        <p className="text-xs text-navy-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
