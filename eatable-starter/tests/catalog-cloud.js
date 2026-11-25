import {getCloudClient} from './cloud.js';

const db=()=>{const c=getCloudClient();if(!c)throw Error('Connect Supabase first.');return c;};
export const getCuratedCatalog=()=>db().from('eatable_curated_recipes').select('*').eq('published',true).order('title_en').limit(500);
// Fetch the complete ingredient vocabulary in deterministic pages.
// A single .limit(500) silently excludes valid IDs once the catalog grows.
export async function getIngredientVocabulary(){
 const pageSize=500;
 const maxRows=10000;
 const rows=[];
 for(let offset=0;offset<maxRows;offset+=pageSize){
  const {data,error}=await db().from('eatable_ingredients')
   .select('id,name_en,name_it')
   .order('id',{ascending:true})
   .range(offset,offset+pageSize-1);
  if(error)return {data:null,error};
  if(!Array.isArray(data))return {data:null,error:new Error('Ingredient response is not an array.')};
  rows.push(...data);
  if(data.length<pageSize)return {data:rows,error:null};
 }
 return {data:null,error:new Error('Ingredient catalog exceeds 10,000 rows; increase the pagination ceiling.')};
}
export const getCommunityIndexes=()=>db().from('eatable_community_index').select('*').limit(500);
export const saveCommunityIndex=(row)=>db().from('eatable_community_index').upsert(row,{onConflict:'community_id'}).select('community_id').single();
export const addIngredient=(row)=>db().from('eatable_ingredients').insert(row).select('id,name_en,name_it').single();
// Admin-only queries. Row-level security (not the UI) controls access to drafts/writes.
export const getAdminCuratedCatalog=()=>db().from('eatable_curated_recipes').select('*').order('updated_at',{ascending:false}).limit(500);
export const saveCuratedRecipe=(row)=>db().from('eatable_curated_recipes').upsert(row,{onConflict:'slug'}).select('slug,published').single();

// Private draft photography metadata: the new table has administrator-only RLS.
export const getAdminCuratedMedia=()=>db().from('eatable_curated_media').select('slug,photo_path').limit(500);
export const saveAdminCuratedMedia=(slug,photo_path)=>db().from('eatable_curated_media').upsert({slug,photo_path,updated_at:new Date().toISOString()},{onConflict:'slug'}).select('slug,photo_path').single();

// v9: insert-only batch draft import. A conflict never overwrites existing content.
export const insertCuratedDraft=(row)=>db().from('eatable_curated_recipes')
 .insert({...row,published:false,public_photo_path:null})
 .select('slug').single();
