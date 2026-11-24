# Eatable v20 — Report a Problem (patch for v19)

This update adds a real **Report a Problem / Segnala un problema** page (`/en/report` and `/it/report`), linked from the desktop footer and mobile menu. Visitors can submit a category, title, description, current page path, and optional name and reply address. They do not need an Eatable account.

The form **sends an email automatically** using a Vercel serverless function and Resend. It includes Cloudflare Turnstile to mitigate automated spam. **Until the settings below are provided, the form deliberately remains disabled.** It does not falsely claim to send email.

## 1. Apply this update to GitHub

Extract the ZIP. Upload/replace these exact paths in your current `eatable` repository:

- `src/app.js` (updated)
- `src/problem-report.js` (new)
- `assets/styles.css` (updated)
- `api/report-problem.mjs` (new **server-side** Vercel Function)
- `vercel.json` (updated to route `/api` before the SPA fallback)
- `eatable-version.txt` (updated)

Do **not** delete any other files. In particular, keep `src/supabase-config.js` as it is. There is **no Supabase migration** for v20. Commit your changes and confirm the new Vercel production deployment is Ready.

**Important:** The new `api` directory must be in the repository root, alongside `index.html` and `vercel.json`, not inside `src`. This is how Vercel deploys Functions for static projects.

## 2. Create an email inbox for Eatable

Set up the email account you want to receive messages, for example `support@YOUR-DOMAIN`. This is a **placeholder**, not a mailbox created by this update. Create the address with a real email hosting provider (or use an existing inbox for testing).

An inbox that **receives** email is different from the service that **sends** email from your site.

## 3. Set up Resend (outbound email)

Visit https://resend.com and create an account, then create an API key. When you own and verify a sending domain inside Resend, set the sender to something like `Eatable <reports@YOUR-DOMAIN>`.

**Testing before you own/verify a domain:** Resend supports `onboarding@resend.dev` as a test sender, but it is restricted to delivering only to your Resend account's allowed email address. If your planned Eatable inbox is different, test delivery can fail until you verify your sender domain. See https://resend.com/docs .

Do not add the Resend API key to GitHub or to any browser-side JavaScript file.

## 4. Create a Cloudflare Turnstile widget

Visit https://dash.cloudflare.com → Turnstile → Add widget. Allow your current Vercel production hostname (and your future custom hostname when it is connected). Copy the **Site key** and **Secret key**. Turnstile runs in the visitor's browser; the token is validated **server-side** before any email is sent.

## 5. Add five Vercel environment variables

Vercel → Eatable → Settings → Environment Variables (Production):

| Name | Value | Public? |
|---|---|---|
| `RESEND_API_KEY` | The Resend API key | **Secret — server only** |
| `REPORT_TO_EMAIL` | Your actual Eatable receiving inbox (for tests: your Resend account email if using Resend's test sender) | Server only |
| `REPORT_FROM_EMAIL` | e.g. `Eatable <reports@YOUR-DOMAIN>` after Resend domain verification; or `onboarding@resend.dev` for the restricted test sender | Server only |
| `TURNSTILE_SITE_KEY` | Public Cloudflare Turnstile site key | Public configuration served by the API |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret | **Secret — server only** |

**Redeploy after saving environment variables.** Vercel uses environment variables from the deployment, so saving settings alone does not necessarily update an already-running version.

You do not need to enter your mailbox password anywhere in the Eatable code. Never paste your Resend API key or Turnstile secret into chat, GitHub, or screenshots.

## 6. Verify the complete workflow

1. Open `https://YOUR-VERCEL-DOMAIN/eatable-version.txt` and confirm `Eatable v20.0 — Report a Problem`.
2. Open `https://YOUR-VERCEL-DOMAIN/api/report-problem`: it should return **JSON** with `"ready":true` and a public site key. If you see a normal Eatable HTML page at this URL, the API route is not deployed/routed correctly. If `ready:false`, check the five Vercel environment variables and redeploy.
3. Open `/en/report` and `/it/report`, or click the footer link. Confirm that both languages work and the form becomes enabled once Turnstile loads.
4. Submit a real test report with a non-sensitive message. Confirm the webpage shows the successful status, then **check your Eatable inbox** (including Spam/Junk). A response from Resend means the message was accepted for sending; check actual inbox delivery separately.
5. Submit a report without signing in. Test from a mobile screen, and confirm that the originating recipe path is populated when navigating from a recipe page.
6. Check the rest of Eatable: main navigation, recipes, login, stars/reviews, admin pages, My Kitchen, and saved collections.

### Troubleshooting

- **`/api/report-problem` returns HTML:** Ensure the new `api/report-problem.mjs` and the updated `vercel.json` are both in the repository root; redeploy production.
- **`"ready": false`:** One or more environment variables is missing/blank; set all five and redeploy.
- **Turnstile cannot load:** Verify the widget allows the hostname you are using, and check for ad blockers or network restrictions.
- **Form says it could not send:** Check Vercel Function logs and your Resend dashboard; verify sender domain and recipient. The server intentionally avoids exposing secret provider errors to visitors.
- **Email not in inbox:** Verify Resend sending status, spam folder, receiving mailbox setup, and sending domain DNS records.

## Privacy and anti-abuse

The problem description, page path, and any optional contact details are sent to an email service. **Update Eatable's Privacy Policy before public launch** to describe this and set a retention policy. Do not request passwords or other sensitive information. The form collects no files or screenshots and has no database storage. Cloudflare Turnstile blocks many automated submissions, but is not a complete abuse prevention system: consider Vercel Firewall rate limits and monitoring before wider public exposure.

The website only shows a success message when the outbound email API returns a success response. It cannot guarantee inbox delivery. No account or email address is invented or automatically created by this patch.

## Notes

The new report handler uses a standalone Vercel Node.js Function (`/api/report-problem`) and the REST APIs of Resend and Cloudflare Turnstile. It requires no new npm dependencies and does not access Supabase. The server restricts request origins, validates inputs, verifies Turnstile tokens, and strips newlines from email subjects.
