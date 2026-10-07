export function factNumbers(f){const s=new Set();(function w(x){if(typeof x==='number')s.add(x);else if(x&&typeof x==='object')Object.values(x).forEach(w)})(f);return s}
const txt=v=>typeof v==='string'&&v.length>0&&v.length<400;
export function validateInsights(raw,facts){
 if(!Array.isArray(raw)||raw.length<1||raw.length>4)return null;
 const ok=factNumbers(facts);
 for(const i of raw){
  if(!['headline','explanation','suggestion'].every(k=>txt(i?.[k])))return null;
  if(!Array.isArray(i.evidence)||!i.evidence.length)return null;
  if(!i.evidence.every(e=>txt(e?.label)&&ok.has(e.value)))return null}
 return raw}
