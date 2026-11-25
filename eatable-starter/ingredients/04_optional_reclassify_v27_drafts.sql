-- OPTIONAL: only if you already imported original v27 generic-label drafts.
-- Review the mappings before running. This does not modify already published recipes.
-- Does not modify photos or ingredient data.
BEGIN;
UPDATE public.eatable_curated_recipes AS r
SET cuisine = v.cuisine
FROM (VALUES
  ('bulgur-chickpea-stuffed-peppers', 'Syrian', 'Middle Eastern'),
  ('ful-medames-lemon-fava', 'Egyptian', 'Middle Eastern'),
  ('baked-chickpea-herb-patties', 'Palestinian', 'Middle Eastern'),
  ('baharat-roasted-cauliflower', 'Lebanese', 'Middle Eastern'),
  ('shawarma-chicken-traybake', 'Lebanese', 'Middle Eastern'),
  ('couscous-roasted-vegetables', 'Moroccan', 'Middle Eastern'),
  ('thai-inspired-coconut-tofu-curry', 'Thai', 'Other'),
  ('apple-cinnamon-overnight-oats', 'British', 'Other'),
  ('ratatouille-french-vegetables', 'French', 'Other')
) AS v(slug, cuisine, old_cuisine)
WHERE r.slug = v.slug AND r.published = false AND r.cuisine = v.old_cuisine;
COMMIT;
