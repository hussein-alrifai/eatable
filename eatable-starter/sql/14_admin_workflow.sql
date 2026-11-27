-- Eatable v31: admin-only deletion and member ingredient suggestions.
-- Run in the existing Supabase project's SQL Editor. No existing recipes are modified.
BEGIN;
-- v5 restricted DELETE grants; this restores DELETE for authenticated only.
-- RLS remains the authorization boundary; never expose service-role keys in browser.
GRANT DELETE ON public.eatable_curated_recipes TO authenticated;
DROP POLICY IF EXISTS "Eatable v31 curated admin delete" ON public.eatable_curated_recipes;
CREATE POLICY "Eatable v31 curated admin delete" ON public.eatable_curated_recipes
 FOR DELETE TO authenticated USING ((SELECT public.eatable_is_admin()));

CREATE TABLE IF NOT EXISTS public.eatable_ingredient_suggestions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
 name_en text NOT NULL CHECK (char_length(btrim(name_en)) BETWEEN 2 AND 100),
 note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 300),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','added','dismissed')),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eatable_ingredient_suggestions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.eatable_ingredient_suggestions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.eatable_ingredient_suggestions TO authenticated;
DROP POLICY IF EXISTS "Members can suggest ingredients" ON public.eatable_ingredient_suggestions;
CREATE POLICY "Members can suggest ingredients" ON public.eatable_ingredient_suggestions
 FOR INSERT TO authenticated WITH CHECK (author_id = (SELECT auth.uid()) AND status = 'pending');
DROP POLICY IF EXISTS "Admin can view ingredient suggestions" ON public.eatable_ingredient_suggestions;
CREATE POLICY "Admin can view ingredient suggestions" ON public.eatable_ingredient_suggestions
 FOR SELECT TO authenticated USING ((SELECT public.eatable_is_admin()));
DROP POLICY IF EXISTS "Admin can resolve ingredient suggestions" ON public.eatable_ingredient_suggestions;
CREATE POLICY "Admin can resolve ingredient suggestions" ON public.eatable_ingredient_suggestions
 FOR UPDATE TO authenticated USING ((SELECT public.eatable_is_admin())) WITH CHECK ((SELECT public.eatable_is_admin()));
-- Basic anti-spam guard: no more than 10 suggestions per account in any 24 hours.
CREATE OR REPLACE FUNCTION private.eatable_limit_ingredient_suggestions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF (SELECT count(*) FROM public.eatable_ingredient_suggestions
     WHERE author_id = NEW.author_id AND created_at > now() - interval '24 hours') >= 10 THEN
  RAISE EXCEPTION 'Daily ingredient-suggestion limit reached';
 END IF;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS eatable_limit_ingredient_suggestions ON public.eatable_ingredient_suggestions;
CREATE TRIGGER eatable_limit_ingredient_suggestions
 BEFORE INSERT ON public.eatable_ingredient_suggestions
 FOR EACH ROW EXECUTE FUNCTION private.eatable_limit_ingredient_suggestions();
CREATE INDEX IF NOT EXISTS eatable_ingredient_suggestions_status_created_idx
 ON public.eatable_ingredient_suggestions (status,created_at);
COMMIT;
NOTIFY pgrst, 'reload schema';
