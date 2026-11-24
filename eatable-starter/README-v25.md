# Eatable v25 — Search Visibility Foundation

Target production origin: https://cookwitheatable.com

## Scope

This is a low-risk patch against the **v24 source files in this collaboration**.
It does not modify Supabase, Vercel API routes, the working Report a Problem endpoint,
Resend, Cloudflare, the v22 legal content, or account-deletion requests.

### Files
- `src/seo.js` — NEW: localized SEO metadata, canonical URLs, language alternatives, and noindex on personal/admin/legal-draft pages.
- `src/app.js` — REPLACE, or merge only the `seo.js` import and the `updateSeo()` call inside `render()` if you have other changes.
- `index.html` — REPLACE, or merge the added Open Graph/Twitter metadata into your existing `<head>`.
- `robots.txt` — NEW: sitemap discovery.
- `sitemap.xml` — NEW: 14 English/Italian public URLs (seven page types × two languages).
- `eatable-version.txt` — OPTIONAL.

### Important limits
- **This is a single-page app.** Route-specific SEO tags are updated by JavaScript.
  Google can render JavaScript, but social preview bots and some other crawlers may
  only see the generic initial HTML metadata. Unique recipe social cards and
  reliable indexing for database-created recipe detail pages will require
  prerendering or server rendering later.
- No recipe detail pages appear in this sitemap because their published slugs
  must be read from the production database and kept in sync.
- `robots.txt` **does not protect private data**; security remains with Supabase RLS.
- Legal pages remain in review, and this code noindexes them until finalized.
  After legal review, update this rule deliberately.
- Existing 404s currently use the SPA fallback (HTTP 200). Proper 404 handling
  is a future search-quality improvement, not something this patch falsely claims to solve.
- The new metadata does not add cookies or analytics.

## Install
1. Back up your current GitHub files.
2. Add `src/seo.js`, `robots.txt`, and `sitemap.xml` in the repository root.
3. Merge or replace `src/app.js` and `index.html` as described above.
4. Commit and allow Vercel to deploy.
5. Visit `https://cookwitheatable.com/robots.txt` — it must display plain text, not the Eatable app.
6. Visit `https://cookwitheatable.com/sitemap.xml` — it must display XML, not the Eatable app.
7. Open `/en`, `/it`, `/en/lebanese`, and `/en/account` and inspect the
   canonical/hreflang/noindex tags in DevTools Elements > `<head>`.
8. Set up Google Search Console: https://search.google.com/search-console
   Add domain property `cookwitheatable.com`; add the Google TXT record to the
   domain's authoritative DNS provider (Vercel if its DNS hosts the domain).
   Once verified, submit `sitemap.xml` in Search Console.

## Expected behavior
- `/en` canonical: `https://cookwitheatable.com/en` and language alternatives EN/IT.
- `/it/lebanese` canonical: `https://cookwitheatable.com/it/lebanese`.
- `/en/account` is marked `noindex,follow` by JavaScript and has no canonical.
- `/en/privacy` is `noindex,follow` until the legal-draft review is finished.
- Existing Supabase and Vercel backend functions are unaffected.
