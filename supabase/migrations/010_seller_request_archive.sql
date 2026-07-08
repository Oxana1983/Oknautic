create table public.seller_request_archive (
  seller_id        uuid not null references public.profiles(id) on delete cascade,
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  archived_at      timestamptz not null default now(),
  primary key (seller_id, quote_request_id)
);

create index seller_request_archive_seller_idx on public.seller_request_archive(seller_id);

alter table public.seller_request_archive enable row level security;

create policy "seller_request_archive: own"
  on public.seller_request_archive for all
  using  (seller_id = auth.uid())
  with check (seller_id = auth.uid());
