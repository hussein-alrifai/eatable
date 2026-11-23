-- Eatable v13.0 - Public recipe ratings and reviews
-- Apply once AFTER v11 SQL migration 08. This does not change prior data.
-- Public reviews are shown only while the corresponding recipe is published.
-- One review per account per recipe. Admins can hide/unhide inappropriate reviews.
BEGIN;

CREATE TABLE public.eatable_recipe_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_kind text NOT NULL CHECK (recipe_kind IN ('curated', 'community')),
  recipe_key text NOT NULL CHECK (char_length(recipe_key) BETWEEN 1 AND 120),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL DEFAULT '' CHECK (char_length(body) <= 1200),
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, recipe_kind, recipe_key),
  CONSTRAINT eatable_review_key_format CHECK (
    (recipe_kind = 'curated' AND recipe_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$') OR
    (recipe_kind = 'community' AND recipe_key ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
  )
);
CREATE INDEX eatable_reviews_recipe_idx ON public.eatable_recipe_reviews
 (recipe_kind, recipe_key, created_at DESC);

-- Only published recipes may receive reviews. Always enforce on the server.
CREATE FUNCTION private.eatable_validate_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE can_review boolean;
DECLARE is_moderator boolean;
BEGIN
  SELECT CASE
    WHEN NEW.recipe_kind = 'curated' THEN EXISTS (
      SELECT 1 FROM public.eatable_curated_recipes r
      WHERE r.slug = NEW.recipe_key AND r.published = true)
    WHEN NEW.recipe_kind = 'community' THEN EXISTS (
      SELECT 1 FROM public.community_recipes r WHERE r.id::text = NEW.recipe_key)
    ELSE false END INTO can_review;
  IF NOT can_review THEN RAISE EXCEPTION 'Recipe is not published'; END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id IS DISTINCT FROM auth.uid() OR NEW.is_visible IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'Invalid review author or visibility';
    END IF;
  ELSE
    IF NEW.user_id IS DISTINCT FROM OLD.user_id OR
       NEW.recipe_kind IS DISTINCT FROM OLD.recipe_kind OR
       NEW.recipe_key IS DISTINCT FROM OLD.recipe_key OR
       NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Review ownership and recipe cannot be modified';
    END IF;
    SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      INTO is_moderator;
    IF (NEW.rating IS DISTINCT FROM OLD.rating OR NEW.body IS DISTINCT FROM OLD.body)
       AND NEW.user_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'You cannot change another member review';
    END IF;
    IF NEW.is_visible IS DISTINCT FROM OLD.is_visible AND NOT is_moderator THEN
      RAISE EXCEPTION 'Only moderators can change review visibility';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.eatable_validate_review() FROM PUBLIC;
CREATE TRIGGER eatable_validate_review_row
BEFORE INSERT OR UPDATE ON public.eatable_recipe_reviews
FOR EACH ROW EXECUTE FUNCTION private.eatable_validate_review();

REVOKE ALL ON public.eatable_recipe_reviews FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.eatable_recipe_reviews TO anon, authenticated;
GRANT INSERT (user_id,recipe_kind,recipe_key,rating,body) ON public.eatable_recipe_reviews TO authenticated;
GRANT UPDATE (rating,body,is_visible) ON public.eatable_recipe_reviews TO authenticated;
GRANT DELETE ON public.eatable_recipe_reviews TO authenticated;
ALTER TABLE public.eatable_recipe_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads visible published reviews"
ON public.eatable_recipe_reviews FOR SELECT TO anon, authenticated
USING (
 is_visible AND (
   (recipe_kind = 'curated' AND EXISTS (
     SELECT 1 FROM public.eatable_curated_recipes cr
     WHERE cr.slug = recipe_key AND cr.published = true)) OR
   (recipe_kind = 'community' AND EXISTS (
     SELECT 1 FROM public.community_recipes co WHERE co.id::text = recipe_key))
 )
);
CREATE POLICY "Members see own reviews and moderators see all"
ON public.eatable_recipe_reviews FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) OR (SELECT public.eatable_is_admin()));
CREATE POLICY "Members review published recipes"
ON public.eatable_recipe_reviews FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()) AND is_visible = true AND (
 (recipe_kind = 'curated' AND EXISTS (
     SELECT 1 FROM public.eatable_curated_recipes cr
     WHERE cr.slug = recipe_key AND cr.published = true)) OR
 (recipe_kind = 'community' AND EXISTS (
     SELECT 1 FROM public.community_recipes co WHERE co.id::text = recipe_key))
));
CREATE POLICY "Members edit own reviews and moderators change visibility"
ON public.eatable_recipe_reviews FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()) OR (SELECT public.eatable_is_admin()))
WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.eatable_is_admin()));
CREATE POLICY "Members delete own reviews and moderators can delete"
ON public.eatable_recipe_reviews FOR DELETE TO authenticated
USING (user_id = (SELECT auth.uid()) OR (SELECT public.eatable_is_admin()));

-- Aggregate visible ratings only; respects the caller's RLS visibility.
CREATE FUNCTION public.eatable_review_summary(p_kind text, p_key text)
RETURNS TABLE(review_count bigint, average_rating numeric)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
 SELECT count(*)::bigint, coalesce(round(avg(r.rating)::numeric, 1),0::numeric)
 FROM public.eatable_recipe_reviews r
 WHERE r.recipe_kind = p_kind AND r.recipe_key = p_key AND r.is_visible = true
   AND ((p_kind = 'curated' AND EXISTS (
     SELECT 1 FROM public.eatable_curated_recipes cr WHERE cr.slug = p_key AND cr.published = true))
      OR (p_kind = 'community' AND EXISTS (
     SELECT 1 FROM public.community_recipes co WHERE co.id::text = p_key)));
$$;
REVOKE ALL ON FUNCTION public.eatable_review_summary(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.eatable_review_summary(text,text) TO anon, authenticated;
COMMIT;
