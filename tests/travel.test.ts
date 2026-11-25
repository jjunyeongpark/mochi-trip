import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSettings, buildDays, mapsUrl, decodePolyline, sharePayload, openAt } from '../lib/travel.ts';
const settings = { city: '도쿄', startDate: '2026-12-01', nights: 2, pace: 'normal', budget: 'normal', interests: ['명소','맛집'], transport: 'TRANSIT', companion: '친구', hotel: '' };
test('validates dates, bounded Japan queries and trip length', () => {
 assert.equal(validateSettings(settings).city, '도쿄');
 for(const patch of [{city:''},{city:'x'.repeat(100)},{startDate:'2026-02-30'},{nights:30},{transport:'FLY'},{interests:['x'.repeat(200)]}]) assert.throws(()=>validateSettings({...settings,...patch}));
});
test('builds day slots without reusing the same place', () => {
 const places=Array.from({length:18},(_,i)=>({id:`p${i}`,name:`p${i}`,lat:35+i*.001,lng:139,category:i%3===0?'맛집':i%3===1?'카페':'명소',source:'google'}));
 const days=buildDays(places as any,validateSettings(settings));
 const ids=days.flatMap(d=>d.stops.map(s=>s.place.id));
 assert.equal(days.length,3);assert.equal(new Set(ids).size,ids.length);assert.ok(days[0].stops.some(s=>s.place.category==='맛집'));
});
test('encodes Google place links and decodes real polylines',()=>{
 const u=new URL(mapsUrl({id:'a/b',name:'식당 & 카페',lat:35,lng:139,category:'맛집',source:'google'}));
 assert.equal(u.searchParams.get('query'),'식당 & 카페');assert.equal(u.searchParams.get('query_place_id'),'a/b');
 assert.deepEqual(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@')[0],{lat:38.5,lng:-120.2});
 assert.throws(()=>decodePolyline('????~'));
});
test('share storage keeps only IDs and user options, never provider snapshots',()=>{
 const days=buildDays([{id:'real-id',name:'provider name',lat:35,lng:139,category:'명소',source:'google',rating:4.9}] as any,validateSettings(settings));
 const json=JSON.stringify(sharePayload(validateSettings(settings),days));
 assert.ok(json.includes('real-id'));assert.ok(!json.includes('provider name'));assert.ok(!json.includes('rating'));assert.ok(!json.includes('lat'));
});
test('opening hours cover full visit, handle overnight and unknown hours',()=>{
 const place:any={hours:[{open:{day:2,hour:10,minute:0},close:{day:2,hour:18,minute:0}}]};
 assert.equal(openAt(place,'2026-12-01',9*60,60),false);
 assert.equal(openAt(place,'2026-12-01',10*60,60),true);
 assert.equal(openAt(place,'2026-12-01',17*60+30,60),false);
 assert.equal(openAt({},'2026-12-01',9*60,60),undefined);
 assert.equal(openAt({hours:[{open:{day:1,hour:22,minute:0},close:{day:2,hour:3,minute:0}}]} as any,'2026-12-01',60,60),true);
});
