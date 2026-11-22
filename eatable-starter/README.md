# Eatable v3.0 — Community Submissions + Admin Review

This is an **incremental update** for the existing Eatable v2.1 site. It retains your already-working authentication and cloud favorites. In this ZIP, `src/supabase-config.js` is intentionally **not included**: keep the existing configured file in your GitHub repository. Never upload a service-role or secret key.

## Installation order

1. Confirm accounts work on your existing Supabase project. If v2.1 is operational, **do not rerun `sql/01_schema.sql`**.
2. In Supabase > SQL Editor, create a new query with **`sql/02_community.sql`** and execute it **once**. The migration adds two tables (`recipe_submissions`, `community_recipes`), an admin-check function, RLS policies, and a publication trigger. It does not delete your existing users or favorites.
3. Make your **own existing account** an administrator in the Supabase SQL Editor. Use your actual signup email in place of the placeholder:

```sql
update public.profiles
set role = 'admin'
where id in (
  select id from auth.users
  where lower(email) = lower('YOUR-REGISTERED-EMAIL@example.com')
);
```

Verify exactly **one** profile was updated. Do this only in Supabase's privileged SQL editor — never in the website or GitHub. Anyone else should retain the `member` role.
4. Extract this ZIP and upload its **contents**, not an extra outer folder, to your existing GitHub `eatable` repository. Commit changes. **Do not delete or overwrite your configured `src/supabase-config.js`.** GitHub's upload tool should keep that file because it is omitted from this ZIP.
5. After Vercel automatically deploys, visit `https://YOUR-DOMAIN/eatable-version.txt`. Expected: `Eatable v3.0`.
6. Sign in as your admin account. Test `https://YOUR-DOMAIN/en/submit`, `.../en/my-recipes`, and `.../en/admin`. You may need to sign out and back in after your admin role is set.
7. Submit a test recipe with at least two ingredient lines and two cooking steps; check it appears under My Submissions but **not** Community. Approve it under Admin; then check the Community page. Reject it again to test unpublishing. Test a normal non-admin account to ensure it cannot access moderation data.

## Scope

**Working when configured:** authenticated text-only recipe submissions, own submission status, admin-only approval/rejection/change-request workflow, public listing and detail pages of approved community recipes; English/Italian UI; existing Eatable v2.1 search, account, and favorites.

**Not yet included:** photo uploads, users revising existing submissions in place, editing approved recipes, integrating community recipe ingredients into the normalized matching engine, and saving community recipe favorites. The `changes_requested` status lets an admin leave feedback; for now, the contributor can resubmit a corrected recipe as a new submission.

## Important security notes

- Supabase Row Level Security (RLS) is enforced in the **database**, not only in page navigation. Only admins can update moderation status; only approved items appear in the publicly readable table.
- The `profiles.role` field cannot be updated by normal users through the browser. Promote administrators in the privileged SQL Editor.
- Existing authenticated sessions may need to sign out and back in before the UI refreshes the role.
- The front-end code has passed JavaScript syntax checks and isolated browser rendering checks (with mock data); the live Supabase SQL migration and end-to-end authentication/approval flows **must still be tested on your project**.
