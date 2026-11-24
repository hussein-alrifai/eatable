import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseRecipeImport,importCounts} from '../src/bulk-import.js';
import {recipes,ingredients} from '../src/recipes.js';
import {analyzeCoverage} from '../src/coverage-audit.js';
import {candidateRecipes,suggestCoverageDrafts,coverageSuggestionsHtml} from '../src/coverage-suggestions.js';

const raw=fs.readFileSync(new URL('../data/recipe-pack-v18.json',import.meta.url),'utf8');
const parsed=parseRecipeImport(raw,ingredients,[]);
assert.equal(parsed.length,12);
assert.deepEqual(importCounts(parsed),{ready:12,duplicate:0,invalid:0});
assert.equal(candidateRecipes.length,12);
for(const x of parsed){
 assert.equal(x.recipe.published,false);
 assert.equal(x.recipe.public_photo_path,null);
 assert(x.recipe.ingredients.length>=4);
 assert(x.recipe.steps.length>=3);
 assert(x.recipe.title_en&&x.recipe.title_it);
 assert.equal(candidateRecipes.find(c=>c.slug===x.recipe.slug).ids.length,x.recipe.ingredients.length);
}
// Existing curated items must never be overwritten.
const existing=parseRecipeImport(raw,ingredients,['soy-tofu-rice-with-peas']);
assert.equal(existing.find(x=>x.recipe.slug==='soy-tofu-rice-with-peas').status,'duplicate');
const report=analyzeCoverage(recipes,ingredients);
const result=suggestCoverageDrafts(report);
assert.equal(result.totalBaskets,10);
assert.equal(result.before,3);
assert.equal(result.possibleAfter,10);
assert(result.suggestions.some(x=>x.emptyBasketCount>=1));
const afterImported=suggestCoverageDrafts(report,parsed.map(x=>x.recipe.slug));
assert.equal(afterImported.possibleAfter,10);
assert(afterImported.suggestions.every(x=>x.alreadyInCatalog));
const html=coverageSuggestionsHtml({report,lang:'en',existingSlugs:[],link:(p,t)=>`<a href="${p}">${t}</a>`});
assert.match(html,/admin-import/);
assert.match(html,/recipe-pack-v18.json/);
assert.match(html,/3\/10/);
assert.match(html,/10\/10/);
const italian=coverageSuggestionsHtml({report,lang:'it',existingSlugs:[],link:(p,t)=>`<a href="${p}">${t}</a>`});
assert.match(italian,/bozze/i);
assert.match(italian,/revisio/i);
console.log('PASS v18: 12 bilingual valid private drafts, duplicate protection, candidate gap analysis, EN/IT UI, illustrative 3-to-10 pantry coverage.');
