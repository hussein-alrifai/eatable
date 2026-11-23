# Eatable v15.0 — For You & Personal Collections

This is a **patch for the existing working v14**. Do not replace your repository with only these files.

## What's new
- `/en/for-you` and `/it/for-you`: explainable suggestions based on the current user's saved recipes and pantry. No AI API calls or hidden tracking.
- `/en/collections` and `/it/collections`: private collections that sync across signed-in devices; rename/delete groups and add/remove recipes.
- Published recipe pages can add a dish to an existing collection.
- Your existing My Kitchen and account menu link to the new screens.

## Install in this exact order
1. Back up your current GitHub commit (or note its commit hash). **Do not delete Supabase data.**
2. In your EXISTING Eatable Supabase project, open SQL Editor and run **only** `sql/11_personal_collections.sql`. This adds two new tables with per-user RLS; it does not overwrite previous tables.
3. Extract the patch ZIP. Upload and overwrite the matching paths in the GitHub repository root:
   - `src/app.js`
   - `src/personalized.js` (new)
   - `src/collections-cloud.js` (new)
   - `assets/styles.css`
   - `eatable-version.txt`
4. **Do not change or upload `src/supabase-config.js`.** All other existing files remain untouched.
5. Wait for the **Production** deployment marked Ready in Vercel; check `/eatable-version.txt` returns `Eatable v15.0`.

## Live checks
1. Sign in, navigate to `/en/collections`, create `Lebanese favorites`, rename it, and check the same collection on a second device after signing in.
2. Open a *published* recipe, choose `Lebanese favorites`, select **Add to collection**, then open the collection and remove the dish.
3. Navigate to `/en/for-you`. If you have favorites and/or pantry ingredients, confirm suggestions with explanations. If not, confirm the empty state explains what to do.
4. Repeat in `/it/collections` and `/it/for-you` and verify the interface translations.
5. Sign out: private collections should no longer be visible. Log in as a different user: they must not be able to view or modify the first user's collections.
6. Check prior features: ingredient search, reviews, favorite button, admin dashboard, and My Kitchen.

## Known limitations / safety
- Recommendations use ingredient types and cuisine preferences, **not** verified quantities, allergies, nutritional suitability, or AI.
- Collection items reference published recipe IDs. If a recipe is unpublished, it will be shown as unavailable in the collection, not exposed.
- The implementation handles a missing SQL migration by showing an error message for collections rather than failing to render the rest of Eatable.
- The SQL migration uses authenticated-only RLS and compound foreign keys to ensure collections and their items belong to the same signed-in user.
- Tests are local static/syntax and helper tests. Authentication and Supabase RLS require testing against your live project.
