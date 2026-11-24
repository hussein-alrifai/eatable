import {publicPageHtml,publicMeta} from '../src/public-pages.js';
for(const locale of ['en','it'])for(const page of ['about','contact','privacy','terms','cookies']){const html=publicPageHtml(locale,page);if(!html.includes('Hussein AlRifai')&&page==='privacy')throw new Error('missing operator');if(html.length<200)throw new Error('page too short');if(!html.includes('/'+locale+'/privacy'))throw new Error('missing nav');}
console.log('Passed 10 bilingual page render smoke tests');
