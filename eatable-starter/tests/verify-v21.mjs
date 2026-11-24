import {readFileSync} from 'node:fs';
import {strict as assert} from 'node:assert';
const file=readFileSync(new URL('../src/public-pages.js',import.meta.url),'utf8');
const mod=await import('data:text/javascript;base64,'+Buffer.from(file).toString('base64'));
for(const lang of ['en','it']){
 for(const route of ['about','contact','privacy','terms','cookies']){
  const html=mod.publicPageHtml(lang,route);
  assert(html.includes('<h1>'),`${lang}/${route}: missing h1`);
  if(route==='contact')assert(html.includes(`/${lang}/report`),`${lang}/${route}: report link`);
  assert(mod.publicMeta(lang,route).length>20);
  if(['privacy','terms','cookies'].includes(route))assert(html.includes('v21-draft'));
 }
}
console.log('V21 translated page content verified.');
