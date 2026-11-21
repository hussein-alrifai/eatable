-- Eatable future Supabase/PostgreSQL database blueprint
-- NOT connected to the static prototype. Apply after reviewing in your own Supabase project.
-- Initial application uses only public curated demo data. This schema prepares for accounts + moderation.
-- IMPORTANT: Never expose a Supabase service_role key in the browser.

create extension if not exists pgcrypto;

create type public.recipe_status as enum ('draft','pending','changes_requested','published','rejected','archived');
create type public.review_status as enum ('visible','hidden');
create type public.user_role as enum ('member','admin');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Home cook',
 locale text not null default 'en' check (locale in ('en','it','ar')),
 role public.user_role not null default 'member',
 created_at timestamptz not null default now()
);

-- Creating profiles from auth.users, never trusting a client-supplied role.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, locale)
  values (new.id, coalesce(nullif(left(new.raw_user_meta_data ->> 'display_name', 100), ''),'Home cook'), 'en');
  return new;
end; $$;
create trigger create_profile_after_signup after insert on auth.users
 for each row execute function public.handle_new_user();

create table public.cuisines (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique,
 country_code text,
 created_at timestamptz not null default now()
);
create table public.cuisine_translations (
 cuisine_id uuid not null references public.cuisines(id) on delete cascade,
 locale text not null check (locale in ('en','it','ar')),
 name text not null,
 primary key (cuisine_id, locale)
);
create table public.ingredients (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique,
 default_unit text not null default 'g',
 created_at timestamptz not null default now()
);
create table public.ingredient_translations (
 ingredient_id uuid not null references public.ingredients(id) on delete cascade,
 locale text not null check (locale in ('en','it','ar')),
 name text not null,
 aliases text[] not null default '{}',
 primary key (ingredient_id, locale)
);

create table public.recipes (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique,
 author_id uuid references public.profiles(id) on delete set null,
 cuisine_id uuid references public.cuisines(id),
 status public.recipe_status not null default 'draft',
 dietary_labels text[] not null default '{}',
 category text not null default 'main',
 difficulty text not null default 'easy' check (difficulty in ('easy','medium','hard')),
 prep_minutes integer not null default 0 check (prep_minutes >= 0),
 cook_minutes integer not null default 0 check (cook_minutes >= 0),
 servings integer not null default 4 check (servings between 1 and 100),
 cover_photo_url text,
 submitted_at timestamptz,
 published_at timestamptz,
 moderation_note text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index recipes_status_published_idx on public.recipes(status,published_at desc);
create index recipes_cuisine_idx on public.recipes(cuisine_id);
create index recipes_author_idx on public.recipes(author_id);

create table public.recipe_translations (
 recipe_id uuid not null references public.recipes(id) on delete cascade,
 locale text not null check (locale in ('en','it','ar')),
 title text not null,
 description text,
 cultural_story text,
 primary key (recipe_id,locale)
);
create table public.recipe_ingredients (
 id uuid primary key default gen_random_uuid(),
 recipe_id uuid not null references public.recipes(id) on delete cascade,
 ingredient_id uuid not null references public.ingredients(id),
 quantity numeric(12,3) check (quantity is null or quantity >= 0),
 unit text not null default 'g',
 is_optional boolean not null default false,
 position integer not null default 0,
 notes text
);
create index recipe_ingredients_recipe_idx on public.recipe_ingredients(recipe_id,position);
create index recipe_ingredients_ingredient_idx on public.recipe_ingredients(ingredient_id);
create table public.recipe_steps (
 id uuid primary key default gen_random_uuid(),
 recipe_id uuid not null references public.recipes(id) on delete cascade,
 position integer not null check(position>=1),
 duration_seconds integer check(duration_seconds>=0),
 photo_url text,
 unique(recipe_id,position)
);
create table public.recipe_step_translations (
 step_id uuid not null references public.recipe_steps(id) on delete cascade,
 locale text not null check (locale in ('en','it','ar')),
 instruction text not null,
 primary key(step_id,locale)
);

create table public.favorites (
 user_id uuid not null references public.profiles(id) on delete cascade,
 recipe_id uuid not null references public.recipes(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,recipe_id)
);
create table public.pantry_items (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 ingredient_id uuid not null references public.ingredients(id),
 quantity numeric(12,3) check(quantity is null or quantity>=0),
 unit text,
 updated_at timestamptz not null default now(),
 unique(user_id,ingredient_id)
);
create table public.reviews (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 recipe_id uuid not null references public.recipes(id) on delete cascade,
 rating integer not null check(rating between 1 and 5),
 comment text check(char_length(comment)<=2000),
 status public.review_status not null default 'visible',
 created_at timestamptz not null default now(),
 unique(user_id,recipe_id)
);

-- SECURITY FUNCTIONS: created by the database owner and bypass RLS for internal checks.
-- The UI must never determine who is admin.
create or replace function public.is_admin() returns boolean
 language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin');
 $$;
create or replace function public.can_view_recipe(target uuid) returns boolean
 language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.recipes r where r.id=target and
  (r.status='published' or (auth.uid() is not null and r.author_id=auth.uid()) or public.is_admin()));
 $$;
create or replace function public.can_edit_recipe(target uuid) returns boolean
 language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.recipes r where r.id=target and
 ((r.author_id=auth.uid() and r.status in ('draft','changes_requested')) or public.is_admin()));
 $$;

alter table public.profiles enable row level security;
create policy profiles_read on public.profiles for select to anon,authenticated using (true);
create policy profiles_update_self on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
-- Do not permit users to elevate their role through a profile UPDATE.
revoke update on public.profiles from authenticated;
grant update (display_name,locale) on public.profiles to authenticated;

alter table public.cuisines enable row level security;
create policy cuisines_read on public.cuisines for select to anon,authenticated using(true);
create policy cuisines_admin_all on public.cuisines for all to authenticated using(public.is_admin()) with check(public.is_admin());
alter table public.cuisine_translations enable row level security;
create policy cuisine_translations_read on public.cuisine_translations for select to anon,authenticated using(true);
create policy cuisine_translations_admin_all on public.cuisine_translations for all to authenticated using(public.is_admin()) with check(public.is_admin());
alter table public.ingredients enable row level security;
create policy ingredients_read on public.ingredients for select to anon,authenticated using(true);
create policy ingredients_admin_all on public.ingredients for all to authenticated using(public.is_admin()) with check(public.is_admin());
alter table public.ingredient_translations enable row level security;
create policy ingredient_translations_read on public.ingredient_translations for select to anon,authenticated using(true);
create policy ingredient_translations_admin_all on public.ingredient_translations for all to authenticated using(public.is_admin()) with check(public.is_admin());

alter table public.recipes enable row level security;
create policy recipes_read on public.recipes for select to anon,authenticated
 using(status='published' or (auth.uid() is not null and author_id=auth.uid()) or public.is_admin());
create policy recipes_create on public.recipes for insert to authenticated
 with check(author_id=auth.uid() and status='draft');
create policy recipes_update_owner on public.recipes for update to authenticated
 using((author_id=auth.uid() and status in('draft','changes_requested')) or public.is_admin())
 with check((author_id=auth.uid() and status in('draft','pending')) or public.is_admin());
-- Submission publication should be a trusted server/admin operation.
create policy recipes_admin_delete on public.recipes for delete to authenticated using(public.is_admin());

alter table public.recipe_translations enable row level security;
create policy recipe_translations_read on public.recipe_translations for select to anon,authenticated using(public.can_view_recipe(recipe_id));
create policy recipe_translations_write on public.recipe_translations for all to authenticated
 using(public.can_edit_recipe(recipe_id)) with check(public.can_edit_recipe(recipe_id));
alter table public.recipe_ingredients enable row level security;
create policy recipe_ingredients_read on public.recipe_ingredients for select to anon,authenticated using(public.can_view_recipe(recipe_id));
create policy recipe_ingredients_write on public.recipe_ingredients for all to authenticated
 using(public.can_edit_recipe(recipe_id)) with check(public.can_edit_recipe(recipe_id));
alter table public.recipe_steps enable row level security;
create policy recipe_steps_read on public.recipe_steps for select to anon,authenticated using(public.can_view_recipe(recipe_id));
create policy recipe_steps_write on public.recipe_steps for all to authenticated
 using(public.can_edit_recipe(recipe_id)) with check(public.can_edit_recipe(recipe_id));
alter table public.recipe_step_translations enable row level security;
create policy recipe_step_translations_read on public.recipe_step_translations for select to anon,authenticated
 using(exists(select 1 from public.recipe_steps s where s.id=step_id and public.can_view_recipe(s.recipe_id)));
create policy recipe_step_translations_write on public.recipe_step_translations for all to authenticated
 using(exists(select 1 from public.recipe_steps s where s.id=step_id and public.can_edit_recipe(s.recipe_id)))
 with check(exists(select 1 from public.recipe_steps s where s.id=step_id and public.can_edit_recipe(s.recipe_id)));

alter table public.favorites enable row level security;
create policy favorites_own on public.favorites for all to authenticated
 using(user_id=auth.uid()) with check(user_id=auth.uid() and public.can_view_recipe(recipe_id));
alter table public.pantry_items enable row level security;
create policy pantry_own on public.pantry_items for all to authenticated
 using(user_id=auth.uid()) with check(user_id=auth.uid());
alter table public.reviews enable row level security;
create policy reviews_read on public.reviews for select to anon,authenticated
 using((status='visible' and public.can_view_recipe(recipe_id)) or user_id=auth.uid() or public.is_admin());
create policy reviews_create on public.reviews for insert to authenticated
 with check(user_id=auth.uid() and status='visible' and public.can_view_recipe(recipe_id));
create policy reviews_edit on public.reviews for update to authenticated
 using(user_id=auth.uid() or public.is_admin())
 with check((user_id=auth.uid() and status='visible') or public.is_admin());
create policy reviews_delete on public.reviews for delete to authenticated
 using(user_id=auth.uid() or public.is_admin());

-- Before production: add policies for photo upload buckets, image moderation,
-- publication and status-transition RPCs, review abuse prevention, audit logging,
-- and database constraint tests. Do not make this schema public without verification.
