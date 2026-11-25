// v9: Validate editorial JSON before importing. Only existing admin/RLS-controlled
// catalog tables are written, and imports are ALWAYS unpublished drafts.
import {validateCurated} from './curated-editor.js';
import {cuisines} from './recipes.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categories=new Set(['Main','Mezze','Salad','Breakfast','Soup','Bread','Dessert','Drink','Other']);
const allowedDiets=new Set(['vegan','vegetarian','none','unknown']);
// Keep importer validation aligned with cuisine choices in Explore and the recipe editor.
const supportedCuisines=new Set(cuisines.map(c=>c.id));
const supportedThemes=new Set(['cream','green','gold','ochre','spice','tomato']);
const MAX_RECIPES=25;

const LANG={
 en:{heading:'Batch Recipe Import',intro:'Add bilingual candidate recipes in batches. All imported dishes stay private drafts until you review and publish them individually.',how:'Choose the included starter pack or select your own JSON file.',sample:'Load 8 sample drafts',file:'Select JSON file',download:'Download sample JSON',preview:'Preview',import:'Import selected as drafts',summary:'Batch preview',unknown:'Unknown ingredient ID',duplicate:'Already in the catalog — will not overwrite',invalid:'Needs corrections',ready:'Valid draft',noPreview:'Load a recipe file to preview the entries before saving.',fileMax:'Maximum 25 recipes and 400 KB per file.',unpublished:'Imports cannot publish recipes, change existing recipes, or modify accounts.',check:'Select',title:'Recipe',status:'Status',results:'Last import results',created:'Created drafts',skipped:'Skipped',failed:'Failed',noSelected:'Select at least one valid new recipe.',review:'Open quality dashboard',editor:'Open curated editor',loading:'Processing…',failure:'Could not load the file. Check JSON format and ingredient IDs.',newRecipes:'Ready to import',already:'Existing recipes',rejected:'Invalid recipes'},
 it:{heading:'Importazione ricette in blocco',intro:'Aggiungi ricette candidate bilingui in gruppi. Tutti i piatti importati restano bozze private finché non li controlli e pubblichi singolarmente.',how:'Carica il pacchetto di esempio oppure seleziona un tuo file JSON.',sample:'Carica 8 bozze di esempio',file:'Seleziona file JSON',download:'Scarica JSON di esempio',preview:'Anteprima',import:'Importa le selezionate come bozze',summary:'Anteprima importazione',unknown:'ID ingrediente sconosciuto',duplicate:'Già nel catalogo — nessuna sovrascrittura',invalid:'Da correggere',ready:'Bozza valida',noPreview:'Carica un file ricette per vedere l’anteprima prima di salvare.',fileMax:'Massimo 25 ricette e 400 KB per file.',unpublished:'L’importazione non può pubblicare ricette, modificare quelle esistenti o intervenire sugli account.',check:'Seleziona',title:'Ricetta',status:'Stato',results:'Risultati dell’ultima importazione',created:'Bozze create',skipped:'Saltate',failed:'Non riuscite',noSelected:'Seleziona almeno una nuova ricetta valida.',review:'Apri controllo qualità',editor:'Apri editor ricette',loading:'Elaborazione…',failure:'Impossibile leggere il file. Controlla il formato JSON e gli ID degli ingredienti.',newRecipes:'Pronte all’importazione',already:'Ricette esistenti',rejected:'Ricette non valide'}
};
export const importText=(lang,key)=>LANG[lang]?.[key]||LANG.en[key]||key;

function cleanRecipe(source){
 const x=source&&typeof source==='object'&&!Array.isArray(source)?source:{};
 return {
  slug:String(x.slug??'').trim(),title_en:String(x.title_en??'').trim(),title_it:String(x.title_it??'').trim(),
  description_en:String(x.description_en??'').trim(),description_it:String(x.description_it??'').trim(),
  cuisine:String(x.cuisine??'').trim(),category:String(x.category??'').trim(),diet:String(x.diet??'').trim(),
  prep_minutes:Number(x.prep_minutes),servings:Number(x.servings),
  ingredients:Array.isArray(x.ingredients)?x.ingredients.map(i=>({id:String(i?.id??'').trim(),qty:Number(i?.qty),unit:String(i?.unit??'').trim()})):[],
  steps:Array.isArray(x.steps)?x.steps.map(s=>({en:String(s?.en??'').trim(),it:String(s?.it??'').trim()})):[],
  emoji:'🍲',theme:supportedThemes.has(x.theme)?x.theme:'cream',published:false,public_photo_path:null
 };
}
export function parseRecipeImport(raw,vocabulary,existing=[]){
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>400000)throw Error('Recipe JSON must be smaller than 400 KB.');
 let doc;try{doc=JSON.parse(raw)}catch{throw Error('Invalid JSON file.');}
 if(!doc||doc.version!==1||!Array.isArray(doc.recipes)||!doc.recipes.length||doc.recipes.length>MAX_RECIPES)throw Error('Expected {"version":1,"recipes":[...]} with 1–25 entries.');
 const existingSet=new Set(existing),slugsSeen=new Set();
 return doc.recipes.map((source,index)=>{
  const recipe=cleanRecipe(source);
  let error=validateCurated(recipe,vocabulary);
  if(!error&&!supportedCuisines.has(recipe.cuisine))error=`Unsupported cuisine: ${recipe.cuisine || '(empty)'}.`;
  if(!error&&!categories.has(recipe.category))error=`Unsupported category: ${recipe.category || '(empty)'}.`;
  if(!error&&!allowedDiets.has(recipe.diet))error=`Unsupported diet: ${recipe.diet || '(empty)'}.`;
  if(!error&&slugsSeen.has(recipe.slug))error='Repeated slug inside this file.';
  slugsSeen.add(recipe.slug);
  const duplicate=existingSet.has(recipe.slug);
  return {index,recipe,error,status:error?'invalid':duplicate?'duplicate':'ready'};
 });
}
export function importCounts(rows){return {ready:rows.filter(r=>r.status==='ready').length,duplicate:rows.filter(r=>r.status==='duplicate').length,invalid:rows.filter(r=>r.status==='invalid').length};}
export function importPageHtml({lang,rows,selected,results,loading,link}){
 const tx=k=>importText(lang,k),c=importCounts(rows),selectedSet=new Set(selected);
 return `<div class="v9-wrap">
 <div class="v9-guide"><h2>${tx('heading')}</h2><p>${tx('intro')}</p><p class="muted small">${tx('how')}</p>
 <div class="v3-actions"><button type="button" class="btn btn-primary" data-action="import-sample" ${loading?'disabled':''}>${tx('sample')}</button><a class="btn btn-outline" href="/data/recipe-starter-pack.json" download>${tx('download')}</a></div>
 <label class="v9-file-label">${tx('file')}<input id="recipe-json-file" type="file" accept=".json,application/json" class="input" ${loading?'disabled':''}></label>
 <p class="muted small">${tx('fileMax')}</p><p class="notice small">${tx('unpublished')}</p></div>
 ${results?`<div class="notice v9-results" role="status"><strong>${tx('results')}</strong><p>${tx('created')}: ${results.created} · ${tx('skipped')}: ${results.skipped} · ${tx('failed')}: ${results.failed}</p>${results.errors.length?`<ul>${results.errors.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`:''}</div>`:''}
 ${rows.length?`<div class="v9-preview"><div class="inline-row"><h2>${tx('summary')}</h2><span class="pill">${tx('newRecipes')}: ${c.ready}</span><span class="pill">${tx('already')}: ${c.duplicate}</span><span class="pill">${tx('rejected')}: ${c.invalid}</span></div>
 <form id="recipe-bulk-import-form"><div class="v9-list">${rows.map(row=>{
 const r=row.recipe,can=row.status==='ready',checked=can&&selectedSet.has(row.index);
 return `<div class="v9-row ${can?'':'v9-disabled'}"><label class="v9-select"><input type="checkbox" data-import-select value="${row.index}" ${checked?'checked':''} ${can&&!loading?'':'disabled'} aria-label="${tx('check')}: ${esc(r.title_en||r.slug)}"></label><div class="v9-body"><strong>${esc(lang==='it'?r.title_it||r.title_en:r.title_en||r.slug)}</strong><p class="muted small">${esc(r.slug)} · ${esc(r.cuisine)} · ${r.ingredients.length} ${lang==='it'?'ingredienti':'ingredients'}</p><p class="v9-status">${row.status==='ready'?tx('ready'):row.status==='duplicate'?tx('duplicate'):`${tx('invalid')}: ${esc(row.error)}`}</p></div></div>`;
 }).join('')}</div><div class="v3-actions"><button type="submit" class="btn btn-primary" ${loading||!selectedSet.size?'disabled':''}>${loading?tx('loading'):tx('import')}</button>${link('admin-curated',tx('editor'),'btn btn-outline')}${link('admin-quality',tx('review'),'btn btn-outline')}</div></form></div>`:`<div class="empty">${tx('noPreview')}</div>`}</div>`;
}
