-- Eatable v23 | Read-only privacy and database-access preflight
-- Prepared 2026-11-24. Inspect only in Supabase SQL Editor.
-- This script does NOT create, modify, delete or migrate any records.
-- Results describe schema configuration, NOT proof that RLS policies are correct.

-- CHECK 1: application tables, RLS and policy counts.
WITH expected(name, intended_visibility) AS (
 VALUES
 ('profiles','PRIVATE'),
 ('user_favorites','PRIVATE'),
 ('recipe_submissions','PRIVATE'),
 ('community_recipes','PUBLIC APPROVED CONTENT'),
 ('eatable_ingredients','PUBLIC CATALOG'),
 ('eatable_curated_recipes','PUBLISHED ONLY'),
 ('eatable_community_index','PUBLISHED ONLY'),
 ('eatable_curated_media','ADMIN PRIVATE'),
 ('eatable_curated_reviews','ADMIN PRIVATE'),
 ('user_pantry','PRIVATE'),
 ('user_shopping_items','PRIVATE'),
 ('eatable_recipe_reviews','VISIBLE PUBLISHED REVIEWS'),
 ('eatable_user_collections','PRIVATE'),
 ('eatable_collection_items','PRIVATE')
), policy_counts AS (
 SELECT tablename,count(*) AS policy_count
 FROM pg_policies WHERE schemaname='public' GROUP BY tablename
)
SELECT e.name AS table_name, e.intended_visibility,
       CASE WHEN c.oid IS NULL THEN 'MISSING' ELSE 'PRESENT' END AS table_state,
       c.relrowsecurity AS rls_enabled,
       coalesce(pc.policy_count,0) AS policy_count
FROM expected e
LEFT JOIN pg_namespace n ON n.nspname='public'
LEFT JOIN pg_class c ON c.relnamespace=n.oid AND c.relname=e.name AND c.relkind IN ('r','p')
LEFT JOIN policy_counts pc ON pc.tablename=e.name
ORDER BY e.name;

-- CHECK 2: foreign keys referencing auth.users, including deletion behavior.
-- CASCADE on some tables does not guarantee the deletion of published copies or files.
SELECT con.conrelid::regclass::text AS referencing_table,
       con.conname AS foreign_key,
       CASE con.confdeltype
         WHEN 'c' THEN 'CASCADE'
         WHEN 'n' THEN 'SET NULL'
         WHEN 'r' THEN 'RESTRICT'
         WHEN 'a' THEN 'NO ACTION'
         WHEN 'd' THEN 'SET DEFAULT'
         ELSE 'OTHER' END AS on_user_delete
FROM pg_constraint con
WHERE con.contype='f' AND con.confrelid='auth.users'::regclass
ORDER BY referencing_table,foreign_key;

-- CHECK 3: storage buckets and object counts (no file paths or personal details).
SELECT b.id AS bucket, b.public AS publicly_accessible,
       count(o.id)::bigint AS object_count
FROM storage.buckets b
LEFT JOIN storage.objects o ON o.bucket_id=b.id
WHERE b.id IN ('eatable-private-photos','eatable-published-photos')
GROUP BY b.id,b.public ORDER BY b.id;

-- CHECK 4: public RPC function exposure, especially SECURITY DEFINER.
-- Execution grants are not automatically vulnerabilities; review each function's logic.
SELECT p.proname AS function_name,
       p.prosecdef AS security_definer,
       has_function_privilege('anon',p.oid,'EXECUTE') AS anonymous_can_execute,
       has_function_privilege('authenticated',p.oid,'EXECUTE') AS member_can_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname LIKE 'eatable_%'
ORDER BY p.proname;

-- CHECK 5: enabled table policies by action and assigned database role.
-- Share only the action/role summary if seeking outside help, NOT private row data.
SELECT tablename, cmd AS action,
       array_to_string(roles,', ') AS roles,
       count(*) AS policy_count
FROM pg_policies
WHERE schemaname='public' AND (
 tablename LIKE 'eatable_%' OR tablename IN (
 'profiles','user_favorites','recipe_submissions','community_recipes',
 'user_pantry','user_shopping_items'))
GROUP BY tablename,cmd,roles ORDER BY tablename,cmd;
