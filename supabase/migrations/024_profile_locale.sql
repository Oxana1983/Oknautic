-- Preferred UI language, used for transactional emails to this user.
-- Updated by the app whenever a signed-in user browses in a locale.
alter table public.profiles
  add column if not exists locale text
    check (locale in ('ru', 'en', 'it'));
