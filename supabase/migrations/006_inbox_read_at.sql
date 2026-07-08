-- Add inbox_read_at to profiles so sellers can track unread incoming requests.
-- NULL = never checked (treat as 0 unread, not "all unread").
alter table public.profiles
  add column if not exists inbox_read_at timestamptz;
