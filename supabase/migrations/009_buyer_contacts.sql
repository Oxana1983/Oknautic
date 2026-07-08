-- Separate buyer contact fields so we can control visibility by offer status.
-- Before acceptance: seller sees only buyer_name.
-- After acceptance (their offer chosen): seller sees phone + email.
alter table public.quote_requests
  add column if not exists buyer_name  text,
  add column if not exists buyer_phone text,
  add column if not exists buyer_email text;
