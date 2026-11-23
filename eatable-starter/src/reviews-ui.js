// Pure UI and validation logic. No browser state or Supabase dependencies.
export const reviewCopy={
 en:{heading:'Ratings & Reviews',write:'Leave a rating',your:'Your rating',rating:'Rating',comment:'Your cooking experience (optional)',placeholder:'What worked well? Any useful tips?',send:'Post review',update:'Update review',remove:'Delete my review',empty:'No reviews yet. Be the first to rate this recipe.',signIn:'Sign in to rate this recipe',loading:'Loading reviews…',error:'Could not load reviews. Please try again.',average:'Average rating',reviews:'reviews',review:'review',member:'Community member',you:'You',hidden:'Hidden by moderation',hide:'Hide review',show:'Restore review',saving:'Saving…',updated:'Review saved.',deleted:'Review deleted.',moderated:'Review visibility updated.',reviewNote:'Reviews reflect individual cooking experiences.',select:'Choose a rating from 1 to 5 stars.',tooLong:'Your comment must be 1,200 characters or fewer.',unavailable:'Ratings become available when Supabase is connected.',deleteConfirm:'Delete your review?',limited:'Showing the latest 30 reviews.'},
 it:{heading:'Valutazioni e recensioni',write:'Lascia una valutazione',your:'La tua valutazione',rating:'Valutazione',comment:'La tua esperienza in cucina (facoltativa)',placeholder:'Com’è andata? Hai consigli utili?',send:'Pubblica recensione',update:'Aggiorna recensione',remove:'Elimina la mia recensione',empty:'Ancora nessuna recensione. Valuta questa ricetta per primo.',signIn:'Accedi per valutare la ricetta',loading:'Caricamento recensioni…',error:'Impossibile caricare le recensioni. Riprova.',average:'Valutazione media',reviews:'recensioni',review:'recensione',member:'Membro della community',you:'Tu',hidden:'Nascosta dalla moderazione',hide:'Nascondi recensione',show:'Ripristina recensione',saving:'Salvataggio…',updated:'Recensione salvata.',deleted:'Recensione eliminata.',moderated:'Visibilità della recensione aggiornata.',reviewNote:'Le recensioni riflettono esperienze personali in cucina.',select:'Scegli una valutazione da 1 a 5 stelle.',tooLong:'Il commento non deve superare 1.200 caratteri.',unavailable:'Le valutazioni sono disponibili quando Supabase è collegato.',deleteConfirm:'Vuoi eliminare la tua recensione?',limited:'Sono mostrate le 30 recensioni più recenti.'}
};
export const rText=(language,key)=>reviewCopy[language]?.[key]||reviewCopy.en[key]||key;
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function reviewTarget(recipe){
 if(!recipe)return null;
 if(recipe.source==='community'&&/^[0-9a-f-]{36}$/i.test(recipe.communityId||''))return {kind:'community',key:recipe.communityId};
 if(recipe.source!=='community'&&/^[a-z0-9]+(-[a-z0-9]+)*$/.test(recipe.id||''))return {kind:'curated',key:recipe.id};
 return null;
}
export const reviewCacheKey=(target)=>target?`${target.kind}:${target.key}`:'';
export function validateReview(rating,body){
 const n=Number(rating),text=String(body||'').trim();
 if(!Number.isInteger(n)||n<1||n>5)throw Error('invalid-rating');
 if(text.length>1200)throw Error('too-long');
 return {rating:n,body:text};
}
export function reviewSection({language='en',recipe,userId=null,isAdmin=false,cloudConfigured=true,status='idle',data=null}){
 const txt=k=>rText(language,k);
 if(!reviewTarget(recipe))return '';
 const loaded=status==='ready'&&data;
 const count=loaded?Number(data.summary?.review_count)||0:0;
 const avg=loaded?Number(data.summary?.average_rating)||0:0;
 const mine=loaded?data.mine:null;
 const stars=r=>`<span class="v13-stars" aria-label="${r} / 5">${'★'.repeat(Math.max(0,Math.min(5,r)))}${'☆'.repeat(Math.max(0,5-r))}</span>`;
 const fmtDate=value=>{const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleDateString(language==='it'?'it-IT':'en-GB',{year:'numeric',month:'short',day:'numeric'});};
 const rows=(loaded?data.rows:[])||[];
 const commentHtml=rows.map(row=>{
   const yours=row.user_id===userId,hidden=!row.is_visible;
   return `<article class="v13-review-item"><div class="v13-review-head"><strong>${yours?txt('you'):txt('member')}</strong>${stars(Number(row.rating))}<span class="muted small">${escapeHtml(fmtDate(row.updated_at||row.created_at))}</span></div>${hidden?`<span class="pill">${txt('hidden')}</span>`:''}${row.body?`<p class="v13-review-body">${escapeHtml(row.body)}</p>`:''}${isAdmin?`<button class="plain-btn v13-review-moderate" data-action="review-moderate" data-review-id="${escapeHtml(row.id)}" data-review-visible="${hidden?'true':'false'}">${hidden?txt('show'):txt('hide')}</button>`:''}</article>`;
 }).join('');
 const options=[1,2,3,4,5].map(n=>`<label class="v13-star-option"><input type="radio" name="rating" value="${n}" ${Number(mine?.rating)===n?'checked':''} required/><span>${n} ★</span></label>`).join('');
 const form=loaded&&userId?`<form id="v13-review-form" class="v13-review-form"><h3>${txt(mine?'your':'write')}</h3><fieldset class="v13-star-field"><legend>${txt('rating')}</legend><div class="v13-star-options">${options}</div></fieldset><label for="v13-review-comment">${txt('comment')}</label><textarea id="v13-review-comment" class="input" name="body" rows="3" maxlength="1200" placeholder="${escapeHtml(txt('placeholder'))}">${escapeHtml(mine?.body||'')}</textarea><div class="v13-review-buttons"><button class="btn btn-primary" type="submit">${txt(mine?'update':'send')}</button>${mine?`<button class="btn btn-outline" type="button" data-action="review-delete">${txt('remove')}</button>`:''}</div></form>`:loaded?`<p><a class="btn btn-outline" data-link href="/${language}/account">${txt('signIn')}</a></p>`:'';
 return `<section class="section v13-reviews" id="ratings-reviews" aria-labelledby="v13-reviews-title"><div class="section-heading"><h2 id="v13-reviews-title">${txt('heading')}</h2></div>${!cloudConfigured?`<p class="muted">${txt('unavailable')}</p>`:status==='loading'||status==='idle'?`<p class="muted" role="status">${txt('loading')}</p>`:status==='error'?`<p class="notice" role="alert">${txt('error')}</p><button class="btn btn-outline" data-action="review-retry">↻</button>`:`<div class="v13-review-overview"><div class="v13-average"><strong>${count?avg.toFixed(1):'—'}</strong><div>${stars(count?Math.round(avg):0)}<p class="muted small">${count} ${txt(count===1?'review':'reviews')}</p></div></div><p class="muted small">${txt('reviewNote')}</p></div>${form}<div class="v13-review-list">${rows.length?commentHtml:`<p class="muted">${txt('empty')}</p>`}</div>${rows.length>=30?`<p class="muted small">${txt('limited')}</p>`:''}`}</section>`;
}
