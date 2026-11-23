-- Eatable v15: private user-created recipe collections.
-- Run AFTER v14. No existing Eatable tables or content are changed.
BEGIN;
CREATE TABLE IF NOT EXISTS public.eatable_user_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 60),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id,user_id)
);
CREATE INDEX IF NOT EXISTS eatable_collections_owner_idx ON public.eatable_user_collections(user_id,created_at);
CREATE TABLE IF NOT EXISTS public.eatable_collection_items (
  collection_id uuid NOT NULL,
  user_id uuid NOT NULL,
  recipe_id text NOT NULL CHECK (char_length(recipe_id) BETWEEN 1 AND 180),
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(collection_id,recipe_id),
  FOREIGN KEY (collection_id,user_id)
    REFERENCES public.eatable_user_collections(id,user_id)
    ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS eatable_collection_items_owner_idx ON public.eatable_collection_items(user_id);
ALTER TABLE public.eatable_user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eatable_collection_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.eatable_user_collections FROM anon,authenticated;
REVOKE ALL ON public.eatable_collection_items FROM anon,authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE(name) ON public.eatable_user_collections TO authenticated;
GRANT SELECT,INSERT,DELETE ON public.eatable_collection_items TO authenticated;
DROP POLICY IF EXISTS "Collections read own" ON public.eatable_user_collections;
DROP POLICY IF EXISTS "Collections create own" ON public.eatable_user_collections;
DROP POLICY IF EXISTS "Collections rename own" ON public.eatable_user_collections;
DROP POLICY IF EXISTS "Collections delete own" ON public.eatable_user_collections;
CREATE POLICY "Collections read own" ON public.eatable_user_collections FOR SELECT TO authenticated USING (user_id=(select auth.uid()));
CREATE POLICY "Collections create own" ON public.eatable_user_collections FOR INSERT TO authenticated WITH CHECK (user_id=(select auth.uid()));
CREATE POLICY "Collections rename own" ON public.eatable_user_collections FOR UPDATE TO authenticated USING (user_id=(select auth.uid())) WITH CHECK (user_id=(select auth.uid()));
CREATE POLICY "Collections delete own" ON public.eatable_user_collections FOR DELETE TO authenticated USING (user_id=(select auth.uid()));
DROP POLICY IF EXISTS "Collection items read own" ON public.eatable_collection_items;
DROP POLICY IF EXISTS "Collection items create own" ON public.eatable_collection_items;
DROP POLICY IF EXISTS "Collection items delete own" ON public.eatable_collection_items;
CREATE POLICY "Collection items read own" ON public.eatable_collection_items FOR SELECT TO authenticated USING (user_id=(select auth.uid()));
CREATE POLICY "Collection items create own" ON public.eatable_collection_items FOR INSERT TO authenticated WITH CHECK (user_id=(select auth.uid()));
CREATE POLICY "Collection items delete own" ON public.eatable_collection_items FOR DELETE TO authenticated USING (user_id=(select auth.uid()));
COMMIT;
NOTIFY pgrst, 'reload schema';
