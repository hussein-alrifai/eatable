-- Eatable v11: per-user pantry and shopping list. Run ONCE after v5 (or later).
-- The UI displays pantry presence; quantity/expiration are NOT tracked in pantry.
-- Private records are readable and writable only by the authenticated owner.
BEGIN;
CREATE TABLE IF NOT EXISTS public.user_pantry (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_id text NOT NULL REFERENCES public.eatable_ingredients(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,ingredient_id)
);
CREATE TABLE IF NOT EXISTS public.user_shopping_items (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_id text NOT NULL REFERENCES public.eatable_ingredients(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  quantity numeric(10,2) NULL CHECK (quantity > 0 AND quantity <= 100000),
  unit text NOT NULL DEFAULT '' CHECK (unit IN ('','g','kg','ml','l','pcs','tsp','tbsp','cup','pinch')),
  checked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,ingredient_id,unit)
);
CREATE INDEX IF NOT EXISTS user_shopping_items_user_created_idx ON public.user_shopping_items(user_id,created_at);
REVOKE ALL ON public.user_pantry FROM anon,authenticated;
REVOKE ALL ON public.user_shopping_items FROM anon,authenticated;
GRANT SELECT,INSERT,DELETE ON public.user_pantry TO authenticated;
GRANT SELECT,INSERT,UPDATE(checked),DELETE ON public.user_shopping_items TO authenticated;
ALTER TABLE public.user_pantry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_shopping_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own pantry" ON public.user_pantry FOR SELECT TO authenticated USING (user_id=(select auth.uid()));
CREATE POLICY "Add to own pantry" ON public.user_pantry FOR INSERT TO authenticated WITH CHECK (user_id=(select auth.uid()));
CREATE POLICY "Remove from own pantry" ON public.user_pantry FOR DELETE TO authenticated USING (user_id=(select auth.uid()));
CREATE POLICY "Read own shopping list" ON public.user_shopping_items FOR SELECT TO authenticated USING (user_id=(select auth.uid()));
CREATE POLICY "Add to own shopping list" ON public.user_shopping_items FOR INSERT TO authenticated WITH CHECK (user_id=(select auth.uid()));
CREATE POLICY "Check own shopping list" ON public.user_shopping_items FOR UPDATE TO authenticated USING (user_id=(select auth.uid())) WITH CHECK (user_id=(select auth.uid()));
CREATE POLICY "Remove from own shopping list" ON public.user_shopping_items FOR DELETE TO authenticated USING (user_id=(select auth.uid()));
COMMIT;
NOTIFY pgrst,'reload schema';
