-- Eatable v8.0: private editorial quality-review records.
-- Run ONLY after v7 migration 06 in your EXISTING Supabase project.
-- Does not modify or unpublish any recipes, accounts, favorites, or photos.
BEGIN;

CREATE TABLE IF NOT EXISTS public.eatable_curated_reviews (
  slug text PRIMARY KEY REFERENCES public.eatable_curated_recipes(slug) ON DELETE CASCADE,
  recipe_tested boolean NOT NULL DEFAULT false,
  quantities_checked boolean NOT NULL DEFAULT false,
  translations_checked boolean NOT NULL DEFAULT false,
  photo_rights_checked boolean NOT NULL DEFAULT false,
  origin_checked boolean NOT NULL DEFAULT false,
  editorial_note text NOT NULL DEFAULT '' CHECK (char_length(editorial_note) <= 2000),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

-- Set reviewer identity/time on the server; the browser cannot claim another identity.
CREATE OR REPLACE FUNCTION private.eatable_mark_review()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  NEW.reviewed_by := (SELECT auth.uid());
  NEW.reviewed_at := now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS eatable_mark_review ON public.eatable_curated_reviews;
CREATE TRIGGER eatable_mark_review
BEFORE INSERT OR UPDATE ON public.eatable_curated_reviews
FOR EACH ROW EXECUTE FUNCTION private.eatable_mark_review();

ALTER TABLE public.eatable_curated_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.eatable_curated_reviews FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.eatable_curated_reviews TO authenticated;
DROP POLICY IF EXISTS "Admin can manage curated editorial reviews"
  ON public.eatable_curated_reviews;
CREATE POLICY "Admin can manage curated editorial reviews"
  ON public.eatable_curated_reviews
  FOR ALL TO authenticated
  USING ((SELECT public.eatable_is_admin()))
  WITH CHECK ((SELECT public.eatable_is_admin()));


-- When reviewed recipe content changes, invalidate the affected attestations.
-- This does NOT unpublish recipes. It simply marks their editorial review as stale.
CREATE OR REPLACE FUNCTION private.eatable_invalidate_curated_review()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  UPDATE public.eatable_curated_reviews AS q SET
    recipe_tested = CASE WHEN NEW.ingredients IS DISTINCT FROM OLD.ingredients
                      OR NEW.steps IS DISTINCT FROM OLD.steps
                         THEN false ELSE q.recipe_tested END,
    quantities_checked = CASE WHEN NEW.ingredients IS DISTINCT FROM OLD.ingredients
                              THEN false ELSE q.quantities_checked END,
    translations_checked = CASE WHEN NEW.title_en IS DISTINCT FROM OLD.title_en
                              OR NEW.title_it IS DISTINCT FROM OLD.title_it
                              OR NEW.description_en IS DISTINCT FROM OLD.description_en
                              OR NEW.description_it IS DISTINCT FROM OLD.description_it
                              OR NEW.steps IS DISTINCT FROM OLD.steps
                                 THEN false ELSE q.translations_checked END,
    photo_rights_checked = CASE WHEN NEW.public_photo_path IS DISTINCT FROM OLD.public_photo_path
                               THEN false ELSE q.photo_rights_checked END,
    origin_checked = CASE WHEN NEW.cuisine IS DISTINCT FROM OLD.cuisine
                        OR NEW.diet IS DISTINCT FROM OLD.diet
                        OR NEW.category IS DISTINCT FROM OLD.category
                           THEN false ELSE q.origin_checked END
  WHERE q.slug = NEW.slug
    AND (NEW.ingredients IS DISTINCT FROM OLD.ingredients
      OR NEW.steps IS DISTINCT FROM OLD.steps
      OR NEW.title_en IS DISTINCT FROM OLD.title_en
      OR NEW.title_it IS DISTINCT FROM OLD.title_it
      OR NEW.description_en IS DISTINCT FROM OLD.description_en
      OR NEW.description_it IS DISTINCT FROM OLD.description_it
      OR NEW.public_photo_path IS DISTINCT FROM OLD.public_photo_path
      OR NEW.cuisine IS DISTINCT FROM OLD.cuisine
      OR NEW.diet IS DISTINCT FROM OLD.diet
      OR NEW.category IS DISTINCT FROM OLD.category);
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS eatable_invalidate_curated_review ON public.eatable_curated_recipes;
CREATE TRIGGER eatable_invalidate_curated_review
AFTER UPDATE ON public.eatable_curated_recipes
FOR EACH ROW EXECUTE FUNCTION private.eatable_invalidate_curated_review();

-- A draft photo swap also needs a fresh usage-rights review, even if the
-- published-photo reference did not change.
CREATE OR REPLACE FUNCTION private.eatable_invalidate_draft_photo_review()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF NEW.photo_path IS DISTINCT FROM OLD.photo_path THEN
    UPDATE public.eatable_curated_reviews
      SET photo_rights_checked = false WHERE slug = NEW.slug;
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS eatable_invalidate_draft_photo_review ON public.eatable_curated_media;
CREATE TRIGGER eatable_invalidate_draft_photo_review
AFTER UPDATE ON public.eatable_curated_media
FOR EACH ROW EXECUTE FUNCTION private.eatable_invalidate_draft_photo_review();

COMMIT;
NOTIFY pgrst, 'reload schema';
