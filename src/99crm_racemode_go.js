// racemode-r25a: GO race/racemode-all (lazy chunk, phone profile, fra + ath). Alex (beta.162): "Races are unplayable ... many races and types".
// Every race of the race menu (Race tab per track, Cup, Time trial, Zone, Arena, Derby, Crash Jct, Daily, World rivals + boss) is started through the
// real menu path (toMenu, tab button, city + track button, START), then driven on a stepped clock by a human-like bot (lag 0.15 s, plain arrow keys):
// city courses with tkBot (98tk_go.js), race-mode spline tracks with RM_bot (target = road centre, same steering lag). Per race:
// picked = the started race is the one picked; fin = the race ends (race types: player finished, not DNF; endless modes: ran 60 s); stuck = 2 s standstill
// with the gas held; walls = speed halved from > 14 m/s; riv = every rival finished (race types); fly = a city rival > 3 m above / 1 m under the ground, a race-mode rival airborne > 4 s or off its road plane;
// cam = camera distance / FOV judged like cam/steady (CST_judge, 99cst_camsteady_go.js); err = page errors during the race.
const RMG={lag:.15,out:null,errs:0};
function RM_list(){const ath=CID==='ath',T=ath?ATH_TRACKS:TDF,L=[];
  for(const d of T)L.push({tab:'quick',trk:d.id,n:'Race · '+d.short});
  L.push({tab:'cup',n:'Cup · round 1'});
  for(const[t,l]of[['tt','Time trial'],['zone','Zone'],['arena','Arena'],['derby','Derby'],['junction','Crash Jct']])L.push({tab:t,trk:T[0].id,n:l+' · '+T[0].short});
  L.push({tab:'daily',n:'Daily'});
  for(const ev of tkWorldEvs())L.push({tab:'world',ev,n:'World · '+ev.p+(ev.boss||ev.sig==='boss'?' (boss)':'')});
  return L}
// the real menu path: clicks on the menu buttons (world rivals have no tab: the career map sets worldPick + menuTab like a rival card does)
function RM_start(it){try{if(RO.sp)sprintEnd();chAbort()}catch(e){}try{$('#spRes').hidden=true;$('#results').hidden=true}catch(e){}
  RO.launching=false;RO.sprId=null;toMenu();
  if(it.tab==='world'){worldPick=it.ev;menuTab='world'}
  else{const b=[...document.querySelectorAll('#tabs button')].find(q=>q.dataset.t===it.tab);if(!b)return'no tab '+it.tab;b.click();
    if(it.trk){const cb=[...document.querySelectorAll('#trkCity button')].find(q=>q.dataset.c===(isAthT(it.trk)?'ath':'fra'));if(cb&&cb.getAttribute('aria-pressed')!=='true')cb.click();
      const D=(isAthT(it.trk)?ATH_TRACKS:TDF).find(d=>d.id===it.trk),tb=[...document.querySelectorAll('#tracks button.trk')].find(q=>q.querySelector('b')&&q.querySelector('b').textContent===D.short);if(!tb)return'no track button '+it.trk;tb.click()}}
  $('#startBtn').click();return''}
// what is running now: a city course (name) or a race-mode track (type + track id)
function RM_what(){const sp=RO.sp;if(sp&&sp.tk)return{city:1,name:sp.C.name,key:sp.C.key,kind:sp.C.kind};if(['countdown','race','finished'].includes(state)&&RC)return{city:0,type:RC.type,trk:RC.track||(TD&&TD.id),world:RC.world&&RC.world.p};return null}
function RM_picked(it,w){if(!w)return false;
  if(it.tab==='quick'){if(!w.city)return w.type==='race'&&w.trk===it.trk;const D=TRACK_DEFS.find(t=>t.id===it.trk);return w.kind==='quick'&&w.name.startsWith(D.short)&&w.key==='quick:'+CID+':'+it.trk}   // the menu Race tab = the picked track in race mode (or its city course)
  if(it.tab==='world')return w.city?w.key&&w.name&&(w.key.includes(it.ev.p)||w.name.toUpperCase().includes(it.ev.p)||w.key.startsWith('rival')||w.key.startsWith('boss')):w.world===it.ev.p;
  if(w.city)return false;const ty={tt:['tt','duel'],zone:['zone'],arena:['arena'],derby:['arena'],junction:['junction'],cup:['race'],daily:null}[it.tab];return(!ty||ty.includes(w.type))&&(!it.trk||w.trk===it.trk)}
// race-mode bot: aim at the road centre a speed-dependent distance ahead, plain arrow keys through a 0.15 s steering delay
function RM_bot(){const q=[],lagN=Math.round(RMG.lag/H);return()=>{const s=pl;if(!s)return;const B=R15_b(s,s.x),xt=(B[0]+B[1])/2,sp=Math.max(6,s.v),k=kAt(TD,s.dist+sp*.5);
  const e0=clamp(Math.atan2((xt-s.x)*1.2,sp*1.2),-.25,.25)-s.beta+k*sp*.18;q.push(e0);const e=q.length>lagN?q[q.length-1-lagN]:0;
  K.ArrowLeft=K.ArrowRight=false;if(Math.abs(e)>.03)K[e>0?RMG.sR:RMG.sL]=true;K.ArrowUp=K.KeyW=!(Math.abs(e0)>.5&&s.v>16);K.ArrowDown=false}}
// steering sign: which arrow turns the race-mode car towards +beta (calibrated once per page)
function RM_cal(){if(RMG.sR)return;const s=pl,b0=s.beta;K.ArrowRight=true;for(let i=0;i<8;i++)stepSim();K.ArrowRight=false;const pos=s.beta>b0;RMG.sR=pos?'ArrowRight':'ArrowLeft';RMG.sL=pos?'ArrowLeft':'ArrowRight'}
function RM_air(y,x,z){const g=groundAt(x,z,y+3);return g==null||!isFinite(g)?0:y-g}
// drive one race. Phase 1 to `mid` sim-seconds (shot), phase 2 to the end (cap secs)
function RM_drive(R,secs){const it=R.it,city=R.w&&R.w.city;let cam=R.cam||(R.cam=[]),seg=R.seg|0;
  if(city){const sp=RO.sp;if(!R.bot){const C=sp.C,G=tkGeoOf(C),P=C.water||C.off?G.pB:G.pA;R.bot=tkBot(P,{lag:RMG.lag});R.len=tkLen(P);sp.cd=0;camSnap=true}
    for(let i=0;i<secs*30&&RO.sp===sp&&!sp.done;i++){R.bot(sp);roamStep(1/30);roamCam(1/30);R.st++;
      for(const a of sp.ai){if(!a.g||a.fin!=null||a.wet||RO.veh==='boat')continue;const p=a.g.position,d=RM_air(p.y,p.x,p.z);if(d>3)R.fly++;if(d<-1)R.sink++}
      const c=camera.position;if(Math.hypot(RO.x-(R.px??RO.x),RO.z-(R.pz??RO.z))>8)seg++;R.px=RO.x;R.pz=RO.z;cam.push([Math.hypot(c.x-RO.x,c.y-RO.y,c.z-RO.z),camera.fov,Math.abs(RO.v),seg])}
    R.seg=seg;const b=R.bot.R;R.stuck=b.stuck.length;R.stuckAt=b.stuck.slice(0,3);R.walls=b.walls;R.prog=Math.round(b.maxS/R.len*100);
    const L=TK.last;if(RO.sp!==sp||sp.done){R.end=1;R.fin=!!L&&L.key===sp.C.key&&!L.dnf;R.place=L&&L.place;R.t=L&&L.t;R.riv=sp.ai.every(a=>a.fin!=null);R.rivN=sp.ai.filter(a=>a.fin!=null).length+'/'+sp.ai.length}else{R.riv=sp.ai.every(a=>a.fin!=null);R.rivN=sp.ai.filter(a=>a.fin!=null).length+'/'+sp.ai.length}
    return}
  // race mode: the frame loop's race branch, stepped (H), keys from RM_bot
  if(!R.bot){if(state==='countdown'){cdT=0;state='race'}RM_cal();R.bot=RM_bot();R.t0=raceT;R.pv=[];R.still=0;camSnap=true;updateCam(H,true)}
  const n=Math.round(secs/H),endless=['zone','arena','junction'].includes(RC.type)||RC.derby;
  for(let i=0;i<n&&(state==='race'||state==='finished');i++){R.bot();stepSim();raceT+=H;lapLogic();for(const s of ships)posShip(s,H);updateCam(H);if(state==='finished'){finishT+=H;if(finishT>4.5)break}R.st++;
    const s=pl;if(!s)break;R.pv.push(s.v);if(R.pv.length>8){const v0=R.pv.shift();if(v0>14&&s.v<v0*.5&&!s.dead)R.walls++}
    if(Math.abs(s.v)<1.5&&K.ArrowUp&&!s.dead){if(++R.still===Math.round(2/H)){R.stuck++;R.still=0}}else R.still=0;
    for(const o of ships){if(o.isPlayer||o.dead>0||o.finished||!o.mesh)continue;o.rmAir=o.air?(o.rmAir||0)+H:0;if(o.rmAir>4)R.fly++;if(o.boatMode||o.air)continue;frameAt(TD,o.dist,F2);const dy=o.mesh.position.y+(o.mesh.userData.m?o.mesh.userData.m.position.y:0)-(F2.p.y+F2.r.y*o.x);if(dy<-1||dy>4)R.sink++}   // race mode places a car on the (banked) road plane at its lateral x: off it = sunk or floating; airborne > 4 s = flying
    if(!!CC!==!!R.cc){R.cc=!!CC;R.cs=(R.cs|0)+1}if(i%2===0&&!CC){const c=camera.position,m=s.mesh.position.clone();if(s.mesh.userData.m)m.add(s.mesh.userData.m.position);cam.push([Math.hypot(c.x-m.x,c.y-m.y,c.z-m.z),camera.fov,Math.abs(s.v),R.cs|0])}}   // crash-cam cutaways (takedown / wreck) are not chase-cam frames: new window after one
  const s=pl;R.prog=Math.round(Math.max(0,s.dist)/TD.L*100)/100;const rs=ships.filter(o=>!o.isPlayer);
  if(endless){R.end=state!=='race'||raceT-R.t0>=60;R.fin=!s.dead||raceT-R.t0>=60;R.riv=true;R.rivN='—'}
  else if(RC.type==='tt'){R.end=s.laps.length>=1;R.fin=s.laps.length>=1;R.t=s.laps.length?+s.laps[0].toFixed(1):null;R.riv=true;R.rivN='—'}
  // results come 4.5 s after the player's finish: a rival still racing then is fine, one that is far behind (< 60 % of the player's distance) is stuck or lost
  else{R.end=state!=='race';R.fin=!!s.finished&&!s.dnf&&!RC.dnf;R.place=s.place;R.t=+(raceT-R.t0).toFixed(1);const lag=rs.filter(o=>!o.finished&&!o.eliminated&&o.dist<s.dist*.6);R.riv=!lag.length;R.rivN=rs.filter(o=>o.finished).length+'/'+rs.length+(lag.length?' behind: '+lag.map(o=>o.name+' '+Math.round(o.dist)+' m').join(','):'')}}
function RM_open(i){const it=RM_list()[i];if(!it)return null;const e0=RMG.errs;const R={i,it,n:it.n,st:0,stuck:0,walls:0,fly:0,sink:0,e0};
  R.bad=RM_start(it);return R}
// after the start settled (a city course starts once enterRoam resolved): what started, and is it the picked race
function RM_seen(R){R.w=RM_what();R.picked=!R.bad&&RM_picked(R.it,R.w);R.got=R.w?(R.w.city?R.w.name:R.w.type+' '+R.w.trk+(R.w.world?' '+R.w.world:'')):'nothing';return R}
function RM_close(R){K.ShiftLeft=K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=K.ArrowDown=false;let cj=null;try{cj=typeof CST_judge==='function'&&R.cam&&R.cam.length>300?CST_judge(R.cam,R.n):null}catch(e){}
  R.camOk=cj?cj.ok:null;R.camSay=cj?`d rev ${cj.revD}, FOV rev ${cj.revF}, out ${cj.out.toFixed(1)} m/s, ${cj.fr.toFixed(0)}°/s`:'—';R.err=RMG.errs-R.e0;
  R.ok=R.picked&&R.fin&&R.stuck===0&&R.riv&&!R.fly&&!R.sink&&R.camOk!==false&&!R.err;delete R.cam;delete R.bot;delete R.pv;
  try{if(RO.sp)sprintEnd()}catch(e){}try{$('#spRes').hidden=true;$('#results').hidden=true}catch(e){}return R}
// whole triage in one call (GO): every race to its end (cap 300 s sim), no shots
async function RM_all(cap=300){const out=[],L=RM_list();for(let i=0;i<L.length;i++){let R;try{R=RM_open(i);await new Promise(r=>setTimeout(r,1500));RM_seen(R);if(R.w)RM_drive(R,cap)}catch(e){R=R||{n:L[i].n};R.threw=String(e).slice(0,140)}out.push(RM_close(R))}RMG.out=out;return out}
const RM_row=R=>`${R.ok?'✓':'✗'} ${R.n}${R.picked?'':' [started '+R.got+']'}${R.fin?'':' not finished'}${R.stuck?' stuck '+R.stuck:''}${R.riv?'':' rivals '+R.rivN}${R.fly?' fly':''}${R.sink?' sink':''}${R.camOk===false?' cam':''}${R.err?' err '+R.err:''}${R.threw?' threw '+R.threw:''}`;
async function RM_go(){const o=await RM_all(),bad=o.filter(r=>!r.ok);return`📍 RACE MODE ALL · ${o.length-bad.length}/${o.length} races OK · ${(bad.length?bad:o.slice(0,3)).map(RM_row).join(' · ')} → ${bad.length?'❌ FAIL':'✅ PASS'}`}
window.addEventListener('error',()=>RMG.errs++);
window.__rm={list:()=>RM_list().map(q=>q.n),open:i=>(RMG.cur=RM_open(i),1),what:()=>{const R=RM_seen(RMG.cur);return{n:R.n,picked:R.picked,got:R.got}},drive:s=>{if(RMG.cur.w)RM_drive(RMG.cur,s);else RMG.cur.end=1;return{st:RMG.cur.st,end:!!RMG.cur.end}},close:()=>RM_close(RMG.cur),all:RM_all,go:RM_go,G:RMG,ev:src=>eval(src)};   // ev: probes (module scope)
(function RM_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='race'&&q.id==='racemode-all'))C.items.push({ver:'race',id:'racemode-all',area:'race',text:'racemode-r25a · race/racemode-all: every race of the race menu (each Race track, Cup, Time trial, Zone, Arena, Derby, Crash Jct, Daily, World rivals) starts the race that was picked through the real menu buttons, the human-like bot finishes it with no stuck spot, every rival finishes on its wheels, the camera does not pump, no page errors'});
  C.GO['race/racemode-all']=[{c:'fra',n:'Race menu (Frankfurt)',secs:600,fn:()=>RM_go()},{c:'ath',n:'Race menu (Athens)',secs:600,fn:()=>RM_go()}];return}
 if(i<600)setTimeout(()=>RM_reg(i+1),100)})(0);
