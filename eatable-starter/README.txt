Eatable v28.2 — White Screen Recovery (one-file hotfix)
========================================================

ROOT CAUSE VERIFIED:
The v28.1 src/recipes.js accidentally omitted the exported substitutionFor()
function used by src/app.js, causing browser module loading to fail.
It also regressed the matching percentage, ingredient aliases, and substitution
suggestions. This corrected file restores those features and retains the
national cuisine list from v28.1.

INSTALL EXACTLY ONE FILE:
1. In GitHub, open your Eatable repository.
2. Replace ONLY `src/recipes.js` using the file inside this archive.
   Keep the v28.1 `src/bulk-import.js` and `src/curated-editor.js` as they are.
3. Commit changes to your production branch.
4. Wait for the Vercel production deployment to be Ready.
5. Hard-refresh https://cookwitheatable.com (Ctrl+Shift+R).
6. Verify the homepage, the ingredient search, and the admin recipe importer.
7. Upload the original `recipes-v28-01.json` and check that Syrian and
   Palestinian dishes are recognized as valid drafts.

If the site is still white, open Chrome DevTools (F12) > Console and send
just the first red JavaScript error message. Do not share any API keys.

ROLLBACK:
To restore your site immediately before installing this file, promote a
previous working Vercel deployment. Also revert the faulty commit in GitHub
if you do not plan to install the hotfix, so subsequent deployments are safe.

VALIDATION:
- JavaScript syntax checked with Node.js.
- All 86 recipes from the four v28 JSON batches passed import validation.
- All imported symbols used by the existing app from recipes.js are present.
- Ingredient matching percentage, substitutions, and Italian search aliases verified.

No SQL migration or new credentials. No recipes, accounts, or Supabase data are changed.
