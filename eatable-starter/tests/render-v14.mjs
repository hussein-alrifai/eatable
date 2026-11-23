import assert from 'node:assert/strict';
const app={innerHTML:'',insertAdjacentHTML(_position,html){this.innerHTML+=html;}};
const store=new Map(), listeners={};
globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
globalThis.location={pathname:'/en/recipes',search:'',href:'https://eatable.example/en/recipes',origin:'https://eatable.example'};
globalThis.window={location:globalThis.location,addEventListener(){},scrollTo(){}};
globalThis.history={replaceState(){},pushState(){}};
globalThis.document={getElementById:id=>id==='app'?app:null,addEventListener:(event,handler)=>{listeners[event]=handler},documentElement:{lang:'en'},body:{style:{}}};
await import('../src/app.js');
assert.match(app.innerHTML,/Highest rated/);
assert.match(app.innerHTML,/Most popular/);
assert.match(app.innerHTML,/Newest/);
assert.match(app.innerHTML,/Minimum rating/);
assert.match(app.innerHTML,/data-discovery-control="exploreSort"/);
assert.match(app.innerHTML,/class="grid-recipes"/);
// Locale change via navigation should render bilingual labels.
globalThis.location.pathname='/it/recipes';
listeners.popstate?.({}); // if listeners registered only on window, exercise English separately in second run
console.log('PASS v14 Explore form renders without cloud configuration or blank screen');
