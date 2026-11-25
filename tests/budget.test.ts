import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { reserveSpend, API_CAP_KRW } from '../lib/budget.ts';
function database(){const sqlite=new DatabaseSync(':memory:');sqlite.exec('CREATE TABLE monthly_spend (month TEXT PRIMARY KEY, amount INTEGER NOT NULL)');return {prepare(sql:string){let args:any[]=[];return {bind(...v:any[]){args=v;return this;},async first(){return sqlite.prepare(sql).get(...args)??null;}};}};}
test('atomic reservation blocks concurrent spending beyond monthly limit',async()=>{
 const db=database();
 const results=await Promise.all(Array.from({length:500},()=>reserveSpend(db as any,'search',1,new Date('2026-12-01T01:00:00Z'))));
 assert.equal(results.filter(Boolean).length,API_CAP_KRW/100);
 assert.equal(await reserveSpend(db as any,'route',1,new Date('2026-12-02')),false);
 assert.equal(await reserveSpend(db as any,'search',1,new Date('2027-01-01')),true);
});
test('missing database and invalid reservation units fail closed',async()=>{
 await assert.rejects(()=>reserveSpend(undefined as any,'search',1));
 for(const units of [-1,0,Infinity,1.5]) await assert.rejects(()=>reserveSpend(database() as any,'search',units));
});
