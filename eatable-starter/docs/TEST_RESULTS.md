# Eatable v8 — Build verification

- All JavaScript source modules passed `node --check`.
- `tests/quality.mjs` passed for QA completion, missing-photo and incomplete-content flags, dashboard filters, English/Italian UI and formula-safe CSV export.
- `tests/smoke.mjs` (v7 regression) passed with an intentionally empty temporary configuration module, removed before packaging.
- v8 SQL migration adds a private admin-only review table and resets stale attestations when recipe data/images change. SQL has been reviewed statically but not run against a live Supabase project in this environment.
- A live browser/authorization/end-to-end Supabase test must be carried out after installation.
