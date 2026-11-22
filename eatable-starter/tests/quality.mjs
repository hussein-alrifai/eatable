import assert from 'node:assert/strict';
import {auditRecipe,qualityCsv,qualityDashboardHtml,qualityReviewHtml,reviewFields} from '../src/quality.js';
const base={slug:'batata-harra',title_en:'Batata Harra',title_it:'Patate piccanti libanesi',description_en:'Crispy Lebanese potatoes with garlic and coriander.',description_it:'Patate libanesi con aglio e coriandolo fresco.',cuisine:'Lebanese',category:'Mezze',diet:'vegan',prep_minutes:40,servings:4,published:true,ingredients:[{id:'potato',qty:600,unit:'g'},{id:'garlic',qty:3,unit:'pcs'}],steps:[{en:'Cut the potatoes.',it:'Taglia le patate.'},{en:'Roast and season.',it:'Arrostisci e condisci.'}],public_photo_path:'curated/batata-harra/000.jpg'};
const review={slug:base.slug,recipe_tested:true,quantities_checked:true,translations_checked:true,photo_rights_checked:true,origin_checked:true,editorial_note:'Tested and translated.'};
assert.equal(auditRecipe(base,review).ready,true);
assert.equal(auditRecipe(base,null).ready,false);
assert.deepEqual(auditRecipe(base,null).issues,['missingReview']);
assert(auditRecipe({...base,public_photo_path:null},review).issues.includes('missingPhotoIssue'));
assert(auditRecipe({...base,steps:[{en:'Only one step',it:''}]},review).issues.includes('missingTranslation'));
assert(auditRecipe({...base,steps:[{en:'Only one step',it:'Solo un passaggio'}]},review).issues.includes('fewSteps'));
assert(auditRecipe({...base,diet:'unknown'},review).issues.includes('unknownDiet'));
assert.equal(reviewFields.length,5);
const link=(route,label)=>`<a href="/${route}">${label}</a>`;
for(const lang of ['en','it']){
 const page=qualityDashboardHtml({lang,recipes:[base,{...base,slug:'test-draft',published:false,public_photo_path:null}],reviews:[review],filter:'needs-review',link});
 assert.match(page,/test-draft/);assert.equal((page.match(/class="v8-quality-item"/g)||[]).length,1);assert.doesNotMatch(page,/href="\/admin-quality\/batata-harra"/);
 const detail=qualityReviewHtml({lang,recipe:base,review,link});
 assert.match(detail,/quality-review-form/);assert.match(detail,/checked/);
 assert.match(detail,/editorial_note/);
}
const csv=qualityCsv([{...base,title_en:'=HYPERLINK("evil")',description_en:'Not used'}],[review]);
assert(csv.startsWith('\ufeff'));
assert(csv.includes("'=HYPERLINK")); // spreadsheet formula injection prevented
assert(csv.includes('batata-harra'));
assert(csv.includes('recipe_tested'));
assert(!qualityDashboardHtml({lang:'en',recipes:[],reviews:[],filter:'all',link}).includes('undefined'));
console.log('PASS v8: review audit, filtering, translations, spreadsheet-safe CSV and review forms.');
