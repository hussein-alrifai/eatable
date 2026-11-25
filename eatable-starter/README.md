# Eatable v30.6 — Ingredient matching + honest ranking

## Root causes verified against v30.5 source
1. Only a few ingredient families were mapped. Generic choices (tomato, chickpeas, bulgur, cucumber, eggplant, etc.) did not match common canonical variants used by v27/v28/v30 imports.
2. The ingredient result cards displayed `matched/recipe-total`, not `matched/selected-total`, which made the intended "more of what I have" order difficult to verify.
3. Homepage input only resolved one ingredient at a time; comma-separated lists were rejected.
4. `getCuratedCatalog()` still had `.limit(500)`, silently excluding later published recipes once the database grows. This was *not* solved by the v30.3 ingredient vocabulary pagination.

## Install — GitHub / Vercel
1. Back up your CURRENT `src/recipes.js`, `src/app.js`, and `src/catalog-cloud.js` before making changes.
2. Replace those exact files with the copies from `src/` in this ZIP. `src/app.js` is based on v30.5 and contains v29 homepage-photo support. `src/catalog-cloud.js` is based on v30.3 and preserves all other exports, including the ingredient pagination (and fixes the exactly 10,000 rows edge case). If you've modified these files since v30.5 or v30.3, merge the changes instead of overwriting.
3. Commit and deploy to Vercel. Hard-refresh using Ctrl+Shift+R.
4. No SQL migration and no recipe re-import are required.

## Expected search
- Homepage: type `chicken, rice, onion` and press Find Recipes; all three are added as chips.
- Single word: `tomato`, `chickpeas`, `bulgur`, `eggplant`, `cucumber`, `rice`, `beef`, `lentils` match their known varieties.
- Recipes are sorted by *number of selected ingredient types used*, descending; then percentage of recipe ingredients present; then exact matches, missing count, preparation time and title.
- 0-match recipes are excluded whenever any ingredient is selected.
- Each recipe card shows BOTH: `Uses X of your Y ingredients` and `Recipe ingredients matched: X/Z`.

## Culinary caution
Varieties/cuts and prepared forms are not always identical. Such matches retain a visible `Check variety/cut` notice and missing-ingredient detail. For safety and recipe accuracy there is no substring matching; e.g., chicken != chicken stock/liver, rice != rice flour/noodles, tomato != tomato paste, egg != egg yolk.

## Tests
Run `node --test tests/*.test.mjs` with Node 22+ from the unpacked root. Tests include real imported v28 and v30 recipe data, selected-ingredient ranking, negative-match checks, search parsing and catalog paging.

## Limitations
- The published community-recipe endpoint may still return the first 100 community recipes; this package fixes the curated published catalog only. Review community pagination separately if needed.
- Unpublished recipes and unindexed community submissions are not searchable by design.
- This package is locally tested against recovered v30.5 code and published import fixtures; it has not been verified against the live Vercel/Supabase deployment.
