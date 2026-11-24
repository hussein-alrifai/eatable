# Eatable v23 — Privacy Operations & Production Audit

**Status:** operational verification kit, not a website release. **Do not upload this ZIP to GitHub or change the website or Supabase schema.** Prepared 24 November 2026 for https://cookwitheatable.com, operated as a personal noncommercial project.

## What this contains

- `sql/READ_ONLY_PRIVACY_CHECKS.sql`: five read-only SQL checks for tables, RLS, foreign keys, Storage buckets, and callable public functions.
- `docs/ACCOUNT_DELETION_RUNBOOK.md`: controlled handling of access/erasure requests, with published-contribution and photo cleanup warnings.
- `docs/COOKIE_AUDIT.md`: step-by-step live browser inspection, without copying token values.
- `docs/RETENTION_AND_PROCESSORS.md`: proposed retention register and actual-provider checks still required.
- `docs/GO_NO_GO_BETA.md`: launch readiness decisions and evidence.
- `docs/ISTRUZIONI_ITALIANO.md`: concise Italian summary.

## Suggested order

1. Open Supabase > Eatable > **SQL Editor > New query**. Paste and run the **read-only** SQL. Check expected tables and RLS; it changes nothing. Take screenshots of non-sensitive summaries only.
2. Follow `docs/COOKIE_AUDIT.md` on your **real production site** in a fresh incognito browser profile, with guest, logged-in and report-form checks.
3. Decide the support-mail retention workflow and rehearse account-erasure handling **without actually deleting an account**.
4. Confirm the provider/transfer facts in Supabase, Vercel, Resend, Cloudflare and Google settings and revise the v22 bilingual legal pages to match.
5. When all launch gates pass, seek suitable legal review as needed and remove the v22 draft notices in a separate, controlled versioned change.

## Important facts established by source inspection

- `profiles`, `user_favorites`, `recipe_submissions`, `user_pantry`, `user_shopping_items`, `eatable_recipe_reviews`, and collections have foreign keys configured to cascade or depend on cascading records when the Auth user is deleted.
- `community_recipes` contains **published copies**, not a direct user-id foreign key. Deleting an Auth account **may leave the approved public recipe**; review publication separately.
- Supabase Storage photo objects require separate cleanup before Auth account deletion. Public photos require extra review for removal from the site and/or attribution.
- v22 remains a source-based *draft*: actual retention, provider transfers and live cookie behavior have NOT been independently verified.

Do not run destructive SQL in a production database without a reviewed account-specific deletion procedure and a verified recovery plan.
