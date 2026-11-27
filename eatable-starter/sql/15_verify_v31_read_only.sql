-- Optional read-only verification of migration 14. Execute as your Supabase database owner.
SELECT
  has_table_privilege('authenticated','public.eatable_curated_recipes','DELETE') AS authenticated_has_delete_grant,
  EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='eatable_curated_recipes' AND policyname='Eatable v31 curated admin delete') AS admin_delete_rls_policy_exists,
  to_regclass('public.eatable_ingredient_suggestions') IS NOT NULL AS ingredient_suggestion_table_exists;
-- An authenticated user still needs a successful public.eatable_is_admin() RLS
-- check to actually delete a recipe; grants alone are insufficient.
