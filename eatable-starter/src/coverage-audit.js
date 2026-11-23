// v17: Editorial search-coverage audit. This does not modify database records.
// Analyses published/searchable catalog items only. It does not access user pantries.
const text={
 en:{title:'Search Coverage Lab',intro:'Measure how useful the published recipe catalog is for common pantry combinations. Use the gaps to plan your next tested recipes.',catalog:'Public recipes',searchable:'Ingredient-search ready',notIndexed:'Approved recipes awaiting ingredient mapping',vocabulary:'Known ingredients',neverUsed:'Ingredients never used',rare:'Ingredients in only one recipe',ready:'Ready to cook',almost:'Up to two missing',samples:'Sample pantry scenarios',ingredients:'Ingredient coverage',cuisines:'Cuisine coverage',top:'Most represented ingredients',gaps:'Priority ingredient gaps',recipeCount:'Recipes',scenario:'Sample ingredients',coverage:'Result',note:'The scenarios are illustrative; they are not your users’ real pantries. Matching counts ingredient types only, not quantities, safety or allergies. A recipe only counts as ready when all listed required ingredients are selected.',csv:'Export CSV',empty:'No published searchable recipes yet. Publish and ingredient-index recipes to measure coverage.',notLoaded:'Loading your public catalog…',noGap:'Every known ingredient appears in at least two searchable recipes.',unmapped:'Unindexed community recipes do not participate in ingredient matching.',focus:'Editorial action: prioritize reviewed recipes featuring rarely used ingredients and improve cuisine balance.',report:'Recipe search audit',usage:'Public recipes using ingredient',zero:'No exact recipes',count:'available',n:'None',pass:'Ready',almostLabel:'Almost',open:'Content Studio'},
 it:{title:'Laboratorio di copertura',intro:'Misura quanto il catalogo pubblicato è utile con combinazioni comuni di ingredienti. Usa le lacune per pianificare nuove ricette verificate.',catalog:'Ricette pubbliche',searchable:'Indicizzate per ingredienti',notIndexed:'Ricette approvate da indicizzare',vocabulary:'Ingredienti conosciuti',neverUsed:'Ingredienti mai usati',rare:'Ingredienti presenti in una sola ricetta',ready:'Pronte da cucinare',almost:'Fino a due ingredienti mancanti',samples:'Dispense di esempio',ingredients:'Copertura ingredienti',cuisines:'Copertura per cucina',top:'Ingredienti più utilizzati',gaps:'Ingredienti poco rappresentati',recipeCount:'Ricette',scenario:'Ingredienti di esempio',coverage:'Risultato',note:'Le dispense sono esempi, non informazioni sui veri utenti. La ricerca confronta tipi di ingredienti, non quantità, sicurezza o allergeni. Una ricetta è pronta solo se tutti gli ingredienti richiesti risultano selezionati.',csv:'Esporta CSV',empty:'Non ci sono ancora ricette pubblicate indicizzate. Pubblica e indicizza per misurare la copertura.',notLoaded:'Caricamento del catalogo pubblico…',noGap:'Ogni ingrediente conosciuto appare in almeno due ricette indicizzate.',unmapped:'Le ricette della community non indicizzate non partecipano alla ricerca.',focus:'Azione editoriale: privilegia ricette verificate con ingredienti poco utilizzati e riequilibra le cucine.',report:'Controllo ricerca ricette',usage:'Ricette pubbliche con ingrediente',zero:'Nessuna ricetta esatta',count:'disponibili',n:'Nessuna',pass:'Pronte',almostLabel:'Quasi',open:'Studio contenuti'}
};
const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const coverageText=(lang,k)=>(text[lang]||text.en)[k]||text.en[k]||k;
export const PANTRY_BASKETS=[
 {id:'weeknight',names:{en:'Weeknight basics',it:'Ingredienti di tutti i giorni'},ids:['chicken','rice','onion','garlic','olive_oil','tomato','salt']},
 {id:'simple-vegetarian',names:{en:'Vegetarian pantry',it:'Dispensa vegetariana'},ids:['chickpeas','tomato','onion','garlic','olive_oil','lemon','salt']},
 {id:'pasta',names:{en:'Pasta evening',it:'Serata pasta'},ids:['pasta','tomato','basil','olive_oil','garlic','salt']},
 {id:'potatoes',names:{en:'Potato supper',it:'Cena con patate'},ids:['potato','garlic','olive_oil','lemon','salt','eggs']},
 {id:'grain',names:{en:'Rice and lentils',it:'Riso e lenticchie'},ids:['rice','lentils','onion','carrot','olive_oil','water','cumin']},
 {id:'fresh',names:{en:'Fresh vegetables',it:'Verdure fresche'},ids:['tomato','cucumber','lettuce','parsley','mint','lemon','olive_oil']},
 {id:'bread',names:{en:'Baking essentials',it:'Ingredienti per il forno'},ids:['flour','yeast','water','salt','olive_oil','zaatar']},
 {id:'mediterranean',names:{en:'Mediterranean staples',it:'Ingredienti mediterranei'},ids:['tomato','cucumber','feta','olives','onion','olive_oil']},
 {id:'asian',names:{en:'Quick Asian-inspired',it:'Cucina asiatica veloce'},ids:['rice','tofu','soy_sauce','onion','carrot','peas']},
 {id:'breakfast',names:{en:'Breakfast ingredients',it:'Ingredienti per colazione'},ids:['eggs','yogurt','flour','milk','bread','butter','salt']}
];
export function analyzeCoverage(catalog=[],vocabulary=[],baskets=PANTRY_BASKETS){
 const publicRecipes=Array.isArray(catalog)?catalog:[];
 const searchable=publicRecipes.filter(r=>r&&r.searchable!==false&&Array.isArray(r.ingredients)&&r.ingredients.length>=2&&r.ingredients.every(x=>typeof x?.id==='string'&&x.id));
 const unindexed=publicRecipes.filter(r=>r?.source==='community'&&r.searchable===false).length;
 const counts=new Map();const cuisineCounts=new Map();
 for(const r of searchable){
   cuisineCounts.set(r.cuisine||'Other',(cuisineCounts.get(r.cuisine||'Other')||0)+1);
   for(const id of new Set(r.ingredients.map(x=>x.id))){counts.set(id,(counts.get(id)||0)+1);}
 }
 const known=Array.isArray(vocabulary)?vocabulary:[];
 const vocabularyIds=new Set(known.map(i=>i.id));
 const coverage=known.filter(i=>i?.id).map(i=>({id:i.id,name:i.name||{en:i.id,it:i.id},count:counts.get(i.id)||0}));
 coverage.sort((a,b)=>a.count-b.count||String(a.name.en).localeCompare(String(b.name.en)));
 const basketsResult=baskets.map(b=>{
   const selected=new Set(b.ids.filter(id=>vocabularyIds.has(id)));
   let ready=0,almost=0;
   for(const r of searchable){const missing=r.ingredients.filter(i=>!selected.has(i.id)).length;
     if(missing===0)ready++;else if(missing<=2)almost++;
   }
   return {id:b.id,names:b.names,ids:[...selected],ready,almost};
 });
 return {published:publicRecipes.length,searchable:searchable.length,unindexed,
   ingredientTotal:known.length,neverUsed:coverage.filter(x=>x.count===0).length,rare:coverage.filter(x=>x.count===1).length,
   coverage, cuisines:[...cuisineCounts].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name)),
   baskets:basketsResult};
}
export function coverageCsv(report){
 const safe=value=>{const s=String(value??'');return /^[\s]*[=+@-]/.test(s)?"'"+s:s};
 const quote=x=>'"'+safe(x).replaceAll('"','""')+'"';
 const rows=[['kind','id','name_en','name_it','count','ready','almost'],
 ...report.coverage.map(r=>['ingredient',r.id,r.name.en,r.name.it,r.count,'','']),
 ...report.cuisines.map(r=>['cuisine',r.name,r.name,r.name,r.count,'','']),
 ...report.baskets.map(r=>['sample_pantry',r.id,r.names.en,r.names.it,'',r.ready,r.almost])];
 return '\ufeff'+rows.map(row=>row.map(quote).join(',')).join('\r\n');
}
export function coveragePageHtml({report,lang='en',link}){
 const tx=k=>coverageText(lang,k),name=x=>String(x?.[lang]||x?.en||'');
 const pill=(n)=>`<span class="pill">${Number(n)}</span>`;
 const bar=(n,max)=>`<div class="v17-bar" aria-hidden="true"><span style="width:${max>0?Math.round(n/max*100):0}%"></span></div>`;
 const max=Math.max(...report.coverage.map(x=>x.count),1);
 const gaps=report.coverage.filter(x=>x.count<=1).slice(0,16),top=[...report.coverage].sort((a,b)=>b.count-a.count).slice(0,12);
 const summary=[['catalog',report.published],['searchable',report.searchable],['notIndexed',report.unindexed],['vocabulary',report.ingredientTotal],['neverUsed',report.neverUsed],['rare',report.rare]];
 return `<div class="v17-coverage">
 <div class="v17-summary">${summary.map(([k,v])=>`<div><small>${html(tx(k))}</small><strong>${v}</strong></div>`).join('')}</div>
 <div class="v3-actions">${link('admin-launch',tx('open'),'btn btn-outline')}<button type="button" class="btn btn-primary" data-action="v17-export">${html(tx('csv'))}</button></div>
 ${report.searchable===0?`<div class="notice" role="status">${html(tx('empty'))}</div>`:''}
 <section class="v17-section"><h2>${html(tx('samples'))}</h2><p class="muted small">${html(tx('note'))}</p><div class="v17-baskets">${report.baskets.map(b=>`<article class="v17-basket"><h3>${html(name(b.names))}</h3><p class="muted small">${html(b.ids.join(' · ').replaceAll('_',' '))}</p><div class="v17-totals"><span>${html(tx('pass'))}: <strong>${b.ready}</strong></span><span>${html(tx('almostLabel'))}: <strong>${b.almost}</strong></span></div></article>`).join('')}</div></section>
 <section class="v17-section"><h2>${html(tx('gaps'))}</h2><p class="muted small">${html(tx('focus'))}</p>${gaps.length?`<div class="v17-bars">${gaps.map(r=>`<div class="v17-bar-row"><span>${html(name(r.name))}</span>${bar(r.count,max)}${pill(r.count)}</div>`).join('')}</div>`:`<p class="muted">${html(tx('noGap'))}</p>`}</section>
 <div class="v17-columns"><section class="v17-section"><h2>${html(tx('top'))}</h2><div class="v17-bars">${top.map(r=>`<div class="v17-bar-row"><span>${html(name(r.name))}</span>${bar(r.count,max)}${pill(r.count)}</div>`).join('')}</div></section><section class="v17-section"><h2>${html(tx('cuisines'))}</h2><div class="v17-bars">${report.cuisines.map(r=>`<div class="v17-bar-row"><span>${html(r.name)}</span>${bar(r.count,Math.max(report.searchable,1))}${pill(r.count)}</div>`).join('')}</div></section></div>
 <p class="notice small">${html(tx('unmapped'))} ${html(tx('note'))}</p></div>`;
}
