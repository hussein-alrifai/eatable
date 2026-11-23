import assert from 'node:assert/strict';
import { ingredientMatches, matchRecipes, substitutionFor, ingredients, recipes } from '../src/recipes.js';
import { communityFromDb, mergeVocabulary } from '../src/discovery.js';

// English, Italian, aliases and accents map to the same canonical ingredient.
for (const [query,id] of [['potatoes','potato'],['patate','potato'],['pomodori','tomato'],['garbanzo beans','chickpeas'],['coriander leaves','cilantro'],['coriandolo fresco','cilantro'],['scallions','spring_onion'],['olio EVO','olive_oil']]) {
 assert.equal(ingredientMatches(query)[0]?.id,id,`alias ${query}`);
}
assert.deepEqual(ingredientMatches(''),[]);
assert.equal(new Set(ingredientMatches('tomato').map(i=>i.id)).size,ingredientMatches('tomato').length);

// Only selected canonical IDs count as available. Swaps NEVER promote a recipe to Ready.
const hummus=recipes.find(r=>r.id==='hummus');
const hasAll=hummus.ingredients.map(x=>x.id);
const ready=matchRecipes(hasAll,{},[hummus])[0];
assert.equal(ready.matchPercent,100);
assert.equal(ready.categoryScore,0);
assert.equal(ready.missing.length,0);
const partial=matchRecipes(['chickpeas','tahini','lime','garlic','olive_oil','salt','water'],{},[hummus])[0];
assert.equal(partial.matchCount,6);
assert.equal(partial.matchPercent,86);
assert.equal(partial.categoryScore,1);
assert.equal(partial.missing.length,1);
assert.equal(partial.missing[0].id,'lemon');
assert.equal(partial.substitutions[0].availableId,'lime');
assert.match(partial.substitutions[0].note.it,/lime/i);
assert.equal(substitutionFor('lemon',['milk']),null);
assert.equal(substitutionFor('olive_oil',['butter']),null); // allergen safety

// Filtering is independent of the swapping hint system.
assert.equal(matchRecipes(['lime'],{diet:'vegan'},[hummus])[0].diet,'vegan');
assert.equal(matchRecipes([],{diet:'vegetarian'},recipes).some(r=>r.diet==='none'),false);

// Newly indexed community recipes use same canonical matching engine.
const community=communityFromDb({id:'0001',origin:'Lebanon',title_en:'Community dish',title_it:'Ricetta',description_en:'desc',description_it:'desc',category:'Main',prep_minutes:20,servings:4,ingredients:['1 lemon','200g chickpeas'],steps:['Mix.'],public_photo_path:null},{ingredient_ids:['lemon','chickpeas'],cuisine:'Lebanese',diet:'vegan'});
const indexedMatch=matchRecipes(['lime','chickpeas'],{},[community])[0];
assert.equal(indexedMatch.matchCount,1);
assert.equal(indexedMatch.substitutions.length,1);
assert.equal(indexedMatch.categoryScore,1);
const unindexed=communityFromDb({id:'0002',origin:'Lebanon',title_en:'Unmapped',description_en:'desc',category:'Main',prep_minutes:20,servings:4,ingredients:['1 lemon','200g chickpeas'],steps:['Mix.']},null);
assert.equal(unindexed.searchable,false);

mergeVocabulary([{id:'pomegranate_molasses',name_en:'Pomegranate molasses',name_it:'Melassa di melograno'}]);
assert.equal(ingredientMatches('melassa di melograno')[0]?.id,'pomegranate_molasses');
console.log('PASS: v10 aliases, bilingual suggestions, missing ingredients, dietary filters, safe substitutions, community indexing, dynamic vocabulary.');
