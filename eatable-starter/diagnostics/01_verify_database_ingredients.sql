-- READ ONLY: run in the SAME Supabase project configured for Eatable.
-- If a required ingredient is absent, first apply the v30.2 repair SQL.
SELECT COUNT(*) AS total_ingredients
FROM public.eatable_ingredients;

SELECT id, name_en,
 CASE WHEN id IS NULL THEN 'MISSING' ELSE 'PRESENT' END AS status
FROM public.eatable_ingredients
WHERE id IN ('turmeric','vegetable_oil','walnuts','saffron',
'spinach','tomato_paste','yellow_split_peas','sugar')
ORDER BY id;

-- One row per missing sample ID (expected: ZERO rows)
WITH required(id) AS (VALUES
 ('turmeric'),('vegetable_oil'),('walnuts'),('saffron'),
 ('spinach'),('tomato_paste'),('yellow_split_peas'),('sugar'))
SELECT required.id AS missing_id
FROM required LEFT JOIN public.eatable_ingredients i ON i.id=required.id
WHERE i.id IS NULL
ORDER BY required.id;
