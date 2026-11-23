# Eatable v11.0 — My Kitchen & Shopping Lists

This is an **update-only patch** for the working Eatable **v10**, not a standalone website. Keep the current GitHub/Vercel project and Supabase project. Do **not** create a second repository or database.

## What v11 adds

- **My Kitchen** (`/en/my-kitchen`, `/it/my-kitchen`): a private pantry of standardized ingredient names, saved to your Supabase account; favorites remain on the same page.
- **My Shopping List** (`/en/shopping-list`, `/it/shopping-list`): add ingredients manually; check/uncheck items; remove them; mark items as bought to move them to your pantry.
- **Recipe → Shopping List**: add ingredients missing from **your saved pantry**, using the selected serving size for the suggested amount. Existing shopping entries are not silently overwritten.
- **Cook using pantry**: copy your saved pantry ingredients to the ingredient-based search. This updates the current search selection, not your actual pantry.
- Fully translated English/Italian interface. Shopping list and pantry are private to the signed-in user.

**Known limitations:** Pantry tracks ingredient **presence, not quantities**; ingredient matching still does not guarantee enough amounts, freshness, allergy suitability, or safe substitutions. Shopping-list amounts are recipe-level suggestions and may need combining by hand. A community recipe needs administrator-approved standardized ingredient mappings to produce a shopping list. The existing favorites and community workflows remain unchanged.

## Install — order matters

### 1. Create the new tables in your existing Supabase project

Open Supabase Dashboard → Eatable → SQL Editor → **New query**. Open `sql/08_my_kitchen_shopping.sql`, paste its contents and click **Run**. Success generally reads `Success. No rows returned.`

Check under **Table Editor** for `user_pantry` and `user_shopping_items`. Both must have Row Level Security enabled. The SQL creates owner-only SELECT, INSERT and DELETE policies for pantry; shopping also allows owners to update only the `checked` column. Anonymous visitors have no read access.

**Do not rerun migrations 01–07, delete tables, or modify roles.** Do not paste a secret key or password into GitHub.

### 2. Update GitHub

Extract the ZIP and upload only its **contents**, preserving these paths at the same repository root as your current `index.html`:

- `src/app.js`
- `src/kitchen.js`
- `src/kitchen-cloud.js`
- `assets/styles.css`
- `sql/08_my_kitchen_shopping.sql`
- `eatable-version.txt`
- `README-v11.md`
- `tests/kitchen.mjs`, `tests/render-v11.mjs` (optional developer tests)

**Keep `src/supabase-config.js` unchanged.** It is excluded from this ZIP on purpose, along with all other unchanged files. You must still keep existing `index.html`, `src/recipes.js`, `src/cloud.js`, `src/discovery.js`, previous SQL migrations, recipe images and other files in your repo.

Commit changes to the same production branch that Vercel uses. When the deployment shows **Ready**, open `/eatable-version.txt` and confirm it says `Eatable v11.0`.

### 3. Live test (ideally with two accounts)

1. Sign in and open `/en/my-kitchen`.
2. Add **Potato**, **Garlic**, **Olive oil** to your pantry. Refresh the page: the ingredients should remain.
3. Select **Find recipes with my pantry**. In `/en/cook`, those ingredients should appear selected.
4. Open a **curated** recipe whose required ingredients are not all in your pantry; choose **Add missing ingredients to shopping list**.
5. Open `/en/shopping-list`. Verify the missing items are listed with suggested amounts (when the recipe has them). Add **Rice** manually, mark it checked, then select **Bought → pantry**. Rice should disappear from the shopping list and appear in the pantry.
6. Change the language to Italian and check `/it/my-kitchen` and `/it/shopping-list`.
7. Sign out and sign in on another device. Your pantry and shopping list should sync.
8. **Security check:** Sign in with a second, unrelated account. It must not see the first account's pantry or shopping items. Ideally test this with two private browsing sessions.
9. Re-test Explore, Lebanese Table, recipe pages, favorites, admin dashboards, and recipe importer.

If the pages show a database error, ensure migration 08 was run on the **same** Supabase project connected via `src/supabase-config.js`, and verify both tables' RLS policies.

### Rollback

If the latest deployment fails, use the previous known-good GitHub commit or roll back the Vercel deployment. **Do not delete your Supabase tables.** The migration adds tables and does not change existing recipes/accounts.

## Checks performed for this release

- `node --check` for every JavaScript module, including the v11 app and cloud helpers.
- Prior v7, v8, v9 and v10 JavaScript regression tests.
- New v11 pure logic tests, including scaled ingredient quantities, safe community fallback, English/Italian ingredient recognition.
- Static render smoke test for the updated app in demo mode (no empty first paint).
- SQL policies reviewed for per-user scoping and limited column grants.

**Not performed:** a live authenticated browser test on your Supabase/Vercel deployment. This execution environment blocks local Chromium navigation, and we don't have your production credentials. Use the live checklist above to verify cloud behavior.
