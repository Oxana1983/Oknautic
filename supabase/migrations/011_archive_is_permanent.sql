alter table public.seller_request_archive
  add column if not exists is_permanent boolean not null default false;
