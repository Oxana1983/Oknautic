-- Add is_new (new vs used) and photo_url to seller_inventory
alter table public.seller_inventory
  add column if not exists is_new     boolean not null default true,
  add column if not exists photo_url  text;
