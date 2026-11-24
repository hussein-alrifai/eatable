// Eatable v20: accessible public problem report form. No credentials are stored here.
const copy={
 en:{nav:'Report a problem',eyebrow:'HELP IMPROVE EATABLE',title:'Something not working?',intro:'Tell us what happened. We will send your report to the Eatable support inbox. You do not need an account.',category:'What is the problem?',placeholder:'Select a category',bug:'Website bug',recipe:'Incorrect recipe',login:'Login or account',shopping:'Shopping list or My Kitchen',other:'Other issue',subject:'Short title',subjectPh:'Example: My saved recipes do not load',description:'Describe the problem',descriptionPh:'What happened? What did you expect? What steps can we follow to reproduce it?',page:'Page where it happened',name:'Name (optional)',email:'Email for a reply (optional)',privacy:'Only include information necessary to explain the issue. Do not send passwords, payment data or information about other people.',send:'Send report',sending:'Sending…',required:'Please complete a title (5–120 characters) and description (20–3000 characters).',invalidEmail:'Enter a valid contact email, or leave this field empty.',captcha:'Complete the anti-spam check before sending.',configuring:'Checking the report service…',unavailable:'The reporting service is not configured yet. Please try again later.',captchaError:'Could not load the anti-spam check. Please try again.',sent:'Report sent. Thank you for helping improve Eatable.',failed:'Could not send your report. Please try again in a moment.',network:'Connection error. Please try again.',contact:'Your contact information is optional. If you provide an email address, we may use it to reply about this report.'},
 it:{nav:'Segnala un problema',eyebrow:'AIUTACI A MIGLIORARE EATABLE',title:'Qualcosa non funziona?',intro:'Descrivici cosa è successo. Invieremo la segnalazione alla casella di supporto Eatable. Non serve un account.',category:'Qual è il problema?',placeholder:'Seleziona una categoria',bug:'Problema tecnico del sito',recipe:'Errore in una ricetta',login:'Accesso o account',shopping:'Lista della spesa o La mia cucina',other:'Altro problema',subject:'Titolo breve',subjectPh:'Esempio: Non riesco a vedere le ricette salvate',description:'Descrivi il problema',descriptionPh:'Cosa è successo? Cosa ti aspettavi? Quali passaggi possono riprodurre il problema?',page:'Pagina in cui è successo',name:'Nome (facoltativo)',email:'Email per una risposta (facoltativa)',privacy:'Inserisci solo le informazioni necessarie. Non inviare password, dati di pagamento o informazioni su altre persone.',send:'Invia segnalazione',sending:'Invio in corso…',required:'Inserisci un titolo (5–120 caratteri) e una descrizione (20–3000 caratteri).',invalidEmail:'Inserisci un indirizzo email valido oppure lascia il campo vuoto.',captcha:'Completa il controllo antispam prima di inviare.',configuring:'Verifica del servizio segnalazioni…',unavailable:'Il servizio di segnalazione non è ancora configurato. Riprova più tardi.',captchaError:'Impossibile caricare il controllo antispam. Riprova.',sent:'Segnalazione inviata. Grazie per aiutarci a migliorare Eatable.',failed:'Impossibile inviare la segnalazione. Riprova tra poco.',network:'Errore di connessione. Riprova.' ,contact:'L’email è facoltativa. Se la inserisci, potremmo usarla per rispondere alla segnalazione.'}
};
export const reportText=(lang,key)=>copy[lang]?.[key]??copy.en[key]??key;
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
// Only a site-local pathname may be included in a report link; never copy a URL with secrets.
export function safePagePath(value){
  const valueString=String(value||'');
  if(!/^\/(en|it)(\/|$)/.test(valueString)||valueString.length>300||/[\r\n<>]/.test(valueString))return '';
  return valueString.split('?')[0].split('#')[0];
}
export function reportPageHtml(lang='en',user=null,from=''){
 const t=k=>reportText(lang,k);
 const page=safePagePath(from);
 const opts=[['',t('placeholder')],['bug',t('bug')],['recipe',t('recipe')],['account',t('login')],['shopping',t('shopping')],['other',t('other')]];
 const email=typeof user?.email==='string'?user.email.slice(0,254):'';
 return `<section class="page-hero v20-report-heading"><div class="container"><div class="eyebrow">${t('eyebrow')}</div><h1>${t('title')}</h1><p>${t('intro')}</p></div></section>
 <section class="section v20-report-section"><div class="container"><div class="v20-report-card">
 <form id="eatable-problem-report" novalidate>
 <label for="report-category">${t('category')} <span aria-hidden="true">*</span></label>
 <select class="input" id="report-category" name="category" required>${opts.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>
 <label for="report-title">${t('subject')} <span aria-hidden="true">*</span></label><input class="input" id="report-title" name="title" required minlength="5" maxlength="120" placeholder="${escapeHtml(t('subjectPh'))}"/>
 <label for="report-description">${t('description')} <span aria-hidden="true">*</span></label><textarea class="input" id="report-description" name="description" rows="6" minlength="20" maxlength="3000" required placeholder="${escapeHtml(t('descriptionPh'))}"></textarea>
 <label for="report-page">${t('page')}</label><input class="input" id="report-page" name="page" maxlength="300" value="${escapeHtml(page)}" placeholder="/en/recipes/..."/>
 <div class="v20-report-two"><div><label for="report-name">${t('name')}</label><input class="input" id="report-name" name="name" autocomplete="name" maxlength="80"/></div>
 <div><label for="report-email">${t('email')}</label><input class="input" type="email" id="report-email" name="email" autocomplete="email" maxlength="254" value="${escapeHtml(email)}"/></div></div>
 <div class="v20-honeypot" aria-hidden="true"><label for="report-website">Leave empty</label><input tabindex="-1" autocomplete="off" id="report-website" name="website"/></div>
 <p class="muted small">${t('contact')} ${t('privacy')}</p>
 <div id="eatable-turnstile" aria-label="Anti-spam verification"></div>
 <p id="eatable-report-status" role="status" aria-live="polite" class="v20-report-status">${t('configuring')}</p>
 <button type="submit" class="btn btn-primary" id="eatable-report-submit" disabled>${t('send')} →</button>
 </form></div></div></section>`;
}
let turnstilePromise=null;
let widgetId=null;
let busy=false;
async function loadTurnstile(){
 if(window.turnstile)return window.turnstile;
 if(turnstilePromise)return turnstilePromise;
 turnstilePromise=new Promise((resolve,reject)=>{
  const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.async=true;s.defer=true;
  s.onload=()=>window.turnstile?resolve(window.turnstile):reject(new Error('Turnstile unavailable'));
  s.onerror=()=>reject(new Error('Turnstile script unavailable'));
  document.head.append(s);
 }).catch(e=>{turnstilePromise=null;throw e});
 return turnstilePromise;
}
const msg=(t,value,bad=false)=>{if(t){t.textContent=value;t.classList.toggle('is-error',bad)}};
export async function prepareReportPage(lang){
 const form=document.getElementById('eatable-problem-report');if(!form)return;
 const status=document.getElementById('eatable-report-status'),button=document.getElementById('eatable-report-submit');
 widgetId=null;busy=false;
 try{
  const res=await fetch('/api/report-problem',{cache:'no-store',headers:{Accept:'application/json'}});
  const json=await res.json();
  if(!document.contains(form))return;
  if(!res.ok||!json.ready||!json.siteKey)throw new Error('not ready');
  const turnstile=await loadTurnstile();
  if(!document.contains(form))return;
  widgetId=turnstile.render(document.getElementById('eatable-turnstile'),{sitekey:json.siteKey,theme:'auto'});
  button.disabled=false;msg(status,'');
 }catch(e){if(document.contains(form)){button.disabled=true;msg(status,reportText(lang,e.message==='not ready'?'unavailable':'captchaError'),true)}}
}
export async function submitProblemReport(form,lang){
 if(busy)return;
 const t=k=>reportText(lang,k),status=form.querySelector('#eatable-report-status'),button=form.querySelector('button[type="submit"]');
 const fields=Object.fromEntries(new FormData(form).entries());
 const title=String(fields.title||'').trim(),description=String(fields.description||'').trim(),email=String(fields.email||'').trim();
 if(!['bug','recipe','account','shopping','other'].includes(fields.category)||title.length<5||title.length>120||description.length<20||description.length>3000){msg(status,t('required'),true);return;}
 if(email&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)){msg(status,t('invalidEmail'),true);return;}
 const token=window.turnstile&&widgetId!=null?window.turnstile.getResponse(widgetId):'';
 if(!token){msg(status,t('captcha'),true);return;}
 busy=true;button.disabled=true;button.textContent=t('sending');msg(status,t('sending'));
 try{
  const res=await fetch('/api/report-problem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,title,description,email,lang,turnstileToken:token})});
  const json=await res.json().catch(()=>({}));
  if(!res.ok||!json.ok)throw new Error('not sent');
  form.reset();msg(status,t('sent'));button.textContent=t('send');
 }catch(e){msg(status,t(e.message==='not sent'?'failed':'network'),true);button.textContent=t('send');}
 finally{busy=false;button.disabled=false;try{if(window.turnstile&&widgetId!=null)window.turnstile.reset(widgetId)}catch{}}
}
