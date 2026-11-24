// Eatable support reports: Vercel Function. All credentials remain server-side.
const categories=new Set(['bug','recipe','account','shopping','other']);
const reply = (obj,status=200)=>Response.json(obj,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const str=(value,limit)=>typeof value==='string'?value.trim().slice(0,limit+1):'';
const validEmail=e=>!e||e.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const cleanSingle=s=>s.replace(/[\r\n\t]/g,' ').replace(/\s+/g,' ');
const failStatus=(message,status)=>reply({ok:false,error:message},status);
const config=()=>({key:process.env.RESEND_API_KEY||'',to:process.env.REPORT_TO_EMAIL||'',from:process.env.REPORT_FROM_EMAIL||'',secret:process.env.TURNSTILE_SECRET_KEY||'',siteKey:process.env.TURNSTILE_SITE_KEY||''});
const configured=c=>Boolean(c.key&&c.to&&c.from&&c.secret&&c.siteKey);
async function limitedFetch(url,opts,ms=11000){
 const controller=new AbortController(),id=setTimeout(()=>controller.abort(),ms);
 try{return await fetch(url,{...opts,signal:controller.signal});}finally{clearTimeout(id)}
}
export default {
 async fetch(request){
  const c=config();
  if(request.method==='GET')return reply({ready:configured(c),siteKey:configured(c)?c.siteKey:null});
  if(request.method!=='POST')return failStatus('Method not allowed',405);
  if(!configured(c))return failStatus('Reporting is not configured',503);
  const origin=request.headers.get('origin');
  if(!origin||origin!==new URL(request.url).origin)return failStatus('Invalid origin',403);
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return failStatus('Expected JSON',415);
  if(Number(request.headers.get('content-length')||0)>12000)return failStatus('Report too large',413);
  let payload;
  try{const raw=await request.text();if(raw.length>12000)return failStatus('Report too large',413);payload=JSON.parse(raw)}catch{return failStatus('Invalid JSON',400)}
  if(!payload||typeof payload!=='object'||Array.isArray(payload))return failStatus('Invalid payload',400);
  if(str(payload.website,200))return reply({ok:true}); // bot honeypot
  const category=str(payload.category,30),title=str(payload.title,120),description=str(payload.description,3000),page=str(payload.page,300),name=str(payload.name,80),email=str(payload.email,254),token=str(payload.turnstileToken,2500);
  if(!categories.has(category)||title.length<5||title.length>120||description.length<20||description.length>3000||name.length>80||!validEmail(email)||page.length>300||!token)return failStatus('Invalid report',400);
  if(page&&!/^\/(en|it)(\/|$)/.test(page))return failStatus('Invalid page',400);
  const tokenData=new URLSearchParams({secret:c.secret,response:token});
  const clientIp=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if(clientIp)tokenData.set('remoteip',clientIp);
  let turnstile;
  try{
   const res=await limitedFetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:tokenData},7500);
   if(!res.ok)return failStatus('Verification temporarily unavailable',503);
   turnstile=await res.json();
  }catch{return failStatus('Verification temporarily unavailable',503)}
  if(!turnstile?.success)return failStatus('Anti-spam verification failed',403);
  const labels={bug:'Website bug',recipe:'Recipe problem',account:'Account issue',shopping:'Shopping or My Kitchen',other:'Other'};
  const emailSubject=`[Eatable report] ${labels[category]}: ${cleanSingle(title).slice(0,100)}`;
  const text=[`Category: ${labels[category]}`,`Title: ${cleanSingle(title)}`,`Page: ${page||'Not provided'}`,`Name: ${name||'Not provided'}`,`Reply email: ${email||'Not provided'}`,'', 'Description:',description,'','Sent through the Eatable problem-report form.'].join('\n');
  try{
   const result=await limitedFetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${c.key}`,'Content-Type':'application/json'},body:JSON.stringify({from:c.from,to:[c.to],subject:emailSubject,text,...(email?{reply_to:email}:{})})});
   if(!result.ok){
    let providerName='unknown_error',providerMessage='No error details returned';
    try{
     const info=await result.json();
     providerName=String(info?.name??info?.error??'unknown_error').slice(0,80);
     providerMessage=String(info?.message??'No error details returned').slice(0,400);
    }catch{}
    const safe=s=>s.replace(/[\r\n\t]+/g,' ').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email address]').replace(/re_[A-Za-z0-9_-]{12,}/g,'[redacted]').slice(0,400);
    console.error('Eatable report delivery rejected',result.status,safe(providerName),safe(providerMessage));
    return failStatus('Email could not be delivered',502)
   }
   return reply({ok:true});
  }catch(e){console.error('Eatable report delivery unavailable');return failStatus('Email service unavailable',502)}
 }
};
