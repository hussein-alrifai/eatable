# Eatable v7 checks

1. `node --input-type=module --check < src/app.js` and similarly for all changed JS modules.
2. `node --experimental-default-type=module tests/smoke.mjs` (requires the existing `src/supabase-config.js` file, intentionally absent from the release ZIP).
3. Review `sql/06_curated_photography.sql` and run it once in the existing Supabase project.
4. Test photo: new draft, existing draft preview, publish, replace, unpublish, normal-user denial.
5. Confirm `/eatable-version.txt` displays `Eatable v7.0`.

All isolated JavaScript/unit assertions passed in the build environment. Live browser testing was blocked by environment restrictions; actual Supabase RLS and image-storage flows must be verified after deploying.
