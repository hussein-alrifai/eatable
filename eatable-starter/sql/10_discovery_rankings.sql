-- Eatable v14 — Discovery ranking summary and publication timestamps.
-- Apply ONCE after v13 (09_ratings_reviews.sql). No recipe, account or review data is deleted.
-- Public clients receive aggregate counts ONLY for published recipes.
BEGIN;

-- Curated recipes predate publication tracking. For existing published recipes,
-- updated_at is the best available date and is NOT asserted to be original publish time.
ALTER TABLE public.eatable_curated_recipes
  ADD COLUMN IF NOT EXISTS published_at timestamptz;
UPDATE public.eatable_curated_recipes
SET published_at = updated_at
WHERE published = true AND published_at IS NULL;

CREATE OR REPLACE FUNCTION private.eatable_curated_publish_timestamp()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.published THEN
    NEW.published_at := COALESCE(NEW.published_at, now());
  ELSIF TG_OP = 'UPDATE' AND NEW.published = true AND OLD.published IS DISTINCT FROM true THEN
    NEW.published_at := now();
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS eatable_curated_publish_timestamp ON public.eatable_curated_recipes;
CREATE TRIGGER eatable_curated_publish_timestamp
BEFORE INSERT OR UPDATE OF published ON public.eatable_curated_recipes
FOR EACH ROW EXECUTE FUNCTION private.eatable_curated_publish_timestamp();

-- The SECURITY DEFINER aggregate is necessary because private favorites have
-- owner-only RLS. We expose ONLY counts, never user IDs or individual favorites.
-- Every returned row is gated by a public/published recipe.
CREATE OR REPLACE FUNCTION public.eatable_discovery_stats()
RETURNS TABLE (
  recipe_kind text,
  recipe_key text,
  review_count bigint,
  average_rating numeric,
  favorite_count bigint,
  published_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  WITH published AS (
    SELECT 'curated'::text AS kind, cr.slug::text AS rkey,
           cr.slug::text AS favkey, cr.published_at AS pubdate
    FROM public.eatable_curated_recipes AS cr WHERE cr.published = true
    UNION ALL
    SELECT 'community'::text AS kind, co.id::text AS rkey,
           ('community-' || co.id::text)::text AS favkey, co.published_at AS pubdate
    FROM public.community_recipes AS co
  ), ratings AS (
    SELECT rv.recipe_kind AS kind, rv.recipe_key AS rkey,
           count(*)::bigint AS n, round(avg(rv.rating)::numeric,1) AS average
    FROM public.eatable_recipe_reviews AS rv
    WHERE rv.is_visible = true
    GROUP BY rv.recipe_kind, rv.recipe_key
  ), saves AS (
    SELECT uf.recipe_slug AS favkey, count(*)::bigint AS n
    FROM public.user_favorites AS uf GROUP BY uf.recipe_slug
  )
  SELECT p.kind, p.rkey, coalesce(r.n,0)::bigint,
         coalesce(r.average,0)::numeric, coalesce(s.n,0)::bigint, p.pubdate
  FROM published AS p
  LEFT JOIN ratings AS r ON r.kind=p.kind AND r.rkey=p.rkey
  LEFT JOIN saves AS s ON s.favkey=p.favkey
  ORDER BY p.kind, p.rkey
  LIMIT 1000;
$$;
REVOKE ALL ON FUNCTION public.eatable_discovery_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.eatable_discovery_stats() TO anon, authenticated;

COMMIT;
