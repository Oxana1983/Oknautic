import Link from "next/link";
import { ArrowRight, Bell, Upload, Handshake, Target, ShieldCheck, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Стать продавцом — OKnautic",
  description: "Получайте целевые запросы от покупателей яхтенных запчастей. Только те заявки, которые соответствуют вашему складу.",
};

const BENEFITS = [
  {
    icon: <Target size={22} className="text-teal-600" />,
    title: "Только целевые запросы",
    desc: "Система направляет вам запросы исключительно по товарам из вашего склада. Никакого спама, никаких нерелевантных обращений.",
  },
  {
    icon: <Bell size={22} className="text-teal-600" />,
    title: "Мгновенные уведомления",
    desc: "Получайте оповещения о новых запросах в реальном времени прямо в личном кабинете.",
  },
  {
    icon: <Upload size={22} className="text-teal-600" />,
    title: "Простая загрузка склада",
    desc: "Загрузите Excel-таблицу с вашим ассортиментом или добавляйте позиции вручную — всё за несколько минут.",
  },
  {
    icon: <Handshake size={22} className="text-teal-600" />,
    title: "Прямой контакт с покупателем",
    desc: "Если покупатель выбрал ваше предложение, вы получаете его контакты для прямого оформления сделки.",
  },
  {
    icon: <ShieldCheck size={22} className="text-teal-600" />,
    title: "Контроль условий",
    desc: "Вы сами задаёте цену, срок доставки, условия гарантии и способы оплаты в каждом предложении.",
  },
  {
    icon: <BarChart3 size={22} className="text-teal-600" />,
    title: "Управление предложениями",
    desc: "Отслеживайте статусы всех ваших предложений в одном месте, редактируйте или отзывайте их в любой момент.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Зарегистрируйтесь как продавец",
    desc: "Создайте аккаунт, выбрав тип «Продавец». Это бесплатно и занимает меньше минуты.",
  },
  {
    n: "2",
    title: "Загрузите ваш склад",
    desc: "Добавьте товары вручную или загрузите Excel-файл со списком позиций, ценами и остатками.",
  },
  {
    n: "3",
    title: "Получайте и отвечайте на запросы",
    desc: "Система автоматически направит вам запросы покупателей по вашим товарам. Отправьте предложение — и закройте сделку.",
  },
];

export default function SellersPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-mono text-teal-400 uppercase tracking-widest mb-4">Для поставщиков</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-5">
              Продавайте морские запчасти без лишних усилий
            </h1>
            <p className="text-navy-200 text-lg leading-relaxed mb-8">
              Подключитесь к платформе OKnautic и получайте целевые заявки от покупателей — только по товарам, которые есть у вас на складе.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register?role=seller">
                  Начать бесплатно
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/how" className="text-white border-white/30 hover:bg-white/10">
                  Как это работает
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white border-b border-navy-100">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-10 text-center">Три шага до первой сделки</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-4">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center font-display font-bold text-teal-600 text-sm">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-navy-900 text-sm mb-1.5">{s.title}</h3>
                  <p className="text-xs text-navy-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-10 text-center">Почему OKnautic</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="p-5 rounded-xl bg-white border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                {b.icon}
              </div>
              <h3 className="font-display font-semibold text-navy-900 text-sm mb-2">{b.title}</h3>
              <p className="text-xs text-navy-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-14">
        <div className="bg-navy-900 rounded-2xl px-6 py-12 text-center">
          <h3 className="font-display text-2xl font-bold text-white mb-3">
            Готовы начать получать заявки?
          </h3>
          <p className="text-navy-300 text-sm mb-8 max-w-md mx-auto">
            Регистрация бесплатна. Загрузите склад и начните получать запросы уже сегодня.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/register?role=seller">
              Зарегистрироваться как продавец
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
