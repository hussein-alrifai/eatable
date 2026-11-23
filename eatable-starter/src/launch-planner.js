import {launchBacklog} from './launch-backlog.js';
import {auditRecipe} from './quality.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
// Editorial-equivalent titles already used by the original demonstration and batch content.
// These are explicit rather than fuzzy: culinary variants must never be silently equated.
const aliases={
 'hummus-with-tahini':['hummus'],
 'fattoush':['fattoush'],
 'tabbouleh':['tabbouleh'],
 'batata-harra':['batata-harra'],
 'fattet-hummus':['fattet-hummus'],
 'manakish-za-atar':['manakish-zaatar'],
 'chicken-shawarma':['chicken-shawarma'],
 'shorbet-adas':['lentil-soup'],
 'mujadara':['mujaddara-rice-lentils'],
 'pasta-al-pomodoro':['pasta-pomodoro'],
 'pasta-e-ceci':['pasta-e-ceci-soup'],
 'risotto-ai-funghi':['mushroom-risotto'],
 'greek-salad':['greek-salad'],
 'spanish-tortilla':['spanish-tortilla'],
 'shakshuka':['shakshuka'],
 'miso-soup':['miso-soup'],
 'guacamole':['guacamole'],
 'chicken-fajitas':['chicken-fajitas'],
 'vegetable-fried-rice':['fried-rice'],
 'balila':['balila-warm-chickpeas'],
 'labneh-with-za-atar':['labneh-with-zaatar'],
 'riz-a-djej':['riz-a-djej-chicken-rice'],
 'minestrone':['minestrone-vegetable-soup'],
 'gazpacho':['gazpacho-tomato'],
 'chana-masala':['chana-masala-simple'],
 'pico-de-gallo':['pico-de-gallo-fresh'],
 'lentil-salad':['warm-lentil-salad']
};
const txs={
 en:{heading:'Content Studio',intro:'Track the 80-recipe editorial plan against your live curated catalog. Candidates are not verified recipes.',planned:'Planned dishes',found:'In catalog',ready:'Published & reviewed',missing:'Not yet in catalog',filter:'Show',all:'All candidates',draft:'Draft',published:'Published — needs review',needs:'Requires review',readyFilter:'Launch-ready',group:'Cuisine focus',any:'All cuisines',lebanese:'Lebanese',world:'International',search:'Search planned dishes',apply:'Search',clear:'Reset',recipe:'Candidate',status:'Status',action:'Next action',start:'Create recipe',edit:'Open editor',review:'Review quality',export:'Download CSV audit',import:'Batch import',note:'This plan does not certify cooking tests, dietary accuracy, photos, translations or origin. A dish counts as launch-ready only when published and all editorial checks and automatic checks pass.',noResults:'No matching planned dishes.',quality:'Recipe quality',coverage:'Catalog coverage',tip:'Import candidate drafts from the v16 sample pack, then review each one before publishing.',noData:'Loading your curated catalog…',error:'Quality records not available; published recipes cannot be counted as launch-ready.'},
 it:{heading:'Studio contenuti',intro:'Confronta il piano editoriale di 80 piatti con il catalogo curato attuale. Le proposte non sono ricette verificate.',planned:'Piatti previsti',found:'Nel catalogo',ready:'Pubblicate e revisionate',missing:'Non ancora in catalogo',filter:'Mostra',all:'Tutte le proposte',draft:'Bozza',published:'Pubblicata — da controllare',needs:'Da revisionare',readyFilter:'Pronte al lancio',group:'Cucine',any:'Tutte le cucine',lebanese:'Libanese',world:'Internazionale',search:'Cerca piatti previsti',apply:'Cerca',clear:'Azzera',recipe:'Proposta',status:'Stato',action:'Prossima azione',start:'Crea ricetta',edit:'Apri editor',review:'Controlla qualità',export:'Esporta controllo CSV',import:'Importazione in blocco',note:'Il piano non certifica prove di cucina, correttezza dietetica, fotografie, traduzioni o origine. Un piatto è pronto solo se pubblicato e supera tutti i controlli editoriali e automatici.',noResults:'Nessun piatto corrispondente.',quality:'Qualità ricette',coverage:'Copertura catalogo',tip:'Importa le bozze del pacchetto v16, poi revisiona ogni ricetta prima della pubblicazione.',noData:'Caricamento catalogo curato…',error:'Revisioni qualità non disponibili: non è possibile classificare le ricette come pronte al lancio.'}
};
export const launchText=(lang,key)=>txs[lang]?.[key]||txs.en[key]||key;
export function auditLaunchCatalog(recipes=[],reviews=[],qualityAvailable=true){
 const bySlug=new Map(recipes.map(r=>[normalize(r.slug),r]));
 const byTitle=new Map();for(const r of recipes){for(const title of [r.title_en,r.title_it]){const n=normalize(title);if(n&&!byTitle.has(n))byTitle.set(n,r);}}
 const reviewBySlug=new Map(reviews.map(r=>[r.slug,r]));
 return launchBacklog.map(item=>{
   const candidates=[item.slug,...(aliases[item.slug]||[])];
   const recipe=candidates.map(s=>bySlug.get(normalize(s))).find(Boolean)||byTitle.get(item.slug)||null;
   const audit=recipe&&qualityAvailable?auditRecipe(recipe,reviewBySlug.get(recipe.slug)):null;
   const status=!recipe?'missing':!recipe.published?'draft':audit?.ready?'ready':'review';
   return {...item,recipe,status,issues:audit?.issues||[]};
 });
}
export function launchCsv(rows){
 const guard=v=>{const s=String(v??'');return /^[\s\x00-\x1f]*[=+@-]/.test(s)?"'"+s:s};
 const q=v=>'"'+guard(v).replaceAll('"','""')+'"';
 const data=[['number','candidate','group','status','catalog_slug','issues'],...rows.map(r=>[r.id,r.name,r.group,r.status,r.recipe?.slug||'',r.issues.join('; ')])];
 return '\ufeff'+data.map(row=>row.map(q).join(',')).join('\r\n');
}
export function launchPlannerHtml({lang='en',rows=[],filter='all',group='all',query='',link,qualityAvailable=true}){
 const t=k=>launchText(lang,k);const counts={planned:rows.length,found:rows.filter(r=>r.recipe).length,ready:rows.filter(r=>r.status==='ready').length,missing:rows.filter(r=>r.status==='missing').length};
 const display=rows.filter(r=>(filter==='all'||filter===r.status)&&(group==='all'||group===r.group)&&(!query||normalize(r.name).includes(normalize(query))||normalize(r.recipe?.title_en||'').includes(normalize(query))));
 return `<div class="v16-studio"><div class="v16-stats"><div><small>${t('planned')}</small><strong>${counts.planned}</strong></div><div><small>${t('found')}</small><strong>${counts.found}</strong></div><div><small>${t('ready')}</small><strong>${counts.ready}</strong></div><div><small>${t('missing')}</small><strong>${counts.missing}</strong></div></div>
 <div class="v16-coverage"><span style="width:${counts.planned?Math.round(counts.found/counts.planned*100):0}%"></span></div><p class="muted small">${esc(t('coverage'))}: ${counts.found}/${counts.planned} · ${esc(t('ready'))}: ${counts.ready}/${counts.planned}</p>
 ${!qualityAvailable?`<div class="notice" role="alert">${esc(t('error'))}</div>`:''}
 <div class="v3-actions">${link('admin-curated/new',t('start'),'btn btn-primary')}${link('admin-import',t('import'),'btn btn-outline')}${link('admin-quality',t('quality'),'btn btn-outline')}<button class="btn btn-outline" type="button" data-action="v16-export">${t('export')}</button></div>
 <form id="v16-filters" class="v16-filters"><label>${t('search')}<input class="input" name="search" value="${esc(query)}" maxlength="120"/></label><label>${t('filter')}<select class="input" name="status">${[['all','all'],['missing','missing'],['draft','draft'],['review','needs'],['ready','readyFilter']].map(([v,k])=>`<option value="${v}" ${filter===v?'selected':''}>${esc(t(k))}</option>`).join('')}</select></label><label>${t('group')}<select class="input" name="group">${[['all','any'],['Lebanese','lebanese'],['International','world']].map(([v,k])=>`<option value="${v}" ${group===v?'selected':''}>${esc(t(k))}</option>`).join('')}</select></label><button class="btn btn-primary" type="submit">${t('apply')}</button><button class="btn btn-light" type="button" data-action="v16-clear">${t('clear')}</button></form>
 <p class="muted small">${esc(t('tip'))}</p>
 ${display.length?`<div class="v16-list">${display.map(row=>`<article class="v16-item"><div><strong><span class="muted">${row.id}.</span> ${esc(row.name)}</strong><p class="muted small">${esc(row.group)} ${row.recipe?`· ${esc(row.recipe.slug)}`:''}</p><span class="pill ${row.status==='ready'?'v8-good':''}">${esc(t(row.status==='review'?'published':row.status==='ready'?'readyFilter':row.status))}</span></div><div class="v16-item-actions">${row.recipe?link('admin-curated/'+encodeURIComponent(row.recipe.slug),t('edit'),'btn btn-outline btn-sm'):link('admin-curated/new',t('start'),'btn btn-light btn-sm')}${row.recipe?link('admin-quality/'+encodeURIComponent(row.recipe.slug),t('review'),'btn btn-light btn-sm'):''}</div></article>`).join('')}</div>`:`<div class="empty">${esc(t('noResults'))}</div>`}
 <p class="notice small">${esc(t('note'))}</p></div>`;
}
