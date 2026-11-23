import assert from 'node:assert/strict';
import {reviewSection,reviewTarget,reviewCacheKey,validateReview,rText} from '../src/reviews-ui.js';

const curated={id:'batata-harra',source:'curated'};
const community={id:'community-123',communityId:'f04f5a60-0bed-4f6d-8d30-a66664442222',source:'community'};
assert.deepEqual(reviewTarget(curated),{kind:'curated',key:'batata-harra'});
assert.deepEqual(reviewTarget(community),{kind:'community',key:community.communityId});
assert.equal(reviewCacheKey(reviewTarget(curated)),'curated:batata-harra');
assert.equal(reviewTarget({id:'oops!',source:'curated'}),null);
assert.deepEqual(validateReview('4','Good dish  '),{rating:4,body:'Good dish'});
assert.throws(()=>validateReview('0',''),/invalid-rating/);
assert.throws(()=>validateReview('5','x'.repeat(1201)),/too-long/);
assert.equal(rText('it','write'),'Lascia una valutazione');
const initial=reviewSection({language:'en',recipe:curated,status:'loading'});
assert.match(initial,/Loading reviews/);
const data={summary:{review_count:2,average_rating:4.5},mine:{id:'abc',rating:5,body:'Delicious'},rows:[
 {id:'abc',user_id:'user-1',rating:5,body:'Delicious',is_visible:true,created_at:'2026-11-23T12:00:00Z'},
 {id:'other',user_id:'user-2',rating:4,body:'<img src=x onerror=alert(1)>',is_visible:true,created_at:'2026-11-23T12:00:00Z'}]};
const html=reviewSection({language:'en',recipe:curated,userId:'user-1',isAdmin:false,status:'ready',data});
assert.match(html,/4\.5/);
assert.match(html,/2 reviews/);
assert.match(html,/Update review/);
assert.match(html,/Delete my review/);
assert.match(html,/value="5" checked/);
assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
assert.doesNotMatch(html,/<img src=x/);
assert.doesNotMatch(html,/review-moderate/);
const it=reviewSection({language:'it',recipe:community,isAdmin:true,status:'ready',data:{...data,mine:null}});
assert.match(it,/Valutazioni e recensioni/);
assert.match(it,/review-moderate/);
assert.match(it,/Nascondi recensione/);
const guest=reviewSection({language:'en',recipe:curated,status:'ready',data});
assert.match(guest,/Sign in to rate this recipe/);
assert.doesNotMatch(guest,/v13-review-form/);
console.log('PASS v13 review target, validation, escaping, English/Italian, member/admin/guest view');
