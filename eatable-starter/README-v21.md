# Eatable v21 — Public Beta Information Pages (patch for working v20)

This update adds five English/Italian pages to the existing Eatable site:

- `/en/about`, `/it/about` — About Eatable, Lebanese heritage, and creator Hussein AlRifai
- `/en/contact`, `/it/contact` — Eatable support email and working Report a Problem link
- `/en/privacy`, `/it/privacy` — **DRAFT**, explicitly marked for legal review
- `/en/terms`, `/it/terms` — **DRAFT**, explicitly marked for legal review
- `/en/cookies`, `/it/cookies` — **DRAFT**, explicitly marked for actual browser-storage/tracker audit

Links are added to the footer and mobile menu. The report feature remains unchanged. All Supabase, Vercel API, Resend, and Turnstile configurations must be **preserved**.

## Install

1. Back up the current working GitHub commit and Vercel deployment.
2. Upload these matching paths to the existing `eatable` repo: `src/app.js`, new `src/public-pages.js`, `assets/styles.css`, and `eatable-version.txt`. Do not remove anything else.
3. **Do not overwrite** `src/supabase-config.js`, `api/report-problem.mjs`, `vercel.json`, or `index.html`.
4. Commit and ensure the Vercel **Production** deployment is Ready.
5. Confirm `/eatable-version.txt` reads `Eatable v21.0 — Public Beta Information Pages`.
6. Test all ten routes, EN/IT language switching, footer/mobile menu, and the report flow at `/en/report` and `/it/report`.
7. Test login, recipe pages, ratings, saved collections, My Kitchen, and the admin interface. If a regression occurs, revert only this commit; don't touch Supabase.

**No SQL migration. No environment variables. No new external service.**

## Critical pre-launch legal review

The Privacy, Terms and Cookies pages are **deliberately labeled drafts**, not ready-to-publish legal notices. See `docs/PRELAUNCH_LEGAL_CHECKLIST.md` to confirm the data controller, legal bases, service providers, tracking, cookie consent, retention, user content licence, and other required details. Do not remove draft notices or present the templates as compliant until they have been reviewed and completed.

Reference sources: GDPR Art. 13: https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/ ; Italian regulator on cookies: https://www.garanteprivacy.it/faq/Cookie .

## Validation

Run Node syntax checks on the changed modules, review link routing and render tests. **Production legal correctness and live integration are not certified** by these static tests.
