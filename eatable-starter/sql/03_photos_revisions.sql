-- Eatable v4: photo submissions, author corrections and admin-controlled photo publication.
-- Run ONCE, after 01_schema.sql and 02_community.sql, in the same Supabase project.
-- Requires private schema, profiles, recipe_submissions, community_recipes from earlier migrations.
BEGIN;

-- Private uploaded photos remain inaccessible to anonymous visitors.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('eatable-private-photos', 'eatable-private-photos', false, 5242880,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public=false, file_size_limit=5242880,
  allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp'];

-- Only photos copied to this public bucket by an admin are publicly accessible.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('eatable-published-photos', 'eatable-published-photos', true, 5242880,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public=true, file_size_limit=5242880,
  allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp'];

ALTER TABLE public.recipe_submissions
  ADD COLUMN IF NOT EXISTS photo_path text,
  ADD COLUMN IF NOT EXISTS public_photo_path text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.community_recipes
  ADD COLUMN IF NOT EXISTS public_photo_path text;

-- Only permit relative object paths in expected namespaces.
ALTER TABLE public.recipe_submissions
  ADD CONSTRAINT eatable_private_photo_path_check
  CHECK (photo_path IS NULL OR
    (photo_path ~ ('^' || author_id::text || '/[0-9a-f-]{36}/[0-9a-f-]{36}[.](jpg|png|webp)$')));
ALTER TABLE public.recipe_submissions
  ADD CONSTRAINT eatable_public_photo_path_check
  CHECK (public_photo_path IS NULL OR
    (public_photo_path ~ ('^' || id::text || '/[0-9a-f-]{36}[.](jpg|png|webp)$')));

-- A contributor may only revise a submission after the moderator requests changes.
-- Revision returns the recipe to 'pending' and clears the previous moderation notes.
CREATE POLICY "Author can resubmit requested changes"
ON public.recipe_submissions FOR UPDATE TO authenticated
USING (author_id = (SELECT auth.uid()) AND status='changes_requested')
WITH CHECK (author_id = (SELECT auth.uid()) AND status='pending');

CREATE OR REPLACE FUNCTION private.eatable_revision_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  IF OLD.author_id = (SELECT auth.uid()) AND OLD.status = 'changes_requested'
     AND NEW.status = 'pending' THEN
     NEW.moderation_note := NULL;
     NEW.reviewed_at := NULL;
     NEW.public_photo_path := NULL;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER eatable_revision_guard
BEFORE UPDATE ON public.recipe_submissions
FOR EACH ROW EXECUTE FUNCTION private.eatable_revision_guard();

-- Expand column-level permissions, leaving row-level admin restrictions in force.
GRANT INSERT (id,photo_path) ON public.recipe_submissions TO authenticated;
GRANT UPDATE (title_en,title_it,description_en,description_it,origin,category,
  prep_minutes,servings,ingredients,steps,photo_path,public_photo_path)
ON public.recipe_submissions TO authenticated;

-- Approved recipe view contains only a public photo path; never the private upload.
CREATE OR REPLACE FUNCTION private.eatable_sync_publication()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    INSERT INTO public.community_recipes
      (id,title_en,title_it,description_en,description_it,origin,category,
       prep_minutes,servings,ingredients,steps,public_photo_path,published_at)
    VALUES
      (NEW.id,NEW.title_en,NEW.title_it,NEW.description_en,NEW.description_it,
       NEW.origin,NEW.category,NEW.prep_minutes,NEW.servings,NEW.ingredients,NEW.steps,
       NEW.public_photo_path,now())
    ON CONFLICT(id) DO UPDATE SET
      title_en=EXCLUDED.title_en,title_it=EXCLUDED.title_it,
      description_en=EXCLUDED.description_en,description_it=EXCLUDED.description_it,
      origin=EXCLUDED.origin,category=EXCLUDED.category,
      prep_minutes=EXCLUDED.prep_minutes,servings=EXCLUDED.servings,
      ingredients=EXCLUDED.ingredients,steps=EXCLUDED.steps,
      public_photo_path=EXCLUDED.public_photo_path;
  ELSE
    DELETE FROM public.community_recipes WHERE id=NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
-- Existing v3 trigger calls this function on status updates.

-- Contributors can write private files only within their own user-ID folder.
CREATE POLICY "Eatable author private photo upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'eatable-private-photos' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text AND
  lower(storage.extension(name)) IN ('jpg','png','webp')
);
CREATE POLICY "Eatable author and admin private photo read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'eatable-private-photos' AND
  ((storage.foldername(name))[1] = (SELECT auth.uid())::text
    OR (SELECT public.eatable_is_admin()))
);
CREATE POLICY "Eatable author private photo cleanup"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'eatable-private-photos' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Publishing and removing public photos is exclusively an administrator action.
CREATE POLICY "Eatable admin publishes photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'eatable-published-photos' AND
  (SELECT public.eatable_is_admin()) AND
  lower(storage.extension(name)) IN ('jpg','png','webp')
);
CREATE POLICY "Eatable admin reads published photo metadata"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id='eatable-published-photos' AND (SELECT public.eatable_is_admin()));
CREATE POLICY "Eatable admin unpublishes photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id='eatable-published-photos' AND (SELECT public.eatable_is_admin()));
-- The public bucket serves images to any viewer by URL, without a SELECT RLS policy.
COMMIT;
