# Eatable v30 — Persian & Lebanese Expansion

This additive package is based on **Eatable v28.2 (white-screen hotfix)** and the v29 website state.

**Contents**: 173 new bilingual ingredient IDs, 36 Iranian/Persian and 41 Lebanese recipes, four unpublished recipe-import batches.

## Install — follow in order

1. **Github/Vercel:** Replace ONLY `src/recipes.js` with the provided `src/recipes.js` from this package. This begins from the fixed v28.2 module and adds the `Iranian` cuisine filter. **Do not use the v28 or v28.1 recipes.js**, as those removed required app exports and previously caused a white screen.
2. `src/bulk-import.js` and `src/curated-editor.js` are included as the known working **v28.1** versions for compatibility and offline testing. **If your deployed files are already v28.1, do not replace them**. If your importer still uses a hard-coded old cuisine list, replace `src/bulk-import.js` with this one; preserve any later independent edits by merging.
3. Deploy and hard refresh the site. Confirm the homepage still works and the **Iranian (Persian) 🇮🇷** nationality option appears in Explore / Admin Editor.
4. **Supabase → SQL Editor**: run `ingredients/05_add_v30_ingredients.sql` after the v27 and v28 ingredient scripts. It is insert-only and safe to re-run (`ON CONFLICT (id) DO NOTHING`).
5. **Eatable Admin → Batch Recipe Import**: `https://cookwitheatable.com/en/admin-import` and preview each JSON separately. Confirm no 'Unsupported cuisine' or 'Unknown ingredient ID' warning.
6. Import the batches one by one (sizes below). Every entry is imported **unpublished**, does not overwrite existing slugs, and includes no images.
7. **Admin → Curated Recipes**: `https://cookwitheatable.com/en/admin-curated`. Review accuracy, translations, dietary labels, ingredients and food safety, add your own photo and then publish individually.

| Recipe batch | Count |
|---|---:|
| `recipes/recipes-v30-iranian-01.json` | 18 |
| `recipes/recipes-v30-iranian-02.json` | 18 |
| `recipes/recipes-v30-lebanese-01.json` | 21 |
| `recipes/recipes-v30-lebanese-02.json` | 20 |

**No other source files need modification.** Do not touch `src/app.js` from v29, other site modules, Supabase policies, or Vercel environment variables.

Run `node tests/validate-pack.mjs` from the extracted root to validate against Eatable's actual importer rules.

## Accuracy

Ingredient IDs were compared against the v9 base, v27 and v28 vocabulary files, and recipe slugs against existing v27/v28 import packs. Actual production contents may differ.
Recipes are **original editorial drafts rather than kitchen-tested instructions**. See `docs/EDITORIAL_REVIEW.md` before approving.
