# Eatable — Data-processing and cookie audit

**Date:** 24 November 2026  
**Basis inspected:** Eatable v21 source snapshot (`index.html`, `src/*.js`, `api/report-problem.mjs`) from the conversation artifacts, plus the working report diagnostic changes shown in this project. **The exact production deployment, dashboard settings and browser storage were NOT independently inspected.**  
**Declared operator:** Hussein AlRifai, individual noncommercial project. **Support contact:** eatable.support@gmail.com.

## Confirmed in inspected source

| Processing / storage | Where observed | Recipients / visibility | Proposed GDPR basis (to verify) |
|---|---|---|---|
| Email, display name, account ID, Supabase session, language | `src/cloud.js` | Supabase; display name can appear publicly | Art 6(1)(b) — requested account service |
| Favorites, pantry, shopping list, collections | `src/app.js`, `src/kitchen-cloud.js`, `src/collections-cloud.js` | Supabase; intended private through RLS | Art 6(1)(b) |
| Submitted recipe text, photos, status, moderation | `src/community-cloud.js`, `src/photo-cloud.js` | Supabase; approved content public | Art 6(1)(b) and 6(1)(f) for moderation |
| Recipe ratings, comments | `src/reviews-cloud.js` | Supabase; approved visible reviews public | Art 6(1)(b); moderation 6(1)(f) |
| Support report category, title, text, page path; optional name/email | `src/problem-report.js`, `api/report-problem.mjs` | Vercel -> Resend -> Gmail | Art 6(1)(f), response and abuse prevention |
| Anti-spam browser signals / verification token | `src/problem-report.js` | Cloudflare Turnstile | Art 6(1)(f), security (cookie qualification must be checked) |
| Rule-based recommendations based on user collections and pantry | `src/personalized.js`, `src/app.js` | browser and existing account data | Art 6(1)(b), personalized service requested |
| Browser localStorage: `eatable:ingredients`, `eatable:favorites`, `eatable:show-substitutions`, `eatable:cook-progress:*` | `src/app.js`, `src/cooking-mode.js` | Local browser | Technical / functional storage |
| Browser sessionStorage: `eatable:report-source` | `src/app.js` | Local browser | Technical / functional storage |
| Auth tokens in browser localStorage | `src/cloud.js` `persistSession:true` and Supabase SDK defaults | Browser, Supabase | Authentication storage |
| Supabase SDK fetched from jsDelivr | `src/cloud.js` dynamic import | jsDelivr receives request metadata | Technical service, inspect request policies |
| Other website requests and function logs | Vercel hosting and API | Vercel; Resend/Gmail/Cloudflare logs | Art 6(1)(f), security/operations |

**Not found in inspected source:** Google Analytics / GA4, Meta Pixel, ad scripts, Hotjar, Clarity or an explicit nonessential tracking banner. **Not verified:** any dashboard-enabled Vercel Analytics / Speed Insights, security headers, remote scripts inserted after build, production HTTP cookies, Turnstile pre-clearance, exact data flows outside EEA.

## Important legal conclusion

A public recipe site with account registration, contributions and reviews **does not automatically qualify for the purely personal/household exemption** just because the operator does not earn money. GDPR obligations can still apply. Sources: [GDPR Article 2](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/); [CJEU Lindqvist C-101/01](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A62001CJ0101).

## Live browser cookie audit (mandatory before removing the notice banner)

1. Open `https://cookwitheatable.com` in an **incognito window** with a fresh browser profile. Open DevTools → **Application → Storage** → Cookies, Local Storage, Session Storage. Record **name, domain, purpose, duration, provider, and technical/nonessential classification**. Export only sanitized values — **never** auth tokens or session contents.
2. Repeat after signing in, viewing a recipe, using My Kitchen, and visiting `/en/report` (Turnstile). Check whether `cf_clearance` or other third-party cookies appear, and whether the anti-spam widget is pre-clearance enabled.
3. In DevTools → **Network**, filter by third-party domain. Capture `challenges.cloudflare.com`, Supabase, `cdn.jsdelivr.net`, Vercel and anything unexpected. Inspect cookies attached to requests, not only JavaScript files.
4. Verify **Vercel dashboard settings** for Analytics, Speed Insights, logs, observability integrations and any injected scripts. Also check Cloudflare Turnstile dashboard pre-clearance and any Google scripts configured outside the repository.
5. If any nonessential advertising or analytics trackers exist, assess **prior consent** requirements and implement compliant controls before enabling them. If only strictly technical storage exists, document the uses and do not add an unnecessary banner. Italian Garante reference: https://www.garanteprivacy.it/faq/cookie

## Operational facts to confirm before beta

- [ ] **Retention:** set and enforce support-email retention and deletion process (suggested internal target: 90 days after closure, not a statement about current practice); verify Resend/Gmail automatic retention, logs and backup periods.
- [ ] **Account deletion:** document a workable procedure to erase Supabase Auth user, linked profile, favorites, pantry, lists, collections, submissions/photos and reviews as applicable; check foreign-key cascades and backups. The current UI does **not** have a self-service delete-account control; manual email requests need an actual execution process.
- [ ] **Operator identity/contact:** confirm Hussein AlRifai is the actual data controller, that eatable.support@gmail.com is monitored for privacy requests, and any extra legally required contact disclosures. No personal home address has been added to the site.
- [ ] **Processors & transfers:** verify actual Supabase AWS region and DPAs / subprocessors for Supabase, Vercel, Resend, Google and Cloudflare; check international transfer mechanisms and policies. Do not claim all data remains in the EU without evidence.
- [ ] **Rights-handling:** be able to respond to subject access, rectification, deletion, objection and data portability requests, in normal statutory timeframes; clarify handling of publicly displayed content and backups.
- [ ] **Cookie check:** document live technical storage + Turnstile; check whether analytics or ads are activated outside source code. Install a consent mechanism only if required by actual tracking.
- [ ] **User content licence:** confirm acceptance of Terms when submitting content and ensure license aligns with real moderation/translation and photography workflows.
- [ ] **Minors / sensitive content:** set an age and content policy appropriate to intended audience; ensure support forms discourage sensitive data, review reports securely.
- [ ] **Accuracy & launch:** check every EN/IT route, all footer links, last updated date, beta label and the reporting API; obtain an Italian privacy/legal review if possible.

## Vendor & legal reference links

- GDPR Articles 12–15, 17, 21, 44–46: https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/
- Italian Garante cookies: https://www.garanteprivacy.it/faq/cookie
- Cloudflare Turnstile overview and browser signals: https://developers.cloudflare.com/turnstile/
- Supabase authentication storage: https://supabase.com/docs/reference/javascript/auth
- Supabase processing/region: https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq
- Vercel runtime logs: https://vercel.com/docs/logs/runtime

**Status:** Source-based draft prepared. Legal sufficiency of live public notices is NOT certified. Do not switch off the warning solely because code syntax tests pass.
