import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { Anchor, LifeBuoy, Package, Send, ShoppingCart, Star, Zap } from "lucide-react";

export default function DesignSystem() {
  return (
    <main className="min-h-screen bg-sand-50 px-4 py-10 font-sans">
      <div className="max-w-3xl mx-auto space-y-14">

        {/* Header */}
        <div>
          <p className="text-xs font-mono text-teal-600 tracking-widest uppercase mb-2">
            OKnautic Design System
          </p>
          <h1 className="font-display text-3xl font-bold text-navy-900">
            Компонентная витрина
          </h1>
          <p className="mt-2 text-navy-400 text-sm">
            Stage 2 — токены, типографика, UI-примитивы
          </p>
        </div>

        {/* Colors */}
        <section className="space-y-4">
          <SectionTitle>Цветовая палитра</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Swatch name="Navy 900" hex="#0b1e35" className="bg-navy-900" light />
            <Swatch name="Navy 700" hex="#163d6e" className="bg-navy-700" light />
            <Swatch name="Navy 500" hex="#2563a6" className="bg-navy-500" light />
            <Swatch name="Navy 200" hex="#b0cfe9" className="bg-navy-200" />
            <Swatch name="Navy 100" hex="#d8e9f5" className="bg-navy-100" />
            <Swatch name="Navy 50"  hex="#edf4fb" className="bg-navy-50" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Swatch name="Teal 600" hex="#0d7a7a" className="bg-teal-600" light />
            <Swatch name="Teal 400" hex="#23b5b5" className="bg-teal-400" light />
            <Swatch name="Teal 100" hex="#ccf4f4" className="bg-teal-100" />
            <Swatch name="Gold 500" hex="#b8850e" className="bg-gold-500" light />
            <Swatch name="Gold 300" hex="#e8c547" className="bg-gold-300" />
            <Swatch name="Sand 100" hex="#f5f0e8" className="bg-sand-100" />
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-4">
          <SectionTitle>Типографика</SectionTitle>
          <Card>
            <CardBody className="space-y-5">
              <div>
                <Label>Display / Space Grotesk</Label>
                <p className="font-display text-3xl font-bold text-navy-900 leading-tight mt-1">
                  Морское снаряжение
                </p>
                <p className="font-display text-xl font-semibold text-navy-800 mt-1">
                  Профессиональные запчасти
                </p>
                <p className="font-display text-base font-medium text-navy-700 mt-1">
                  Найдите нужную деталь
                </p>
              </div>
              <div>
                <Label>Body / Inter</Label>
                <p className="text-sm text-navy-700 leading-relaxed mt-1">
                  Мы объединяем поставщиков морского оборудования и профессионалов
                  яхтенной отрасли. Запросите коммерческое предложение прямо сейчас.
                </p>
                <p className="text-xs text-navy-400 mt-2">
                  Вспомогательный текст — подписи, хинты, метаданные
                </p>
              </div>
              <div>
                <Label>Mono / JetBrains Mono</Label>
                <div className="flex flex-wrap gap-3 mt-1">
                  <span className="font-mono text-sm bg-navy-50 border border-navy-200 px-2 py-1 rounded text-navy-700">
                    SKU: GRM-ECHOMAP-94SV
                  </span>
                  <span className="font-mono text-sm bg-navy-50 border border-navy-200 px-2 py-1 rounded text-teal-700">
                    € 1 249.00
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <SectionTitle>Кнопки</SectionTitle>
          <Card>
            <CardBody className="space-y-6">
              <div>
                <Label>Варианты</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Button variant="primary">Запросить цену</Button>
                  <Button variant="secondary">Добавить в запрос</Button>
                  <Button variant="outline">Фильтры</Button>
                  <Button variant="ghost">Отмена</Button>
                  <Button variant="danger">Удалить</Button>
                </div>
              </div>
              <div>
                <Label>Размеры</Label>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Button size="sm">Маленькая</Button>
                  <Button size="md">Средняя</Button>
                  <Button size="lg">Большая</Button>
                </div>
              </div>
              <div>
                <Label>С иконками</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Button variant="primary">
                    <ShoppingCart size={16} />
                    В корзину
                  </Button>
                  <Button variant="secondary">
                    <Send size={16} />
                    Отправить запрос
                  </Button>
                  <Button variant="outline">
                    <Star size={16} />
                    В избранное
                  </Button>
                </div>
              </div>
              <div>
                <Label>Состояния</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Button loading>Загрузка...</Button>
                  <Button disabled>Недоступно</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <SectionTitle>Бейджи и статусы</SectionTitle>
          <Card>
            <CardBody className="space-y-4">
              <div>
                <Label>Бренды и категории</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="brand">Garmin</Badge>
                  <Badge variant="brand">Raymarine</Badge>
                  <Badge variant="brand">Lewmar</Badge>
                  <Badge variant="category">Навигация</Badge>
                  <Badge variant="category">Якорное снаряжение</Badge>
                  <Badge variant="category">Электрика</Badge>
                </div>
              </div>
              <div>
                <Label>Статусы заявок (RFQ)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="pending">Ожидает предложений</Badge>
                  <Badge variant="accepted">Принято</Badge>
                  <Badge variant="withdrawn">Отозвано</Badge>
                  <Badge variant="success">Завершено</Badge>
                  <Badge variant="warning">Требует действия</Badge>
                  <Badge variant="danger">Просрочено</Badge>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Inputs */}
        <section className="space-y-4">
          <SectionTitle>Форма</SectionTitle>
          <Card>
            <CardBody className="space-y-5">
              <Input label="Поиск запчасти" placeholder="Название, SKU или бренд..." />
              <Input label="Email" placeholder="supplier@company.com" hint="Мы не передаём адрес третьим лицам" />
              <Input label="Количество" prefix="шт." placeholder="1" hint="Минимум 1" />
              <Input
                label="Инвентарный номер"
                placeholder="GRM-ECHOMAP-94SV"
                error="Артикул не найден в базе"
              />
              <Input label="Недоступное поле" placeholder="Только чтение" disabled />
            </CardBody>
          </Card>
        </section>

        {/* Product Card */}
        <section className="space-y-4">
          <SectionTitle>Карточка товара</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-navy-100 flex items-center justify-center">
                <Anchor className="text-navy-300" size={40} />
              </div>
              <CardBody className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="brand">Garmin</Badge>
                  <Badge variant="category">Навигация</Badge>
                </div>
                <h3 className="font-display font-semibold text-navy-900 leading-snug">
                  Garmin ECHOMAP UHD2 94sv
                </h3>
                <p className="text-xs font-mono text-navy-400">SKU: GRM-ECHOMAP-94SV</p>
                <p className="text-xs text-navy-500 leading-relaxed">
                  Картплоттер с ультра чёткими HD-изображениями, встроенный трансдьюсер 50/200kHz.
                </p>
              </CardBody>
              <CardFooter className="flex items-center justify-between gap-2">
                <Button variant="primary" size="sm">
                  <ShoppingCart size={14} />
                  Запросить цену
                </Button>
                <Button variant="ghost" size="sm">
                  <Star size={14} />
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden">
              <div className="aspect-video bg-teal-50 flex items-center justify-center">
                <LifeBuoy className="text-teal-300" size={40} />
              </div>
              <CardBody className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="brand">Plastimo</Badge>
                  <Badge variant="category">Безопасность</Badge>
                </div>
                <h3 className="font-display font-semibold text-navy-900 leading-snug">
                  Спасательный жилет ISO 150N Pro
                </h3>
                <p className="text-xs font-mono text-navy-400">SKU: PLT-LJ150-PRO-XL</p>
                <p className="text-xs text-navy-500 leading-relaxed">
                  Автоматический жилет 150N, ISO 12402-3, одобрен для морских переходов.
                </p>
              </CardBody>
              <CardFooter className="flex items-center justify-between gap-2">
                <Button variant="primary" size="sm">
                  <ShoppingCart size={14} />
                  Запросить цену
                </Button>
                <Button variant="ghost" size="sm">
                  <Star size={14} />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* RFQ Card */}
        <section className="space-y-4">
          <SectionTitle>Карточка запроса (RFQ)</SectionTitle>
          <Card>
            <CardHeader className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-mono text-navy-400">RFQ-2026-0042</p>
                <h3 className="font-display font-semibold text-navy-900">
                  Garmin ECHOMAP UHD2 94sv
                </h3>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <Badge variant="brand">Garmin</Badge>
                  <Badge variant="category">Навигация</Badge>
                </div>
              </div>
              <Badge variant="pending">Ожидает предложений</Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <Row label="Количество" value="2 шт." />
                <Row label="Бренд" value="Garmin" />
                <Row label="SKU" value="GRM-ECHOMAP-94SV" mono />
                <Row label="Запросов цены" value="3" />
              </div>
              <p className="text-xs text-navy-400 border-t border-navy-100 pt-3">
                Создан 05.07.2026 · Истекает 12.07.2026
              </p>
            </CardBody>
            <CardFooter className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm">
                <Package size={14} />
                Смотреть предложения (3)
              </Button>
              <Button variant="ghost" size="sm">Отозвать запрос</Button>
            </CardFooter>
          </Card>
        </section>

        {/* Offer Card */}
        <section className="space-y-4">
          <SectionTitle>Предложение продавца (Offer)</SectionTitle>
          <Card>
            <CardHeader className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display font-semibold text-navy-900">
                  Marine Pro Supplies
                </p>
                <p className="text-xs text-navy-400 mt-0.5">Ответ получен 06.07.2026</p>
              </div>
              <Badge variant="pending">На рассмотрении</Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <Row label="Цена за единицу" value="€ 1 249.00" mono />
                <Row label="Количество" value="2 шт." />
                <Row label="Срок доставки" value="14 дней" />
                <Row label="Гарантия" value="24 месяца" />
              </div>
              <p className="text-xs text-navy-500 bg-navy-50 rounded-lg p-3 leading-relaxed">
                Товар в наличии на складе в Барселоне. Возможна доставка по всему Средиземноморью.
                Включена 2-летняя гарантия производителя.
              </p>
            </CardBody>
            <CardFooter className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm">
                <Zap size={14} />
                Принять предложение
              </Button>
              <Button variant="ghost" size="sm">Написать продавцу</Button>
            </CardFooter>
          </Card>
        </section>

        <footer className="text-center text-xs text-navy-300 font-mono pb-6">
          OKnautic Design System v0.1 · Stage 2
        </footer>
      </div>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-lg font-semibold text-navy-800 flex items-center gap-2">
      <span className="inline-block h-px flex-1 bg-navy-100" />
      {children}
    </h2>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-navy-400 uppercase tracking-wider font-display">
      {children}
    </p>
  );
}

function Swatch({
  name,
  hex,
  className,
  light = false,
}: {
  name: string;
  hex: string;
  className: string;
  light?: boolean;
}) {
  return (
    <div className={`${className} rounded-lg p-3 flex flex-col justify-end min-h-16`}>
      <p className={`text-xs font-display font-medium ${light ? "text-white/80" : "text-navy-600"}`}>
        {name}
      </p>
      <p className={`text-xs font-mono ${light ? "text-white/60" : "text-navy-400"}`}>{hex}</p>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-navy-400">{label}</p>
      <p className={`text-sm text-navy-800 font-medium mt-0.5 ${mono ? "font-mono" : "font-display"}`}>
        {value}
      </p>
    </div>
  );
}
