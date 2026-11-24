# Eatable — Live cookie and browser-storage inspection

**Target:** https://cookwitheatable.com. This inspection must be performed on the live site in the user's browser; reading source code is insufficient.

## Procedure (Chrome desktop)

1. Open a **new incognito window** and press **F12** to open DevTools.
2. Open **Application > Storage** (left sidebar). Inspect **Cookies**, **Local storage**, **Session storage** for `cookwitheatable.com` and associated origins. Also check any `challenges.cloudflare.com` storage after opening the report page.
3. Record **names only**, domain, expiry/lifetime, purpose, first-/third-party and whether strictly necessary. **Do not copy cookie values or localStorage values**: they may contain authentication tokens.
4. In **Network**, check third-party calls to Supabase, `cdn.jsdelivr.net`, `challenges.cloudflare.com`, and unexpected services. Enable Preserve log and refresh as needed. Third-party resource requests do not automatically prove a nonessential tracker exists.
5. Repeat in these states: (a) guest homepage, (b) signed-in account, (c) opening a recipe and My Kitchen, (d) `/en/report` with Turnstile. For logged-in tests, use a separate normal/incognito session and don't export authorization headers.
6. In Vercel settings check whether **Web Analytics, Speed Insights, monitoring, custom scripts, or integrations** are enabled. In Cloudflare Turnstile check widget settings including **pre-clearance**. Verify live scripts not just source code.
7. Update EN and IT Cookies pages based on actual results. If you discover nonessential analytics/advertising tracking, assess prior consent and opt-out/withdrawal; do not activate a decorative consent banner that has no technical effect.

## Inventory to fill in

| State | Storage / cookie NAME only | Domain | Purpose/provider | Expiry or duration | Necessary? | Evidence / action |
|---|---|---|---|---|---|---|
| Guest | | | | | | |
| Signed in | | | | | | |
| Recipe / pantry | | | | | | |
| Report form | | | | | | |

**Expected from inspected source, not necessarily complete:** `eatable:ingredients`, `eatable:favorites` (fallback), `eatable:show-substitutions`, `eatable:cook-progress:*`, `eatable:report-source`; Supabase Auth persistence in browser storage. `cf_clearance` may appear with certain Turnstile configurations, but do not assume it is present.

Italian Garante: https://www.garanteprivacy.it/faq/cookie. Technical storage may not require prior consent, but appropriate information does; classification of any analytics depends on actual behavior and configuration.
