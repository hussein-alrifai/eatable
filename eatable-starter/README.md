# Eatable v24.1 — Automatic account-deletion email notifications

**Purpose:** Send an email to `eatable.support@gmail.com` each time a NEW deletion request is inserted into `public.eatable_deletion_requests`. It reuses the Resend service already used for **Report a Problem**.

**No SQL migration, no change to v24 account form, no change to other APIs.** The notification is server-to-server; it does not delete an account.

## Step 1 — Add the endpoint to GitHub

Upload **only** `api/deletion-request-notify.mjs` into your existing Eatable repository at `api/deletion-request-notify.mjs`. Keep your working `api/report-problem.mjs` untouched. Commit and wait until Vercel says **Ready**.

## Step 2 — Add ONE Vercel environment variable

In Vercel → Eatable project → Settings → Environment Variables, add:

- Name: `EATABLE_DELETION_WEBHOOK_SECRET`
- Value: create a long random secret of at least 32 characters (prefer 64 random hexadecimal characters, e.g. via `openssl rand -hex 32` on your own computer).
- Environment: **Production** (and only the other environments if you deliberately test them).

You already have these variables for Report a Problem, so **do not change them**:

- `RESEND_API_KEY`
- `REPORT_TO_EMAIL=eatable.support@gmail.com`
- `REPORT_FROM_EMAIL` (your existing working sender)

**Redeploy** the Production deployment after creating the new environment variable: changes to env vars do not affect previously deployed functions. Never put the webhook secret or Resend key in frontend JavaScript or GitHub.

## Step 3 — Create a Supabase Database Webhook

Supabase Dashboard → **Database → Webhooks** (sometimes under Integrations → Database Webhooks) → **Create webhook**:

| Setting | Value |
|---|---|
| Name | `eatable_deletion_email_alert` |
| Table | `public.eatable_deletion_requests` |
| Events | **INSERT only** |
| Type | **HTTP Request** (not Edge Function) |
| Method | **POST** |
| URL | `https://cookwitheatable.com/api/deletion-request-notify` |
| HTTP header | `Content-Type: application/json` |
| HTTP header | `x-eatable-webhook-secret: <EXACT SAME SECRET AS VERCEL>` |

If Supabase pre-populates a service-role Authorization header in the HTTP Request configuration, **remove it**. Do not send service-role, JWT or Resend API keys to this endpoint. Use only the dedicated webhook secret header.

Save and enable the webhook. This event runs asynchronously after the insert.

### Test

1. Use a **separate test account** and submit a new deletion request at `https://cookwitheatable.com/en/account/deletion` (or Italian `/it/account/deletion`).
2. Verify the new row appears in the `eatable_deletion_requests` table.
3. Check `eatable.support@gmail.com` inbox and spam for **[Eatable] New account deletion request**. The email has the request ID and UTC date; open Supabase to review details.
4. If not received, check Vercel → Logs for `/api/deletion-request-notify`, the Supabase webhook call logs, and Resend → Emails/Logs. HTTP **200** means Resend accepted the request, not necessarily that the message reached the inbox.

**Important:** Creating the webhook does not notify you about existing pending requests. Only **new INSERT** events cause an email. If you have already tested the form on your account, it will show a pending request instead of inserting another row; use another test user. Also inspect already-pending rows manually now.

### Security and reliability

- Vercel verifies a dedicated secret before accepting the webhook. Treat it like a password. Supabase dashboard-generated webhook trigger definitions may expose custom-header values in database dumps; use an independent secret, **never** a Supabase service-role key.
- The request must be an INSERT for the expected table with a valid UUID and pending status.
- The email contains only request ID and time, not user IDs or private notes.
- Resend's Idempotency-Key reduces duplicate alerts for retry/replay within the provider's idempotency window.
- The email alert is **best-effort**, not a guaranteed notification queue. Continue checking the pending-request table periodically to avoid missing failed deliveries.
- Account deletion continues to be **manual and administrator-reviewed**. Don't send identity documents by email.

## Rollback

Disable the Supabase webhook and delete the new `api/deletion-request-notify.mjs` route from GitHub if needed. No database content is changed by this patch.
