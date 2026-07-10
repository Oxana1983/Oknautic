import Link from "next/link";
import { ArrowRight, Search, Send, CheckCircle2, Package, Upload, Bell, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Как это работает — OKnautic",
  description: "Платформа для поиска морских запчастей и получения коммерческих предложений от проверенных поставщиков.",
};

type StepProps = {
  number: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
};

function Step({ number, icon, title, desc }: StepProps) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 flex flex-col items-center">
        <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
          {icon}
        </div>
        <div className="w-px flex-1 bg-navy-100 mt-3" />
      </div>
      <div className="pb-8">
        <p className="text-[11px] font-mono text-teal-500 mb-1">Шаг {number}</p>
        <h3 className="font-display font-semibold text-navy-900 text-base mb-1.5">{title}</h3>
        <p className="text-sm text-navy-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="mb-3">
          <span className="text-xs text-navy-400 uppercase tracking-widest">Платформа </span>
          <span className="text-sm font-extrabold text-navy-700" style={{ fontFamily: "var(--font-brand)" }}>OKnautic</span>
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
          Как это работает
        </h1>
        <p className="text-navy-500 text-lg max-w-xl mx-auto leading-relaxed">
          Простой способ найти морские запчасти и получить лучшую цену от проверенных поставщиков.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-16 gap-y-2">
        {/* Buyers */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-navy-900 flex items-center justify-center text-white text-xs font-bold">П</div>
            <h2 className="font-display font-bold text-navy-900 text-lg">Для покупателей</h2>
          </div>

          <Step
            number="1"
            icon={<Search size={20} />}
            title="Найдите запчасть"
            desc="Введите название или SKU в поиске каталога. Если товара нет — свяжитесь с нашим консультантом через WhatsApp или Telegram."
          />
          <Step
            number="2"
            icon={<Send size={20} />}
            title="Отправьте запрос"
            desc="Укажите нужное количество и контактные данные. Система автоматически направит запрос поставщикам, у которых есть этот товар на складе."
          />
          <Step
            number="3"
            icon={<CheckCircle2 size={20} />}
            title="Выберите лучшее предложение"
            desc="Вы получите коммерческие предложения с ценами, сроками доставки и условиями гарантии. Выберите наиболее подходящее и свяжитесь с продавцом."
          />

          <div className="mt-2 ml-16">
            <Button variant="primary" size="md" asChild>
              <Link href="/catalog">
                <Package size={16} />
                Смотреть каталог
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Divider on mobile */}
        <div className="sm:hidden border-t border-navy-100 my-8" />

        {/* Sellers */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white text-xs font-bold">П</div>
            <h2 className="font-display font-bold text-navy-900 text-lg">Для продавцов</h2>
          </div>

          <Step
            number="1"
            icon={<Upload size={20} />}
            title="Загрузите склад"
            desc="Добавьте товары в ваш склад вручную или загрузите таблицу Excel со списком позиций, ценами и количеством."
          />
          <Step
            number="2"
            icon={<Bell size={20} />}
            title="Получайте целевые запросы"
            desc="Система направляет вам только те запросы, где покупатель ищет товары из вашего склада. Никакого спама и нерелевантных обращений."
          />
          <Step
            number="3"
            icon={<Handshake size={20} />}
            title="Отправьте предложение и закройте сделку"
            desc="Ответьте на запрос ценой, сроком и условиями. Если покупатель выберет ваше предложение — вы получите его контакты для оформления сделки."
          />

          <div className="mt-2 ml-16">
            <Button variant="outline" size="md" asChild>
              <Link href="/register?role=seller">
                Стать продавцом
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 border-t border-navy-100 pt-12">
        <h2 className="font-display font-bold text-navy-900 text-xl mb-8 text-center">Частые вопросы</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              q: "Сколько стоит использование платформы?",
              a: "Для покупателей — полностью бесплатно. Для продавцов — регистрация бесплатна, условия сотрудничества обсуждаются индивидуально.",
            },
            {
              q: "Как быстро придут предложения?",
              a: "Обычно в течение нескольких часов рабочего дня. Скорость зависит от наличия товара у поставщиков.",
            },
            {
              q: "Можно ли запросить товар, которого нет в каталоге?",
              a: "Да. Если товара нет — напишите нам в WhatsApp или Telegram, и мы поможем найти нужную позицию.",
            },
            {
              q: "Как продавец узнаёт о новом запросе?",
              a: "Через уведомления в личном кабинете. Запрос поступает только тем продавцам, у которых этот товар есть на складе.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="p-5 rounded-xl bg-navy-50 border border-navy-100">
              <p className="font-display font-semibold text-navy-800 text-sm mb-2">{q}</p>
              <p className="text-sm text-navy-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 bg-navy-900 rounded-2xl px-6 py-10 text-center">
        <h3 className="font-display text-xl font-bold text-white mb-2">Готовы начать?</h3>
        <p className="text-navy-300 text-sm mb-6">Найдите нужную запчасть или начните получать целевые заказы.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="secondary" size="md" asChild>
            <Link href="/catalog">
              <Package size={16} />
              В каталог
            </Link>
          </Button>
          <Button variant="outline" size="md" asChild>
            <Link href="/register" className="text-white border-white/30 hover:bg-white/10">
              Зарегистрироваться
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
