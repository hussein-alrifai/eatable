import {getCloudClient} from './cloud.js';
const db=()=>{const client=getCloudClient();if(!client)throw new Error('Connect Supabase first.');return client;};
export const getPublished=()=>db().from('community_recipes').select('*').order('published_at',{ascending:false}).limit(100);
export const getMySubmissions=uid=>db().from('recipe_submissions').select('*').eq('author_id',uid).order('created_at',{ascending:false}).limit(100);
export const getAdminSubmissions=()=>db().from('recipe_submissions').select('*').order('created_at',{ascending:false}).limit(100);
export const getIsAdmin=()=>db().rpc('eatable_is_admin');
export const submitCommunityRecipe=payload=>db().from('recipe_submissions').insert(payload).select('id,status').single();
export const reviseCommunityRecipe=(id,uid,payload)=>db().from('recipe_submissions').update({...payload,status:'pending'}).eq('id',id).eq('author_id',uid).eq('status','changes_requested').select('id,status');
export const moderateRecipe=(id,status,note,publicPhotoPath=null)=>db().from('recipe_submissions')
  .update({status,moderation_note:note,reviewed_at:new Date().toISOString(),public_photo_path:publicPhotoPath})
  .eq('id',id).select('id,status');
