import test from 'node:test';
import assert from 'node:assert/strict';
import {recipeMetrics,validateSplitMetadata,splitMetadata,totalMinutesFromFields,shoppingLinesFromSelection} from '../src/recipe-details.js';

const recipe={id:'sample',serves:4,ingredients:[
{id:'chicken',qty:600,unit:'g'},{id:'rice',qty:300,unit:'g'},
{id:'onion',qty:2,unit:'pcs'},{id:'garlic',qty:3,unit:'pcs'}
]};

test('checked recipe ingredients do NOT enter shopping list',()=>{
 const items=shoppingLinesFromSelection(recipe,[],new Set([0,2]),4);
 assert.deepEqual(items.map(x=>x.ingredient_id),['rice','garlic']);
});
test('checked recipe ingredients AND saved pantry are excluded',()=>{
 const items=shoppingLinesFromSelection(recipe,['rice'],new Set([0,2]),4);
 assert.deepEqual(items.map(x=>x.ingredient_id),['garlic']);
});
test('no missing ingredient results in an empty shopping list',()=>{
 const items=shoppingLinesFromSelection(recipe,['rice','garlic'],new Set([0,2]),4);
 assert.deepEqual(items,[]);
});
test('unchecked recipe ingredients retain servings scale',()=>{
 const items=shoppingLinesFromSelection(recipe,[],new Set([0,2]),2);
 assert.equal(items.find(x=>x.ingredient_id==='rice').quantity,150);
});
test('unknown legacy total is not split into invented times',()=>{
 assert.deepEqual(recipeMetrics({prep_minutes:75}),{prepMinutes:null,cookMinutes:null,totalMinutes:75,kcalPerServing:null,hasSplit:false});
});
test('valid preparation/cooking split and kcal are reported',()=>{
 assert.deepEqual(recipeMetrics({prep_minutes:70,prep_time_minutes:15,cook_time_minutes:45,kcal_per_serving:415}),{prepMinutes:15,cookMinutes:45,totalMinutes:60,kcalPerServing:415,hasSplit:true});
});
test('no-cook recipes may use 0 cooking minutes',()=>{
 assert.equal(validateSplitMetadata({prep_time_minutes:20,cook_time_minutes:0,kcal_per_serving:null}),'');
});
test('one missing time is rejected',()=>{
 assert.match(validateSplitMetadata({prep_time_minutes:30,cook_time_minutes:null}),/both/);
});
test('two zero minute values are rejected',()=>{
 assert.match(validateSplitMetadata({prep_time_minutes:0,cook_time_minutes:0}),/whole/);
});
test('unknown kcal is blank, not assumed zero',()=>{
 assert.equal(splitMetadata({kcal_per_serving:''}).kcal_per_serving,null);
 assert.equal(recipeMetrics({prep_minutes:25,kcal_per_serving:null}).kcalPerServing,null);
});
test('invalid calorie inputs are rejected',()=>{
 assert.match(validateSplitMetadata({prep_time_minutes:20,cook_time_minutes:10,kcal_per_serving:-1}),/kcal/);
});
test('legacy total stays until BOTH times are supplied',()=>{
 assert.equal(totalMinutesFromFields({prep_time_minutes:null,cook_time_minutes:null},48),48);
 assert.equal(totalMinutesFromFields({prep_time_minutes:10,cook_time_minutes:20},48),30);
});
test('community indexed ingredients respect checked rows',()=>{
 const community={...recipe,source:'community',ingredients:[{id:'rice',qty:null,unit:''},{id:'garlic',qty:null,unit:''}]};
 const items=shoppingLinesFromSelection(community,[],new Set([0]),4);
 assert.equal(items.length,1);assert.equal(items[0].ingredient_id,'garlic');assert.equal(items[0].quantity,null);
});
