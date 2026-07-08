import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Share2, Star, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { getProduct, getCategory, filterProducts } from "@/lib/mock-data";
import { ProductCard } from "@/components/catalog/product-card";

type Props = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const category = getCategory(product.category);
  const related = filterProducts({ category: product.category })
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-navy-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-navy-700 transition-colors">Главная</Link>
        <ChevronRight size={14} />
        <Link href="/catalog" className="hover:text-navy-700 transition-colors">Каталог</Link>
        <ChevronRight size={14} />
        {category && (
          <>
            <Link href={`/catalog/${category.slug}`} className="hover:text-navy-700 transition-colors">
              {category.label}
            </Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="text-navy-700 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Image */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl border border-navy-100 relative overflow-hidden bg-navy-50">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-navy-300">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                <span className="text-xs font-mono text-navy-400">фото отсутствует</span>
              </div>
            )}
            {product.hasVariants && (
              <span className="absolute top-4 left-4 text-xs font-mono font-medium bg-gold-100 text-gold-700 px-2 py-1 rounded-lg z-10">
                Доступны варианты
              </span>
            )}
          </div>
          {/* Thumbnails */}
          {product.images && (
            <div className="flex gap-2">
              {product.images.map((src, i) => (
                <div
                  key={i}
                  className={`w-16 h-16 rounded-lg border relative overflow-hidden cursor-pointer transition-colors ${
                    i === 0 ? "border-navy-800" : "border-navy-100 hover:border-navy-400"
                  }`}
                >
                  <Image src={src} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="brand">{product.brand}</Badge>
            {category && <Badge variant="category">{category.label}</Badge>}
          </div>

          {/* Title */}
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-900 leading-snug mb-1">
              {product.name}
            </h1>
            <p className="text-xs font-mono text-navy-400">SKU: {product.sku}</p>
          </div>

          {/* Description */}
          <p className="text-sm text-navy-600 leading-relaxed">{product.description}</p>

          {/* CTA with variants */}
          <AddToCartButton product={product} variantGroups={product.variantGroups} />

          {/* Wishlist / Share */}
          <div className="flex gap-2 -mt-1">
            <button className="px-3 h-9 rounded-xl border border-navy-200 text-navy-400 hover:text-gold-500 hover:border-gold-300 hover:bg-gold-50 transition-colors">
              <Star size={16} />
            </button>
            <button className="px-3 h-9 rounded-xl border border-navy-200 text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition-colors">
              <Share2 size={16} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <TrustItem icon={<ShieldCheck size={16} className="text-teal-600" />} label="Проверенные поставщики" />
            <TrustItem icon={<Truck size={16} className="text-teal-600" />} label="Доставка по всему миру" />
            <TrustItem icon={<MessageCircle size={16} className="text-teal-600" />} label="Чат с продавцом" />
          </div>

          {/* RFQ info */}
          <Card className="bg-navy-50 border-navy-100">
            <CardBody className="py-3 px-4">
              <p className="text-xs font-display font-semibold text-navy-700 mb-1">Как работает запрос цены?</p>
              <p className="text-xs text-navy-500 leading-relaxed">
                Нажмите «Запросить цену» — товар попадёт в корзину. После отправки запроса поставщики пришлют предложения с ценой и сроками. Вы выбираете лучшее.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Specs */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-lg font-bold text-navy-900 mb-4">Характеристики</h2>
          <Card>
            <CardBody className="p-0">
              <dl className="divide-y divide-navy-50">
                {Object.entries(product.specs).map(([key, value], i) => (
                  <div
                    key={key}
                    className={`flex items-center px-5 py-3 gap-4 ${i % 2 === 0 ? "bg-white" : "bg-navy-50/50"}`}
                  >
                    <dt className="text-sm text-navy-500 w-40 shrink-0">{key}</dt>
                    <dd className="text-sm font-medium text-navy-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-navy-900">Похожие товары</h2>
            {category && (
              <Link href={`/catalog/${category.slug}`} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                Смотреть все →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-[10px] text-navy-500 leading-tight">{label}</p>
    </div>
  );
}
