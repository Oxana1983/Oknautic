-- Fix trigger: copy first_name / last_name from auth metadata on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    nullif(trim(new.raw_user_meta_data->>'first_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'last_name'),  '')
  );
  return new;
end;
$$;

-- Backfill existing profiles that have no name yet
update public.profiles p
set
  first_name = nullif(trim(u.raw_user_meta_data->>'first_name'), ''),
  last_name  = nullif(trim(u.raw_user_meta_data->>'last_name'),  '')
from auth.users u
where p.id = u.id
  and p.first_name is null
  and p.last_name  is null;
