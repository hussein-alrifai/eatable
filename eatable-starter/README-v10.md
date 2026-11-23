# Eatable v10.0 — Smarter Ingredient Matching

This is a **small upgrade to the working v9 hotfix**. Apply it to your **existing GitHub repository**. Do not create a second Eatable project. Do not delete your Supabase data.

## What changed

1. Ingredient typeahead understands selected English and Italian synonyms and plurals, e.g. `potatoes` / `patate` → `potato`; `garbanzo beans` / `ceci` → `chickpeas`; `scallions` / `cipollotti` → `spring_onion`. Synonyms resolve to the same canonical ingredient ID.
2. Recipe cards on **What Can I Cook?** show the proportion of required ingredient *types* available, plus a clear list of missing ingredients. The percentage is not a measure of available quantity.
3. A conservative, user-switchable **possible swaps** feature provides explicitly labelled suggestions for lemon ↔ lime, coriander leaves ↔ parsley, and onions ↔ spring onions, with bilingual flavor/technique cautions. Swaps **do not** turn a recipe into “Ready to cook”; the real ingredient remains marked missing.
4. In a recipe's ingredient panel, possible swaps based on your selected pantry items are explained. Existing dietary filters, user favorites, Supabase recipes, image handling, and administrator tools remain unchanged.
5. The swap preference is saved locally in your browser, without changing Supabase.

## Installation — no SQL migration

**Important:** This ZIP is an **update-only patch**, not a complete standalone website. It is built against `Eatable v9` after the white-screen hotfix. It intentionally includes only these changed files:

- `src/app.js`
- `src/recipes.js`
- `assets/styles.css`
- `eatable-version.txt`
- `README-v10.md` (this guide)
- `tests/smart-match.mjs` (optional developer regression tests)

1. In GitHub, leave the existing repository and its configuration in place. You can revert to your previous working commit if needed.
2. Unzip `eatable-v10-smart-matching-update.zip` and **upload its contents** to the same repository root that Vercel deploys, replacing the matching files. Don't upload the outer ZIP as a file and don't create a nested `eatable-v10` folder.
3. Keep `src/supabase-config.js` untouched. The ZIP does not contain this file or any database migration.
4. Commit the changes to the branch Vercel deploys. Confirm a new Production deployment is Ready.
5. Open `https://YOUR-DOMAIN/eatable-version.txt` — it should say `Eatable v10.0`.
6. Test `https://YOUR-DOMAIN/en/cook`, `https://YOUR-DOMAIN/it/cook`, and one existing recipe detail page. Use a forced refresh if your browser caches old scripts.

## Suggested live tests

1. EN: search `potatoes` → choose Potato. IT: search `pomodori` → choose Pomodoro. Confirm there is only one canonical ingredient per alias.
2. EN: select `Chickpeas`, `Tahini`, `Garlic`, `Olive oil`, `Salt`, `Water`, `Lime`. In the **Classic hummus** card, Lemon should still be listed as **missing**, but a possible Lime swap should be shown. This isn't an endorsement of the same flavor: the warning is intentional.
3. Turn off **Show possible ingredient swaps**. The warnings should hide while match counts and missing ingredient lists remain unchanged. Refresh the page to verify your preference is retained.
4. View the Hummus detail page and verify the possible swap note is present only when swaps are enabled.
5. Confirm existing Explore, Lebanese Table, account login, favorites, community, curated recipes, photo upload, and admin routes still work.
6. Verify the actual recipe quantities yourself. The current matcher tracks **ingredient types**, not amounts, expiration dates, allergies, or guaranteed culinary equivalence.

## Quality checks performed on the packaged code

- `node --check` of the JavaScript modules.
- `node tests/smart-match.mjs` — bilingual aliases, canonical search IDs, conservative swaps, diet filters, community indexing, dynamic vocabulary.
- v9 importer and v8 quality regression suites.
- v7 template/photo regression suite (with temporary empty *test* Supabase config).
- Restricted-environment inline Chromium render smoke test covering homepage, recipe-search UI, substitution toggle, results, and narrow mobile viewport. This tests the local code but is **not a live Supabase/Vercel end-to-end test**.

No keys or passwords are included. No database schema changes are required.
