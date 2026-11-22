# Eatable v4.0 — Recipe photos and correction workflow

**Incremental upgrade from Eatable v3.0.** Keeps your existing Vercel project, your already-configured `src/supabase-config.js`, authentication, favorites, submitted recipes, and admin roles. The ZIP deliberately excludes your Supabase config file.

## What v4 adds

- **Real recipe photos:** Registered contributors can upload an optional image (JPEG, PNG, WebP, maximum 5 MB). Until approval, photos live in a **private** Supabase Storage bucket, accessible only to their author and admins using short-lived signed URLs.
- **Photo publication:** When you approve a recipe, the administrator's browser copies its image to a separate public bucket, *then* saves the approval decision. Published community recipes display that public image. Only admins can write to the public bucket.
- **Corrections:** If an admin selects **Request changes**, the contributor sees the feedback and can edit the **same submission**, replace or remove their photo, and send it back to **Pending review**. Users cannot directly approve their own submissions.
- **Unpublication:** When an administrator rejects a previously approved recipe or requests changes, the public recipe entry is removed and the admin client attempts to delete its public photo. Previously cached public images may remain accessible temporarily.
- **English and Italian interfaces** for the revised submission experience.

## Installation — keep this order

1. **Do not create a new Supabase project. Do not rerun the v2/v3 migrations.** You must already have `public.profiles`, `public.user_favorites`, `public.recipe_submissions` and `public.community_recipes` from Eatable v3.
2. In **Supabase → SQL Editor → New query**, paste the entire `sql/03_photos_revisions.sql` file and select **Run**. Confirm success. The migration creates storage buckets, photo columns, a revision policy, and upload/download policies. Run it only once. You should see two buckets under **Storage**: `eatable-private-photos` (**Private**) and `eatable-published-photos` (**Public**).
3. Open your existing **GitHub `eatable` repository** and upload the *contents* of this ZIP to the same folder as your deployed `index.html`, replacing matching files. **Keep `src/supabase-config.js` exactly as it is.** The new ZIP does not contain it.
4. Commit changes and verify Vercel reports the new production deployment **Ready**.
5. Open `https://YOUR-DOMAIN/eatable-version.txt`. It should say **Eatable v4.0**. If not, check Vercel's root directory, current GitHub commit and production deployment before changing anything else.

## Test end-to-end

Use **two accounts**: a standard member and your already-promoted admin.

1. As the member, open `/en/submit`, submit a recipe with a photo; see **Pending review** in `/en/my-recipes`. The public `/en/community` page must not show it yet.
2. As admin, open `/en/admin`. You should see a private image preview. Choose **Request changes** and add a note.
3. As the member, open `/en/my-recipes` and select **Edit and resubmit**. Change the recipe, optionally replace the photo, then submit it. Its status should return to **Pending review**, without creating a duplicate recipe.
4. As admin, **Approve and publish**. The image should now appear in `/en/community` and the community recipe detail page. Verify from a signed-out browser.
5. As admin, reject that same recipe. It should disappear from the public page. Confirm the storage file is removed from the public bucket (depending on caching, an already loaded photo may still appear for a while).
6. Verify a normal member cannot open the admin queue or change a recipe to `approved`, and that one member cannot see another member's private photos or drafts.
7. Test both `/en/` and `/it/` interfaces, and desktop/mobile form layout.

**Notes:** Uploads run from the browser: keep the tab open while uploading or approving. Image privacy is enforced in Supabase Storage policies, not just by hiding the image in the interface. The approval and photo-copy operations are not one database transaction, so a network interruption can leave an orphaned public file; the site attempts cleanup, and admins should occasionally inspect the public bucket. This is a useful MVP, not a fully hardened production media pipeline. At scale, move the photo-publication workflow into a secure server function and add automated orphan cleanup.

## Not yet included

Full drafts/autosave, multiple photos per dish, photo reordering, edits to approved recipes without unpublishing, community recipe search inside the normalized ingredient matcher, and community recipe favorites. These are subsequent milestones.
