# Eatable v30.3 — Complete ingredient catalog pagination fix

## Confirmed code defect
The deployed application (v9 onward) fetches ingredients using
`.order('name_en').limit(500)` in `src/catalog-cloud.js`.
After the v27, v28 and v30 catalog expansions, that silently omits
ingredients later in the alphabet, even when those ingredients exist
in Supabase. Admin > Import then incorrectly reports those IDs as unknown.

## Apply (recommended, preserves ALL other changes)
1. In your Eatable GitHub repository, open `src/catalog-cloud.js`.
2. Locate the **one** `export const getIngredientVocabulary=...` function.
3. Replace **just that function** with the code in `replacement-only.js`.
   This avoids overwriting any unrelated modifications to that module.
4. Commit, deploy the existing project on Vercel, and wait for the new
   deployment to show Ready.
5. Hard reload the website (Ctrl+Shift+R). In Admin > Import, choose the
   same original Iranian batch JSON again: pre-existing preview rows do
   not automatically revalidate after a reload.

If your `src/catalog-cloud.js` still exactly matches the older original,
`src/catalog-cloud.js` in this archive is a complete drop-in replacement.
For a customized app, the one-function edit above is safer.

## Diagnostic
Run `diagnostics/01_verify_database_ingredients.sql` (read only) in
the SAME Supabase project referenced by your live Vercel environment.
If `missing_id` rows appear, run the existing v30.2 repair SQL; pagination
alone cannot create missing database records. If zero missing rows appear,
the problem was the frontend cap. The two fixes are complementary.

## Why this works
The replacement reads pages of 500 in stable ID order until the final
short page; it preserves the original `{data, error}` response shape
required by `refreshCommunity()` and the subsequent `mergeVocabulary()`.
It stops at 10,000 records with an explicit error instead of silently
using an incomplete list. No change to app.js, recipes, photos, admins,
accounts, or existing records is necessary.

## Local tests
`node tests/test-pagination.mjs` checks both multiple pages and errors.
No external dependencies. This test exercises the query semantics using
a fake Supabase client rather than contacting your live project.
