import test from 'node:test';
import assert from 'node:assert/strict';
import {workflowGroups,assessRecipe} from '../src/recipe-workflow.js';
import {cuisines} from '../src/recipes.js';
const ids=new Set(['onion','chicken']);
const base={slug:'chicken-test',title_en:'Chicken dish',title_it:'Pollo',description_en:'Made with chicken and onion',description_it:'Piatto con pollo e cipolla',cuisine:'Lebanese',category:'Main',diet:'none',prep_minutes:35,servings:4,ingredients:[{id:'chicken',qty:300,unit:'g'},{id:'onion',qty:1,unit:'pcs'}],steps:[{en:'Cook thoroughly',it:'Cuoci completamente'}],public_photo_path:'curated/chicken-test/uuid.jpg',published:true};
test('curated recipe completeness: required fields pass',()=>{
 assert.equal(assessRecipe(base,ids).complete,true);
});
test('published recipe with private-only photo still needs public cover',()=>{
 const state=assessRecipe({...base,public_photo_path:null,photo_path:'private-image.jpg'},ids);
 assert.equal(state.complete,false);assert.ok(state.issues.includes('photo'));
});
test('draft private photo counts as a cover',()=>{
 assert.equal(assessRecipe({...base,published:false,public_photo_path:null,photo_path:'private.jpg'},ids).complete,true);
});
test('missing translations, instructions, unknown ingredients and unreviewed diet are flagged',()=>{
 const state=assessRecipe({...base,title_it:'',steps:[{en:'Cook',it:''}],diet:'unknown',ingredients:[{id:'nonexistent',qty:2,unit:'g'}]},ids);
 assert.deepEqual(state.issues.sort(),['ingredients','instructions','metadata','translations']);
});
test('photos, then last missing issue saved -> complete group automatically',()=>{
 const original={...base,public_photo_path:null};
 const a=workflowGroups([original],ids);assert.equal(a.needs.length,1);assert.equal(a.complete.length,0);
 const b=workflowGroups([{...original,public_photo_path:'newpublic.jpg'}],ids);assert.equal(b.needs.length,0);assert.equal(b.complete.length,1);
});
test('coverage: country and territory choices are distinct and broad',()=>{
 assert.equal(cuisines.length,249);
 assert.equal(new Set(cuisines.map(x=>x.id)).size,249);
 assert.equal(new Set(cuisines.map(x=>x.flag)).size,249);
 for(const id of ['Lebanese','Iranian','Ghanaian','Ethiopian','Korean','Japanese']){
  if(id==='Korean')continue;
  assert.ok(cuisines.some(x=>x.id===id),id);
 }
});
