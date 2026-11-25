import assert from 'node:assert/strict';
import { matchRecipes } from '../src/recipes.js';
const r=(id,ids,diet='none',cuisine='Lebanese',time=30)=>({id,name:{en:id,it:id},ingredients:ids.map(id=>({id,qty:1,unit:'pcs'})),diet,cuisine,time});
const set=['chicken','rice','onion','tomato','garlic'];
const collection=[
 r('5-of-7',['chicken','rice','onion','tomato','garlic','salt','pepper']),
 r('4-of-5',['chicken','rice','onion','tomato','salt']),
 r('3-of-3',['chicken','rice','onion']),
 r('1-of-8',['chicken','salt','pepper','saffron','potato','parsley','eggplant','flour']),
 r('0-of-6',['salt','pepper','saffron','potato','parsley','flour']),
 r('4-of-4',['chicken','rice','onion','tomato'],'vegan','Iranian')
];
let result=matchRecipes(set,{},collection);
assert.deepEqual(result.map(r=>r.id),['5-of-7','4-of-4','4-of-5','3-of-3','1-of-8']);
assert.equal(result[0].matchCount,5);
assert.equal(result[0].matchPercent,71);
assert.equal(result[1].matchPercent,100);
assert.equal(result[2].missing.length,1);
assert.equal(result.every(r=>r.matchCount>0),true);
assert.deepEqual(matchRecipes(set,{cuisine:'Iranian'},collection).map(r=>r.id),['4-of-4']);
assert.deepEqual(matchRecipes(set,{diet:'vegan'},collection).map(r=>r.id),['4-of-4']);
assert.deepEqual(matchRecipes(set,{maxTime:'20'},collection),[]);
assert.equal(matchRecipes([],{},collection).length,collection.length);
assert.equal(matchRecipes(['absent'],{},collection).length,0);
console.log('PASS — ingredient match count, coverage tie-breaks, exclusion of zero matches, existing filters and empty selection');
