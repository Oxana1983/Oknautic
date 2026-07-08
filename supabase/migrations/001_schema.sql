-- ============================================================
-- OKnautic — Migration 001: Core Schema
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- USERS & SELLERS
-- ============================================================

create table public.profiles (
  id                          uuid primary key references auth.users(id) on delete cascade,
  role                        text not null default 'customer'
                                check (role in ('customer', 'seller', 'admin')),
  first_name                  text,
  last_name                   text,
  phone                       text,
  email_notifications_offers  boolean not null default true,
  email_notifications_quotes  boolean not null default true,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create table public.seller_companies (
  id                  uuid primary key default gen_random_uuid(),
  seller_id           uuid not null unique references public.profiles(id) on delete cascade,
  company_name        text not null,
  legal_name          text,
  tax_id              text,
  registration_number text,
  bank_name           text,
  bank_account        text,
  bank_bic            text,
  contact_phone       text,
  contact_email       text,
  website             text,
  logo_url            text,
  is_approved         boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.seller_stores (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  address     text not null,
  city        text,
  country     text,
  postal_code text,
  phone       text,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- CATALOG
-- ============================================================

create table public.brands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  logo_url    text,
  description text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Self-referencing hierarchy (2 levels: category → subcategory)
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid references public.categories(id) on delete set null,
  name          text not null,
  slug          text not null unique,
  description   text,
  show_in_menu  boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- Which brand+category combos each seller covers → drives quote routing
create table public.seller_brand_categories (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  brand_id    uuid not null references public.brands(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (seller_id, brand_id, category_id)
);

create table public.products (
  id          uuid primary key default gen_random_uuid(),
  brand_id    uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,  -- leaf category
  sku         text not null,
  name        text not null,
  description text,
  avg_price   numeric(12, 2),
  currency    text not null default 'EUR',
  photos      text[] not null default '{}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (brand_id, sku)
);
create index products_brand_idx    on public.products(brand_id);
create index products_category_idx on public.products(category_id);
create index products_sku_trgm     on public.products using gin(sku gin_trgm_ops);
create index products_name_trgm    on public.products using gin(name gin_trgm_ops);

-- Dynamic variation type definitions per product (Size, Color, Diameter, …)
create table public.product_variant_types (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  name        text not null,
  sort_order  int not null default 0
);

-- Each combination of attribute values has its own SKU
create table public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  sku         text not null,
  attributes  jsonb not null default '{}',   -- {"Size":"L","Color":"Red","Diameter":"50mm"}
  photos      text[] not null default '{}',  -- overrides product photos when non-empty
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (product_id, sku)
);
create index product_variants_product_idx on public.product_variants(product_id);

-- ============================================================
-- CART (anonymous + authenticated)
-- ============================================================

-- Anonymous carts live entirely in localStorage on the client.
-- A DB cart is created only when the user is authenticated.
-- On login the app reads localStorage, inserts cart_items here, then clears localStorage.
create table public.carts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index carts_user_idx on public.carts(user_id); -- one active cart per user

create table public.cart_items (
  id                  uuid primary key default gen_random_uuid(),
  cart_id             uuid not null references public.carts(id) on delete cascade,
  product_id          uuid not null references public.products(id) on delete cascade,
  variant_id          uuid references public.product_variants(id) on delete set null,
  quantity            int not null default 1 check (quantity > 0),
  additional_comment  text,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- RFQ FLOW
-- ============================================================

-- NOTE: accepted_offer_id FK added below via ALTER TABLE (circular reference with offers)
create table public.quote_requests (
  id                  uuid primary key default gen_random_uuid(),
  customer_id         uuid not null references public.profiles(id) on delete cascade,

  -- Live references (nullable — product/variant may be deleted later)
  product_id          uuid references public.products(id) on delete set null,
  variant_id          uuid references public.product_variants(id) on delete set null,

  -- ── Snapshots at creation time ──────────────────────────────
  -- Kept so routing & display survive product edits/deletions
  sku                 text not null,
  product_name        text not null,
  product_photo       text,
  variant_attrs       jsonb,           -- {"Size":"L","Color":"Red"}
  brand_id            uuid,            -- snapshot; used by seller RLS routing
  category_id         uuid,            -- snapshot; used by seller RLS routing
  -- ────────────────────────────────────────────────────────────

  quantity            int not null check (quantity > 0),
  delivery_location   text not null,
  delivery_datetime   timestamptz not null,
  additional_comment  text,

  status              text not null default 'in_progress'
                        check (status in ('in_progress', 'closed', 'deleted', 'completed')),

  -- Set when buyer presses "Order" (DEFERRABLE FK added below)
  accepted_offer_id   uuid,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index qr_customer_idx   on public.quote_requests(customer_id);
create index qr_status_idx     on public.quote_requests(status);
create index qr_product_idx    on public.quote_requests(product_id);
-- Routing index: seller_brand_categories JOIN uses these two columns
create index qr_routing_idx    on public.quote_requests(brand_id, category_id);

create table public.offers (
  id                  uuid primary key default gen_random_uuid(),
  quote_request_id    uuid not null references public.quote_requests(id) on delete cascade,
  seller_id           uuid not null references public.profiles(id) on delete cascade,

  price_per_unit      numeric(12, 2) not null check (price_per_unit > 0),
  currency            text not null default 'EUR',
  available_quantity  int not null check (available_quantity > 0),
  delivery_datetime   timestamptz not null,

  -- ── Tickers ─────────────────────────────────────────────────
  is_new              boolean not null default true,    -- new vs used
  warranty_months     int not null default 0,           -- 0 = no warranty
  includes_vat        boolean not null default false,
  allows_pickup       boolean not null default false,
  in_stock            boolean not null default true,
  payment_cash        boolean not null default false,
  payment_cashless    boolean not null default true,
  -- ────────────────────────────────────────────────────────────

  comment             text,

  -- Lifecycle
  status              text not null default 'pending'
                        check (status in ('pending', 'accepted', 'withdrawn')),
  -- 'pending'   — active, awaiting buyer decision
  -- 'accepted'  — buyer pressed "Order" on this offer (set by trigger on quote_requests)
  -- 'withdrawn' — seller removed it from their view (soft delete)
  --
  -- NOTE: there is intentionally NO 'rejected' or 'lost' status.
  -- When a buyer accepts offer X (quote_requests.accepted_offer_id = X.id),
  -- all OTHER pending offers for that quote remain 'pending'.
  -- The UI computes the "not selected" label as:
  --   offer.status = 'pending'
  --   AND quote_request.status = 'completed'
  --   AND offer.id != quote_request.accepted_offer_id
  -- This avoids a bulk UPDATE of all sibling offers on every Order click.

  is_read_by_customer boolean not null default false,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (quote_request_id, seller_id)
);
create index offers_qr_idx     on public.offers(quote_request_id);
create index offers_seller_idx on public.offers(seller_id);
create index offers_status_idx on public.offers(status);

-- Resolve circular FK (DEFERRABLE so both rows can be set in same transaction)
alter table public.quote_requests
  add constraint fk_qr_accepted_offer
  foreign key (accepted_offer_id)
  references public.offers(id)
  on delete set null
  deferrable initially deferred;

-- ============================================================
-- CHAT
-- ============================================================

create table public.chats (
  id                uuid primary key default gen_random_uuid(),
  quote_request_id  uuid not null references public.quote_requests(id) on delete cascade,
  customer_id       uuid not null references public.profiles(id) on delete cascade,
  seller_id         uuid not null references public.profiles(id) on delete cascade,
  last_message_at   timestamptz,
  unread_customer   int not null default 0,
  unread_seller     int not null default 0,
  created_at        timestamptz not null default now(),
  unique (quote_request_id, seller_id)
);
create index chats_customer_idx on public.chats(customer_id);
create index chats_seller_idx   on public.chats(seller_id);

create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  chat_id     uuid not null references public.chats(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index messages_chat_idx on public.messages(chat_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  type          text not null check (type in (
                  'new_offer',       -- → customer: seller submitted offer
                  'offer_updated',   -- → customer: seller edited offer
                  'new_quote',       -- → seller:   new quote request arrived
                  'quote_updated',   -- → seller:   buyer updated request
                  'new_message',     -- → either:   new chat message
                  'order_confirmed'  -- → seller:   buyer pressed "Order"
                )),
  reference_id  uuid,   -- quote_request_id or chat_id
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);
create index notifications_user_unread_idx on public.notifications(user_id, is_read);

-- ============================================================
-- CONTENT & CONFIGURATION
-- ============================================================

create table public.assistance_topics (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  sort_order  int not null default 0,
  is_active   boolean not null default true
);

create table public.assistance_requests (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  topic_id    uuid references public.assistance_topics(id) on delete set null,
  message     text not null,
  is_resolved boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Slugs: insurance | agents | for-sellers | privacy-policy | personal-data-agreement
create table public.pages (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  content          text,
  meta_description text,
  external_link    text,   -- e.g. insurance calculator URL
  updated_at       timestamptz not null default now()
);

create table public.homepage_slides (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subtitle    text,
  image_url   text,
  link_page   text,   -- page slug OR 'personal-assistance'
  button_text text not null default 'More details',
  sort_order  int not null default 0,
  is_active   boolean not null default true
);

create table public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- IMPORT LAYER (architectural placeholder — is_active = false)
-- ============================================================

create table public.import_sources (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  brand_id          uuid references public.brands(id) on delete set null,
  source_type       text not null check (source_type in ('api', 'csv', 'xml', 'ftp')),
  connection_config jsonb not null default '{}',
  field_mapping     jsonb not null default '{}',
  last_sync_at      timestamptz,
  last_sync_status  text,
  last_sync_count   int,
  is_active         boolean not null default false,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on Supabase auth signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Generic updated_at stamper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger trg_seller_companies_updated_at
  before update on public.seller_companies
  for each row execute procedure public.set_updated_at();

create trigger trg_products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

create trigger trg_quote_requests_updated_at
  before update on public.quote_requests
  for each row execute procedure public.set_updated_at();

create trigger trg_offers_updated_at
  before update on public.offers
  for each row execute procedure public.set_updated_at();

-- Update chat counters on new message
create or replace function public.handle_new_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_chat public.chats%rowtype;
begin
  select * into v_chat from public.chats where id = new.chat_id;
  update public.chats set
    last_message_at = new.created_at,
    unread_customer = case
      when new.sender_id = v_chat.seller_id   then unread_customer + 1
      else unread_customer end,
    unread_seller   = case
      when new.sender_id = v_chat.customer_id then unread_seller + 1
      else unread_seller end
  where id = new.chat_id;
  return new;
end;
$$;

create trigger trg_on_message_created
  after insert on public.messages
  for each row execute procedure public.handle_new_message();

-- When buyer accepts an offer:
--   • set offer.status = 'accepted'
--   • set quote_request.status = 'completed'
--   • set all other pending offers for same request to no status change
--     (buyer may still chat with others; only accepted offer is marked)
create or replace function public.handle_offer_accepted()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.accepted_offer_id is not null
     and new.accepted_offer_id is distinct from old.accepted_offer_id then
    update public.offers
    set status = 'accepted', updated_at = now()
    where id = new.accepted_offer_id;
  end if;
  return new;
end;
$$;

create trigger trg_on_offer_accepted
  after update of accepted_offer_id on public.quote_requests
  for each row execute procedure public.handle_offer_accepted();
