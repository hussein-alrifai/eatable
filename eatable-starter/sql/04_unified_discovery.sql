-- Eatable v5.0: unified discovery and reviewable ingredient indexing
-- Run ONCE after v4 migration 03_photos_revisions.sql.
-- Preserves all v4 users, favorites, submissions and published community recipes.
-- This migration DOES NOT update or remove prior content.
BEGIN;

-- Searchable, translated ingredient vocabulary shared by curated and community recipes.
CREATE TABLE IF NOT EXISTS public.eatable_ingredients (
  id text PRIMARY KEY CHECK (id ~ '^[a-z][a-z0-9_]{0,63}$'),
  name_en text NOT NULL,
  name_it text NOT NULL
);
REVOKE ALL ON public.eatable_ingredients FROM anon, authenticated;
GRANT SELECT ON public.eatable_ingredients TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.eatable_ingredients TO authenticated;
ALTER TABLE public.eatable_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read ingredient vocabulary" ON public.eatable_ingredients
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manages ingredient vocabulary" ON public.eatable_ingredients
  FOR ALL TO authenticated USING ((SELECT public.eatable_is_admin()))
  WITH CHECK ((SELECT public.eatable_is_admin()));

-- Curated recipes move into the same Supabase project as community content.
CREATE TABLE IF NOT EXISTS public.eatable_curated_recipes (
  slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_en text NOT NULL CHECK (length(trim(title_en)) BETWEEN 3 AND 120),
  title_it text NOT NULL,
  description_en text NOT NULL,
  description_it text NOT NULL,
  cuisine text NOT NULL,
  category text NOT NULL,
  diet text NOT NULL DEFAULT 'unknown' CHECK (diet IN ('vegan','vegetarian','none','unknown')),
  prep_minutes integer NOT NULL CHECK (prep_minutes BETWEEN 1 AND 720),
  servings integer NOT NULL DEFAULT 4 CHECK (servings BETWEEN 1 AND 30),
  ingredients jsonb NOT NULL CHECK (jsonb_typeof(ingredients) = 'array' AND jsonb_array_length(ingredients) BETWEEN 1 AND 50),
  steps jsonb NOT NULL CHECK (jsonb_typeof(steps) = 'array' AND jsonb_array_length(steps) BETWEEN 1 AND 50),
  emoji text NOT NULL DEFAULT '🍲',
  theme text NOT NULL DEFAULT 'cream',
  published boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.eatable_curated_recipes FROM anon, authenticated;
GRANT SELECT ON public.eatable_curated_recipes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.eatable_curated_recipes TO authenticated;
ALTER TABLE public.eatable_curated_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read published curated recipes" ON public.eatable_curated_recipes
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admin reads all curated recipes" ON public.eatable_curated_recipes
  FOR SELECT TO authenticated USING ((SELECT public.eatable_is_admin()));
CREATE POLICY "Admin edits curated recipes" ON public.eatable_curated_recipes
  FOR ALL TO authenticated USING ((SELECT public.eatable_is_admin()))
  WITH CHECK ((SELECT public.eatable_is_admin()));

-- Public metadata assigned by an administrator. Free-text submission ingredients
-- aren't automatically accepted as canonical matches because that is error prone.
CREATE TABLE IF NOT EXISTS public.eatable_community_index (
  community_id uuid PRIMARY KEY REFERENCES public.community_recipes(id) ON DELETE CASCADE,
  cuisine text NOT NULL DEFAULT 'Other',
  diet text NOT NULL DEFAULT 'unknown' CHECK (diet IN ('vegan','vegetarian','none','unknown')),
  ingredient_ids text[] NOT NULL DEFAULT ARRAY[]::text[],
  indexed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  indexed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT eatable_community_index_limit CHECK (cardinality(ingredient_ids) BETWEEN 2 AND 50)
);
REVOKE ALL ON public.eatable_community_index FROM anon, authenticated;
GRANT SELECT ON public.eatable_community_index TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.eatable_community_index TO authenticated;
ALTER TABLE public.eatable_community_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read approved community search metadata" ON public.eatable_community_index
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admin edits community search metadata" ON public.eatable_community_index
  FOR ALL TO authenticated USING ((SELECT public.eatable_is_admin()))
  WITH CHECK ((SELECT public.eatable_is_admin()));

-- Admin-only mapping must refer to known ingredient IDs. No security-definer RPC
-- is exposed: this invoker trigger validates each administrator-supplied ID.
CREATE OR REPLACE FUNCTION private.eatable_check_community_ingredients()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  -- One reviewed canonical ingredient for each required ingredient line.
  IF cardinality(NEW.ingredient_ids) IS DISTINCT FROM
     (SELECT jsonb_array_length(r.ingredients)
        FROM public.community_recipes AS r WHERE r.id = NEW.community_id) THEN
    RAISE EXCEPTION 'Map every ingredient line before enabling search';
  END IF;
  IF EXISTS (
    SELECT 1 FROM unnest(NEW.ingredient_ids) AS x(id)
    WHERE NOT EXISTS (SELECT 1 FROM public.eatable_ingredients AS i WHERE i.id = x.id)
  ) THEN
    RAISE EXCEPTION 'Unknown canonical ingredient in index';
  END IF;
  NEW.indexed_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER eatable_check_community_index
BEFORE INSERT OR UPDATE ON public.eatable_community_index
FOR EACH ROW EXECUTE FUNCTION private.eatable_check_community_ingredients();

-- Seed the original 18 demo recipes without overwriting later admin edits.
INSERT INTO public.eatable_ingredients (id,name_en,name_it) VALUES
  ('chicken', 'Chicken', 'Pollo'),
  ('rice', 'Rice', 'Riso'),
  ('tomato', 'Tomato', 'Pomodoro'),
  ('onion', 'Onion', 'Cipolla'),
  ('potato', 'Potato', 'Patata'),
  ('garlic', 'Garlic', 'Aglio'),
  ('olive_oil', 'Olive oil', 'Olio d’oliva'),
  ('lemon', 'Lemon', 'Limone'),
  ('chickpeas', 'Chickpeas', 'Ceci'),
  ('tahini', 'Tahini', 'Tahina'),
  ('salt', 'Salt', 'Sale'),
  ('pita', 'Pita bread', 'Pane pita'),
  ('yogurt', 'Plain yogurt', 'Yogurt bianco'),
  ('cucumber', 'Cucumber', 'Cetriolo'),
  ('lettuce', 'Lettuce', 'Lattuga'),
  ('sumac', 'Sumac', 'Sommacco'),
  ('mint', 'Mint', 'Menta'),
  ('parsley', 'Parsley', 'Prezzemolo'),
  ('bulgur', 'Bulgur', 'Bulgur'),
  ('lentils', 'Lentils', 'Lenticchie'),
  ('carrot', 'Carrot', 'Carota'),
  ('cumin', 'Cumin', 'Cumino'),
  ('paprika', 'Paprika', 'Paprica'),
  ('chili', 'Chili pepper', 'Peperoncino'),
  ('cilantro', 'Cilantro / coriander leaves', 'Coriandolo fresco'),
  ('flour', 'Flour', 'Farina'),
  ('zaatar', 'Za’atar', 'Za’atar'),
  ('yeast', 'Yeast', 'Lievito'),
  ('water', 'Water', 'Acqua'),
  ('pine_nuts', 'Pine nuts', 'Pinoli'),
  ('pasta', 'Pasta', 'Pasta'),
  ('basil', 'Basil', 'Basilico'),
  ('mushrooms', 'Mushrooms', 'Funghi'),
  ('broth', 'Vegetable broth', 'Brodo vegetale'),
  ('parmesan', 'Parmesan', 'Parmigiano'),
  ('butter', 'Butter', 'Burro'),
  ('eggs', 'Eggs', 'Uova'),
  ('pepper', 'Bell pepper', 'Peperone'),
  ('coconut_milk', 'Coconut milk', 'Latte di cocco'),
  ('curry', 'Curry powder', 'Curry in polvere'),
  ('peas', 'Peas', 'Piselli'),
  ('soy_sauce', 'Soy sauce', 'Salsa di soia'),
  ('avocado', 'Avocado', 'Avocado'),
  ('lime', 'Lime', 'Lime'),
  ('feta', 'Feta', 'Feta'),
  ('olives', 'Olives', 'Olive'),
  ('tortilla', 'Tortillas', 'Tortillas'),
  ('tofu', 'Tofu', 'Tofu'),
  ('miso', 'Miso paste', 'Pasta di miso'),
  ('seaweed', 'Wakame seaweed', 'Alga wakame'),
  ('spring_onion', 'Spring onion', 'Cipollotto')
ON CONFLICT(id) DO NOTHING;
INSERT INTO public.eatable_curated_recipes (slug, title_en, title_it, description_en, description_it, cuisine, category, diet, prep_minutes, servings, ingredients, steps, emoji, theme) VALUES
  ('hummus', 'Classic hummus', 'Hummus classico', 'Silky chickpeas blended with tahini, lemon and garlic.', 'Ceci cremosi frullati con tahina, limone e aglio.', 'Lebanese', 'Mezze', 'vegan', 15, 4, '[{"id":"chickpeas","qty":400,"unit":"g"},{"id":"tahini","qty":60,"unit":"g"},{"id":"lemon","qty":1,"unit":"pcs"},{"id":"garlic","qty":1,"unit":"pcs"},{"id":"olive_oil","qty":25,"unit":"ml"},{"id":"salt","qty":1,"unit":"tsp"},{"id":"water","qty":50,"unit":"ml"}]'::jsonb, '[{"en":"Drain the chickpeas, reserving a little liquid.","it":"Scola i ceci e conserva un po’ di liquido."},{"en":"Blend chickpeas, tahini, lemon juice and garlic until smooth. Add water gradually.","it":"Frulla ceci, tahina, succo di limone e aglio fino a ottenere una crema. Aggiungi acqua gradualmente."},{"en":"Season, spread in a bowl and finish with olive oil.","it":"Regola di sale, distribuisci in una ciotola e completa con olio d’oliva."}]'::jsonb, '🫘', 'ochre'),
  ('fattoush', 'Fattoush salad', 'Insalata fattoush', 'Fresh vegetables, bright lemon and crispy pita.', 'Verdure fresche, limone e pita croccante.', 'Lebanese', 'Salad', 'vegan', 20, 4, '[{"id":"tomato","qty":3,"unit":"pcs"},{"id":"cucumber","qty":1,"unit":"pcs"},{"id":"lettuce","qty":1,"unit":"pcs"},{"id":"pita","qty":2,"unit":"pcs"},{"id":"lemon","qty":1,"unit":"pcs"},{"id":"olive_oil","qty":40,"unit":"ml"},{"id":"sumac","qty":2,"unit":"tsp"},{"id":"mint","qty":10,"unit":"g"}]'::jsonb, '[{"en":"Wash and chop the vegetables into bite-sized pieces.","it":"Lava e taglia le verdure a bocconcini."},{"en":"Toast pieces of pita bread until crisp.","it":"Tosta il pane pita a pezzetti finché diventa croccante."},{"en":"Toss the vegetables with lemon, oil, sumac and mint. Add pita immediately before serving.","it":"Condisci le verdure con limone, olio, sommacco e menta. Aggiungi la pita poco prima di servire."}]'::jsonb, '🥗', 'green'),
  ('batata-harra', 'Batata harra', 'Batata harra', 'Spiced potatoes with garlic, herbs and lemon.', 'Patate speziate con aglio, erbe aromatiche e limone.', 'Lebanese', 'Mezze', 'vegan', 40, 4, '[{"id":"potato","qty":700,"unit":"g"},{"id":"garlic","qty":3,"unit":"pcs"},{"id":"cilantro","qty":20,"unit":"g"},{"id":"chili","qty":1,"unit":"pcs"},{"id":"lemon","qty":1,"unit":"pcs"},{"id":"olive_oil","qty":45,"unit":"ml"},{"id":"salt","qty":1,"unit":"tsp"}]'::jsonb, '[{"en":"Cut the potatoes into cubes and roast or pan-fry until tender and golden.","it":"Taglia le patate a cubetti e cuocile in forno o in padella fino a doratura."},{"en":"Warm garlic and chili briefly in olive oil, without burning them.","it":"Scalda brevemente aglio e peperoncino nell’olio, senza bruciarli."},{"en":"Toss with potatoes, coriander leaves and lemon juice. Serve warm.","it":"Mescola con patate, coriandolo fresco e succo di limone. Servi caldo."}]'::jsonb, '🥔', 'spice'),
  ('tabbouleh', 'Tabbouleh', 'Tabbouleh', 'A bright parsley salad with tomato, mint and a little bulgur.', 'Insalata fresca di prezzemolo, pomodoro, menta e poco bulgur.', 'Lebanese', 'Salad', 'vegan', 25, 4, '[{"id":"parsley","qty":160,"unit":"g"},{"id":"tomato","qty":3,"unit":"pcs"},{"id":"mint","qty":15,"unit":"g"},{"id":"bulgur","qty":50,"unit":"g"},{"id":"lemon","qty":2,"unit":"pcs"},{"id":"olive_oil","qty":50,"unit":"ml"},{"id":"salt","qty":1,"unit":"tsp"}]'::jsonb, '[{"en":"Prepare the bulgur according to its package instructions and cool.","it":"Prepara il bulgur seguendo la confezione e lascialo raffreddare."},{"en":"Finely chop parsley, mint and tomatoes.","it":"Trita finemente prezzemolo, menta e pomodori."},{"en":"Combine all ingredients and dress with lemon, olive oil and salt.","it":"Mescola tutti gli ingredienti e condisci con limone, olio e sale."}]'::jsonb, '🌿', 'green'),
  ('lentil-soup', 'Lebanese lentil soup', 'Zuppa di lenticchie libanese', 'Comforting lentils simmered with vegetables and cumin.', 'Lenticchie confortanti cotte con verdure e cumino.', 'Lebanese', 'Soup', 'vegan', 45, 4, '[{"id":"lentils","qty":250,"unit":"g"},{"id":"onion","qty":1,"unit":"pcs"},{"id":"carrot","qty":2,"unit":"pcs"},{"id":"cumin","qty":1,"unit":"tsp"},{"id":"olive_oil","qty":30,"unit":"ml"},{"id":"lemon","qty":1,"unit":"pcs"},{"id":"water","qty":1100,"unit":"ml"}]'::jsonb, '[{"en":"Chop onion and carrot; soften them in olive oil.","it":"Trita cipolla e carote e falle appassire nell’olio."},{"en":"Add rinsed lentils, cumin and water; simmer until tender.","it":"Aggiungi lenticchie sciacquate, cumino e acqua; cuoci finché sono morbide."},{"en":"Blend partially if desired and finish with lemon juice.","it":"Frulla parzialmente a piacere e completa con succo di limone."}]'::jsonb, '🍲', 'ochre'),
  ('chicken-shawarma', 'Chicken shawarma bowls', 'Bowl di shawarma di pollo', 'Warm, spiced chicken with lemon and garlic.', 'Pollo speziato e profumato con limone e aglio.', 'Lebanese', 'Main', 'none', 50, 4, '[{"id":"chicken","qty":600,"unit":"g"},{"id":"yogurt","qty":120,"unit":"g"},{"id":"lemon","qty":1,"unit":"pcs"},{"id":"garlic","qty":3,"unit":"pcs"},{"id":"cumin","qty":1,"unit":"tsp"},{"id":"paprika","qty":1,"unit":"tsp"},{"id":"pita","qty":4,"unit":"pcs"},{"id":"olive_oil","qty":25,"unit":"ml"}]'::jsonb, '[{"en":"Slice chicken and mix with yogurt, lemon, garlic and spices. Marinate chilled.","it":"Taglia il pollo e mescola con yogurt, limone, aglio e spezie. Lascia marinare in frigorifero."},{"en":"Cook chicken thoroughly in a hot pan or oven until safe to eat.","it":"Cuoci completamente il pollo in padella o in forno fino a temperatura sicura."},{"en":"Serve with warmed pita and your choice of vegetables.","it":"Servi con pita calda e verdure a scelta."}]'::jsonb, '🍗', 'spice'),
  ('manakish-zaatar', 'Za’atar manakish', 'Manakish allo za’atar', 'Soft flatbread topped with fragrant za’atar.', 'Focaccia morbida con za’atar profumato.', 'Lebanese', 'Bread', 'vegan', 90, 4, '[{"id":"flour","qty":400,"unit":"g"},{"id":"zaatar","qty":60,"unit":"g"},{"id":"olive_oil","qty":80,"unit":"ml"},{"id":"yeast","qty":7,"unit":"g"},{"id":"water","qty":250,"unit":"ml"},{"id":"salt","qty":1,"unit":"tsp"}]'::jsonb, '[{"en":"Mix flour, yeast, water and salt; knead to a soft dough. Let it rise.","it":"Mescola farina, lievito, acqua e sale; impasta fino a ottenere un composto morbido. Lascia lievitare."},{"en":"Divide, flatten and top with a mixture of za’atar and olive oil.","it":"Dividi l’impasto, stendilo e condisci con za’atar e olio."},{"en":"Bake in a preheated hot oven until cooked and lightly golden.","it":"Cuoci nel forno caldo preriscaldato fino a leggera doratura."}]'::jsonb, '🫓', 'gold'),
  ('fattet-hummus', 'Fattet hummus', 'Fattet hummus', 'Layers of crisp pita, warm chickpeas and tahini yogurt sauce.', 'Strati di pita croccante, ceci caldi e salsa di yogurt alla tahina.', 'Lebanese', 'Mezze', 'vegetarian', 35, 4, '[{"id":"chickpeas","qty":400,"unit":"g"},{"id":"pita","qty":3,"unit":"pcs"},{"id":"yogurt","qty":350,"unit":"g"},{"id":"tahini","qty":50,"unit":"g"},{"id":"garlic","qty":2,"unit":"pcs"},{"id":"lemon","qty":1,"unit":"pcs"},{"id":"pine_nuts","qty":25,"unit":"g"}]'::jsonb, '[{"en":"Warm the chickpeas and toast pita pieces until crisp.","it":"Scalda i ceci e tosta la pita a pezzetti finché è croccante."},{"en":"Whisk yogurt, tahini, crushed garlic and lemon juice.","it":"Mescola yogurt, tahina, aglio schiacciato e succo di limone."},{"en":"Layer pita, chickpeas and sauce. Top with toasted pine nuts and serve immediately.","it":"Disponi a strati pita, ceci e salsa. Completa con pinoli tostati e servi subito."}]'::jsonb, '🥣', 'cream'),
  ('pasta-pomodoro', 'Pasta al pomodoro', 'Pasta al pomodoro', 'A simple tomato and basil sauce for everyday pasta.', 'Un sugo semplice di pomodoro e basilico per la pasta di tutti i giorni.', 'Italian', 'Main', 'vegan', 25, 4, '[{"id":"pasta","qty":320,"unit":"g"},{"id":"tomato","qty":500,"unit":"g"},{"id":"garlic","qty":2,"unit":"pcs"},{"id":"basil","qty":15,"unit":"g"},{"id":"olive_oil","qty":35,"unit":"ml"},{"id":"salt","qty":1,"unit":"tsp"}]'::jsonb, '[{"en":"Cook pasta in salted water according to the package.","it":"Cuoci la pasta in acqua salata seguendo la confezione."},{"en":"Gently cook garlic in olive oil; add tomatoes and simmer.","it":"Scalda l’aglio nell’olio; aggiungi i pomodori e fai sobbollire."},{"en":"Combine pasta with the sauce and finish with basil.","it":"Unisci pasta e salsa e completa con basilico."}]'::jsonb, '🍝', 'tomato'),
  ('mushroom-risotto', 'Mushroom risotto', 'Risotto ai funghi', 'Creamy rice with mushrooms and parmesan.', 'Riso cremoso con funghi e parmigiano.', 'Italian', 'Main', 'vegetarian', 45, 4, '[{"id":"rice","qty":320,"unit":"g"},{"id":"mushrooms","qty":300,"unit":"g"},{"id":"onion","qty":1,"unit":"pcs"},{"id":"broth","qty":1100,"unit":"ml"},{"id":"parmesan","qty":60,"unit":"g"},{"id":"butter","qty":40,"unit":"g"}]'::jsonb, '[{"en":"Cook sliced mushrooms and onion until softened.","it":"Cuoci funghi a fette e cipolla finché diventano morbidi."},{"en":"Add rice and gradually stir in warm broth until the rice is cooked.","it":"Aggiungi il riso e incorpora gradualmente il brodo caldo, mescolando fino a cottura."},{"en":"Remove from heat and stir in butter and parmesan.","it":"Togli dal fuoco e manteca con burro e parmigiano."}]'::jsonb, '🍚', 'cream'),
  ('shakshuka', 'Shakshuka', 'Shakshuka', 'Eggs gently cooked in fragrant tomato and pepper sauce.', 'Uova cotte lentamente in salsa profumata di pomodoro e peperoni.', 'Middle Eastern', 'Breakfast', 'vegetarian', 35, 4, '[{"id":"eggs","qty":4,"unit":"pcs"},{"id":"tomato","qty":500,"unit":"g"},{"id":"onion","qty":1,"unit":"pcs"},{"id":"pepper","qty":1,"unit":"pcs"},{"id":"cumin","qty":1,"unit":"tsp"},{"id":"olive_oil","qty":30,"unit":"ml"}]'::jsonb, '[{"en":"Cook onion and pepper in olive oil until soft.","it":"Cuoci cipolla e peperone nell’olio finché sono morbidi."},{"en":"Add tomato and cumin; simmer until thickened.","it":"Aggiungi pomodoro e cumino; fai sobbollire fino ad addensare."},{"en":"Make wells, add eggs and cover until eggs reach your preferred safe doneness.","it":"Crea degli incavi, aggiungi le uova e copri fino al grado di cottura desiderato e sicuro."}]'::jsonb, '🍳', 'tomato'),
  ('chickpea-curry', 'Chickpea coconut curry', 'Curry di ceci e cocco', 'A warming curry with chickpeas, tomato and coconut milk.', 'Un curry avvolgente con ceci, pomodoro e latte di cocco.', 'Indian', 'Main', 'vegan', 35, 4, '[{"id":"chickpeas","qty":450,"unit":"g"},{"id":"coconut_milk","qty":400,"unit":"ml"},{"id":"curry","qty":2,"unit":"tsp"},{"id":"onion","qty":1,"unit":"pcs"},{"id":"tomato","qty":300,"unit":"g"},{"id":"rice","qty":280,"unit":"g"}]'::jsonb, '[{"en":"Cook onion with curry powder until fragrant.","it":"Cuoci la cipolla con il curry fino a sprigionare il profumo."},{"en":"Add tomato, chickpeas and coconut milk; simmer gently.","it":"Aggiungi pomodoro, ceci e latte di cocco; cuoci a fuoco dolce."},{"en":"Cook rice separately and serve with the curry.","it":"Cuoci il riso a parte e servi con il curry."}]'::jsonb, '🍛', 'gold'),
  ('fried-rice', 'Vegetable fried rice', 'Riso saltato con verdure', 'A quick pan of rice, vegetables, egg and soy sauce.', 'Riso veloce saltato con verdure, uovo e salsa di soia.', 'Japanese', 'Main', 'vegetarian', 25, 4, '[{"id":"rice","qty":320,"unit":"g"},{"id":"eggs","qty":2,"unit":"pcs"},{"id":"carrot","qty":2,"unit":"pcs"},{"id":"peas","qty":130,"unit":"g"},{"id":"soy_sauce","qty":35,"unit":"ml"},{"id":"onion","qty":1,"unit":"pcs"}]'::jsonb, '[{"en":"Use safely cooled, refrigerated cooked rice; cook onion and carrot in a hot pan.","it":"Usa riso già cotto e raffreddato correttamente in frigorifero; salta cipolla e carota in padella."},{"en":"Add peas and rice, stirring until thoroughly heated.","it":"Aggiungi piselli e riso, mescolando finché tutto è ben caldo."},{"en":"Scramble eggs separately or in the pan, then add soy sauce and mix.","it":"Cuoci le uova strapazzate a parte o in padella, poi aggiungi la salsa di soia e mescola."}]'::jsonb, '🍚', 'green'),
  ('guacamole', 'Guacamole', 'Guacamole', 'Creamy avocado with lime and fresh herbs.', 'Avocado cremoso con lime ed erbe fresche.', 'Mexican', 'Mezze', 'vegan', 15, 4, '[{"id":"avocado","qty":3,"unit":"pcs"},{"id":"lime","qty":2,"unit":"pcs"},{"id":"onion","qty":1,"unit":"pcs"},{"id":"tomato","qty":1,"unit":"pcs"},{"id":"cilantro","qty":15,"unit":"g"},{"id":"salt","qty":1,"unit":"tsp"}]'::jsonb, '[{"en":"Mash ripe avocado with lime juice.","it":"Schiaccia gli avocado maturi con succo di lime."},{"en":"Finely chop onion, tomato and coriander leaves.","it":"Trita finemente cipolla, pomodoro e coriandolo fresco."},{"en":"Mix together, season and serve promptly.","it":"Mescola tutto, regola di sale e servi subito."}]'::jsonb, '🥑', 'green'),
  ('greek-salad', 'Greek salad', 'Insalata greca', 'Crunchy vegetables with feta, olives and olive oil.', 'Verdure croccanti con feta, olive e olio d’oliva.', 'Greek', 'Salad', 'vegetarian', 15, 4, '[{"id":"tomato","qty":3,"unit":"pcs"},{"id":"cucumber","qty":1,"unit":"pcs"},{"id":"feta","qty":180,"unit":"g"},{"id":"olives","qty":100,"unit":"g"},{"id":"onion","qty":1,"unit":"pcs"},{"id":"olive_oil","qty":40,"unit":"ml"}]'::jsonb, '[{"en":"Cut tomatoes, cucumber and onion.","it":"Taglia pomodori, cetriolo e cipolla."},{"en":"Arrange in a bowl with feta and olives.","it":"Disponi in una ciotola con feta e olive."},{"en":"Dress with olive oil and serve.","it":"Condisci con olio e servi."}]'::jsonb, '🥗', 'green'),
  ('chicken-fajitas', 'Chicken fajitas', 'Fajitas di pollo', 'Sizzling chicken and peppers served with tortillas.', 'Pollo e peperoni saltati, serviti con tortillas.', 'Mexican', 'Main', 'none', 35, 4, '[{"id":"chicken","qty":500,"unit":"g"},{"id":"pepper","qty":2,"unit":"pcs"},{"id":"onion","qty":1,"unit":"pcs"},{"id":"tortilla","qty":8,"unit":"pcs"},{"id":"lime","qty":1,"unit":"pcs"},{"id":"cumin","qty":1,"unit":"tsp"},{"id":"olive_oil","qty":30,"unit":"ml"}]'::jsonb, '[{"en":"Slice chicken, peppers and onion into strips.","it":"Taglia pollo, peperoni e cipolla a striscioline."},{"en":"Cook chicken thoroughly, then add vegetables and cumin.","it":"Cuoci completamente il pollo, poi aggiungi verdure e cumino."},{"en":"Serve hot in warm tortillas with lime.","it":"Servi nelle tortillas calde con lime."}]'::jsonb, '🌮', 'spice'),
  ('miso-soup', 'Simple miso soup', 'Zuppa di miso semplice', 'Light broth with tofu, miso and wakame.', 'Brodo leggero con tofu, miso e wakame.', 'Japanese', 'Soup', 'vegan', 20, 4, '[{"id":"tofu","qty":250,"unit":"g"},{"id":"miso","qty":70,"unit":"g"},{"id":"seaweed","qty":10,"unit":"g"},{"id":"water","qty":1000,"unit":"ml"},{"id":"spring_onion","qty":2,"unit":"pcs"}]'::jsonb, '[{"en":"Heat water and rehydrate wakame following its package instructions.","it":"Scalda l’acqua e reidrata il wakame seguendo la confezione."},{"en":"Add cubed tofu and warm gently.","it":"Aggiungi il tofu a cubetti e scalda dolcemente."},{"en":"Dissolve miso in a little warm broth off heat and stir in; garnish with spring onion.","it":"Sciogli il miso in poco brodo caldo fuori dal fuoco, mescola e completa con cipollotto."}]'::jsonb, '🍜', 'cream'),
  ('spanish-tortilla', 'Spanish potato tortilla', 'Tortilla spagnola di patate', 'Golden egg omelette with tender potatoes and onion.', 'Frittata dorata con patate tenere e cipolla.', 'Spanish', 'Main', 'vegetarian', 45, 4, '[{"id":"eggs","qty":6,"unit":"pcs"},{"id":"potato","qty":550,"unit":"g"},{"id":"onion","qty":1,"unit":"pcs"},{"id":"olive_oil","qty":80,"unit":"ml"},{"id":"salt","qty":1,"unit":"tsp"}]'::jsonb, '[{"en":"Slice potatoes and onion thinly; cook gently until tender.","it":"Affetta finemente patate e cipolla; cuoci dolcemente fino a renderle tenere."},{"en":"Drain and mix with beaten eggs and salt.","it":"Scola e mescola con uova sbattute e sale."},{"en":"Cook in a nonstick pan, turning carefully, until the center is safely cooked.","it":"Cuoci in padella antiaderente, girando con attenzione, finché il centro è ben cotto."}]'::jsonb, '🍳', 'gold')
ON CONFLICT(slug) DO NOTHING;

COMMIT;
