-- Eatable v6.0 — curated recipe authoring integrity checks
-- Prerequisite: 04_unified_discovery.sql. Does not delete or replace any recipes.
-- v5 already created the admin RLS policies; this migration tightens validation.
BEGIN;

CREATE OR REPLACE FUNCTION private.eatable_validate_curated_recipe()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  ingredient jsonb;
  instruction jsonb;
  count_found integer;
BEGIN
  IF char_length(btrim(NEW.title_en)) NOT BETWEEN 3 AND 120 OR
     char_length(btrim(NEW.title_it)) NOT BETWEEN 3 AND 120 OR
     char_length(btrim(NEW.description_en)) NOT BETWEEN 10 AND 1200 OR
     char_length(btrim(NEW.description_it)) NOT BETWEEN 10 AND 1200 THEN
    RAISE EXCEPTION 'Both English and Italian titles/descriptions are required (3-120 / 10-1200 chars).';
  END IF;

  IF jsonb_typeof(NEW.ingredients) <> 'array' OR jsonb_array_length(NEW.ingredients) NOT BETWEEN 1 AND 50 OR
     jsonb_typeof(NEW.steps) <> 'array' OR jsonb_array_length(NEW.steps) NOT BETWEEN 1 AND 50 THEN
    RAISE EXCEPTION 'Use between 1 and 50 ingredients and preparation steps.';
  END IF;

  FOR ingredient IN SELECT value FROM jsonb_array_elements(NEW.ingredients)
  LOOP
    IF jsonb_typeof(ingredient) <> 'object' OR
       jsonb_typeof(ingredient->'id') <> 'string' OR
       jsonb_typeof(ingredient->'qty') <> 'number' OR
       jsonb_typeof(ingredient->'unit') <> 'string' THEN
      RAISE EXCEPTION 'Invalid ingredient shape.';
    END IF;
    IF (ingredient->>'qty')::numeric <= 0 OR (ingredient->>'qty')::numeric > 100000 OR
       (ingredient->>'unit') NOT IN ('g','kg','ml','l','pcs','tsp','tbsp') THEN
      RAISE EXCEPTION 'Invalid quantity or unit.';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.eatable_ingredients v WHERE v.id = ingredient->>'id'
    ) THEN
      RAISE EXCEPTION 'Unknown ingredient: %', ingredient->>'id';
    END IF;
  END LOOP;

  SELECT count(*) INTO count_found FROM (
    SELECT DISTINCT value->>'id' AS ingredient_id
    FROM jsonb_array_elements(NEW.ingredients)
  ) ids;
  IF count_found <> jsonb_array_length(NEW.ingredients) THEN
    RAISE EXCEPTION 'Duplicate canonical ingredients must be combined.';
  END IF;

  FOR instruction IN SELECT value FROM jsonb_array_elements(NEW.steps)
  LOOP
    IF jsonb_typeof(instruction) <> 'object' OR
       jsonb_typeof(instruction->'en') <> 'string' OR
       jsonb_typeof(instruction->'it') <> 'string' OR
       char_length(btrim(instruction->>'en')) NOT BETWEEN 1 AND 2000 OR
       char_length(btrim(instruction->>'it')) NOT BETWEEN 1 AND 2000 THEN
      RAISE EXCEPTION 'Each cooking step must have English and Italian text (1-2000 chars).';
    END IF;
  END LOOP;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS eatable_validate_curated_recipe ON public.eatable_curated_recipes;
CREATE TRIGGER eatable_validate_curated_recipe
BEFORE INSERT OR UPDATE ON public.eatable_curated_recipes
FOR EACH ROW EXECUTE FUNCTION private.eatable_validate_curated_recipe();

-- Hardening on v5 table: policy still permits guests to read only published rows
-- and admin users to read drafts and save changes.
ALTER TABLE public.eatable_curated_recipes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.eatable_curated_recipes FROM anon, authenticated;
GRANT SELECT ON public.eatable_curated_recipes TO anon, authenticated;
GRANT INSERT, UPDATE ON public.eatable_curated_recipes TO authenticated;

COMMIT;
