-- Eatable v2 / Phase 2A: Supabase Auth profile + cloud favorites
-- Run ONCE on a NEW Eatable Supabase project in SQL Editor.
-- Later migrations will create the normalized public recipe catalog and moderated submissions.
-- Never place Supabase secret/service_role keys in browser code.

begin;

create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Home cook' check (char_length(display_name) between 1 and 100),
  locale text not null default 'en' check (locale in ('en','it','ar')),
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now()
);

-- Trigger runs with its creator's privileges, not the public website's privileges.
-- Keep this function in a non-exposed schema and fix its search_path.
create or replace function private.handle_new_eatable_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, locale)
  values (
    new.id,
    coalesce(nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 100), ''), 'Home cook'),
    case when new.raw_user_meta_data ->> 'locale' in ('en','it','ar')
      then new.raw_user_meta_data ->> 'locale' else 'en' end
  );
  return new;
end;
$$;

create trigger eatable_profile_on_signup
  after insert on auth.users
  for each row execute function private.handle_new_eatable_user();

-- This temporary slug-based favorites model supports the 18 demo recipes.
-- A later migration will reference canonical recipe UUIDs when the live catalog launches.
create table public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_slug text not null check (char_length(recipe_slug) between 1 and 120 and recipe_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_slug)
);

create index user_favorites_user_created_idx
  on public.user_favorites (user_id, created_at desc);

-- Deny all default Data API privileges, then grant only what each client needs.
revoke all on public.profiles from anon, authenticated;
revoke all on public.user_favorites from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, locale) on public.profiles to authenticated;
grant select, insert, delete on public.user_favorites to authenticated;

alter table public.profiles enable row level security;
alter table public.user_favorites enable row level security;

create policy "Read only own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Edit only own safe profile fields"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Read only own favorites"
  on public.user_favorites for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Save only own favorites"
  on public.user_favorites for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Delete only own favorites"
  on public.user_favorites for delete to authenticated
  using (user_id = (select auth.uid()));

commit;
