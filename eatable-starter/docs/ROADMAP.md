# Eatable — Implementation milestones

## Locked product decisions
- International recipe platform with a dedicated Lebanese Table.
- Primary value: cook using ingredients you already have.
- Public recipe browsing without signing in.
- English and Italian at launch; prepare schema/RTL for Arabic later.
- Launch content target 60–100 curated recipes (not yet populated).
- User-submitted recipes require administrator approval before publication.
- Restaurant will be integrated later, independently of recipe data.

## Completed in prototype (Phase 1)
- Public UX and responsive design
- Ingredient matcher with three result bands
- Cuisine, diet and time filters
- English/Italian interface and demo recipes
- Lebanese Table, Explore, Community placeholder, recipe details
- Browser-local cookbook and full-screen cooking mode
- SQL schema proposal with privacy and moderation scaffolding

## Next: cloud data and editorial quality (Phase 2)
1. Create Next.js/TypeScript repo; port components and routing.
2. Create Supabase project; review/repair SQL policies with role-specific integration tests.
3. Implement curated recipe CMS for trusted admin; editor for EN/IT instructions, ingredient units, allergens, image credits.
4. Store uploaded images in secured Storage buckets; moderation and copyright/consent controls.
5. Add Supabase Auth; secure cookie sessions; user profiles, favorites and pantry.
6. Implement draft -> pending -> changes requested -> approved/rejected state machine with admin-only review actions, audit trail and notifications.
7. Populate 60–100 consistently structured recipes. Validate cooking methods and dietary labels.
8. Add server-rendered recipe metadata, structured data, hreflang/canonical pages and sitemap.

## Later (Phase 3)
- Community comments/reviews with moderation; shopping lists; richer pantry quantities; step timers; seasonal Lebanese cultural articles; Arabic RTL.

## Much later (Phase 4)
- Separate restaurant menu and inventory/order systems, with optional curated links from Eatable recipes to menu items.

## Acceptance tests before live launch
- Guest never sees unpublished recipes.
- A member cannot access another person's private drafts, favorites or pantry, even by calling Supabase APIs directly.
- A member cannot become admin by editing the profile.
- A member cannot publish their own recipe by changing HTTP request payloads or database fields.
- Changes to published recipes require re-review.
- English/Italian metadata and URLs are correct; Arabic addition does not require rewriting core tables.
- Ingredient matching handles multilingual synonyms and quantities where entered.
- Content photos have verified rights and allergies are correctly represented.
