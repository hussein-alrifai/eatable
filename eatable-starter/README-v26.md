# Eatable v26 — Recipe photography and mobile readability

Site: https://cookwitheatable.com

## What changed

- Broken remote recipe images fall back to Eatable's existing emoji illustrations instead of displaying broken image icons.
- Broken featured hero images fall back to the existing Eatable brand pattern.
- Images include dimensions and asynchronous decoding to improve layout stability.
- Recipe cards have consistent 4:3 image frames, better balanced content, and improved keyboard focus.
- On very narrow screens (up to 460px) recipe cards become one readable column rather than two cramped columns.
- Reduced-motion preferences are respected for card hover effects.

## Installation (minimal patch; no database changes)

1. BACK UP the four corresponding files in GitHub before replacing anything.
2. Add NEW file `src/media-polish.js`.
3. Update `src/app.js`: this is based on the v25 source from this conversation. If you edited it after v25, **merge** rather than overwrite. There are only three changes:
    - Import `installImageFallbacks` from `./media-polish.js`;
    - call `installImageFallbacks(document)` once after `const app=...`;
    - update `foodImage()` and the `heroMedia` image markup with `data-eatable-fallback` attributes.
4. Update `assets/styles.css` by APPENDING just the `Eatable v26` CSS block at the end. The full stylesheet in this ZIP was based on v21. If yours has newer styles, do NOT overwrite them: append the v26 block instead.
5. `eatable-version.txt` is optional.
6. Commit to GitHub, wait for Vercel deployment, then hard-refresh your browser.

## Suggested smoke test

- Homepage `/en` and `/it`: image cards and hero render.
- Explore `/en/recipes` and Lebanese Table `/en/lebanese`: no horizontal scrolling at 390px width.
- Recipe detail: photograph should be visible and correctly cropped.
- In DevTools, temporarily change one recipe image's `src` to `/missing-test-photo.jpg`. It should replace itself with the Eatable illustration.
- Check kitchen, login, admin editor and Report a Problem still work.
- Review the footer policy draft status; this patch does not finalize legal matters.

## Photograph publishing workflow

- Start with 10–15 real priority recipes: homepage featured dishes and popular Lebanese dishes.
- Upload photographs through your existing admin curated-recipe editor, never by making the private bucket public.
- Photograph a real prepared dish or use imagery you hold rights to. Optimize to JPEG/WebP, 1200–1600px long edge, under 5 MB. Add accurate bilingual recipe titles/descriptions.
- A real photo is always preferable. The illustration fallback is not a substitute for completing photography.

## No changes to

Supabase migrations, database policies, account deletion, Resend/Cloudflare, Vercel API routes, v22 legal pages, or v25 SEO metadata.

## Limitations

This is a source-based patch; not an audit of the live Vercel deployment. Image fallback does not fix incorrect Storage permissions or broken URLs, but prevents the visual failure. No real recipe photographs are included. Future personalized admin photo queues are not part of this release.
