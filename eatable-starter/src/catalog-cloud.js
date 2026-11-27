import {getCloudClient} from './cloud.js';

const db=()=>{const c=getCloudClient();if(!c)throw Error('Connect Supabase first.');return c;};
// Read the entire published catalog in stable pages, not only the first 500 recipes.
export async function getCuratedCatalog(){
 const pageSize=500, maxRows=20000, rows=[];
 for(let offset=0;offset<=maxRows;offset+=pageSize){
  const {data,error}=await db().from('eatable_curated_recipes')
   .select('*').eq('published',true).order('slug',{ascending:true})
   .range(offset,offset+pageSize-1);
  if(error)return {data:null,error};
  if(!Array.isArray(data))return {data:null,error:new Error('Published recipes response is not an array.')};
  rows.push(...data);
  if(data.length<pageSize)return {data:rows,error:null};
 }
 return {data:null,error:new Error('Published recipe catalog exceeds 20,000 rows; use server-side search for larger catalogs.')};
}
// Fetch the complete ingredient vocabulary in deterministic pages.
// A single .limit(500) silently excludes valid IDs once the catalog grows.
export async function getIngredientVocabulary(){
 const pageSize=500;
 const maxRows=10000;
 const rows=[];
 for(let offset=0;offset<=maxRows;offset+=pageSize){
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
export async function getAdminCuratedCatalog(){
 const result=await fetchAllAdmin('eatable_curated_recipes','*');
 if(result.error)return result;
 return {data:result.data.sort((a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||''))),error:null};
}
async function fetchAllAdmin(table,cols){
 const rows=[],pageSize=500,maxRows=20000;
 for(let offset=0;offset<=maxRows;offset+=pageSize){
  const {data,error}=await db().from(table).select(cols).order('slug',{ascending:true}).range(offset,offset+pageSize-1);
  if(error)return {data:null,error};
  if(!Array.isArray(data))return {data:null,error:new Error('Invalid admin list response')};
  rows.push(...data);
  if(data.length<pageSize)return {data:rows,error:null};
 }
 return {data:null,error:new Error('Admin listing exceeds 20,000 records')};
}

export const saveCuratedRecipe=(row)=>db().from('eatable_curated_recipes').upsert(row,{onConflict:'slug'}).select('slug,published').single();

// Private draft photography metadata: the new table has administrator-only RLS.
export const getAdminCuratedMedia=()=>fetchAllAdmin('eatable_curated_media','slug,photo_path');
export const saveAdminCuratedMedia=(slug,photo_path)=>db().from('eatable_curated_media').upsert({slug,photo_path,updated_at:new Date().toISOString()},{onConflict:'slug'}).select('slug,photo_path').single();

// v9: insert-only batch draft import. A conflict never overwrites existing content.
export const insertCuratedDraft=(row)=>db().from('eatable_curated_recipes')
 .insert({...row,published:false,public_photo_path:null})
 .select('slug').single();

// Delete requires admin RLS plus migration 14 (authenticated DELETE grant).
export const deleteCuratedRecipe=slug=>db().from('eatable_curated_recipes').delete().eq('slug',slug).select('slug').single();
export const suggestIngredient=row=>db().from('eatable_ingredient_suggestions').insert(row);
export async function getIngredientSuggestions(){
 const rows=[],pageSize=500,maxRows=10000;
 for(let offset=0;offset<=maxRows;offset+=pageSize){
  const {data,error}=await db().from('eatable_ingredient_suggestions').select('id,name_en,note,status,created_at,author_id')
    .eq('status','pending').order('id',{ascending:true}).range(offset,offset+pageSize-1);
  if(error)return {data:null,error};rows.push(...(data||[]));
  if(!data||data.length<pageSize)return {data:rows.sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at))),error:null};
 }
 return {data:null,error:new Error('More than 10,000 pending ingredient requests')};
}
export const resolveIngredientSuggestion=(id,status)=>db().from('eatable_ingredient_suggestions').update({status}).eq('id',id).select('id').single();
