# Eatable v17.0 — Search Coverage Lab

Incremental update for the **existing v16** Eatable GitHub repository. **Do not delete any old files**. Does not change Supabase schema, API credentials, reviews, or customer data.

## What is new

- Private admin page `/en/admin-coverage` and `/it/admin-coverage`.
- Counts published, ingredient-search-ready recipes and approved community recipes still awaiting ingredient indexing.
- Measures catalog coverage for each standardized ingredient and groups recipes by cuisine.
- Tests 10 **illustrative** pantry combinations against the *current public, indexed catalog*. Displays the number of exact ready-to-cook matches and recipes missing at most two ingredients.
- Identifies ingredients used in zero or just one public, indexed recipe to inform content production.
- CSV export; English/Italian UI; responsive layout.

## Install without losing previous work

1. Confirm that your latest **v16** deployment works and record its successful GitHub commit. You can roll the frontend back to that commit.
2. Extract this ZIP and overwrite **only** `src/app.js`, `src/coverage-audit.js` (new), `assets/styles.css`, and `eatable-version.txt` in the existing repository. Do not replace any other files or folders.
3. **Keep `src/supabase-config.js` unchanged.** No new SQL migration is needed. Do not rerun migrations 01–11.
4. Commit to the production branch. In Vercel, verify the deployment is Ready, and that `/eatable-version.txt` says `Eatable v17.0`.
5. Sign in as administrator and open `/en/admin-coverage` or `/it/admin-coverage`. Test the admin link, ingredient/cuisine coverage, sample pantry results, and the **Export CSV** button.
6. Regression test: `/en/recipes`, `/en/cook`, review submission, My Kitchen, personal collections, photo publication, `/en/admin-launch` and `/en/admin-import`.

## Interpretation and limitations

- Counts are **not unique visitors, popularity scores, user pantry analytics or nutrition information**. No users' personal pantry data is read by the Coverage Lab.
- "Ready to cook" compares ingredient *types* only. No quantities, allergens or substitutions are considered. Salt/water/oil are **not** automatically assumed.
- Community submissions without verified ingredient mapping remain outside ingredient-search coverage until indexed by admin.
- This update does **not** add any new recipes; 60–100 tested bilingual recipes remain the launch content target.
- Browser permissions/SQL RLS remain enforced by existing Supabase tables; this page is shown only to the authenticated admin account.
- Tested with Node ES module syntax checks and pure-function regression tests against the existing demonstration catalog; live Supabase verification is still required after deployment.
