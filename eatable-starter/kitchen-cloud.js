import { getCloudClient } from './cloud.js';

function db(){const client=getCloudClient();if(!client)throw Error('Supabase has not connected.');return client;}
export async function fetchKitchen(userId){
 const [pantry,shopping]=await Promise.all([
   db().from('user_pantry').select('ingredient_id').eq('user_id',userId),
   db().from('user_shopping_items').select('ingredient_id,quantity,unit,checked,created_at').eq('user_id',userId).order('created_at',{ascending:true})
 ]);
 if(pantry.error)throw pantry.error;if(shopping.error)throw shopping.error;
 return {pantry:(pantry.data||[]).map(x=>x.ingredient_id),shopping:shopping.data||[]};
}
export async function insertPantry(userId,ingredientId){
 const {error}=await db().from('user_pantry').upsert({user_id:userId,ingredient_id:ingredientId},{onConflict:'user_id,ingredient_id',ignoreDuplicates:true});
 if(error)throw error;
}
export async function deletePantry(userId,ingredientId){
 const {error}=await db().from('user_pantry').delete().eq('user_id',userId).eq('ingredient_id',ingredientId);
 if(error)throw error;
}
export async function insertShopping(userId,rows){
 if(!rows.length)return;
 const safe=rows.map(r=>({user_id:userId,ingredient_id:r.ingredient_id,quantity:r.quantity??null,unit:r.unit||'',checked:false}));
 const {error}=await db().from('user_shopping_items').upsert(safe,{onConflict:'user_id,ingredient_id,unit',ignoreDuplicates:true});
 if(error)throw error;
}
export async function updateShoppingChecked(userId,ingredientId,unit,checked){
 const {error}=await db().from('user_shopping_items').update({checked}).eq('user_id',userId).eq('ingredient_id',ingredientId).eq('unit',unit);
 if(error)throw error;
}
export async function deleteShopping(userId,ingredientId,unit){
 const {error}=await db().from('user_shopping_items').delete().eq('user_id',userId).eq('ingredient_id',ingredientId).eq('unit',unit);
 if(error)throw error;
}
// Move an item into the pantry BEFORE deleting it from the shopping list:
// a failed pantry insert leaves the shopping item intact.
export async function moveToPantry(userId,ingredientId,unit){
 await insertPantry(userId,ingredientId);
 await deleteShopping(userId,ingredientId,unit);
}
