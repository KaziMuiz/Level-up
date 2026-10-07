import{ago,calculateXP,levelInfo,calculateStreak,longestStreak,completionRate,qualifyingDays,isValidHabits,seedHabits}from'./logic.js';
import{requestInsights}from'./insights-client.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],KEY='levelup.v1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const Store={load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&isValidHabits(s.habits))return s.habits}catch{}return null},save(h){try{localStorage.setItem(KEY,JSON.stringify({habits:h}))}catch{}}};
let habits=Store.load()||seedHabits(),busy=false;
const say=t=>{$('#msg').textContent=t};
function render(){
 const xp=calculateXP(habits),L=levelInfo(xp),qd=qualifyingDays(habits),t=ago(0),set=(k,v)=>$$(`[data-b="${k}"]`).forEach(e=>e.textContent=v);
 set('level',L.level);set('into',L.into);set('cost',L.cost);set('left',L.left);set('total-xp',xp);set('streak',calculateStreak(qd));set('best',longestStreak(qd));
 set('done',habits.reduce((s,h)=>s+h.done.length,0));set('rate',habits.length?Math.round(habits.reduce((s,h)=>s+completionRate(h.done),0)/habits.length*100):0);
 $$('.xpbar').forEach(b=>{b.max=L.cost;b.value=L.into});
 $('#mini').innerHTML=habits.slice(0,5).map(h=>`<li><span>${esc(h.name)}</span><small>${h.done.includes(t)?'done':'open'}</small></li>`).join('')||'<li class="mu">No habits yet.</li>';
 $('#habits').innerHTML=habits.length?habits.map(h=>{const on=h.done.includes(t);return`<li class="hb${on?' on':''}"><button class="chk" data-id="${esc(h.id)}" aria-pressed="${on}"><span class="sr">${esc(h.name)}: </span>Done today</button><div><strong>${esc(h.name)}</strong><small>+${h.xp} XP · ${calculateStreak(h.done)}-day streak · ${Math.round(completionRate(h.done)*100)}% in 30 days</small></div></li>`}).join(''):'<li class="mu">No habits yet. Add your first one below.</li>';
 const off=(new Date().getDay()+6)%7,ok=new Set(qd);
 $('#wk').innerHTML=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((n,i)=>{const k=ago(off-i),[c,s,w]=i>off?['','·','upcoming']:ok.has(k)?['y','✓','done']:i===off?['','○','in progress']:['','×','missed'];return`<li class="${c}"><span aria-hidden="true">${n}</span><b aria-hidden="true">${s}</b><span class="sr">${n}: ${w}</span></li>`}).join('');
 $('#ch').innerHTML=Array.from({length:7},(_,i)=>{const k=ago(6-i),p=habits.length?Math.round(habits.filter(h=>h.done.includes(k)).length/habits.length*100):0,d=new Date(k+'T12:00').toLocaleDateString('en',{weekday:'short'});return`<li><span>${p}</span><i style="height:${p*.7}%"></i><span>${d}</span></li>`}).join('')}
function toggle(id){const h=habits.find(x=>x.id===id);if(!h)return;const t=ago(0),before=levelInfo(calculateXP(habits)).level,i=h.done.indexOf(t);
 if(i<0){h.done.push(t);say(`${h.name} done. +${h.xp} XP`)}else{h.done.splice(i,1);say(`${h.name} marked not done`)}
 Store.save(habits);render();$(`.chk[data-id="${id}"]`)?.focus();const after=levelInfo(calculateXP(habits)).level;if(after>before)say(`Level ${after} reached`)}
$('#habits').addEventListener('click',e=>{const b=e.target.closest('.chk');if(b)toggle(b.dataset.id)});
$('#add').addEventListener('submit',e=>{e.preventDefault();const n=$('#hname').value.trim(),x=Math.min(50,Math.max(5,parseInt($('#hxp').value,10)||20));
 if(!n){$('#err').textContent='Enter a habit name to add it.';$('#hname').setAttribute('aria-invalid','true');$('#hname').focus();return}
 $('#err').textContent='';$('#hname').removeAttribute('aria-invalid');habits.push({id:'h'+Date.now(),name:n,xp:x,done:[]});Store.save(habits);render();$('#hname').value='';say(`Added ${n}`)});
$('#sample').addEventListener('click',()=>{habits=seedHabits();Store.save(habits);render();say('Sample data loaded')});
$('#clear').addEventListener('click',()=>{habits=[];Store.save(habits);render();$('#cards').innerHTML='';say('All habits cleared')});
function cards(list){return list.length?list.map(o=>`<article class="pn ic"><h3>${esc(o.headline)}</h3><p>${esc(o.explanation)}</p><p class="tip"><strong>Try this:</strong> ${esc(o.suggestion)}</p><ul>${o.evidence.map(e=>`<li>${esc(e.label)}: ${e.value}</li>`).join('')}</ul></article>`).join(''):'<p class="mu">Add a habit and log a few days. Insights appear once there is history to read.</p>'}
$('#run').addEventListener('click',async()=>{if(busy)return;busy=true;const b=$('#run');b.disabled=true;b.setAttribute('aria-busy','true');$('#status').textContent='Analyzing your history…';
 try{const{source,insights}=await requestInsights(habits);$('#cards').innerHTML=cards(insights);
  $('#src').innerHTML=insights.length?`<span class="src ${source==='ai'?'ai':''}">${source==='ai'?'Written by Gemini from your numbers':'Computed locally (AI unavailable)'}</span>`:'';
  $('#status').textContent=insights.length?(source==='ai'?'Insights ready.':'AI unavailable. Showing locally computed insights.'):'Not enough data yet.'}
 catch{$('#status').textContent='Could not compute insights. Try again.'}
 finally{busy=false;b.disabled=false;b.removeAttribute('aria-busy')}});
render();
