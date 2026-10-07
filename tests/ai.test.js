import{describe,it,expect,vi}from'vitest';
import{requestInsights}from'../src/insights-client.js';
import{validateInsights}from'../src/validate.js';
import{buildFacts}from'../src/logic.js';
const now=new Date(2026,9,6,12),habits=[{name:'Gym',xp:30,done:[]}];
const facts=buildFacts(habits,now),good=[{headline:'h',explanation:'e',suggestion:'s',evidence:[{label:'rate',value:0}]}];
const ok=b=>vi.fn(async()=>({ok:true,status:200,json:async()=>b}));
describe('validateInsights',()=>{
 it('accepts grounded output',()=>expect(validateInsights(good,facts)).toEqual(good));
 it('rejects invented numbers',()=>expect(validateInsights([{...good[0],evidence:[{label:'x',value:77}]}],facts)).toBeNull());
 it('rejects malformed shapes',()=>{expect(validateInsights('no',facts)).toBeNull();expect(validateInsights([{headline:'h'}],facts)).toBeNull()});
});
describe('requestInsights resilience',()=>{
 it('uses AI output when valid',async()=>expect((await requestInsights(habits,{now,fetchFn:ok({insights:good})})).source).toBe('ai'));
 it('falls back on invalid AI output',async()=>expect((await requestInsights(habits,{now,fetchFn:ok({insights:[]})})).source).toBe('local'));
 it('falls back on HTTP error',async()=>expect((await requestInsights(habits,{now,fetchFn:vi.fn(async()=>({ok:false,status:500}))})).source).toBe('local'));
 it('falls back on network failure',async()=>expect((await requestInsights(habits,{now,fetchFn:vi.fn(async()=>{throw new Error('offline')})})).source).toBe('local'));
});
