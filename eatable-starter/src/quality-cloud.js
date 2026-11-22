import {getCloudClient} from './cloud.js';

const db=()=>{const c=getCloudClient();if(!c)throw Error('Connect Supabase first.');return c;};
// Admin-only, enforced by the `eatable_curated_reviews` database RLS policy.
export const getCuratedReviews=()=>db().from('eatable_curated_reviews')
  .select('slug,recipe_tested,quantities_checked,translations_checked,photo_rights_checked,origin_checked,editorial_note,reviewed_at')
  .limit(500);
export const upsertCuratedReview=(row)=>db().from('eatable_curated_reviews')
  .upsert(row,{onConflict:'slug'}).select('slug').single();
