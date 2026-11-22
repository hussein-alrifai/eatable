-- Eatable v3 — community recipes + moderation
-- RUN ONCE after sql/01_schema.sql. Keeps all existing users & favorites.
-- Member submissions never become public until an authenticated admin approves them.
BEGIN;

CREATE OR REPLACE FUNCTION public.eatable_is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION public.eatable_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.eatable_is_admin() TO authenticated;

CREATE TABLE public.recipe_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title_en text NOT NULL CHECK (char_length(btrim(title_en)) BETWEEN 3 AND 120),
  title_it text CHECK (title_it IS NULL OR char_length(title_it) <= 120),
  description_en text NOT NULL CHECK (char_length(btrim(description_en)) BETWEEN 10 AND 1200),
  description_it text CHECK (description_it IS NULL OR char_length(description_it) <= 1200),
  origin text NOT NULL CHECK (char_length(btrim(origin)) BETWEEN 2 AND 80),
  category text NOT NULL DEFAULT 'Main dish' CHECK (category IN ('Main dish','Mezze / starter','Dessert','Bread','Drink','Other')),
  prep_minutes integer NOT NULL CHECK (prep_minutes BETWEEN 1 AND 720),
  servings integer NOT NULL DEFAULT 4 CHECK (servings BETWEEN 1 AND 30),
  ingredients jsonb NOT NULL CHECK (jsonb_typeof(ingredients) = 'array' AND jsonb_array_length(ingredients) BETWEEN 2 AND 40),
  steps jsonb NOT NULL CHECK (jsonb_typeof(steps) = 'array' AND jsonb_array_length(steps) BETWEEN 2 AND 40),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','changes_requested','rejected')),
  moderation_note text CHECK (moderation_note IS NULL OR char_length(moderation_note) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
CREATE INDEX recipe_submissions_author_idx ON public.recipe_submissions (author_id, created_at DESC);
CREATE INDEX recipe_submissions_status_idx ON public.recipe_submissions (status, created_at DESC);

-- Only curated, approved content is copied here. No author email, private ID or review notes.
CREATE TABLE public.community_recipes (
  id uuid PRIMARY KEY,
  title_en text NOT NULL,
  title_it text,
  description_en text NOT NULL,
  description_it text,
  origin text NOT NULL,
  category text NOT NULL,
  prep_minutes integer NOT NULL,
  servings integer NOT NULL,
  ingredients jsonb NOT NULL,
  steps jsonb NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now()
);

-- Private trigger handles publication and unpublication after admin status changes.
CREATE OR REPLACE FUNCTION private.eatable_sync_publication()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    INSERT INTO public.community_recipes
    (id,title_en,title_it,description_en,description_it,origin,category,prep_minutes,servings,ingredients,steps,published_at)
    VALUES (NEW.id,NEW.title_en,NEW.title_it,NEW.description_en,NEW.description_it,
      NEW.origin,NEW.category,NEW.prep_minutes,NEW.servings,NEW.ingredients,NEW.steps,now())
    ON CONFLICT(id) DO UPDATE SET title_en=EXCLUDED.title_en,title_it=EXCLUDED.title_it,
      description_en=EXCLUDED.description_en,description_it=EXCLUDED.description_it,
      origin=EXCLUDED.origin,category=EXCLUDED.category,prep_minutes=EXCLUDED.prep_minutes,
      servings=EXCLUDED.servings,ingredients=EXCLUDED.ingredients,steps=EXCLUDED.steps;
  ELSE
    DELETE FROM public.community_recipes WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER eatable_publish_on_review
AFTER UPDATE OF status ON public.recipe_submissions
FOR EACH ROW EXECUTE FUNCTION private.eatable_sync_publication();

REVOKE ALL ON public.recipe_submissions FROM anon,authenticated;
GRANT SELECT ON public.recipe_submissions TO authenticated;
GRANT INSERT (author_id,title_en,title_it,description_en,description_it,origin,category,prep_minutes,servings,ingredients,steps)
  ON public.recipe_submissions TO authenticated;
GRANT UPDATE (status,moderation_note,reviewed_at) ON public.recipe_submissions TO authenticated;
ALTER TABLE public.recipe_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Author sees own submissions" ON public.recipe_submissions FOR SELECT TO authenticated
  USING (author_id = (SELECT auth.uid()));
CREATE POLICY "Admin sees all submissions" ON public.recipe_submissions FOR SELECT TO authenticated
  USING ((SELECT public.eatable_is_admin()));
CREATE POLICY "Signed in user can submit pending recipes" ON public.recipe_submissions FOR INSERT TO authenticated
  WITH CHECK (author_id = (SELECT auth.uid()) AND status = 'pending' AND reviewed_at IS NULL);
CREATE POLICY "Only admin changes moderation status" ON public.recipe_submissions FOR UPDATE TO authenticated
  USING ((SELECT public.eatable_is_admin()))
  WITH CHECK ((SELECT public.eatable_is_admin()));

REVOKE ALL ON public.community_recipes FROM anon,authenticated;
GRANT SELECT ON public.community_recipes TO anon,authenticated;
ALTER TABLE public.community_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read approved community recipes" ON public.community_recipes FOR SELECT TO anon,authenticated
  USING (true);
COMMIT;
