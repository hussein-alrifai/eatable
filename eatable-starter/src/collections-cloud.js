import {getCloudClient} from './cloud.js';
const db = () => {const client=getCloudClient();if(!client)throw Error('Supabase is not connected.');return client;};
const ensure = (result) => {if(result.error)throw result.error;return result.data || [];};
export async function fetchCollections(userId) {
  const [collections,items]=await Promise.all([
    db().from('eatable_user_collections').select('id,name,created_at').eq('user_id',userId).order('created_at',{ascending:true}),
    db().from('eatable_collection_items').select('collection_id,recipe_id').eq('user_id',userId)
  ]);
  return {collections:ensure(collections),items:ensure(items)};
}
export async function createCollection(userId,name){
  ensure(await db().from('eatable_user_collections').insert({user_id:userId,name}).select('id'));
}
export async function renameCollection(userId,id,name){
  ensure(await db().from('eatable_user_collections').update({name}).eq('user_id',userId).eq('id',id).select('id'));
}
export async function removeCollection(userId,id){
  ensure(await db().from('eatable_user_collections').delete().eq('user_id',userId).eq('id',id).select('id'));
}
export async function addToCollection(userId,collectionId,recipeId){
  ensure(await db().from('eatable_collection_items').upsert(
    {user_id:userId,collection_id:collectionId,recipe_id:recipeId},
    {onConflict:'collection_id,recipe_id',ignoreDuplicates:true}
  ));
}
export async function removeFromCollection(userId,collectionId,recipeId){
  ensure(await db().from('eatable_collection_items').delete()
    .eq('user_id',userId).eq('collection_id',collectionId).eq('recipe_id',recipeId).select('recipe_id'));
}
