import{validateInsights}from'../src/validate.js';
const MODELS=['gemini-3.6-flash','gemini-3.5-flash-lite'];
const SYSTEM='You coach habit tracking. Use ONLY the numbers in the JSON the user sends. Never invent numbers or facts. Return 1-3 insights, each with a short headline, an explanation, one concrete suggestion, and evidence values copied exactly from the input.';
const S={type:'STRING'};
const SCHEMA={type:'OBJECT',required:['insights'],properties:{insights:{type:'ARRAY',minItems:1,maxItems:3,items:{type:'OBJECT',required:['headline','explanation','suggestion','evidence'],properties:{headline:S,explanation:S,suggestion:S,evidence:{type:'ARRAY',minItems:1,items:{type:'OBJECT',required:['label','value'],properties:{label:S,value:{type:'NUMBER'}}}}}}}}};
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 const facts=req.body?.facts;
 if(!facts||!Array.isArray(facts.habits)||facts.habits.length>20)return res.status(400).json({error:'bad_request'});
 if(!process.env.GEMINI_API_KEY)return res.status(503).json({error:'not_configured'});
 const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),8000);
 const body=JSON.stringify({systemInstruction:{parts:[{text:SYSTEM}]},contents:[{role:'user',parts:[{text:JSON.stringify(facts)}]}],generationConfig:{responseMimeType:'application/json',responseSchema:SCHEMA,maxOutputTokens:800,temperature:0.3}});
 try{
  let r;
  for(const m of MODELS){
   r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,{method:'POST',signal:ctl.signal,headers:{'content-type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},body});
   if(r.ok||![429,500,503].includes(r.status))break}
  if(!r.ok){console.error('gemini',r.status,(await r.text()).slice(0,300));return res.status(502).json({error:'upstream'})}
  let raw;try{raw=JSON.parse((await r.json()).candidates?.[0]?.content?.parts?.[0]?.text).insights}catch{return res.status(502).json({error:'invalid_output'})}
  const v=validateInsights(raw,facts);
  return v?res.status(200).json({insights:v}):res.status(502).json({error:'invalid_output'})
 }catch{return res.status(504).json({error:'timeout'})}finally{clearTimeout(t)}}