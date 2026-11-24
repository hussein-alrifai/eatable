import assert from 'node:assert/strict';
import notify from '../api/deletion-request-notify.mjs';
const env={...process.env};
process.env.EATABLE_DELETION_WEBHOOK_SECRET='a'.repeat(64);
process.env.RESEND_API_KEY='re_test_placeholder';
process.env.REPORT_TO_EMAIL='eatable.support@gmail.com';
process.env.REPORT_FROM_EMAIL='reports@example.com';
const make=(secret='a'.repeat(64),event={type:'INSERT',schema:'public',table:'eatable_deletion_requests',record:{id:'123e4567-e89b-42d3-a456-426614174000',status:'pending',requested_at:'2026-11-24T22:00:00Z'}})=>new Request('https://cookwitheatable.com/api/deletion-request-notify',{method:'POST',headers:{'content-type':'application/json','x-eatable-webhook-secret':secret},body:JSON.stringify(event)});
let sends=0,body,headers;
globalThis.fetch=async(url,opts)=>{assert.equal(url,'https://api.resend.com/emails');sends++;body=JSON.parse(opts.body);headers=opts.headers;return new Response(JSON.stringify({id:'test'}),{status:200})};
let response=await notify.fetch(make('wrong'));assert.equal(response.status,401);assert.equal(sends,0);
response=await notify.fetch(make('a'.repeat(64),{type:'UPDATE',schema:'public',table:'eatable_deletion_requests',record:{id:'123e4567-e89b-42d3-a456-426614174000',status:'pending'}}));assert.equal(response.status,400);assert.equal(sends,0);
response=await notify.fetch(make());assert.equal(response.status,200);assert.equal(sends,1);assert.equal(body.to[0],'eatable.support@gmail.com');assert.equal(body.subject,'[Eatable] New account deletion request');assert.ok(!body.text.includes('author_id'));assert.equal(headers['Idempotency-Key'],'eatable-delete-request-123e4567-e89b-42d3-a456-426614174000');
for(const k of ['EATABLE_DELETION_WEBHOOK_SECRET','RESEND_API_KEY','REPORT_TO_EMAIL','REPORT_FROM_EMAIL']){if(env[k]===undefined)delete process.env[k];else process.env[k]=env[k]}
console.log('v24.1 tests passed: auth, invalid event, accepted notification, idempotency');
