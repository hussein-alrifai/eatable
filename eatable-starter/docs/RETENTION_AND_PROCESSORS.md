# Eatable — Retention and provider register (operator verification)

**Never publish a retention period merely because it appears in this template.** Publish only what you can actually enforce and substantiate. Information compiled 24 November 2026.

| Data / service | Known from source or provider documentation | Proposed action / decision needed | Verified? |
|---|---|---|---|
| Supabase Auth and profile | Stored while account exists | Implement and test deletion/erasure procedure, including logs and backups | No |
| Favorites, pantry, shopping, collections | Stored in Supabase and keyed to users | Confirm per-table cascade, user requests, and backups | No |
| Recipe contributions, reviews and photos | Some content published; photos in private/public Storage | Review public attribution, unpublishing and Storage cleanup separately | No |
| Gmail support reports | Delivered to `eatable.support@gmail.com` | Choose a defensible support-message retention period; e.g., **90 days after resolution** as a *proposal*, label and manually/automatically review, document exceptions and confirmations | No |
| Resend sent email and API logs | Resend currently states 30-day retention for email and log data on Free, Pro, and Scale while account active; confirm your plan and current terms: https://resend.com/security/gdpr/ | Record real provider retention, verified sender domain, DPA and any subprocessor terms | No |
| Vercel function/runtime logs | Hosts the website and support-email endpoint | Check log retention for your actual plan and active integrations; document IP/technical data handling | No |
| Cloudflare Turnstile | Anti-bot verification on support form | Review data handling, any cookies/pre-clearance, DPA and any transfer mechanisms | No |
| Google Gmail | Stores incoming support messages | Confirm inbox management, deletion/retention process and Google's terms applicable to your account | No |
| jsDelivr | Loads Supabase client library | Evaluate external connection disclosure, CSP/integrity options, provider documentation | No |
| Supabase geographic region | Project region is set in dashboard | Verify actual project region and provider/subprocessor international transfers; do not assume EU-only | No |

### Controller commitments to define

1. A monitored privacy-request channel at `eatable.support@gmail.com` and an owner responsible for replies.
2. Request tracking with receipt date, action performed, and response status, without copying private user data into a public spreadsheet.
3. Retention schedules enforced in practice (not just promised), with documented exceptions and provider backup lifecycle.
4. Vendor roles/DPAs and transfer safeguards for any processing outside the EEA; include processors in legal notices.
5. A documented incident response route: protect keys and credentials, triage reports, identify affected data, and consult relevant breach-notification duties if needed.

This is an **operations register**, not a claim that the live configuration has been verified.
