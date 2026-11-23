import assert from 'node:assert/strict';
import {weightedRating,popularityScore,filterDiscovery,sortDiscovery,discoveryKey,lebaneseSpotlight} from '../src/discovery-ranking.js';
const recipes=[
 {id:'a',source:'curated',cuisine:'Lebanese',diet:'vegan',time:40,name:{en:'Apple',it:'Mela'},ingredients:[{id:'apple'}]},
 {id:'b',source:'curated',cuisine:'Italian',diet:'vegetarian',time:25,name:{en:'Basil',it:'Basilico'},ingredients:[{id:'basil'}]},
 {id:'community-111',source:'community',communityId:'111',cuisine:'Lebanese',diet:'none',time:70,name:{en:'Cedar',it:'Cedro'},ingredients:[]},
 {id:'batata-harra',source:'curated',cuisine:'Lebanese',diet:'vegan',time:35,name:{en:'Batata Harra',it:'Patate piccanti'},ingredients:[]}
];
const stats={
 'curated:a':{review_count:1,average_rating:5,favorite_count:1,published_at:'2026-11-01'},
 'curated:b':{review_count:30,average_rating:4.7,favorite_count:10,published_at:'2026-11-10'},
 'community:111':{review_count:0,average_rating:0,favorite_count:100,published_at:'2026-11-23'},
 'curated:batata-harra':{review_count:7,average_rating:4.6,favorite_count:8,published_at:'2026-11-15'}
};
assert.equal(discoveryKey(recipes[2]),'community:111');
assert.ok(weightedRating(stats['curated:b'])>weightedRating(stats['curated:a']),'a single 5-star must not win');
assert.equal(weightedRating({review_count:0,average_rating:0}),0);
assert.equal(popularityScore(stats['community:111']),200);
assert.equal(sortDiscovery(recipes,'top',stats)[0].id,'b');
assert.equal(sortDiscovery(recipes,'popular',stats)[0].id,'community-111');
assert.equal(sortDiscovery(recipes,'newest',stats)[0].id,'community-111');
assert.equal(sortDiscovery(recipes,'quickest',stats)[0].id,'b');
assert.deepEqual(recipes.map(r=>r.id),['a','b','community-111','batata-harra'],'sorting must not mutate inputs');
assert.deepEqual(filterDiscovery(recipes,{cuisine:'Lebanese',diet:'vegan'}).map(r=>r.id),['a','batata-harra']);
assert.deepEqual(filterDiscovery(recipes,{diet:'vegetarian',maxTime:'30'}).map(r=>r.id),['b']);
assert.deepEqual(filterDiscovery(recipes,{minRating:'4'},stats).map(r=>r.id),['a','b','batata-harra']);
assert.deepEqual(filterDiscovery(recipes,{query:'CEdRo'},stats).map(r=>r.id),['community-111']);
assert.deepEqual(filterDiscovery(recipes,{query:'apple'},stats).map(r=>r.id),['a']);
assert.deepEqual(filterDiscovery(recipes,{query:'carota',extraText:r=>r.id==='a'?'Carota':''},stats).map(r=>r.id),['a']);
assert.equal(lebaneseSpotlight(recipes,stats,'en',2)[0].id,'batata-harra');
assert.equal(sortDiscovery(recipes,'popular',{},'it').length,4,'missing stats must not break sorting');
console.log('PASS v14 weighted ratings, favorites popularity, chronology, filters, bilingual search and Lebanese spotlight');
