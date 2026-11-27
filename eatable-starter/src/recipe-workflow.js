// Pure, read-only completeness checks. This is NOT food safety or culinary validation.
const present=x=>typeof x==='string'&&x.trim().length>0;
const allowedUnits=new Set(['g','kg','ml','l','pcs','tsp','tbsp']);
export function assessRecipe(r,knownIds){
 const issues=[];
 const photo=!!(r.published?r.public_photo_path:(r.public_photo_path||r.photo_path));
 if(!photo)issues.push('photo');
 if(!present(r.title_en)||!present(r.title_it)||!present(r.description_en)||!present(r.description_it)) issues.push('translations');
 const lines=Array.isArray(r.ingredients)?r.ingredients:[];
 if(!lines.length||lines.some(x=>!x||!present(x.id)||!knownIds.has(x.id)||!Number.isFinite(Number(x.qty))||Number(x.qty)<=0||!allowedUnits.has(x.unit))||new Set(lines.map(x=>x.id)).size!==lines.length)issues.push('ingredients');
 const steps=Array.isArray(r.steps)?r.steps:[];
 if(!steps.length||steps.some(x=>!x||!present(x.en)||!present(x.it)))issues.push('instructions');
 if(!present(r.cuisine)||r.cuisine==='Other'||!present(r.category)||!Number.isInteger(Number(r.prep_minutes))||Number(r.prep_minutes)<1||!Number.isInteger(Number(r.servings))||Number(r.servings)<1||r.diet==='unknown'||!present(r.diet))issues.push('metadata');
 return {complete:issues.length===0,issues, timeToVerify:Number(r.prep_minutes)>=90};
}
export function workflowGroups(rows,ids){
 const all=rows.map(recipe=>({recipe,...assessRecipe(recipe,ids)}));
 return {all,needs:all.filter(r=>!r.complete),complete:all.filter(r=>r.complete),time:all.filter(r=>r.timeToVerify)};
}
