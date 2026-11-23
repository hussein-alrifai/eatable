import assert from 'node:assert/strict';
import {requiredMissing, shoppingLinesForRecipe, canonicalIngredientId} from '../src/kitchen.js';
import {recipes,ingredients} from '../src/recipes.js';
import {communityFromDb} from '../src/discovery.js';

const hummus=recipes.find(r=>r.id==='hummus');
assert.ok(hummus,'hummus is in the original catalog');
assert.deepEqual(requiredMissing(hummus,hummus.ingredients.map(x=>x.id)),[]);
assert.equal(requiredMissing(hummus,[]).length,hummus.ingredients.length);
assert.deepEqual(requiredMissing({ingredients:[],searchable:false},[]),[]);
assert.equal(shoppingLinesForRecipe(hummus,['chickpeas'],4).length,hummus.ingredients.length-1);
const lines=shoppingLinesForRecipe(hummus,['chickpeas'],8);
for(const line of lines){
 const initial=hummus.ingredients.find(x=>x.id===line.ingredient_id);
 assert.equal(line.quantity,Number((initial.qty*8/(hummus.serves||4)).toFixed(2)));
 assert.equal(line.unit,initial.unit);
}
const seen=new Set(lines.map(r=>r.ingredient_id+':'+r.unit));
assert.equal(seen.size,lines.length);
assert.equal(canonicalIngredientId('Potatoes',ingredients),null); // ask for a displayed canonical option
assert.equal(canonicalIngredientId('Potato',ingredients),'potato');
assert.equal(canonicalIngredientId('Patata',ingredients),'potato');
assert.equal(canonicalIngredientId('Olio d’oliva',ingredients),'olive_oil');
assert.equal(canonicalIngredientId('  cEcI  ',ingredients),'chickpeas');
assert.equal(canonicalIngredientId('unknown ingredients',ingredients),null);
const r=communityFromDb({id:'abcd',origin:'Italy',title_en:'Demo',description_en:'demo',category:'Main',prep_minutes:30,servings:4,ingredients:['rice 100g','water 1L'],steps:['cook']},null);
assert.equal(r.searchable,false);
assert.deepEqual(shoppingLinesForRecipe(r,[],4),[]);
console.log('PASS v11: pantry presence, quantity-scaled shopping hints, mapping requirements, bilingual canonical ingredient selection.');
