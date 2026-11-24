# Eatable v18.0 — Coverage-First Recipe Expansion

**Incremental patch for your existing, working Eatable v17 deployment. This is NOT a full replacement website.**

The objective is to use the Search Coverage Lab's **illustrative pantry scenarios** to select useful new draft recipes. No user pantry data is read and nothing is published automatically.

## Included files

| Path | Action |
|---|---|
| `src/app.js` | Replace existing file (adds v18 controls to admin coverage and batch importer) |
| `src/coverage-suggestions.js` | New module used by the private admin coverage page |
| `assets/styles.css` | Replace existing stylesheet (retains all prior styles, adds v18 styles) |
| `data/recipe-pack-v18.json` | New, bilingual 12-recipe candidate pack |
| `eatable-version.txt` | Replace to show v18.0 |
| `tests/coverage-v18.mjs` | Optional local regression test |
| `README-v18.md` | These instructions |

**Do not delete any files not included in this patch. Never replace `src/supabase-config.js`.** No SQL migration is necessary; this version uses the existing draft-import system.

## Installation

1. Record your latest successful v17 GitHub commit hash, so you can revert the frontend if necessary.
2. Extract the ZIP and upload the files above into their matching paths in the root of your current `eatable` GitHub repository. **Do not upload an extra containing folder** such as `eatable-v18-release`.
3. Do not remove or re-create your Supabase project, tables, images, login settings, or user records.
4. Commit the changes to the branch connected to Vercel Production.
5. In Vercel → Deployments, verify the **Production** deployment is **Ready**. Open `/eatable-version.txt` and confirm it reads `Eatable v18.0`.
6. Sign in as administrator and open `/en/admin-coverage` (or `/it/admin-coverage`). Below the existing coverage charts you will see the **Coverage-first recipe drafts** section and estimated sample-pantry improvement.
7. Open `/en/admin-import` and select **Load 12 v18 drafts**. Confirm the preview and import **one** valid recipe first. It must remain **unpublished** in `/en/admin-curated` and must not appear in public Explore or ingredient search.
8. Once that works, import the remaining candidates. Existing recipe slugs are skipped, never overwritten. For every draft, check both translations, ingredient quantities, cooking instructions, nutrition/allergen claims, rights to photographs, and cultural labeling. Cook-test and record quality-review status before manually publishing.

## The 12 recipe candidates

- Weeknight chicken and tomato skillet
- Chickpeas with warm tomato and garlic — Lebanese-inspired
- Pan-fried garlic and lemon potatoes
- Carrot, lentil and rice pilaf
- Fresh cucumber, lettuce and herb salad
- Za'atar breadsticks — home variation
- Tomato, feta and olive plate
- Soy tofu rice with carrots and peas
- Simple yogurt breakfast pancakes
- Warm tomato and basil topping
- Lemon and pea pasta
- Garlic and mint yogurt dip — Lebanese-inspired

Each candidate uses ingredients already present in Eatable's English/Italian standardized vocabulary. The importer strips any attempted `published` or privileged fields and creates private drafts only. All 12 entries passed the importer validation; **they have not been independently cooked, photographed, or certified as traditional recipes**.

## How the admin recommendations work

The v18 panel reuses the v17 public catalog coverage report and the **same ten illustrative sample pantry baskets** (not anyone's private pantry). Candidates are ranked by the number of currently uncovered sample baskets for which they contain all required ingredient types, plus low-frequency ingredients. Existing curated slugs are marked to avoid accidental duplicate editing.

With the original **18 demonstration recipes** only, 3 of 10 example baskets had an exact match; if all 12 candidates were reviewed and published, the illustrative potential is 10 of 10. Your live results will depend on your actual published, ingredient-indexed catalog. This simulation ignores quantities, substitutions, allergens, nutrition, and cooking safety. It is **editorial guidance**, not a promise of ready-to-cook meals.

## Verify without risking previous work

- Visit `/en/recipes`, `/en/cook`, `/en/lebanese`, `/en/admin-coverage`, `/en/admin-import`, and `/en/admin-curated`.
- Confirm existing reviews, favorites, My Kitchen and personal collections still work.
- If a JavaScript error appears, capture the Console error and revert **the frontend commit only**; do not reset or rerun Supabase migrations.
- Optional local Node.js test: `node tests/coverage-v18.mjs` (requires existing source files and Node 22+).

## Testing performed for this patch

- JavaScript module syntax checks (`node --check`) and the new v18 unit test passed.
- All 12 existing Eatable v7–v14 Node regression suites passed under a temporary **non-live testing configuration**.
- Verified v18 JSON format, uniqueness, ingredient vocabulary coverage, bilingual instructions, non-public import, and the ten illustrative pantry scenarios.
- **Not tested:** live authenticated Supabase import, Vercel production serving, mobile browser UI, cooking results, real allergens, and accuracy of the food photography. Those must be verified after you install the patch.
