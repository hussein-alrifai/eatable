# Eatable — Prototype QA results (2026-11-21)

## Static checks
- JavaScript syntax check: `node --check` passed for all three source modules.
- Data integrity: 18 demonstration recipes, 51 canonical ingredients, no missing EN/IT recipe names or instructions.
- Ingredient search test: Italian 'ceci' resolves to canonical chickpeas; selecting all hummus ingredients returns no missing ingredients.

## Browser interaction checks
Browser rendering was validated by inlining the prototype's HTML, CSS, and JavaScript in a local headless Chromium test environment (direct localhost navigation was blocked by the execution environment).
- Homepage renders without JavaScript exceptions.
- Ingredient autocomplete displays suggestions; selection adds removable chips.
- Recipe details render; Start Cooking opens a fullscreen overlay; next-step works.
- Cook screen renders groups; diet filters update results.
- Mobile bottom tabs render at 390 px viewport; no horizontal overflow.
- No browser-side uncaught exceptions were observed in the tested flows.

## Not tested in this environment
- Actual Vercel deployment or cloud account provisioning.
- Real database/Supabase migrations or row-level policy audits.
- End-to-end deep-link navigation in a deployed environment (Vercel routing is configured but should be verified after deployment).
- Browser compatibility matrix across physical iOS/Android devices.
- Professional verification of recipe directions, allergens and ingredient units.

Screenshots were generated in the working environment separately from the ZIP.
