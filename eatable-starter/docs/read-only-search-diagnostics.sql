-- Read-only diagnostics: published catalog and draft counts
SELECT COUNT(*) AS total_curated, COUNT(*) FILTER (WHERE published) AS published_curated, COUNT(*) FILTER (WHERE NOT published) AS draft_curated FROM public.eatable_curated_recipes;

-- Most frequently used ingredient IDs across PUBLISHED recipes:
SELECT item ->> 'id' AS ingredient_id, COUNT(DISTINCT r.slug) AS published_recipe_count
FROM public.eatable_curated_recipes r
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(r.ingredients::jsonb, '[]'::jsonb)) AS item
WHERE r.published = true
  AND item ->> 'id' IS NOT NULL
GROUP BY item ->> 'id'
ORDER BY published_recipe_count DESC, ingredient_id
LIMIT 100;
