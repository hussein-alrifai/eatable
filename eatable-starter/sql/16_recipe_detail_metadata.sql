-- Eatable v34 — run AFTER backing up Supabase and BEFORE deploying the v34 JavaScript.
-- New values are NULL for existing rows. Never invent time splits or calories.
-- prep_minutes stays as the legacy total used by discovery and filters.
BEGIN;

ALTER TABLE public.eatable_curated_recipes
  ADD COLUMN IF NOT EXISTS prep_time_minutes integer CHECK (prep_time_minutes BETWEEN 0 AND 720),
  ADD COLUMN IF NOT EXISTS cook_time_minutes integer CHECK (cook_time_minutes BETWEEN 0 AND 720),
  ADD COLUMN IF NOT EXISTS kcal_per_serving numeric(8,1) CHECK (kcal_per_serving > 0 AND kcal_per_serving <= 20000);

ALTER TABLE public.recipe_submissions
  ADD COLUMN IF NOT EXISTS prep_time_minutes integer CHECK (prep_time_minutes BETWEEN 0 AND 720),
  ADD COLUMN IF NOT EXISTS cook_time_minutes integer CHECK (cook_time_minutes BETWEEN 0 AND 720),
  ADD COLUMN IF NOT EXISTS kcal_per_serving numeric(8,1) CHECK (kcal_per_serving > 0 AND kcal_per_serving <= 20000);

ALTER TABLE public.community_recipes
  ADD COLUMN IF NOT EXISTS prep_time_minutes integer CHECK (prep_time_minutes BETWEEN 0 AND 720),
  ADD COLUMN IF NOT EXISTS cook_time_minutes integer CHECK (cook_time_minutes BETWEEN 0 AND 720),
  ADD COLUMN IF NOT EXISTS kcal_per_serving numeric(8,1) CHECK (kcal_per_serving > 0 AND kcal_per_serving <= 20000);

-- Preserve existing RLS. Authors can only insert or edit the new fields as
-- permitted by the pre-existing RLS and revision guard.
GRANT INSERT (prep_time_minutes,cook_time_minutes,kcal_per_serving) ON public.recipe_submissions TO authenticated;
GRANT UPDATE (prep_time_minutes,cook_time_minutes,kcal_per_serving) ON public.recipe_submissions TO authenticated;

-- The existing status-trigger calls this function. Preserve public-photo syncing,
-- while including the new published metadata on moderated submissions.
CREATE OR REPLACE FUNCTION private.eatable_sync_publication()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    INSERT INTO public.community_recipes
      (id,title_en,title_it,description_en,description_it,origin,category,
       prep_minutes,prep_time_minutes,cook_time_minutes,kcal_per_serving,
       servings,ingredients,steps,public_photo_path,published_at)
    VALUES
      (NEW.id,NEW.title_en,NEW.title_it,NEW.description_en,NEW.description_it,
       NEW.origin,NEW.category,NEW.prep_minutes,
       NEW.prep_time_minutes,NEW.cook_time_minutes,NEW.kcal_per_serving,
       NEW.servings,NEW.ingredients,NEW.steps,NEW.public_photo_path,now())
    ON CONFLICT(id) DO UPDATE SET
      title_en=EXCLUDED.title_en,title_it=EXCLUDED.title_it,
      description_en=EXCLUDED.description_en,description_it=EXCLUDED.description_it,
      origin=EXCLUDED.origin,category=EXCLUDED.category,
      prep_minutes=EXCLUDED.prep_minutes,
      prep_time_minutes=EXCLUDED.prep_time_minutes,
      cook_time_minutes=EXCLUDED.cook_time_minutes,
      kcal_per_serving=EXCLUDED.kcal_per_serving,
      servings=EXCLUDED.servings,ingredients=EXCLUDED.ingredients,
      steps=EXCLUDED.steps,public_photo_path=EXCLUDED.public_photo_path;
  ELSE
    DELETE FROM public.community_recipes WHERE id=NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

COMMIT;
