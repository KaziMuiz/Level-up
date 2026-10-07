import{buildFacts,localInsights}from'./logic.js';import{validateInsights}from'./validate.js';
export async function requestInsights(habits,{now=new Date(),fetchFn=fetch,timeoutMs=9000}={}){
 const facts=buildFacts(habits,now);
 try{
  const r=await fetchFn('/api/insights',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({facts}),signal:AbortSignal.timeout(timeoutMs)});
  if(!r.ok)throw new Error('http '+r.status);
  const v=validateInsights((await r.json()).insights,facts);
  if(!v)throw new Error('invalid');
  return{source:'ai',insights:v}
 }catch{return{source:'local',insights:localInsights(facts)}}}
