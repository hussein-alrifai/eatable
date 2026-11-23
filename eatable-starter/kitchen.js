// Eatable v11: pure pantry and shopping-list helpers. An ingredient being in
// the pantry means *presence only*: neither amount nor freshness is verified.
export function requiredMissing(recipe,pantryIds){
  if(!Array.isArray(recipe?.ingredients)||!recipe.ingredients.length||recipe.searchable===false)return [];
  const owned=new Set(pantryIds);
  return recipe.ingredients.filter(line=>line?.id&&!owned.has(line.id));
}
export function shoppingLinesForRecipe(recipe,pantryIds,servings=4){
  const base=Math.max(1,Number(recipe?.serves||4));
  const ratio=Math.max(1,Math.min(12,Number(servings)||base))/base;
  const seen=new Set();
  return requiredMissing(recipe,pantryIds).filter(line=>{
    const key=String(line.id)+':'+String(line.unit||'');
    if(seen.has(key))return false;seen.add(key);return true;
  }).map(line=>({
    ingredient_id:String(line.id),
    quantity:Number.isFinite(Number(line.qty))&&Number(line.qty)>0?Math.round(Number(line.qty)*ratio*100)/100:null,
    unit:line.unit||''
  }));
}
export function canonicalIngredientId(value,vocabulary){
 const v=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim();
 return vocabulary.find(item=>[item.id.replaceAll('_',' '),item.name?.en,item.name?.it]
   .some(s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim()===v))?.id||null;
}
