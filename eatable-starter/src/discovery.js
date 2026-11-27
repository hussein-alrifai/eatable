import {ingredients,ingredientById,cuisines,normalize} from './recipes.js';

// Adapt both database sources to a single render/search model; preserve original
// community-submission IDs so existing /community/<uuid> links do not break.
export function curatedFromDb(r){
  return {
    id:r.slug, source:'curated', name:{en:r.title_en,it:r.title_it||r.title_en},
    description:{en:r.description_en,it:r.description_it||r.description_en},
    cuisine:r.cuisine,category:r.category,diet:r.diet,time:r.prep_minutes,prep_time_minutes:r.prep_time_minutes??null,cook_time_minutes:r.cook_time_minutes??null,kcal_per_serving:r.kcal_per_serving??null,
    serves:r.servings, ingredients:Array.isArray(r.ingredients)?r.ingredients:[],
    steps:Array.isArray(r.steps)?r.steps:[],
    emoji:r.emoji||'🍲', theme:r.theme||'cream',public_photo_path:r.public_photo_path||null,searchable:true
  };
}
export const communityKey=uuid=>'community-'+uuid;
export function communityFromDb(r,index){
  const origin=normalize(r.origin);
  const aliases={
    Lebanese:['lebanon','libano','libanese','liban'],
    Italian:['italy','italia','italiana','italiano'],
    Indian:['india','indiana','indiano'],
    Japanese:['japan','giappone','giapponese'],
    Mexican:['mexico','messico','messicana','messicano'],
    Greek:['greece','grecia','greca','greco'],
    Spanish:['spain','spagna','spagnola','spagnolo']
  };
  const matchedCuisine=cuisines.find(c=>normalize(c.id)===origin||(aliases[c.id]||[]).includes(origin));
  const ids=Array.isArray(index?.ingredient_ids)?index.ingredient_ids:[];
  const raw=Array.isArray(r.ingredients)?r.ingredients.map(String):[];
  const indexed=ids.length===raw.length&&raw.length>=2&&ids.every(id=>ingredientById[id]);
  return {
    id:communityKey(r.id),source:'community',communityId:r.id,
    name:{en:r.title_en,it:r.title_it||r.title_en},
    description:{en:r.description_en,it:r.description_it||r.description_en},
    cuisine:index?.cuisine||matchedCuisine?.id||'Other',diet:index?.diet||'unknown',
    category:r.category,time:r.prep_minutes,serves:r.servings,prep_time_minutes:r.prep_time_minutes??null,cook_time_minutes:r.cook_time_minutes??null,kcal_per_serving:r.kcal_per_serving??null,
    rawIngredients:raw,
    ingredients:indexed?ids.map(id=>({id,qty:null,unit:''})):[],
    steps:(Array.isArray(r.steps)?r.steps:[]).map(s=>({en:String(s),it:String(s)})),
    emoji:'🍲',theme:'cream', public_photo_path:r.public_photo_path,
    searchable:indexed,
    indexed
  };
}
export function mergeVocabulary(rows){
  for(const r of rows||[]){
    if(!/^[a-z][a-z0-9_]{0,63}$/.test(r.id))continue;
    const row={id:r.id,name:{en:r.name_en,it:r.name_it}};
    const known=ingredients.find(i=>i.id===r.id);
    if(known) known.name=row.name;
    else ingredients.push(row);
    ingredientById[r.id]=known||row;
  }
  ingredients.sort((a,b)=>a.name.en.localeCompare(b.name.en));
}

// These are suggestions ONLY: the administrator must inspect and save a mapping
// for every submitted ingredient line before the recipe joins ingredient search.
export function suggestCanonicalIngredient(raw){
  const s=' '+normalize(raw)+' ';
  const candidates=ingredients.filter(ingredient=>[
    ingredient.name.en, ingredient.name.it, ingredient.id.replaceAll('_',' ')
  ].some(name=>name&&s.includes(' '+normalize(name)+' ')));
  candidates.sort((a,b)=>b.name.en.length-a.name.en.length);
  return candidates.length===1?candidates[0].id:'';
}
