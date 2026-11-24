# Eatable — Data rights and account-erasure runbook (draft)

**For:** Hussein AlRifai, operator of cookwitheatable.com. Support: eatable.support@gmail.com. 24 November 2026.

## First receive and classify a request

- Accept requests by email to `eatable.support@gmail.com` (subject e.g., `Privacy request — Eatable`). Keep an internal request reference, receipt date, type (access, correction, deletion, objection), and deadline. Do not forward or share private data unnecessarily.
- Under GDPR Article 12(3), respond without undue delay and generally within **one month**; legally permitted extensions require notice and reasons within that first month. See https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/ and https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/dealing-requests-individuals_en.
- Verify identity proportionately, e.g., via the user's already registered account email; do **not** ask for their password or unnecessary ID documents. Do not respond with another user's data.
- Separate a request to delete a *specific review/recipe* from a request to erase the *entire account*; confirm scope where genuinely ambiguous.

## Before account deletion (operator only)

1. Confirm scope and legal exceptions, including public contributions that must be removed or anonymized. Document decisions rather than promising that all copies vanish instantly.
2. Identify all accounts and private features associated with the verified Supabase Auth user ID: `profiles`, `user_favorites`, `recipe_submissions`, `user_pantry`, `user_shopping_items`, `eatable_user_collections` and collection items, and `eatable_recipe_reviews`. Also inspect whether other tables or later migrations were added. Never share a user's email, UUID, review text or access token in public screenshots.
3. Look up the user's private uploads in `eatable-private-photos` and any associated published copies in `eatable-published-photos`. **Remove storage objects via Supabase Storage API/dashboard first**, using only files confirmed to belong to the request. A path is not a replacement for verified ownership. Check image references and any CDN caches. Supabase documents that Auth-user deletion can fail while they own Storage objects: https://supabase.com/docs/guides/auth/managing-user-data.
4. Check `recipe_submissions` for approved recipes. Published copies in `community_recipes` do **not** have a direct `author_id` FK in the inspected schema. Unpublish/remove or appropriately anonymize matching public records based on the request and applicable law **before deleting the author link**. Check indexed search records and any reviews or favorites linked to the now-unpublished recipe.
5. Record what needs deletion, what can lawfully remain, the precise execution order and how you will verify it. Create a recoverable backup/snapshot if available, without making an unnecessary extra copy of personal data.
6. Only after the dependencies have been handled, remove the account using an administrator-only Supabase Auth method or dashboard. **Never embed a service-role/secret key in public frontend code.** Deletion of Auth alone does not necessarily erase existing valid access JWTs immediately; check session exposure and token expiry.
7. Verify access is disabled and linked rows/storage objects/public references are handled. Inspect account-related email/report messages in Gmail, Resend and other providers separately as applicable. Document backups' normal expiry schedule and any retention exceptions.
8. Respond to the user with the result, what remains and why, and the complaint route when required. Never state 'all data deleted' without verification.

## Other privacy requests

- **Access/export:** collect only the verified user's records from appropriate tools, securely transmit them, and check no other person's data appears.
- **Rectification:** correct inaccurate account data and public content subject to moderation policy.
- **Objection/restriction:** assess the lawful basis and record which processing is affected.
- **Rights requests via report form:** the Report a Problem form is designed for bugs, not as a full authenticated privacy-request workflow. Direct privacy requests to the support address.

## Important gaps before public beta

- No audited one-click account-deletion UI or server-side deletion workflow was found in the inspected source. Until a robust implementation exists, a monitored manual process is necessary.
- The actual Storage owner mapping, trigger behavior and provider logs have not been verified against the live database.
- Test the process with a dedicated expendable test user **only after** documenting the recovery plan, using a controlled environment if possible. Never test erasure on a real user.

This document is a review checklist, not authorization to delete an account or legal advice.
