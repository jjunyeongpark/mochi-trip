import { test } from 'node:test';
import assert from 'node:assert/strict';
import { googleReady, normalizePlace, fetchRoute, photoMediaUrl, searchHotels } from '../lib/google.ts';
test('missing keys never enable paid Google calls',()=>{assert.equal(googleReady({}),false);assert.equal(googleReady({GOOGLE_MAPS_ENABLED:'true',GOOGLE_MAPS_SERVER_KEY:'x'}),false);});

test('lodging photos preserve authors and reject unsafe attribution links',()=>{const p=normalizePlace({id:'hotel-abc',displayName:{text:'숙소'},location:{latitude:35,longitude:139},types:['lodging'],photos:[{name:'places/hotel-abc/photos/photo_123',authorAttributions:[{displayName:'사진 제공자',uri:'https://maps.google.com/contrib/1'},{displayName:'bad',uri:'javascript:alert(1)'}]}]});assert.equal(p.category,'숙소');assert.equal(p.photo?.name,'places/hotel-abc/photos/photo_123');assert.equal(p.photo?.authors[0].name,'사진 제공자');assert.equal(p.photo?.authors[1].uri,undefined);});
test('photo requests validate bounded resources and only redirect to Google image hosts',async()=>{let calls=0;const fake:any=async()=>{calls++;return Response.json({photoUri:'https://lh3.googleusercontent.com/photo'});};assert.equal(await photoMediaUrl('secret','places/abc/photos/def',320,fake),'https://lh3.googleusercontent.com/photo');await assert.rejects(()=>photoMediaUrl('secret','https://evil.test/image',320,fake));await assert.rejects(()=>photoMediaUrl('secret','places/abc/photos/def',9000,fake));assert.equal(calls,1);await assert.rejects(()=>photoMediaUrl('secret','places/abc/photos/def',320,async()=>Response.json({photoUri:'https://evil.test/steal'})));});
test('hotel search requests lodging and removes non-lodging Google matches',async()=>{let request:any;const results=await searchHotels('key','도쿄','normal',async(_url,options)=>{request=JSON.parse(String(options?.body));return Response.json({places:[{id:'hotel-abc',location:{latitude:35,longitude:139},types:['hotel','lodging']},{id:'cafe-abc',location:{latitude:35,longitude:139},types:['cafe']}]});});assert.equal(results.length,1);assert.equal(results[0].category,'숙소');assert.equal(request.includedType,'lodging');assert.ok(request.textQuery.includes('도쿄'));});
test('normalizes real Google data and rejects results outside Japan',()=>{
 const result=normalizePlace({id:'abc',displayName:{text:'식당'},location:{latitude:35,longitude:139},types:['restaurant'],rating:4.2});
 assert.equal(result.category,'맛집');assert.equal(result.source,'google');assert.equal(result.rating,4.2);
 assert.throws(()=>normalizePlace({id:'abc',displayName:{text:'London'},location:{latitude:51,longitude:0}}));
});
test('route failure is unavailable, never a fabricated polyline',async()=>{
 const result=await fetchRoute('key',{id:'a',lat:35,lng:139},{id:'b',lat:35.1,lng:139.1},'TRANSIT','2026-12-01T00:00:00Z',async()=>new Response(JSON.stringify({routes:[]})));
 assert.equal(result.status,'unavailable');assert.equal(result.polyline,undefined);
});
