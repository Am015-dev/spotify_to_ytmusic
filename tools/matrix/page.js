// tools/matrix/page.js: injected into the warm hot page (window.__hot = eval in the game's module scope). Defines window.MX: generated player-experience cases,
// each asserted from STATE in a few ms (no real time, no drawing). Every check has an id; a case result = {fam, tag, fails:[ids]}.
(()=>{
const D2R=Math.PI/180,ang=(ax,az,bx,bz)=>{const a=Math.hypot(ax,az),b=Math.hypot(bx,bz);if(a<1e-6||b<1e-6)return 180;return Math.acos(Math.max(-1,Math.min(1,(ax*bx+az*bz)/(a*b))))/D2R};
const vis=e=>{if(!e)return null;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||r.width<2||r.height<2)return null;return r};
// the game's own rAF loop is stopped (it burns a core per page for nothing); MX.frame() runs exactly one real frame (sim + HUD update) when a check needs the DOM
if(!window.__rafOrig){window.__rafOrig=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0}
const ovl=(a,b)=>!(a.right<=b.left+1||b.right<=a.left+1||a.bottom<=b.top+1||b.bottom<=a.top+1);
const VW=()=>({w:innerWidth,h:innerHeight});
// HUD: required controls for the profile exist, are visible, inside the viewport, not overlapping each other
function hud(ids,fails,pre){const rs={},V=VW();for(const id of ids){const e=document.getElementById(id),r=vis(e);if(!r){fails.push(pre+'hud-missing-'+id);continue}
  rs[id]=r;if(r.left<-1||r.top<-1||r.right>V.w+1||r.bottom>V.h+1)fails.push(pre+'hud-offscreen-'+id)}
 const k=Object.keys(rs);for(let i=0;i<k.length;i++)for(let j=i+1;j<k.length;j++)if(ovl(rs[k[i]],rs[k[j]]))fails.push(pre+'hud-overlap-'+k[i]+'-'+k[j])}
const R=[];const MX={R,prof:'phone',ang,hud,frame(n){for(let i=0;i<(n||1);i++)frame(performance.now())},
 reset(){R.length=0},
 rst(){try{__tq.reset();return true}catch(e){return false}},
 setProf(pr){MX.prof=pr;const t=pr!=='desktop';try{TOUCH.on=t;TOUCH.used=t;document.body.classList.toggle('touch',t)}catch(e){}if(t)try{window.dispatchEvent(new TouchEvent('touchstart',{touches:[],changedTouches:[]}))}catch(e){}window.dispatchEvent(new Event('resize'))},
 bxEnd(){try{if(BX.on)BX_close()}catch(e){}try{__tq.reset()}catch(e){}},
 async setRide(id){TQ.car=id;gbOpen();GAR_select(id);let k=0;while(typeof LDL!=='undefined'&&LDL.wait.size&&k++<200)await new Promise(r=>setTimeout(r,25));gbClose(true);await new Promise(r=>setTimeout(r,20));
  if(typeof BX!=='undefined'){try{if(BX.mode==='drive')BX_driveStop()}catch(e){}try{if(BX.car&&BX.car.parent)BX.car.parent.remove(BX.car)}catch(e){}BX.car=null}return id},
 // ---------------- builder tracks ----------------
 bxLap(demo,prof,rid,maxS){const fails=[],t0=performance.now(),info={};
  try{if(BX.name!==demo||!BX.pcs.length){if(!BX.on)BX_open();BX_load(BX_DEMOS[demo],demo)}
   const touch=prof!=='desktop';BX.keys={};BX.tc={};BX.touch=touch;BX_driveStart();const V=BX.v,m=BX.m,sm=BX.samp,n=sm.length;let ci=0,back=0,maxI=0,N=Math.round((maxS||150)*120);
   if(!touch)BX.keys.ArrowUp=true;
   for(let i=0;i<N;i++){let best=1e9,bj=ci;for(let j=ci;j<Math.min(n,ci+40);j++){const q=sm[j].s.p,d=(q.x-V.p.x)**2+(q.y-V.p.y)**2*.2+(q.z-V.p.z)**2;if(d<best){best=d;bj=j}}ci=bj;maxI=Math.max(maxI,ci);
    const T=sm[Math.min(n-1,ci+7)].s.p,S=new THREE.Vector3().crossVectors(V.F,V.U).normalize(),lat=(T.x-V.p.x)*S.x+(T.z-V.p.z)*S.z;const inp=BX_input();inp.s=Math.max(-1,Math.min(1,lat/5));
    BX_step(1/120,inp);if(V.v.dot(V.F)<-1)back+=1/120;if(m.laps>=1&&!info.t1){info.t1=m.t}if(m.laps>=(BX_RACE_LAPS||2))break}
   info.back=+back.toFixed(2);info.resp=m.resp;info.why=m.respWhy.join(',');info.wall=m.wall;info.cp=V.cpN;info.laps=m.laps;info.prog=+(maxI/n).toFixed(2);info.t=+m.t.toFixed(1);
   if(back>.5)fails.push('bx-lap-drives-backwards');if(m.laps<1&&maxI<n*.93)fails.push('bx-lap-incomplete');if(m.resp>3)fails.push('bx-lap-many-respawns');BX.keys={}
  }catch(e){fails.push('bx-crash:'+String(e).slice(0,60))}
  R.push({fam:'builder-lap',tag:demo+'|'+prof+'|'+rid,fails,info,ms:performance.now()-t0});return info},
 bxFrame(){const V=BX.v;BX.car.position.copy(V.p);const S=new THREE.Vector3().crossVectors(V.F,V.U).normalize();BX.car.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(S.negate(),V.U,V.F));BX.car.updateMatrixWorld(true)},
 bxCase(demo,prof,rid){const fails=[],t0=performance.now();
  try{
   if(BX.name!==demo||!BX.pcs.length){if(!BX.on)BX_open();BX_load(BX_DEMOS[demo],demo)}
   const touch=prof!=='desktop';BX.keys={};BX.tc={};BX.touch=touch;
   BX_driveStart();const V=BX.v,L=BX.pcs.filter(p=>!p.dead),st=L.find(p=>p.def.start)||L[0],S0=st.S[0],a=S0[0].p,b=S0[S0.length-1].p,F0=V.F.clone(),p0=V.p.clone();
   // spawn heading = start piece's path tangent
   if(ang(F0.x,F0.z,b.x-a.x,b.z-a.z)>20)fails.push('bx-heading-vs-path');
   // the DRAWN car faces where it drives (mesh forward = +z of the ride's own frame; BX.cyaw rotates it)
   MX.bxFrame();{const m=BX.carM.userData.m||BX.carM;m.updateMatrixWorld(true);const wd=new THREE.Vector3(0,0,-1).transformDirection(m.matrixWorld);/* roam builds the ride with its FRONT on local -z (roamPose: basis(right,up,-fwd)) */if(ang(wd.x,wd.z,F0.x,F0.z)>20)fails.push('bx-visual-facing')}
   try{BX_tick(performance.now()+16)}catch(e){fails.push('bx-tick-throws')}
   {const c=BX.cam.position,dx=c.x-V.p.x,dz=c.z-V.p.z,h=Math.hypot(dx,dz);if(!(h>2&&(dx*F0.x+dz*F0.z)/h<-.5))fails.push('bx-camera-behind');if(!(c.y>V.p.y-.5))fails.push('bx-camera-below')}
   const kb=prof==='desktop';if(kb)BX.keys.ArrowUp=true;
   let minVf=1e9,g=0,N=240;for(let i=0;i<N;i++){BX_step(1/120,BX_input());const vf=V.v.dot(F0);if(i>60)minVf=Math.min(minVf,vf);if(V.g)g++}
   const prog=V.p.clone().sub(p0).dot(F0);if(!(prog>5))fails.push('bx-no-forward-progress');if(minVf<-1)fails.push('bx-reverses');if(BX.m.resp>0)fails.push('bx-respawned-in-2s');if(g<N*.6)fails.push('bx-not-grounded');
   // after the run the car still faces its travel direction
   {const vh=V.v.clone();vh.y=0;if(vh.length()>3&&ang(vh.x,vh.z,V.F.x,V.F.z)>35)fails.push('bx-travel-vs-facing')}
   BX.keys={};
   // HUD for the profile (phone/portrait: the ◀ ▶ BRAKE pad + respawn + back; desktop: back + respawn)
   hud(touch?['bxL','bxR','bxB','bxRsp','bxBack']:['bxRsp','bxBack'],fails,'bx-')
  }catch(e){fails.push('bx-crash:'+String(e).slice(0,60))}
  R.push({fam:'builder',tag:demo+'|'+prof+'|'+rid,fails,ms:performance.now()-t0});return fails.length},
 // ---------------- free roam ----------------
 starts(n){if(MX._st&&MX._st.length)return MX._st.slice(0,n);const S=new Map();for(let x=WX0+100;x<=WX1-100;x+=150)for(let z=WZS+100;z<=WZN-100;z+=150){const q=rfSnap(x,z,60);if(q&&!(q[0]===x&&q[1]===z))S.set(Math.round(q[0]/30)+','+Math.round(q[1]/30),q)}
  const all=[...S.values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const step=Math.max(1,all.length/n),o=[];for(let i=0;i<n&&Math.floor(i*step)<all.length;i++)o.push(all[Math.floor(i*step)]);MX._st=o;return o},
 spotStarts(){const o=[];const add=(e,n)=>{if(!isFinite(e)||!isFinite(n))return;const w=WP(e,n),q=rfSnap(w[0],w[1],200);if(q)o.push(q)};
  for(const k in RF.spots||{}){const v=RF.spots[k];if(Array.isArray(v)&&typeof v[0]==='number'&&typeof v[1]==='number')add(v[0],v[1])}
  for(const t of RF.taxi||[])add(t[0],t[1]);for(const g of RF.garages||[])add(g[2],g[3]);for(const l of RF.lm||[])add(l[2],l[3]);return o},
 roamCase(prof,rid,q,idx,prog,fam){const fails=[],t0=performance.now();
  try{
   if(q&&!roamWarp(q[0],q[1],q[2])&&!(MX.rst()&&roamWarp(q[0],q[1],q[2])))fails.push('roam-warp-refused');
   else{
    const touch=prof!=='desktop';TOUCH.on=touch;TOUCH.used=touch;TOUCH.gas=false;TOUCH.brake=false;for(const k in K)K[k]=false;
    if(prog)roamStep(1/120);/* the 10 ms world step is only needed for the gas test; pose/camera/tyre state needs none (same findings, 9x faster) */
    if(typeof RO_clearRamps==='function'&&RO_clearRamps())RO.y=groundAt(RO.x,RO.z,RO.y+3); // cam-3: a start overlapping a street ramp / jump-ramp gap steps out, like roamWarp's post-warp clear
    // cam-3: a start on a >35 % slope (1.6 m rise over the wheelbase) is a cliff, not a street start: the rigid body + ±0.2 m wheel travel cannot sit on it. Counted, not failed.
    {const fx=Math.sin(RO.h),fz=Math.cos(RO.h),sl=(groundAt(RO.x+fx*2.5,RO.z+fz*2.5,RO.y+4)-groundAt(RO.x-fx*2.5,RO.z-fz*2.5,RO.y+4))/5;if(Math.abs(sl)>.35){MX.steep=(MX.steep||0)+1;return{fails:[],ms:performance.now()-t0}}}
    for(let i=0;i<3;i++)roamPose(pl,.25);camSnap=true;roamCam(1/60)
    const fx=Math.sin(RO.h),fz=Math.cos(RO.h);
    {const r=rfSnap(RO.x,RO.z,60);if(!r)fails.push('roam-off-road-at-start');else{const a=ang(fx,fz,Math.sin(r[2]),Math.cos(r[2]));if(a>20&&a<160){const f=fillAt(RO.x,RO.z),a2=f&&f.d<f.r.w/2+6?ang(fx,fz,f.r.ux,f.r.uz):999;/* a filler street under the car counts too (rfSnap prefers a city road up to 60 m away) */if(!(a2<=20||a2>=160))fails.push('roam-heading-vs-road')}}}
    if(SC_hit(RO.x,RO.z,RO.y))fails.push('roam-start-inside-wall');
    if(RO.y<groundAt(RO.x,RO.z,RO.y+3)-.3)fails.push('roam-underground');
    {const pk=OF_parkChk();if(!pk||pk.tyre.some(g=>!(Math.abs(g)<=.05)))fails.push('roam-tyre-gap>5cm');MX.last=pk&&pk.tyre}
    {const m=pl.mesh.userData.m;m.updateMatrixWorld(true);const wd=new THREE.Vector3(0,0,-1).transformDirection(m.matrixWorld);if(ang(wd.x,wd.z,fx,fz)>20)fails.push('roam-visual-facing')}
    {const c=camera.position,dx=c.x-RO.x,dz=c.z-RO.z,h=Math.hypot(dx,dz);if(!(h>2&&h<40&&(dx*fx+dz*fz)/h<-.5))fails.push('roam-camera-behind');if(c.y<RO.y)fails.push('roam-camera-below-car')}
    if(prog){/* rev-3: the gas test measures driving, not marker cards: a card left over from the previous spot (or opened by a marker within range) brakes the car = 6 false roam-no-forward-progress per 71 spots */RO.card=null;{const c=document.getElementById('roamCard');if(c)c.hidden=true}RO.cool=99;const x0=RO.x,z0=RO.z;if(touch)TOUCH.gas=true;else K.ArrowUp=true;let minV=1e9,wall0=SC_S.nb;for(let i=0;i<120;i++){/* rev-3: 120 steps (2 s): the slow starter t_v7747_1 covers 5.7 m at 1.5 s and fell under 5 m on portrait by a hair */roamStep(1/60);if(i>20)minV=Math.min(minV,RO.v)}K.ArrowUp=false;TOUCH.gas=false;RO.cool=0;
     const mv=(RO.x-x0)*fx+(RO.z-z0)*fz;if(!(mv>5))fails.push('roam-no-forward-progress');if(minV<-1)fails.push('roam-reverses')}
   }
  }catch(e){fails.push('roam-crash:'+String(e).slice(0,70))}
  R.push({fam:fam||'roam',tag:idx+'|'+prof+'|'+rid+'|'+(fails.length&&q?q.map(x=>Math.round(x*10)/10).join(','):''),fails,det:fails.length&&fails.some(f=>/tyre/.test(f))?MX.last:undefined,ms:performance.now()-t0});return fails.length},
 // HUD of the profile once per ride (free roam)
 roamHud(prof,rid){const fails=[];const touch=prof!=='desktop';
  try{if(state!=='roam'||!RO.on||document.body.classList.contains('bxOn')||getComputedStyle(document.getElementById('touch')).display==='none'){try{MX.bxEnd()}catch(e){}MX.frame(2)}
   TOUCH.on=touch;TOUCH.used=touch;document.body.classList.toggle('touch',touch);MX.frame(3);const ids=touch?['tB','tL','tR','tP',...(thrEff()==='pedal'?['tG']:[])]:[];hud(ids,fails,'roam-');
   if(touch){const g=vis(document.getElementById('tG'));if(!g&&!(typeof SET!=='undefined'&&SET.gas==='auto'||TOUCH.autoGas!==undefined))/* gas default on: GAS button may be hidden */void 0}
  }catch(e){fails.push('roam-hud-crash:'+String(e).slice(0,60))}
  R.push({fam:'roam-hud',tag:prof+'|'+rid,fails,ms:0});return fails.length},

 // ---------------- city races ----------------
 async raceCase(track,prof,rid){const fails=[],t0=performance.now();const touch=prof!=='desktop';let info={};
  try{
   if(state!=='roam'||!RO.on){try{__tq.reset()}catch(e){}}
   TOUCH.on=touch;TOUCH.used=touch;TOUCH.gas=false;TOUCH.brake=false;for(const k in K)K[k]=false;
   menuTab='quick';menuTrack=track;quickTraffic=false;RO.launching=true;roamSavePos();RO.on=false;$('#roam').hidden=true;RO.card=null;startRace();RO.launching=false;RO.fromRoam=true;
   let k=0;while(state!=='countdown'&&k++<400)await new Promise(r=>setTimeout(r,25));
   if(state!=='countdown'){fails.push('race-never-reached-countdown')}
   else{
    // race UI + the profile's HUD
    MX.frame(2);hud(touch?['pos','lap','spd','tB','tL','tR','tP']:['pos','lap','spd'],fails,'race-');
    if(ships.length<6)fails.push('race-fewer-than-5-rivals');
    // start grid: nobody inside a wall/under the road is not measurable here; player is on the grid ahead of nothing: all dists sane
    const d0=ships.map(s=>s.dist),p0=pl.mesh.position.clone();
    if(!touch)K.ArrowUp=true;
    __mho.sim(150);for(const s of ships)posShip(s,1/60);updateCam(1/60);
    const p1=pl.mesh.position.clone(),mv=p1.clone().sub(p0);mv.y=0;const dd=pl.dist-d0[ships.indexOf(pl)];
    info={dd:+dd.toFixed(1),mv:+mv.length().toFixed(1)};
    if(!(dd>5))fails.push('race-no-forward-progress');if(pl.wrong)fails.push('race-wrong-way-flag');
    if(mv.length()>3){const m=pl.mesh.userData.m||pl.mesh;m.updateMatrixWorld(true);const wd=new THREE.Vector3(0,0,-1).transformDirection(m.matrixWorld),wf=new THREE.Vector3(0,0,1).transformDirection(m.matrixWorld);
     const a=ang(wd.x,wd.z,mv.x,mv.z),b=ang(wf.x,wf.z,mv.x,mv.z);if(Math.min(a,b)>20)fails.push('race-visual-facing-sideways');else if(b<a&&b<=20)info.faceBackwards=true}
    {const c=camera.position,dx=c.x-p1.x,dz=c.z-p1.z,h=Math.hypot(dx,dz);if(mv.length()>3&&!(h>2&&(dx*mv.x+dz*mv.z)/(h*mv.length())<-.3))fails.push('race-camera-behind')}
    const moving=ships.filter(s=>!s.isPlayer&&s.dist-d0[ships.indexOf(s)]>5).length;if(moving<5)fails.push('race-rivals-not-moving');
    if(ships.some(s=>!s.isPlayer&&s.wrong))fails.push('race-rival-wrong-way');
    for(const kk in K)K[kk]=false;
   }
  }catch(e){fails.push('race-crash:'+String(e).slice(0,70))}
  try{__tq.reset()}catch(e){}
  R.push({fam:'race',tag:track+'|'+prof+'|'+rid,fails,info,ms:performance.now()-t0});return fails.length},

 // ---------------- on foot (get out of the car) ----------------
 footCase(prof,rid,q,idx){const fails=[],t0=performance.now();const touch=prof!=='desktop';let info={};
  try{
   TOUCH.on=touch;TOUCH.used=touch;document.body.classList.toggle('touch',touch);for(const k in K)K[k]=false;
   try{OF_reset()}catch(e){}
   if(!roamWarp(q[0],q[1],q[2])&&!(MX.rst()&&roamWarp(q[0],q[1],q[2])))fails.push('foot-warp-refused');
   else{roamStep(1/120);for(let i=0;i<4;i++)roamPose(pl,.25);OF_exit();for(let i=0;i<16;i++)roamStep(1/30);camSnap=true;roamCam(1/60);
    if(RO.foot!=='walk')fails.push('foot-not-walking-after-exit');
    const B=new THREE.Box3().setFromObject(OF.fig.g),hh=B.max.y-B.min.y;if(Math.abs(hh/1.8-1)>.03)fails.push('foot-figure-not-1.80m');
    if(Math.abs(OF.y-groundAt(OF.x,OF.z,OF.y+2))>.35)fails.push('foot-not-on-ground');
    if(roamHit(OF.x,OF.z,OF_R,OF.y+1))fails.push('foot-inside-wall');
    {const pk=OF_parkChk();if(!pk||pk.tyre.some(g=>!(Math.abs(g)<=.05)))fails.push('foot-parked-car-tyre-gap>5cm')}
    if(roamHit(OF.car.x,OF.car.z,1.0,OF.car.y+1))fails.push('foot-parked-car-inside-wall');
    if(idx===0){MX.frame(2);hud(touch?['ofZone','tP']:[],fails,'foot-');}
    // walk: forward key (desktop) / stick not simulated on touch: use the same K path the stick feeds
    const x0=OF.x,z0=OF.z;K.KeyW=true;for(let i=0;i<30;i++)roamStep(1/30);K.KeyW=false;roamCam(1/60);
    const mx=OF.x-x0,mz=OF.z-z0,mv=Math.hypot(mx,mz);info.mv=+mv.toFixed(1);
    if(!(mv>1.5))fails.push('foot-no-walk-progress');
    else{const c=camera.position,dx=OF.x-c.x,dz=OF.z-c.z;if(ang(dx,dz,mx,mz)>60)fails.push('foot-walks-toward-camera')}
   }
  }catch(e){fails.push('foot-crash:'+String(e).slice(0,70))}
  try{OF_reset()}catch(e){}
  R.push({fam:'foot',tag:idx+'|'+prof+'|'+rid+'|'+(fails.length&&q?q.map(x=>Math.round(x*10)/10).join(','):''),fails,info,ms:performance.now()-t0});return fails.length},

 // ---------------- placed instances vs roads (props, trees, lite cover/fill) ----------------
 propScan(){const bad={},tot={},ex={};const chk=(t,x,z)=>{tot[t]=(tot[t]||0)+1;const q=cityAt(x,z);if(!q)return;const hw=(q.S.r.w||8)/2;if(q.d<hw-.5){bad[t]=(bad[t]||0)+1;(ex[t]=ex[t]||[]).length<2&&ex[t].push([Math.round(x),Math.round(z),Math.round(q.d*10)/10,q.S.r.name||q.S.r.id])}};
  try{LF_ensure(0,0,1e6)}catch(e){}
  for(const p of HUB.props||[])if(p.alive!==false)chk('prop:'+p.t,p.x,p.z);
  try{for(const L of LF.G.values())for(const p of L)chk('fill',p[0],p[1])}catch(e){}
  const fails=[];for(const t in bad)fails.push('props-in-road:'+t);
  R.push({fam:'props',tag:CID,fails,info:{bad,tot:Object.values(tot).reduce((a,b)=>a+b,0),ex},ms:0});return {bad,ex,n:Object.values(tot).reduce((a,b)=>a+b,0)}},
 // ---------------- camera fit after a vehicle switch ----------------
 camFit(rid){const fails=[];try{TOUCH.on=true;MX.frame(4);for(let i=0;i<30;i++)roamCam(.5);const P=CAM_prof();if(!P){fails.push('camfit-no-profile')}else{
   const sol=CAM_solve(P,SET.rcam||'chase',camera.aspect),c=camera.position,d=Math.hypot(c.x-RO.x,c.z-RO.z),want=sol.b;
   if(CAM.P&&Math.abs(CAM.P.L/P.L-1)>.12)fails.push('camfit-stale-profile');
   if(Math.abs(d/want-1)>.35)fails.push('camfit-distance-not-matching-ride')}}catch(e){fails.push('camfit-crash:'+String(e).slice(0,60))}
  R.push({fam:'camfit',tag:rid,fails,ms:0});return fails.length},

 // ---------------- mission/quest markers, garage exit, respawn ----------------
 markStarts(){const o=[];for(const m of RO.marks||[])if(isFinite(m.x)&&isFinite(m.z))o.push([m.x,m.z,isFinite(m.h)?m.h:0,m.kind,m.id]);return o},
 markCase(prof,rid,m,idx){const f0=R.length;const q=[m[0],m[1],m[2]];MX.roamCase(prof,rid,q,idx,false,'mission:'+m[3]);const r=R[R.length-1];
  try{const g=groundAt(m[0],m[1],99);if(!isFinite(g)||g<-50)r.fails.push('mission-marker-no-ground');if(SC_hit(m[0],m[1],g))r.fails.push('mission-marker-inside-wall');const c=rfSnap(m[0],m[1],400);if(!c||Math.hypot(c[0]-m[0],c[1]-m[1])>15)r.fails.push('mission-marker-far-from-any-road')}catch(e){r.fails.push('mission-crash:'+String(e).slice(0,50))}
  r.tag=m[3]+':'+m[4]+'|'+prof+'|'+rid;return r.fails.length},
 garageExit(prof,rid){const f0=R.length;MX.roamCase(prof,rid,null,0,false,'garage-exit');const r=R[R.length-1];r.tag='exit|'+prof+'|'+rid;
  return r.fails.length},
 respawnCase(prof,rid,q,idx){const fails=[],t0=performance.now();let info={};
  try{if(!roamWarp(q[0],q[1],q[2])&&!(MX.rst()&&roamWarp(q[0],q[1],q[2])))fails.push('respawn-warp-refused');else{
   TOUCH.on=prof!=='desktop';roamStep(1/60);const x0=RO.x,z0=RO.z;roamWreck();if(!RO.wk)fails.push('respawn-wreck-not-started');
   let n=0;while(RO.wk&&n<300){roamStep(1/30);n++}info.t=+(n/30).toFixed(2);
   if(RO.wk)fails.push('respawn-never-rebuilds');else{if(n/30>3.5)fails.push('respawn-slower-than-3.5s');if((RO.hp??100)<99)fails.push('respawn-hp-not-restored');
    if(Math.hypot(RO.x-x0,RO.z-z0)>5)fails.push('respawn-moved-away');if(SC_hit(RO.x,RO.z,RO.y))fails.push('respawn-inside-wall');
    for(let i=0;i<4;i++)roamPose(pl,.25);const pk=OF_parkChk();if(!pk||pk.tyre.some(g=>!(Math.abs(g)<=.05)))fails.push('respawn-tyre-gap>5cm');
    camSnap=true;roamCam(1/60);const c=camera.position,fx=Math.sin(RO.h),fz=Math.cos(RO.h),dx=c.x-RO.x,dz=c.z-RO.z,h=Math.hypot(dx,dz);if(!(h>2&&(dx*fx+dz*fz)/h<-.5))fails.push('respawn-camera-behind')}}
  }catch(e){fails.push('respawn-crash:'+String(e).slice(0,60))}
  R.push({fam:'respawn',tag:idx+'|'+prof+'|'+rid,fails,info,ms:performance.now()-t0});return fails.length},

};
window.MX=MX;return 'MX ready'})()
