// ===== TM: TEST MODE for Alex (coordinator brief 2026-10-08). One flag: TEST_MODE (10_core.js, next to ALL_OPEN). ?test=0 turns it off for one visit.
// Unlimited studs (999,999, never spent below), every car / part / kit / livery / horn / driver part / team / perk + 3 perk slots unlocked,
// every map event (missions, rivals, boss, challenges, side quests, sprints, flights) open and on the map, a logbook "ALL (TEST)" tab that
// lists them with one-tap travel, and the ⚙ tuning drawer on every screen. Nothing here touches driving or mission routes.
// Saves stay clean: the test values are added when the game READS mho_season / mho_gar and stripped when it WRITES them, so switching
// TEST_MODE off later shows the real save again; loading a slot keeps test mode (it is code, not save data).
const TM_ON=TEST_MODE&&!/[?&]test=0\b/.test(location.search),TM_CR=999999;
if(TM_ON){
 {const raw=k=>{try{const r=localStorage.getItem(skey(k));return r==null?null:JSON.parse(r)}catch(e){return null}};
  const addR=(k,v)=>{if(k==='mho_season'){v=Object.assign({},v||{});v.cr=Math.max(+v.cr||0,TM_CR);return v}
   if(k==='mho_gar'){v=Object.assign({},v||{});v.own=[...new Set([...(v.own||['rod']),...GAR_SETS.map(s=>s.id)])];return v}return v};
  const g0=store.get,p0=store.peek,s0=store.set;
  store.get=function(k,d){return addR(k,g0.call(store,k,d))};
  store.peek=function(k,d){const v=p0.call(store,k,d);return k==='mho_season'||k==='mho_gar'?addR(k,v):v};
  store.set=function(k,v){if(k==='mho_season'&&v){const r=raw(k)||{};v=Object.assign({},v,{cr:+r.cr||0})}
   else if(k==='mho_gar'&&v){const r=raw(k)||{};v=Object.assign({},v,{own:(r.own||['rod']).slice()})}return s0.call(store,k,v)}}
 gbReq=function(){return true};perkUnlocked=function(){return true};perkSlots=function(){return 3};teamLocked=function(){return false};
 markLocked=function(){return false};
 markKnown=(f=>function(m){return m&&m.dyn?f(m):true})(markKnown);
 // menu world list: the boss race button is enabled too
 buildWorld=(f=>function(){const r=f.apply(this,arguments);try{document.querySelectorAll('#wList .wev[disabled]').forEach(b=>{b.disabled=false;const t=b.querySelector('b');if(t&&t.firstChild&&t.firstChild.nodeType===3)t.firstChild.textContent=t.firstChild.textContent.replace(/^🔒 /,'')})}catch(e){}return r})(buildWorld);
 // logbook: ALL (TEST) tab = every event on the map, tap = travel there now (the normal fast-travel warp, no cooldown) and set the route
 {const jt=document.querySelector('#journal .jt');if(jt){const b=document.createElement('button');b.dataset.t='tm';b.textContent='ALL (TEST)';b.onclick=()=>{RO.jTab='tm';journalRender()};jt.prepend(b)}}
 journalRender=(f=>function(){if(RO.jTab!=='tm')return f.apply(this,arguments);document.querySelectorAll('#journal .jt button').forEach(b=>b.classList.toggle('on',b.dataset.t==='tm'));
  const B=$('#jBody'),L=RO.marks.map((m,i)=>[m,i]).filter(([m])=>m&&!['garage','season'].includes(m.kind)&&!m.dyn),K={};
  for(const[m,i]of L){const k=(typeof KIND_N!=='undefined'&&KIND_N[m.kind])||m.kind;(K[k]=K[k]||[]).push([m,i])}
  let h=`<p class="jempty">TEST MODE: every mission and side quest is open. Tap one to go there.</p>`;
  for(const k in K)h+=`<h5 class="tmH">${String(k).toUpperCase()} · ${K[k].length}</h5>`+K[k].map(([m,i])=>{let t='';try{t=markTitle(m)}catch(e){t=m.name||m.kind}return`<button class="jrow" data-tmi="${i}"><i>${(()=>{try{return mapIcon(m)}catch(e){return'📍'}})()}</i><div><b>${t}</b><small>${(()=>{try{return districtAt(m.x,m.z)}catch(e){return''}})()} · ${Math.round(Math.hypot(m.x-RO.x,m.z-RO.z))} m${markDone(m)?' · ✔ done':''}</small></div><u>GO ⚡</u></button>`}).join('');
  B.innerHTML=h;B.querySelectorAll('[data-tmi]').forEach(b=>b.onclick=()=>{const m=RO.marks[+b.dataset.tmi];if(!m)return;RO.wp=m;journalClose();RO.ftT=0;if(!fastTravel(m))say('',('ROUTE · '+markTitle(m)).toUpperCase(),1.4)})})(journalRender);
 // ⚙ tuning drawer everywhere (99t creates it only for ?tune=1 or the beta artifact); 44 px tap target in test mode
 TU.show=true;try{TU_ui()}catch(e){}
 // garage: the header holds the studs counter top-right of centre → the ⚙ sits just left of SAVE & DRIVE instead
 setInterval(()=>{const X=document.getElementById('gbx'),sv=document.getElementById('gbSave'),on=!!(X&&!X.hidden&&sv&&sv.offsetWidth);document.body.classList.toggle('tmGar',on);if(on){const v=Math.round(sv.getBoundingClientRect().left-52)+'px';if(document.body.style.getPropertyValue('--tmx')!==v)document.body.style.setProperty('--tmx',v)}},300);
 {const st=document.createElement('style');st.textContent=`#tuG{width:44px!important;height:44px!important;border-radius:22px!important;font:22px/42px system-ui!important;z-index:9500!important}#tuD{z-index:9501!important}
body.racing #tuG{top:calc(54px + env(safe-area-inset-top))!important}body.tmGar #tuG{right:auto!important;left:var(--tmx)!important;top:calc(4px + env(safe-area-inset-top))!important}
#journal .tmH{margin:8px 4px 2px;font:900 12px system-ui;color:#ffd12c;letter-spacing:.05em}#journal .jt button[data-t="tm"]{color:#ffd12c}`;document.head.appendChild(st)}
}
window.__tm={on:TM_ON,spend:n=>{const S=season();S.cr-=n;store.set('mho_season',S);return season().cr},roam:()=>enterRoam(),log:()=>journalOpen(),open:i=>roamOpen(RO.marks[i]),go:i=>{const m=RO.marks[i];try{journalClose()}catch(e){}RO.ftT=0;fastTravel(m,true);setTimeout(()=>{try{roamOpen(m);RO.cardPin=1;setTimeout(()=>{try{roamGo()}catch(e){console.warn(e)}},400)}catch(e){console.warn(e)}},1500)},
 st:()=>({state,roam:!!RO.on,ch:!!RO.ch,sp:!!RO.sp,card:!!RO.card,locked:RO.marks.filter(m=>markLocked(m)).length,unknown:RO.marks.filter(m=>!markKnown(m)).length,marks:RO.marks.length,slots:perkSlots()}),kind:i=>RO.marks[i]&&RO.marks[i].kind,cr:()=>season().cr,own:()=>GAR_get().own.length+'/'+GAR_SETS.length,raw:k=>localStorage.getItem(skey(k))};
