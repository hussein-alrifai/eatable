import {getCloudClient} from './cloud.js';

const db=()=>{const c=getCloudClient();if(!c)throw Error('Connect Supabase first.');return c;};
export const getCuratedCatalog=()=>db().from('eatable_curated_recipes').select('*').eq('published',true).order('title_en').limit(500);
export const getIngredientVocabulary=()=>db().from('eatable_ingredients').select('id,name_en,name_it').order('name_en').limit(500);
export const getCommunityIndexes=()=>db().from('eatable_community_index').select('*').limit(500);
export const saveCommunityIndex=(row)=>db().from('eatable_community_index').upsert(row,{onConflict:'community_id'}).select('community_id').single();
export const addIngredient=(row)=>db().from('eatable_ingredients').insert(row).select('id,name_en,name_it').single();
// Admin-only queries. Row-level security (not the UI) controls access to drafts/writes.
export const getAdminCuratedCatalog=()=>db().from('eatable_curated_recipes').select('*').order('updated_at',{ascending:false}).limit(500);
export const saveCuratedRecipe=(row)=>db().from('eatable_curated_recipes').upsert(row,{onConflict:'slug'}).select('slug,published').single();

// Private draft photography metadata: the new table has administrator-only RLS.
export const getAdminCuratedMedia=()=>db().from('eatable_curated_media').select('slug,photo_path').limit(500);
export const saveAdminCuratedMedia=(slug,photo_path)=>db().from('eatable_curated_media').upsert({slug,photo_path,updated_at:new Date().toISOString()},{onConflict:'slug'}).select('slug,photo_path').single();
