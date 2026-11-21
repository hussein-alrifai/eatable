# Eatable — Phase 2A (Supabase accounts + saved recipes)

**An international ingredient-based recipe platform with a dedicated Lebanese section.** This project remains a dependency-free static site on Vercel, with Supabase used for optional secure account features.

## New in v2

- Email/password registration and sign-in via Supabase Auth.
- Email confirmation redirects and password reset handling.
- Per-user favorites saved in a private Supabase table with Row Level Security.
- Account page in English and Italian.
- Demo mode still works before configuration, using local browser favorites.

## Get started

**Read [`docs/SETUP_SUPABASE.md`](docs/SETUP_SUPABASE.md) and follow all five setup steps in order.**

- Run `sql/01_schema.sql` ONCE in the SQL Editor of a new Eatable Supabase project.
- Put only the **Project URL** and **publishable** key in `src/supabase-config.js`.
- Configure the allowed Auth redirect URLs and Site URL in Supabase.
- Commit these files to GitHub and let Vercel deploy.
- Test registration, login, favorites and logout.

## Existing recipe experience

The 18 demonstration recipes, ingredient-based matching engine, English/Italian interface, Lebanese Table, Explore and cooking mode remain functional. Recipe content is currently local static data in `src/recipes.js`, not cloud data. It is for prototyping, not culinary certification.

## Remaining work

Full public recipe database, translated ingredients, user-submitted recipes, admin moderation, secure recipe/photo storage, shopping lists, and initial 60–100 curated recipes. The future restaurant integration remains separate.

## Local preview

From this folder run `python -m http.server 8000`, then visit `http://localhost:8000/en`. Add local redirect URLs to Supabase Auth settings if you test confirmation/reset locally.

## Security

Never expose a Supabase **secret** or **service_role** key in browser files. RLS protects user data when using the publishable key, but RLS policies must be tested and maintained as new tables are added.
