import {getCloudClient} from './cloud.js';

const db=()=>{const c=getCloudClient();if(!c)throw Error('Connect Supabase first.');return c;};
// Admin-only, enforced by the `eatable_curated_reviews` database RLS policy.
export async function getCuratedReviews(){
 const rows=[],pageSize=500,maxRows=20000;
 for(let offset=0;offset<=maxRows;offset+=pageSize){
  const {data,error}=await db().from('eatable_curated_reviews')
   .select('slug,recipe_tested,quantities_checked,translations_checked,photo_rights_checked,origin_checked,editorial_note,reviewed_at')
   .order('slug',{ascending:true}).range(offset,offset+pageSize-1);
  if(error)return {data:null,error};rows.push(...(data||[]));
  if(!data||data.length<pageSize)return {data:rows,error:null};
 }
 return {data:null,error:new Error('Editorial reviews exceed 20,000 rows')};
}
export const upsertCuratedReview=(row)=>db().from('eatable_curated_reviews')
  .upsert(row,{onConflict:'slug'}).select('slug').single();
