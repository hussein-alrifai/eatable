-- Eatable v7.0: photos for administrator-curated recipes.
-- Run only after migrations 01-05 in your existing Supabase project.
-- Reuses v4 private and published buckets; no bucket or previous content is deleted.
BEGIN;

ALTER TABLE public.eatable_curated_recipes
  ADD COLUMN IF NOT EXISTS public_photo_path text;

-- Private draft paths live in a separate ADMIN-ONLY table. They must NOT be
-- exposed by public SELECT * on the published curated-recipes table.
CREATE TABLE IF NOT EXISTS public.eatable_curated_media (
  slug text PRIMARY KEY REFERENCES public.eatable_curated_recipes(slug) ON DELETE CASCADE,
  photo_path text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT eatable_curated_private_path_check CHECK (
    photo_path IS NULL OR photo_path ~
      '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}[.](jpg|png|webp)$'
  )
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'eatable_curated_public_photo_path_check'
      AND conrelid = 'public.eatable_curated_recipes'::regclass
  ) THEN
    ALTER TABLE public.eatable_curated_recipes
      ADD CONSTRAINT eatable_curated_public_photo_path_check CHECK (
        public_photo_path IS NULL OR public_photo_path ~
          ('^curated/' || slug || '/[0-9a-f-]{36}[.](jpg|png|webp)$')
      );
  END IF;
END;
$$;

ALTER TABLE public.eatable_curated_media ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.eatable_curated_media FROM public, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eatable_curated_media TO authenticated;
DROP POLICY IF EXISTS "Curated media accessible only to admins"
  ON public.eatable_curated_media;
CREATE POLICY "Curated media accessible only to admins"
  ON public.eatable_curated_media FOR ALL TO authenticated
  USING ((SELECT public.eatable_is_admin()))
  WITH CHECK ((SELECT public.eatable_is_admin()));

-- Prevent inadvertent publication of photo metadata on an unpublished recipe.
CREATE OR REPLACE FUNCTION private.eatable_curated_photo_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NOT NEW.published THEN NEW.public_photo_path := NULL; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS eatable_curated_photo_guard
  ON public.eatable_curated_recipes;
CREATE TRIGGER eatable_curated_photo_guard
BEFORE INSERT OR UPDATE ON public.eatable_curated_recipes
FOR EACH ROW EXECUTE FUNCTION private.eatable_curated_photo_guard();

-- v6 explicitly granted INSERT/UPDATE on all existing table columns.
GRANT SELECT ON public.eatable_curated_recipes TO anon, authenticated;
GRANT INSERT, UPDATE ON public.eatable_curated_recipes TO authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
