import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {matchRecipes, resolveIngredientInput, ingredientMatches, ingredientFamilies, ingredients, ingredientById} from '../src/recipes.js';
const fixture=JSON.parse(readFileSync(new URL('./real-curated-imports.json',import.meta.url),'utf8'));
const actual=fixture.map(x=>({...x,id:x.slug,name:{en:x.title_en,it:x.title_it},time:x.prep_minutes}));
const fake=(id,ids)=>({id,name:{en:id,it:id},cuisine:'Lebanese',diet:'none',time:25,ingredients:ids.map(id=>({id,qty:1,unit:'g'}))});
const ids=(selected,rows=actual)=>matchRecipes(selected,{},rows).map(r=>r.id);

test('v27-v30 real imported recipes: matching results never include zero matches and sorted descending by number of selected items',()=>{
 for(const selection of [
  ['chicken'],['chickpeas'],['tomato'],['rice'],['lentils'],['onion','rice'],
  ['onion','tomato','olive_oil','garlic','salt'],
  ['chicken','rice','onion','garlic'],['eggplant','tomato','onion','olive_oil'],
  ['lemon','onion','potato','cucumber'],['bulgur','onion','parsley','tomato']
 ]){
  const matches=matchRecipes(selection,{},actual);
  assert.ok(matches.length>0,`Expected at least one recipe for ${selection.join(', ')}`);
  assert.ok(matches.every(r=>r.matchCount>0));
  assert.ok(matches.every((r,i)=>i===0 || matches[i-1].matchCount>=r.matchCount),`Sort inversion for ${selection}`);
  assert.ok(matches.every(r=>r.selectedTotal===selection.length && r.matchCount<=selection.length));
  assert.ok(matches.every(r=>r.matchCount+r.missing.length===r.totalRequired));
 }
});
test('real Iranian and Lebanese recipes recognize their common generic selections',()=>{
 assert.ok(ids(['rice']).includes('iranian-zereshk-polo-morgh'), 'Rice must match Persian rice in zereshk polo');
 assert.ok(ids(['chicken']).includes('iranian-zereshk-polo-morgh'), 'Chicken must match chicken thigh in zereshk polo');
 assert.ok(ids(['eggplant']).some(x=>x.includes('batenjan')||x.includes('baba')||x.includes('eggplant')||x.includes('badenjan')), 'Eggplant should find eggplant recipe');
 assert.ok(ids(['chickpeas']).includes('eggplant-chickpea-fatteh'), 'Chickpeas must find chickpea fatteh recipes');
});
test('the primary ranking is matched ingredient count, independent of percentage, cuisine or title',()=>{
 const rows=[fake('two_of_eight',['chicken_thigh','rice','a','b','c','d','e','f']),fake('one_of_one',['chicken_breast']),fake('three_of_ten',['chicken_breast','rice','onion','a','b','c','d','e','f','g']),fake('zero',['beef_stock'])];
 const results=matchRecipes(['chicken','rice','onion'],{},rows);
 assert.deepEqual(results.map(r=>r.id),['three_of_ten','two_of_eight','one_of_one']);
 assert.deepEqual(results.map(r=>r.matchCount),[3,2,1]);
 assert.deepEqual(results.map(r=>r.selectedTotal),[3,3,3]);
});
test('closely related but non-equivalent ingredients are NOT matched by words alone',()=>{
 for(const [query,unrelated] of [['chicken','chicken_stock'],['chicken','chicken_liver'],['rice','rice_flour'],['rice','rice_noodles'],['tomato','tomato_paste'],['tomato','sun_dried_tomatoes'],['garlic','toum'],['eggplant','egg_yolk'],['milk','almond_milk'],['eggs','egg_yolk'],['peas','split_peas'],['potato','sweet_potato']]){
  assert.equal(matchRecipes([query],{},[fake('not-a-match',[unrelated])]).length,0,`${query} must not match ${unrelated}`);
 }
});
test('ingredient family match consumes only one selected ingredient and discloses the variant',()=>{
 const results=matchRecipes(['chicken','rice'],{},[fake('double-chicken',['chicken_breast','chicken_thigh','rice'])]);
 assert.equal(results[0].matchCount,2);
 assert.equal(results[0].missing.length,1);
 assert.equal(results[0].familyMatches.length,1);
 assert.ok(results[0].familyMatches.some(x=>x.requiredId.startsWith('chicken')));
});
test('typing a comma-separated list adds every known ingredient, skips duplicates and rejects unknown terms',()=>{
 assert.deepEqual(resolveIngredientInput('chicken, rice; onion'),{additions:['chicken','rice','onion'],unknown:[]});
 assert.deepEqual(resolveIngredientInput('chicken, rice, chicken', ['chicken']),{additions:['rice'],unknown:[]});
 assert.deepEqual(resolveIngredientInput('chicken, xyz_that_does_not_exist'),{additions:['chicken'],unknown:['xyz_that_does_not_exist']});
});
test('ingredient lookup retains canonical precise names when added to DB vocabulary',()=>{
 for(const [id,en] of [['chicken_breast','Chicken breast'],['canned_chickpeas','Canned chickpeas'],['tomato_passata','Tomato passata']]){
  if(!ingredientById[id]){const ingredient={id,name:{en,it:en}};ingredients.push(ingredient);ingredientById[id]=ingredient;}
  assert.equal(ingredientMatches(en)[0].id,id);
 }
});
test('without selected ingredients the collection remains available',()=>{
 assert.equal(matchRecipes([],{},actual).length,actual.length);
});
