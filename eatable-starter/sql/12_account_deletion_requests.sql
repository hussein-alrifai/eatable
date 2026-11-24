-- Eatable v24 — attribution integrity + private deletion-request inbox.
-- Run ONCE in Supabase SQL Editor BEFORE deploying the frontend files.
-- This migration does NOT delete users, photos or recipes.
BEGIN;

-- In Eatable v3/v4 the publication trigger copies recipe_submissions.id
-- directly into community_recipes.id. Enforce that existing relationship,
-- without exposing contributor IDs in the public catalog.
-- RESTRICT intentionally blocks deleting a submission before its public
-- counterpart has been reviewed/unpublished by the administrator.
DO $migration$
BEGIN
 IF NOT EXISTS (
   SELECT 1 FROM pg_constraint
   WHERE conrelid='public.community_recipes'::regclass
     AND conname='eatable_community_submission_fkey'
 ) THEN
   ALTER TABLE public.community_recipes
     ADD CONSTRAINT eatable_community_submission_fkey
     FOREIGN KEY (id) REFERENCES public.recipe_submissions(id)
     ON DELETE RESTRICT;
 END IF;
END;
$migration$;

CREATE TABLE IF NOT EXISTS public.eatable_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_review','closed')),
  note text CHECK (note IS NULL OR char_length(note) <= 500),
  admin_note text CHECK (admin_note IS NULL OR char_length(admin_note) <= 2000),
  requested_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS eatable_deletion_one_active_request
  ON public.eatable_deletion_requests(user_id)
  WHERE status IN ('pending','in_review');
CREATE INDEX IF NOT EXISTS eatable_deletion_request_queue
  ON public.eatable_deletion_requests(status,requested_at);

ALTER TABLE public.eatable_deletion_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.eatable_deletion_requests FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.eatable_deletion_requests TO authenticated;
GRANT INSERT(user_id,note) ON public.eatable_deletion_requests TO authenticated;
-- Moderation remains admin-only through RLS. Ordinary users cannot edit status.
GRANT UPDATE(status,admin_note) ON public.eatable_deletion_requests TO authenticated;

DROP POLICY IF EXISTS "Eatable deletion owner read" ON public.eatable_deletion_requests;
CREATE POLICY "Eatable deletion owner read"
  ON public.eatable_deletion_requests FOR SELECT TO authenticated
  USING (user_id=(SELECT auth.uid()));
DROP POLICY IF EXISTS "Eatable deletion admin read" ON public.eatable_deletion_requests;
CREATE POLICY "Eatable deletion admin read"
  ON public.eatable_deletion_requests FOR SELECT TO authenticated
  USING ((SELECT public.eatable_is_admin()));
DROP POLICY IF EXISTS "Eatable deletion owner request" ON public.eatable_deletion_requests;
CREATE POLICY "Eatable deletion owner request"
  ON public.eatable_deletion_requests FOR INSERT TO authenticated
  WITH CHECK (user_id=(SELECT auth.uid()) AND status='pending');
DROP POLICY IF EXISTS "Eatable deletion admin review" ON public.eatable_deletion_requests;
CREATE POLICY "Eatable deletion admin review"
  ON public.eatable_deletion_requests FOR UPDATE TO authenticated
  USING ((SELECT public.eatable_is_admin()))
  WITH CHECK ((SELECT public.eatable_is_admin()));

COMMIT;
