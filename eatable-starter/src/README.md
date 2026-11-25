# Eatable v30.4 — Ingredient Search Ranking Fix

## What changed

The homepage **Find Recipes** flow now opens `/cook` with a single ranked result list. With selected ingredients:

1. Recipes with **more matching selected ingredients** rank higher.
2. At equal match counts, a higher **percentage of recipe ingredients available** ranks higher.
3. Remaining ties use fewer missing ingredients, shorter cook times and recipe name.
4. Recipes matching zero selected ingredients are omitted.

When no ingredients are selected, the previous 12-featured-recipes behavior is preserved. Existing cuisine, diet, time filters, missing-ingredient notices, substitutions and bilingual EN/IT labels remain active.

### Installation (no Supabase/SQL changes)

1. **Back up** your two current files in GitHub.
2. Replace **only** `src/recipes.js` and `src/app.js` with the versions from this ZIP.
3. Do **not** replace `src/catalog-cloud.js`. Keep the v30.3 pagination fix.
4. Commit and redeploy on Vercel, then hard-refresh.
5. Test the homepage search in both English and Italian with 3–5 ingredients, and verify ranked recipe cards show `x/y` coverage.

`src/recipes.js` is based on the v30.1 Iranian/Lebanese module; `src/app.js` is based on the v29 homepage photo code. If your deployed copies of these two files have other modifications **after** those versions, merge only the modified `matchRecipes()` and `cook()` functions (see `patch-only.md`) instead of replacing the whole files.

### Validation
`npm test` runs a deterministic local test of the matching function. JS syntax checks are also performed.

No database migration required. The fix does not increase the total number of recipes loaded from Supabase; that remains a separate catalog-pagination concern.
