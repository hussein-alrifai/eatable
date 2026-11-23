import {getCloudClient} from './cloud.js';

/** Aggregate counts ONLY; never query other members' private favorites directly. */
export async function fetchDiscoveryStats(){
  const client=getCloudClient();
  if(!client)throw Error('Supabase is not connected.');
  const {data,error}=await client.rpc('eatable_discovery_stats');
  if(error)throw error;
  const out={};
  for(const item of data||[]){
    if(item.recipe_kind!=='curated'&&item.recipe_kind!=='community')continue;
    out[`${item.recipe_kind}:${item.recipe_key}`]={
      review_count:Math.max(0,Number(item.review_count)||0),
      average_rating:Number(item.average_rating)||0,
      favorite_count:Math.max(0,Number(item.favorite_count)||0),
      published_at:item.published_at||null
    };
  }
  return out;
}
