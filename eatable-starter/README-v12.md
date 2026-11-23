# Eatable v12.0 — Mobile Cooking Mode

This is an **incremental update** for the working Eatable v11 website. It upgrades the cooking overlay without changing the database or the existing authentication, user favorites, curated editor, community submissions, recipe search, pantry, or shopping-list features.

## What's new

1. **Mobile-first cooking screen:** readable step text, simplified header, sticky bottom navigation with large controls, and scrolling for lengthy instructions.
2. **Ingredient checklist while cooking:** show or hide all ingredients, mark them as prepared, and adjust serving size for structured recipes. For community-submitted text-only ingredients, the interface does not claim amounts can be scaled.
3. **Resume cooking:** the last step is remembered in **the same browser** after leaving the page or refreshing it. Each recipe has its own progress. Completing a recipe clears its saved progress. Editing the recipe steps invalidates saved progress to avoid resuming against old instructions.
4. **Step navigation:** Previous, Next, a jump-to-step selector, and left/right keyboard arrows while the overlay is open.
5. **Larger text toggle**, plus English and Italian labels.
6. **Accessibility details:** dialog label, progress indicator, focus return, focus wrapping, keyboard Escape, reduced-motion-aware progress bar.

## Installation (no SQL required)

1. Confirm that v11 is running correctly and keep that successful GitHub commit as a rollback point.
2. Download and extract the `eatable-v12-mobile-cooking.zip` package.
3. Upload its **contents** into the **root of your existing GitHub Eatable repository**, replacing matching files in their original paths. Upload individual files and folders, **not** the ZIP itself and not an extra `eatable-v12` folder.
4. The update includes only:
   - `src/app.js` (updated; replaces v11 copy)
   - `src/cooking-mode.js` (new file; **must** be uploaded)
   - `assets/styles.css` (updated; replaces v11 copy)
   - `eatable-version.txt` (now `Eatable v12.0`)
   - `tests/cooking-v12.mjs` (optional local unit tests)
   - `README-v12.md` (this document)
5. **Do not replace or edit `src/supabase-config.js`.** It is intentionally not included in the update.
6. In Vercel, confirm the new Production deployment is `Ready`, then open `https://YOUR-DOMAIN/eatable-version.txt`. It should say `Eatable v12.0`.
7. Hard-refresh the website (`Ctrl + Shift + R`) if a cached version is shown.

**No Supabase migrations, keys, buckets, or new projects are required.** The v11 SQL migration remains installed.

## Live verification

1. Open a published recipe with at least three preparation steps and click **Start cooking**.
2. Advance to Step 2; open the ingredient panel and check an ingredient.
3. Turn on larger text. Choose another step from the jump selector. Check that Previous/Next work on mobile.
4. Close cooking mode and refresh the recipe page. The **Resume cooking** action should appear if you left at Step 2 or later.
5. Resume, navigate to the last step, and click **Finish**. The Resume action should disappear.
6. Repeat in Italian (`/it/recipes/RECIPE-SLUG`) and check a community-submitted recipe with plain-text ingredients.
7. Confirm that regular search, login, favorites, My Kitchen, shopping lists, and admin pages still work.

## Security / scope

- Cooking progress is stored in the user's browser's `localStorage` only. It **does not sync across devices**; there is no Supabase table for it. Do not treat it as cooking-history analytics.
- This release does not infer cooking durations or supply automatic timers where the original recipe provides none.
- No new personal data is sent to an external service by these changes.
- No changes to database authorization, photo buckets, or user permissions.

## Tests performed during packaging

- `node --check src/app.js` and `node --check src/cooking-mode.js` — passed.
- Existing v7–v11 unit/regression suites — passed.
- v12 progress persistence, invalidation after recipe changes, multilingual copy, and step clamping — passed.
- Simulated interaction tests: open, Next/Previous, ingredient panel, larger text, close, resume, and finish in English and Italian — passed.
- A true Chromium browser test could not run because this environment blocks browser navigation. **Test on the actual Vercel deployment before considering the release fully verified.**

## Rollback

If the website becomes blank or encounters an error, use GitHub's commit history / Vercel's previous successful deployment to restore the v11 code. Do not delete your Supabase project or database tables.
