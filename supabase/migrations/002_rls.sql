-- ============================================================
-- OKnautic — Migration 002: Row Level Security
-- ============================================================
-- Reading guide
-- ─────────────
-- Each table section explains WHO can see/write WHAT and WHY.
-- The most complex policy is "quote_requests: seller routing"
-- which is annotated in detail below.
-- ============================================================

alter table public.profiles                enable row level security;
alter table public.seller_companies        enable row level security;
alter table public.seller_stores           enable row level security;
alter table public.seller_brand_categories enable row level security;
alter table public.brands                  enable row level security;
alter table public.categories              enable row level security;
alter table public.products                enable row level security;
alter table public.product_variant_types   enable row level security;
alter table public.product_variants        enable row level security;
alter table public.carts                   enable row level security;
alter table public.cart_items              enable row level security;
alter table public.quote_requests          enable row level security;
alter table public.offers                  enable row level security;
alter table public.chats                   enable row level security;
alter table public.messages                enable row level security;
alter table public.notifications           enable row level security;
alter table public.assistance_topics       enable row level security;
alter table public.assistance_requests     enable row level security;
alter table public.pages                   enable row level security;
alter table public.homepage_slides         enable row level security;
alter table public.newsletter_subscribers  enable row level security;
alter table public.import_sources          enable row level security;

-- ── Helpers ──────────────────────────────────────────────────────────────────

create or replace function public.current_user_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Shorthand used in policies below
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select current_user_role() = 'admin'
$$;

create or replace function public.is_seller()
returns boolean language sql security definer stable as $$
  select current_user_role() = 'seller'
$$;

-- ── PROFILES ─────────────────────────────────────────────────────────────────
-- Customers and sellers can read their own row.
-- Chat participants can read each other's first_name / last_name (for display).
-- Admins can read all.

create policy "profiles: own read"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles: chat counterpart read"
  on public.profiles for select
  using (
    exists (
      select 1 from public.chats
      where  (customer_id = auth.uid() and seller_id   = profiles.id)
          or (seller_id   = auth.uid() and customer_id = profiles.id)
    )
  );

create policy "profiles: own update"
  on public.profiles for update
  using  (id = auth.uid())
  with check (id = auth.uid());

-- ── SELLER COMPANIES ─────────────────────────────────────────────────────────
-- Approved companies are visible to all (needed for logo display in offers).
-- Seller manages only their own row.

create policy "seller_companies: public read approved"
  on public.seller_companies for select
  using (is_approved = true);

create policy "seller_companies: own read (incl unapproved)"
  on public.seller_companies for select
  using (seller_id = auth.uid() or public.is_admin());

create policy "seller_companies: own write"
  on public.seller_companies for all
  using  (seller_id = auth.uid() or public.is_admin())
  with check (seller_id = auth.uid() or public.is_admin());

-- ── SELLER STORES ────────────────────────────────────────────────────────────

create policy "seller_stores: own read/write"
  on public.seller_stores for all
  using  (seller_id = auth.uid() or public.is_admin())
  with check (seller_id = auth.uid() or public.is_admin());

-- ── SELLER BRAND CATEGORIES ──────────────────────────────────────────────────

create policy "seller_brand_categories: own read/write"
  on public.seller_brand_categories for all
  using  (seller_id = auth.uid() or public.is_admin())
  with check (seller_id = auth.uid() or public.is_admin());

-- ── CATALOG (public read, admin write) ───────────────────────────────────────

create policy "brands: public read"       on public.brands for select using (true);
create policy "brands: admin write"       on public.brands for all using (public.is_admin()) with check (public.is_admin());

create policy "categories: public read"   on public.categories for select using (true);
create policy "categories: admin write"   on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "products: public read"     on public.products for select using (is_active = true);
create policy "products: admin write"     on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "pvt: public read"          on public.product_variant_types for select using (true);
create policy "pvt: admin write"          on public.product_variant_types for all using (public.is_admin()) with check (public.is_admin());

create policy "pv: public read"           on public.product_variants for select using (is_active = true);
create policy "pv: admin write"           on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

-- ── CARTS ────────────────────────────────────────────────────────────────────
-- Anonymous carts are stored in localStorage only (no DB row).
-- A DB cart exists only for authenticated users.
-- Merge flow: on login, client reads localStorage → inserts cart_items → clears localStorage.

create policy "carts: own all"
  on public.carts for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "cart_items: own all"
  on public.cart_items for all
  using (
    exists (
      select 1 from public.carts c
      where  c.id      = cart_items.cart_id
        and  c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.carts c
      where  c.id      = cart_items.cart_id
        and  c.user_id = auth.uid()
    )
  );

-- ── QUOTE REQUESTS ───────────────────────────────────────────────────────────
-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ SELLER ROUTING POLICY — how sellers see quotes                          │
-- │                                                                         │
-- │ At quote creation the app snapshots brand_id and category_id from the   │
-- │ product into the quote_requests row itself. This means the RLS filter   │
-- │ is a single-table lookup — no join to products needed.                  │
-- │                                                                         │
-- │ A seller sees a quote if ALL of these are true:                         │
-- │   1. The quote is not deleted (status != 'deleted')                     │
-- │   2. The seller has a seller_brand_categories row where                 │
-- │      brand_id    = quote_requests.brand_id   (snapshot)                 │
-- │      category_id = quote_requests.category_id (snapshot)               │
-- │                                                                         │
-- │ Consequence: if a seller removes a brand/category from their profile    │
-- │ they immediately stop seeing new and existing quotes for that combo.    │
-- └─────────────────────────────────────────────────────────────────────────┘

create policy "quote_requests: customer own"
  on public.quote_requests for all
  using  (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create policy "quote_requests: seller routing"
  on public.quote_requests for select          -- sellers can only READ, not edit
  using (
    status != 'deleted'                        -- hide buyer-deleted quotes
    and public.is_seller()
    and exists (
      select 1
      from   public.seller_brand_categories sbc
      where  sbc.seller_id   = auth.uid()
        and  sbc.brand_id    = quote_requests.brand_id    -- snapshot
        and  sbc.category_id = quote_requests.category_id -- snapshot
    )
  );

create policy "quote_requests: admin all"
  on public.quote_requests for all
  using (public.is_admin());

-- ── OFFERS ───────────────────────────────────────────────────────────────────
-- Customer: sees all non-withdrawn offers on their quotes.
-- Seller: full control of their own offers.
-- Seller cannot see other sellers' offers for the same quote (confidentiality).

create policy "offers: customer read own-quote offers"
  on public.offers for select
  using (
    status != 'withdrawn'    -- seller-removed offers disappear from buyer view
    and exists (
      select 1 from public.quote_requests qr
      where  qr.id          = offers.quote_request_id
        and  qr.customer_id = auth.uid()
    )
  );

create policy "offers: seller own"
  on public.offers for all
  using  (seller_id = auth.uid())
  with check (seller_id = auth.uid());

create policy "offers: admin all"
  on public.offers for all
  using (public.is_admin());

-- ── CHATS ────────────────────────────────────────────────────────────────────
-- Only customer can create a chat (intitiator rule from spec §6.11).
-- Both participants can read.

create policy "chats: participant read"
  on public.chats for select
  using (customer_id = auth.uid() or seller_id = auth.uid());

create policy "chats: customer create only"
  on public.chats for insert
  with check (
    customer_id = auth.uid()
    and public.current_user_role() = 'customer'
  );

-- Chats are not updated via direct RLS; counters are updated by trigger (security definer)
create policy "chats: admin all"
  on public.chats for all
  using (public.is_admin());

-- ── MESSAGES ─────────────────────────────────────────────────────────────────
-- Both chat participants can read and send.

create policy "messages: participant read"
  on public.messages for select
  using (
    exists (
      select 1 from public.chats
      where  id = messages.chat_id
        and (customer_id = auth.uid() or seller_id = auth.uid())
    )
  );

create policy "messages: participant send"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.chats
      where  id = messages.chat_id
        and (customer_id = auth.uid() or seller_id = auth.uid())
    )
  );

-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

create policy "notifications: own"
  on public.notifications for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── CONTENT ──────────────────────────────────────────────────────────────────

create policy "assistance_topics: public read"
  on public.assistance_topics for select using (is_active = true);
create policy "assistance_topics: admin write"
  on public.assistance_topics for all using (public.is_admin());

-- Anonymous form submission allowed
create policy "assistance_requests: public insert"
  on public.assistance_requests for insert with check (true);
create policy "assistance_requests: admin manage"
  on public.assistance_requests for all using (public.is_admin());

create policy "pages: public read"
  on public.pages for select using (true);
create policy "pages: admin write"
  on public.pages for all using (public.is_admin());

create policy "homepage_slides: public read"
  on public.homepage_slides for select using (is_active = true);
create policy "homepage_slides: admin write"
  on public.homepage_slides for all using (public.is_admin());

-- Anyone can subscribe; only admin manages the list
create policy "newsletter: public insert"
  on public.newsletter_subscribers for insert with check (true);
create policy "newsletter: admin manage"
  on public.newsletter_subscribers for all using (public.is_admin());

create policy "import_sources: admin only"
  on public.import_sources for all using (public.is_admin());
