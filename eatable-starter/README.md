# Eatable v28 — National Cuisines & Recipe Expansion

Prepared for **https://cookwitheatable.com/** and the existing **Eatable Admin → Batch Recipe Import** tool.

## Deliverables

- **236 additional ingredients**, each with a canonical ID and English/Italian translation; insert-only SQL plus JSON reference.
- **86 new bilingual recipe drafts**: 40 recipes in national Arab cuisines and 46 in European cuisines.
- **41 specific national cuisine options**, with English/Italian names and country flags. Of those, 37 are represented among the new 86 drafts.
- **4 import files**, each containing 21–22 recipes (under Eatable's 25-recipe / 400-KB importer limits).
- **Corrected v27 recipe files** assigning nine earlier broadly categorized recipe drafts to specifically named national *versions/inspirations*, plus an optional SQL update for previously imported but still-unpublished v27 drafts.
- A minimal **three-module frontend compatibility patch**, required because the old importer rejects new nationalities.

There are **no recipe photos**, no user information and no API credentials in this package. All Eatable importer drafts remain **unpublished** until you approve them.

## Files

| File | Purpose |
|---|---|
| `cuisine-patch/src/recipes.js` | Adds the national cuisine list, flags and bilingual labels for Explore, filters and the recipe editor |
| `cuisine-patch/src/bulk-import.js` | Accepts the expanded national cuisine identifiers in JSON imports |
| `cuisine-patch/src/curated-editor.js` | Shows national cuisines in the editor instead of generic cuisine choices; preserves a legacy label only while editing an old entry |
| `cuisine-patch/cuisines.json` | Human-readable country/nationality reference |
| `ingredients/03_add_v28_ingredients.sql` | Inserts 236 additional ingredients without overwriting existing rows |
| `ingredients/ingredients-v28-additions.json` | Ingredient names and groups for editorial review; not for the recipe importer |
| `recipes/recipes-v28-01.json` to `04.json` | Four separate ready-to-preview recipe draft batches (22, 22, 21, 21) |
| `recipes/v27-corrected-nations-01.json` and `02.json` | Corrected versions of the **previous** 50-recipe pack; only use for first-time v27 import |
| `ingredients/04_optional_reclassify_v27_drafts.sql` | **Optional:** relabel only nine matching v27 drafts if you already imported them, but not published them |
| `docs/RECIPE_INDEX.md` | All 86 new recipes by country and batch |
| `docs/EDITORIAL_REVIEW.md` | Review and food-safety guidance |
| `tests/validate-pack.mjs` | Offline import validation command |

## Installation — follow this order

### Step 1: Update GitHub / Vercel once

Your current importer only accepts `Lebanese, Italian, Middle Eastern, Indian, Japanese, Mexican, Greek, Spanish, Other`. New nationality values would otherwise show **Invalid cuisine, category, or diet**.

Back up your working GitHub revision. Replace the following **three files** in your existing repository with the contents of the `cuisine-patch/src/` folder:

- `src/recipes.js`
- `src/bulk-import.js`
- `src/curated-editor.js`

Commit and wait until your Production Vercel deployment is ready. **Do not replace `src/app.js`, other website files, Supabase connection files or API endpoints.** These three files are based on your prior Eatable modules; if you edited them independently, compare and merge the changes rather than overwriting them.

The public Explore and Search filters use the expanded `cuisines` array from `src/recipes.js` and will show the newly defined country labels. Existing legacy recipe records already stored in Supabase do **not** change automatically.

### Step 2: Add ingredient vocabulary in Supabase

If you have **not yet run the previous v27 ingredient SQL**, do that first, because new recipes use existing + v27 + v28 ingredient IDs.

Go to **Supabase → SQL Editor** and run `ingredients/03_add_v28_ingredients.sql` **once**. It is insert-only with `ON CONFLICT (id) DO NOTHING`; rerunning will not overwrite an existing ingredient ID. It doesn't modify recipes or Storage.

Refresh Eatable to load the new ingredient vocabulary.

### Step 3: Import four batches as drafts

Sign in as administrator and open: **https://cookwitheatable.com/en/admin-import**.

Upload in this order, separately:

1. `recipes/recipes-v28-01.json` — 22 recipes
2. `recipes/recipes-v28-02.json` — 22 recipes
3. `recipes/recipes-v28-03.json` — 21 recipes
4. `recipes/recipes-v28-04.json` — 21 recipes

Start with **one recipe** to confirm your live deployment accepts the new cuisine. Then upload the remaining drafts. The importer blocks overwriting an existing slug and never automatically publishes imported recipes.

Visit **https://cookwitheatable.com/en/admin-curated** to review, correct and photograph each draft before publishing it.

### Step 4 (only if relevant): Correct the previous v27 classifications

If **v27 was never imported**, use the two `v27-corrected-nations-*.json` files **instead of** the old v27 files. These already have specific country labels.

If **v27 was already imported but is still in draft**, review the mapping and optionally run `ingredients/04_optional_reclassify_v27_drafts.sql` in Supabase SQL Editor. It relabels only the nine known matching v27 records **where `published = false` and the old cuisine label still matches**. It never modifies published entries or overwrites other data.

If **v27 recipes were already published**, edit their national classifications manually in the admin editor after verifying the intended national version. **Do not reimport**: Eatable intentionally skips existing slugs.

Older sample recipes such as `shakshuka` may still be labeled generically in existing **database rows**. This patch doesn't silently reassign them; review these entries separately.

## Quality and accuracy limits

- Recipe nationalities identify a **specific regional version or inspiration**, not exclusive ownership of dishes often shared across neighboring countries.
- 86 draft recipes have bilingual titles, descriptions, 3 preparation steps each, servings, times and quantities.
- The recipes and translations are **editorial drafts**, not professionally tested or verified as authoritative traditional preparations.
- Allergen, ingredient brand, rennet/vegetarian labeling and cooking safety require review. `diet: unknown` is deliberately used when a cheese may contain animal rennet.
- Recipe photos are deliberately absent so you can take or license them yourself.
- The importer validation was run **locally**, not on your production Supabase project. Current live catalog and ingredient collisions cannot be ruled out beyond the available original and v27 data.

## Optional offline validation

With Node.js installed, in the extracted folder run:

```sh
node tests/validate-pack.mjs
```

The check validates all four new recipe imports plus the corrected v27 imports against the supplied vocabulary reference and Eatable's actual importer validator. There is no network access and no database modification.
