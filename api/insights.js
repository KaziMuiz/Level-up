import{validateInsights}from'../src/validate.js';
const SYSTEM='You coach habit tracking. Use ONLY the numbers in the JSON the user sends. Never invent numbers or facts. Give 1-3 insights, each with a short headline, an explanation, one concrete suggestion, and evidence values copied exactly from the input.';
const str={type:'string'};
const TOOL={name:'report_insights',description:'Report habit insights.',input_schema:{type:'object',required:['insights'],properties:{insights:{type:'array',minItems:1,maxItems:3,items:{type:'object',required:['headline','explanation','suggestion','evidence'],properties:{headline:str,explanation:str,suggestion:str,evidence:{type:'array',minItems:1,items:{type:'object',required:['label','value'],properties:{label:str,value:{type:'number'}}}}}}}}}};
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 const facts=req.body?.facts;
 if(!facts||!Array.isArray(facts.habits)||facts.habits.length>20)return res.status(400).json({error:'bad_request'});
 if(!process.env.ANTHROPIC_API_KEY)return res.status(503).json({error:'not_configured'});
 const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),8000);
 try{
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',signal:ctl.signal,headers:{'content-type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:800,system:SYSTEM,tools:[TOOL],tool_choice:{type:'tool',name:'report_insights'},messages:[{role:'user',content:JSON.stringify(facts)}]})});
  if(!r.ok)return res.status(502).json({error:'upstream'});
  const d=await r.json(),v=validateInsights(d.content?.find(b=>b.type==='tool_use')?.input?.insights,facts);
  return v?res.status(200).json({insights:v}):res.status(502).json({error:'invalid_output'})
 }catch{return res.status(504).json({error:'timeout'})}finally{clearTimeout(t)}}
