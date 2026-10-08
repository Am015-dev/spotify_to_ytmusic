// ---- MF (build25, Alex: "the map should allow to filter based on legends eg all garages, races etc"): legend chips on the big map.
// ALL · GARAGES · RACES · MISSIONS · SIDE QUESTS · EVENTS · COLLECTIBLES · TRAVEL (a chip only shows when the city has that icon type).
// A chip shows / hides that icon type on the big map AND the minimap; hidden icons can't be tapped either. The current waypoint always
// stays visible. The choice is remembered (localStorage, all save slots). Nothing here touches driving, missions or the 3D world markers.
const MF={g:0,off:new Set(),K:'mho_mapf'};
const MF_C=[['garage','🔧','GARAGES'],['race','🏁','RACES'],['mission','🎬','MISSIONS'],['side','❗','SIDE QUESTS'],['event','⚡','EVENTS'],['collect','🧱','COLLECTIBLES'],['travel','✈','TRAVEL']];
try{const a=JSON.parse(localStorage.getItem(MF.K)||'[]');if(Array.isArray(a))for(const k of a)if(MF_C.some(c=>c[0]===k))MF.off.add(k)}catch(e){}
function MF_save(){try{localStorage.setItem(MF.K,JSON.stringify([...MF.off]))}catch(e){}}
function MF_cat(m){if(!m)return'';if(m.dyn)return'side';if(m.m1)return'mission';const k=m.kind;
 if(k==='garage')return'garage';if(k==='rival'||k==='boss'||k==='season'||k==='sprint')return'race';if(k==='quest')return m.ev&&m.ev.story?'mission':'side';
 if(k==='challenge'||k==='mode'||k==='otg')return'event';if(k==='flight')return'travel';return''}
const MF_ogCat=s=>s.k==='ev'?'event':'collect';
const MF_hid=m=>m!==RO.wp&&MF.off.has(MF_cat(m));
// the gate: while a map / minimap draws or a map tap is resolved, markKnown() says "unknown" for hidden icon types
markKnown=(f=>function(m){if(MF.g&&MF_hid(m))return false;return f(m)})(markKnown);
const MF_gated=f=>function(){const g0=MF.g;MF.g=1;try{return f.apply(this,arguments)}finally{MF.g=g0}};
drawRoamMap=MF_gated(drawRoamMap);miniDraw=MF_gated(miniDraw);
qvMiniQ=(f=>function(){if(MF.off.has('side'))return;return f.apply(this,arguments)})(qvMiniQ);
OG_map=(f=>function(){const S=OG.S;if(!MF.off.has('event')&&!MF.off.has('collect'))return f.apply(this,arguments);OG.S=S.filter(s=>!MF.off.has(MF_ogCat(s)));try{return f.apply(this,arguments)}finally{OG.S=S}})(OG_map);
{const C=$('#roamMapC');if(C){C.addEventListener('pointerup',()=>{MF.g=1},true);for(const t of['pointerup','pointercancel'])addEventListener(t,()=>{MF.g=0})}}
// ---------- chips
function MF_count(){const n={};for(const m of RO.marks||[]){const c=MF_cat(m);if(c)n[c]=(n[c]||0)+1}for(const s of(typeof OG!=='undefined'&&OG.S)||[]){const c=MF_ogCat(s);n[c]=(n[c]||0)+1}return n}
function MF_ui(){const host=$('#roamMap');if(!host)return;let el=document.getElementById('mfBar');if(!el){el=document.createElement('div');el.id='mfBar';host.appendChild(el);
  el.addEventListener('pointerdown',e=>e.stopPropagation());el.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('button');if(!b)return;MF_tap(b.dataset.mf)})}
 const n=MF_count(),C=MF_C.filter(c=>n[c[0]]),allOn=C.every(c=>!MF.off.has(c[0]));
 const h=`<button data-mf="all" class="${allOn?'on':''}"><i>${allOn?'☑':'☐'}</i>ALL</button>`+C.map(([k,i,t])=>`<button data-mf="${k}" class="${MF.off.has(k)?'':'on'}"><i>${i}</i>${t}<em>${n[k]}</em></button>`).join('');
 if(el._h!==h){el._h=h;el.innerHTML=h}}
function MF_tap(k){if(k==='all'){const n=MF_count(),C=MF_C.filter(c=>n[c[0]]).map(c=>c[0]);if(C.every(c=>!MF.off.has(c)))C.forEach(c=>MF.off.add(c));else MF.off.clear()}
 else if(MF.off.has(k))MF.off.delete(k);else MF.off.add(k);MF_save();try{AU.sfx('pick')}catch(e){}MF_ui();if(RO.mapOpen)drawRoamMap()}
toggleMap=(f=>function(){const r=f.apply(this,arguments);if(RO.mapOpen)MF_ui();return r})(toggleMap);
{const st=document.createElement('style');st.textContent=`#mfBar{position:absolute;left:10px;right:200px;top:36px;display:flex;flex-wrap:wrap;gap:6px;z-index:3;padding:2px;pointer-events:none}#mfBar>*{pointer-events:auto}#mfBar::-webkit-scrollbar{display:none}
#mfBar button{flex:none;height:44px;min-width:44px;padding:0 9px;border-radius:12px;border:2px solid rgba(255,255,255,.25);background:rgba(5,11,24,.82);color:#8a97a6;font:800 12px system-ui;display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap}
#mfBar button i{font-style:normal;font-size:15px;filter:grayscale(1);opacity:.55}#mfBar button em{font-style:normal;font-size:12px;opacity:.75;display:none}@media (min-width:1000px) and (min-height:600px){#mfBar button em{display:inline}}
#mfBar button.on{background:#fff;color:#141413;border-color:#141413}#mfBar button.on i{filter:none;opacity:1}
#roamMap #ogMapP{max-height:calc(100% - 230px);overflow:auto}`;document.head.appendChild(st)}
window.__mf={off:()=>[...MF.off],cat:MF_cat,count:MF_count,tap:k=>MF_tap(k)};
