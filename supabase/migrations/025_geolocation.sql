-- ============================================================
-- OKnautic — Migration 025: Geolocation
-- ============================================================
-- City-level locations only (city centroids from the geocoder):
--   • quote_requests — delivery city (buyer)
--   • offers         — where the seller ships from (snapshot)
--   • seller_inventory — coordinates for location_city/country
--   • profiles       — seller service radius
-- Sellers see distance to the buyer's city; the exact delivery
-- address stays hidden until acceptance (migration 022).
-- ============================================================

-- Great-circle distance in km; null if any coordinate is missing
create or replace function public.distance_km(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) returns double precision language sql immutable as $$
  select case
    when lat1 is null or lng1 is null or lat2 is null or lng2 is null then null
    else 2 * 6371 * asin(sqrt(
      power(sin(radians(lat2 - lat1) / 2), 2) +
      cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
    ))
  end
$$;

alter table public.quote_requests
  add column if not exists delivery_country text,
  add column if not exists delivery_lat double precision check (delivery_lat between -90 and 90),
  add column if not exists delivery_lng double precision check (delivery_lng between -180 and 180);

alter table public.offers
  add column if not exists location_city    text,
  add column if not exists location_country text,
  add column if not exists location_lat     double precision check (location_lat between -90 and 90),
  add column if not exists location_lng     double precision check (location_lng between -180 and 180);

alter table public.seller_inventory
  add column if not exists location_lat double precision check (location_lat between -90 and 90),
  add column if not exists location_lng double precision check (location_lng between -180 and 180);

-- null = no limit. Measured from the seller's profile location.
alter table public.profiles
  add column if not exists service_radius_km int check (service_radius_km between 1 and 20000);

-- ── Routing: respect the seller's service radius ─────────────
-- Requests the seller already offered on stay visible regardless.
-- No filtering when the seller has no radius/location or the
-- request has no coordinates (legacy rows).

create or replace function public.is_request_routed_to_me(p_qr_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select public.is_seller() and exists (
    select 1
    from public.quote_requests qr
    left join public.profiles me on me.id = auth.uid()
    where qr.id = p_qr_id
      and qr.status <> 'deleted'
      and (
        exists (
          select 1 from public.offers o
          where o.quote_request_id = qr.id
            and o.seller_id        = auth.uid()
        )
        or (
          (
            me.service_radius_km is null
            or public.distance_km(me.lat, me.lng, qr.delivery_lat, qr.delivery_lng) is null
            or public.distance_km(me.lat, me.lng, qr.delivery_lat, qr.delivery_lng) <= me.service_radius_km
          )
          and (
            exists (
              select 1 from public.seller_inventory si
              where si.seller_id = auth.uid()
                and (si.sku = qr.sku or (qr.product_id is not null and si.product_id = qr.product_id))
            )
            or exists (
              select 1 from public.seller_brand_categories sbc
              where sbc.seller_id   = auth.uid()
                and sbc.brand_id    = qr.brand_id
                and sbc.category_id = qr.category_id
            )
          )
        )
      )
  )
$$;

-- ── Seller RPC: add delivery country + distance ──────────────

drop function if exists public.get_seller_quote_requests(uuid[]);

create or replace function public.get_seller_quote_requests(p_ids uuid[] default null)
returns table (
  id                 uuid,
  product_id         uuid,
  sku                text,
  product_name       text,
  product_photo      text,
  variant_attrs      jsonb,
  brand_id           uuid,
  category_id        uuid,
  quantity           int,
  delivery_area      text,
  delivery_country   text,
  distance_km        double precision,
  delivery_address   text,
  delivery_datetime  timestamptz,
  additional_comment text,
  status             text,
  accepted_offer_id  uuid,
  created_at         timestamptz,
  updated_at         timestamptz,
  buyer_name         text,
  buyer_phone        text,
  buyer_email        text,
  is_legacy          boolean
)
language sql security definer stable set search_path = public as $$
  with me as (
    select lat, lng from public.profiles where id = auth.uid()
  ),
  mine as (
    select
      qr.*,
      exists (
        select 1 from public.offers o
        where o.id = qr.accepted_offer_id and o.seller_id = auth.uid()
      ) as accepted_mine,
      exists (
        select 1 from public.chats c
        where c.quote_request_id = qr.id and c.seller_id = auth.uid()
      ) as has_chat
    from public.quote_requests qr
    where (p_ids is null or qr.id = any(p_ids))
      and public.is_request_routed_to_me(qr.id)
  )
  select
    m.id, m.product_id, m.sku, m.product_name, m.product_photo, m.variant_attrs,
    m.brand_id, m.category_id, m.quantity,
    m.delivery_area,
    m.delivery_country,
    public.distance_km((select lat from me), (select lng from me), m.delivery_lat, m.delivery_lng),
    case when m.accepted_mine then m.delivery_address end,
    m.delivery_datetime,
    -- legacy rows (buyer_name is null) store "Name · Phone · Comment"
    case when m.accepted_mine or m.buyer_name is not null then m.additional_comment end,
    m.status, m.accepted_offer_id, m.created_at, m.updated_at,
    case when m.accepted_mine or m.has_chat then m.buyer_name end,
    case when m.accepted_mine then m.buyer_phone end,
    case when m.accepted_mine then m.buyer_email end,
    m.buyer_name is null
  from mine m
  order by m.created_at desc
$$;

revoke execute on function public.get_seller_quote_requests(uuid[]) from public, anon;
grant  execute on function public.get_seller_quote_requests(uuid[]) to authenticated;
