-- Tracks when seller last checked their accepted offers (for bell notification).
alter table public.profiles
  add column if not exists accepted_read_at timestamptz;
