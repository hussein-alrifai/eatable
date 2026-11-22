# Eatable v7.0 — Curated Recipe Photography

Incremental release **from an already-working Eatable v6.0**. The existing Supabase project, members, published recipes, recipe submissions, favorites, and administrator roles are preserved. **Do not create a new Supabase project.**

## What this version adds

- Admin-only photograph upload (JPEG/PNG/WebP, max 5 MB) directly from `/en/admin-curated` or `/it/admin-curated`.
- Local selected-file preview; existing published-image preview; signed private-draft preview on demand.
- When saved as a **draft**, the cover remains in the existing private Supabase bucket.
- When **published**, the photo is copied into the existing public bucket and appears on recipe cards and the recipe detail page.
- Replacing or removing a photo cleans up obsolete private and public files after the database update. Cleanup failures are reported.
- An admin summary shows recipes with photos; unphotographed recipes have a visible flag.
- Separate `eatable_curated_media` table stores unpublished image paths with admin-only Row Level Security; public catalog queries do not expose them.

The 18 initial sample recipes still exist. This release **does not** automatically provide 60–100 verified recipes, generate photos, validate the provenance of uploaded images, or change restaurant features.

## Install in exactly this order

1. **Backup**: Confirm v6 is working and that the last GitHub commit is available to roll back. Retain the current `src/supabase-config.js` with your new Supabase project URL and publishable key.
2. **Run only migration 06**: Open the **existing** Supabase project → SQL Editor → New query. Paste `sql/06_curated_photography.sql` and select **Run**. It adds a public cover path to existing curated rows, a private admin-only media table, RLS, and a draft-publication guard. This SQL **reuses** the two v4 buckets (`eatable-private-photos`, `eatable-published-photos`). Do **not** run earlier migrations 01–05 again.
3. **Verify the database**: Under Table Editor, inspect `eatable_curated_recipes` (new `public_photo_path` column) and `eatable_curated_media` (RLS enabled). Under Storage, confirm the two v4 buckets remain present. Do not make the private bucket public.
4. **Update GitHub**: Extract the v7 ZIP. Upload its **contents** into your existing `eatable` repository root, replacing matching paths. **Keep `src/supabase-config.js` unchanged**; the ZIP intentionally does not include it. Commit the changes on the branch connected to Vercel.
5. **Verify deployment**: Vercel → Deployments → latest production deployment **Ready**. Visit `https://YOUR-DOMAIN/eatable-version.txt` and confirm **Eatable v7.0**.
6. **Open the editor**: Sign in with your admin account and visit `https://YOUR-DOMAIN/en/admin-curated` (or `/it/admin-curated`).

## Live verification — Batata Harra (recommended)

1. Edit the **Batata Harra** test recipe you created in v6.
2. Upload a JPEG photo under 5 MB, save it as **draft**, and inspect the admin editor again. A private preview should be available after clicking **Preview private draft photo**.
3. Open the recipe in a signed-out/private browser; it **must not** be publicly accessible while unpublished.
4. Return as admin, select **Publish recipe**, then confirm its image appears in Explore, in The Lebanese Table, and in `/en/recipes/batata-harra`. Repeat with `/it/recipes/batata-harra`.
5. Replace the photo with another image and publish again. Verify the new one appears. (Browsers can cache images; reload if needed.)
6. Select **Save as draft / Unpublish**. The recipe should disappear from public search and its image should no longer be referenced from public Eatable pages.
7. Sign in as a normal user (or use a private window) and verify they cannot read or write rows in `eatable_curated_media` through Supabase APIs. Do not rely on the admin link being hidden.
8. Verify previously approved *community* photos and recipes still render normally.

**Privacy note:** An image that was previously published may remain in external caches or in saved copies. Unpublishing removes its reference from Eatable and tries to delete its public storage object; it does not guarantee deletion from third-party caches. The app will report if storage cleanup fails.

## Security and publication notes

- Uploads use the pre-existing authenticated-storage policies; public file writes are admin-only, enforced by the v4 Storage policies.
- The v7 table uses its own admin-only RLS policies. Public visitors may only select published curated rows; the database also clears `public_photo_path` when a recipe is unpublished.
- Storage files are handled through Supabase Storage APIs, not through direct manipulation of `storage.objects`.
- Only upload photographs you created or are allowed to use. For third-party images, keep proof of permission and any required attribution.
- A cover photograph does not prove a recipe was tested, safe for allergies, or historically authentic. Review the content checklist in `docs/CURATED_CONTENT_CHECKLIST.md`.

## Troubleshooting

- **`eatable_curated_media does not exist`**: v7 SQL was not run in the same Supabase project used by your website.
- **`permission denied` / RLS violation**: verify you signed in with the existing administrator account and that migration 06 completed.
- **Storage upload error**: verify v4 migration 03 and the two photo buckets are present; use JPG/PNG/WebP under 5 MB. Avoid setting a private bucket to public.
- **Public recipe appears without a photo**: verify the recipe was actually published, reload after the new deployment, then inspect its `public_photo_path` in the published curated row.
- **Account page says Supabase is not configured**: your existing `src/supabase-config.js` was overwritten or moved; restore it from your last working GitHub commit. Never put the Supabase secret/service-role key in browser code.

## Rollback

You can redeploy your previous v6 GitHub commit. Migration 06 adds columns and an admin-only table and does not remove v6 data. A site rollback does **not** itself erase the new photo records or their Storage objects. Do not manually delete storage metadata in SQL; use Supabase Storage APIs for cleanup.

## Verification scope

JavaScript syntax and isolated editor, photo-path, and image-format checks passed. A full live Supabase migration / RLS / upload / publication test requires your connected Eatable project and must be performed using the steps above. The local graphical browser smoke test could not run because the execution environment blocked localhost access.
