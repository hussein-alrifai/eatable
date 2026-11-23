import {getCloudClient} from './cloud.js';
const db=()=>{const client=getCloudClient();if(!client)throw Error('Supabase connection is not ready.');return client;};
const check=({error,data},context)=>{if(error)throw new Error(`${context}: ${error.message}`);return data;};
export async function readReviewBundle(target,userId){
 const client=db(),filter=query=>query.eq('recipe_kind',target.kind).eq('recipe_key',target.key);
 const [rows,summary,mine]=await Promise.all([
  filter(client.from('eatable_recipe_reviews').select('id,user_id,rating,body,is_visible,created_at,updated_at'))
   .order('created_at',{ascending:false}).limit(30),
  client.rpc('eatable_review_summary',{p_kind:target.kind,p_key:target.key}),
  userId?filter(client.from('eatable_recipe_reviews').select('id,user_id,rating,body,is_visible,created_at,updated_at'))
   .eq('user_id',userId).maybeSingle():Promise.resolve({data:null,error:null})
 ]);
 return {rows:check(rows,'Reviews')||[],summary:check(summary,'Review summary')?.[0]||{review_count:0,average_rating:0},mine:check(mine,'Your review')};
}
export async function saveReview(target,userId,rating,body,mine){
 const client=db();
 const result=mine?await client.from('eatable_recipe_reviews').update({rating,body})
  .eq('id',mine.id).eq('user_id',userId).select('id').single()
  :await client.from('eatable_recipe_reviews').insert({user_id:userId,recipe_kind:target.kind,recipe_key:target.key,rating,body})
  .select('id').single();
 return check(result,'Save review');
}
export async function deleteReview(id,userId){
 return check(await db().from('eatable_recipe_reviews').delete().eq('id',id).eq('user_id',userId).select('id').single(),'Delete review');
}
export async function setReviewVisibility(id,isVisible){
 return check(await db().from('eatable_recipe_reviews').update({is_visible:isVisible}).eq('id',id).select('id').single(),'Moderate review');
}
