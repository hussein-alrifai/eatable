# Eatable v34 — Recipe details, time split, shopping list, kcal/serving

Built on the v31 beta-feedback app code and v28.1 curated-editor code, preserving v29 homepage-photo support, v30.x ingredient search/pagination, and the v31 admin workflow. **This is a targeted source update; it is not a complete deployable website.**

## Changes

1. **Recipe detail:** two separate fields: preparation time and cooking time. Recipes that have not yet been reviewed show `—` for each and retain the recorded old total below. No arbitrary time split is fabricated. Works with curated and community recipe detail pages.
2. **Shopping list:** checked recipe ingredients are treated as already available for the current recipe, together with the account's saved pantry. Only still-missing ingredients are sent to Supabase. This does not change the saved pantry or checkmarks on other recipes.
3. **Notice:** removes the generic `recipeNote` notice box from the recipe-detail page only. Dish-specific instructions and legal/privacy pages are untouched.
4. **kcal / serving:** appears in recipe details and is editable by admins for curated recipes; community submissions also accept it. Existing values stay **blank**, never guessed. The value refers to the recipe's standard single serving, independent of the adjustable servings control.
5. **Admin time review:** the v31 workflow time editor now accepts separate prep/cook minutes and saves their sum to the legacy `prep_minutes` column so existing filters and sorting keep working.

## Installation in order

**Back up your current deployed GitHub files and Supabase database first.**

1. Supabase > SQL Editor: execute `sql/16_recipe_detail_metadata.sql` **once**. It adds three nullable fields to the curated, private-submission, and public-community tables and updates the existing publication trigger to copy the three public fields, preserving photo syncing. No existing recipe values are changed.
2. GitHub: upload/replace the following existing files from `src/`: 
   - `src/app.js`
   - `src/curated-editor.js`
   - `src/discovery.js`
   Add the new file `src/recipe-details.js`.
   - `src/kitchen.js` is included for local tests/reference. If your existing `kitchen.js` has customized logic, **do not overwrite it**. The new helper imports its existing `shoppingLinesForRecipe` export.
   - **Do not replace** `src/recipes.js`, `src/catalog-cloud.js`, styles, Supabase configuration, or other files. Those retain the more recent Eatable features.
3. Deploy with Vercel, hard refresh (Ctrl+Shift+R).
4. In Admin > Curated Recipe Editor, open any recipe. Enter Preparation and Cooking minutes, and enter kcal/serving **only if reliably calculated or checked**. Save/Publish.
5. Optionally run the read-only SQL `sql/17_recipe_detail_check.sql` to see outstanding recipes needing review.

If your current repo has local changes to these three files after v31/v28.1, **merge the corresponding `patches/*.patch` rather than replacing them wholesale**. The patches are diff guides against the versions in the named earlier Eatable release packages.

## Verification

- Test a recipe with chicken, rice, onion, garlic. Tick chicken and onion, but leave rice and garlic unchecked; click "Add missing ingredients to shopping list". Only rice and garlic should be inserted, unless one is already in your Pantry (in which case exclude it too).
- Repeat with all ingredients ticked; no new shopping items should be added.
- Edit a curated recipe to Preparation=15, Cooking=40, kcal/serving=450. On the public detail it should show 15 min, 40 min, 450 kcal/serving. Legacy total filters should use 55 minutes.
- An old recipe with legacy total 75 min and no new fields should show preparation `—`, cooking `—`, previously recorded total 75 min, and kcal `—`.
- Edit a community submission: preparation/cooking and kcal should be present. After approval, confirm that the published recipe displays them.
- Confirm the generic notice box is absent from the public detail page.

## Important limitations

- kcal/serving is an **editorial input**, not an automatic nutrition calculator. Missing/incorrect macro calculations cannot be repaired by showing a fake number. Use a trusted nutrition data source for ingredient weights and yield before publishing kcal.
- The previous `prep_minutes` field continues to mean **total recorded time** for search filters and existing imported recipes. Values are recalculated for edited split-time recipes.
- If you have a custom recipe table/trigger schema, compare `sql/16_recipe_detail_metadata.sql` with your current database migration before executing it.

## Tests

From this folder, with Node.js 20+: `npm test`. The helper tests exercise the shopping-list selection and time/nutrition validation. Syntax-check the JavaScript with `node --check src/app.js`, etc.
