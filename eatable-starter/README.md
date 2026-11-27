# Eatable v31 — Beta feedback & admin completion workspace

**Starting point:** the v30.6 global-search-ranking package, preserving its v30.3 ingredient pagination and v29 homepage-photo selection. The update is **not** a complete Vercel project—only the files listed below should replace their counterparts in your existing GitHub repository.

## Installation order (existing Supabase / existing GitHub)

1. **Back up** current `src/app.js`, `src/recipes.js`, `src/catalog-cloud.js`, and `src/quality-cloud.js` (or create a Git commit/tag). Export your production database before trying permanent deletion.
2. In **Supabase → SQL Editor**, run `sql/14_admin_workflow.sql` once. It adds the member ingredient-suggestion queue and permits *administrators only* to delete curated recipes through RLS. It does **not** delete or modify any existing recipes.
3. In **GitHub**, copy these six files into the repository's `src/` directory:
   - `src/app.js` (modified)
   - `src/recipes.js` (modified)
   - `src/catalog-cloud.js` (modified)
   - `src/quality-cloud.js` (modified)
   - `src/national-cuisines.js` (**new**)
   - `src/recipe-workflow.js` (**new**)
4. Commit, let Vercel deploy, then hard-refresh (`Ctrl+Shift+R`). Do not delete any other existing files and do not upload this ZIP as an entire replacement repository.
5. Sign in as an **admin**. Go to `/en/admin-workflow` (or `/it/admin-workflow`). You can also open it from the Admin menu.

> If you have modified any of these files since v30.6, **merge** the changes instead of blindly overwriting your newer code. Diff patches are included in `docs/patches/`.

## New administrator workflow

- **Needs Attention:** missing public cover photo, English/Italian text, ingredient mapping or quantity, English/Italian cooking steps, or essential metadata (cuisine, category, dietary label, minutes, servings).
- **Complete:** all structural fields are present. Recipes **automatically move** after they are saved. Drafts can be Complete without being public.
- **Check cooking times:** every curated recipe, longest estimated total time first. Edit the verified total time directly in this tab and save without opening the full editor. The form now explains total time includes preparation + cooking + resting.
- **Search and filter:** filter incomplete recipes by missing field, search by name/cuisine/slug, and browse 40 results per page.
- **Permanent Delete:** open an existing curated recipe in Admin → Curated Recipe Editor. The Delete button is below the editor. You must type the exact recipe slug. Unlike **Unpublish**, this is irreversible. Linked editorial review/media records are deleted through their existing foreign-key cascades; photo files are removed on a best-effort basis. A storage cleanup warning means manually inspect Supabase Storage.

**Important:** `Complete` means *structurally complete*, not *kitchen-tested* or *editorially verified*. Keep using Admin → Quality Review before public promotion. Existing published recipes remain published even if the new audit finds missing content. This release **does not** automatically shorten cooking times, because some long times include chilling, soaking, marinating or slow cooking.

## Ingredients and countries

- The community **Submit a Recipe** page continues to accept **any ingredient as free text**, even if the shared search catalog does not yet include it.
- Logged-in members can now send an **Ingredient suggestion** through a separate form on that page. It is administrator-reviewed, not automatically added. The SQL migration enforces an anti-spam limit of **10 requests per member per 24 hours**.
- Under **Admin**, review member ingredient suggestions and add them to the searchable vocabulary with an English ID and Italian translation. If you already have that ingredient, dismiss the duplicate. A missing item may need mapping in **Admin → Ingredient indexing** before a community recipe becomes searchable.
- Cuisine choices now cover **249 ISO country/territory codes** (43 existing Eatable national cuisines + 206 additional choices). Existing cuisine IDs are unchanged, so published recipes and previous imports remain compatible. Widely recognized names (e.g. Ghanaian, Ethiopian, Brazilian) are used; otherwise the menu says **Cuisine of [country]** rather than inventing a demonym. Historical or shared-region foods should still receive an editorial origin check.

## Test checklist

1. **Admin, unfinished recipe:** open `/en/admin-workflow`, find a recipe missing a photo, add a photo in its editor, publish/save. When its other fields are complete, it moves from **Needs Attention** to **Complete** automatically.
2. **Admin, incomplete instructions:** remove an Italian instruction in a test *draft* (not a live public recipe), verify the relevant warning. Note: SQL requires at least one valid bilingual step in normal saved recipes, so for live data the warning may mostly detect imported inconsistencies.
3. **Admin, times:** visit **Check cooking times**, edit a known inaccurate time, save; verify it changes on the recipe card.
4. **Member, ingredient:** sign in as a non-admin account, open `/en/submit`, write an ingredient in the recipe free-text area, send its suggestion. The admin should see the pending suggestion and can add it to vocabulary. Try without the SQL migration only in a test environment; the form will show an error rather than silently succeeding.
5. **Countries:** ensure Ghanaian, Ethiopian, Lebanese, Iranian, Brazilian and Japanese origins are available. Previously stored cuisines must remain selectable.
6. **Deletion:** test on a *disposable draft* you created for testing. Verify cancelling the slug confirmation leaves it intact. Delete only after testing and a database backup; confirm an ordinary user cannot access the admin action. Verify Storage cleanup separately.
7. **Regression:** test the ingredient home search (`chicken, rice, onion`), the v29 homepage hero photo, member login, and the recipe importer.

## Limitations

- I validated JavaScript syntax and the local automated tests. I could **not** run this against your live Supabase schema or production Vercel site. Database migration and live checks are required.
- These audits apply to **admin-curated recipes**. Moderated **community submissions** still use a different queue (Admin → Recipe Moderation).
- The admin listing has paginated loading up to 20,000 curated recipes and editorial-review records. A much larger project should eventually use server-side search/filtering rather than loading the full admin catalog into the browser.
- Cooking-time corrections require actual recipe review; a fixed percentage decrease would make some recipes dangerously inaccurate.
