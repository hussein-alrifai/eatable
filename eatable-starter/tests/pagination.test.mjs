import test from 'node:test';
import assert from 'node:assert/strict';
import {getCuratedCatalog,getIngredientVocabulary,getAdminCuratedCatalog,getAdminCuratedMedia} from './catalog-cloud.js';
function mockResponse(records){
 return {from:()=>({
   select(){return this},eq(){return this},order(){return this},
   async range(start,end){return {data:records.slice(start,end+1),error:null}}
 })};
}
test('published recipes are fetched beyond 500 and maintain deterministic paging', async()=>{
 const rows=Array.from({length:1204},(_,i)=>({slug:`recipe-${String(i).padStart(5,'0')}`,published:true}));
 globalThis.__mockCloudClient=mockResponse(rows);
 const result=await getCuratedCatalog();
 assert.equal(result.error,null);
 assert.equal(result.data.length,1204);
 assert.deepEqual(result.data[0],rows[0]);
 assert.deepEqual(result.data.at(-1),rows.at(-1));
});
test('ingredient pagination is retained, including exactly 10000 ingredients',async()=>{
 const rows=Array.from({length:10000},(_,i)=>({id:`ingredient_${i}`}));
 globalThis.__mockCloudClient=mockResponse(rows);
 const result=await getIngredientVocabulary();
 assert.equal(result.error,null);
 assert.equal(result.data.length,10000);
});

test('admin curated recipes and photo metadata load beyond old 500-row cap',async()=>{
 const rows=Array.from({length:1301},(_,i)=>({slug:`recipe-${String(i).padStart(5,'0')}`,updated_at:`2026-11-${String((i%27)+1).padStart(2,'0')}T00:00:00Z`}));
 globalThis.__mockCloudClient=mockResponse(rows);
 const curated=await getAdminCuratedCatalog();
 const photos=await getAdminCuratedMedia();
 assert.equal(curated.error,null);assert.equal(photos.error,null);
 assert.equal(curated.data.length,1301);assert.equal(photos.data.length,1301);
 assert.ok(curated.data[0].updated_at>=curated.data.at(-1).updated_at);
});
