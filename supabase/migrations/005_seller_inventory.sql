-- ============================================================
-- OKnautic — Migration 005: Seller Inventory
-- ============================================================
-- Sellers upload their stock: SKU + qty + location.
-- RFQ routing now has two levels:
--   Level 1 (priority): seller has this exact SKU in stock
--   Level 2 (fallback): seller covers brand+category
-- ============================================================

create table public.seller_inventory (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references public.profiles(id) on delete cascade,

  -- Product reference (set by background job matching SKU → products table)
  product_id    uuid references public.products(id) on delete set null,

  -- Raw data from seller's upload — always kept
  sku           text not null,
  product_name  text not null,
  brand         text,

  -- Stock
  quantity      int not null default 0 check (quantity >= 0),
  price         numeric(12, 2),
  currency      text not null default 'EUR',

  -- Location (which port / city this stock is at)
  location_city    text,
  location_country text,

  is_available  boolean not null default true,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  unique (seller_id, sku)
);

create index seller_inventory_seller_idx  on public.seller_inventory(seller_id);
create index seller_inventory_sku_idx     on public.seller_inventory(sku);
create index seller_inventory_product_idx on public.seller_inventory(product_id);
-- Fast lookup: "who has this SKU in stock right now?"
create index seller_inventory_instock_idx on public.seller_inventory(sku, seller_id)
  where quantity > 0 and is_available = true;

-- updated_at trigger
create trigger trg_seller_inventory_updated_at
  before update on public.seller_inventory
  for each row execute procedure public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────

alter table public.seller_inventory enable row level security;

-- Seller manages their own rows
create policy "seller_inventory: own all"
  on public.seller_inventory for all
  using  (seller_id = auth.uid() or public.is_admin())
  with check (seller_id = auth.uid() or public.is_admin());

-- ── Update quote_requests seller routing ─────────────────────
-- Drop the old single-level policy and replace with two-level:
--   1. Exact SKU match in seller_inventory (in-stock priority)
--   2. Brand+category coverage via seller_brand_categories (fallback)

drop policy if exists "quote_requests: seller routing" on public.quote_requests;

create policy "quote_requests: seller routing"
  on public.quote_requests for select
  using (
    status != 'deleted'
    and public.is_seller()
    and (
      -- Level 1: seller has this exact SKU in stock
      exists (
        select 1 from public.seller_inventory si
        where  si.seller_id   = auth.uid()
          and  si.sku         = quote_requests.sku
          and  si.quantity    > 0
          and  si.is_available = true
      )
      or
      -- Level 2: seller covers this brand+category
      exists (
        select 1 from public.seller_brand_categories sbc
        where  sbc.seller_id   = auth.uid()
          and  sbc.brand_id    = quote_requests.brand_id
          and  sbc.category_id = quote_requests.category_id
      )
    )
  );
