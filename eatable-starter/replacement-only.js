// Fetch the complete ingredient vocabulary in deterministic pages.
// A single .limit(500) silently excludes valid IDs once the catalog grows.
export async function getIngredientVocabulary(){
 const pageSize=500;
 const maxRows=10000;
 const rows=[];
 for(let offset=0;offset<maxRows;offset+=pageSize){
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
