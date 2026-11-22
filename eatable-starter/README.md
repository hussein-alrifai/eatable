# Eatable v5.0 — Unified Recipe Discovery

An incremental upgrade from Eatable v4.0. **Keep the existing Supabase project, GitHub repository, Vercel project, accounts, favorites, photos and administrator role.**

## What changed

- **One searchable catalog:** The first 18 demo/curated recipes are seeded into Supabase. Approved community recipes appear alongside them in **Explore** and, when their cuisine is Lebanese, **The Lebanese Table**.
- **Ingredient-based search:** Approved community recipes can appear in What Can I Cook? after their ingredients are linked to the standardized ingredient vocabulary by an administrator. Until then, they're still public in Explore/Community, but they **cannot falsely appear as "Ready to Cook"**.
- **Admin indexing:** `/en/admin-index` or `/it/admin-index` shows already-approved community recipes and lets you review their cuisine, dietary classification, and ingredient mapping **line by line**. New ingredient terms can be added to the vocabulary.
- **Community recipe pages:** Use the same details and cooking-mode interface as the curated recipes; show the contributor's original ingredient quantities rather than inventing automatically scaled quantities.
- **Favorites:** Members may save community recipes to the existing cloud-based cookbook. These save as `community-<uuid>` and remain compatible with the existing favorites table.
- **Existing workflows retained:** Authentication, member submissions, image upload/revision, moderation, private photos and published photos.

### Important content limitations

- There are still **18 demonstration curated recipes**, not yet the 60–100 reviewed recipes planned for launch. This release seeds those recipes into Supabase using `ON CONFLICT DO NOTHING` so it does not overwrite later edits.
- The review form needs one canonical ingredient for **every** submitted ingredient line. If an ingredient isn't listed, add it to the vocabulary first. The system won't silently guess that a compound or unrecognized ingredient is safe to match.
- Dietary labels should be assigned only after checking every ingredient and known potential variants. They are not allergen guarantees.
- Community recipe steps are still stored as free-text contributor content, with Italian fallback to the original wording where a separate translation isn't available.
- The v5 admin screen is for indexing already-approved community recipes; recipe content/moderation remains in the existing v4 Admin screen. Curated recipe data can be edited in the Supabase Table Editor by a project administrator; a full curated content management screen is a later milestone.

## Upgrade instructions — do these in order

1. In your existing Supabase project, go to **SQL Editor → New query**. Open `sql/04_unified_discovery.sql`, paste everything, and choose **Run**. It creates three new tables: `eatable_ingredients`, `eatable_curated_recipes`, `eatable_community_index`. It seeds **51 ingredient names** and **18 demo recipes**. It does **not** recreate v2/v3/v4 or delete any existing data. This migration is intended to be run once, after `03_photos_revisions.sql`.
2. In the Supabase **Table Editor**, check that the three tables exist and that `eatable_curated_recipes` has 18 rows. All three have Row Level Security enabled. **Do not paste any SQL into GitHub or run the previous migrations again.**
3. Extract `eatable-v5-unified-discovery.zip`. Upload its **contents** into the existing `eatable` GitHub repository root, where `index.html` already lives. Overwrite matching files and commit to the production branch. **KEEP your existing `src/supabase-config.js`.** The ZIP deliberately does not include that file, so your working public URL and publishable key remain intact.
4. In Vercel → Deployments, confirm the new production deployment is **Ready**. Visit `https://YOUR-DOMAIN/eatable-version.txt` — it should say **Eatable v5.0**. Your existing Vercel Root Directory setting remains unchanged.
5. Test `/en/recipes`, `/en/cook`, `/en/lebanese`, `/en/community`, `/en/my-kitchen`, and existing auth and admin pages.

## Test approved community recipe indexing

1. Sign in with your current administrator account.
2. Open `/en/admin-index`. Every approved community recipe appears here, with an "Indexed" or "Needs ingredient mapping" label.
3. Select a recipe. Confirm the cuisine and dietary label. For **each** ingredient line, select its canonical counterpart. Suggested matches may be prefilled, but must be checked manually. Add missing ingredient terms in the vocabulary form on the admin index page.
4. Save. Search by those ingredients under `/en/cook`. The recipe should now appear in the appropriate match group, among curated recipes.
5. Confirm the recipe also appears under `/en/recipes` and `/en/lebanese` (for Lebanese cuisine). Open it, try cooking mode, and save it to My Kitchen.
6. Sign out and verify its public detail is still readable, but `/en/admin-index` does not allow administrative access.
7. Optional: reject or request changes to the published recipe with the existing moderation dashboard. It should disappear from public results; the search mapping is removed automatically when the published recipe is deleted. If reapproved, it must be reindexed.

## Deployment and security notes

- Never upload any **secret** Supabase key or database password to GitHub. The existing `src/supabase-config.js` contains only the browser-safe URL and publishable key.
- New tables have RLS policies: guests may read published catalog rows, known ingredients and approved recipe index metadata; only existing admins may insert/update/delete curated recipes, the vocabulary and review mappings.
- The migration adds a trigger to validate that **every submitted ingredient line** is mapped to a known canonical ingredient. Unapproved submissions are never indexed because the index references the public approved-recipe table.
- Only the approved public community recipe data, not private submissions or photos, enters the searchable catalog.
- For production launch, upgrade the demonstration content, add automated migration tests and server-side pagination, and move image publication to a secure server transaction workflow.

## What's next

The next major stage is an actual **Curated Recipe Editor** in the Admin dashboard, plus richer cuisine/ingredient management and building the target 60–100 professionally reviewed bilingual recipes.
