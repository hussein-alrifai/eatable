// Eatable v34: shared recipe-detail metadata and shopping-list helpers.
// No nutrition values are fabricated. Legacy total-minute values remain usable.
import {shoppingLinesForRecipe} from './kitchen.js';

export function optionalNumber(value){
  if(value===null||value===undefined||String(value).trim()==='')return null;
  return Number(value);
}
export function splitMetadata(source){
  return {
    prep_time_minutes:optionalNumber(source?.prep_time_minutes),
    cook_time_minutes:optionalNumber(source?.cook_time_minutes),
    kcal_per_serving:optionalNumber(source?.kcal_per_serving)
  };
}
export function validateSplitMetadata(meta){
  const {prep_time_minutes:p,cook_time_minutes:c,kcal_per_serving:k}=splitMetadata(meta);
  if((p===null)!==(c===null))return 'Enter both preparation and cooking time, or leave both empty for an older recipe.';
  if(p!==null&&(!Number.isInteger(p)||p<0||p>720||!Number.isInteger(c)||c<0||c>720||p+c<1||p+c>720))return 'Preparation and cooking minutes must be whole numbers (0–720), with total 1–720.';
  if(k!==null&&(!Number.isFinite(k)||k<=0||k>20000))return 'kcal per serving must be a positive number up to 20000, or blank if unknown.';
  return '';
}
export function recipeMetrics(recipe){
  const fields=splitMetadata(recipe);
  const hasSplit=validateSplitMetadata({...fields,kcal_per_serving:null})===''&&fields.prep_time_minutes!==null;
  const legacy=Number(recipe?.time??recipe?.prep_minutes);
  const legacyTotal=Number.isFinite(legacy)&&legacy>0?legacy:null;
  const kcal=fields.kcal_per_serving!==null&&Number.isFinite(fields.kcal_per_serving)&&fields.kcal_per_serving>0?fields.kcal_per_serving:null;
  return {prepMinutes:hasSplit?fields.prep_time_minutes:null,cookMinutes:hasSplit?fields.cook_time_minutes:null,totalMinutes:hasSplit?fields.prep_time_minutes+fields.cook_time_minutes:legacyTotal,kcalPerServing:kcal,hasSplit};
}
export function totalMinutesFromFields(fields,legacyMinutes){
  const meta=splitMetadata(fields);
  if(meta.prep_time_minutes!==null&&meta.cook_time_minutes!==null)return meta.prep_time_minutes+meta.cook_time_minutes;
  return Number(legacyMinutes);
}
// Checkmarks on the visible recipe mean "I already have this" for this recipe.
// Combine them with the user's cloud pantry; don't write checkmarks to their pantry.
export function shoppingLinesFromSelection(recipe,pantryIds,checkedIndices,servings){
  const checkedIds=[...(checkedIndices||[])].map(index=>recipe?.ingredients?.[Number(index)]?.id).filter(Boolean);
  return shoppingLinesForRecipe(recipe,[...new Set([...(pantryIds||[]),...checkedIds])],servings);
}
