const DAY=864e5,WD=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const key=d=>{const z=new Date(d);return `${z.getFullYear()}-${String(z.getMonth()+1).padStart(2,'0')}-${String(z.getDate()).padStart(2,'0')}`};
export const ago=(n,now=new Date())=>{const d=new Date(now);d.setDate(d.getDate()-n);return key(d)};
export const calculateXP=h=>h.reduce((s,x)=>s+x.done.length*x.xp,0);
const floor=l=>100*(l-1)+20*l*(l-1),cost=l=>100+40*l;
export function levelInfo(xp){let l=1;while(xp>=floor(l+1))l++;const into=xp-floor(l),c=cost(l);return{level:l,into,cost:c,left:c-into}}
export function calculateStreak(dates,now=new Date()){const s=new Set(dates);let n=0,i=s.has(ago(0,now))?0:1;while(s.has(ago(i,now))){n++;i++}return n}
export function longestStreak(dates){let b=0,r=0,p=null;for(const d of [...new Set(dates)].sort()){r=p&&Math.round((new Date(d)-new Date(p))/DAY)===1?r+1:1;b=Math.max(b,r);p=d}return b}
export function completionRate(dates,days=30,now=new Date()){const s=new Set(dates);let n=0;for(let i=0;i<days;i++)if(s.has(ago(i,now)))n++;return n/days}
export function qualifyingDays(hs){const c={};hs.forEach(x=>x.done.forEach(d=>c[d]=(c[d]||0)+1));return Object.keys(c).filter(d=>c[d]*2>=hs.length)}
export function buildFacts(habits,now=new Date(),days=35){
 const pct=v=>Math.round(v*100);
 return{windowDays:days,habits:habits.map(h=>{
  const by=Array.from({length:7},()=>[0,0]);
  for(let i=0;i<days;i++){const d=new Date(now);d.setDate(d.getDate()-i);by[d.getDay()][1]++;if(h.done.includes(key(d)))by[d.getDay()][0]++}
  let weak=null;by.forEach(([a,n],w)=>{if(n>=4&&(!weak||a/n<weak.pct/100))weak={weekday:WD[w],pct:pct(a/n)}});
  return{name:h.name,rate30:pct(completionRate(h.done,30,now)),streak:calculateStreak(h.done,now),weakestWeekday:weak}})}}
export function localInsights(f){
 if(!f.habits.length)return[];const out=[],top=[...f.habits].sort((a,b)=>b.rate30-a.rate30)[0];
 out.push({headline:`${top.name} is your most consistent habit.`,explanation:`You completed it on ${top.rate30}% of the last 30 days.`,suggestion:`Attach a weaker habit to ${top.name}.`,evidence:[{label:`${top.name}, 30-day rate (%)`,value:top.rate30}]});
 const w=f.habits.filter(h=>h.weakestWeekday).sort((a,b)=>a.weakestWeekday.pct-b.weakestWeekday.pct)[0];
 if(w)out.push({headline:`${w.name} slips on ${w.weakestWeekday.weekday}s.`,explanation:`Completion on ${w.weakestWeekday.weekday}s is ${w.weakestWeekday.pct}%.`,suggestion:`Plan an easier version of ${w.name} for ${w.weakestWeekday.weekday}s.`,evidence:[{label:`${w.weakestWeekday.weekday} completion (%)`,value:w.weakestWeekday.pct}]});
 return out}
export const isValidHabits=h=>Array.isArray(h)&&h.every(x=>x&&typeof x.id==='string'&&typeof x.name==='string'&&Number.isFinite(x.xp)&&Array.isArray(x.done));
export function seedHabits(now=new Date()){
 let a=7;const r=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const H=[['Python study',20],['Gym',30],['Prayer',15],['Reading',15]].map(([name,xp],i)=>({id:'h'+i,name,xp,done:[]}));
 for(let i=34;i>=1;i--){const d=new Date(now);d.setDate(d.getDate()-i);const k=key(d),g=r()<(d.getDay()===5?.38:.78),p=r()<(g?.86:.6),pr=r()<.94,rd=r()<.55;[p,g,pr,rd].forEach((v,j)=>v&&H[j].done.push(k))}
 return H}
