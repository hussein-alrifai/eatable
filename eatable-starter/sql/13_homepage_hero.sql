-- Eatable v29: single admin-selected homepage hero recipe.
-- Public read; admin-only insert/update; no photo files are moved or copied.
-- Safe to re-run. Run in Supabase SQL Editor before uploading src/app.js.
CREATE TABLE IF NOT EXISTS public.eatable_site_settings (
  setting_key text PRIMARY KEY,
  recipe_id text NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT eatable_site_settings_known_keys CHECK (setting_key = 'homepage_hero'),
  CONSTRAINT eatable_site_settings_recipe_id_size CHECK (recipe_id IS NULL OR length(recipe_id) BETWEEN 1 AND 140)
);

ALTER TABLE public.eatable_site_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.eatable_site_settings FROM anon, authenticated;
GRANT SELECT ON public.eatable_site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.eatable_site_settings TO authenticated;

DROP POLICY IF EXISTS "Read public homepage setting" ON public.eatable_site_settings;
CREATE POLICY "Read public homepage setting"
ON public.eatable_site_settings FOR SELECT TO anon, authenticated
USING (setting_key = 'homepage_hero');

DROP POLICY IF EXISTS "Admin creates homepage setting" ON public.eatable_site_settings;
CREATE POLICY "Admin creates homepage setting"
ON public.eatable_site_settings FOR INSERT TO authenticated
WITH CHECK (setting_key = 'homepage_hero' AND (SELECT public.eatable_is_admin()));

DROP POLICY IF EXISTS "Admin updates homepage setting" ON public.eatable_site_settings;
CREATE POLICY "Admin updates homepage setting"
ON public.eatable_site_settings FOR UPDATE TO authenticated
USING (setting_key = 'homepage_hero' AND (SELECT public.eatable_is_admin()))
WITH CHECK (setting_key = 'homepage_hero' AND (SELECT public.eatable_is_admin()));
