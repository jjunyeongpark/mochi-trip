import { test } from 'node:test';
import assert from 'node:assert/strict';
import { googleReady, normalizePlace, fetchRoute } from '../lib/google.ts';
test('missing keys never enable paid Google calls',()=>{assert.equal(googleReady({}),false);assert.equal(googleReady({GOOGLE_MAPS_ENABLED:'true',GOOGLE_MAPS_SERVER_KEY:'x'}),false);});
test('normalizes real Google data and rejects results outside Japan',()=>{
 const result=normalizePlace({id:'abc',displayName:{text:'식당'},location:{latitude:35,longitude:139},types:['restaurant'],rating:4.2});
 assert.equal(result.category,'맛집');assert.equal(result.source,'google');assert.equal(result.rating,4.2);
 assert.throws(()=>normalizePlace({id:'abc',displayName:{text:'London'},location:{latitude:51,longitude:0}}));
});
test('route failure is unavailable, never a fabricated polyline',async()=>{
 const result=await fetchRoute('key',{id:'a',lat:35,lng:139},{id:'b',lat:35.1,lng:139.1},'TRANSIT','2026-12-01T00:00:00Z',async()=>new Response(JSON.stringify({routes:[]})));
 assert.equal(result.status,'unavailable');assert.equal(result.polyline,undefined);
});
