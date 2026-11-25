# Replace only these two functions if your deployed files differ

## `src/recipes.js` → `matchRecipes()`

```js
export function matchRecipes(selected,filters={},collection=recipes){
 const set=new Set(selected||[]), hasIngredients=set.size>0;
 return collection.filter(r=>(!filters.diet||filters.diet==='all'||filters.diet===r.diet||filters.diet==='vegetarian'&&r.diet==='vegan')&&(!filters.cuisine||filters.cuisine==='all'||r.cuisine===filters.cuisine)&&(!filters.maxTime||r.time<=Number(filters.maxTime)))
 .map(recipe=>{
  const required=Array.isArray(recipe.ingredients)?recipe.ingredients:[];
  const missing=required.filter(i=>!set.has(i.id));
  const matchCount=required.length-missing.length;
  const substitutions=missing.map(i=>substitutionFor(i.id,set)).filter(Boolean);
  return {...recipe,missing,matchCount,matchPercent:required.length?Math.round(100*matchCount/required.length):0,
   totalRequired:required.length,substitutions,categoryScore:hasIngredients?(missing.length===0?0:missing.length<=2?1:2):2};
 })
 // When the visitor has selected ingredients, unrelated recipes are excluded.
 .filter(recipe=>!hasIngredients||recipe.matchCount>0)
 // Main ranking: number of ingredients available, not number missing.
 // Coverage percentage, missing ingredients and cooking time break ties.
 .sort((a,b)=>hasIngredients?
   (b.matchCount-a.matchCount||b.matchPercent-a.matchPercent||a.missing.length-b.missing.length||a.time-b.time||a.name.en.localeCompare(b.name.en)):
   a.name.en.localeCompare(b.name.en));
}
```

## `src/app.js` → `cook()`

```js
function cook(){
 const hasSelection=state.selected.length>0;
 const all=matchRecipes(state.selected,state.filters,state.catalog.filter(r=>r.searchable!==false));
 const groups=hasSelection
  ? [{
      title:language()==='it'?'Ricette con più ingredienti disponibili':'Best ingredient matches',
      desc:language()==='it'
        ? 'Prima le ricette con più ingredienti che hai. A parità, conta la percentuale di corrispondenza. Le ricette senza ingredienti in comune sono escluse.'
        : 'Recipes using more of your selected ingredients appear first. Ties are ranked by match percentage. Recipes with no matching ingredients are hidden.',
      recipes:all
    }]
  : [{title:tr('featured'),desc:tr('noIngredient'),recipes:all.slice(0,12)}];
 return shell(`${pageHero('Eatable · '+tr('getStarted'),tr('cookTitle'),tr('cookSubtitle'))}<div class="container search-layout"><div>${ingredientPicker()}${filters()}</div><div>${state.catalogError?`<div class="notice">${esc(ct('catalogFallback'))}: ${esc(state.catalogError)}</div>`:''}<div class="results-count">${all.length} ${tr('results')}</div><p class="v10-disclaimer">${mt('matchNote')}</p>${state.showSubstitutions&&hasSelection?`<p class="v10-disclaimer">${mt('swapNotice')}</p>`:''}${all.length?groups.filter(group=>group.recipes.length).map(group=>`<section class="results-group"><div class="results-group-header"><div><h2>${group.title}</h2><p>${group.desc}</p></div><span class="pill">${group.recipes.length}</span></div><div class="grid-recipes">${group.recipes.map(r=>card(r,r)).join('')}</div></section>`).join(''):`<div class="empty"><h3>${tr('noResults')}</h3><p>${tr('tryAgain')}</p><button class="btn btn-outline space-top" data-action="reset-filters">${tr('reset')}</button></div>`}</div></div>`,'cook');
}
```
