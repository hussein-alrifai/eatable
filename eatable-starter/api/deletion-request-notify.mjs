// Eatable v24.1 — New account-deletion request alerts.
// Only a trusted Supabase Database Webhook may call this endpoint.
// Do not use it from browser code; never put this secret in GitHub.
import { timingSafeEqual } from 'node:crypto';

const reply=(status,message)=>Response.json({ok:status>=200&&status<300,message}, {
  status,
  headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isAuthorized=(provided,expected)=>{
  if(!expected || expected.length<32 || !provided || provided.length>512) return false;
  const a=Buffer.from(provided,'utf8'),b=Buffer.from(expected,'utf8');
  return a.length===b.length && timingSafeEqual(a,b);
};
async function timedFetch(url,options,timeout=10000){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  try{return await fetch(url,{...options,signal:controller.signal});}
  finally{clearTimeout(timer)}
}

export default {
  async fetch(request){
    if(request.method!=='POST')return reply(405,'Method not allowed');
    const key=process.env.RESEND_API_KEY||'';
    const to=process.env.REPORT_TO_EMAIL||'';
    const from=process.env.REPORT_FROM_EMAIL||'';
    const secret=process.env.EATABLE_DELETION_WEBHOOK_SECRET||'';
    if(!key||!to||!from||secret.length<32)return reply(503,'Notification service is not configured');
    if(!isAuthorized(request.headers.get('x-eatable-webhook-secret'),secret))return reply(401,'Unauthorized');
    if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return reply(415,'Expected JSON');
    if(Number(request.headers.get('content-length')||0)>12000)return reply(413,'Payload too large');
    let event;
    try{
      const raw=await request.text();
      if(raw.length>12000)return reply(413,'Payload too large');
      event=JSON.parse(raw);
    }catch{return reply(400,'Invalid JSON')}
    if(event?.type!=='INSERT'||event?.schema!=='public'||event?.table!=='eatable_deletion_requests'
       ||!UUID.test(event?.record?.id||'')||event?.record?.status!=='pending'){
      return reply(400,'Unexpected database event');
    }
    const id=event.record.id;
    const requestedAt=typeof event.record.requested_at==='string'&&Number.isFinite(Date.parse(event.record.requested_at))
      ? new Date(event.record.requested_at).toISOString() : 'See Supabase';
    // Intentionally exclude user_id and free-text note from email; view those only in Supabase.
    const text=[
      'A new account-deletion request was submitted on Eatable.',
      '',
      `Request ID: ${id}`,
      `Requested at (UTC): ${requestedAt}`,
      '',
      'Open Supabase > Table Editor > public.eatable_deletion_requests.',
      'Review the pending record and follow the manual privacy-deletion procedure.',
      'Do not delete a user or Storage objects based on this notification alone.'
    ].join('\n');
    try{
      const result=await timedFetch('https://api.resend.com/emails',{
        method:'POST',
        headers:{
          'Authorization':`Bearer ${key}`,
          'Content-Type':'application/json',
          'Idempotency-Key':`eatable-delete-request-${id}`
        },
        body:JSON.stringify({from,to:[to],subject:'[Eatable] New account deletion request',text})
      });
      if(!result.ok){
        // Provider response details may contain addresses or identifiers; do not log them.
        console.error('Eatable deletion notification rejected by email provider:',result.status);
        return reply(502,'Email provider rejected notification');
      }
      console.info('Eatable deletion notification accepted by email provider');
      return reply(200,'Notification accepted');
    }catch{
      console.error('Eatable deletion notification email service unavailable');
      return reply(502,'Email service unavailable');
    }
  }
};
