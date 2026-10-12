-- ============================================================
-- OKnautic — Migration 023: Security fixes
-- ============================================================
-- 1. profiles      — block self-promotion to/from 'admin' (direct
--                    UPDATE and signup metadata)
-- 2. quote_requests — validate accepted_offer_id (must be a pending
--                    offer of THIS request, request still open)
-- 3. offers        — sellers can't self-accept, can't edit accepted
--                    offers, can only offer on requests routed to them
-- 4. get_seller_quote_requests — restore SKU/product routing lost in
--                    022, add buyer contacts (masked until acceptance),
--                    optional id filter
-- 5. insurance_leads — insert can't claim another user's id
-- ============================================================

-- Roles that bypass the guards below: migrations, service-role API
-- calls, and SECURITY DEFINER functions owned by postgres.
create or replace function public.is_privileged_writer()
returns boolean language sql stable as $$
  select current_user in ('postgres', 'service_role', 'supabase_admin')
$$;

-- ── 1. PROFILES: role protection ─────────────────────────────
-- customer <-> seller switching stays self-service (switchRole);
-- anything touching 'admin' requires a privileged writer.

create or replace function public.protect_profile_role()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role
     and (new.role = 'admin' or old.role = 'admin')
     and not public.is_privileged_writer() then
    raise exception 'role change not allowed';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
  before update of role on public.profiles
  for each row execute procedure public.protect_profile_role();

-- Signup metadata is user-controlled: only customer/seller allowed.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, first_name, last_name)
  values (
    new.id,
    case
      when new.raw_user_meta_data->>'role' in ('customer', 'seller')
        then new.raw_user_meta_data->>'role'
      else 'customer'
    end,
    nullif(trim(new.raw_user_meta_data->>'first_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'last_name'),  '')
  );
  return new;
end;
$$;

-- ── 2. QUOTE REQUESTS: validate acceptance ───────────────────

-- Runs as the caller (not definer) so is_privileged_writer() sees who
-- issued the UPDATE. The buyer can read pending offers on own requests.
create or replace function public.validate_accepted_offer()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.accepted_offer_id is distinct from old.accepted_offer_id
     and not public.is_privileged_writer() then
    if old.accepted_offer_id is not null or old.status <> 'in_progress' then
      raise exception 'request is not open for acceptance';
    end if;
    if new.accepted_offer_id is not null and not exists (
      select 1 from public.offers o
      where o.id = new.accepted_offer_id
        and o.quote_request_id = new.id
        and o.status = 'pending'
    ) then
      raise exception 'invalid accepted_offer_id';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_accepted_offer on public.quote_requests;
create trigger trg_validate_accepted_offer
  before update of accepted_offer_id on public.quote_requests
  for each row execute procedure public.validate_accepted_offer();

-- Defence in depth: only ever mark an offer of the same request.
create or replace function public.handle_offer_accepted()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.accepted_offer_id is not null
     and new.accepted_offer_id is distinct from old.accepted_offer_id then
    update public.offers
    set status = 'accepted', updated_at = now()
    where id = new.accepted_offer_id
      and quote_request_id = new.id;
  end if;
  return new;
end;
$$;

-- ── 4 (helper). Seller routing ───────────────────────────────
-- A request is routed to the current seller if any of:
--   • seller has the SKU / product in inventory
--   • seller covers the brand+category
--   • seller already made an offer on it (keeps history visible)

create or replace function public.is_request_routed_to_me(p_qr_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select public.is_seller() and exists (
    select 1 from public.quote_requests qr
    where qr.id = p_qr_id
      and qr.status <> 'deleted'
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
        or exists (
          select 1 from public.offers o
          where o.quote_request_id = qr.id
            and o.seller_id        = auth.uid()
        )
      )
  )
$$;

revoke execute on function public.is_request_routed_to_me(uuid) from public, anon;
grant  execute on function public.is_request_routed_to_me(uuid) to authenticated;

-- ── 3. OFFERS: write guard ───────────────────────────────────

-- Requested quantity if the request is open and routed to the caller,
-- else null. Definer: sellers have no direct SELECT on quote_requests.
create or replace function public.offerable_request_quantity(p_qr_id uuid)
returns int language sql security definer stable set search_path = public as $$
  select qr.quantity from public.quote_requests qr
  where qr.id = p_qr_id
    and qr.status = 'in_progress'
    and public.is_request_routed_to_me(qr.id)
$$;

revoke execute on function public.offerable_request_quantity(uuid) from public, anon;
grant  execute on function public.offerable_request_quantity(uuid) to authenticated;

-- Runs as the caller. handle_offer_accepted (definer, owned by postgres)
-- passes is_privileged_writer(), so acceptance via the buyer still works.
create or replace function public.guard_offer_write()
returns trigger language plpgsql set search_path = public as $$
declare
  v_qty int;
begin
  if public.is_privileged_writer() then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status = 'accepted' then
      raise exception 'accepted offer cannot be changed';
    end if;
    if new.quote_request_id <> old.quote_request_id or new.seller_id <> old.seller_id then
      raise exception 'offer owner/request cannot be changed';
    end if;
    if new.status = 'accepted' then
      raise exception 'offer cannot be self-accepted';
    end if;
    if new.status = 'withdrawn' then
      return new;
    end if;
  elsif new.status <> 'pending' then
    raise exception 'new offer must be pending';
  end if;

  v_qty := public.offerable_request_quantity(new.quote_request_id);
  if v_qty is null then
    raise exception 'request is not available for offers';
  end if;
  if new.available_quantity > v_qty then
    raise exception 'available_quantity exceeds requested quantity';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_offer_write on public.offers;
create trigger trg_guard_offer_write
  before insert or update on public.offers
  for each row execute procedure public.guard_offer_write();

-- ── 4. Seller read RPC ───────────────────────────────────────
-- Return type changes, so drop + recreate.

drop function if exists public.get_seller_quote_requests();

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
  with mine as (
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
    m.brand_id, m.category_id, m.quantity, m.delivery_area,
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

-- ── 5. INSURANCE LEADS ───────────────────────────────────────

drop policy if exists "insurance_leads_insert" on public.insurance_leads;
create policy "insurance_leads_insert" on public.insurance_leads
  for insert with check (user_id is null or user_id = auth.uid());
