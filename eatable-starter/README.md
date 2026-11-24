# Eatable v22 — Bilingual legal notices and source-based cookie audit

**This is a small, one-file website update.** It modifies `src/public-pages.js` only, preserving About/Contact, report sending, database connections, frontend functionality and your Supabase settings.

Included:
- `src/public-pages.js`: revised EN/IT Privacy, Terms and Cookies & Storage notices reflecting the individual noncommercial operator and inspected v21 features.
- `docs/PRIVACY_COOKIE_AUDIT.md`: data flow inventory, browser cookie audit, legal links and essential operational confirmations.

## Install safely
1. Keep the last known-good GitHub commit. **Do not** upload this ZIP as a nested folder.
2. Replace **only** `src/public-pages.js` in your `eatable` repository with the file from this package. Keep `src/supabase-config.js`, `api/report-problem.mjs`, `src/app.js` and all other files unchanged.
3. Commit. Vercel production deployment should rebuild automatically.
4. Test `/en/privacy`, `/it/privacy`, `/en/terms`, `/it/terms`, `/en/cookies`, `/it/cookies` and language switching. Verify login and `/en/report` still work.
5. Complete the checks in `docs/PRIVACY_COOKIE_AUDIT.md` **before** removing the prominently displayed publication-review notice.

## Why a banner remains
This patch does **not** falsely certify legal compliance. We cannot verify your live cookie inventory, provider transfers and real deletion/retention operations from the provided source alone. The warning stays visible until you have verified and updated those facts. A public noncommercial project may still be subject to the GDPR.

No SQL migration; no Vercel environment-variable changes; no API-key changes.
