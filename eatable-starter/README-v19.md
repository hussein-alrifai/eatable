# Eatable v19.0 — Launch polish (incremental update)

This update is designed for an existing, working Eatable v18. It does **not** change Supabase tables, RLS policies, recipe data, accounts, or recipe submissions.

## What changed

- Removed the public prototype banner, prototype copyright text, outdated community “coming soon” wording, and the obsolete recipe-demo disclaimer.
- Added an English/Italian greeting on the homepage. For signed-in users, the first name comes from Supabase Auth's signup `user_metadata.display_name` (or `full_name`); no names are guessed from email addresses. Guests receive the same time-sensitive greeting without a name.
- Updated the homepage question to “What do you have in mind to cook today?” / “Cosa hai voglia di cucinare oggi?”
- Removed the emoji plate placeholder from the hero. If a published featured recipe has a public photo, the hero uses it; otherwise Eatable displays a polished decorative fallback.
- The featured section now uses available published catalog recipes instead of displaying an empty placeholder when the four original hardcoded entries are missing.
- Added a visible bilingual footer credit linking to the creator's portfolio: **Created & developed by Hussein AlRifai**, `https://husseinalrifai.com`.
- Kept honest food-safety/allergen wording. No review, legal certification, or photo authenticity is implied.

## Installation

This is a **patch**, not a replacement project. Update ONLY the following paths in your existing `eatable` GitHub repository:

- `src/app.js`
- `src/i18n.js`
- `src/launch-personalization.js` (new)
- `assets/styles.css`
- `eatable-version.txt`

1. Keep `src/supabase-config.js` exactly as it is. Never publish your database password, a Supabase secret key, or a `service_role` key.
2. Upload these files to the same paths in GitHub; do **not** create a second containing folder or delete other files.
3. Commit, wait for Vercel Production to show **Ready**, and verify `/eatable-version.txt` displays `Eatable v19.0 — Launch Polish`.
4. Refresh the website (`Ctrl + Shift + R`). Check the homepage while signed in and signed out, at both `/en` and `/it`.
5. Verify ingredient search, favorites, rating submission, My Kitchen, admin pages, and mobile navigation as usual.
6. If there is an error, revert **only the latest frontend commit**. Leave Supabase unchanged.

## Time-based greeting behavior

- 05:00–11:59 local time: Good morning / Buongiorno
- 12:00–17:59: Good afternoon / Buon pomeriggio
- 18:00–04:59: Good evening / Buonasera

The time comes from each visitor's browser. The greeting is refreshed whenever the homepage renders; it does not require any new database query or tracking. Signed-in users who have no saved display name get a generic greeting.

## Custom domain, once you own it

1. In Vercel, go to **Eatable → Settings → Domains**, add the domain and follow the DNS instructions Vercel displays. Use the exact DNS values shown for **your** project; apex domains usually use an A record, `www` usually a CNAME. If you use an external DNS provider, edit records there, not inside Vercel.
2. Decide which hostname should be canonical (for example, `example.com` or `www.example.com`) and configure the redirect from the other hostname within Vercel.
3. Wait until Vercel marks the domain as properly configured and HTTPS is active. Test homepage and deep routes such as `/en/account` and `/it/recipes`.
4. In Supabase, under **Authentication → URL Configuration**, set **Site URL** to the new HTTPS production domain and add exact redirect URLs for `https://YOUR-DOMAIN/en/account` and `https://YOUR-DOMAIN/it/account`. Keep relevant existing Vercel redirects while transitioning.
5. Test email confirmation, password reset, and login from the new domain. Supabase sessions are typically scoped by browser origin, so users may need to log in again when switching from `vercel.app`.
6. Update the domain later in search-engine, social sharing and contact information. Your Supabase **API project URL** does not need to change just because your frontend domain changes.

Docs: https://vercel.com/docs/domains/set-up-custom-domain , https://supabase.com/docs/guides/auth/redirect-urls

## Testing and limitations

- JavaScript module syntax, unit tests for greeting and name escaping, and static page checks are included in the QA run.
- This patch has not been installed on your live Vercel/Supabase project. Verify the actual user profile name and deployed front end after committing.
- Recipe photography remains an editorial task; this update does not generate or license dish photos.
