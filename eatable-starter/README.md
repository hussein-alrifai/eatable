# Eatable v30.1 — FIX: 18/18 Iranian recipes invalid in Batch Preview

This replaces the **v30 content bundle** with an **import-diagnostics hotfix**.
It does not publish recipes, alter your photos, or replace your v29 homepage code.

## Why the screenshot shows 0 ready / 18 invalid

There are two separate blockers:
1. `Unsupported cuisine: Iranian` — the currently deployed `src/recipes.js` has not registered the Iranian cuisine yet (or the browser is running an old deployment).
2. `Check ingredient selection, quantity and units` — the validator gives the same generic message when even one ingredient ID is not in the live vocabulary. Usually the v30 ingredient SQL has not yet been run or the page hasn't reloaded since it was run. Earlier v27/v28 ingredient SQL scripts may also be missing.

The original local batch test included *planned* IDs and could not verify what was really installed in Supabase.

## Fix in exact order

1. **GitHub project:** replace ONLY `src/recipes.js` and `src/bulk-import.js` with the files under `src/` in this ZIP. Do **not** replace `src/app.js` — leave v29 homepage controls intact. Do **not** replace `src/curated-editor.js` unless your version is older and incompatible.
2. Commit, deploy on Vercel, and ensure the latest deployment is marked **Ready**.
3. **Supabase SQL Editor:** run `ingredients/05_add_v30_ingredients.sql`. This is insert-only and uses `ON CONFLICT (id) DO NOTHING`. It assumes the earlier v27/v28 ingredient migrations have already been installed.
4. **Supabase SQL Editor:** run `diagnostics/01_check_recipe_ingredient_ids.sql`. You want `ids_missing = 0`. If any IDs are listed, confirm that the earlier v27/v28 ingredient scripts were applied. Check each missing ID before inserting; do not rename it in a recipe merely to bypass validation.
5. Refresh your live Eatable website with Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac). Log in as an administrator and revisit `/en/admin-import`.
6. Upload `recipes/recipes-v30-iranian-01.json` again. Expect 18 valid new draft candidates if none of their slugs already exist in the live database. With the improved importer, any remaining missing ingredient IDs are shown explicitly.
7. When the preview reads valid, import; proceed with the other three batches. Review drafts and add photographs before publishing.

## Included

- `src/recipes.js`: from v30 / v28.2 white-screen-safe version with Iranian nationality added.
- `src/bulk-import.js`: same v28.1 import logic, but invalid rows now show the actual missing ingredient IDs and/or unsupported cuisine; all validation and draft-only behavior remains in force.
- `ingredients/05_add_v30_ingredients.sql`: original 173 bilingual ingredients.
- `diagnostics/01_check_recipe_ingredient_ids.sql`: read-only live SQL check for every ingredient needed by the 77 new recipes.
- All 77 original bilingual draft recipes, instructions, and editorial review notes.

## Important

The missing ingredient validation cannot be repaired by changing the JSON alone. It depends on the **live database's vocabulary and the code actually deployed**. Never disable validation or change `Iranian` to `Other` to make the import pass.

The check is performed locally against both the planned full vocabulary (all 77 valid) and an intentionally incomplete vocabulary (missing IDs must be called out by name).
