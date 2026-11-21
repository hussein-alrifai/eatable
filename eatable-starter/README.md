# Eatable v2.1 — deploy-ready (root-level files)

This ZIP has **no enclosing folder**. Unzip it and upload **all contents** into the same GitHub repository directory from which Vercel currently deploys `index.html`.

## Check the deployment before configuring Supabase

1. In GitHub, ensure `index.html`, `vercel.json`, `eatable-version.txt`, and the folders `src/`, `assets/`, `docs/`, `sql/` are at the repository root (if Vercel Root Directory is `./`). Replace the original files when committing; do not create `eatable-v2/` as a nested subfolder.
2. In Vercel > Deployments, wait for a **new deployment** from the GitHub commit; verify status **Ready**. If needed, open the deployment's logs for errors.
3. Open `https://YOUR-VERCEL-DOMAIN/eatable-version.txt`. It must say "Eatable v2.1". If it does not, the new files are not being served.
4. Open `https://YOUR-VERCEL-DOMAIN/en/account`. You should see an account page. Until you configure Supabase, it displays "Your Supabase connection has not been configured yet" rather than a usable login form.

## Configure Supabase (once you have confirmed deployment)

1. Use `sql/01_schema.sql` in Supabase SQL Editor on a new project (if not already run). **Do not rerun** it after success, since it creates a trigger and tables.
2. Edit `src/supabase-config.js` with only your Project URL (`https://...supabase.co`) and a public publishable key (`sb_publishable_...`). Never expose passwords, secret keys, or `service_role` keys.
3. Set Supabase Auth Site URL to your Vercel origin and allow redirects to `/en/account` and `/it/account`. See `docs/SETUP_SUPABASE.md`.
4. Commit the edited configuration to GitHub and check a fresh Vercel deployment.
5. Reopen `/en/account`, create a test account, confirm email if required, then test saved recipes across two browsers.

## What is included

Bilingual (EN/IT) recipe browsing and search, Lebanese Table, 18 demo recipes, account registration and login via Supabase Auth, password recovery, cloud-saved favorites with RLS, and deployment documentation.

The public recipe catalog, recipe submission, and admin moderation are **not** implemented in v2.1.
