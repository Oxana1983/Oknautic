-- Backfill: add products/brands from seller_inventory that are not yet in catalog
-- Runs once; safe to re-run (uses INSERT ... ON CONFLICT DO NOTHING)

-- 1. Insert missing brands (deduplicated by slug)
insert into public.brands (name, slug, is_active)
select distinct
  si.brand,
  lower(regexp_replace(si.brand, '[^a-zA-Z0-9]+', '-', 'g')) as slug,
  true
from public.seller_inventory si
where si.brand is not null
  and not exists (
    select 1 from public.brands b where b.name = si.brand
  )
on conflict (slug) do nothing;

-- 2. Insert missing products, linked to brand where possible
insert into public.products (sku, name, brand_id, avg_price, currency, is_active)
select distinct on (si.sku)
  si.sku,
  si.product_name,
  b.id as brand_id,
  si.price as avg_price,
  coalesce(si.currency, 'EUR'),
  true
from public.seller_inventory si
left join public.brands b on b.name = si.brand
where not exists (
  select 1 from public.products p where p.sku = si.sku
)
on conflict do nothing;

-- 3. Link seller_inventory rows to newly created products
update public.seller_inventory si
set product_id = p.id
from public.products p
where p.sku = si.sku
  and si.product_id is null;
