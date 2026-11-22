# Eatable v8 release tests

1. Run `node --check` for each file in `src/*.js`.
2. Run `node tests/quality.mjs` to test QA calculations, two-language rendering and safe CSV output.
3. Run the v7 regression suite (`tests/smoke.mjs`) with a temporary empty `src/supabase-config.js`, then remove the temporary file. The release ZIP must never replace your real config.
4. In your existing Supabase project, run only `sql/07_content_quality.sql` and confirm `eatable_curated_reviews` exists with RLS enabled.
5. Verify admin read/write; verify normal users and guests have no read/write access to editorial reviews.
6. Mark Batata Harra reviewed; update ingredients, translations, or photo; confirm the relevant review checkbox resets.
7. Verify filter and CSV export on English and Italian admin-quality routes.
8. Verify old v7 photo and community behavior still works; check `/eatable-version.txt` reads `Eatable v8.0`.

The build environment supports static/isolated tests, not a live Supabase end-to-end test.
