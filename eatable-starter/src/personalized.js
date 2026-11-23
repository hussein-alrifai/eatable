/* Eatable v15 — transparent, private, rules-based suggestions.
 * No external AI calls and no user preference data sent to analytics.
 */
export function personalizedPicks(catalog, favorites = [], pantry = [], limit = 8) {
  const list = Array.isArray(catalog) ? catalog : [];
  const saved = new Set(favorites);
  const pantrySet = new Set(pantry);
  const favoriteRecipes = list.filter(r => saved.has(r.id));
  if (!favoriteRecipes.length && !pantrySet.size) return [];
  const favoredCuisines = new Map();
  const favoredIngredients = new Map();
  for (const recipe of favoriteRecipes) {
    favoredCuisines.set(recipe.cuisine, (favoredCuisines.get(recipe.cuisine) || 0) + 1);
    for (const i of recipe.ingredients || []) {
      if (i.id) favoredIngredients.set(i.id, (favoredIngredients.get(i.id) || 0) + 1);
    }
  }
  return list.filter(r => !saved.has(r.id) && r.searchable !== false).map(recipe => {
    const ids = [...new Set((recipe.ingredients || []).map(x => x.id).filter(Boolean))];
    const pantryMatches = ids.filter(id => pantrySet.has(id)).length;
    const commonIngredients = ids.filter(id => favoredIngredients.has(id)).length;
    const cuisineAffinity = Math.min(favoredCuisines.get(recipe.cuisine) || 0, 4);
    // Pantry matches indicate ingredient presence, NOT sufficiency of quantities.
    const score = cuisineAffinity * 5 + Math.min(commonIngredients, 4) * 2 +
      (ids.length ? (pantryMatches / ids.length) * 6 : 0);
    let reason = 'similar';
    if (pantryMatches && pantryMatches / Math.max(1, ids.length) >= .5) reason = 'pantry';
    else if (cuisineAffinity) reason = 'cuisine';
    else if (commonIngredients) reason = 'ingredients';
    return {recipe, score, reason, pantryMatches, requiredCount:ids.length};
  }).filter(x => x.score > 0).sort((a,b)=>b.score - a.score ||
    String(a.recipe.id).localeCompare(String(b.recipe.id))).slice(0, Math.max(0,limit));
}
export function validCollectionName(name) {
  const text = String(name || '').trim().replace(/\s+/g,' ');
  if (!text || text.length > 60) throw new Error('Collection names must contain 1–60 characters.');
  return text;
}
