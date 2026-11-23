# Eatable v14.0 — Recipe Discovery & Rankings

**Incremental update on top of your working Eatable v13 with the reviews hotfix.**

## What's included

- Explore: sort by Recommended, Highest Rated, Most Popular, Newest, Fastest.
- Explore: combined filters for cuisine, vegan/vegetarian, maximum cook time, minimum rating, plus bilingual recipe search.
- Recipe cards: average stars, review count, and aggregate number of saves (no user identities disclosed).
- The Lebanese Table: an editorially selected featured row, followed by more Lebanese dishes.
- Admin review hide/restore and member review edits refresh the discovery statistics.
- Search by available ingredients, cooking mode, private pantry, shopping lists, accounts, media, and curated editor stay unchanged.

## Safe deployment steps

1. Keep the last successful v13 GitHub commit for rollback.
2. In your **existing** Supabase project, open **SQL Editor → New query** and run **`sql/10_discovery_rankings.sql`** once. This adds a curated publication timestamp and an aggregate-only public RPC, `eatable_discovery_stats()`. It does not delete recipes, users, reviews, or favorites.
3. Extract the ZIP. Upload files and folders at the **root** of your existing `eatable` GitHub repository, replacing matching files. This is an incremental update; **do not delete unchanged files**.
4. Keep your working **`src/supabase-config.js`** unchanged. This ZIP does not include it.
5. Wait for a **Ready** production deployment in Vercel. Visit `/eatable-version.txt` — it should say `Eatable v14.0`.
6. On `/en/recipes` and `/it/recipes`, test filters and all five sort options. Test `/en/lebanese` and `/it/lebanese` for the featured row.
7. Save and unsave a recipe with an account, then refresh the page: the aggregate save count should adjust. Add, edit, hide and restore a review: the relevant ratings and ranking should update after refresh. The review page continues to work with the v13 hotfix.

## Ranking policy (no fabricated statistics)

- **Highest Rated:** Bayesian weighted mean `(review_count × average_rating + 5 × 3.5) ÷ (review_count + 5)`; unreviewed recipes rank below reviewed recipes. This avoids putting a single 5-star vote ahead of many consistently positive reviews.
- **Most Popular:** `2 × total_favorites + number_of_visible_reviews` from published recipes. This is a clearly defined engagement measure, **not** the number of recipe views.
- **Newest:** publication date of community recipes, plus `published_at` for curated recipes. Existing curated recipes predate this feature: their last-updated time is used as an approximate historical publication timestamp. Newly published/republished curated recipes are dated accurately by a database trigger.
- **Recommended:** popularity then weighted rating. **Fastest:** ascending recipe duration.
- Featured Lebanese: an editorial shortlist of known Lebanese recipe slugs (if published), filled by other Lebanese recipes. No invented engagement numbers or forced dummy recipes.
- Ratings reflect only visible reviews. Hidden reviews do not contribute to public scores.
- Public RPC returns **aggregate counts only**; it never returns individual users, emails, or private favorite rows. Private favorites remain RLS-protected.

## Failure handling

- If migration 10 has not been applied or the RPC returns an error, the website keeps recipe browsing and cooking available; Explore displays a rankings-unavailable notice and does not apply the minimum-star filter. **Do not disable RLS or enable Realtime to fix this.**
- A JavaScript failure: inspect DevTools Console, restore the previous GitHub commit, and leave Supabase data intact.
- The entire live Supabase deployment must still be tested on your project; the included tests are local syntax/module, data-model and simulated rendering checks.

## Files in the package

- `src/app.js` — fixed v13 base plus v14 layout, filters, metrics refresh
- `src/discovery-ranking.js` — pure sorting/filtering rules
- `src/discovery-stats-cloud.js` — one aggregate RPC request
- `assets/styles.css` — additional mobile/desktop styles
- `sql/10_discovery_rankings.sql` — **run this SQL once**
- `eatable-version.txt` — deployment marker
- `tests/` — automatic checks (optional on GitHub)
- This README

**No new Supabase project, keys, storage buckets, or special browser permissions are required.**
