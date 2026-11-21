# Eatable — Functional Frontend Prototype (Phase 1)

**International cooking, Lebanese roots.** Bilingual English/Italian static prototype with a real ingredient-to-recipe matching engine.

## Included and working

- Responsive homepage, desktop menu and mobile tabs.
- English/Italian switching with language-specific URLs: `/en`, `/it`.
- Ingredient autocomplete in both languages and removable selection chips.
- Search ranking: **Ready to cook**, **Almost there**, **More ideas**; filters by cuisine, diet and time.
- Explore page with search and cuisine filter.
- Dedicated Lebanese Table with Lebanese demo recipes.
- Recipe detail pages with scalable ingredient quantities, ingredient checklist and fullscreen cooking mode.
- Personal cookbook saved in the **current browser only** using localStorage.
- Demonstration community page illustrating future submission/moderation workflow.
- A future Supabase PostgreSQL schema draft, including RLS policy examples (`sql/01_schema.sql`).

## Important limitations

**This is a working prototype, not the completed launch product.** It includes 18 demonstration recipes, not the planned 60–100 curated/verified recipe collection. These examples are for interface testing: they are not professionally tested cooking instructions, dietary/allergen data is incomplete, and icons stand in for licensed photography.

There is **no backend/database connection**, **no cloud synchronization**, **no real login**, **no public recipe submission**, and **no live admin dashboard** in this build. Local favorites and selected ingredients are stored on one browser/device only. If the browser storage is cleared, they disappear.

The app's matching engine counts required ingredient IDs; it does not verify how much of each ingredient a visitor has. Salt, oil and water are *not* assumed to be available. Substitutions and allergens need proper schema/content work before production.

The SQL is a **starting security blueprint**, not a finished migration. Review policies, grants, file storage rules, role assignments and admin workflows before deployment to a production database.

## Run locally

Option A: with Python installed, open a terminal **inside the `eatable-starter` folder**:

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser. **Do not open `index.html` directly** using a `file://` URL because JavaScript modules require a local web server.

Option B: use VS Code's Live Server extension with the root folder open.

## Deploy to Vercel

1. Extract the ZIP and keep its files together in a folder called `eatable-starter`.
2. Add this folder to a GitHub repository. The repository root must contain **`index.html`**, **`vercel.json`**, **`assets/`**, and **`src/`**.
3. In Vercel, choose **Add New → Project → Import Git Repository** and select that repository.
4. **Framework Preset: Other**. No build command is needed for this dependency-free static website. Deploy.
5. Open `/en`, `/it`, and a deep link such as `/en/recipes/hummus` to verify routing.

Alternatively, if you have the Vercel CLI installed and authenticated, run `vercel --prod` inside the extracted folder.

The `vercel.json` rewrite allows the client-side app to handle deep links (per Vercel's SPA routing guidance). This repository does **not** need npm installs or API keys.

## Where to edit

- `src/recipes.js`: recipe and ingredient data, translation, matching algorithm.
- `src/i18n.js`: interface text in English and Italian.
- `src/app.js`: page rendering, navigation, interactions and browser-local storage.
- `assets/styles.css`: colors, components, responsive layout.
- `assets/favicon.svg`: current provisional Eatable logo.
- `sql/01_schema.sql`: future cloud database schema draft.
- `docs/ROADMAP.md`: next development steps.

## Recommended production architecture

At the next milestone, migrate this dependency-free prototype to **Next.js App Router + TypeScript**, **Supabase PostgreSQL / Auth / Storage (with audited RLS)** and **Vercel**. Use `@supabase/ssr` for cookie-aware server-side sessions. Keep recipe and ingredient IDs stable. Build account registration and moderation against the database (not localStorage). A server-rendered architecture will also improve recipe SEO/social sharing.

Reference docs: https://nextjs.org/docs/app/getting-started/installation, https://supabase.com/docs/guides/auth/server-side/creating-a-client, https://vercel.com/docs/routing/rewrites
