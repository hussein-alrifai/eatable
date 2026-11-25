# Eatable v29 — Admin-selected homepage photo

## Install in order
1. Supabase → SQL Editor → New query. Run `sql/13_homepage_hero.sql`.
2. In GitHub replace **only** `src/app.js` with `src/app.js` from this package. Optionally update `eatable-version.txt`. Keep your current `src/recipes.js`, `src/bulk-import.js`, and `src/curated-editor.js` from your v28.2/v28.1 fixes.
3. Commit, wait until Vercel Production is Ready, then hard-refresh the website.
4. Sign in as admin at `https://cookwitheatable.com/en/admin` and click **Homepage Photo** (or visit `/en/admin-hero`).
5. Choose a published recipe with a public photograph and Save. If none appears, first publish at least one curated recipe and its photo. Refresh the homepage, also in a private window, and verify English and Italian display the same photo.

## Functionality
- Site-wide, persisted choice in Supabase; all visitors see the same photograph.
- Uses a **published recipe's existing public photograph**, not a new upload. Upload and publish photos through Curated Recipe Editor first.
- Published curated recipes and approved community recipes are eligible if `state.catalog` contains a public photo.
- The admin panel lists **published recipes with public photos** only.
- A missing/unpublished selected recipe falls back to Eatable branded illustration, not random pasta.
- "Automatic" restores the previous old photo-selection logic; before the first selection it is the default.
- "Branded artwork" shows the Eatable illustration with no recipe photo.
- Both `/en` and `/it` use the same database setting. No extra Vercel environment variables.

## Safety
- A single new table and policies; existing recipes, login, photos, reviews, and importer are unchanged.
- Public SELECT; admin-only INSERT/UPDATE protected by `eatable_is_admin()` from existing migrations.
- An absent migration or network error only causes a warning/fallback, not a white screen.
- This file comes from the latest v26 `src/app.js` source available in the previous project. If you edited `src/app.js` locally since v26, merge using `src/app.patch` instead of replacing it wholesale.

## Checks
- `node --input-type=module --check < src/app.js`
- The patch does not touch the 3 national-cuisine importer files.
- Testing against a live production Supabase project was **not** performed.
