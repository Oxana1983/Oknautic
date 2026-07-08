create table if not exists public.buyer_request_archive (
  id                uuid primary key default gen_random_uuid(),
  buyer_id          uuid not null references auth.users(id) on delete cascade,
  quote_request_id  uuid not null references public.quote_requests(id) on delete cascade,
  is_permanent      boolean not null default false,
  created_at        timestamptz not null default now(),
  unique (buyer_id, quote_request_id)
);

alter table public.buyer_request_archive enable row level security;

create policy "Buyer manages own archive"
  on public.buyer_request_archive
  for all
  using (buyer_id = auth.uid())
  with check (buyer_id = auth.uid());
