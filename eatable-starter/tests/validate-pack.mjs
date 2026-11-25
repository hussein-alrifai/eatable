import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseRecipeImport,importCounts} from '../cuisine-patch/src/bulk-import.js';
import {cuisines} from '../cuisine-patch/src/recipes.js';
const ROOT=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const v28=JSON.parse(fs.readFileSync(path.join(ROOT,'ingredients/ingredients-v28-additions.json'),'utf8')).ingredients;
const v27=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/v27-ingredient-ids.json'),'utf8'));
const base=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/base-ingredient-ids.json'),'utf8'));
const vocabulary=[...new Set([...base,...v27,...v28.map(i=>i.id)])].map(id=>({id,name:{en:id,it:id}}));
const slugs=new Set();const usedCuisines=new Set();let total=0;let failed=false;
for(const file of ['recipes-v28-01.json','recipes-v28-02.json','recipes-v28-03.json','recipes-v28-04.json','v27-corrected-nations-01.json','v27-corrected-nations-02.json']){
 const raw=fs.readFileSync(path.join(ROOT,'recipes',file),'utf8');
 const rows=parseRecipeImport(raw,vocabulary,[]),stats=importCounts(rows);
 for(const r of rows){if(r.error){console.error(file,r.recipe.slug,r.error);failed=true;}
  if(file.startsWith('recipes-v28')){if(slugs.has(r.recipe.slug))failed=true;slugs.add(r.recipe.slug);usedCuisines.add(r.recipe.cuisine);total++;}}
 console.log(file,JSON.stringify(stats),'bytes',Buffer.byteLength(raw));
 if(stats.invalid||stats.duplicate)failed=true;
}
const allowed=new Set(cuisines.map(c=>c.id));
for(const c of usedCuisines)if(!allowed.has(c))failed=true;
if(total!==86||v28.length!==236)failed=true;
if(failed)process.exit(1);
console.log('PASS:',total,'new recipes',v28.length,'additional ingredients',usedCuisines.size,'national cuisines in new drafts.');
