// ===== quiet-start-r22e3 (Alex 2026-10-21: "very annoying with lots of pop ups, annoying quests that are pointless and not fun")
// Default ON (a removal, not a feature); ?intro=1 (OD_INTRO) or ?qs=0 restores the story/tutorial path in both cities.
// A fresh PLAY in Frankfurt AND Athens = drive at once: no chapter/story card (Athens had a full-screen Eleni card), no prompt above 20 km/h,
// the car is never swapped for the player (dirt keeps the street car; WRONG VEHICLE text is gone), no auto-started or auto-routed objective.
// GO why/quiet-start (own module: 99c_checklist.js is at its size cap): 180 s of stepped driving incl. dirt and past a garage, state asserts only.
const QS={seen:new Set(),off:/[?&]qs=0\b/.test(location.search),log:[]};
QS.act=()=>!OD_INTRO&&!QS.off;
// 1) no chapter-1 story card on a fresh save (Frankfurt already skips it in 80_story_m1.js; Athens showed 'CHAPTER 1 · WELCOME TO ATHENS' and blocked play)
storyCheck=(f=>function(){if(QS.act()&&chapter()<=1){const st=store.get('mho_story',{seen:0,end:0});if((st.seen||0)<1){st.seen=1;store.set('mho_story',st);QS.log.push('chapter card skipped');return false}}return f.apply(this,arguments)})(storyCheck);
// 2) the 'TAP TO OPEN' zone prompt never shows while driving (> 20 km/h)
roamPrompt=(f=>function(dt){f.apply(this,arguments);if(QS.act()&&Math.abs(RO.v)*3.6>20){const el=$('#roamPrompt');RO.pm=null;if(el)el.hidden=true}})(roamPrompt);
// 3) the player's car is never swapped for the off-road buggy on dirt (the boat on water stays: a car cannot float), and the WRONG VEHICLE line is gone
FL_veh=(f=>function(){const v=f.apply(this,arguments);if(QS.act()&&(RO.vsel||'auto')==='auto'&&v==='offroad'){FL.v='ship';return'ship'}return v})(FL_veh);
huTop=(f=>function(v){if(QS.act()&&typeof v==='string'&&v.indexOf('WRONG VEHICLE')>=0)v='';return f.call(this,v)})(huTop);
// 4) no automatic area banner (BORNHEIM 0% COMPLETE), and no 'DRIFT HERE / AIR TIME / SMASH' side challenge starts on its own (popStep timer here, street pop-up pads in models/lx.js)
OG_pop=(f=>function(){if(QS.act()&&arguments.length>1)return;return f.apply(this,arguments)})(OG_pop);   // the automatic call on entering an area passes (area,first); the dev API passes the area only
popStep=(f=>function(){if(QS.act()&&!RO.pop)return;return f.apply(this,arguments)})(popStep);
window.__qs=QS;
// ---- GO why/quiet-start: fresh save, 180 s of stepped driving (road, dirt, past a garage at speed), state asserts only
async function QS_go(){const R=[],ck=(n,b)=>R.push((b?'✓ ':'✗ ')+n),W=ms=>new Promise(r=>setTimeout(r,ms)),A=a=>Math.atan2(Math.sin(a),Math.cos(a));
 const sv={ro:Object.assign({},roamSave()),story:store.get('mho_story',{seen:0,end:0}),flags:store.get('mho_flags',{}),m1:store.get('mho_m1',null),ch:RO.ch,card:RO.card,wp:RO.wp,v:RO.v,vsel:RO.vsel,auto:M1.auto,init:M1.init,isInit:M1.isInit,s:M1.s};
 let water=0,swaps=0,modal=0,modes=0,route=0,maxHint=0,fast=0;const bad=[];
 try{
  {const o=roamSave();for(const k of Object.keys(o))delete o[k];roamStore(o)}
  store.set('mho_story',{seen:0,end:0});store.set('mho_flags',{});
  if(CID==='fra'){store.set('mho_m1',null);M1.init=0;M1.isInit=0;M1.s=null;M1.auto=0}
  const pop0=RO.pop&&RO.pop.k;RO.pop=null;RO.popCd=undefined;if(LVP.c)LVP_end(LVP.c,false);
  RO.ch=null;RO.card=null;RO.wp=null;RO.vsel='auto';RO.v=0;if(RO.story)storyClose();R.push('· side-challenge leftover at start: '+pop0);
  // the fresh PLAY entry runs storyCheck(): no chapter card
  const shown=storyCheck();await W(50);const sEl=$('#story');
  ck('fresh PLAY: no chapter/story card (storyCheck='+shown+', #story hidden='+(!sEl||sEl.hidden)+')',!shown&&(!sEl||sEl.hidden)&&!RO.story);
  const HID=['roamPrompt','roamTop','roamArrow','m1Next','fdHint','roamTut','roamPop','npcSay','ogArea','odPin','crSmHint','roamPlate'];
  const vis=id=>{const e=document.getElementById(id);if(!e||!FD.vis(e))return false;if(id==='roamTop'||id==='roamPop'||id==='ogArea')return FD.txt(e).length>0;return true};
  let lastVm=pl.vmode,lastVeh=RO.veh;
  const sample=t=>{
   if(RO.card||RO.story||(window.M1&&M1.cs))modal++;
   if(RO.ch||RO.sp)modes++;if(RO.wp)route++;
   if(lastVm!==undefined&&pl.vmode!==lastVm){swaps++;bad.push(t.toFixed(0)+'s vmode '+lastVm+'>'+pl.vmode)}lastVm=pl.vmode;
   if(RO.veh==='boat'&&lastVeh==='car'&&QS.safe){water++;RO.v=0;try{roamWarp(QS.safe[0],QS.safe[1],QS.safe[2])}catch(e){}lastVeh='car';lastVm=undefined;return}
   if(RO.veh==='car'&&Math.abs(RO.v)>5&&!pl.air)QS.safe=[RO.x,RO.z,RO.h];
   if(RO.veh!==lastVeh){swaps++;bad.push(t.toFixed(0)+'s veh '+lastVeh+'>'+RO.veh);lastVeh=RO.veh}
   const kmh=Math.abs(RO.v)*3.6,all=[...new Set([...HID.filter(vis),...FD.shown().filter(x=>x!=='hitPop'&&x!=='msg'&&x!=='sub')])];
   if(all.length>maxHint)maxHint=all.length;
   for(const e of document.querySelectorAll('body *')){if(e.children.length>3||!e.id&&!e.className)continue;const tx=FD.txt(e);if(tx.length<4||!/[A-Za-z]{3}/.test(tx)||['SCRIPT','STYLE','BUTTON'].includes(e.tagName)||e.closest('button'))continue;if([...e.children].some(c=>FD.txt(c)===tx)||!FD.vis(e))continue;const k=(e.id||String(e.className).split(' ')[0])+':'+tx.slice(0,30);if(!QS.seen.has(k)){QS.seen.add(k);bad.push(t.toFixed(0)+'s other '+k)}}
   if(all.length>1)bad.push(t.toFixed(0)+'s '+all.length+' hints: '+all.join(','));
   if(kmh>20&&all.length){fast++;bad.push(t.toFixed(0)+'s '+Math.round(kmh)+'km/h [pop='+!!RO.pop+' lvp='+!!LVP.c+' cd='+Math.round(RO.popCd)+'] hint: '+all.map(id=>id+'='+FD.txt(document.getElementById(id)).slice(0,24)).join(' | '))}};
  const drive=async(secs,t0,steer)=>{for(let k=0,n=Math.round(secs*30);k<n&&state==='roam';k++){const t=t0+k/30;
    if(steer){const la=12+RO.v*.9,q=rfSnap(RO.x+Math.sin(RO.h)*la,RO.z+Math.cos(RO.h)*la,60),e=q?A(Math.atan2(q[0]-RO.x,q[1]-RO.z)-RO.h):0;K.ArrowLeft=e>.06;K.ArrowRight=e<-.06}
    K.KeyW=K.ArrowUp=true;roamStep(1/30);FD.tick(1/30);if(k%15===0){await 0;FD.arb();sample(t)}}
   K.KeyW=K.ArrowUp=K.ArrowLeft=K.ArrowRight=false};
  // A) 0-60 s: road-follow from the start
  await drive(60,0,true);
  if(window.__qsShot)try{await window.__qsShot()}catch(e){}   // tools: one 852x393 shot per city at 60 s
  // B) 60-90 s: dirt (a park) at speed
  let grass=null;try{grass=window.__xf&&__xf.grass&&__xf.grass()}catch(e){}
  if(grass){try{roamWarp(grass.x,grass.z,grass.h)}catch(e){}RO.v=14;await drive(30,60,false)}else R.push('· no park spot found, dirt leg skipped');
  // C) 90-135 s: warp 70 m before the nearest garage and drive through it at speed
  const gm=RO.marks.filter(m=>m.kind==='garage').sort((a,b)=>Math.hypot(a.x-RO.x,a.z-RO.z)-Math.hypot(b.x-RO.x,b.z-RO.z))[0];
  if(gm){const q=rfSnap(gm.x,gm.z,60),h=q&&q[2]!=null?q[2]:RO.h,x=(q?q[0]:gm.x)-Math.sin(h)*70,z=(q?q[1]:gm.z)-Math.cos(h)*70,p=rfSnap(x,z,60);try{roamWarp(p?p[0]:x,p?p[1]:z,h)}catch(e){}RO.v=20;RO.cool=0;await drive(45,90,true)}else R.push('· no garage mark');
  // D) 135-180 s: road-follow again
  await drive(45,135,true);
  ck('180 s: 0 modal cards / story / cutscene ('+modal+')',modal===0);
  ck('0 vehicle swaps ('+swaps+(water?'; '+water+' river dips warped back, the boat on water stays':'')+')',swaps===0);
  ck('0 auto-started quests/modes/timers ('+modes+')',modes===0);
  ck('0 auto-routing (waypoint set in '+route+' samples)',route===0);
  ck('<=1 hint visible at any time (max '+maxHint+')',maxHint<=1);
  ck('no prompt/hint above 20 km/h ('+fast+' samples)',fast===0);
 }catch(e){R.push('✗ threw '+e)}
 finally{K.KeyW=K.ArrowUp=K.ArrowLeft=K.ArrowRight=false;for(const id of FD.SLOTS){const e=document.getElementById(id);if(!e)continue;if(id==='msg'||id==='sub')e.style.opacity=0;else e.hidden=true}FD.rec.clear();/* leave no transient text for the next GO */store.set('mho_story',sv.story);store.set('mho_flags',sv.flags);store.set('mho_m1',sv.m1);roamStore(sv.ro);RO.ch=sv.ch;RO.card=sv.card;RO.wp=sv.wp;RO.v=sv.v;RO.vsel=sv.vsel;M1.auto=sv.auto;M1.init=sv.init;M1.isInit=sv.isInit;M1.s=sv.s}
 const ok=R.every(r=>r[0]==='✓'||r[0]==='·');return'📍 why/quiet-start · '+R.join(' · ')+(bad.length?' · EVENTS '+bad.slice(0,14).join(' ; '):'')+' → '+(ok?'✅ PASS':'❌ FAIL')}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 // the xf1/* (auto vehicle form) and life1/popup (street pop-up pad) GOs test the features quiet-start switches off: they run in legacy mode (same as ?qs=0), every other GO runs quiet
 {const g0=__chk.go,off0=QS.off;if(typeof g0==='function')__chk.go=function(id){QS.off=off0||/^(xf1|life1\/popup)/.test(String(id));return g0.apply(this,arguments)}}
 __chk.items.unshift({ver:'why',id:'quiet-start',area:'ui',text:'quiet-start-r22e3 (Alex: "lots of pop ups, annoying quests"): a fresh PLAY in Frankfurt AND Athens = drive at once. 180 s of stepped driving (road, dirt, past a garage at speed): 0 modal/story/chapter cards, 0 vehicle swaps, 0 auto-started or auto-routed modes, <=1 hint visible, none above 20 km/h. ?intro=1 / ?qs=0 restore the old path. 📍 GO.'});
 __chk.GO['why/quiet-start']=['fra','ath'].map(c=>({c,n:'quiet start '+(c==='fra'?'Frankfurt':'Athens'),secs:90,fn:()=>QS_go()}))},500)}
