# Eatable v2 — Supabase setup guide

This update connects the existing static Eatable site to Supabase Auth and a private cloud favorites table. It does **not** yet migrate the public demo recipe catalog or implement recipe submissions/admin moderation.

## 1. Create the database tables and policies

1. Open https://supabase.com/dashboard and select your Eatable project.
2. Go to **SQL Editor → New query**.
3. Open `sql/01_schema.sql` from **this v2 archive** in a text editor, copy all contents, paste, and click **Run**.
4. Under **Database → Tables** verify `public.profiles` and `public.user_favorites` exist.
5. Under each table, confirm **Row Level Security** is enabled.

Run this file once on a new/empty Eatable Supabase project. It intentionally replaces the unfinished schema draft included with v1; **do not run that older draft**.

## 2. Add the two PUBLIC Supabase connection values

In Supabase open the **Connect** dialog or **Project Settings → API Keys**.

- Find the **Project URL**, in the format `https://your-project.supabase.co`.
- Find the **Publishable key**, beginning `sb_publishable_`.

Edit `src/supabase-config.js` in your GitHub repository and replace **both** placeholders:

```javascript
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_YOUR_PUBLIC_KEY';
```

The two values above are public client-side configuration, not secrets. Never put your database password, **secret key**, or **legacy service_role** key into JavaScript that loads in the browser, or paste them in a chat.

## 3. Configure email confirmation redirects

In Supabase go to **Authentication → URL Configuration**.

- **Site URL:** your production Vercel URL, for example `https://eatable-example.vercel.app` (replace with your actual URL).
- **Redirect URLs:** add both actual paths:
  - `https://YOUR-DOMAIN/en/account`
  - `https://YOUR-DOMAIN/it/account`

If you have a custom domain, also add its corresponding two account paths, and configure the Site URL appropriately. For local development, add `http://localhost:8000/en/account` and `http://localhost:8000/it/account` only if you are testing locally.

In **Authentication → Providers → Email**, keep email/password enabled. Confirm email verification is configured as desired. The app will tell users to check their inbox after registration; Supabase's authentication settings determine whether verification is required.

## 4. Update GitHub, then Vercel

1. Replace your repository files with the updated v2 files; especially `src/app.js`, `src/cloud.js`, `src/supabase-config.js`, `assets/styles.css`, and `sql/01_schema.sql`.
2. Preserve `index.html`, `src/i18n.js`, `src/recipes.js`, `assets/favicon.svg`, and `vercel.json` from this archive.
3. Commit changes to your GitHub repository.
4. If Vercel is connected to GitHub, Vercel should deploy the new commit automatically. Open the newest production deployment.

**Do not upload the ZIP itself** as the source tree. Extract it first, then upload the contents of the `eatable-v2` folder to the directory Vercel uses as the Root Directory.

## 5. Test the user flow

1. Open your Eatable site and click **Sign in**.
2. Select **Create account**, enter a display name, email and password, then submit.
3. If email confirmation is required, open the confirmation email and click the link.
4. Sign in. Open a recipe, select **Save**, then open **My Cookbook**.
5. Sign out; sign in again and check the same recipe remains saved.
6. Open the site on another device, sign in with the same account, and verify the favorite appears there too.
7. Try password reset through the **Forgot password?** link.

## 6. If something goes wrong

- **'Supabase connection not configured':** update `src/supabase-config.js` and redeploy; do not use the secret key.
- **'Could not connect':** check exact URL and publishable key. Confirm project is active and browser has network access.
- **'relation user_favorites does not exist':** SQL was not applied to the same Supabase project.
- **'new row violates row-level security policy':** sign in, check the SQL policies and project; never disable RLS to workaround a bug.
- **Registration email links go to localhost:** set Site URL and redirect URLs as described above.
- **No verification email:** inspect Supabase Auth email settings / email delivery limits. For public launch, configure a production SMTP provider; default email delivery is limited.

## Scope and security

- Login, logout, registration, password reset, and per-account favorites are implemented.
- Visitors can still search and read the **18 demo recipes** without accounts.
- Ingredient selection remains browser-local.
- Favorites are stored by recipe slug for the demo collection; once the permanent recipes database is implemented, migrate to recipe UUID foreign keys.
- Submission workflows, admin dashboard, photo uploads, verified recipes, and production security tests are **future work**. Don't open this to the general public as a completed platform yet.
- The database uses RLS and limited grants so authenticated users cannot see or change another user's favorites, and cannot assign themselves the admin role. Review and test policies before a large public release.

Official references:
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/passwords
