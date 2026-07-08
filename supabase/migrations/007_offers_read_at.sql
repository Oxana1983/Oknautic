alter table public.profiles
  add column if not exists offers_read_at timestamptz;
