# Eatable v16.0 — Content Studio + 12 Bilingual Drafts

**Incremental patch for your existing, working v15 Eatable repository.** No database migration. No changes to account credentials. No deletion of old files. **Never replace the repository with only the contents of this patch.**

## What's included

- `/en/admin-launch` and `/it/admin-launch`: admin-only Content Studio. Compares the 80 *candidate dishes* from the established content plan (35 Lebanese + 45 international) with actual curated records already in your Supabase project. Shows: missing / draft / published but requiring editorial review / launch-ready. Filter by status and cuisine group, search and export a CSV audit.
- `/en/admin-import`: new **Load 12 new v16 drafts** button. The existing v9 importer validates ingredients, titles and translations, skips duplicate slugs, and imports selected entries **only as unpublished drafts**.
- `/data/recipe-pack-v16.json`: 12 bilingual candidate recipes; edited titles disclose substantial home-style adaptations. No photos. These have not been cooked or independently tested and **must not be automatically published**.
- English and Italian admin labels; no public navigation or restaurant changes.

## Exactly how to install

1. In GitHub, **record the last successful v15 commit hash** so you can revert the code if needed. Don't touch your database.
2. Extract the ZIP, and **upload/overwrite ONLY these paths** in the root of the *existing* GitHub repository:
   - `src/app.js` (updated)
   - `src/launch-backlog.js` (new)
   - `src/launch-planner.js` (new)
   - `assets/styles.css` (updated)
   - `data/recipe-pack-v16.json` (new)
   - `eatable-version.txt` (updated)
3. Do **not** delete existing files. Especially preserve `src/supabase-config.js`, user uploads, and the previous JSON recipe pack.
4. Allow Vercel's **Production** deployment for this commit to become **Ready**. Check `https://YOUR-DOMAIN/eatable-version.txt` says `Eatable v16.0`. If it still shows v15, check the GitHub branch, root directory, and Production deployment before changing the database.
5. Sign in as admin. Open `/en/admin-launch`; the content planner should appear. Try filters, search, link to editing, export CSV, and the Italian `/it/admin-launch`.
6. Open `/en/admin-import`, select **Load 12 new v16 drafts**, review the preview and import **only one** first. Check it stays a draft in `/en/admin-curated`; then check it is NOT publicly visible in Explore. Import the remaining drafts when the first succeeds.
7. Edit each draft, validate measurements and bilingual instructions by cooking/testing, add owned/licensed photographs and complete the editorial checklist before publication.
8. Regression check: reviews and moderation, login, ingredient search, My Kitchen, personal collections, photos, admin recipe editor.

## Existing plans vs the 80-dish target

The planner matches exact slugs, exact normalized titles, and *a short explicit list* of known editorial equivalents. It avoids fuzzy matching, so a home-style variant may still show as missing in the official plan. Some matching rules relate an original demo recipe to a target dish; this only indicates a **catalog match**, not historical authenticity or publication readiness. Actual launch-ready counts come from published curated recipes with complete quality reviews and no automated warning flags. The 80 planned items are **not** a claim that 80 recipes are in Supabase. Recipes not listed in the plan are still visible in the existing v8 quality dashboard.

## Known limitations

- No automatic nutrition, allergy, food safety, cultural origin, or image licensing certification.
- Demo recipes and v16 starter drafts require real cooking tests; publication is an admin decision.
- This is an **admin planning dashboard**; normal users cannot open it. Supabase RLS remains the actual authority for recipe access and publishing.
- A live authenticated Supabase/browser end-to-end test was not possible here. Verify on your deployed site.
