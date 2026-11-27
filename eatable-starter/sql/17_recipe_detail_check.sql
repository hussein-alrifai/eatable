-- Read only. Counts existing published curated recipes that still need metadata.
SELECT
  count(*) AS published_recipes,
  count(*) FILTER (WHERE prep_time_minutes IS NULL OR cook_time_minutes IS NULL) AS split_times_to_review,
  count(*) FILTER (WHERE kcal_per_serving IS NULL) AS kcal_values_to_review
FROM public.eatable_curated_recipes
WHERE published IS TRUE;

SELECT slug, title_en, prep_minutes AS legacy_total_minutes,
       prep_time_minutes, cook_time_minutes, kcal_per_serving
FROM public.eatable_curated_recipes
WHERE prep_time_minutes IS NULL OR cook_time_minutes IS NULL OR kcal_per_serving IS NULL
ORDER BY title_en
LIMIT 50;
