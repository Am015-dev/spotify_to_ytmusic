// ===== SH1 (shots-1, 2026-10-14): fixes from Alex's beta.59 shots (docs/shots/alex/b59 on alex/overdrive-devkit). ?sh1=0 = all off (before/after shots).
// #5 green wall + empty world in a story cutscene: every cutscene sets RO.frozen, and the frame loop then skips roamStep, which is what runs
// hubTrafficStep → Taunus backdrop ridge fit (TRN_ridgeFit, a ring around the CAMERA), hubCullStep (culling around the camera) and lazyStep
// (outskirts + far-city streaming). M1's Kaiser scene frames Hilde's truck, which keeps driving at 6 m/s when you fall behind, so the scene camera
// can be 1-2 km from the car: the ridge ring (1800 m on low) stood next to the camera as a green banded wall over the sky, and the blocks there
// were still culled/unloaded (flat grey lots only). Now the world follows the camera while frozen.
const SH1={on:!/[?&]sh1=0\b/.test(location.search),st:{fol:0},lzMs:9};
function SH1_follow(){if(!SH1.on||state!=='roam'||!RO.on||!RO.frozen||!HUB.grp||!HUB.grp.visible)return;SH1.st.fol++;
 try{if(HUB.ridge)HUB.ridge.position.set(camera.position.x,0,camera.position.z);if(typeof TRN_ridgeFit==='function')TRN_ridgeFit()}catch(e){}
 try{hubCullStep()}catch(e){}
 // lazy outskirts + far-city streaming are centred on RO: centre them on the camera for the frozen frame (RO does not move while frozen)
 // and get a bigger build budget per frame (nothing drives during a scene): the blocks the scene shows are up in ~3 s, not ~10 s
 const x=RO.x,z=RO.z,ms=LZ.ms;try{RO.x=camera.position.x;RO.z=camera.position.z;LZ.ms=Math.max(ms,SH1.lzMs);lazyStep()}catch(e){}finally{RO.x=x;RO.z=z;LZ.ms=ms}}
roamCam=(f=>function(dt){const r=f.apply(this,arguments);SH1_follow();return r})(roamCam);
// checklist test sh1/cut-world: Vex Kaiser's scene with Hilde's truck 2 km from your car (the b59 case), measured 3 s in
function SH1_cutGo(say){const W=ms=>new Promise(r=>setTimeout(r,ms));
 (async()=>{let out='';const el=document.querySelector('#m1Cs'),ck=el&&el.click,M=window.__m1,sk=M&&M.skip;try{
  if(RO.ch)chAbort();await W(300);const ns=M1.noScene;M1.noScene=true;try{M1_startHotDrop()}finally{M1.noScene=ns}await W(400);
  if(!RO.ch)return say('❌ FAIL CUTSCENE WORLD · Hot Drop did not start');
  const P={x:75,z:-5},H={x:P.x+1450,z:P.z+1350};M1_warp(P.x,P.z,0);M1_put(M1_hilde(),H.x,H.z,0);
  if(el)el.click=()=>{};if(M)M.skip=()=>{};M1.csHold=1;qvEnter(RO.ch,1);const f0=SH1.st.fol,t0=performance.now();await W(3000);while(SH1.st.fol-f0<180&&performance.now()-t0<20000)await W(100);   // 3 s, and ≥ 180 frames (3 s at 60 fps; a headless page runs slower)
  const sec=(performance.now()-t0)/1000,fr=SH1.st.fol-f0;
  const c=camera.position,dCam=Math.hypot(c.x-RO.x,c.z-RO.z),R=HUB.ridge,dR=R?Math.hypot(R.position.x-c.x,R.position.z-c.z):0;
  let n=0,v=0;for(const e of HUB.cull||[]){if(!e.o||e.o.isInstancedMesh)continue;const d=Math.hypot(e.x-c.x,e.z-c.z);if(d<400){n++;let o=e.o,vis=true;while(o){if(o.visible===false){vis=false;break}o=o.parent}if(vis)v++}}
  let lz=0,lzOk=0;for(const L of(typeof LAZY!=='undefined'?LAZY:[]))if(lzD(L,c.x,c.z)<250){lz++;if(L.done)lzOk++}
  const pv=n?v/n:1,ok=!!M1.cs&&dCam>1000&&dR<=5&&pv>=.9&&lzOk===lz;
  out=(ok?'✅ PASS':'❌ FAIL')+` CUTSCENE WORLD · scene camera ${dCam|0} m from your car · Taunus ridge centred ${dR.toFixed(1)} m from the camera (≤ 5) · ${v}/${n} blocks within 400 m drawn (${Math.round(pv*100)} %, ≥ 90) · outskirts loaded ${lzOk}/${lz} · after ${sec.toFixed(1)} s / ${fr} frames${M1.cs?'':' · scene did not play'}`;
  SH1.last={dCam,dR,n,v,lz,lzOk,out};while(SH1.hold)await W(100)}catch(e){out='❌ FAIL CUTSCENE WORLD · '+String(e).slice(0,80)}
  finally{M1.csHold=0;if(el)el.click=ck;if(M)M.skip=sk;try{M1_csEnd()}catch(e){}try{if(RO.ch)chAbort()}catch(e){}}say(out)})();
 return'📍 CUTSCENE WORLD · Kaiser scene, Hilde 2 km away…'}
window.__sh1={SH1,GOS:{'cut-world':{fn:SH1_cutGo}}};
