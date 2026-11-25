import fs from 'node:fs';
import {parseRecipeImport,importCounts} from '../src/bulk-import.js';
import {cuisines,substitutionFor,matchRecipes} from '../src/recipes.js';
import {validateCurated} from '../src/curated-editor.js';
const root=new URL('../',import.meta.url);
const load=rel=>JSON.parse(fs.readFileSync(new URL(rel,root),'utf8'));
const ids=[...load('tests/base-ingredient-ids.json'),...load('tests/v27-ingredient-ids.json'),...load('tests/v28-ingredient-ids.json'),...load('ingredients/ingredients-v30-additions.json').ingredients.map(x=>x.id)];
const vocab=[...new Set(ids)].map(id=>({id,name:{en:id,it:id}}));
const files=['recipes-v30-iranian-01.json','recipes-v30-iranian-02.json','recipes-v30-lebanese-01.json','recipes-v30-lebanese-02.json'];
const slugs=new Set();let total=0;
for(const file of files){
 const raw=fs.readFileSync(new URL('recipes/'+file,root),'utf8');
 const rows=parseRecipeImport(raw,vocab,[]);const stat=importCounts(rows);
 for(const item of rows){if(item.error)throw Error(file+' '+item.recipe.slug+': '+item.error); if(slugs.has(item.recipe.slug))throw Error('duplicate slug '+item.recipe.slug); slugs.add(item.recipe.slug);}
 if(stat.invalid || stat.duplicate)throw Error(file+': invalid or duplicate rows');
 console.log('VALID',file,'recipes',rows.length,'bytes',Buffer.byteLength(raw));total+=rows.length;
}
if(!cuisines.some(x=>x.id==='Iranian'))throw Error('Iranian missing from national filters');
if(typeof substitutionFor!=='function'||typeof matchRecipes!=='function')throw Error('Missing search/substitution exports');
console.log('PASS',total,'recipes and',load('ingredients/ingredients-v30-additions.json').ingredients.length,'new ingredients');

// Simulate a live Supabase database that has not received the v30 ingredient SQL.
const incompleteVocab=vocab.filter(row=>row.id!=='sabzi_ghormeh_mix');
const iranianFirst=fs.readFileSync(new URL('recipes/recipes-v30-iranian-01.json',root),'utf8');
const missingRows=parseRecipeImport(iranianFirst,incompleteVocab,[]);
if(!missingRows[0].error?.includes('Unknown ingredient ID: sabzi_ghormeh_mix'))throw Error('Missing ingredient diagnostics failed');
console.log('PASS', 'missing-ingredient diagnostics detect unavailable live vocabulary');
