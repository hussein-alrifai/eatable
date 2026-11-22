# Eatable v3.0 — Test evidence and limitations

- `node --check` passed for `src/app.js`, `src/cloud.js`, `src/community-cloud.js`.
- Browser rendering checks passed for homepage, Community, Submit, My Submissions, Admin, and approved community recipe details using mocked in-memory data. No browser JS errors were observed in those tests.
- Static ZIP inspection confirmed `src/supabase-config.js` omitted intentionally.
- **Not yet tested** against the user's live Supabase project; migration execution, real authentication and admin moderation flows must be verified after deployment.
- Manual end-to-end checks are in `README.md`, including ordinary-user unauthorized access and publication/unpublication tests.
