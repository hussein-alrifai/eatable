import { t } from './i18n.js';
import {parseRecipeImport,importPageHtml,importText} from './bulk-import.js';
import {getCuratedReviews,upsertCuratedReview} from './quality-cloud.js';
import {qualityText,reviewFields,qualityDashboardHtml,qualityReviewHtml,qualityCsv} from './quality.js';
import {getCuratedCatalog,getIngredientVocabulary,getCommunityIndexes,saveCommunityIndex,addIngredient,getAdminCuratedCatalog,saveCuratedRecipe,getAdminCuratedMedia,saveAdminCuratedMedia,insertCuratedDraft} from './catalog-cloud.js';
import {editorText,ingredientRow,stepRow,curatedListHtml,curatedEditorHtml,serializeCurated,validateCurated} from './curated-editor.js';
import {curatedFromDb,communityFromDb,communityKey,mergeVocabulary,suggestCanonicalIngredient} from './discovery.js';
import {getPublished,getMySubmissions,getAdminSubmissions,getIsAdmin,submitCommunityRecipe,reviseCommunityRecipe,moderateRecipe} from './community-cloud.js';
import {uploadPrivatePhoto,removePrivatePhoto,getPrivatePhotoUrl,getPublicPhotoUrl,publishPhoto,removePublicPhoto,validatePhoto} from './photo-cloud.js';
import {isCloudConfigured,initializeCloud,signIn,signUp,signOut,requestPasswordReset,updatePassword,readFavorites,addFavorite,removeFavorite} from './cloud.js';
import { recipes,ingredients,ingredientById,cuisines,getRecipe,getCuisine,ingredientMatches,matchRecipes,substitutionFor,normalize } from './recipes.js';
import {requiredMissing,shoppingLinesForRecipe,canonicalIngredientId} from './kitchen.js';
import {cookText,clampCookingStep,readCookingProgress,writeCookingProgress,clearCookingProgress} from './cooking-mode.js';
import {fetchKitchen,insertPantry,deletePantry,insertShopping,updateShoppingChecked,deleteShopping,moveToPantry} from './kitchen-cloud.js';

const app=document.getElementById('app');
const load=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return Array.isArray(v)?v:fallback}catch{return fallback}};
const readShowSubstitutions=()=>{try{return localStorage.getItem('eatable:show-substitutions')!=='false'}catch{return true}};
const state={selected:load('eatable:ingredients',[]).filter(id=>ingredientById[id]),favorites:load('eatable:favorites',[]),user:null,cloudStatus:isCloudConfigured?'connecting':'demo',cloudError:'',passwordRecovery:false,authView:'signin',authBusy:false,authRevision:0,menuOpen:false,filters:{diet:'all',cuisine:'all',maxTime:''},exploreQuery:'',exploreCuisine:'all',servings:4,checked:new Set(),cookingStep:null,cookingIngredientsOpen:false,cookingTextLarge:false,publicRecipes:[],catalog:isCloudConfigured?[]:[...recipes],communityIndexes:[],catalogLoaded:false,catalogError:'',mySubmissions:[],adminSubmissions:[],isAdmin:false,communityBusy:false,communityError:'',communityLoaded:false,photoUrls:{},curatedAdminRows:[],curatedAdminLoaded:false,curatedBusy:false,curatedImagePreviewUrl:null,qualityRows:[],qualityLoaded:false,qualityError:'',qualityBusy:false,qualityFilter:'needs-review',bulkRaw:'',bulkRows:[],bulkSelected:new Set(),bulkBusy:false,bulkResults:null,showSubstitutions:readShowSubstitutions(),pantry:[],shopping:[],kitchenStatus:'idle',kitchenError:'',kitchenBusy:false,kitchenRevision:0};
const save=()=>{try{localStorage.setItem('eatable:ingredients',JSON.stringify(state.selected));localStorage.setItem('eatable:favorites',JSON.stringify(state.user?load('eatable:favorites',[]):state.favorites))}catch{}};
const accountText={
  en:{account:'Account',signIn:'Sign in',signUp:'Create account',signOut:'Sign out',email:'Email',password:'Password',displayName:'Display name',forgot:'Forgot password?',reset:'Reset password',sendReset:'Send reset email',changePassword:'Choose a new password',updatePassword:'Update password',checkEmail:'Check your email for the confirmation or reset link.',loginSuccess:'Signed in successfully.',logoutSuccess:'Signed out.',cloudSaveNote:'Sign in to save recipes to your account across devices.',demoSaveNote:'Demo mode: favorites are stored in this browser only.',cloudConnecting:'Connecting to Supabase…',cloudNotConfigured:'Your Supabase connection has not been configured yet. Follow the setup guide in the ZIP.',cloudFailed:'Could not connect to Supabase. Check the project URL, publishable key and database setup.',signInToSave:'Sign in to save recipes across devices.',myAccount:'My account',signedInAs:'Signed in as',authIntro:'Save your favorite dishes and access them on different devices.',goToCookbook:'Open my cookbook',pwMin:'Use at least 8 characters for your password.',submit:'Continue'},
  it:{account:'Account',signIn:'Accedi',signUp:'Crea un account',signOut:'Esci',email:'Email',password:'Password',displayName:'Nome pubblico',forgot:'Password dimenticata?',reset:'Reimposta password',sendReset:'Invia email di recupero',changePassword:'Scegli una nuova password',updatePassword:'Aggiorna password',checkEmail:'Controlla la tua email per il link di conferma o recupero.',loginSuccess:'Accesso effettuato.',logoutSuccess:'Disconnesso.',cloudSaveNote:'Accedi per salvare ricette nel tuo account su tutti i dispositivi.',demoSaveNote:'Modalità demo: le ricette preferite restano solo in questo browser.',cloudConnecting:'Connessione a Supabase…',cloudNotConfigured:'La connessione a Supabase non è ancora configurata. Segui la guida inclusa nello ZIP.',cloudFailed:'Impossibile connettersi a Supabase. Controlla URL del progetto, chiave pubblica e database.',signInToSave:'Accedi per salvare le ricette su tutti i dispositivi.',myAccount:'Il mio account',signedInAs:'Accesso come',authIntro:'Salva i tuoi piatti preferiti e ritrovali su tutti i dispositivi.',goToCookbook:'Apri il mio ricettario',pwMin:'Usa una password di almeno 8 caratteri.',submit:'Continua'}
};
const matchCopy={
 en:{coverage:'ingredients available',missing:'Missing',swaps:'Possible swaps (not equivalent)',swapNotice:'Substitutions may change flavor and cooking results. Check dietary needs and allergens yourself.',matchNote:'Matches count ingredient types, not quantities. Optional pantry staples are not assumed.',showSwaps:'Show possible ingredient swaps',complete:'All listed ingredients available',needsMore:'Add ingredients to narrow your matches'},
 it:{coverage:'ingredienti disponibili',missing:'Mancano',swaps:'Possibili alternative (non equivalenti)',swapNotice:'Le sostituzioni possono cambiare il sapore e la cottura. Controlla personalmente dieta e allergeni.',matchNote:'La ricerca conta i tipi di ingredienti, non le quantità. Gli ingredienti di base non vengono dati per scontati.',showSwaps:'Mostra possibili alternative',complete:'Tutti gli ingredienti elencati sono disponibili',needsMore:'Aggiungi ingredienti per affinare la ricerca'}
};
const kitchenCopy={
 en:{pantry:'My Pantry',shopping:'Shopping List',favorites:'Saved recipes',myKitchen:'My Kitchen',yourPantry:'Ingredients you have',yourShopping:'Items to buy',pantryNote:'Presence only: quantities, freshness, and allergens are not verified.',shoppingNote:'Quantities come from the recipe and are suggestions; existing shopping items are never overwritten.',addIngredient:'Add ingredient',addToPantry:'Add to pantry',addToShopping:'Add to list',searchIngredient:'Type an ingredient name…',emptyPantry:'Your pantry is empty. Add what you already have.',emptyShopping:'Your shopping list is empty.',cookWith:'Find recipes with my pantry',noQuantities:'Pantry matching checks ingredients, not how much is available.',myFavorites:'Saved recipes',fromRecipe:'Add missing ingredients to shopping list',needLogin:'Sign in to sync your pantry and shopping list across devices.',notIndexed:'This community recipe needs reviewed ingredient mappings before a shopping list can be generated.',allPresent:'Every listed ingredient is already in your pantry.',added:'Saved to your account.',removed:'Removed.',listAdded:'Missing ingredients added. Existing list items were kept.',markedBought:'Moved to your pantry.',markBought:'Bought → pantry',remove:'Remove',check:'Check item',clearCheck:'Uncheck item',loading:'Loading your kitchen…',failed:'Kitchen could not be loaded. Run SQL migration 08 and check Supabase permissions.',shoppingHeading:'Organize your shopping',shopList:'Open shopping list',pantryHeading:'Your ingredients',shoppingEmptyHint:'Open a recipe and add missing ingredients, or select an ingredient here.',shopAmounts:'Amounts are suggested for the selected recipe servings. Combining different recipes requires manual review.',noRecipeItems:'No missing mapped ingredients for this recipe.',unknownIngredient:'Choose an ingredient from the suggestions.',alreadyHave:'Already in your pantry.',alreadyListed:'Already in your shopping list.',synced:'Saved privately in Supabase.'},
 it:{pantry:'La mia dispensa',shopping:'Lista della spesa',favorites:'Ricette salvate',myKitchen:'La mia cucina',yourPantry:'Ingredienti disponibili',yourShopping:'Prodotti da acquistare',pantryNote:'Registriamo solo la presenza: quantità, freschezza e allergeni non sono verificati.',shoppingNote:'Le quantità della ricetta sono indicative; gli elementi già presenti non vengono sovrascritti.',addIngredient:'Aggiungi ingrediente',addToPantry:'Aggiungi alla dispensa',addToShopping:'Aggiungi alla lista',searchIngredient:'Scrivi un ingrediente…',emptyPantry:'La dispensa è vuota. Aggiungi gli ingredienti che hai.',emptyShopping:'La tua lista della spesa è vuota.',cookWith:'Trova ricette con la dispensa',noQuantities:'La ricerca considera gli ingredienti, non le quantità disponibili.',myFavorites:'Ricette salvate',fromRecipe:'Aggiungi gli ingredienti mancanti alla lista',needLogin:'Accedi per sincronizzare dispensa e lista della spesa su tutti i dispositivi.',notIndexed:'Gli ingredienti della ricetta della community devono essere verificati prima di creare la lista.',allPresent:'Tutti gli ingredienti elencati sono già nella dispensa.',added:'Salvato nel tuo account.',removed:'Rimosso.',listAdded:'Ingredienti mancanti aggiunti. Gli articoli già presenti sono stati mantenuti.',markedBought:'Spostato nella dispensa.',markBought:'Acquistato → dispensa',remove:'Rimuovi',check:'Seleziona articolo',clearCheck:'Deseleziona articolo',loading:'Caricamento cucina…',failed:'Impossibile caricare la cucina. Esegui la migrazione SQL 08 e verifica i permessi.',shoppingHeading:'Organizza la spesa',shopList:'Apri lista della spesa',pantryHeading:'I tuoi ingredienti',shoppingEmptyHint:'Apri una ricetta per aggiungere gli ingredienti mancanti oppure seleziona un ingrediente qui.',shopAmounts:'Le quantità sono indicative per le porzioni selezionate. Verifica le quantità se aggiungi ricette diverse.',noRecipeItems:'Nessun ingrediente mancante mappato per questa ricetta.',unknownIngredient:'Scegli un ingrediente dai suggerimenti.',alreadyHave:'Ingrediente già in dispensa.',alreadyListed:'Ingrediente già in lista.',synced:'Salvato privatamente su Supabase.'}
};
const kt=key=>kitchenCopy[language()]?.[key]||kitchenCopy.en[key]||key;
const ckt=key=>cookText(language(),key);
const mt=key=>matchCopy[language()]?.[key]||matchCopy.en[key]||key;
const at=key=>accountText[language()]?.[key]||accountText.en[key]||key;
const qt=key=>qualityText(language(),key);
const bt=key=>importText(language(),key);
const saveNote=()=>at(isCloudConfigured?'cloudSaveNote':'demoSaveNote');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const language=()=>window.location.pathname.startsWith('/it')?'it':'en';
const tr=key=>t(language(),key);
const path=(route='')=>`/${language()}${route?'/'+route.replace(/^\//,''):''}`;
const link=(route='',text='',className='')=>`<a class="${className}" href="${path(route)}" data-link>${text}</a>`;
const label=(obj)=>esc(typeof obj==='string'?obj:obj?.[language()]??obj?.en??'');
const cssTheme=r=>['cream','green','gold','ochre','spice','tomato'].includes(r.theme)?r.theme:'cream';
const getAnyRecipe=id=>state.catalog.find(r=>r.id===id)||(!isCloudConfigured&&!state.catalogLoaded?getRecipe(id):null);
const foodImage=(r,type='card')=>{
  if(r.public_photo_path){const url=getPublicPhotoUrl(r.public_photo_path);return `<img class="catalog-photo ${type==='detail'?'detail-photo':''}" src="${esc(url)}" alt="${label(r.name)}" loading="lazy"/>`;}
  return type==='detail'?`<div class="detail-illustration recipe-art ${cssTheme(r)}" role="img" aria-label="${label(r.name)} illustration"><span>${esc(r.emoji)}</span></div>`:`<div class="recipe-art ${cssTheme(r)}" role="img" aria-label="${label(r.name)} illustration"><span class="emoji">${esc(r.emoji)}</span></div>`;
};
const dishLink=r=>r.source==='community'?path(`community/${r.communityId}`):path(`recipes/${r.id}`);
const dietBadge=r=>r.diet==='vegan'?`<span class="pill">${tr('vegan')}</span>`:r.diet==='vegetarian'?`<span class="pill">${tr('vegetarian')}</span>`:'';
const cuisineLabel=r=>`${getCuisine(r.cuisine)?.flag||'🌍'} ${label(getCuisine(r.cuisine)?.name||r.cuisine)}`;
function header(active){const nav=[['',tr('home'),'home'],['cook',tr('cook'),'cook'],['recipes',tr('explore'),'explore'],['lebanese',tr('lebanese'),'lebanese'],['community',tr('community'),'community']];return `<div class="topbar">${esc(tr('footer'))} &nbsp; · &nbsp; ${esc(tr('status'))}</div><header class="site-header"><div class="container nav-wrap">${link('',`<span class="logo-icon">e</span> Eatable`,'logo')}<nav class="nav-links" aria-label="Main navigation">${nav.map(([route,title,id])=>link(route,esc(title),active===id?'active':'')).join('')}</nav><div class="nav-actions"><button class="lang-switch" data-action="language" aria-label="${esc(tr('lang'))}">${language().toUpperCase()} ▾</button>${link('my-kitchen','♧','icon-button')}${link('shopping-list','🛒','icon-button')}${state.isAdmin?link('admin','Admin','account-link'):''}${link('account',state.user?'● '+esc(state.user.email||at('myAccount')):esc(at('signIn')),'account-link')}<button class="icon-button mobile-menu-button" data-action="menu" aria-label="${tr('menu')}" aria-expanded="${state.menuOpen}">☰</button></div></div>${state.menuOpen?`<nav class="mobile-panel" aria-label="Mobile menu">${nav.map(([route,title])=>link(route,esc(title))).join('')}${link('my-kitchen',esc(kt('myKitchen')))}${link('shopping-list',esc(kt('shopping')))}${link('submit',ct('contribute'))}${state.user?link('my-recipes',ct('my')):''}${state.isAdmin?link('admin',ct('admin'))+link('admin-index',ct('indexAdmin'))+link('admin-curated',editorText(language(),'hub'))+link('admin-quality',qt('heading'))+link('admin-import',bt('heading')):''}${link('account',esc(at('account')))}</nav>`:''}</header>`}
function footer(){return `<footer class="footer"><div class="container"><div class="footer-flex"><div>${link('',`<span class="logo-icon">e</span> Eatable`,'logo')}<p class="muted small" style="margin-top:9px">${tr('footer')}</p></div><div class="footer-links">${link('cook',tr('cook'))}${link('recipes',tr('explore'))}${link('lebanese',tr('lebanese'))}${link('community',tr('community'))}</div></div><div class="footer-bottom"><span>${tr('rights')}</span><span>${tr('powered')}</span></div></div></footer>`}
function mobileTabs(active){return `<nav class="mobile-tabs" aria-label="Mobile tabs">${[['','⌂',tr('home'),'home'],['cook','♨',tr('cook'),'cook'],['recipes','◈',tr('explore'),'explore'],['lebanese','♧',tr('lebanese'),'lebanese']].map(([route,icon,title,id])=>link(route,`<span aria-hidden="true">${icon}</span>${esc(title)}`,`mobile-tab ${active===id?'active':''}`)).join('')}</nav>`}
function shell(body,active){return `${header(active)}<main id="main">${body}</main>${footer()}${mobileTabs(active)}`}
function chips(){return `<div class="chips" aria-label="${tr('ingredients')}">${state.selected.map(id=>`<span class="chip">${label(ingredientById[id].name)} <button data-action="remove-ingredient" data-id="${id}" aria-label="Remove ${label(ingredientById[id].name)}">×</button></span>`).join('')}</div>`}
function addInput(context){const id=`input-${context}`;return `<div class="field-wrap"><input id="${id}" class="input" type="search" placeholder="${esc(tr('searchPlaceholder'))}" aria-label="${esc(tr('addIngredients'))}" data-ingredient-input="${context}" autocomplete="off" aria-autocomplete="list" aria-controls="suggestions-${context}"/><div class="suggestions hidden" id="suggestions-${context}" role="listbox"></div></div>`}
function heroInput(){return `<div class="hero-search" id="hero-input">${chips()}<div class="search-controls"><div class="search-field"><span class="search-icon">⌕</span><div style="flex:1;min-width:0">${addInput('hero')}</div></div><button class="btn btn-primary" data-action="find">${tr('findRecipes')} <span aria-hidden="true">→</span></button></div></div>`}
function card(r,info=null){
 const missing=info?.missing||[];
 const matching=info&&state.selected.length>0;
 const listed=missing.slice(0,4).map(x=>label(ingredientById[x.id]?.name||x.id));
 const missingLabel=listed.join(', ')+(missing.length>4?' …':'');
 const swaps=matching&&state.showSubstitutions?(info.substitutions||[]):[];
 const swapHtml=swaps.length?`<div class="v10-swaps"><strong>${mt('swaps')}:</strong> ${swaps.slice(0,2).map(x=>`${label(ingredientById[x.missingId]?.name||x.missingId)} → ${label(ingredientById[x.availableId]?.name||x.availableId)}`).join(' · ')}</div>`:'';
 return `<article class="recipe-card"><a href="${dishLink(r)}" data-link aria-label="${esc(r.name[language()]||r.name.en)}">${foodImage(r)}<div class="card-content"><div class="card-top"><span>${cuisineLabel(r)}</span><span>${r.diet==='vegan'?'🌱':r.diet==='vegetarian'?'🥬':''}</span></div><h3>${label(r.name)}</h3><p>${label(r.description)}</p><div class="card-meta"><span>◷ ${r.time} ${tr('minutes')}</span><span>${esc(tr('seeRecipe'))} →</span></div>${matching?`<div class="v10-coverage"><span>${info.matchCount}/${info.totalRequired} ${mt('coverage')}</span><strong>${info.matchPercent}%</strong></div><div class="v10-meter" aria-hidden="true"><span style="width:${info.matchPercent}%"></span></div><div class="missing-note">${missing.length===0?mt('complete'):`<strong>${mt('missing')}:</strong> ${missingLabel}`}</div>${swapHtml}`:''}</div></a></article>`;
}
function home(){const featured=['fattet-hummus','pasta-pomodoro','chickpea-curry','fattoush'].map(getAnyRecipe).filter(Boolean);return shell(`<section class="hero"><div class="container hero-inner"><div class="hero-copy"><div class="eyebrow">✦ ${tr('heroEyebrow')}</div><h1>${language()==='en'?'Great meals begin with <span class="accent">what you have.</span>':'Un buon piatto nasce da <span class="accent">ciò che hai.</span>'}</h1><p>${tr('heroDescription')}</p>${heroInput()}<div class="hero-tip"><span>${tr('popular')}:</span>${['chicken','rice','tomato','potato'].map(id=>`<button data-action="add-ingredient" data-id="${id}">${label(ingredientById[id].name)} +</button>`).join('')}</div></div><div class="hero-art" aria-hidden="true"><span class="art-sprig one">🌿</span><span class="art-dot"></span><div class="food-plate"><span class="food">🥙</span></div><span class="art-sprig two">🍃</span></div></div></section><section class="section"><div class="container"><div class="section-heading"><div><div class="eyebrow">${tr('why')}</div><h2>${tr('featured')}</h2><p>${tr('featuredText')}</p></div>${link('recipes',`${tr('allRecipes')} →`,'text-link')}</div><div class="grid-recipes">${featured.map(r=>card(r)).join('')}</div></div></section><section class="section alt"><div class="container feature-block"><div class="feature-art"><div class="tile-pattern"></div><div class="feature-platter" aria-hidden="true"><span>🥗</span><span>🧆</span><span>🫓</span></div></div><div class="feature-copy"><div class="eyebrow">${tr('lebaneseEyebrow')}</div><h2>${tr('lebaneseTitle')}</h2><p>${tr('lebaneseText')}</p>${link('lebanese',`${tr('exploreLebanese')} →`,'btn btn-primary')}</div></div></section><section class="section"><div class="container"><div class="section-heading"><div><div class="eyebrow">Eatable across borders</div><h2>${tr('world')}</h2><p>${tr('worldText')}</p></div></div><div class="cuisines-grid">${cuisines.filter(c=>['Lebanese','Italian','Japanese','Indian','Mexican'].includes(c.id)).map(c=>`<a class="cuisine-tile" href="${path('recipes')}?cuisine=${encodeURIComponent(c.id)}" data-link><span class="flag">${c.flag}</span><strong>${label(c.name)}</strong></a>`).join('')}</div></div></section><section class="section alt"><div class="container"><div class="community-panel"><div><div class="eyebrow" style="color:#e8c9a0">FROM HOME COOKS TO HOME COOKS</div><h2>${tr('communityTitle')}</h2><p>${tr('communityText')}</p></div>${link('community',`${tr('community')} →`,'btn')}</div></div></section>`,'home')}
function pageHero(tag,title,description){return `<section class="page-hero"><div class="container"><div class="eyebrow">${tag}</div><h1>${title}</h1><p>${description}</p></div></section>`}
function ingredientPicker(){return `<div class="selected-box"><div><strong>${tr('ingredients')}</strong><button class="plain-btn" data-action="clear">${tr('clear')}</button></div>${addInput('cook')}${state.user?`<button class="btn btn-light btn-sm space-top" data-action="use-pantry">♧ ${kt('cookWith')}</button>`:''}<div class="space-top">${state.selected.length?chips():`<p class="muted small">${tr('ingredientsEmpty')}</p>`}</div><p class="avoid">${tr('pantry')}</p></div>`}
function filterOptions(items,active){return items.map(([value,name])=>`<option value="${esc(value)}" ${String(active)===String(value)?'selected':''}>${esc(name)}</option>`).join('')}
function filters(){return `<aside class="side-panel"><h3>${tr('filters')}</h3><div class="filter-block"><label class="filter-label" for="diet-filter">${tr('diet')}</label><select class="select" id="diet-filter" data-filter="diet">${filterOptions([['all',tr('allDiets')],['vegan',tr('vegan')],['vegetarian',tr('vegetarian')]],state.filters.diet)}</select></div><div class="filter-block"><label class="filter-label" for="time-filter">${tr('time')}</label><select class="select" id="time-filter" data-filter="maxTime">${filterOptions([['',tr('anyTime')],['30',tr('under30')],['45',tr('under45')],['60',tr('under60')]],state.filters.maxTime)}</select></div><div class="filter-block"><label class="filter-label" for="cuisine-filter">${tr('cuisine')}</label><select class="select" id="cuisine-filter" data-filter="cuisine">${filterOptions([['all',tr('all')],...cuisines.map(c=>[c.id,`${c.flag} ${label(c.name)}`])],state.filters.cuisine)}</select></div><div class="v10-option"><label class="v10-check"><input type="checkbox" id="v10-swap-toggle" data-filter-substitutions ${state.showSubstitutions?'checked':''}/><span>${mt('showSwaps')}</span></label></div></aside>`}
function cook(){const all=matchRecipes(state.selected,state.filters,state.catalog.filter(r=>r.searchable!==false)),groups=state.selected.length?[{id:0,title:tr('ready'),desc:tr('readyInfo'),recipes:all.filter(r=>r.categoryScore===0)},{id:1,title:tr('almost'),desc:tr('almostInfo'),recipes:all.filter(r=>r.categoryScore===1)},{id:2,title:tr('ideas'),desc:tr('ideasInfo'),recipes:all.filter(r=>r.categoryScore===2)}]:[{id:2,title:tr('featured'),desc:tr('noIngredient'),recipes:all.slice(0,12)}];return shell(`${pageHero('Eatable · '+tr('getStarted'),tr('cookTitle'),tr('cookSubtitle'))}<div class="container search-layout"><div>${ingredientPicker()}${filters()}</div><div>${state.catalogError?`<div class="notice">${esc(ct('catalogFallback'))}: ${esc(state.catalogError)}</div>`:''}<div class="results-count">${all.length} ${tr('results')}</div><p class="v10-disclaimer">${mt('matchNote')}</p>${state.showSubstitutions&&state.selected.length?`<p class="v10-disclaimer">${mt('swapNotice')}</p>`:''}${all.length?groups.filter(group=>group.recipes.length).map(group=>`<section class="results-group"><div class="results-group-header"><div><h2>${group.title}</h2><p>${group.desc}</p></div><span class="pill">${group.recipes.length}</span></div><div class="grid-recipes">${group.recipes.map(r=>card(r,r)).join('')}</div></section>`).join(''):`<div class="empty"><h3>${tr('noResults')}</h3><p>${tr('tryAgain')}</p><button class="btn btn-outline space-top" data-action="reset-filters">${tr('reset')}</button></div>`}</div></div>`,'cook')}
function explore(){const query=normalize(state.exploreQuery);const shown=state.catalog.filter(r=>(state.exploreCuisine==='all'||state.exploreCuisine===r.cuisine)&&(!query||normalize(r.name.en+' '+r.name.it+' '+r.cuisine+' '+(r.rawIngredients||[]).join(' ')+' '+r.ingredients.map(i=>ingredientById[i.id]?.name.en+' '+ingredientById[i.id]?.name.it).join(' ')).includes(query)));return shell(`${pageHero('Eatable · '+tr('world'),tr('browseTitle'),tr('browseSubtitle'))}<div class="container section-pad"><form class="explore-bar" id="explore-form"><input class="input" id="explore-query" placeholder="${esc(tr('searchRecipes'))}" value="${esc(state.exploreQuery)}"/><select class="select" id="explore-cuisine">${filterOptions([['all',tr('all')],...cuisines.map(c=>[c.id,`${c.flag} ${label(c.name)}`])],state.exploreCuisine)}</select><button type="submit" class="btn btn-primary">⌕ ${tr('explore')}</button></form>${state.catalogError?`<div class="notice">${esc(ct('catalogFallback'))}: ${esc(state.catalogError)}</div>`:''}<p class="results-count">${shown.length} ${tr('results')}</p>${shown.length?`<div class="grid-recipes">${shown.map(r=>card(r)).join('')}</div>`:`<div class="empty">${tr('noResults')}<p>${tr('tryAgain')}</p></div>`}</div>`,'explore')}
function lebanese(){const lebaneseRecipes=state.catalog.filter(r=>r.cuisine==='Lebanese');return shell(`${pageHero(tr('lebaneseEyebrow'),tr('lebanesePageTitle'),tr('lebanesePageText'))}<div class="container section-pad"><div class="lebanese-banner"><div><div class="eyebrow" style="color:#ead7b4">${tr('cultural')}</div><h2>${tr('heritage')}</h2><p>${tr('heritageText')}</p></div><div class="cedar-art" aria-hidden="true">🌲</div></div><div class="section-heading"><div><h2>${tr('lebaneseTitle')}</h2><p>${lebaneseRecipes.length} ${tr('results')}</p></div></div><div class="grid-recipes">${lebaneseRecipes.map(r=>card(r)).join('')}</div></div>`,'lebanese')}

const communityCopy={
 en:{intro:'Share your family favorites. Each recipe is reviewed before it appears in the community.',
 contribute:'Share a recipe',my:'My submissions',admin:'Admin review',published:'From the community',empty:'No approved community recipes yet.',
 title:'Recipe title (English)',titleIt:'Recipe title (Italian, optional)',description:'Description (English)',descriptionIt:'Description (Italian, optional)',origin:'Cuisine / country',category:'Category',minutes:'Total cooking time (minutes)',servings:'Servings',ingredients:'Ingredients — one per line, including amounts',steps:'Preparation steps — one per line',send:'Submit for approval',pending:'Pending review',approved:'Approved',changes_requested:'Changes requested',rejected:'Rejected',note:'Moderator note',signIn:'Sign in to submit a recipe.',success:'Recipe submitted for review. It is not yet public.',noMine:'You have not submitted a recipe yet.',queue:'Submission review queue',none:'There are no submissions to review.',approve:'Approve and publish',request:'Request changes',reject:'Reject',reviewNote:'Review note (optional; explain changes or rejection)',reviewed:'Moderation decision saved.',preview:'Recipe preview',missing:'Add at least two ingredients and two preparation steps. Enter each on a separate line.',loading:'Loading community recipes…',failed:'Community data could not be loaded. Check that SQL migration 02 was run.',photo:'Dish photo (optional)',photoHelp:'JPEG, PNG or WebP, maximum 5 MB. Only you and the admin can see it until approval.',revise:'Edit and resubmit',resubmit:'Resubmit for review',editing:'Revise your recipe',editIntro:'Apply the moderator’s feedback and send the corrected recipe for review.',photoKeep:'Current image (leave upload empty to keep it)',removePhoto:'Remove existing photo',notEditable:'Only recipes marked Changes requested can be revised.',photoPending:'Photo visible to you and the admin only.'},
 it:{intro:'Condividi le ricette di famiglia. Ogni ricetta viene esaminata prima della pubblicazione.',
 contribute:'Condividi una ricetta',my:'Le mie proposte',admin:'Revisione admin',published:'Dalla community',empty:'Ancora nessuna ricetta approvata.',
 title:'Nome della ricetta (inglese)',titleIt:'Nome della ricetta (italiano, facoltativo)',description:'Descrizione (inglese)',descriptionIt:'Descrizione (italiano, facoltativa)',origin:'Cucina / paese',category:'Categoria',minutes:'Tempo totale (minuti)',servings:'Porzioni',ingredients:'Ingredienti — uno per riga con quantità',steps:'Preparazione — un passaggio per riga',send:'Invia per approvazione',pending:'In attesa',approved:'Approvata',changes_requested:'Modifiche richieste',rejected:'Rifiutata',note:'Nota del moderatore',signIn:'Accedi per proporre una ricetta.',success:'Ricetta inviata per approvazione. Non è ancora pubblica.',noMine:'Non hai ancora inviato ricette.',queue:'Coda di revisione',none:'Non ci sono proposte da esaminare.',approve:'Approva e pubblica',request:'Richiedi modifiche',reject:'Rifiuta',reviewNote:'Nota di revisione (facoltativa; spiega le modifiche o il rifiuto)',reviewed:'Decisione di moderazione salvata.',preview:'Anteprima ricetta',missing:'Inserisci almeno due ingredienti e due passaggi, uno per riga.',loading:'Caricamento ricette della community…',failed:'Impossibile caricare la community. Controlla che la migrazione SQL 02 sia stata eseguita.',photo:'Foto del piatto (facoltativa)',photoHelp:'JPEG, PNG o WebP, massimo 5 MB. Solo tu e l’amministratore potete vederla fino all’approvazione.',revise:'Modifica e invia di nuovo',resubmit:'Reinvia per revisione',editing:'Correggi la tua ricetta',editIntro:'Applica i commenti del moderatore e invia nuovamente la ricetta.',photoKeep:'Foto attuale (lascia vuoto per conservarla)',removePhoto:'Rimuovi la foto attuale',notEditable:'Puoi correggere solo le ricette con stato Modifiche richieste.',photoPending:'Foto visibile solo a te e all’amministratore.'}}
const indexCopy={
 en:{communityRecipe:'Community recipe',indexAdmin:'Ingredient indexing',indexTitle:'Recipe search indexing',indexIntro:'Map every required ingredient to the canonical ingredient vocabulary. A recipe joins ingredient search only after you save and review all lines.',indexed:'Indexed for ingredient search',needsIndex:'Needs ingredient mapping',editIndex:'Review mapping',noApproved:'No approved community recipes yet.',line:'Submitted ingredient',canonical:'Standardized ingredient',selectIngredient:'Select ingredient…',cuisine:'Cuisine',diet:'Dietary category',unknown:'Not verified',nonVegetarian:'Not vegetarian / not vegan',vegetarian:'Vegetarian',vegan:'Vegan',save:'Save approved search index',back:'Back to indexing',addIngredient:'Add ingredient to vocabulary',newId:'Identifier (e.g. pomegranate_molasses)',newEnglish:'English name',newItalian:'Italian name',add:'Add ingredient',missing:'Map every ingredient line before saving.',success:'Search indexing saved. The recipe can now be found with its ingredients.',vocabAdded:'Ingredient added to the shared vocabulary.',catalogFallback:'Database catalog could not be loaded; demo recipes are shown instead',unmappedNote:'Suggested matches are not approved automatically. Confirm every ingredient and verify the dietary label.',publishedCount:'Approved community recipes',indexedCount:'Indexed recipes'},
 it:{communityRecipe:'Ricetta della community',indexAdmin:'Indicizzazione ingredienti',indexTitle:'Indicizzazione per la ricerca',indexIntro:'Associa ogni ingrediente obbligatorio al vocabolario condiviso. La ricetta entra nella ricerca per ingredienti solo dopo la revisione di tutte le righe.',indexed:'Indicizzata per la ricerca',needsIndex:'Ingredienti da associare',editIndex:'Verifica associazioni',noApproved:'Non ci sono ancora ricette approvate.',line:'Ingrediente inserito',canonical:'Ingrediente standard',selectIngredient:'Seleziona ingrediente…',cuisine:'Cucina',diet:'Categoria alimentare',unknown:'Non verificata',nonVegetarian:'Non vegetariana / non vegana',vegetarian:'Vegetariana',vegan:'Vegana',save:'Salva indicizzazione',back:'Torna alle ricette',addIngredient:'Aggiungi ingrediente al vocabolario',newId:'Identificatore (es. melassa_melograno)',newEnglish:'Nome inglese',newItalian:'Nome italiano',add:'Aggiungi ingrediente',missing:'Associa ogni ingrediente prima di salvare.',success:'Indicizzazione salvata. La ricetta appare nella ricerca per ingredienti.',vocabAdded:'Ingrediente aggiunto al vocabolario.',catalogFallback:'Catalogo database non disponibile; vengono mostrate le ricette dimostrative',unmappedNote:'I suggerimenti non sono approvati automaticamente. Verifica ogni ingrediente e la classificazione alimentare.',publishedCount:'Ricette approvate',indexedCount:'Ricette indicizzate'}
};
const itx=k=>indexCopy[language()]?.[k]||indexCopy.en[k]||k;
const ct=k=>communityCopy[language()]?.[k]||communityCopy.en[k]||indexCopy[language()]?.[k]||indexCopy.en[k]||k;
const prettyStatus=s=>ct(s)||s;
const submittedTitle=r=>esc(language()==='it'&&r.title_it?r.title_it:r.title_en);
const submittedDescription=r=>esc(language()==='it'&&r.description_it?r.description_it:r.description_en);
const lines=list=>Array.isArray(list)?list.map(x=>String(x)):[];
const photoMarkup=(r,cls='v4-photo')=>{const url=r.public_photo_path?getPublicPhotoUrl(r.public_photo_path):state.photoUrls[r.id];return url?`<img class="${cls}" src="${esc(url)}" alt="${submittedTitle(r)}" loading="lazy"/>`:`<span class="v3-dish" aria-hidden="true">🍲</span>`};
function community(){const featured=state.publicRecipes.slice(0,18);return shell(`${pageHero('Eatable · '+tr('community'),tr('communityTitle'),ct('intro'))}<div class="container section-pad"><div class="v3-actions">${link('submit',ct('contribute'),'btn btn-primary')}${state.user?link('my-recipes',ct('my'),'btn btn-outline'):''}${state.isAdmin?link('admin',ct('admin'),'btn btn-outline')+link('admin-index',ct('indexAdmin'),'btn btn-outline'):''}</div><h2>${ct('published')}</h2>${state.communityError?`<div class="notice">${esc(state.communityError)}</div>`:''}${!state.communityLoaded&&isCloudConfigured?`<p>${ct('loading')}</p>`:featured.length?`<div class="v3-grid">${featured.map(r=>`<a class="v3-card" data-link href="${path('community/'+r.id)}">${photoMarkup(r)}<small>${esc(r.origin)} · ${r.prep_minutes} ${tr('minutes')}</small><h3>${submittedTitle(r)}</h3><p>${submittedDescription(r)}</p><strong>${tr('seeRecipe')} →</strong></a>`).join('')}</div>`:`<div class="empty"><h3>${ct('empty')}</h3></div>`}</div>`,'community')}
function communityDetail(r){if(!r)return shell(`${pageHero('Eatable','404','Recipe unavailable')}${link('community',tr('community'),'btn btn-primary')}`,'community');return shell(`<div class="container detail-wrap"><div class="breadcrumb">${link('community',tr('community'))} / ${submittedTitle(r)}</div><div class="v3-detail">${photoMarkup(r)}<div><span class="pill">${esc(r.origin)}</span><h1>${submittedTitle(r)}</h1><p>${submittedDescription(r)}</p><p class="muted">${r.prep_minutes} ${tr('minutes')} · ${r.servings} ${tr('servings')}</p></div></div><div class="recipe-body"><aside class="ingredient-panel"><h2>${tr('requiredIngredients')}</h2><ul class="ingredient-list">${lines(r.ingredients).map(v=>`<li>${esc(v)}</li>`).join('')}</ul></aside><div class="instructions"><h2>${tr('steps')}</h2>${lines(r.steps).map((v,i)=>`<div class="instruction-step"><div class="number-circle">${i+1}</div><p>${esc(v)}</p></div>`).join('')}</div></div></div>`,'community')}
function submitPage(editId=null){
 const guest=!state.user;
 const recipe=editId?state.mySubmissions.find(r=>r.id===editId&&r.author_id===state.user?.id):null;
 const notEditable=Boolean(editId)&&(!recipe||recipe.status!=='changes_requested');
 const val=(key)=>esc(recipe?.[key]??'');
 const option=(key,value)=>`<option ${recipe?.[key]===value?'selected':''}>${esc(value)}</option>`;
 return shell(`${pageHero('Eatable · '+tr('community'),editId?ct('editing'):ct('contribute'),editId?ct('editIntro'):ct('intro'))}<div class="container section-pad">${guest?`<div class="empty"><h3>${ct('signIn')}</h3>${link('account',at('signIn'),'btn btn-primary space-top')}</div>`:notEditable?`<div class="empty"><h3>${ct('notEditable')}</h3>${link('my-recipes',ct('my'),'btn btn-outline space-top')}</div>`:`<form id="community-form" ${editId?`data-edit-id="${esc(editId)}"`:''} class="v3-form">
 <label>${ct('title')}<input class="input" name="title_en" required minlength="3" maxlength="120" value="${val('title_en')}"/></label>
 <label>${ct('titleIt')}<input class="input" name="title_it" maxlength="120" value="${val('title_it')}"/></label>
 <label>${ct('description')}<textarea class="input" name="description_en" required minlength="10" maxlength="1200" rows="3">${val('description_en')}</textarea></label>
 <label>${ct('descriptionIt')}<textarea class="input" name="description_it" maxlength="1200" rows="2">${val('description_it')}</textarea></label>
 <div class="v3-two"><label>${ct('origin')}<input class="input" name="origin" required minlength="2" maxlength="80" placeholder="Lebanese, Italian…" value="${val('origin')}"/></label><label>${ct('category')}<select class="input" name="category">${['Main dish','Mezze / starter','Dessert','Bread','Drink','Other'].map(x=>option('category',x)).join('')}</select></label></div>
 <div class="v3-two"><label>${ct('minutes')}<input class="input" name="prep_minutes" required type="number" min="1" max="720" value="${recipe?.prep_minutes??30}"/></label><label>${ct('servings')}<input class="input" name="servings" required type="number" min="1" max="30" value="${recipe?.servings??4}"/></label></div>
 <label>${ct('ingredients')}<textarea class="input" name="ingredients" required rows="7" placeholder="200 g chickpeas&#10;2 tbsp olive oil&#10;1 lemon">${esc(lines(recipe?.ingredients).join('\n'))}</textarea></label>
 <label>${ct('steps')}<textarea class="input" name="steps" required rows="7" placeholder="Wash the ingredients.&#10;Prepare the sauce.&#10;Serve warm.">${esc(lines(recipe?.steps).join('\n'))}</textarea></label>
 ${recipe?.photo_path?`<div class="v4-current-photo"><strong>${ct('photoKeep')}</strong>${photoMarkup(recipe)}<label class="v4-inline"><input type="checkbox" name="remove_photo"/> ${ct('removePhoto')}</label></div>`:''}
 <label>${ct('photo')}<input class="input" name="photo" type="file" accept="image/jpeg,image/png,image/webp"/></label>
 <p class="muted small">${ct('photoHelp')}</p>
 <button type="submit" class="btn btn-primary" ${state.communityBusy?'disabled':''}>${editId?ct('resubmit'):ct('send')}</button>
 </form>`}</div>`,'community')
}
function mySubmissions(){return shell(`${pageHero('Eatable',ct('my'),ct('intro'))}<div class="container section-pad">${!state.user?link('account',at('signIn'),'btn btn-primary'):state.mySubmissions.length?`<div class="v3-list">${state.mySubmissions.map(r=>`<article class="v3-entry"><div class="inline-row"><h3>${submittedTitle(r)}</h3><span class="pill">${esc(prettyStatus(r.status))}</span></div><p>${submittedDescription(r)}</p><p class="muted small">${esc(r.origin)} · ${new Date(r.created_at).toLocaleDateString(language())}</p>${r.photo_path?`<div class="v4-preview">${photoMarkup(r)}<p class="muted small">${ct('photoPending')}</p></div>`:''}${r.moderation_note?`<p><strong>${ct('note')}:</strong> ${esc(r.moderation_note)}</p>`:''}${r.status==='changes_requested'?link('edit/'+r.id,ct('revise'),'btn btn-primary'):''}</article>`).join('')}</div>`:`<div class="empty"><h3>${ct('noMine')}</h3>${link('submit',ct('contribute'),'btn btn-primary space-top')}</div>`}</div>`,'community')}
function adminPage(){if(!state.isAdmin)return shell(`${pageHero('Eatable','Access denied','Administrator permissions required')}<div class="container section-pad">${link('community',tr('community'),'btn btn-outline')}</div>`,'community');return shell(`${pageHero('Eatable · Admin',ct('queue'),ct('intro'))}<div class="container section-pad"><div class="v3-actions">${link('admin-index',itx('indexAdmin'),'btn btn-outline')}${link('admin-curated',editorText(language(),'hub'),'btn btn-primary')}${link('admin-quality',qt('heading'),'btn btn-outline')}${link('admin-import',bt('heading'),'btn btn-outline')}</div>${state.adminSubmissions.length?`<div class="v3-list">${state.adminSubmissions.map(r=>`<article class="v3-entry"><div class="inline-row"><h3>${submittedTitle(r)}</h3><span class="pill">${esc(prettyStatus(r.status))}</span></div><p>${submittedDescription(r)}</p><p><strong>${ct('origin')}:</strong> ${esc(r.origin)} · ${r.prep_minutes} ${tr('minutes')}</p>${r.photo_path?`<div class="v4-preview">${photoMarkup(r)}</div>`:''}<details><summary>${ct('preview')}</summary><h4>${ct('ingredients')}</h4><ol>${lines(r.ingredients).map(v=>`<li>${esc(v)}</li>`).join('')}</ol><h4>${ct('steps')}</h4><ol>${lines(r.steps).map(v=>`<li>${esc(v)}</li>`).join('')}</ol></details><label>${ct('reviewNote')}<textarea id="moderation-note-${r.id}" class="input" rows="2" maxlength="2000">${esc(r.moderation_note||'')}</textarea></label><div class="v3-actions">${r.status!=='approved'?`<button class="btn btn-primary" data-action="moderate" data-id="${r.id}" data-status="approved">${ct('approve')}</button>`:''}${r.status!=='changes_requested'?`<button class="btn btn-outline" data-action="moderate" data-id="${r.id}" data-status="changes_requested">${ct('request')}</button>`:''}<button class="btn btn-light" data-action="moderate" data-id="${r.id}" data-status="rejected">${ct('reject')}</button></div></article>`).join('')}</div>`:`<div class="empty">${ct('none')}</div>`}</div>`,'community')}
async function refreshCommunity(){
 if(!isCloudConfigured)return;
 const [published,curated,indexed,vocabulary]=await Promise.all([getPublished(),getCuratedCatalog(),getCommunityIndexes(),getIngredientVocabulary()]);
 const firstError=[published,curated,indexed,vocabulary].find(r=>r.error)?.error;
 if(firstError)throw firstError;
 mergeVocabulary(vocabulary.data||[]);
 state.publicRecipes=published.data||[];
 state.communityIndexes=indexed.data||[];
 const lookup=new Map(state.communityIndexes.map(item=>[item.community_id,item]));
 state.catalog=[...(curated.data||[]).map(curatedFromDb),...state.publicRecipes.map(r=>communityFromDb(r,lookup.get(r.id)))];
 state.communityLoaded=true;state.catalogLoaded=true;state.catalogError='';
}
async function refreshPrivate(){
 if(!state.user){state.mySubmissions=[];state.adminSubmissions=[];state.isAdmin=false;state.photoUrls={};state.curatedAdminRows=[];state.curatedAdminLoaded=false;state.qualityRows=[];state.qualityLoaded=false;state.qualityError='';return;}
 const uid=state.user.id;
 const role=await getIsAdmin();if(role.error)throw role.error;state.isAdmin=!!role.data;
 const mine=await getMySubmissions(uid);if(mine.error)throw mine.error;state.mySubmissions=mine.data||[];
 if(state.isAdmin){const queue=await getAdminSubmissions();if(queue.error)throw queue.error;state.adminSubmissions=queue.data||[];}else state.adminSubmissions=[];
 if(state.isAdmin){await refreshCuratedAdmin();await refreshQualityAdmin();}else{state.curatedAdminRows=[];state.curatedAdminLoaded=false;state.qualityRows=[];state.qualityLoaded=false;state.qualityError='';}
 const distinct=new Map([...state.mySubmissions,...state.adminSubmissions].filter(r=>r.photo_path).map(r=>[r.id,r.photo_path]));
 const entries=await Promise.all([...distinct].map(async([id,p])=>{try{return [id,await getPrivatePhotoUrl(p)];}catch{return [id,null];}}));
 // Short-lived signed image links are used only on authenticated views.
 if(state.user?.id===uid)state.photoUrls=Object.fromEntries(entries.filter(([,url])=>url));
}
function adminIndexPage(){
 if(!state.isAdmin)return shell(`${pageHero('Eatable','Access denied','Administrator permissions required')}`,'community');
 const indexed=new Set(state.communityIndexes.map(x=>x.community_id));
 const queue=[...state.publicRecipes].sort((a,b)=>Number(indexed.has(a.id))-Number(indexed.has(b.id)));
 return shell(`${pageHero('Eatable · Admin',itx('indexTitle'),itx('indexIntro'))}<div class="container section-pad">
 <div class="v5-summary"><span><strong>${state.publicRecipes.length}</strong> ${itx('publishedCount')}</span><span><strong>${indexed.size}</strong> ${itx('indexedCount')}</span></div>
 <div class="v3-actions">${link('admin',ct('admin'),'btn btn-outline')}</div>
 ${queue.length?`<div class="v3-list">${queue.map(r=>`<article class="v3-entry"><div class="inline-row"><h3>${submittedTitle(r)}</h3><span class="pill">${indexed.has(r.id)?'✓ '+itx('indexed'):itx('needsIndex')}</span></div><p>${submittedDescription(r)}</p><p class="muted small">${esc(r.origin)} · ${lines(r.ingredients).length} ${tr('ingredients')}</p>${link('admin-index/'+r.id,itx('editIndex'),'btn btn-outline')}</article>`).join('')}</div>`:`<div class="empty">${itx('noApproved')}</div>`}
 <div class="v5-vocab"><h2>${itx('addIngredient')}</h2><form id="add-canonical-form" class="v3-form"><div class="v3-two"><label>${itx('newId')}<input class="input" name="id" required maxlength="64" pattern="[a-z][a-z0-9_]*" placeholder="pomegranate_molasses"/></label><label>${itx('newEnglish')}<input class="input" name="name_en" required maxlength="100"/></label></div><label>${itx('newItalian')}<input class="input" name="name_it" required maxlength="100"/></label><button class="btn btn-outline" type="submit">${itx('add')}</button></form></div>
 </div>`,'community');
}
function adminIndexEditor(id){
 if(!state.isAdmin)return shell(`${pageHero('Eatable','Access denied','Administrator permissions required')}`,'community');
 const recipe=state.publicRecipes.find(r=>r.id===id);
 if(!recipe)return shell(`${pageHero('Eatable',state.communityLoaded?'404':ct('loading'),state.communityLoaded?'Recipe not found':'Loading…')}`,'community');
 const saved=state.communityIndexes.find(i=>i.community_id===id);
 const ingredientOptions=[...ingredients].sort((a,b)=>a.name[language()].localeCompare(b.name[language()]));
 const dropdowns=lines(recipe.ingredients).map((line,i)=>{
   const selected=saved?.ingredient_ids?.[i]||suggestCanonicalIngredient(line);
   return `<div class="v5-map-row"><label><strong>${i+1}. ${esc(line)}</strong><select class="input" name="mapped-${i}" required><option value="">${itx('selectIngredient')}</option>${ingredientOptions.map(item=>`<option value="${esc(item.id)}" ${selected===item.id?'selected':''}>${label(item.name)}</option>`).join('')}</select></label></div>`;
 }).join('');
 const currentCuisine=saved?.cuisine||communityFromDb(recipe,null).cuisine||'Other';
 const currentDiet=saved?.diet||'unknown';
 return shell(`${pageHero('Eatable · Admin',itx('editIndex'),itx('indexIntro'))}<div class="container section-pad">
 <div class="v3-actions">${link('admin-index','← '+itx('back'),'btn btn-outline')}</div>
 <article class="v3-entry"><h2>${submittedTitle(recipe)}</h2><p>${submittedDescription(recipe)}</p><div class="notice">${itx('unmappedNote')}</div>
 <form class="v3-form" id="index-recipe-form" data-id="${esc(id)}">
 <div class="v3-two"><label>${itx('cuisine')}<select name="cuisine" class="input" required>${filterOptions([...cuisines.map(c=>[c.id,`${c.flag} ${label(c.name)}`]),['Other','Other']],currentCuisine)}</select></label>
 <label>${itx('diet')}<select name="diet" class="input" required>${filterOptions([['unknown',itx('unknown')],['none',itx('nonVegetarian')],['vegetarian',itx('vegetarian')],['vegan',itx('vegan')]],currentDiet)}</select></label></div>
 <h3>${itx('canonical')}</h3>${dropdowns}<button class="btn btn-primary" type="submit" ${state.communityBusy?'disabled':''}>${itx('save')}</button>
 </form></article></div>`,'community');
}
function curatedAdminPage(){
 if(!state.isAdmin)return shell(`${pageHero('Eatable','Access denied','Administrator permissions required')}`,'community');
 const title=editorText(language(),'hub');
 return shell(`${pageHero('Eatable · Admin',title,editorText(language(),'intro'))}<div class="container section-pad"><div class="v3-actions">${link('admin-quality',qt('heading'),'btn btn-outline')}${link('admin-import',bt('heading'),'btn btn-outline')}</div>${!state.curatedAdminLoaded?`<p>${ct('loading')}</p>`:curatedListHtml({lang:language(),recipes:state.curatedAdminRows,link})}</div>`,'community');
}
function curatedAdminEditor(slug){
 if(!state.isAdmin)return shell(`${pageHero('Eatable','Access denied','Administrator permissions required')}`,'community');
 const isNew=slug==='new';
 const recipe=isNew?null:state.curatedAdminRows.find(r=>r.slug===slug);
 if(!isNew&&!recipe)return shell(`${pageHero('Eatable',state.curatedAdminLoaded?'Recipe not found':ct('loading'),'')}<div class="container section-pad">${link('admin-curated',editorText(language(),'back'),'btn btn-outline')}</div>`,'community');
 return shell(`${pageHero('Eatable · Admin',editorText(language(),isNew?'newRecipe':'editRecipe'),editorText(language(),'intro'))}<div class="container section-pad v6-editor-wrap">${curatedEditorHtml({lang:language(),recipe,vocabulary:ingredients,cuisines,link,getPublicUrl:getPublicPhotoUrl})}</div>`,'community');
}
function adminImportPage(){
 if(!state.isAdmin)return shell(`${pageHero('Eatable','Access denied','Administrator permissions required')}`,'community');
 return shell(`${pageHero('Eatable · Admin',bt('heading'),bt('intro'))}<div class="container section-pad">${!state.curatedAdminLoaded?`<p>${ct('loading')}</p>`:importPageHtml({lang:language(),rows:state.bulkRows,selected:state.bulkSelected,results:state.bulkResults,loading:state.bulkBusy,link})}</div>`,'community');
}
function adminQualityPage(){
 if(!state.isAdmin)return shell(`${pageHero('Eatable','Access denied','Administrator permissions required')}`,'community');
 const message=state.qualityError?`<div class="notice" role="alert">${esc(qt('missingMigration'))} ${esc(state.qualityError)}</div>`:'';
 return shell(`${pageHero('Eatable · Admin',qt('heading'),qt('intro'))}<div class="container section-pad v8-quality-wrap">${message}${state.qualityError?link('admin-curated',qt('openEditor'),'btn btn-outline'):!state.curatedAdminLoaded||!state.qualityLoaded?`<p>${ct('loading')}</p>`:qualityDashboardHtml({lang:language(),recipes:state.curatedAdminRows,reviews:state.qualityRows,filter:state.qualityFilter,link})}</div>`,'community');
}
function adminQualityReview(slug){
 if(!state.isAdmin)return shell(`${pageHero('Eatable','Access denied','Administrator permissions required')}`,'community');
 const recipe=state.curatedAdminRows.find(r=>r.slug===slug),review=state.qualityRows.find(r=>r.slug===slug);
 return shell(`${pageHero('Eatable · Admin',qt('reviewRecipe'),qt('intro'))}<div class="container section-pad v8-quality-wrap">${state.qualityError?`<div class="notice" role="alert">${esc(qt('missingMigration'))} ${esc(state.qualityError)}</div>`:''}${state.qualityError?link('admin-curated',qt('openEditor'),'btn btn-outline'):!state.curatedAdminLoaded||!state.qualityLoaded?`<p>${ct('loading')}</p>`:recipe?qualityReviewHtml({lang:language(),recipe,review,link}):`<div class="empty">Recipe not found</div>`}</div>`,'community');
}
async function refreshQualityAdmin(){
 if(!state.isAdmin){state.qualityRows=[];state.qualityLoaded=false;state.qualityError='';return;}
 const reviews=await getCuratedReviews();
 if(reviews.error){state.qualityError=reviews.error.message;state.qualityLoaded=false;return;}
 state.qualityRows=reviews.data||[];state.qualityError='';state.qualityLoaded=true;
}
async function refreshCuratedAdmin(){
 if(!state.isAdmin){state.curatedAdminRows=[];state.curatedAdminLoaded=false;return;}
 const [curated,media]=await Promise.all([getAdminCuratedCatalog(),getAdminCuratedMedia()]);
 if(curated.error)throw curated.error;
 if(media.error)throw media.error;
 const mediaBySlug=new Map((media.data||[]).map(m=>[m.slug,m.photo_path]));
 state.curatedAdminRows=(curated.data||[]).map(r=>({...r,photo_path:mediaBySlug.get(r.slug)||null}));
 state.curatedAdminLoaded=true;
}
function kitchenStatusBanner(){
 if(state.kitchenStatus==='loading')return `<div class="notice">${kt('loading')}</div>`;
 if(state.kitchenStatus==='error')return `<div class="notice" role="alert">${kt('failed')} ${esc(state.kitchenError)}</div>`;
 return '';
}
function kitchenIngredientInput(id){return `<div class="v11-input"><input class="input" type="search" id="${id}" list="${id}-options" placeholder="${kt('searchIngredient')}" autocomplete="off"/><datalist id="${id}-options">${ingredients.map(i=>`<option value="${label(i.name)}"></option>`).join('')}</datalist></div>`;}
function pantryList(){return state.pantry.length?`<div class="v11-tags">${state.pantry.map(id=>`<span class="v11-tag">${label(ingredientById[id]?.name||id)} <button type="button" data-action="pantry-remove" data-id="${esc(id)}" aria-label="${kt('remove')} ${label(ingredientById[id]?.name||id)}" ${state.kitchenBusy?'disabled':''}>×</button></span>`).join('')}</div>`:`<p class="muted small">${kt('emptyPantry')}</p>`}
function kitchen(){
 const saved=state.favorites.map(id=>getAnyRecipe(id)).filter(Boolean);
 if(!state.user){
  if(!isCloudConfigured)return shell(`${pageHero('Eatable',kt('myFavorites'),at('demoSaveNote'))}<div class="container section-pad v11-main"><div class="notice">${kt('needLogin')}</div>${saved.length?`<div class="grid-recipes">${saved.map(r=>card(r)).join('')}</div>`:`<div class="empty"><h3>${tr('cookbookEmpty')}</h3>${link('recipes',tr('allRecipes'),'btn btn-primary space-top')}</div>`}</div>`,'kitchen');
  return shell(`${pageHero('Eatable',kt('myKitchen'),kt('needLogin'))}<div class="container section-pad"><div class="empty">${link('account',at('signIn'),'btn btn-primary')}</div></div>`,'kitchen');
 }
 return shell(`${pageHero('Eatable',kt('myKitchen'),kt('pantryNote'))}<div class="container section-pad v11-main">${kitchenStatusBanner()}<div class="v11-stats"><div><strong>${state.pantry.length}</strong><span>${kt('pantry')}</span></div><div><strong>${state.shopping.length}</strong><span>${kt('shopping')}</span></div><div><strong>${saved.length}</strong><span>${kt('favorites')}</span></div></div><section class="v11-panel"><div class="v11-section-head"><div><h2>${kt('yourPantry')}</h2><p class="muted small">${kt('pantryNote')}</p></div>${link('shopping-list',kt('shopList')+' →','btn btn-outline')}</div><form id="v11-pantry-add" class="v11-entry">${kitchenIngredientInput('v11-pantry-input')}<button class="btn btn-primary" ${state.kitchenBusy?'disabled':''}>+ ${kt('addToPantry')}</button></form>${pantryList()}<button class="btn btn-outline space-top" data-action="use-pantry" ${state.pantry.length===0?'disabled':''}>${kt('cookWith')} →</button></section><section class="v11-panel"><div class="v11-section-head"><h2>${kt('shopping')}</h2>${link('shopping-list',kt('shopList')+' →','text-link')}</div><p class="muted small">${state.shopping.length?`${state.shopping.length} ${kt('yourShopping').toLowerCase()}`:kt('shoppingEmptyHint')}</p></section><section class="v11-panel"><div class="v11-section-head"><h2>${kt('myFavorites')}</h2>${link('recipes',tr('allRecipes')+' →','text-link')}</div>${saved.length?`<div class="grid-recipes">${saved.map(r=>card(r)).join('')}</div>`:`<div class="empty"><h3>${tr('cookbookEmpty')}</h3>${link('recipes',tr('allRecipes'),'btn btn-outline space-top')}</div>`}</section></div>`,'kitchen');
}
function shoppingPage(){
 if(!state.user)return shell(`${pageHero('Eatable',kt('shopping'),kt('needLogin'))}<div class="container section-pad"><div class="empty">${link('account',at('signIn'),'btn btn-primary')}</div></div>`,'kitchen');
 const rows=state.shopping;
 const items=rows.map(row=>{const unit=String(row.unit||'');const qty=row.quantity==null?'':`${Number(row.quantity)} ${unit==='pcs'?'':unit} `;return `<li class="v11-shopping-item ${row.checked?'is-checked':''}"><label><input type="checkbox" data-shopping-check="1" data-id="${esc(row.ingredient_id)}" data-unit="${esc(unit)}" ${row.checked?'checked':''} ${state.kitchenBusy?'disabled':''}/><span><strong>${label(ingredientById[row.ingredient_id]?.name||row.ingredient_id)}</strong><small>${esc(qty.trim())}</small></span></label><div class="v11-item-actions"><button class="btn btn-outline btn-sm" data-action="shopping-bought" data-id="${esc(row.ingredient_id)}" data-unit="${esc(unit)}" ${state.kitchenBusy?'disabled':''}>${kt('markBought')}</button><button class="btn btn-light btn-sm" data-action="shopping-remove" data-id="${esc(row.ingredient_id)}" data-unit="${esc(unit)}" ${state.kitchenBusy?'disabled':''}>${kt('remove')}</button></div></li>`}).join('');
 return shell(`${pageHero('Eatable',kt('shopping'),kt('shoppingNote'))}<div class="container section-pad v11-main">${kitchenStatusBanner()}<section class="v11-panel"><div class="v11-section-head"><h2>${kt('yourShopping')}</h2>${link('my-kitchen',kt('myKitchen')+' →','btn btn-outline')}</div><form id="v11-shopping-add" class="v11-entry">${kitchenIngredientInput('v11-shopping-input')}<button class="btn btn-primary" ${state.kitchenBusy?'disabled':''}>+ ${kt('addToShopping')}</button></form>${items?`<ul class="v11-shopping-list">${items}</ul>`:`<div class="empty">${kt('shoppingEmpty')}<p>${kt('shoppingEmptyHint')}</p></div>`}<p class="muted small">${kt('shopAmounts')}</p></section></div>`,'kitchen');
}
const fmt=(qty,unit)=>`${Number.isInteger(qty)?qty:Number(qty.toFixed(1))} ${unit==='pcs'?'':unit}`.trim();
function detail(r){
 state.servings=Math.max(1,Math.min(12,state.servings));
 const related=state.catalog.filter(x=>x.id!==r.id&&(x.cuisine===r.cuisine||x.ingredients.some(i=>r.ingredients.some(j=>j.id===i.id)))).slice(0,4);
 const isCommunity=r.source==='community';
 const possibleSwaps=state.showSubstitutions&&state.selected.length?r.ingredients.map(i=>!state.selected.includes(i.id)?substitutionFor(i.id,state.selected):null).filter(Boolean):[];
 const swapDetail=possibleSwaps.length?`<div class="v10-detail-swaps"><strong>${mt('swaps')}</strong><ul>${possibleSwaps.map(x=>`<li>${label(ingredientById[x.missingId]?.name||x.missingId)} → ${label(ingredientById[x.availableId]?.name||x.availableId)} — ${label(x.note)}</li>`).join('')}</ul><p>${mt('swapNotice')}</p></div>`:'';
 const ingredientsHtml=isCommunity?`<ul class="ingredient-list">${r.rawIngredients.map((value,index)=>`<li><label><input type="checkbox" data-check="${index}" ${state.checked.has(index)?'checked':''}/><span>${esc(value)}</span></label></li>`).join('')}</ul>`:`<div class="servings-control"><span class="muted">${tr('servings')}:</span><button data-action="minus-serving" aria-label="Reduce servings">−</button><strong>${state.servings}</strong><button data-action="plus-serving" aria-label="Increase servings">+</button></div><ul class="ingredient-list">${r.ingredients.map((i,index)=>`<li><label><input type="checkbox" data-check="${index}" ${state.checked.has(index)?'checked':''}/><span>${fmt(i.qty*state.servings/(r.serves||4),i.unit)} ${label(ingredientById[i.id]?.name||i.id)}</span></label></li>`).join('')}</ul>`;
 return shell(`<div class="container detail-wrap"><div class="breadcrumb">${link('',tr('home'))} / ${link('recipes',tr('explore'))} / <span>${label(r.name)}</span></div><div class="detail-head">${foodImage(r,'detail')}<div><div class="detail-tags"><span class="pill">${cuisineLabel(r)}</span>${dietBadge(r)}<span class="pill">${esc(r.category)}</span>${isCommunity?`<span class="pill">${esc(ct('communityRecipe'))}</span>`:''}</div><h1>${label(r.name)}</h1><p class="detail-description">${label(r.description)}</p><div class="stat-row"><div class="stat"><strong>${r.time} ${tr('minutes')}</strong><small>${tr('timeLabel')}</small></div><div class="stat"><strong>${r.serves??4}</strong><small>${tr('servings')}</small></div><div class="stat"><strong>${tr('easy')}</strong><small>${tr('difficulty')}</small></div></div><div class="detail-actions"><button class="btn btn-primary" data-action="start-cooking">${tr('startCooking')} →</button>${readCookingProgress(r)!==null?`<button class="btn btn-outline" data-action="resume-cooking">↻ ${ckt('resume')} (${tr('step')} ${readCookingProgress(r)+1})</button>`:''}<button class="btn btn-outline" data-action="favorite" data-id="${esc(r.id)}">${state.favorites.includes(r.id)?'♥ '+tr('saved'):'♡ '+tr('save')}</button><button class="btn btn-light" data-action="share">↗ ${tr('share')}</button>${r.ingredients.length&&r.searchable!==false?`<button class="btn btn-outline" data-action="shopping-from-recipe" data-id="${esc(r.id)}" ${state.kitchenBusy?'disabled':''}>🛒 ${kt('fromRecipe')}</button>`:''}</div><p class="muted small" style="margin-top:13px">${saveNote()}</p></div></div><div class="recipe-body"><aside class="ingredient-panel"><h2>${tr('requiredIngredients')}</h2>${ingredientsHtml}${swapDetail}</aside><div class="instructions"><h2>${tr('steps')}</h2>${r.steps.map((step,i)=>`<div class="instruction-step"><div class="number-circle">${i+1}</div><div><strong>${tr('step')} ${i+1}</strong><p>${label(step)}</p></div></div>`).join('')}<div class="editorial-note"><strong>${tr('story')}</strong><p class="space-top">${label(r.description)}</p></div><div class="notice"><p>${tr('recipeNote')}</p><p class="muted small">${tr('photoNote')}</p></div></div></div><section class="section" style="padding-bottom:0"><div class="section-heading"><h2>${tr('featured')}</h2>${link('recipes',`${tr('allRecipes')} →`,'text-link')}</div><div class="grid-recipes">${related.map(x=>card(x)).join('')}</div></section></div>`,'explore');
}
function accountPage(){
 const intro=pageHero('Eatable · '+at('account'),at('account'),at('authIntro'));
 if(state.cloudStatus==='demo')return shell(`${intro}<div class="container section-pad"><div class="auth-card"><h2>${at('cloudNotConfigured')}</h2><p class="muted small">src/supabase-config.js</p></div></div>`,'account');
 if(state.cloudStatus==='connecting')return shell(`${intro}<div class="container section-pad"><div class="auth-card"><p>${at('cloudConnecting')}</p></div></div>`,'account');
 if(state.cloudStatus==='error')return shell(`${intro}<div class="container section-pad"><div class="auth-card"><p>${at('cloudFailed')}</p><p class="muted small">${esc(state.cloudError)}</p></div></div>`,'account');
 if(state.passwordRecovery) return shell(`${intro}<div class="container section-pad"><div class="auth-card"><h2>${at('changePassword')}</h2><form id="eatable-password-form"><label for="new-password">${at('password')}</label><input class="input" id="new-password" name="password" type="password" minlength="8" autocomplete="new-password" required/><p class="muted small">${at('pwMin')}</p><button class="btn btn-primary" type="submit" ${state.authBusy?'disabled':''}>${at('updatePassword')}</button></form></div></div>`,'account');
 if(state.user)return shell(`${intro}<div class="container section-pad"><div class="auth-card"><h2>${at('myAccount')}</h2><p class="muted">${at('signedInAs')}</p><p><strong>${esc(state.user.email||'')}</strong></p><div class="auth-buttons">${link('my-kitchen',at('goToCookbook'),'btn btn-primary')}<button class="btn btn-outline" data-action="sign-out">${at('signOut')}</button></div></div></div>`,'account');
 const mode=state.authView;
 const title=mode==='signup'?at('signUp'):mode==='reset'?at('reset'):at('signIn');
 return shell(`${intro}<div class="container section-pad"><div class="auth-card"><h2>${title}</h2><form id="eatable-auth-form" data-mode="${mode}">
  ${mode==='signup'?`<label for="auth-name">${at('displayName')}</label><input class="input" id="auth-name" name="displayName" maxlength="100" autocomplete="nickname" required/>`:''}
  <label for="auth-email">${at('email')}</label><input class="input" id="auth-email" name="email" type="email" autocomplete="email" required/>
  ${mode!=='reset'?`<label for="auth-password">${at('password')}</label><input class="input" id="auth-password" name="password" type="password" minlength="8" autocomplete="${mode==='signup'?'new-password':'current-password'}" required/><p class="muted small">${at('pwMin')}</p>`:''}
  <button type="submit" class="btn btn-primary" ${state.authBusy?'disabled':''}>${mode==='reset'?at('sendReset'):title}</button></form>
  <div class="auth-switch">${mode!=='signin'?`<button class="plain-btn" data-action="auth-view" data-mode="signin">${at('signIn')}</button>`:''}${mode!=='signup'?`<button class="plain-btn" data-action="auth-view" data-mode="signup">${at('signUp')}</button>`:''}${mode!=='reset'?`<button class="plain-btn" data-action="auth-view" data-mode="reset">${at('forgot')}</button>`:''}</div>
 </div></div>`,'account');
}
function cookingIngredientsList(r){
 const isCommunity=r.source==='community';
 const rows=isCommunity?(r.rawIngredients||[]).map((value,index)=>({text:esc(value),index})):(r.ingredients||[]).map((i,index)=>({text:`${fmt(i.qty*state.servings/(r.serves||4),i.unit)} ${label(ingredientById[i.id]?.name||i.id)}`,index}));
 const options=!isCommunity?`<div class="v12-serving" aria-label="${tr('servings')}"><span>${tr('servings')}:</span><button type="button" data-action="minus-serving" aria-label="− ${tr('servings')}">−</button><strong>${state.servings}</strong><button type="button" data-action="plus-serving" aria-label="+ ${tr('servings')}">+</button></div>`:`<p class="muted small">${ckt('noQuantities')}</p>`;
 return `${options}<ul class="ingredient-list v12-ingredient-list">${rows.map(({text,index})=>`<li><label><input type="checkbox" data-check="${index}" ${state.checked.has(index)?'checked':''}/><span>${text}</span></label></li>`).join('')}</ul>`;
}
function cookingOverlay(r){
 const count=r.steps.length,idx=clampCookingStep(state.cookingStep,count),large=state.cookingTextLarge,open=state.cookingIngredientsOpen;
 const steps=Array.from({length:count},(_,i)=>`<option value="${i}" ${i===idx?'selected':''}>${tr('step')} ${i+1}</option>`).join('');
 return `<div class="cook-overlay v12-cook ${large?'v12-large-text':''}" role="dialog" aria-modal="true" aria-labelledby="v12-cook-title" tabindex="-1">
   <div class="cook-top"><div class="cook-inner v12-cook-header"><div class="v12-cook-brand"><span class="v12-brand-icon" aria-hidden="true">✺</span><span class="v12-recipe-name">${label(r.name)}</span></div><button type="button" class="btn btn-light btn-sm" data-action="close-cooking" aria-label="${ckt('close')}">✕ <span>${tr('close')}</span></button></div></div>
   <main class="cook-inner cook-center v12-cook-main">
    <div class="v12-tools"><button type="button" class="btn btn-light btn-sm" data-action="cook-text-size" aria-pressed="${large}">${large?ckt('normalSize'):ckt('textSize')} <span aria-hidden="true">A${large?'−':'+'}</span></button><button type="button" class="btn btn-light btn-sm" data-action="cook-ingredients" aria-expanded="${open}" aria-controls="v12-cook-ingredients">${open?ckt('hideIngredients'):ckt('ingredients')} ${open?'−':'+'}</button></div>
    <div class="progress v12-progress" role="progressbar" aria-label="${tr('steps')}" aria-valuemin="1" aria-valuemax="${count}" aria-valuenow="${idx+1}"><span style="width:${(idx+1)/count*100}%"></span></div>
    <div class="v12-step-meta"><span>${tr('step')} ${idx+1} ${tr('of')} ${count}</span><label for="v12-step-jump">${ckt('jump')} <select id="v12-step-jump" data-cook-jump>${steps}</select></label></div>
    <h1 id="v12-cook-title" tabindex="-1">${tr('step')} ${idx+1}</h1>
    <div class="v12-step-body" aria-live="polite">${label(r.steps[idx])}</div>
    <div id="v12-cook-ingredients" class="v12-ingredients-panel" ${open?'':'hidden'}><h2>${ckt('ingredients')}</h2>${cookingIngredientsList(r)}</div>
    <p class="v12-local-hint">${ckt('progressHint')}</p>
   </main>
   <div class="v12-footer-wrap"><div class="cook-inner cook-footer"><button type="button" class="btn btn-light" data-action="prev-step" ${idx===0?'disabled':''}>← ${tr('previous')}</button><button type="button" class="btn btn-primary" data-action="next-step">${idx===count-1?tr('finish'):tr('next')} →</button></div></div>
  </div>`;
}
function focusCookingTitle(){document.getElementById('v12-cook-title')?.focus({preventScroll:true});}
function changeCookingStep(r,step){
 if(!r||!Array.isArray(r.steps)||!r.steps.length)return;
 if(step>=r.steps.length){clearCookingProgress(r);state.cookingStep=null;state.cookingIngredientsOpen=false;render();toast(ckt('finished'));document.querySelector('[data-action="start-cooking"]')?.focus({preventScroll:true});return;}
 state.cookingStep=clampCookingStep(step,r.steps.length);
 writeCookingProgress(r,state.cookingStep);
 render();focusCookingTitle();
}
function active(){const pieces=location.pathname.split('/').filter(Boolean),route=pieces[0]==='it'||pieces[0]==='en'?pieces.slice(1):pieces;return route;}
function render(){const route=active();let html;let selected='';if(!route.length){html=home();selected='home'}else if(route[0]==='cook'){html=cook();selected='cook'}else if(route[0]==='recipes'&&route[1]){const r=getAnyRecipe(route[1]);html=r?detail(r):explore();selected='explore'}else if(route[0]==='recipes'){const params=new URLSearchParams(location.search);if(params.has('cuisine'))state.exploreCuisine=params.get('cuisine');html=explore();selected='explore'}else if(route[0]==='lebanese'){html=lebanese();selected='lebanese'}else if(route[0]==='community'&&route[1]){const r=getAnyRecipe(communityKey(route[1]));html=r?detail(r):shell(pageHero('Eatable',state.communityLoaded?'404':ct('loading'),state.communityLoaded?'Recipe unavailable':'Loading approved recipes…'),'community');selected='community'}else if(route[0]==='community'){html=community();selected='community'}else if(route[0]==='submit'){html=submitPage();selected='community'}else if(route[0]==='edit'&&route[1]){html=submitPage(route[1]);selected='community'}else if(route[0]==='my-recipes'){html=mySubmissions();selected='community'}else if(route[0]==='admin-index'&&route[1]){html=adminIndexEditor(route[1]);selected='community'}else if(route[0]==='admin-index'){html=adminIndexPage();selected='community'}else if(route[0]==='admin-quality'&&route[1]){html=adminQualityReview(route[1]);selected='community'}else if(route[0]==='admin-quality'){html=adminQualityPage();selected='community'}else if(route[0]==='admin-import'){html=adminImportPage();selected='community'}else if(route[0]==='admin-curated'&&route[1]){html=curatedAdminEditor(route[1]);selected='community'}else if(route[0]==='admin-curated'){html=curatedAdminPage();selected='community'}else if(route[0]==='admin'){html=adminPage();selected='community'}else if(route[0]==='my-kitchen'){html=kitchen();selected='kitchen'}else if(route[0]==='shopping-list'){html=shoppingPage();selected='kitchen'}else if(route[0]==='account'){html=accountPage();selected='account'}else{html=home();selected='home'}app.innerHTML=html;const r=route[1]?(route[0]==='recipes'?getAnyRecipe(route[1]):route[0]==='community'?getAnyRecipe(communityKey(route[1])):null):null;if(r&&state.cookingStep!==null){app.insertAdjacentHTML('beforeend',cookingOverlay(r));document.body.style.overflow='hidden'}else{document.body.style.overflow=''}document.documentElement.lang=language();document.title=`${r?`${r.name[language()]} | `:''}Eatable — ${tr('footer')}`;}
function navigate(url){if(state.curatedImagePreviewUrl){URL.revokeObjectURL(state.curatedImagePreviewUrl);state.curatedImagePreviewUrl=null;}const u=new URL(url,location.href);if(u.origin!==location.origin){location.href=u.href;return}history.pushState(null,'',u.pathname+u.search+u.hash);state.cookingStep=null;state.cookingIngredientsOpen=false;state.checked.clear();state.servings=4;state.menuOpen=false;render();window.scrollTo(0,0)}
function toast(message){document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.textContent=message;el.setAttribute('role','status');document.body.append(el);setTimeout(()=>el.remove(),3300)}
function suggest(input){const q=input.value,context=input.dataset.ingredientInput,target=document.getElementById(`suggestions-${context}`);if(!target)return;const matches=ingredientMatches(q).filter(i=>!state.selected.includes(i.id));if(!q.trim()){target.classList.add('hidden');target.innerHTML='';return}target.innerHTML=matches.length?matches.map(i=>`<button type="button" role="option" data-action="add-ingredient" data-id="${i.id}">${label(i.name)} <span class="muted small">+</span></button>`).join(''):`<div style="padding:12px" class="muted small">${tr('noSearch')}</div>`;target.classList.remove('hidden')}
document.addEventListener('input',event=>{const input=event.target;if(input.matches('[data-ingredient-input]'))suggest(input)});
document.addEventListener('keydown',event=>{
 if(state.cookingStep!==null){
   const overlay=document.querySelector('.v12-cook');
   if(event.key==='Tab'&&overlay){
     const items=[...overlay.querySelectorAll('button:not([disabled]),select:not([disabled]),input:not([disabled])')].filter(x=>x.offsetParent!==null);
     if(items.length){const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
   }
   if((event.key==='ArrowLeft'||event.key==='ArrowRight')&&!['INPUT','SELECT','TEXTAREA'].includes(event.target?.tagName)){
     const route=active(),r=route[0]==='community'?getAnyRecipe(communityKey(route[1])):getAnyRecipe(route[1]);
     if(r){event.preventDefault();if(event.key==='ArrowLeft')changeCookingStep(r,Math.max(0,state.cookingStep-1));else if(state.cookingStep<r.steps.length-1)changeCookingStep(r,state.cookingStep+1);return;}
   }
 }
 if(event.key==='Escape'){const target=event.target.closest('.field-wrap');target?.querySelector('.suggestions')?.classList.add('hidden');if(state.cookingStep!==null){state.cookingStep=null;render()}}if(event.key==='Enter'&&event.target.matches('[data-ingredient-input]')){event.preventDefault();const first=ingredientMatches(event.target.value).find(i=>!state.selected.includes(i.id));if(first){state.selected.push(first.id);save();render();document.getElementById(event.target.id)?.focus()}else toast(tr('errorIngredient'))}});
document.addEventListener('change',async event=>{
 const target=event.target;
 if(target.matches('[data-cook-jump]')&&state.cookingStep!==null){
   const route=active(),r=route[0]==='community'?getAnyRecipe(communityKey(route[1])):getAnyRecipe(route[1]);
   if(r)changeCookingStep(r,Number(target.value));return;
 }
 if(target.matches('#recipe-json-file')){
   if(!state.isAdmin||state.bulkBusy)return;
   const file=target.files?.[0];if(!file)return;
   if(file.size>400000){toast('JSON file is too large (400 KB maximum).');target.value='';return;}
   try{
     const raw=await file.text();
     const rows=parseRecipeImport(raw,ingredients,state.curatedAdminRows.map(r=>r.slug));
     if(active()[0]!=='admin-import')return;
     state.bulkRaw=raw;state.bulkRows=rows;state.bulkSelected=new Set(rows.filter(r=>r.status==='ready').map(r=>r.index));state.bulkResults=null;render();
   }catch(e){toast(e.message||bt('failure'));target.value='';}
   return;
 }
 if(target.matches('[data-import-select]')){
   const index=Number(target.value);
   if(target.checked)state.bulkSelected.add(index);else state.bulkSelected.delete(index);
   render();return;
 }
 if(target.matches('#curated-photo-input')){
   const preview=document.getElementById('curated-upload-preview');
   if(state.curatedImagePreviewUrl){URL.revokeObjectURL(state.curatedImagePreviewUrl);state.curatedImagePreviewUrl=null;}
   const file=target.files?.[0];
   if(preview){const image=preview.querySelector('img');
     if(file){try{if(!file.size)throw Error('Select a non-empty image.');validatePhoto(file);state.curatedImagePreviewUrl=URL.createObjectURL(file);image.src=state.curatedImagePreviewUrl;preview.classList.remove('hidden');}
       catch(e){target.value='';preview.classList.add('hidden');toast(e.message);}}
     else preview.classList.add('hidden');
   }
 }
 if(target.matches('[data-shopping-check]')){
   const id=target.dataset.id,unit=target.dataset.unit||'',checked=target.checked;
   if(!state.user||state.kitchenBusy)return;
   state.kitchenBusy=true;
   try{await updateShoppingChecked(state.user.id,id,unit,checked);await refreshKitchen();}
   catch(e){toast(e.message||kt('failed'));target.checked=!checked;}
   finally{state.kitchenBusy=false;render();}return;
 }
 if(target.matches('[data-filter-substitutions]')){state.showSubstitutions=target.checked;try{localStorage.setItem('eatable:show-substitutions',String(target.checked));}catch{}render();return;}
 if(target.matches('[data-quality-filter]')){state.qualityFilter=target.value;render()}
 if(target.matches('[data-filter]')){state.filters[target.dataset.filter]=target.value;render()}
 if(target.matches('[data-check]')){const i=Number(target.dataset.check);if(target.checked)state.checked.add(i);else state.checked.delete(i)}
});
document.addEventListener('submit',async event=>{
 if(event.target.id==='recipe-bulk-import-form'){
   event.preventDefault();if(!state.isAdmin||state.bulkBusy||!state.curatedAdminLoaded)return;
   // Revalidate the original JSON against the current vocabulary and admin catalog.
   let fresh;
   try{fresh=parseRecipeImport(state.bulkRaw,ingredients,state.curatedAdminRows.map(r=>r.slug));}
   catch(e){toast(e.message);return;}
   const selected=fresh.filter(row=>row.status==='ready'&&state.bulkSelected.has(row.index));
   if(!selected.length){toast(bt('noSelected'));return;}
   state.bulkBusy=true;state.bulkResults=null;render();
   const results={created:0,skipped:0,failed:0,errors:[]};
   try{
     for(const row of selected){
       const {error}=await insertCuratedDraft(row.recipe);
       if(!error){results.created++;continue;}
       if(error.code==='23505'){results.skipped++;continue;}
       results.failed++;results.errors.push(`${row.recipe.slug}: ${error.message}`);
     }
     await Promise.all([refreshCuratedAdmin(),refreshQualityAdmin()]);
     state.bulkRows=parseRecipeImport(state.bulkRaw,ingredients,state.curatedAdminRows.map(r=>r.slug));
     state.bulkSelected=new Set(state.bulkRows.filter(r=>r.status==='ready').map(r=>r.index));
     state.bulkResults=results;
   }catch(e){results.failed++;results.errors.push(e.message||bt('failure'));state.bulkResults=results;}
   finally{state.bulkBusy=false;render();}
   return;
 }
 if(event.target.id==='quality-review-form'){
   event.preventDefault();if(!state.isAdmin||state.qualityBusy||!state.qualityLoaded)return;
   const form=event.target,slug=form.dataset.slug,recipe=state.curatedAdminRows.find(r=>r.slug===slug);
   if(!recipe)return;
   const fd=new FormData(form),row={slug,editorial_note:String(fd.get('editorial_note')||'').trim()};
   for(const field of reviewFields)row[field]=fd.get(field)==='on';
   if(row.editorial_note.length>2000){toast('Review note is too long.');return;}
   state.qualityBusy=true;
   const submit=form.querySelector('[type=submit]');if(submit)submit.disabled=true;
   try{
     const {error}=await upsertCuratedReview(row);if(error)throw error;
     await refreshQualityAdmin();navigate(path('admin-quality'));toast(qt('updated'));
   }catch(e){toast(e.message||qt('missingMigration'));}
   finally{state.qualityBusy=false;if(document.contains(submit))submit.disabled=false;}
   return;
 }
 if(event.target.id==='curated-recipe-form'){
   event.preventDefault();
   if(!state.isAdmin||state.curatedBusy)return;
   const intent=event.submitter?.value==='publish'?'publish':'draft';
   const form=event.target;
   const payload=serializeCurated(form,intent);
   const err=validateCurated(payload,ingredients);
   if(err){toast(err);return;}
   const oldSlug=form.dataset.slug;
   if(oldSlug&&payload.slug!==oldSlug){toast('The recipe URL cannot be changed.');return;}
   const previous=state.curatedAdminRows.find(r=>r.slug===oldSlug);
   const file=form.querySelector('[name="photo"]')?.files?.[0];
   try{if(file){if(!file.size)throw Error('Select a non-empty image.');validatePhoto(file);}}catch(e){toast(e.message);return;}
   const removePhoto=Boolean(form.querySelector('[name="remove_photo"]')?.checked);
   state.curatedBusy=true;
   for(const b of form.querySelectorAll('button[type=submit]'))b.disabled=true;
   let newPrivate=null,newPublic=null,mediaSaved=false,finalSaved=false;
   try{
     const previousPrivate=previous?.photo_path||null;
     const previousPublic=previous?.public_photo_path||null;
     let privatePath=removePhoto?null:previousPrivate;
     if(file){newPrivate=await uploadPrivatePhoto(state.user.id,crypto.randomUUID(),file);privatePath=newPrivate;}
     // For a new recipe, first create a private draft to satisfy the media
     // table's foreign key. Never publish its cover before metadata is saved.
     if(!previous){
       const draft=await saveCuratedRecipe({...payload,published:false,public_photo_path:null});
       if(draft.error)throw draft.error;
     }
     const media=await saveAdminCuratedMedia(payload.slug,privatePath);
     if(media.error)throw media.error;
     mediaSaved=true;
     let publicPath=null;
     if(intent==='publish'&&(privatePath||previousPublic)){
       if(newPrivate||(!previousPublic&&privatePath)){
         newPublic=await publishPhoto({id:'curated/'+payload.slug,photo_path:privatePath});
         publicPath=newPublic;
       }else if(!removePhoto){publicPath=previousPublic;}
     }
     const updated=await saveCuratedRecipe({...payload,public_photo_path:publicPath});
     if(updated.error)throw updated.error;
     finalSaved=true;
     // Clean up only after database commit. Errors are reported; the published
     // recipe itself must not be rolled back because a cleanup failed.
     const failedCleanup=[];
     if(previousPrivate&&previousPrivate!==privatePath){
       try{const result=await removePrivatePhoto(previousPrivate);if(result?.error)throw result.error;}catch(e){failedCleanup.push(e.message);}
     }
     if(previousPublic&&previousPublic!==publicPath){
       try{await removePublicPhoto(previousPublic);}catch(e){failedCleanup.push(e.message);}
     }
     await Promise.all([refreshCommunity(),refreshCuratedAdmin(),refreshQualityAdmin()]);
     navigate(path('admin-curated'));
     toast(failedCleanup.length?`Saved, but an old photo could not be deleted: ${failedCleanup.join('; ')}`:
       intent==='publish'?(language()==='it'?'Ricetta pubblicata.':'Recipe published.'):(language()==='it'?'Bozza salvata.':'Draft saved.'));
   }catch(e){
     // The media row can be committed before the recipe. If this happens,
     // preserve its new private file so editing can resume safely.
     if(newPublic&&!finalSaved)void removePublicPhoto(newPublic).catch(()=>{});
     if(newPrivate&&!mediaSaved)void removePrivatePhoto(newPrivate).catch(()=>{});
     toast(e.message||ct('failed'));
   }
   finally{state.curatedBusy=false;for(const b of document.querySelectorAll('#curated-recipe-form button[type=submit]'))b.disabled=false;}
   return;
 }
 if(event.target.id==='add-canonical-form'){
   event.preventDefault();if(!state.isAdmin||state.communityBusy)return;
   const fd=new FormData(event.target);
   const payload={id:String(fd.get('id')||'').trim(),name_en:String(fd.get('name_en')||'').trim(),name_it:String(fd.get('name_it')||'').trim()};
   state.communityBusy=true;
   try{const {data,error}=await addIngredient(payload);if(error)throw error;mergeVocabulary([data]);render();toast(itx('vocabAdded'));}
   catch(e){toast(e.message||ct('failed'));}finally{state.communityBusy=false;}
   return;
 }
 if(event.target.id==='index-recipe-form'){
   event.preventDefault();if(!state.isAdmin||state.communityBusy)return;
   const id=event.target.dataset.id;
   const r=state.publicRecipes.find(x=>x.id===id);
   if(!r)return;
   const fd=new FormData(event.target);
   const ingredient_ids=lines(r.ingredients).map((_,i)=>String(fd.get('mapped-'+i)||''));
   if(ingredient_ids.some(x=>!ingredientById[x])){toast(itx('missing'));return;}
   state.communityBusy=true;
   try{
     const {error}=await saveCommunityIndex({community_id:id,cuisine:String(fd.get('cuisine')),diet:String(fd.get('diet')),ingredient_ids,indexed_by:state.user.id});
     if(error)throw error;
     await refreshCommunity();navigate(path('admin-index'));toast(itx('success'));
   }catch(e){toast(e.message||ct('failed'));}finally{state.communityBusy=false;}
   return;
 }
 if(event.target.id==='community-form'){
   event.preventDefault();if(state.communityBusy||!state.user)return;
   const fd=new FormData(event.target);
   const splitLines=k=>String(fd.get(k)||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
   const ingredients=splitLines('ingredients'),steps=splitLines('steps');
   if(ingredients.length<2||steps.length<2){toast(ct('missing'));return;}
   const optional=k=>String(fd.get(k)||'').trim()||null;
   const editId=event.target.dataset.editId||null;
   const original=editId?state.mySubmissions.find(r=>r.id===editId&&r.status==='changes_requested'):null;
   if(editId&&!original){toast(ct('notEditable'));return;}
   const photo=fd.get('photo');
   try{if(photo?.size)validatePhoto(photo);}catch(e){toast(e.message);return;}
   const payload={title_en:String(fd.get('title_en')||'').trim(),title_it:optional('title_it'),description_en:String(fd.get('description_en')||'').trim(),description_it:optional('description_it'),origin:String(fd.get('origin')||'').trim(),category:String(fd.get('category')||'Main dish'),prep_minutes:Number(fd.get('prep_minutes')),servings:Number(fd.get('servings')),ingredients,steps};
   const userId=state.user.id;
   const recordId=editId||crypto.randomUUID();
   let newPhotoPath=null;
   let committed=false;
   state.communityBusy=true;
   try{
     if(photo?.size)newPhotoPath=await uploadPrivatePhoto(userId,recordId,photo);
     const removeOld=fd.get('remove_photo')==='on';
     if(editId){
       payload.photo_path=newPhotoPath||(removeOld?null:original.photo_path);
       const {data,error}=await reviseCommunityRecipe(recordId,userId,payload);
       if(error)throw error;
       if(!data?.length)throw Error(ct('notEditable'));
       committed=true;
     }else{
       const {error}=await submitCommunityRecipe({id:recordId,author_id:userId,...payload,photo_path:newPhotoPath});
       if(error)throw error;
       committed=true;
     }
     await refreshPrivate();toast(ct('success'));navigate(path('my-recipes'));
     // Removing old photos is best-effort; the prior file is private even if cleanup fails.
     if(editId&&original.photo_path&&original.photo_path!==payload.photo_path){void removePrivatePhoto(original.photo_path).catch(()=>{});}
   }catch(e){if(newPhotoPath&&!committed){void removePrivatePhoto(newPhotoPath).catch(()=>{});}toast(e.message||ct('failed'));}
   finally{state.communityBusy=false;}
   return;
 }

 if(event.target.id==='eatable-auth-form'){
   event.preventDefault();if(state.authBusy)return;
   const form=event.target,fd=new FormData(form),mode=form.dataset.mode;
   const email=String(fd.get('email')||'').trim(),password=String(fd.get('password')||'');
   state.authBusy=true;
   try{
     let result;
     if(mode==='signup')result=await signUp(email,password,String(fd.get('displayName')||'').trim(),location.origin+path('account'),language());
     else if(mode==='reset')result=await requestPasswordReset(email,location.origin+path('account'));
     else result=await signIn(email,password);
     if(result.error)throw result.error;
     if(mode==='signin'){toast(at('loginSuccess'));navigate(path('my-kitchen'));}
     else {toast(at('checkEmail'));state.authView='signin';render();}
   }catch(e){toast(e.message||at('cloudFailed'));}
   finally{state.authBusy=false;}
   return;
 }
 if(event.target.id==='eatable-password-form'){
   event.preventDefault();if(state.authBusy)return;
   state.authBusy=true;
   try{const result=await updatePassword(String(new FormData(event.target).get('password')||''));if(result.error)throw result.error;state.passwordRecovery=false;toast(at('loginSuccess'));render();}
   catch(e){toast(e.message||at('cloudFailed'));}
   finally{state.authBusy=false;}
   return;
 }
 if(event.target.id==='v11-pantry-add'||event.target.id==='v11-shopping-add'){
   event.preventDefault();if(!state.user||state.kitchenBusy)return;
   const forPantry=event.target.id==='v11-pantry-add';
   const id=canonicalIngredientId(event.target.querySelector('input')?.value,ingredients);
   if(!id){toast(kt('unknownIngredient'));return;}
   state.kitchenBusy=true;try{
     if(forPantry){await insertPantry(state.user.id,id);}else{await insertShopping(state.user.id,[{ingredient_id:id,quantity:null,unit:''}]);}
     await refreshKitchen();toast(kt('added'));
   }catch(e){toast(e.message||kt('failed'));}finally{state.kitchenBusy=false;render();}return;
 }
 if(event.target.id==='explore-form'){event.preventDefault();state.exploreQuery=document.getElementById('explore-query').value;state.exploreCuisine=document.getElementById('explore-cuisine').value;history.replaceState(null,'',path('recipes'));render()}});
document.addEventListener('click',event=>{const action=event.target.closest('[data-action]');if(action){const name=action.dataset.action;const id=action.dataset.id;
 if(name==='import-sample'){
   if(!state.isAdmin||state.bulkBusy)return;
   action.disabled=true;
   fetch('/data/recipe-starter-pack.json',{cache:'no-store'})
     .then(r=>{if(!r.ok)throw Error(`Sample pack not found (${r.status}).`);return r.text()})
     .then(raw=>{
       if(active()[0]!=='admin-import')return;
       const rows=parseRecipeImport(raw,ingredients,state.curatedAdminRows.map(r=>r.slug));
       state.bulkRaw=raw;state.bulkRows=rows;state.bulkSelected=new Set(rows.filter(r=>r.status==='ready').map(r=>r.index));state.bulkResults=null;render();
     }).catch(e=>toast(e.message||bt('failure'))).finally(()=>{if(document.contains(action))action.disabled=false;});
   return;
 }
 if(name==='quality-export'){
   if(!state.isAdmin||!state.qualityLoaded)return;
   const csv=qualityCsv(state.curatedAdminRows,state.qualityRows);
   const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob);
   const anchor=document.createElement('a');anchor.href=url;anchor.download='eatable-quality-report.csv';
   document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   return;
 }
 if(name==='curated-preview-private'){
   if(!state.isAdmin)return;
   const slug=active()[1];const record=state.curatedAdminRows.find(r=>r.slug===slug);
   if(!record?.photo_path)return;
   action.disabled=true;
   getPrivatePhotoUrl(record.photo_path).then(url=>{
     if(active()[1]!==slug)return;
     const img=document.getElementById('curated-private-preview');
     if(img){img.src=url;img.classList.remove('hidden');action.classList.add('hidden');}
   }).catch(e=>toast(e.message||'Photo preview failed.')).finally(()=>{action.disabled=false;});
   return;
 }
 if(name==='curated-add-ingredient'){
   const parent=document.getElementById('curated-ingredients');if(parent&&parent.children.length<50)parent.insertAdjacentHTML('beforeend',ingredientRow(language(),ingredients,{qty:1,unit:'g'}));return;
 }
 if(name==='curated-add-step'){
   const parent=document.getElementById('curated-steps');if(parent&&parent.children.length<50)parent.insertAdjacentHTML('beforeend',stepRow(language()));return;
 }
 if(name==='curated-remove-row'){
   const row=action.closest('[data-curated-ingredient],[data-curated-step]');const list=row?.parentElement;
   if(row&&list?.children.length>1)row.remove();else toast(language()==='it'?'Lascia almeno un elemento.':'Keep at least one row.');return;
 }
 if(name==='moderate'){
   if(!state.isAdmin||state.communityBusy)return;
   const status=action.dataset.status, note=document.getElementById('moderation-note-'+id)?.value||null;
   if(!['approved','changes_requested','rejected'].includes(status))return;
   const submission=state.adminSubmissions.find(r=>r.id===id);
   if(!submission)return;
   state.communityBusy=true;action.disabled=true;
   (async()=>{
     let publishedPath=null;
     let committed=false;
     try{
       if(status==='approved'&&submission.photo_path){publishedPath=await publishPhoto(submission);}
       const {data,error}=await moderateRecipe(id,status,note,publishedPath);
       if(error)throw error;
       if(!data?.length)throw Error('No row was updated. Check your administrator role.');
       committed=true;
       // Public images from an earlier approved version are removed on unpublication.
       if(submission.public_photo_path&&submission.public_photo_path!==publishedPath){
         try{await removePublicPhoto(submission.public_photo_path);}catch(e){toast('Publication updated, but the previous photo could not be deleted: '+e.message);}
       }
       await Promise.all([refreshCommunity(),refreshPrivate()]);toast(ct('reviewed'));render();
     }catch(e){
       // Undo public file copy if approval was not committed.
       if(publishedPath&&!committed){void removePublicPhoto(publishedPath).catch(()=>{});}
       toast(e.message||ct('failed'));
     }finally{state.communityBusy=false;action.disabled=false;}
   })();
   return;
 }
 if(['pantry-remove','shopping-remove','shopping-bought','shopping-from-recipe','use-pantry'].includes(name)){
   if(!state.user){toast(kt('needLogin'));navigate(path('account'));return;}
   if(name==='use-pantry'){state.selected=[...new Set(state.pantry.filter(x=>ingredientById[x]))];save();navigate(path('cook'));return;}
   if(state.kitchenBusy)return;
   state.kitchenBusy=true;action.disabled=true;
   (async()=>{
     try{
       if(name==='pantry-remove')await deletePantry(state.user.id,id);
       if(name==='shopping-remove')await deleteShopping(state.user.id,id,action.dataset.unit||'');
       if(name==='shopping-bought')await moveToPantry(state.user.id,id,action.dataset.unit||'');
       if(name==='shopping-from-recipe'){
         const recipe=getAnyRecipe(id);
         const lines=shoppingLinesForRecipe(recipe,state.pantry,state.servings);
         if(!lines.length){toast(kt('noRecipeItems'));return;}
         await insertShopping(state.user.id,lines);toast(kt('listAdded'));
       }
       await refreshKitchen();
       if(name!=='shopping-from-recipe')toast(name==='shopping-bought'?kt('markedBought'):kt('removed'));
     }catch(e){toast(e.message||kt('failed'));}
     finally{state.kitchenBusy=false;action.disabled=false;render();}
   })();return;
 }
 switch(name){case 'auth-view':state.authView=action.dataset.mode||'signin';render();break;case 'sign-out':signOut().then(({error})=>{if(error)throw error;toast(at('logoutSuccess'));navigate(path('account'))}).catch(e=>toast(e.message||at('cloudFailed')));break;case 'menu':state.menuOpen=!state.menuOpen;render();break;case 'language':{const rest=active().join('/');const other=language()==='en'?'it':'en';history.pushState(null,'',`/${other}${rest?'/'+rest:''}`+location.search);render();break}case 'add-ingredient':if(id&&!state.selected.includes(id)){state.selected.push(id);save();render()}break;case 'remove-ingredient':state.selected=state.selected.filter(x=>x!==id);save();render();break;case 'clear':state.selected=[];save();render();break;case 'find':navigate(path('cook'));break;case 'reset-filters':state.filters={diet:'all',cuisine:'all',maxTime:''};render();break;case 'favorite':{
 if(isCloudConfigured && !state.user){toast(at('signInToSave'));navigate(path('account'));break;}
 const wasSaved=state.favorites.includes(id);
 state.favorites=wasSaved?state.favorites.filter(x=>x!==id):[...state.favorites,id];
 if(!isCloudConfigured){save();render();toast(wasSaved?tr('removeToast'):tr('saveToast'));break;}
 const currentUserId=state.user.id;render();
 (wasSaved?removeFavorite(currentUserId,id):addFavorite(currentUserId,id)).then(({error})=>{
   if(error)throw error;toast(wasSaved?tr('removeToast'):tr('saveToast'));
 }).catch(e=>{
   if(state.user?.id===currentUserId){state.favorites=wasSaved?[...new Set([...state.favorites,id])]:state.favorites.filter(x=>x!==id);render();}
   toast(e.message||at('cloudFailed'));
 });
 break;
 }case 'minus-serving':state.servings=Math.max(1,state.servings-1);render();break;case 'plus-serving':state.servings=Math.min(12,state.servings+1);render();break;case 'start-cooking':{
 const route=active(),r=route[0]==='community'?getAnyRecipe(communityKey(route[1])):getAnyRecipe(route[1]);
 if(!r||!r.steps?.length)break;state.cookingIngredientsOpen=false;changeCookingStep(r,0);break;
 }case 'resume-cooking':{
 const route=active(),r=route[0]==='community'?getAnyRecipe(communityKey(route[1])):getAnyRecipe(route[1]);
 if(!r||!r.steps?.length)break;state.cookingIngredientsOpen=false;changeCookingStep(r,readCookingProgress(r)??0);break;
 }case 'close-cooking':state.cookingStep=null;state.cookingIngredientsOpen=false;render();document.querySelector('[data-action="start-cooking"]')?.focus({preventScroll:true});break;
 case 'cook-text-size':state.cookingTextLarge=!state.cookingTextLarge;render();document.querySelector('[data-action="cook-text-size"]')?.focus({preventScroll:true});break;
 case 'cook-ingredients':state.cookingIngredientsOpen=!state.cookingIngredientsOpen;render();document.querySelector('[data-action="cook-ingredients"]')?.focus({preventScroll:true});break;
 case 'prev-step':{
 const route=active(),r=route[0]==='community'?getAnyRecipe(communityKey(route[1])):getAnyRecipe(route[1]);
 if(r)changeCookingStep(r,Math.max(0,(state.cookingStep||0)-1));break;
 }case 'next-step':{
 const route=active(),r=route[0]==='community'?getAnyRecipe(communityKey(route[1])):getAnyRecipe(route[1]);
 if(r)changeCookingStep(r,(state.cookingStep||0)+1);break;
 }case 'share':if(navigator.clipboard?.writeText)navigator.clipboard.writeText(location.href).then(()=>toast(tr('copied'))).catch(()=>toast(location.href));else toast(location.href);break}return}const anchor=event.target.closest('a[data-link]');if(anchor&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){event.preventDefault();navigate(anchor.href)}});
window.addEventListener('popstate',()=>{state.cookingStep=null;state.menuOpen=false;render()});
// Direct visits to the root are redirected to a language-specific homepage.
if(!/^\/(en|it)(\/|$)/.test(location.pathname))history.replaceState(null,'','/en'+(location.pathname==='/'?'':location.pathname)+location.search);
render();
async function refreshKitchen(){
 if(!isCloudConfigured||!state.user)return;
 const uid=state.user.id,rev=++state.kitchenRevision;
 state.kitchenStatus='loading';state.kitchenError='';
 try{
  const data=await fetchKitchen(uid);
  if(rev!==state.kitchenRevision||state.user?.id!==uid)return;
  state.pantry=data.pantry;state.shopping=data.shopping;state.kitchenStatus='ready';
 }catch(e){
  if(rev!==state.kitchenRevision||state.user?.id!==uid)return;
  state.kitchenStatus='error';state.kitchenError=e.message||String(e);
 }finally{if(rev===state.kitchenRevision&&['my-kitchen','shopping-list','cook','recipes'].includes(active()[0]))render();}
}
async function onSessionChanged(user,event){
 const revision=++state.authRevision;
 if(event==='PASSWORD_RECOVERY')state.passwordRecovery=true;
 const previousId=state.user?.id;
 state.user=user;
 state.cloudStatus='ready';
 if(!user){state.kitchenRevision++;state.pantry=[];state.shopping=[];state.kitchenStatus='idle';state.kitchenError='';state.favorites=load('eatable:favorites',[]);state.isAdmin=false;state.mySubmissions=[];state.adminSubmissions=[];state.photoUrls={};state.curatedAdminRows=[];state.curatedAdminLoaded=false;state.qualityRows=[];state.qualityLoaded=false;state.qualityError='';render();return;}
 if(previousId!==user.id)state.favorites=[];
 const {data,error}=await readFavorites(user.id);
 if(revision!==state.authRevision)return;
 if(error){state.cloudError=error.message;toast(error.message);return;}
 state.favorites=(data||[]).map(item=>item.recipe_slug).filter(id=>typeof id==='string'&&id.length>0); 
 try{await Promise.all([refreshPrivate(),refreshKitchen()]);}catch(e){state.communityError=e.message||ct('failed');}
 if(revision===state.authRevision)render();
}
if(isCloudConfigured){
 initializeCloud(onSessionChanged).then(async()=>{try{await refreshCommunity();}catch(e){state.communityError=e.message||ct('failed');state.communityLoaded=true;state.catalogError=state.communityError;}render();}).catch(e=>{
   state.cloudStatus='error';state.cloudError=e.message||String(e);render();
 });
}
