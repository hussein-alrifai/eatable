# Eatable v8.0 — Recipe Library & Editorial Quality

Incremental update from **your working Eatable v7.0**. This release does **not** replace your Supabase project or delete any recipes, members, favorites, or photographs. **Do not create a new repository or project.**

## What changed

- New private administrator **Recipe Library & Quality** dashboard at `/en/admin-quality` and `/it/admin-quality`.
- Catalog statistics: recipe count, Lebanese entries, photographed entries, editorial review completion and progress toward a **minimum 60 reviewed published recipes** (overall target remains 60–100).
- Filters for recipes needing review, completed reviews, missing cover photos, drafts and published recipes.
- Individual editor-review checklist: actual recipe testing, ingredient measurements, English/Italian translations, image rights, and cultural/dietary classification. Optional internal notes.
- Automatic **caution flags** for missing photographs, absent translations, only one step/ingredient, unclassified diet/cuisine, or unchecked editorial review. These are heuristics, not food-safety certification.
- **Export CSV**: Excel-compatible local export of the catalog and editorial checks, with spreadsheet-formula injection protection.
- If a previously reviewed recipe is materially changed, the affected review boxes are invalidated automatically by PostgreSQL triggers. Replacing a draft or published photo resets its usage-rights check.
- New editorial backlog document, `docs/RECIPE_BACKLOG_80.md`, with **80 proposed recipe titles**, NOT automatically published or verified content.

**This version does not add 80 recipes automatically.** Your existing 18 demonstration recipes plus recipes you created remain as they are. Content must be cooked, measured, translated, photographed with permission, and reviewed before launch.

## Installation — important order

1. **Confirm that v7 works.** Keep the most recent v7 GitHub commit as a rollback point. Your existing Supabase project stays intact.
2. **Supabase migration:** Open the **existing** Eatable Supabase project → SQL Editor → New query. Run **only** `sql/07_content_quality.sql`. Do not rerun migrations 01–06. The new `eatable_curated_reviews` table has admin-only RLS and new server triggers for stale reviews. Existing recipe publication status is unchanged.
3. **Verify database:** In Table Editor, confirm `eatable_curated_reviews` exists with RLS enabled. In Authentication, the same account should still have the `admin` role. (Do not share private project credentials.)
4. **GitHub update:** Extract the ZIP. Upload its **contents** directly to the root of your existing `eatable` repository, replacing matching paths. **Keep `src/supabase-config.js` unchanged.** It is intentionally **not** included in this ZIP.
5. **Vercel:** Wait for a new **Ready** production deployment, then open `https://YOUR-DOMAIN/eatable-version.txt`. It should say `Eatable v8.0`.
6. **Admin access:** Sign in, then visit `/en/admin-quality` or `/it/admin-quality`; or use Admin → Recipe Library & Quality.

## Live smoke test

1. Open `/en/admin-quality` and confirm Batata Harra appears in the catalog (if you created it during v6 testing).
2. Open its **Review** page. Check each box only when the underlying item has actually been verified. Save review. Open it again to confirm it persists in Supabase.
3. Filter by **Review complete** and **Needs review**. A photo and a minimum of two ingredients and steps are required to clear the automatic caution flags. Review completion is a process marker, not a guarantee of safety.
4. Open the same page in Italian (`/it/admin-quality`) and confirm translation.
5. **Export quality report (CSV)**, open locally in a spreadsheet app, and confirm the statuses appear.
6. Edit the approved recipe's title or steps in `/en/admin-curated`. Save; return to the quality dashboard. Relevant review checkboxes should now be **unchecked** automatically. A replacement photo must also invalidate the photo-rights checkbox.
7. Sign out and visit `/en/admin-quality` or try reading `eatable_curated_reviews` with a normal account. The private checklist must not be exposed. Check that existing v7 community and curated recipes still work.

## Notes on quality and publication

- **Existing published recipes remain published**, even if they have not yet been reviewed. v8 flags them for your attention. It does not silently unpublish a working site.
- Manual checks are editor attestations, not automated allergy detection, cooking-temperature certification, historical fact-checking or license verification. Keep independent evidence for recipe testing and image permissions.
- The new review data is accessible to admins only through RLS. The UI showing a hidden link is not the security boundary.
- The SQL migration introduces a new table and database triggers; a GitHub rollback to v7 will not automatically remove them, and it does not need to. Do **not** drop tables to roll back the website.
- If the dashboard reports `eatable_curated_reviews` missing, confirm you ran migration 07 in the **same Supabase project** used by Eatable.
- The app is a static Vercel frontend; no build command is required for the current project.

## Build verification

- `node --check` passed for every JavaScript module.
- `node tests/quality.mjs` passed for editorial checks, filters, HTML rendering, CSV escaping and translations.
- Existing `tests/smoke.mjs` passed with a temporary **empty** Supabase config stub (not included in the release).
- No live access to your Supabase credentials, database or GitHub repository was available for a full end-to-end test. Run the steps above on your project.
