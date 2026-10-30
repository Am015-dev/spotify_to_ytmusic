// boot-2 (2026-10-18): the loader's program warm-up (ldPrewarm → P2_compile) used renderer.compile, which walks only VISIBLE objects, and LIFE built its
// meshes on the first roam frame. So pooled/hidden meshes (LIFE batches, instanced pools, shown later) still linked their programs at 0.5-7 s of driving (85-250 ms frames).
// Inside the loader: build LIFE now (lazy models/lx.js, if it has arrived) and compile with every object in the scene made visible for that one call.
// perf-r13b (REVIEW_2K_13 N2): desktop q=high boot had 6-60 s long tasks (SwiftShader). P2_warm / P2_compile queued every program at once and, without
// KHR_parallel_shader_compile, the next sync call (PB_gpu's getParameter, the first getUniforms or draw) waited for ALL of them in one task.
// LKG compiles one program-distinct object at a time and links it (getUniforms) before the next, yielding every ~8 ms: in the loader (ldPrewarm), and in a
// gate after roamPost that builds the environment and links what the first roam frame draws before it draws. Desktop only (touch keeps its path); ?lkg=0|1.
const LKG={on:(()=>{const q=new URLSearchParams(location.search).get('lkg');return q?q==='1':!LOWMEM})(),q:null,i:0,ts:null,fin:null,arm:0,fr:0,n:0,steps:0,maxMs:0,lt:[]};
try{new PerformanceObserver(l=>{for(const e of l.getEntries())if(LKG.lt.length<400)LKG.lt.push([Math.round(e.startTime),Math.round(e.duration)])}).observe({type:'longtask',buffered:true})}catch(e){}
function LKG_begin(sc,cam,keep){const Q=[],K=keep&&LKG.K||(LKG.K=new Set()),add=o=>{const ms=[].concat(o.material||[]);if(!ms.length||o.isScene)return;const g=o.geometry,a=g&&g.attributes||{};
  // perf-r17x: three r164 InstancedMesh/BatchedMesh keep type 'Mesh', so the flags go in the key (else an instanced set sharing a car paint was deduped against the car: its instanced program linked late)
  const k=ms.map(m=>m.id+'v'+m.version).join('.')+'|'+o.type+(o.isInstancedMesh?'I':'')+(o.isBatchedMesh?'B':'')+(o.isSkinnedMesh?'s':'')+(o.instanceColor?'c':'')+(a.color?'v':'')+(a.uv1?'u':'')+(a.tangent?'t':'')+(o.castShadow?'S':'')+(o.receiveShadow?'R':'')/* reveal-r21p: receiveShadow is part of the lit program key (parked-car instanced packs: rs=true, same material/flags as a rs=false mesh -> deduped away, linked on the first drive frame) */+(g&&g.morphAttributes&&Object.keys(g.morphAttributes).length?'m':'');
  if(!K.has(k)){K.add(k);Q.push(o)}};sc.traverse(add);
 // compile(obj, cam, target) walks target's visible lights once per call: a light-only stand-in scene keeps that O(lights), not O(scene)
 const L=[];sc.traverseVisible(o=>{if(o.isLight&&o.layers.test(cam.layers))L.push(o)});const T=new THREE.Scene();T.fog=sc.fog;T.environment=sc.environment;T.environmentIntensity=sc.environmentIntensity;
 T.traverseVisible=f=>{for(const o of L)f(o)};LKG.q=Q;LKG.i=0;LKG.ts=T;LKG.L=L;LKG.sl=L.filter(l=>l.castShadow&&l.shadow);if(!keep)LKG.SK=new Set()}
// perf-r15d (REVIEW_2K_15 N3): the shadow-depth program of a caster only links in a real render, so each new caster kind is drawn once (4x4 target) in a stand-in
// scene holding the real lights (same light counts/env/fog = same lit key) with the shadow map on; the next real frame redraws the whole shadow map
function LKG_shadow(o,cam){const R=renderer,SM=R.shadowMap;if(!LKG.p2On||!o.castShadow||!(o.isMesh||o.isLine||o.isPoints)||!SM.enabled||!LKG.sl||!LKG.sl.length)return;
 const ms=[].concat(o.material),g=o.geometry,a=g&&g.attributes||{};
 const k=(o.isBatchedMesh?'B':'')+(o.isInstancedMesh?'I':'')+(o.instanceColor?'c':'')+(o.isSkinnedMesh?'s':'')+(g&&g.morphAttributes&&Object.keys(g.morphAttributes).length?'m':'')+(a.color?'v':'')+(a.uv1?'u':'')+(a.uv2?'w':'')+'|'
  +ms.map(m=>(m.customDepthMaterial?'d'+m.customDepthMaterial.id:(m.alphaTest>0&&(m.map||m.alphaMap))||(m.displacementMap&&m.displacementScale)||(m.clipShadows&&m.clippingPlanes&&m.clippingPlanes.length)?'m'+m.id:'')+'s'+(m.shadowSide??m.side)).join('.');
 if(LKG.SK.has(k))return;LKG.SK.add(k);const S=LKG.ss||(LKG.ss=new THREE.Scene()),sc=scene,fc=o.frustumCulled;S.matrixWorldAutoUpdate=false;S.fog=sc.fog;S.environment=sc.environment;S.environmentIntensity=sc.environmentIntensity;
 const tg=LKG.tiny||(LKG.tiny=new THREE.WebGLRenderTarget(4,4)),rt=R.getRenderTarget();S.children=LKG.L.concat(o);o.frustumCulled=false;for(const l of LKG.sl)l.shadow.needsUpdate=true;SM.needsUpdate=true;
 try{R.setRenderTarget(tg);R.render(S,cam)}finally{o.frustumCulled=fc;S.children=[];R.setRenderTarget(rt)}}
// perf-r15d: post-pass materials (bloom chain, SCRUB/FX/grade ShaderPasses) one per step on a full-screen triangle, compiled against an empty scene (a pass quad renders with no lights); OutputPass renders itself once (its defines follow the ACES set by GFX_pre)
function LKG_passQ(Q){const g=LKG.fsg||(LKG.fsg=(()=>{const b=new THREE.BufferGeometry();b.setAttribute('position',new THREE.Float32BufferAttribute([-1,3,0,-1,-1,0,3,-1,0],3));b.setAttribute('uv',new THREE.Float32BufferAttribute([0,2,0,0,2,0],2));return b})()),seen=new Set();
 for(const p of composer.passes){if(!p.enabled)continue;if(p.material&&p.material.name==='OutputShader'){Q.push(()=>{const R=renderer,fm=p.fsQuad&&p.fsQuad._mesh,lk=()=>{if(fm)R.compile(fm,camera,LKG.es||(LKG.es=new THREE.Scene()))};R.setRenderTarget(null);p.render(R,null,composer.readBuffer);lk();/* perf-r17x: p.render sets the defines; compile links them even where renderer.render is stubbed (draw=0 test page); raw shader = same program as a real draw */
   // perf-r17t: GFX_light flips ACES (day) / Neutral (night) after the gate; the other OutputShader variant is linked here too
   if(TUNE.lkLate!==0&&!/[?&]lkp2late=0/.test(location.search)){const tm=R.toneMapping,ex=R.toneMappingExposure;try{R.toneMapping=tm===THREE.ACESFilmicToneMapping?THREE.NeutralToneMapping:THREE.ACESFilmicToneMapping;p.render(R,null,composer.readBuffer);lk()}finally{R.toneMapping=tm;R.toneMappingExposure=ex}}});continue}
  const ms=[];for(const k in p)if(k!=='basic')for(const m of[].concat(p[k]))ms.push(m);if(p.fsQuad)ms.push(p.fsQuad.material);
  for(const m of ms)if(m&&m.isMaterial&&!seen.has(m)){seen.add(m);const me=new THREE.Mesh(g,m);me.frustumCulled=false;me.userData.lkp=1;Q.push(me)}}}
function LKG_step(cam,bud){const R=renderer,t0=performance.now(),rt=R.getRenderTarget(),f=R.getActiveCubeFace(),l=R.getActiveMipmapLevel();R.setRenderTarget(composer.readBuffer);LKG.steps++;
 try{while(LKG.i<LKG.q.length&&performance.now()-t0<bud){const o=LKG.q[LKG.i++],P=R.info.programs,n0=P.length,t1=performance.now();
   if(typeof o==="function"){try{o()}catch(e){void e}}else{const v=o.visible;o.visible=true;try{R.compile(o,cam,o.userData.lkp?LKG.es||(LKG.es=new THREE.Scene()):LKG.ts);LKG_shadow(o,cam)}catch(e){}finally{o.visible=v}}R.setRenderTarget(composer.readBuffer);
   for(let j=n0;j<P.length;j++){try{P[j].getUniforms()}catch(e){}LKG.n++}{const d1=performance.now()-t1;if(d1>(LKG.oMs|0)){LKG.oMs=d1;LKG.oLab=(typeof o==='function'?'OutputPass':[].concat(o.material)[0].type)+' #'+LKG.i+'/'+LKG.q.length}}}}
 finally{R.setRenderTarget(rt,f,l)}const d=performance.now()-t0;if(d>LKG.maxMs)LKG.maxMs=d;return LKG.i>=LKG.q.length}
async function LKG_drain(sc,cam){let k=0;while(LKG.q&&!LKG_step(cam,8)&&k++<3000)await nextFrame()}
// the loader's mid-way whole-scene warm (hubEnter → P2_warm) only queued links for the next sync point: ldPrewarm links them one by one instead
P2_warm=(f=>function(){if(LKG.on&&typeof state!=='undefined'&&state==='loading')return;return f.apply(this,arguments)})(P2_warm);
roamPost=(f=>function(){const r=f.apply(this,arguments);if(LKG.on){LKG.arm=1;LKG.fr=0;LKG.q=null;LKG.g0=0;LKG.wq=0;LKG.p2=0;LKG.p2g=0}return r})(roamPost);
{const r0=composer.render;composer.render=function(){if(LKG.arm)return;return r0.apply(this,arguments)}}
// perf-r14a: after the links, LKG.wf real game frames run with render still off (first-frame init: OG_build, LIFE's first step, traffic spawn), so they land before the first drivable frame (?lkwf=0 = off)
frame=(f=>function(now){if(!LKG.arm){if(LKG.fe>=0&&LKG.fe<30&&++LKG.fe===30)LKG.p30=renderer.info.programs.filter(p=>p.id>LKG.idEnd).length;return f(now)}if(LKG.wq>0){LKG.wq--;BMK('gate wf '+LKG.wq);const t=performance.now();try{return f(now)}finally{LKG.wfMs=Math.max(LKG.wfMs|0,performance.now()-t);LKG.wfN=(LKG.wfN|0)+1;if(LKG.wq<=0){if(LKG.p2On&&!LKG.p2)LKG.p2=1;else LKG_end()}}}requestAnimationFrame(frame);
 try{if(++LKG.fr>900){LKG.arm=0;LKG.to=1;LKG.tEnd=performance.now();LKG.idEnd=Math.max(0,...renderer.info.programs.map(p=>p.id));return}if(ENVD){BMK('gate env');buildEnv();return}if(!LKG.q&&LKG.p2===1){LKG_p2();return}if(!LKG.q){if(LKG.gfx&&typeof GFX_pre==='function'){if(!BHS_EN){if(!LKG.g0){LKG.g0=1;BMK('gate gfx_pre');GFX_pre();try{if(typeof W12_cars==='function')W12_cars();if(TUNE.bwOn&&typeof BW_flagAll==='function')BW_flagAll()}catch(e){}}}else if((LKG.g0|0)<3){/* perf-r14e (bhs only; perf-r14f): GFX_pre | W12_cars | BW_flagAll each in its own gate frame (was one 2-3.5 s task); same order */const g=LKG.g0=(LKG.g0|0)+1;if(g===1){BMK('gate gfx_pre');GFX_pre()}else try{if(g===2){BMK('gate w12');if(typeof W12_cars==='function')W12_cars()}else{BMK('gate bwflag');if(TUNE.bwOn&&typeof BW_flagAll==='function')BW_flagAll()}}catch(e){}return}if(GFX.castMore&&RO.shadowOn){GFX_cast();return}}BMK('gate begin');LKG_begin(scene,camera);BMK('gate begin end');return}if(LKG_step(camera,8)){LKG.q=null;LKG.idEnd=Math.max(0,...renderer.info.programs.map(p=>p.id));LKG.wq=LKG.p2?0:LKG.wf;if(!LKG.wq){if(LKG.p2On&&!LKG.p2)LKG.p2=1;else LKG_end()}}}catch(e){console.warn('LKG',e);LKG.arm=0;LKG.q=null}})(frame);
// pass 2 (after the warm frames): GFX_pre again (car shadow, plastic/ao on what the warm frames built), GFX_cast to the end, the world-icon mesh, then queue new/mutated kinds + post passes
function LKG_p2(){const g=LKG.p2g=(LKG.p2g|0)+1;if(g===1){BMK('gate p2 gfx');if(LKG.gfx&&typeof GFX_pre==='function')GFX_pre();return}if(typeof GFX!=='undefined'&&GFX.castMore&&RO.shadowOn&&g<60){GFX_cast();return}
 try{if(TUNE.wbIcon&&typeof WBI!=='undefined'&&!WBI.m&&typeof WB_icoInit==='function')WB_icoInit()}catch(e){}
 // perf-r17t: variants the roam step makes ~0.5 s after the gate (W12 paint hooks on the cars, ART8 shadow twins) exist now, so pass 2 links them (?lkp2late=0 = off)
 if(TUNE.lkLate!==0&&!/[?&]lkp2late=0/.test(location.search))try{if(typeof W12_cars==='function')W12_cars();if(typeof ART8_sweep==='function'){ART8_t=0;ART8_sweep()}}catch(e){}
 LKG.p2=2;BMK('gate p2');LKG_begin(scene,camera,1);LKG_passQ(LKG.q)}
function LKG_end(){LKG.arm=0;LKG.fe=0;LKG.p30=null;LKG.q=null;LKG.tEnd=performance.now();LKG.idEnd=Math.max(0,...renderer.info.programs.map(p=>p.id));if(LKG.p2){renderer.shadowMap.needsUpdate=true;for(const l of LKG.sl||[])l.shadow.needsUpdate=true}
 /* perf-r17x: ?lkdiag=1 records which object links each program after the gate (GO perf/pc-post-ready-link prints it) */if(/[?&]lkdiag=1/.test(location.search)&&!LKG.dh){LKG.dh=[];const R=renderer,f=R.renderBufferDirect;R.renderBufferDirect=function(c,s,g,m,o,gr){const n=R.info.programs.length;const r=f.apply(this,arguments);if(R.info.programs.length>n&&LKG.dh.length<8){let q=o,ch=[];while(q&&ch.length<5){ch.push((q.name||q.type)+(q.isInstancedMesh?'[I]':''));q=q.parent}LKG.dh.push(R.info.programs[R.info.programs.length-1].id+'@'+(R.getRenderTarget()?'rt'+R.getRenderTarget().samples+'/'+R.getRenderTarget().texture.colorSpace+'/'+(R.getRenderTarget()===composer.renderTarget1?'rt1':R.getRenderTarget()===composer.renderTarget2?'rt2':'other'):'screen')+'/tm'+R.toneMapping+'@'+ch.join('<')+'/m'+m.id+(m.name?':'+m.name:'')+(s&&s.isScene&&s!==scene?'/otherScene':''))}return r}}}
LKG.p2On=!/[?&]lkp2=0/.test(location.search);   // perf-r15d: gate pass 2 (objects made/mutated by the warm frames, shadow-depth kinds, post passes); default ON (desktop only, like LKG), ?lkp2=0 = off
LKG.gfx=!/[?&]lkgfx=0/.test(location.search);LKG.wf=(q=>q==null?8:+q|0)(new URLSearchParams(location.search).get('lkwf'));LKG.wq=0;   // perf-r13f/r13g (default ON on desktop, ?lkgfx=0 = off; LKG itself is desktop only): GFX_pre before the loader warm and again (with the sliced GFX_cast, W12, BW flags) before the roam-gate queue
const WARMALL={on:!/[?&]warmall=0/.test(location.search),n:0,life:false};
{const _lp=ldPrewarm,_pc=P2_compile;let on=false;
 ldPrewarm=async function(...a){on=WARMALL.on;try{const r=await _lp.apply(this,a);if(LKG.q)await LKG_drain(scene,camera);return r}finally{on=false;LKG.q=null;const f=LKG.fin;LKG.fin=null;if(f)try{f()}catch(e){}}};
 P2_compile=function(sc,cam){if(!on)return _pc.call(this,sc,cam);on=false;
  try{const L=window.__life;if(L&&L.init&&L.LIFE&&L.LIFE.on)WARMALL.life=!!L.init()}catch(e){console.warn('warmall life',e)}
  // the outer land's ground material is only made by worldGroundGen after the first roam frame (98bt_boot2 slices): link a twin of it now (same params → same program)
  let gm=null;try{if(typeof worldGroundGen==='function'){gm=WARM_gtwin();sc.add(gm)}}catch(e){console.warn('warmall ground',e)}
  // boot-4: the transform burst (pooled material, 30_race xfWarm) linked its program on the first swap
  let bm=null;try{if(typeof xfWarm==='function'){bm=xfWarm();sc.add(bm)}}catch(e){console.warn('warmall burst',e)}
  // smash-look-r22e22: the pooled smash studs (60_city_build6 studWarm) are hidden meshes in HUB.grp, so the traverse below links their program now, not on the first smash
  try{if(typeof studWarm==='function'&&typeof HUB!=='undefined')studWarm()}catch(e){console.warn('warmall studs',e)}
  // perf-r11c: LF_warm links the fill materials right after the hub props, but Athens still linked the instanced fill program (instance colour + vertex colours + env map)
  // at f59 of driving (~65-85 ms): the lights / environment were not final then. Link a twin here, in the loader's last compile.
  let lf=null;try{if(typeof LF!=='undefined'&&LF.on&&typeof LF_mats==='function'){const M=LF_mats(),g=new THREE.BoxGeometry(.1,.1,.1);g.setAttribute('color',new THREE.Float32BufferAttribute(new Array(g.attributes.position.count*3).fill(1),3));lf=new THREE.Group();
   for(const k of['def','tuft','pond']){const m=new THREE.InstancedMesh(g,M[k],1);m.setMatrixAt(0,new THREE.Matrix4());m.setColorAt(0,new THREE.Color());m.frustumCulled=false;m.receiveShadow=true;lf.add(m)}
   if(typeof LF_patchMat==='function'){const pm=new THREE.Mesh(g,LF_patchMat());pm.frustumCulled=false;pm.receiveShadow=true;lf.add(pm)}sc.add(lf)}}catch(e){console.warn('warmall lf',e)}
  // perf-r12b (N5): the hub glass (HUB.BM.glass, BW key bw3) first drew on a ground-like mesh at f239 of driving (85-367 ms link): the warm had only the bw1 twin.
  // Flag now (WB_cityPre would on the first roam frame) and twin every hub building / kit / ground-spec material on a plain mesh as is, and with the ground spec GFX_plastic may add later.
  let bt=null;try{if(typeof HUB!=='undefined'&&HUB.BM&&typeof BW_flag==='function'){if(typeof TUNE!=='undefined'&&TUNE.bwOn&&typeof BW_flagAll==='function')BW_flagAll();
   const g=new THREE.BufferGeometry();for(const[k,n]of[['position',3],['normal',3],['uv',2],['color',3]])g.setAttribute(k,new THREE.Float32BufferAttribute(new Array(n*3).fill(0),n));bt=new THREE.Group();
   const L=new Map();for(const k in HUB.BM)L.set(HUB.BM[k],1);if(typeof KMM!=='undefined')for(const k of['com','sub'])if(KMM[k])L.set(KMM[k],1);
   if(typeof GFX!=='undefined'&&GFX.gm)for(const m of GFX.gm)if(!L.has(m))L.set(m,0);   // Athens f29/f839: ground-spec LDS materials first drawn on a plain (not instanced) mesh
   for(const[m,two]of L){if(!m||!m.isMeshStandardMaterial||m.transparent)continue;for(const sp of[0,1]){if(sp&&(!two||m.userData.gfxSpec||typeof GFX_gspec!=='function'))continue;
     const t=m.clone();t.onBeforeCompile=m.onBeforeCompile;t.customProgramCacheKey=m.customProgramCacheKey;t.userData={};if(sp)GFX_gspec(t);   // not disposed: that would release the warmed program
     const o=new THREE.Mesh(g,t);o.frustumCulled=false;o.receiveShadow=true;bt.add(o)}}sc.add(bt)}}catch(e){console.warn('warmall bw',e)}
  const hid=[];sc.traverse(o=>{if(!o.visible){o.visible=true;hid.push(o)}});WARMALL.n=hid.length;
  const disp=()=>{if(gm)gm.geometry.dispose();if(lf){lf.children[0].geometry.dispose();for(const o of lf.children)if(o.isInstancedMesh)o.dispose()}if(bt&&bt.children[0])bt.children[0].geometry.dispose();if(bm){XFB_MP.push(bm.material);bm.dispose()}};
  // perf-r13b: desktop queues the objects here and ldPrewarm (below) links them one at a time; the twins are compiled out of the scene and disposed after
  // perf-r13f: this path skipped the inner P2_compile, so GFX_pre (98gx: plastic, ground spec, ACES, sun shadow) never ran before the warm on desktop and ~45 GFX variants
  // linked after the gate. Apply it here, with the twins in the scene (as the inner path did). ?lkgfx=1 = on.
  if(LKG.on){try{if(LKG.gfx&&typeof GFX_pre==='function')GFX_pre();LKG_begin(sc,cam)}finally{for(const o of hid)o.visible=false;for(const o of[gm,lf,bt,bm])if(o)sc.remove(o)}LKG.fin=disp;return}
  try{return _pc.call(this,sc,cam)}finally{for(const o of hid)o.visible=false;for(const o of[gm,lf,bt,bm])if(o)sc.remove(o);disp()}}}
// perf-r15b (REVIEW_2K_15 N1): touch (no LKG gate) had 106-154 ms frames in the first 2 s after the curtain (Athens f7 first lazy build 89 ms, f9 first minimap paint 63 ms,
// traffic/cull first steps). roamLoad now runs TWG.n real game frames under the curtain (render off, car held in place), then lazyStep gets no slot for the first TWG.lz
// drivable frames (the nearby districts were built under the curtain). ?twg=0|1, ?twgn=<frames>
const TWG={on:(q=>q?q==='1':matchMedia('(pointer:coarse)').matches)(new URLSearchParams(location.search).get('twg')),n:(q=>q==null?12:+q|0)(new URLSearchParams(location.search).get('twgn')),lz:60,run:0,fr:-1,ms:0,nf:0,held:0,mm:0,mq:0,mms:0,mb:700,idle:(q=>q==null?0:+q|0)(new URLSearchParams(location.search).get('twgi'))};   // idle default 0: 8×50 ms only moved the GC (f48 → f41-44), see docs/HANDOFF_perf.md perf-r15e   // perf-r15f: default ON on touch (pointer:coarse), ?twg=0|1 wins: JS max f0-f119 ≤ 80 ms in 2 runs/city once the far-street merge moved under the curtain
// perf-r15e: with the gate on, the minimap uses the callCap path (1 tile per frame, same pixels; ?cc=0 still turns it off), and the tiles around the car paint under the
// curtain (nearest first, ≤ TWG.mb ms in all), so the first drivable frames only paint the far ring; then optional TWG.idle × 50 ms with frames paused (?twgi=<n>, default 0).
if(TWG.on&&!/[?&]cc=0/.test(location.search))TUNE.callCap=1;
function TWG_mini(cap){if(typeof SM_ON==='undefined'||!SM_ON||!MINI||!MINI.smm)return;const t0=performance.now();while(SMM.q.length&&performance.now()-t0<cap&&TWG.mms+performance.now()-t0<TWG.mb){const[a,b]=SMM.q.shift();SMM_tile(a,b);TWG.mm++}TWG.mq=SMM.q.length}
// perf-r15f: the far-street merge (WB_cityBuild, ~50 MB garbage, normally a setTimeout 1.5 s after roamPost) ran into the first drivable second and its major GC hit f41-51 (Athens).
// With ?twg=1 it starts with the TWG frames and is awaited under the curtain (14 ms slices, frames paused), so its GC lands before drivable. ?twgwb=0 = old timing.
TWG.wb=new URLSearchParams(location.search).get('twgwb')!=='0';TWG.wbMs=0;
/* boot-r30e: the far-street merge (WB_cityBuild, only far meshes change) was awaited under the curtain: 6.5 s of a 79 s 6x lab boot (0.8-1.5 s at 1x). It now runs after control through the roamPost hook in 98wb
   (in-game 6 ms slices, 1.5 s after roamPost); the near city is the same. ?twgwbl=0 = old (merge under the curtain) */
TWG.wbl=new URLSearchParams(location.search).get('twgwbl')!=='0';
// r17q (review 17 N5, 4th review): the start road was empty (hubNear/LV_trNear spawn traffic BEHIND the player, so nothing is ever ahead at drivable). R17_seed runs once under the curtain (after TWG_run, before frame 1):
// it moves the 3 farthest idle cars onto the player's road 55/85/112 m ahead (two same-way, one oncoming). R17_open samples the start view's top-right region (where the pause button and minimap sit) with a depth march and reports how much is open. ?r17=0 turns it off.
const R17={pose:new URLSearchParams(location.search).get('r17pose')==='1'/* default OFF: at load the streamed tower is not drawn yet (99 % open then, 75 % at drivable), so the pose search cannot see it; needs a post-stream pass */,on:new URLSearchParams(location.search).get('r17')!=='0',n5:new URLSearchParams(location.search).get('r17n5')!=='0'/* r18j: 5 seeded cars 50-120 m (was 3: 55/85/112) so >= 3 stay in the portrait view; ?r17n5=0 = 3 cars */,ms:0,st:null,home:null,turn:new URLSearchParams(location.search).get('r17turn')!=='0',ao:+(new URLSearchParams(location.search).get('r17ao')||-40)/* r18j: Athens start sits 40 m back on the same road, same heading (low yellow facade out of the top-left, open 83 % -> 96 %); ?r17ao=0 = old pose */,off:+(new URLSearchParams(location.search).get('r17off')||-40)/* r17v: Frankfurt start faces the other way on the same road (turn) and sits 40 m back along that new heading (off), so the yellow tower is out of the top-left behind the pause button and minimap (open 76 % -> 95 %); ?r17turn=0&r17off=0 = old pose */};
function R17_vis(){const f=new THREE.Frustum(),C=HUB.cars,fx=Math.sin(RO.h),fz=Math.cos(RO.h),v=new THREE.Vector3();camera.updateMatrixWorld();f.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,new THREE.Matrix4().copy(camera.matrixWorld).invert()));let n=0;if(C)for(const c of C){if(c.dead>0)continue;const d=(c.x-RO.x)*fx+(c.z-RO.z)*fz;if(d>=40&&d<=120&&f.containsPoint(v.set(c.x,RO.y+1,c.z)))n++}return n}
R17.fn={vis:()=>R17_vis(),seed:()=>R17_seed(),ahead:()=>R17_ahead(RO.x,RO.z,RO.h),open:()=>R17_open()};window.R17=R17;
function R17_ahead(x,z,h){const C=HUB.cars;if(!C)return 0;const fx=Math.sin(h),fz=Math.cos(h);let n=0;for(let i=0;i<C.length;i++){const c=C[i];if(c.dead>0||c.route||c.pk||c.tr)continue;const dx=c.x-x,dz=c.z-z,f=dx*fx+dz*fz;if(f>=40&&f<=120&&Math.abs(dx*fz-dz*fx)<10)n++}return n}
function R17_open(){R17.nOpen=(R17.nOpen|0)+1;const T=typeof TQ!=='undefined'&&TQ,d0=T?T.draw:0,l0=LD.on,b0=LD.busy,k0=LKG.arm;try{LKG.arm=0;if(T)T.draw=1;LD.on=false;LD.busy=false;composer.render();const gl=renderer.getContext(),W=gl.drawingBufferWidth,H=gl.drawingBufferHeight,px=new Uint8Array(4);let n=0,o=0,m=0;
  for(let i=0;i<12;i++)for(let j=0;j<8;j++){gl.readPixels(Math.floor(W*(.02+.34*i/11)),Math.floor(H*(.52+.43*j/7)),1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);n++;m+=px[0]+px[1]+px[2];if(!(px[0]>150&&px[0]>px[2]+60))o++}   /* a warm, saturated block (yellow/orange/red/tan facade) = building; sky, road, grass, glass are open */
  R17.mean=Math.round(m/n/3);return{open:o/n,near:null}}catch(e){return{open:1,near:null,err:String(e)}}finally{LD.on=l0;LD.busy=b0;LKG.arm=k0;if(T)T.draw=d0}}
function R17_min(){const sn=camSnap;camSnap=true;roamCam(1/60);camSnap=sn;return R17_open().open}
/* the pause button and minimap sit top-LEFT: if a building fills that part of the start view (Frankfurt), try the spawn 30-100 m along / back the road, then the opposite heading, and keep the first pose that is open */
function R17_pose(){const x0=RO.x,z0=RO.z,h0=RO.h,y0=RO.y;let best=[R17_min(),x0,z0,h0];R17.pose0=Math.round(best[0]*100);if(best[0]>=.9)return;
 for(const H of[h0,h0+Math.PI])for(const d of[30,-30,60,-60,100,-100]){const x=x0+Math.sin(h0)*d,z=z0+Math.cos(h0)*d;if(roamHit(x,z,3,y0)){continue}RO.x=x;RO.z=z;RO.h=RO.vh=H;RO.y=groundAt(x,z,y0);const m=R17_min();if(m>best[0]){best=[m,x,z,H];if(m>=.9)break}}
 RO.x=best[1];RO.z=best[2];RO.h=RO.vh=best[3];RO.y=groundAt(RO.x,RO.z,y0);RO.spawn0=[RO.x,RO.z,RO.h];R17_min();R17.pose1=Math.round(best[0]*100)}
/* athperf-r21n: R17_off's two R17_min() calls were stats only (pose0/pose1 for the rev5 report line), but each R17_open is a full composer.render (all programs linked in one task, LKG bypassed) plus 96 GPU-sync readPixels:
   28 s of a 98 s lab Athens boot. Desktop (LKG.on: the one-at-a-time linker links those programs) now only snaps the camera; touch keeps the renders (there they are the de-facto program prewarm: without them
   phone2/touch-drift frames crawl on late links). ?r17m=1 = old everywhere */
R17.m=new URLSearchParams(location.search).get('r17m')==='1';
function R17_snap(){const sn=camSnap;camSnap=true;roamCam(1/60);camSnap=sn;if(typeof TQ!=='undefined'&&TQ&&!TQ.draw)R17_open()/* draw=0 test pages never render a frame; their GOs (phone2/touch-drift: 0.2 s game time in 6 s) relied on this one render (lazy GPU-side/JS state set on first render). A player page renders its first frame anyway */}
function R17_off(){const ath=CID==='ath'&&R17.ao;if(CID!=='fra'&&!ath)return;const tn=ath?0:R17.turn,d=ath?R17.ao:R17.off;if(!(d||tn)||RO.wk)return;const h=RO.h+(tn?Math.PI:0),x=RO.x+Math.sin(h)*d,z=RO.z+Math.cos(h)*d;if(roamHit(x,z,3,RO.y))return;const m=R17.m||!LKG.on&&!R17.w1;if(m)R17.pose0=Math.round(R17_min()*100);RO.x=x;RO.z=z;RO.h=RO.vh=h;RO.y=groundAt(x,z,RO.y);RO.spawn0=[x,z,h];if(m)R17.pose1=Math.round(R17_min()*100);else if(!LKG.on)R17_warm();else R17_snap()}
/* boot-r30e: touch drew the start view twice at full size (R17_min: composer.render + 96 GPU-sync readPixels) as the program prewarm; the first draw was from the pre-offset pose that render1 had just drawn,
   both were stats only (pose0/pose1, info on touch). Lab 1x: one 7.5 s task between the city build and control. Now one draw from the final pose, every target scissored to 1 px (PREW_sc: programs and
   pipelines are keyed by formats, not size), then 1 px read so the GPU is done before the curtain lifts. Same objects, same programs, no full-size raster. ?r17w=0 = old (two full renders) */
R17.w1=new URLSearchParams(location.search).get('r17w')!=='0';R17.wMs=-1;
function R17_warm(){const t0=performance.now(),sn=camSnap;camSnap=true;roamCam(1/60);camSnap=sn;R17.nOpen=(R17.nOpen|0)+1;const T=typeof TQ!=='undefined'&&TQ,d0=T?T.draw:0,l0=LD.on,b0=LD.busy,k0=LKG.arm;
 try{LKG.arm=0;if(T)T.draw=1;LD.on=false;LD.busy=false;PREW_sc(1);composer.render();const gl=renderer.getContext(),px=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px)}catch(e){console.warn('R17 warm',e)}
 finally{PREW_sc(0);LD.on=l0;LD.busy=b0;LKG.arm=k0;if(T)T.draw=d0;R17.wMs=Math.round(performance.now()-t0)}}
function R17_seed(){if(!R17.on||state!=='roam'||!RO.on||!HUB.cars||!HUB.nodes)return;try{R17_off()}catch(e){console.warn('R17 off',e)}if(R17.pose&&CID==='fra'&&!RO.wk)try{R17_pose()}catch(e){console.warn('R17 pose',e)}const t0=performance.now(),N=HUB.nodes,C=HUB.cars,fx=Math.sin(RO.h),fz=Math.cos(RO.h),W=R17.n5?[50,68,86,104,120]:[55,85,112],T=[];R17.home=[RO.x,RO.z,RO.h];
 const idle=C.filter(c=>!(c.dead>0)&&!c.route&&!c.pk&&!c.tr).sort((a,b)=>Math.hypot(b.x-RO.x,b.z-RO.z)-Math.hypot(a.x-RO.x,a.z-RO.z));
 const K=[];for(let a=0;a<N.length;a++){const A=N[a];if(Math.abs(A.x-RO.x)>160||Math.abs(A.z-RO.z)>160)continue;
  for(const b of A.nb){const B=N[b];if(!B)continue;const ex=B.x-A.x,ez=B.z-A.z,L=Math.hypot(ex,ez);if(L<10)continue;const al=(ex*fx+ez*fz)/L;if(Math.abs(al)<.8)continue;
   for(const t of R17.n5?[.1,.25,.4,.5,.6,.75,.9]:[.25,.5,.75]){const px=A.x+ex*t,pz=A.z+ez*t,dx=px-RO.x,dz=pz-RO.z,f=dx*fx+dz*fz,l=Math.abs(dx*fz-dz*fx);if(l<=7&&f>=35&&f<=125)K.push({a,b,t,x:px,z:pz,al,f,l})}}}
 for(let w=0;w<W.length&&w<idle.length;w++){let best=null,bs=1e9;for(const k of K){if(T.some(q=>Math.hypot(q.x-k.x,q.z-k.z)<(R17.n5?14:18)))continue;const s=Math.abs(k.f-W[w])+2*k.l;if(s<bs){bs=s;best=k}}
  if(!best)continue;const c=idle[w],rev=(w===2||w===4)?best.al>0:best.al<0;c.a=rev?best.b:best.a;c.b=rev?best.a:best.b;c.t=rev?1-best.t:best.t;c.x=best.x;c.z=best.z;c.hga=c.hgb=c.fsa=c.fsb=-1;c.dead=0;T.push(best)}
 R17.st={n:T.length,ahead:R17_ahead(RO.x,RO.z,RO.h)};R17.ms=Math.round(performance.now()-t0)}
TWG.ll=new URLSearchParams(location.search).get('twgll')!=='0';TWG.llMs=-1;TWG.llN=0;TWG.idEnd=0;
function TLL_warm(){const t0=performance.now(),R=renderer,root=typeof pl!=='undefined'&&pl&&pl.mesh;if(!root)return;const hid=[];root.traverse(o=>{if(o.visible===false)hid.push(o)});for(const o of hid)o.visible=true;
 const rt=R.getRenderTarget(),cf=R.getActiveCubeFace(),ml=R.getActiveMipmapLevel();try{if(typeof W12_cars==='function')W12_cars();R.setRenderTarget(composer.readBuffer);/* the runtime state: linear target (srgb-linear, no tone map) is part of the program key */const P=R.info.programs,n0=P.length;R.compile(root,camera,scene);for(let j=n0;j<P.length;j++){try{P[j].getUniforms()}catch(e){}TWG.llN++}}finally{R.setRenderTarget(rt,cf,ml);for(const o of hid)o.visible=false;TWG.idEnd=Math.max(0,...R.info.programs.map(p=>p.id));TWG.llMs=Math.round(performance.now()-t0)}}
/* ios-r20m: WebKit/Metal builds the pipeline state on the first DRAW, not at linkProgram/compile (real iPhone 17: 1.06-1.09 s freeze in `loading` right after the city appears; 60 programs at the freeze, 123 at roam).
   PREW_run draws one representative per program (distinct currentProgram.cacheKey) through the composer's real passes/targets/MSAA/fog/shadow state, every other renderable hidden for that one frame,
   then reads 1 px so the GPU has finished before the curtain lifts. Touch/lowmem path only (TWG gate, no LKG). Default OFF until the lab gates pass (software GL pays the whole pipeline build under the curtain: 3.7 s at 6x vs the 1.5 s budget); ?prewarm=1 = on. */
const PREW={q:new URLSearchParams(location.search).get('prewarm'),cap:(q=>q==null?1800:+q|0)(new URLSearchParams(location.search).get('prewcap')),on:false,ran:0,ab:-1,arm:'',n:-1,prog:-1,p0:-1,p1:-1,ms:-1};
/* ios-r21f: ?prewarm=1 on, ?prewarm=0 off. No flag: ON only on the Beta page (the session perf doc has a db) and, there, alternating per device (localStorage od_prew_arm, first run ON) so the perf db collects an A/B
   without anyone adding URL flags; the live site (no db) stays OFF. The draw aborts after PREW.cap ms of wall clock (?prewcap=N), checked between small batches of programs. */
async function PREW_decide(){const q=PREW.q;if(q==='1'){PREW.arm='forced-on';return true}if(q==='0'){PREW.arm='forced-off';return false}
 try{if(typeof PS==='undefined'||!PS.on||typeof PB_db!=='function')return false;const db=await Promise.race([PB_db(),new Promise(r=>setTimeout(()=>r(null),800))]);if(!db||!db.collection)return false}catch(e){return false}
 let on=true,k='od_prew_arm';try{on=localStorage.getItem(k)!=='off';localStorage.setItem(k,on?'off':'on')}catch(e){}PREW.arm=on?'on':'off';return on}
/* scissor every composer target (and the screen) to 1 px for the prewarm frame: pipelines are keyed by formats/samples, not size, so the fragment work (the lab's whole cost) disappears */
function PREW_sc(on){const R=renderer,rt=[composer.renderTarget1,composer.renderTarget2].filter(Boolean);PREW.sv=PREW.sv||[];
 if(on){PREW.sv=rt.map(t=>[t,t.scissorTest,t.scissor.clone()]);for(const t of rt){t.scissorTest=true;t.scissor.set(0,0,1,1)}PREW.ss=[R.getScissorTest(),new THREE.Vector4()];R.getScissor(PREW.ss[1]);R.setScissorTest(true);R.setScissor(0,0,1,1)}
 else{for(const[t,f,v]of PREW.sv){t.scissorTest=f;t.scissor.copy(v)}PREW.sv=[];if(PREW.ss){R.setScissor(PREW.ss[1]);R.setScissorTest(PREW.ss[0]);PREW.ss=null}}}
/* gk-tile-reveal-r22e9: twin of the outer-land ground tile (worldGroundGen: map + vertex colours + env-1 land patch). Shared by the loader compile and PREW_run (the loader twin is gone by then, so its program was released) */
function WARM_gtwin(){const tx=CID==='fra'?groundTex('grass'):athGrassTex(),m=new THREE.MeshStandardMaterial({map:tx,vertexColors:true,roughness:.92});
 if(typeof ENV_ground==='function')ENV_ground(m,{kind:'land',tint:true,base:WGC,s:[900,260,70]});m.polygonOffset=true;m.polygonOffsetFactor=1;m.polygonOffsetUnits=2;
 const g=new THREE.BufferGeometry();for(const[k,n]of[['position',3],['normal',3],['uv',2],['color',3]])g.setAttribute(k,new THREE.Float32BufferAttribute(new Array(n*3).fill(0),n));
 const gm=new THREE.Mesh(g,m);gm.receiveShadow=true;gm.frustumCulled=false;return gm}
function PREW_run(){const t0=performance.now(),R=renderer,P=R.info.programs;PREW.p0=P.length;PREW.ran=1;const seen=new Set(),all=[],keep=[];
 let GT=null;try{if(typeof worldGroundGen==='function'){GT=WARM_gtwin();scene.add(GT)}}catch(e){console.warn('PREW gtwin',e)}
 /* coin-prewarm-r22e6: ?cl=core,studs builds its stud InstancedMeshes (own gold/blue materials) after the first compile, so they have no program yet and were never drawn here (a link after reveal).
    Compile them now and draw them FIRST, so the cap can never abort before the coin. */
 const CLI=[];try{if(window.__cls&&__cls.keep){for(const s of __cls.keep)if(s.im&&!CLI.includes(s.im))CLI.push(s.im);for(const o of CLI){let q=o,hid=[];while(q&&q!==scene){if(q.visible===false){q.visible=true;hid.push(q)}q=q.parent}try{R.compile(o,camera,scene)}catch(e){}for(const x of hid)x.visible=false;const pr=R.properties.get(o.material).currentProgram;if(pr)try{pr.getUniforms()}catch(e){}}}}catch(e){console.warn('PREW cl',e)}
 scene.traverse(o=>{if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite))return;all.push(o);const m=Array.isArray(o.material)?o.material:[o.material];if(!o.layers.test(camera.layers))return;let add=false;for(const q of m){if(!q)continue;const pr=R.properties.get(q).currentProgram;if(!pr)continue;const k=pr.cacheKey||q.type+q.id;if(!seen.has(k)){seen.add(k);add=true}}if(add)keep.push(o)});
 const sv=[],T=typeof TQ!=='undefined'&&TQ,d0=T?T.draw:0,l0=LD.on,b0=LD.busy,k0=LKG.arm,r0=TWG.run;let drawn=0;
 for(const o of all)sv.push([o,o.visible,o.frustumCulled]);
 try{for(const o of all)o.visible=false;
  LKG.arm=0;if(T)T.draw=1;LD.on=false;LD.busy=false;TWG.run=0;PREW_sc(1);const gl=R.getContext(),px=new Uint8Array(4);
  /* batches of 4 representatives: each ends in a 1-px read, which blocks until the GPU has finished, so the wall clock between batches is real and the cap can bite */
  /* gk-tile-reveal-r22e9: the ground tiles (userData.gk, one MeshStandard per class) sort right after the coin; at 6x the cap aborts after ~4 programs and the tile linked ~2 s after reveal */
  if(GT)keep.push(GT)
  {const rk=o=>o===GT?3:CLI.includes(o)?2:o.userData&&o.userData.gk?1:0;keep.sort((x,y)=>rk(y)-rk(x))}for(let i=0;i<keep.length;i+=4){const b=keep.slice(i,i+4);for(const o of b){o.visible=true;o.frustumCulled=false}composer.render();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);for(const o of b)o.visible=false;drawn+=b.length;
   const dt=performance.now()-t0;if(dt>PREW.cap&&i+4<keep.length){PREW.ab=Math.round(dt);break}}}
 finally{if(GT){scene.remove(GT);GT.geometry.dispose()}PREW_sc(0);for(const[o,v,f]of sv){o.visible=v;o.frustumCulled=f}LD.on=l0;LD.busy=b0;LKG.arm=k0;if(T)T.draw=d0;TWG.run=r0;PREW.n=drawn;PREW.prog=seen.size;PREW.p1=P.length;PREW.ms=Math.round(performance.now()-t0)}}
/* ios-r20f: a player page evaluated the lazy code chunks (99c_checklist 212 KB, the city chunks; direct eval, 0.3-1.6 s on a slow CPU) 1.5 s AFTER the curtain lifted (10z_lazy.js),
   the iPhone freeze ~2 s after the city appears. They now load and eval here, under the curtain, before the gate frames. Touch/lowmem path only (desktop has LKG). ?twgxc=0 = old timing */
TWG.xc=new URLSearchParams(location.search).get('twgxc')!=='0';TWG.xcMs=-1;
/* core-reveal-r22e7: R17_off renders the spawn view twice under the curtain (R17_min), which links the spawn-area programs. When it moves nothing (?cl=core: the Paulsplatz spawn, its offset point is blocked) nothing
   was drawn from the final pose and 22 programs (player car, parked cars, LDraw streets 130-200 m around Paulsplatz) linked in the first frame after reveal (a 2.8 s frame at 6x). Then draw that view once here. ?twgfr=0 = old */
TWG.fr1=new URLSearchParams(location.search).get('twgfr')!=='0';TWG.fr1n=0;
async function TWG_run(){try{if(TWG.xc&&!LKG.on&&state==='roam'&&typeof XC_go==='function'){BMK('twg xc');const t=performance.now();try{await XC_go()}catch(e){console.warn('TWG xc',e)}TWG.xcMs=Math.round(performance.now()-t)}BMK('twg run0');return await TWG_run0()}finally{const o0=R17.nOpen|0;BMK('twg r17');try{R17_seed()}catch(e){console.warn('R17',e)}try{if(TWG.fr1&&!LKG.on&&TWG.on&&state==='roam'&&RO.on&&(R17.nOpen|0)===o0){BMK('twg fr1');if(R17.w1)R17_warm();else R17_min();TWG.fr1n++}}catch(e){console.warn('TWG fr1',e)}R17.bootOpen=R17.nOpen|0;BMK('twg end')}}
async function TWG_run0(){if(!TWG.on||LKG.on||!TWG.n||state!=='roam'||!RO.on)return;const t0=performance.now(),x=RO.x,z=RO.z,h=RO.h;TWG.run=1;const lo=LD.on;LD.on=false;   // frame() skips while LD.on; the #ld2 curtain itself stays up until roamLoad's ldHide
 const wb=TWG.wb&&!TWG.wbl&&typeof WB_cityBuild==='function'?WB_cityBuild(.99,.99).catch(e=>{WBC.err=String(e);if(e!=='WBabort')console.warn('TWG wb',e)}):null;
 try{for(let i=0;i<TWG.n;i++){RO.v=0;await nextFrame();TWG.nf++;const tm=performance.now();try{TWG_mini(40)}catch(e){console.warn('TWG mini',e)}TWG.mms+=performance.now()-tm}
  /* ios-r17k: the first parked-car compaction pass (PC_add + PC_grid + the per-mesh pack, 100-180 ms in Athens at f85) runs here under the curtain, not in the first drivable second */
  if(TWG.pcw&&typeof PC_step==='function'&&PC.on&&PC_gate()){const tp=performance.now();try{PC.rel=0;PC_step(1)}catch(e){console.warn('TWG pc',e)}TWG.pcMs=Math.round(performance.now()-tp)}
  /* ios-r17o: the shortcut scan's set-up (grid + nearest-first sort of every node) and its first candidate run here under the curtain; DEST_find then sleeps for the first 120 drivable frames */
  if(TWG.dd&&typeof DEST_find==='function'&&DEST.on){const td=performance.now();try{if(DEST.N!==HUB.nodes)DEST_reset();DEST_find(0)}catch(e){console.warn('TWG dest',e)}TWG.destMs=Math.round(performance.now()-td)}
  /* ios-r18u: touch late links. renderer.compile skips invisible objects, and the player car keeps alternate parts (translucent glass, opacity .7) in a hidden group until a state change shows it -> 1 program linked ~20-40 s into the roam (review 20: 180 ms frame). Show them, apply the w12 paint, compile+link under the curtain, restore. ?twgll=0 = off */
  BMK('twg ll');if(TWG.ll)try{TLL_warm()}catch(e){console.warn('TWG ll',e)}
  try{PREW.on=await PREW_decide()}catch(e){PREW.on=false}
  if(PREW.on)try{PREW_run()}catch(e){console.warn('TWG prew',e)}
  LD.on=lo;BMK('twg wbwait');if(wb){const tw=performance.now();await wb;TWG.wbMs=Math.round(performance.now()-tw)}for(let i=0;i<TWG.idle;i++)await new Promise(r=>setTimeout(r,50))}catch(e){console.warn('TWG',e)}finally{TWG.run=0;LD.on=lo;RO.x=x;RO.z=z;RO.h=h;RO.v=0;TWG.fr=0;TWG.mms=Math.round(TWG.mms);TWG.ms=Math.round(performance.now()-t0)}}
/* reveal-r21p: desktop reveal hold. Real data (Alex's PC, Beta perf db, Athens beta.135-138): the 4.4 / 2.4 / 1.3 / 1.2 s 'roam freezes' and a 2.3 s menu freeze are the first frames after the curtain lifts: the roam-start gate (LKG) and the
   first real renders still ran AFTER ldHide (36-49 program links, 571 ms GC in the lab). The hold keeps the curtain up (LD.on=false so frame() runs under it) until: the gate has finished, one representative per program was drawn through the real composer
   (PREW_run, cap DREV.prewCap), the lazy chunks are evaluated, the temporary build memory was released (DREV_gc) and the program count has not grown for DREV.stable frames (or DREV.cap ms). Phones keep the TWG path (LKG.on is false there). ?drev=0 = old. */
const DREV={on:new URLSearchParams(location.search).get('drev')!=='0',hardMs:+new URLSearchParams(location.search).get('drevcap')||12000,xcCap:+new URLSearchParams(location.search).get('drevxc')||8000,hang:new URLSearchParams(location.search).get('drevhang')==='1',abort:0,hard:0,xcTimeout:0,cap:6000,stable:10,prewCap:3000,ran:0,gateMs:-1,prewMs:-1,xcMs:-1,gcMs:-1,settleMs:-1,frames:0,capped:0,p0:-1,p1:-1,p2:-1,h0:-1,h1:-1,h2:-1,ms:-1};
const DREV_heap=()=>{try{return Math.round(performance.memory.usedJSHeapSize/1048576)}catch(e){return -1}};
/* V8 starts a mark-compact when external memory grows quickly: allocate and drop a few large buffers under the curtain so the build garbage (arrays, geometry CPU copies) is collected NOW and not in the first drive frames */
function DREV_gc(){const t=performance.now();try{for(let i=0;i<4;i++){const b=new ArrayBuffer(48<<20);b.byteLength}}catch(e){}DREV.gcMs=Math.round(performance.now()-t)}
/* second dedupe, separate from LKG.K: the gate's key treated the two parked-car packs (instanced, instance colour, receiveShadow) as already linked, yet compiling them linked 2 programs on the first drive frame.
   This pass keys on everything the lit program can depend on (material id+version, object kind, instance colour, vertex colour, shadow flags, attribute set) and compiles each new key once, linking before the next. Returns programs added. */
function DREV_pass(){const R=renderer,P=R.info.programs,n0=P.length,K=DREV.K||(DREV.K=new Set()),Q=[];
 scene.traverse(o=>{if(o.isScene||o.isLight)return;const ms=[].concat(o.material||[]);if(!ms.length)return;const g=o.geometry,a=g&&g.attributes?Object.keys(g.attributes).sort().join('.'):'';
  const k=ms.map(m=>m.id+'v'+m.version).join('.')+'|'+o.type+(o.isInstancedMesh?'I':'')+(o.isBatchedMesh?'B':'')+(o.isSkinnedMesh?'s':'')+(o.instanceColor?'c':'')+(o.castShadow?'S':'')+(o.receiveShadow?'R':'')+'|'+a+(g&&g.morphAttributes&&Object.keys(g.morphAttributes).length?'m':'');
  if(!K.has(k)){K.add(k);Q.push(o)}});
 if(!Q.length)return 0;if(!LKG.ts)LKG_begin(scene,camera,1);
 const rt=R.getRenderTarget(),f=R.getActiveCubeFace(),l=R.getActiveMipmapLevel();R.setRenderTarget(composer.readBuffer);
 try{for(const o of Q){const v=o.visible,m=P.length;o.visible=true;try{R.compile(o,camera,LKG.ts)}catch(e){}finally{o.visible=v}for(let j=m;j<P.length;j++){try{P[j].getUniforms()}catch(e){}}}}
 finally{R.setRenderTarget(rt,f,l)}return P.length-n0}
/* every visible object drawn once through the real composer states (1-px scissor, frustum culling off): links the program a draw really needs, whatever compile() guessed (the late parked-car pack linked in rt2 at the first drive frame
   although a compile of the same mesh into the read buffer had found nothing to do). Vertex work only, one frame. */
function DREV_full(){const R=renderer,P=R.info.programs,n0=P.length,T=typeof TQ!=='undefined'&&TQ,d0=T?T.draw:0,l0=LD.on,b0=LD.busy,k0=LKG.arm,sv=[];
 scene.traverse(o=>{if(o.frustumCulled)sv.push(o)});
 try{for(const o of sv)o.frustumCulled=false;LKG.arm=0;if(T)T.draw=1;LD.on=false;LD.busy=false;PREW_sc(1);const gl=R.getContext(),px=new Uint8Array(4);composer.render();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px)}
 finally{PREW_sc(0);for(const o of sv)o.frustumCulled=true;LD.on=l0;LD.busy=b0;LKG.arm=k0;if(T)T.draw=d0}return P.length-n0}
/* review 13: every await in the body is cut off by DREV_hold's wall-clock cap (DREV.hardMs, default 12 s; ?drevcap=ms): on the cap DREV.abort is set, nf() throws at the next frame and the curtain lifts as it is. The lazy-chunk wait has its own 8 s cap (?drevxc=ms; ?drevhang=1 = test hook, the chunk load never resolves). */
async function DREV_body(lo,t0){
 const R=renderer,P=R.info.programs,nf=async()=>{await nextFrame();if(DREV.abort)throw 'DREVabort'};DREV.p0=P.length;DREV.h0=DREV_heap();LD.on=false;
 try{
  for(let k=0;k<1500&&LKG.arm;k++){await nf()}
  DREV.gateMs=Math.round(performance.now()-t0);const t1=performance.now();
  /* what first runs ~0.5-1 s after the curtain on a player page: the parked-car pack (PC_step: new packed meshes = a new program), the shortcut scan set-up; then link what they made and run a few real frames */
  try{if(TWG.pcw&&typeof PC_step==='function'&&PC.on&&PC_gate()){PC.rel=0;PC_step(1)}}catch(e){console.warn('DREV pc',e)}
  try{if(TWG.dd&&typeof DEST_find==='function'&&DEST.on){if(DEST.N!==HUB.nodes)DEST_reset();DEST_find(0)}}catch(e){console.warn('DREV dest',e)}
  try{LKG_begin(scene,camera,1);while(!LKG_step(camera,8))await nf();LKG.q=null}catch(e){console.warn('DREV relink',e)}
  for(let i=0;i<3;i++)await nf();
  try{DREV_pass()}catch(e){console.warn('DREV pass',e)}
  if(typeof PREW_run==='function'){const c=PREW.cap;PREW.cap=DREV.prewCap;try{PREW_run()}catch(e){console.warn('DREV prew',e)}finally{PREW.cap=c}}
  DREV.prewMs=Math.round(performance.now()-t1);const t2=performance.now();
  try{if(typeof DREV_extras==='function')await DREV_extras()}catch(e){console.warn('DREV extras',e)}
  try{if(typeof XC_go==='function'){let tm;const cap=new Promise(r=>{tm=setTimeout(()=>{DREV.xcTimeout=1;console.warn('DREV xc: chunks not loaded in '+DREV.xcCap+' ms, revealing without them');r()},DREV.xcCap)});try{await Promise.race([DREV.hang?new Promise(()=>{}):XC_go(),cap])}finally{clearTimeout(tm)}}}catch(e){if(e==='DREVabort')throw e;console.warn('DREV xc',e)}
  DREV.xcMs=Math.round(performance.now()-t2);
  DREV.h1=DREV_heap();if(new URLSearchParams(location.search).get('drevgc')!=='0')DREV_gc();
  const t3=performance.now();let last=P.length,still=0;
  DREV.rl=[];
  while(still<DREV.stable){if(performance.now()-t3>DREV.cap){DREV.capped=1;break}await nf();DREV.frames++;
   /* meshes the first real frames create (parked-car packs, LIFE batches ...) are linked here, one by one, still under the curtain */
   if(DREV.frames%3===1){const n0=P.length;try{DREV_pass()}catch(e){console.warn('DREV relink',e)}if(P.length>n0&&DREV.rl.length<20)DREV.rl.push([DREV.frames,P.length-n0])}
   const n=P.length;if(n===last)still++;else{still=0;last=n}}
  {const n0=P.length;try{DREV_pass();DREV.full=DREV_full()}catch(e){console.warn('DREV fin',e)}DREV.fin=P.length-n0}
  DREV.settleMs=Math.round(performance.now()-t3);
 }catch(e){if(e!=='DREVabort')console.warn('DREV',e)}
 finally{if(!DREV.abort)LD.on=lo;DREV.p1=P.length;DREV.h2=DREV_heap()}}
async function DREV_hold(){
 if(!DREV.on||!LKG.on||LOWMEM||state!=='roam'||!RO.on)return;
 const t0=performance.now(),lo=LD.on;DREV.ran=1;DREV.abort=0;let tm;
 const cap=new Promise(r=>{tm=setTimeout(()=>{DREV.abort=1;DREV.hard=1;console.warn('DREV: hold hit the '+DREV.hardMs+' ms cap, revealing');r()},DREV.hardMs)});
 try{await Promise.race([DREV_body(lo,t0),cap])}catch(e){console.warn('DREV',e)}
 finally{clearTimeout(tm);if(DREV.abort)LD.on=lo;DREV.ms=Math.round(performance.now()-t0)}}
window.DREV=DREV;window.DREV_heap=DREV_heap;window.LKG=LKG;
TWG_run=(f=>async function(){const r=await f.apply(this,arguments);await DREV_hold();return r})(TWG_run);
{const q=new URLSearchParams(location.search);TWG.dd=q.get('twgdest')!=='0';TWG.pa=q.get('twgpa')!=='0';TWG.lvc=q.get('twglv')!=='0';TWG.destMs=-1;TWG.fw=120;/* ios-r17o: ?twgdest=0 / ?twgpa=0 / ?twglv=0 = off */}
DEST_find=(f=>function(b){if(TWG.dd&&b<1e6&&TWG.fr>=0&&TWG.fr<=TWG.fw)return;return f.apply(this,arguments)})(DEST_find);
TWG.jm=0;TWG.jf=-1;TWG.jn=0;TWG.rm=0;/* ios-r17k: JS ms (frame minus composer.render) of the first 120 drivable frames: max, its frame, frames measured */
{const r0=composer.render;composer.render=function(){if(TWG.run)return;if(!(TWG.fr>=1&&TWG.fr<=120))return r0.apply(this,arguments);const t=performance.now();try{return r0.apply(this,arguments)}finally{TWG.rm+=performance.now()-t}}}
frame=(f=>function(now){if(TWG.fr>=0&&TWG.fr<1e4)TWG.fr++;if(!(TWG.fr>=1&&TWG.fr<=120))return f(now);const t=performance.now();TWG.rm=0;try{return f(now)}finally{const d=performance.now()-t-TWG.rm;TWG.jn++;if(d>TWG.jm){TWG.jm=Math.round(d);TWG.jf=TWG.fr}}})(frame);
{const _ls=lazyStep;lazyStep=function(){if(TWG.fr>=0&&TWG.fr<=TWG.lz){TWG.held++;return}return _ls.apply(this,arguments)}}
// perf-r16b (review 2K-16 N2): hubTrafficStep time in the first 60 drivable frames (max ms, its frame, car count at f0 / f60), so GO perf/touch-first-frames reads the number tBoot reads (PF1HT).
TWG.pcw=new URLSearchParams(location.search).get('twgpc')!=='0';TWG.pcMs=-1;TWG.pcB=TWG.pcw?10:0;TWG.pcF=300;/* ios-r17k: ?twgpc=0 = old behaviour */
TWG.ht=0;TWG.htF=-1;TWG.htN=0;TWG.c0=-1;TWG.c60=-1;{const _ht=hubTrafficStep;hubTrafficStep=function(){if(!(TWG.fr>=0&&TWG.fr<=60))return _ht.apply(this,arguments);const t=performance.now();try{return _ht.apply(this,arguments)}finally{const d=performance.now()-t;TWG.htN++;if(d>TWG.ht){TWG.ht=Math.round(d);TWG.htF=TWG.fr}const n=HUB.cars?HUB.cars.length:0;if(TWG.c0<0)TWG.c0=n;TWG.c60=n}}}
// ios-r20f: reveal-window probe (?rvl=1). Counts every program link/compile, texture upload and buffer upload per frame, with its ms, in the first RVL.win ms after the
// curtain lifts (ldHide in roam), plus rAF frame gaps. RVL.thr() (TWG start, under the curtain) asks the host for CPU throttling (?rvlcpu=<rate>, default 6): window.__rvlThr
// (tools/perf1/tIosReveal.js) or the parent page's __cdp (GO perf/ios-reveal iframe), so the lab sees an iPhone-speed CPU for the curtain gate and the reveal window.
const RVL={on:/[?&]rvl=1/.test(location.search),win:3000,cpu:+(new URLSearchParams(location.search).get('rvlcpu')||6),st:0,t0:0,cur:null,fr:[],sum:null,done:0};
if(RVL.on){const K={linkProgram:'link',compileShader:'comp',getProgramParameter:'link',getShaderParameter:'comp',texImage2D:'tex',texSubImage2D:'tex',texImage3D:'tex',texSubImage3D:'tex',texStorage2D:'tex',compressedTexImage2D:'tex',generateMipmap:'tex',bufferData:'buf',bufferSubData:'buf'};
 for(const P of[window.WebGL2RenderingContext,window.WebGLRenderingContext])if(P)for(const m in K){const f=P.prototype[m];if(!f)continue;const k=K[m],cnt=m==='linkProgram'||m==='compileShader'||K[m]==='tex'&&m!=='generateMipmap'||K[m]==='buf';
  P.prototype[m]=function(){if(RVL.st!==1)return f.apply(this,arguments);const t=performance.now();try{return f.apply(this,arguments)}finally{const c=RVL.cur;c[k+'Ms']+=performance.now()-t;if(cnt)c[k]++}}}}
function RVL_new(t){return{t,link:0,linkMs:0,comp:0,compMs:0,tex:0,texMs:0,buf:0,bufMs:0,fMs:0,rMs:0,xc:''}}
function RVL_start(){RVL.st=1;RVL.t0=performance.now();RVL.p0=renderer.info.programs.length;RVL.p5=-1;setTimeout(()=>{RVL.p5=renderer.info.programs.length},5000);RVL.cur=RVL_new(0);let last=RVL.t0;const tick=now=>{const n=performance.now();RVL.cur.dt=n-last;last=n;RVL.fr.push(RVL.cur);
  if(n-RVL.t0<RVL.win){RVL.cur=RVL_new(Math.round(n-RVL.t0));requestAnimationFrame(tick)}else RVL_end()};requestAnimationFrame(tick)}
function RVL_end(){RVL.st=2;const F=RVL.fr,s=k=>F.reduce((a,f)=>a+f[k],0),r=v=>Math.round(v);RVL.sum={city:typeof CID!=='undefined'?CID:'?',frames:F.length,link:s('link'),linkMs:r(s('linkMs')),comp:s('comp'),tex:s('tex'),texMs:r(s('texMs')),buf:s('buf'),bufMs:r(s('bufMs')),
  long:F.filter(f=>f.dt>100).length,maxDt:r(Math.max(0,...F.map(f=>f.dt))),longAt:F.filter(f=>f.dt>100).slice(0,6).map(f=>f.t+':'+r(f.dt)+(f.link?'L'+f.link:'')+(f.tex?'T'+f.tex:'')),curtainMs:RVL.cms|0,prew:{n:PREW.n,prog:PREW.prog,p0:PREW.p0,p1:PREW.p1,ms:PREW.ms,ran:PREW.ran,ab:PREW.ab,arm:PREW.arm},xcMs:TWG.xcMs,lt:LKG.lt.filter(q=>q[0]>=RVL.t0-50&&q[0]<RVL.t0+RVL.win).map(q=>Math.round(q[0]-RVL.t0)+"+"+q[1]),bm:(window.__bmk||[]).filter(q=>q[0]>=RVL.t0&&q[0]<RVL.t0+RVL.win).map(q=>Math.round(q[0]-RVL.t0)+":"+q[1]).slice(0,12),jsMax:r(Math.max(0,...F.map(f=>f.fMs-f.rMs)))};
 RVL.done=1;console.log('RVL '+JSON.stringify(RVL.sum));RVL_thr(1)}
async function RVL_thr(rate){try{const f=window.__rvlThr||(window.parent!==window&&window.parent.__cdp?((m,a)=>window.parent.__cdp(m,a)):null);if(f&&RVL.cpu>1)await f('Emulation.setCPUThrottlingRate',{rate:rate||RVL.cpu})}catch(e){}}
if(RVL.on){ldHide=(f=>function(){const go=!RVL.st&&state==='roam'&&RO.on;const r=f.apply(this,arguments);if(go){RVL.cms=Math.round(performance.now()-(RVL.tc||0));RVL_start()}return r})(ldHide);
 frame=(f=>function(){if(RVL.st!==1)return f.apply(this,arguments);const t=performance.now();try{return f.apply(this,arguments)}finally{RVL.cur.fMs+=performance.now()-t}})(frame);
 {const r0=composer.render;composer.render=function(){if(RVL.st!==1)return r0.apply(this,arguments);const t=performance.now();try{return r0.apply(this,arguments)}finally{RVL.cur.rMs+=performance.now()-t}}}
 XC_eval=(f=>function(c){if(RVL.st!==1)return f(c);const t=performance.now();try{return f(c)}finally{RVL.cur.xc+=Math.round(performance.now()-t)+'ms '}})(XC_eval);
 TWG_run=(f=>async function(){if(!RVL.tc){RVL.tc=performance.now();await RVL_thr()}return f.apply(this,arguments)})(TWG_run);window.RVL=RVL}
