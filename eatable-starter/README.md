# Eatable v24 — Account deletion requests (safe beta step)

**This is not an automatic deletion feature.** It adds an authenticated bilingual user form at `/en/account/deletion` and `/it/account/deletion`, saving pending requests in a private Supabase table; requests are handled manually by the administrator.

## Install (order matters)
1. Back up your Supabase project and keep the previous working GitHub commit for rollback.
2. In Supabase SQL Editor, run `sql/12_account_deletion_requests.sql` once. Confirm successful commit. The migration enforces `community_recipes.id` → `recipe_submissions.id` with **ON DELETE RESTRICT**, because the existing publication trigger already uses identical IDs. It changes no existing account, recipe or Storage object. Your last audit found zero community recipes, so existing data should not require backfill.
3. In GitHub replace **only** `src/app.js`, add `src/account-deletion.js` and replace `eatable-version.txt` (optional version marker). **Keep the v22 `src/public-pages.js` untouched.** Keep Supabase settings, Vercel route, API route and all other files untouched.
4. Wait for Vercel Production deployment and visit `https://cookwitheatable.com/en/account/deletion` while signed in.
5. Create a test deletion request with a non-production test account; verify the pending row in Supabase Table Editor. Confirm another user cannot see that row through the normal application SDK. Test Italian `/it/account/deletion`.
6. Manually inspect the new table and routinely check it for requests: no automatic email notification is sent.

## Important
- Never paste the Supabase secret/service_role key in browser code or GitHub.
- The form asks for a deletion **request** only; it never deletes any account or files.
- Requests are private (RLS owner/admin); anonymous users cannot submit requests.
- An admin should process identity, recipe, Storage and account cleanup using `docs/ADMIN_RUNBOOK.md`. Do not manually delete Storage metadata via SQL.
- Request notes are optional and limited to 500 characters; no email or uploaded documents are requested.
- This migration adds no account-deletion automation or cookie/retention controls. Keep the legal review notice until those items are fully verified.

## Automated checks
- JS syntax checks with Node.
- Route integration, safe request-only behavior and SQL RLS text checks in `tests/v24-check.mjs`.
- Supabase policies and live Vercel behavior **were not tested against your account**; verify with two test accounts before beta.
