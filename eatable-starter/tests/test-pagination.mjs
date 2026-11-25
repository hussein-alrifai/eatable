import assert from 'node:assert/strict';
import {getIngredientVocabulary} from './catalog-cloud.js';
const all=Array.from({length:759},(_,n)=>({id:'id_'+String(n).padStart(4,'0'),name_en:'Ingredient '+n,name_it:'Ingrediente '+n}));
const calls=[];
globalThis.__mockCloudClient={from(table){
 assert.equal(table,'eatable_ingredients');
 return {select(columns){
  assert.equal(columns,'id,name_en,name_it');
  return {order(col,{ascending}){
   assert.equal(col,'id'); assert.equal(ascending,true);
   return {range(first,last){calls.push([first,last]);return Promise.resolve({data:all.slice(first,last+1),error:null});}};
  }};
 }};
}};
const ok=await getIngredientVocabulary();
assert.equal(ok.error,null);
assert.equal(ok.data.length,759);
assert.deepEqual(calls,[[0,499],[500,999]]);
assert.equal(ok.data.at(-1).id,'id_0758');
const error=new Error('RLS/connection error');
globalThis.__mockCloudClient={from(){return {select(){return {order(){return {range(){return Promise.resolve({data:null,error});}};}};}};}};
const failed=await getIngredientVocabulary();
assert.equal(failed.data,null);assert.equal(failed.error,error);
console.log('PASS: 759 ingredient rows retrieved over two pages; errors propagated.');
