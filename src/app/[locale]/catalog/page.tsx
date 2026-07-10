import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { CatalogFilters } from "@/components/catalog/filters";
import { CatalogView } from "@/components/catalog/catalog-view";
import type { Product } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ brand?: string; q?: string }>;
};

async function fetchProducts(brandSlug?: string, q?: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, sku, name, description, photos, brand:brands!brand_id(name, slug), cat:categories!category_id(slug)")
    .eq("is_active", true)
    .order("name");

  let products: Product[] = (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    brand: p.brand?.name ?? "",
    category: p.cat?.slug ?? "",
    description: p.description ?? "",
    image: p.photos?.[0] ?? undefined,
    images: p.photos ?? [],
    hasVariants: false,
  }));

  if (brandSlug) {
    products = products.filter((p) => p.brand.toLowerCase() === brandSlug.toLowerCase());
  }
  if (q) {
    const ql = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(ql) ||
        p.sku.toLowerCase().includes(ql) ||
        p.brand.toLowerCase().includes(ql)
    );
  }
  return products;
}

const PHONE = "38269962980";
const WA_URL = `https://wa.me/${PHONE}`;
const TG_URL = "https://t.me/OksanaTivat";

async function NotFound({ query }: { query?: string }) {
  const t = await getTranslations("catalog");

  const text = query
    ? `Здравствуйте! Не могу найти товар в каталоге: "${query}". Можете помочь?`
    : "Здравствуйте! Не могу найти нужный товар в каталоге. Можете помочь?";

  return (
    <div className="text-center py-16 px-4">
      <p className="text-5xl mb-4">🔍</p>
      <p className="font-display font-semibold text-navy-800 text-lg mb-2">{t("noResults")}</p>
      {query ? (
        <p className="text-sm text-navy-400 mb-8">
          {t("noResultsQuery", { query })}
        </p>
      ) : (
        <p className="text-sm text-navy-400 mb-8">{t("noResultsHint")}</p>
      )}

      {query && (
        <div className="max-w-sm mx-auto bg-white border border-navy-100 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-semibold text-navy-800 mb-1">{t("notFoundTitle")}</p>
          <p className="text-xs text-navy-400 mb-5">{t("notFoundDesc")}</p>
          <div className="flex flex-col gap-3">
            <a
              href={`${WA_URL}?text=${encodeURIComponent(text)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 h-10 rounded-xl bg-[#25D366] text-white text-sm font-medium hover:bg-[#1fba59] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href={`${TG_URL}?text=${encodeURIComponent(text)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 h-10 rounded-xl bg-[#229ED9] text-white text-sm font-medium hover:bg-[#1a8bbf] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.820 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.800-.943-.602-.332-1.133.337-1.79.23-.23 4.238-3.882 4.316-4.21.01-.036.018-.17-.063-.241-.08-.071-.196-.046-.282-.028-.12.027-2.044 1.298-5.774 3.81-.547.377-1.042.56-1.485.552-.49-.01-1.43-.277-2.13-.504-.858-.28-1.54-.428-1.48-.904.032-.25.367-.505 1.003-.767 3.93-1.713 6.55-2.842 7.862-3.389 3.743-1.553 4.52-1.822 5.02-1.83z"/>
              </svg>
              Telegram
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function CatalogPage({ searchParams }: Props) {
  const t = await getTranslations("catalog");
  const params = await searchParams;
  const products = await fetchProducts(params.brand, params.q);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy-900">{t("title")}</h1>
        <p className="text-sm text-navy-400 mt-0.5">{t("count", { count: products.length })}</p>
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block w-52 shrink-0">
          <Suspense>
            <CatalogFilters />
          </Suspense>
        </div>
        {products.length === 0 ? (
          <NotFound query={params.q} />
        ) : (
          <CatalogView products={products} />
        )}
      </div>
    </div>
  );
}
