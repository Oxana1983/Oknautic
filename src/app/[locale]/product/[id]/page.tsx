import { notFound } from "next/navigation";
import Image from "next/image";
import { ChevronRight, Share2, Star, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductCard } from "@/components/catalog/product-card";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import { CATEGORIES } from "@/lib/mock-data";
import type { Product } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string; locale: string }> };

async function fetchProduct(id: string, locale: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("products")
    .select("id, sku, name, name_i18n, description, description_i18n, photos, brand:brands!brand_id(name, slug), cat:categories!category_id(slug)")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (!p) return null;
  return {
    id: (p as any).id,
    name: (p as any).name_i18n?.[locale] || (p as any).name,
    sku: (p as any).sku,
    brand: (p as any).brand?.name ?? "",
    category: (p as any).cat?.slug ?? "",
    description: (p as any).description_i18n?.[locale] || (p as any).description || "",
    image: (p as any).photos?.[0] ?? undefined,
    images: (p as any).photos?.length > 0 ? (p as any).photos : undefined,
    hasVariants: false,
  };
}

async function fetchRelated(categorySlug: string, excludeId: string, locale: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, sku, name, name_i18n, description, description_i18n, photos, brand:brands!brand_id(name, slug), cat:categories!category_id(slug)")
    .eq("is_active", true)
    .neq("id", excludeId)
    .limit(4);

  return (data ?? [])
    .filter((p: any) => p.cat?.slug === categorySlug)
    .map((p: any) => ({
      id: (p as any).id,
      name: (p as any).name_i18n?.[locale] || (p as any).name,
      sku: (p as any).sku,
      brand: (p as any).brand?.name ?? "",
      category: (p as any).cat?.slug ?? "",
      description: (p as any).description_i18n?.[locale] || (p as any).description || "",
      image: (p as any).photos?.[0] ?? undefined,
      images: (p as any).photos?.length > 0 ? (p as any).photos : undefined,
      hasVariants: false,
    }));
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("product");
  const tCat = await getTranslations("categories");
  const tRfq = await getTranslations("rfq");
  const tCatalog = await getTranslations("catalog");

  const product = await fetchProduct(id, locale);
  if (!product) notFound();

  const category = CATEGORIES.find((c) => c.slug === product.category);
  const related = await fetchRelated(product.category, product.id, locale);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-navy-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-navy-700 transition-colors">{tRfq("home")}</Link>
        <ChevronRight size={14} />
        <Link href="/catalog" className="hover:text-navy-700 transition-colors">{tCatalog("title")}</Link>
        <ChevronRight size={14} />
        {category && (
          <>
            <Link href={`/catalog/${category.slug}`} className="hover:text-navy-700 transition-colors">
              {tCat(category.slug as Parameters<typeof tCat>[0])}
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
                <span className="text-xs font-mono text-navy-400">{t("noPhoto")}</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.slice(0, 4).map((src, i) => (
                <div key={i} className={`w-16 h-16 rounded-lg border relative overflow-hidden cursor-pointer transition-colors ${i === 0 ? "border-navy-800" : "border-navy-100 hover:border-navy-400"}`}>
                  <Image src={src} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="brand">{product.brand}</Badge>
            {category && <Badge variant="category">{tCat(category.slug as Parameters<typeof tCat>[0])}</Badge>}
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-navy-900 leading-snug mb-1">{product.name}</h1>
            <p className="text-xs font-mono text-navy-400">SKU: {product.sku}</p>
          </div>

          <p className="text-sm text-navy-600 leading-relaxed">{product.description}</p>

          <AddToCartButton product={product} />

          <div className="flex gap-2 -mt-1">
            <button className="px-3 h-9 rounded-xl border border-navy-200 text-navy-400 hover:text-gold-500 hover:border-gold-300 hover:bg-gold-50 transition-colors">
              <Star size={16} />
            </button>
            <button className="px-3 h-9 rounded-xl border border-navy-200 text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition-colors">
              <Share2 size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <TrustItem icon={<ShieldCheck size={16} className="text-teal-600" />} label={t("trustedSuppliers")} />
            <TrustItem icon={<Truck size={16} className="text-teal-600" />} label={t("worldwideDelivery")} />
            <TrustItem icon={<MessageCircle size={16} className="text-teal-600" />} label={t("chatWithSeller")} />
          </div>

          <Card className="bg-navy-50 border-navy-100">
            <CardBody className="py-3 px-4">
              <p className="text-xs font-display font-semibold text-navy-700 mb-1">{t("howItWorksTitle")}</p>
              <p className="text-xs text-navy-500 leading-relaxed">
                {t("howItWorksDesc")}
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-navy-900">{t("relatedProducts")}</h2>
            {category && (
              <Link href={`/catalog/${category.slug}`} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                {t("viewAll")}
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
      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">{icon}</div>
      <p className="text-[10px] text-navy-500 leading-tight">{label}</p>
    </div>
  );
}
