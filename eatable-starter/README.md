# Eatable v9.0 — Batch Recipe Draft Import

An **incremental update** to your working Eatable v8 site. This is NOT a new project. Your existing accounts, favorites, community submissions, photos, Supabase configuration, and curated recipes remain intact.

## What's new

- New **admin-only** page: `/en/admin-import` and `/it/admin-import`.
- **One-click starter pack:** 8 bilingual recipe candidates (4 Lebanese, 4 international). The included candidates have full English and Italian names, descriptions, ingredients, quantities, and preparation steps.
- **JSON file import:** upload additional recipe drafts in batches of up to 25 (max 400 KB) using the same format as `data/recipe-starter-pack.json`.
- **Preflight preview** before anything is saved. Rejects missing translations, invalid ingredient IDs, duplicate ingredient IDs, duplicate slugs, unsupported classifications, and invalid quantities.
- **Insert-only and draft-only:** never overwrite an existing recipe. Imports cannot publish recipes, alter accounts, or set photographs.
- **Reuse existing editorial review workflow:** new drafts appear in `/en/admin-curated` and `/en/admin-quality` for review and manual publication.

## Installation — NO SQL migration needed

1. Confirm v8 is working. Keep the latest functioning GitHub commit as a recovery point.
2. Extract `eatable-v9-bulk-recipes.zip`. Upload its **contents** directly into the root of your **existing** `eatable` GitHub repository, replacing the matching code files. Do **not** put them inside another `eatable-v9` folder.
3. **KEEP** your existing `src/supabase-config.js` unchanged. This ZIP deliberately **does not contain** that file.
4. The GitHub commit should trigger Vercel deployment. Verify its Production status is **Ready**.
5. Visit `https://YOUR-DOMAIN/eatable-version.txt`; it should display `Eatable v9.0`.
6. Sign in as your administrator and open `/en/admin-import` or `/it/admin-import`. The link is also in the administrator dashboard and curated editor.
7. Click **Load 8 sample drafts**. Inspect the preview, deselect anything you don't want, then click **Import selected as drafts**.
8. Go to `/en/admin-curated` to see the new drafts. Review and add your own legally usable photos; verify tested quantities, English/Italian instructions and origin; use the quality dashboard to record the actual editorial checks. Publish **individually** only after reviewing.

## How to import your own recipes

- Download `data/recipe-starter-pack.json` from the site, or edit the included file with a text editor.
- Keep the top-level structure `{ "version": 1, "recipes": [ ... ] }`.
- Required keys for each recipe: `slug`, `title_en`, `title_it`, `description_en`, `description_it`, `cuisine`, `category`, `diet`, `prep_minutes`, `servings`, `ingredients`, and `steps`.
- Ingredient rows use `{ "id": "chickpeas", "qty": 400, "unit": "g" }`; use **exact canonical ingredient IDs** that exist in the Supabase ingredient vocabulary. For new ingredients, add them in **Admin → Ingredient Indexing** before importing.
- Step rows use `{ "en": "...", "it": "..." }`.
- Cuisine choices: `Lebanese`, `Italian`, `Middle Eastern`, `Indian`, `Japanese`, `Mexican`, `Greek`, `Spanish`, `Other`.
- Categories: `Main`, `Mezze`, `Salad`, `Breakfast`, `Soup`, `Bread`, `Dessert`, `Drink`, `Other`.
- Diet: `vegan`, `vegetarian`, `none`, `unknown`; this classification is a draft editorial selection, not a medically checked allergen guarantee.
- Quantity units: `g`, `kg`, `ml`, `l`, `pcs`, `tsp`, `tbsp`.
- Max 25 recipes per upload. Files larger than 400 KB are rejected.

## Important safeguards

- `published` is **always forced to false** for imported items, even if an input file contains `"published": true`.
- Input fields claiming `public_photo_path`, a role, or other privileged attributes are ignored.
- The importer makes **insert-only** requests. Existing slugs are skipped; database unique constraints protect against races. No previously existing recipe is modified.
- **Database Row Level Security** remains the source of authorization: only an admin account can insert curated recipes. Hiding the admin link alone would not be sufficient.
- It does not run recipes through a culinary testing process or import copyright-cleared photographs. The included eight recipes are **draft candidates**, not reviewed, tested, or launch-ready dishes.
- If some inserts fail, the page lists per-recipe errors; successes are preserved, failures can be corrected and retried. Reopening the sample pack then skips already-imported slugs.
- This release does not modify any database schema. Do not run old SQL migrations again.

## Suggested live test

1. Import only **Mujaddara** to start. Confirm `/en/admin-curated` shows it as **Draft** and `/en/recipes/mujaddara-rice-lentils` does NOT publicly expose it.
2. Load the sample again and confirm Mujaddara says **Already in the catalog**, not selectable.
3. Import the remaining drafts, verify each appears privately in the editor, then open `/en/admin-quality`. They should be flagged for review, especially missing photos and manual test checks.
4. Use a normal, non-admin account to open `/en/admin-import` and attempt inserts with browser developer tools: database RLS should deny the write.
5. Confirm existing recipes and submitted community content still display normally.
6. Switch to `/it/admin-import` and confirm labels and draft translations.

## Tests

- `node --check` on the JS modules.
- `node tests/import.mjs`: JSON limits, 8 bilingual candidates, canonical ingredients, duplicate detection, non-public imports, privilege-field stripping, bilingual rendering.
- `node tests/quality.mjs` and `node tests/smoke.mjs`: previous milestone regression tests.
- These tests do not replace live end-to-end testing on your Supabase and Vercel project.

## Project roadmap

v9 provides a safe **bulk drafting workflow**, not a completed 60–100 recipe collection. Next content work: test and photograph the candidates, improve ingredient substitutions and optional ingredients, and build search/SEO quality before restaurant integration.
