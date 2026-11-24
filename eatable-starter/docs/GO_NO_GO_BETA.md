# Eatable — Public-beta go/no-go checklist

**Current established facts:** custom domain and HTTPS confirmed by operator; login on custom domain confirmed; Report a Problem emails successfully received; curator/admin feature testing performed across previous versions. Actual production privacy practices are not fully audited.

## Blockers (must be resolved before inviting the public)

- [ ] EN/IT Privacy, Terms and Cookie pages reflect **verified** provider processing, controller details, retention criteria and rights-request workflow.
- [ ] Sensitive data is inaccessible across accounts (perform two-account RLS authorization tests, not just existence checks).
- [ ] Privacy requests can be received, tracked and completed; rehearse account erasure on a throwaway user only with tested procedures.
- [ ] Live cookie/storage and third-party script audit is complete, including Turnstile and Vercel settings.
- [ ] Supabase region, vendor processing/transfer terms, email/log/backups retention are documented.
- [ ] Admin credentials, Vercel secrets and Supabase privileged keys are not exposed client-side or in GitHub.
- [ ] Cross-language privacy/terms pages and account recovery work on cookwitheatable.com.
- [ ] Core published recipes used on home page are accurate, accessible and accompanied by properly licensed images where shown.

## Strong recommendations

- [ ] Run desktop + mobile smoke tests for homepage, ingredient search, reviews, user submissions, cooking mode, My Kitchen, collections and support email.
- [ ] Verify that featured recipe photos have permission/licensing documentation and suitable alternatives when missing.
- [ ] Confirm Vercel hosting plan allows the actual current noncommercial use; reevaluate if monetized.
- [ ] Confirm backups/restoration and GitHub rollback procedure; rehearse rollback of frontend only, not destructive database rollback.
- [ ] Test moderation of abusive reviews and recipe takedowns with a separate member and administrator account.

## Decision log

Date: ____________

Review completed by: ____________

Remaining blockers / mitigation: _______________________________________________

Outcome: [ ] Hold beta   [ ] Private testing only   [ ] Public beta approved after sign-off

This checklist does not certify legal compliance.
