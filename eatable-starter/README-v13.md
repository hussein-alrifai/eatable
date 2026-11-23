# Eatable v13.0 — Ratings & Reviews

**Incremental update for a working v12 installation.** This release adds member ratings and public written reviews to published curated and community recipes. The update preserves existing accounts, recipe catalog, admin/editor, ingredient search, pantry, shopping lists, and v12 cooking mode.

## 1. What changes

- Guests can read public recipe ratings and reviews; they do not need an account.
- Signed-in users may submit **one rating (1–5 stars) per recipe**, optionally with a comment (up to 1,200 characters).
- Members can update or delete their own review.
- The recipe page shows average rating and rating count, plus the latest 30 review entries.
- Administrators can hide or restore inappropriate reviews directly on a recipe page. Hidden reviews are excluded from public aggregates.
- Both English and Italian interfaces are supported.
- Reviews are linked to the appropriate recipe using a curated slug or approved community UUID. Unpublished recipes cannot receive public reviews.
- Public review displays use generic member labels rather than exposing private profile data or email addresses.

## 2. Installation — in order

1. **Keep your working v12 GitHub commit** in history for rollback. Do not delete any Vercel or Supabase project.
2. Go to **Supabase > your existing `eatable` project > SQL Editor > New query**.
3. Copy the contents of `sql/09_ratings_reviews.sql` into the SQL Editor and run it **once**. The migration creates only the `eatable_recipe_reviews` table, its access policies, triggers and summary function. It does not modify existing recipe, favorites, pantry, or account tables. **Do not rerun migrations 01–08.**
4. Extract this ZIP. Upload the contained **files and folders to the root of the existing GitHub repository** (the root containing `index.html`) and replace corresponding files. Do not upload the ZIP as a single file, create a nested `eatable-v13` folder, or remove untouched files. Upload all `src` files in the ZIP. Commit the changes.
5. **Keep `src/supabase-config.js` unchanged.** This update does not contain your credentials and does not require new credentials, auth redirects, storage buckets, or a new database.
6. In Vercel, verify that the new **Production** deployment is **Ready** and `/eatable-version.txt` says `Eatable v13.0`. Use a hard refresh if you still see a cached interface.

### Update files

- `src/app.js` — updated recipe detail, load state, review form handling and moderator actions.
- `src/reviews-ui.js` — new, bilingual review UI and validation.
- `src/reviews-cloud.js` — new, Supabase queries for fetching, posting, updating, deleting and moderating reviews.
- `assets/styles.css` — new review styles with mobile layout.
- `eatable-version.txt` — version marker.
- `sql/09_ratings_reviews.sql` — new SQL migration (run once in Supabase, GitHub copy optional).
- `tests/reviews.mjs`, `tests/render-v13.mjs` — optional development tests.

## 3. Live test checklist

1. Open a **published curated** recipe, for example `/en/recipes/batata-harra` if that recipe is still published. The Ratings & Reviews section should show `0 reviews` or an existing count, **not** an error.
2. Logged out, verify that ratings are readable and the page asks you to sign in to post.
3. Sign in with your normal member account. Rate the recipe with 4 stars and write a short comment. Submit; your review should appear immediately.
4. Change your rating to 5 stars; confirm the total count does **not** increase. Delete your review; confirm the count decreases.
5. Using a second account, add a different review. Confirm that the first account cannot edit or delete it.
6. Sign in with an **administrator account**. Hide the second review, and confirm its rating is excluded from the public average. Restore it and check that it reappears.
7. Repeat with a **published community recipe** through `/en/community/<recipe-uuid>`.
8. Switch to Italian and verify labels on `/it/recipes/...`; test cooking mode, ingredient search, saved recipes, and shopping lists as regressions.
9. Unpublish a curated test recipe and verify the public recipe page and its reviews are no longer accessible. Republishing it restores the previously attached review history.

### If an error appears

- `Could not load reviews` / `404` for `eatable_recipe_reviews` or RPC `eatable_review_summary`: SQL 09 probably was not run in the same Supabase project as the website, or it failed. Check SQL Editor results and your project's URL.
- `new row violates row-level security policy`: Sign in again, confirm the recipe is published and the profile belongs to the logged-in account. Do **not** weaken RLS to bypass the error.
- White screen: First check the Vercel deployment and browser console, then restore the previous working GitHub commit. **Do not delete Supabase tables** to roll back frontend code.

## 4. Security and limitations

- RLS and trigger checks enforce ownership and publication status. Members cannot make themselves administrators or change another member's rating through the API. Admins can hide/unhide reviews, but cannot rewrite other users' comments or star ratings.
- Displayed comments are HTML-escaped. Reviews are publicly readable when visible; people should avoid sharing sensitive personal details.
- Reviews are immediately public; this is **not** a premoderated review system. The current admin hide/restore control supports manual moderation. Automated spam detection and user reports remain future work.
- Review stars and averages appear on recipe detail pages only, not on all search result cards.
- Average is server-computed over visible reviews; the interface displays the most recent 30 reviews. No automatic pagination yet.
- Offline/demo mode retains recipe browsing but disables Supabase-backed ratings.

## 5. Tests completed before packaging

- `node --check` on new and updated JS modules; passed.
- v13 validation, HTML escaping and bilingual/admin/guest rendering tests; passed.
- v13 integrated recipe-detail and v12 cooking overlay simulated test; passed.
- Existing v7–v12 unit/regression tests; passed.
- A full Chromium browser smoke test was attempted but blocked by the environment's navigation restrictions (`ERR_BLOCKED_BY_ADMINISTRATOR`). The live Vercel/Supabase flow must be tested on your site.

This update does **not** create a restaurant ordering system. The restaurant integration remains a later phase of Eatable.
