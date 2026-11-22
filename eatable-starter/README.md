# Eatable v6.0 — Curated Recipe Editor

Incremental upgrade **from working Eatable v5.0**. Keeps your existing Supabase project, published community recipes, user accounts, photos, favorites, ingredient mapping and administrator permissions. Do not create a new Supabase project.

## What's new

- A private **Curated Recipe Editor** at `/en/admin-curated` and `/it/admin-curated`.
- **Create new recipes** with English and Italian titles, descriptions and preparation steps.
- **Choose canonical ingredients** from the same vocabulary used by *What Can I Cook?*, with quantities and units. Add and remove rows as needed.
- **Save as draft / Unpublish** or **Publish**. Drafts are not returned to visitors by Supabase RLS policies.
- **Edit any existing curated recipe**, including the original 18 demonstration recipes. The slug stays fixed after creation to avoid breaking saved links.
- Curated recipe publishing updates the public catalog, recipe pages, ingredient matching and The Lebanese Table after reload, without updating source code.
- SQL integrity checks reject unknown ingredient IDs, invalid quantities, missing translations and malformed steps.
- Improvements to protect unpublished curated recipes from appearing in the browser before the cloud catalog finishes loading.

**Not included:** automatic translations, AI-generated recipes, curated photo uploads, incomplete auto-saved drafts, bulk imports, editor history or audit log. Drafts currently require a complete, valid bilingual recipe; they simply remain unpublished until you choose to publish them. Diet labels require editorial review and do not certify allergens.

## Install in this order

1. **Keep a backup:** Confirm your existing site is working and save a copy of the existing GitHub files (GitHub commit history is also available). Keep your original `src/supabase-config.js`—this package intentionally excludes it.
2. **Supabase:** Open your existing Eatable project → SQL Editor → New query. Copy and run **only** `sql/05_curated_editor.sql`. Do **not** rerun SQL files 01–04. Expected: `Success. No rows returned.` The migration adds validation and keeps all existing data. You should still have all original 18 curated records and all community recipes.
3. **GitHub:** Extract the ZIP. Upload its **contents** to the top level of your existing `eatable` repository, replacing matching files. Do not upload the outer folder. Retain `src/supabase-config.js` from the current deployment. Commit to the production branch.
4. **Vercel:** Check that the new deployment is marked Ready. The URL `/eatable-version.txt` should show **Eatable v6.0**.
5. **Open admin editor:** Sign in with the existing administrator account, visit `/en/admin-curated` or `/it/admin-curated`. You can also reach it from Admin → Curated Recipe Editor.

## Verification checklist

1. **Save a draft:** Create a new recipe with slug `test-recipe-v6`, bilingual titles and descriptions, category/cuisine/diet, at least 1 canonical ingredient and a bilingual cooking step. Use realistic quantities. Select **Save as draft**. Check that it appears in the admin editor as *Draft*.
2. **Privacy check:** Open `/en/recipes/test-recipe-v6` while logged out or in a private browser. It must not display the new recipe. It must not appear in public `/en/recipes` or `/en/cook`.
3. **Publish:** Return as admin, edit the recipe and select **Publish recipe**. Check `/en/recipes/test-recipe-v6`, `/it/recipes/test-recipe-v6`, ingredient search, and relevant cuisine section. For Lebanese recipes check `/en/lebanese`.
4. **Modify:** Reopen the recipe from the admin editor, change both language instructions or an ingredient quantity, publish and reload the public detail page. The change should appear.
5. **Unpublish:** Edit and select **Save as draft / Unpublish**. The recipe disappears from public results, while its record remains in the admin editor for future use. Existing favorites referencing it are not deleted.
6. **Non-admin:** Sign in as an ordinary member and visit `/en/admin-curated`. Access must be refused; direct Supabase writes must also be denied by RLS.

## Editorial and security notes

- The v5 `eatable_curated_recipes` Row Level Security policies are preserved: public SELECT sees only published records; admin SELECT/INSERT/UPDATE is guarded by `eatable_is_admin()` on the database, independently of frontend navigation.
- The new SQL validates all INSERT and UPDATE operations on curated recipes, even if someone bypasses the form and submits directly to the Data API.
- Do not expose your Supabase secret key or database password in GitHub. Your browser config only needs the Project URL and publishable key.
- If an ingredient is missing in the dropdown, first add it via `/en/admin-index` using the ingredient vocabulary editor.
- The supplied recipe catalog is **still 18 demonstration recipes** until you curate and publish more. The initial public content goal remains **60–100 reviewed bilingual recipes**.

## Rollback

To revert the website, redeploy the preceding GitHub commit from Vercel. You normally do **not** need to reverse the v6 SQL: its trigger and validation are backward-compatible with the v5 catalog format. If you intentionally roll back the database validation, review dependencies first and do it as a separate audited migration.
