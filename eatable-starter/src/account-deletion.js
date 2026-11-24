// Eatable v24 — authenticated deletion requests; this module NEVER deletes an account.
import {getCloudClient} from './cloud.js';

const client=()=>{
  const c=getCloudClient();
  if(!c)throw new Error('Supabase is not connected.');
  return c;
};

const messages={
  en:{title:'Request account deletion',subtitle:'Ask us to remove your Eatable account and applicable personal data.',
    intro:'This sends a private request to the Eatable administrator. It does not immediately delete your account.',
    pending:'Your request has been received.',in_review:'Your request is being reviewed.',
    next:'We will assess your account, recipe contributions and photographs before deleting applicable data. We may contact you at your account email to verify your identity or clarify your request.',
    note:'Optional information',noteHint:'Do not include passwords, identity documents or sensitive information.',
    confirm:'I understand this is a deletion request, not immediate account deletion.',submit:'Submit deletion request',
    loading:'Checking your request…',failed:'Could not check your request. Please contact support.',
    error:'Could not submit the request. Please try again or email support.',
    signIn:'Sign in to request deletion from your account.',signInLink:'Go to account',
    privacy:'Read Privacy Policy',support:'For data access, correction or urgent privacy enquiries, email',
    status:'Request status',requestedAt:'Submitted',already:'An active request already exists.',
    sent:'Your request was submitted successfully.'},
  it:{title:'Richiedi eliminazione account',subtitle:'Chiedi di eliminare il tuo account Eatable e i dati personali pertinenti.',
    intro:'La richiesta viene inviata in modo riservato all’amministratore di Eatable. Il tuo account non sarà eliminato immediatamente.',
    pending:'Abbiamo ricevuto la tua richiesta.',in_review:'La tua richiesta è in fase di valutazione.',
    next:'Verificheremo account, ricette condivise e fotografie prima di eliminare i dati pertinenti. Potremmo contattarti all’indirizzo email dell’account per verificare l’identità o chiarire la richiesta.',
    note:'Informazioni aggiuntive (facoltative)',noteHint:'Non inserire password, documenti di identità o dati sensibili.',
    confirm:'Comprendo che questa è una richiesta, non l’eliminazione immediata dell’account.',submit:'Invia richiesta di eliminazione',
    loading:'Verifica della richiesta…',failed:'Impossibile verificare la richiesta. Contatta l’assistenza.',
    error:'Impossibile inviare la richiesta. Riprova oppure scrivi all’assistenza.',
    signIn:'Accedi per richiedere l’eliminazione dal tuo account.',signInLink:'Vai all’account',
    privacy:'Leggi l’informativa sulla privacy',support:'Per accesso ai dati, rettifica o richieste urgenti, scrivi a',
    status:'Stato della richiesta',requestedAt:'Invio',already:'Esiste già una richiesta attiva.',
    sent:'Richiesta inviata correttamente.'}
};
export const deletionText=(lang,key)=>messages[lang]?.[key]||messages.en[key]||key;
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export async function getActiveDeletionRequest(userId){
  const {data,error}=await client().from('eatable_deletion_requests')
    .select('id,status,requested_at').eq('user_id',userId)
    .in('status',['pending','in_review']).order('requested_at',{ascending:false})
    .limit(1).maybeSingle();
  if(error)throw error;
  return data||null;
}
export async function createDeletionRequest(userId,note){
  const safeNote=String(note||'').trim();
  if(safeNote.length>500)throw new Error('Note must be 500 characters or fewer.');
  const {data,error}=await client().from('eatable_deletion_requests')
    .insert({user_id:userId,note:safeNote||null})
    .select('id,status,requested_at').single();
  if(error)throw error;
  return data;
}
export function deletionPageHtml(lang,{user,request,loading=false,busy=false,error=''}){
  const x=k=>escapeHtml(deletionText(lang,k));
  const prefix=lang==='it'?'/it':'/en';
  const support='<a href="mailto:eatable.support@gmail.com">eatable.support@gmail.com</a>';
  if(!user)return `<div class="auth-card"><p>${x('signIn')}</p><a class="btn btn-primary" href="${prefix}/account" data-link>${x('signInLink')}</a></div>`;
  if(loading)return `<div class="auth-card" role="status"><p>${x('loading')}</p></div>`;
  const status=request?.status==='in_review'?'in_review':'pending';
  const errorHtml=error?`<p class="notice" role="alert">${escapeHtml(error)}</p>`:'';
  if(request)return `<div class="auth-card"><h2>${x(status)}</h2><p>${x('next')}</p><p class="muted small">${x('status')}: <strong>${x(status)}</strong></p><p class="muted small">${x('requestedAt')}: ${escapeHtml(new Date(request.requested_at).toLocaleDateString(lang==='it'?'it-IT':'en-GB'))}</p><p>${x('support')} ${support}.</p><p><a href="${prefix}/privacy" data-link>${x('privacy')}</a></p></div>`;
  return `<div class="auth-card"><p>${x('intro')}</p>${errorHtml}<form id="eatable-account-deletion-request"><label for="eatable-deletion-note">${x('note')}</label><textarea class="input" id="eatable-deletion-note" name="note" rows="3" maxlength="500" aria-describedby="eatable-deletion-help"></textarea><p class="muted small" id="eatable-deletion-help">${x('noteHint')}</p><label class="v24-consent"><input type="checkbox" name="confirm" required/> ${x('confirm')}</label><button type="submit" class="btn btn-outline" ${busy?'disabled':''}>${x('submit')}</button></form><p class="muted small" style="margin-top:18px">${x('support')} ${support}.</p><p><a href="${prefix}/privacy" data-link>${x('privacy')}</a></p></div>`;
}
