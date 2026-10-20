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
  const k=ms.map(m=>m.id+'v'+m.version).join('.')+'|'+o.type+(o.instanceColor?'c':'')+(a.color?'v':'')+(a.uv1?'u':'')+(a.tangent?'t':'')+(o.castShadow?'S':'')+(g&&g.morphAttributes&&Object.keys(g.morphAttributes).length?'m':'');
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
 for(const p of composer.passes){if(!p.enabled)continue;if(p.material&&p.material.name==='OutputShader'){Q.push(()=>{const R=renderer;R.setRenderTarget(null);p.render(R,null,composer.readBuffer)});continue}
  const ms=[];for(const k in p)if(k!=='basic')for(const m of[].concat(p[k]))ms.push(m);if(p.fsQuad)ms.push(p.fsQuad.material);
  for(const m of ms)if(m&&m.isMaterial&&!seen.has(m)){seen.add(m);const me=new THREE.Mesh(g,m);me.frustumCulled=false;me.userData.lkp=1;Q.push(me)}}}
function LKG_step(cam,bud){const R=renderer,t0=performance.now(),rt=R.getRenderTarget(),f=R.getActiveCubeFace(),l=R.getActiveMipmapLevel();R.setRenderTarget(composer.readBuffer);LKG.steps++;
 try{while(LKG.i<LKG.q.length&&performance.now()-t0<bud){const o=LKG.q[LKG.i++],P=R.info.programs,n0=P.length,t1=performance.now();
   if(typeof o==='function'){try{o()}catch(e){}}else{const v=o.visible;o.visible=true;try{R.compile(o,cam,o.userData.lkp?LKG.es||(LKG.es=new THREE.Scene()):LKG.ts);LKG_shadow(o,cam)}catch(e){}finally{o.visible=v}}R.setRenderTarget(composer.readBuffer);
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
 try{if(TUNE.wbIcon&&typeof WBI!=='undefined'&&!WBI.m&&typeof WB_icoInit==='function')WB_icoInit()}catch(e){}LKG.p2=2;BMK('gate p2');LKG_begin(scene,camera,1);LKG_passQ(LKG.q)}
function LKG_end(){LKG.arm=0;LKG.fe=0;LKG.p30=null;LKG.q=null;LKG.tEnd=performance.now();LKG.idEnd=Math.max(0,...renderer.info.programs.map(p=>p.id));if(LKG.p2){renderer.shadowMap.needsUpdate=true;for(const l of LKG.sl||[])l.shadow.needsUpdate=true}}
LKG.p2On=!/[?&]lkp2=0/.test(location.search);   // perf-r15d: gate pass 2 (objects made/mutated by the warm frames, shadow-depth kinds, post passes); default ON (desktop only, like LKG), ?lkp2=0 = off
LKG.gfx=!/[?&]lkgfx=0/.test(location.search);LKG.wf=(q=>q==null?8:+q|0)(new URLSearchParams(location.search).get('lkwf'));LKG.wq=0;   // perf-r13f/r13g (default ON on desktop, ?lkgfx=0 = off; LKG itself is desktop only): GFX_pre before the loader warm and again (with the sliced GFX_cast, W12, BW flags) before the roam-gate queue
const WARMALL={on:!/[?&]warmall=0/.test(location.search),n:0,life:false};
{const _lp=ldPrewarm,_pc=P2_compile;let on=false;
 ldPrewarm=async function(...a){on=WARMALL.on;try{const r=await _lp.apply(this,a);if(LKG.q)await LKG_drain(scene,camera);return r}finally{on=false;LKG.q=null;const f=LKG.fin;LKG.fin=null;if(f)try{f()}catch(e){}}};
 P2_compile=function(sc,cam){if(!on)return _pc.call(this,sc,cam);on=false;
  try{const L=window.__life;if(L&&L.init&&L.LIFE&&L.LIFE.on)WARMALL.life=!!L.init()}catch(e){console.warn('warmall life',e)}
  // the outer land's ground material is only made by worldGroundGen after the first roam frame (98bt_boot2 slices): link a twin of it now (same params → same program)
  let gm=null;try{if(typeof worldGroundGen==='function'){const tx=CID==='fra'?groundTex('grass'):athGrassTex(),m=new THREE.MeshStandardMaterial({map:tx,vertexColors:true,roughness:.92});
   if(typeof ENV_ground==='function')ENV_ground(m,{kind:'land',tint:true,base:WGC,s:[900,260,70]});m.polygonOffset=true;m.polygonOffsetFactor=1;m.polygonOffsetUnits=2;
   const g=new THREE.BufferGeometry();for(const[k,n]of[['position',3],['normal',3],['uv',2],['color',3]])g.setAttribute(k,new THREE.Float32BufferAttribute(new Array(n*3).fill(0),n));
   gm=new THREE.Mesh(g,m);gm.receiveShadow=true;gm.frustumCulled=false;sc.add(gm)}}catch(e){console.warn('warmall ground',e)}
  // boot-4: the transform burst (pooled material, 30_race xfWarm) linked its program on the first swap
  let bm=null;try{if(typeof xfWarm==='function'){bm=xfWarm();sc.add(bm)}}catch(e){console.warn('warmall burst',e)}
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
// r17q (review 17 N5, 4th review): the start road was empty (hubNear/LV_trNear spawn traffic BEHIND the player, so nothing is ever ahead at drivable). R17_seed runs once under the curtain (after TWG_run, before frame 1):
// it moves the 3 farthest idle cars onto the player's road 55/85/112 m ahead (two same-way, one oncoming). R17_open samples the start view's top-right region (where the pause button and minimap sit) with a depth march and reports how much is open. ?r17=0 turns it off.
const R17={pose:new URLSearchParams(location.search).get('r17pose')==='1'/* default OFF: at load the streamed tower is not drawn yet (99 % open then, 75 % at drivable), so the pose search cannot see it; needs a post-stream pass */,on:new URLSearchParams(location.search).get('r17')!=='0',ms:0,st:null,home:null};
R17.fn={seed:()=>R17_seed(),ahead:()=>R17_ahead(RO.x,RO.z,RO.h),open:()=>R17_open()};window.R17=R17;
function R17_ahead(x,z,h){const C=HUB.cars;if(!C)return 0;const fx=Math.sin(h),fz=Math.cos(h);let n=0;for(let i=0;i<C.length;i++){const c=C[i];if(c.dead>0||c.route||c.pk||c.tr)continue;const dx=c.x-x,dz=c.z-z,f=dx*fx+dz*fz;if(f>=40&&f<=120&&Math.abs(dx*fz-dz*fx)<10)n++}return n}
function R17_open(){const T=typeof TQ!=='undefined'&&TQ,d0=T?T.draw:0,l0=LD.on,b0=LD.busy,k0=LKG.arm;try{LKG.arm=0;if(T)T.draw=1;LD.on=false;LD.busy=false;composer.render();const gl=renderer.getContext(),W=gl.drawingBufferWidth,H=gl.drawingBufferHeight,px=new Uint8Array(4);let n=0,o=0,m=0;
  for(let i=0;i<12;i++)for(let j=0;j<8;j++){gl.readPixels(Math.floor(W*(.02+.34*i/11)),Math.floor(H*(.52+.43*j/7)),1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);n++;m+=px[0]+px[1]+px[2];if(!(px[0]>150&&px[0]>px[2]+60))o++}   /* a warm, saturated block (yellow/orange/red/tan facade) = building; sky, road, grass, glass are open */
  R17.mean=Math.round(m/n/3);return{open:o/n,near:null}}catch(e){return{open:1,near:null,err:String(e)}}finally{LD.on=l0;LD.busy=b0;LKG.arm=k0;if(T)T.draw=d0}}
function R17_min(){const sn=camSnap;camSnap=true;roamCam(1/60);camSnap=sn;return R17_open().open}
/* the pause button and minimap sit top-LEFT: if a building fills that part of the start view (Frankfurt), try the spawn 30-100 m along / back the road, then the opposite heading, and keep the first pose that is open */
function R17_pose(){const x0=RO.x,z0=RO.z,h0=RO.h,y0=RO.y;let best=[R17_min(),x0,z0,h0];R17.pose0=Math.round(best[0]*100);if(best[0]>=.9)return;
 for(const H of[h0,h0+Math.PI])for(const d of[30,-30,60,-60,100,-100]){const x=x0+Math.sin(h0)*d,z=z0+Math.cos(h0)*d;if(roamHit(x,z,3,y0)){continue}RO.x=x;RO.z=z;RO.h=RO.vh=H;RO.y=groundAt(x,z,y0);const m=R17_min();if(m>best[0]){best=[m,x,z,H];if(m>=.9)break}}
 RO.x=best[1];RO.z=best[2];RO.h=RO.vh=best[3];RO.y=groundAt(RO.x,RO.z,y0);RO.spawn0=[RO.x,RO.z,RO.h];R17_min();R17.pose1=Math.round(best[0]*100)}
function R17_seed(){if(!R17.on||state!=='roam'||!RO.on||!HUB.cars||!HUB.nodes)return;if(R17.pose&&CID==='fra'&&!RO.wk)try{R17_pose()}catch(e){console.warn('R17 pose',e)}const t0=performance.now(),N=HUB.nodes,C=HUB.cars,fx=Math.sin(RO.h),fz=Math.cos(RO.h),W=[55,85,112],T=[];R17.home=[RO.x,RO.z,RO.h];
 const idle=C.filter(c=>!(c.dead>0)&&!c.route&&!c.pk&&!c.tr).sort((a,b)=>Math.hypot(b.x-RO.x,b.z-RO.z)-Math.hypot(a.x-RO.x,a.z-RO.z));
 const K=[];for(let a=0;a<N.length;a++){const A=N[a];if(Math.abs(A.x-RO.x)>160||Math.abs(A.z-RO.z)>160)continue;
  for(const b of A.nb){const B=N[b];if(!B)continue;const ex=B.x-A.x,ez=B.z-A.z,L=Math.hypot(ex,ez);if(L<10)continue;const al=(ex*fx+ez*fz)/L;if(Math.abs(al)<.8)continue;
   for(const t of[.25,.5,.75]){const px=A.x+ex*t,pz=A.z+ez*t,dx=px-RO.x,dz=pz-RO.z,f=dx*fx+dz*fz,l=Math.abs(dx*fz-dz*fx);if(l<=7&&f>=35&&f<=125)K.push({a,b,t,x:px,z:pz,al,f,l})}}}
 for(let w=0;w<W.length&&w<idle.length;w++){let best=null,bs=1e9;for(const k of K){if(T.some(q=>Math.hypot(q.x-k.x,q.z-k.z)<18))continue;const s=Math.abs(k.f-W[w])+2*k.l;if(s<bs){bs=s;best=k}}
  if(!best)continue;const c=idle[w],rev=w===2?best.al>0:best.al<0;c.a=rev?best.b:best.a;c.b=rev?best.a:best.b;c.t=rev?1-best.t:best.t;c.x=best.x;c.z=best.z;c.hga=c.hgb=c.fsa=c.fsb=-1;c.dead=0;T.push(best)}
 R17.st={n:T.length,ahead:R17_ahead(RO.x,RO.z,RO.h)};R17.ms=Math.round(performance.now()-t0)}
async function TWG_run(){try{return await TWG_run0()}finally{try{R17_seed()}catch(e){console.warn('R17',e)}}}
async function TWG_run0(){if(!TWG.on||LKG.on||!TWG.n||state!=='roam'||!RO.on)return;const t0=performance.now(),x=RO.x,z=RO.z,h=RO.h;TWG.run=1;const lo=LD.on;LD.on=false;   // frame() skips while LD.on; the #ld2 curtain itself stays up until roamLoad's ldHide
 const wb=TWG.wb&&typeof WB_cityBuild==='function'?WB_cityBuild(.99,.99).catch(e=>{WBC.err=String(e);if(e!=='WBabort')console.warn('TWG wb',e)}):null;
 try{for(let i=0;i<TWG.n;i++){RO.v=0;await nextFrame();TWG.nf++;const tm=performance.now();try{TWG_mini(40)}catch(e){console.warn('TWG mini',e)}TWG.mms+=performance.now()-tm}
  /* ios-r17k: the first parked-car compaction pass (PC_add + PC_grid + the per-mesh pack, 100-180 ms in Athens at f85) runs here under the curtain, not in the first drivable second */
  if(TWG.pcw&&typeof PC_step==='function'&&PC.on&&PC_gate()){const tp=performance.now();try{PC.rel=0;PC_step(1)}catch(e){console.warn('TWG pc',e)}TWG.pcMs=Math.round(performance.now()-tp)}
  /* ios-r17o: the shortcut scan's set-up (grid + nearest-first sort of every node) and its first candidate run here under the curtain; DEST_find then sleeps for the first 120 drivable frames */
  if(TWG.dd&&typeof DEST_find==='function'&&DEST.on){const td=performance.now();try{if(DEST.N!==HUB.nodes)DEST_reset();DEST_find(0)}catch(e){console.warn('TWG dest',e)}TWG.destMs=Math.round(performance.now()-td)}
  LD.on=lo;if(wb){const tw=performance.now();await wb;TWG.wbMs=Math.round(performance.now()-tw)}for(let i=0;i<TWG.idle;i++)await new Promise(r=>setTimeout(r,50))}catch(e){console.warn('TWG',e)}finally{TWG.run=0;LD.on=lo;RO.x=x;RO.z=z;RO.h=h;RO.v=0;TWG.fr=0;TWG.mms=Math.round(TWG.mms);TWG.ms=Math.round(performance.now()-t0)}}
{const q=new URLSearchParams(location.search);TWG.dd=q.get('twgdest')!=='0';TWG.pa=q.get('twgpa')!=='0';TWG.lvc=q.get('twglv')!=='0';TWG.destMs=-1;TWG.fw=120;/* ios-r17o: ?twgdest=0 / ?twgpa=0 / ?twglv=0 = off */}
DEST_find=(f=>function(b){if(TWG.dd&&b<1e6&&TWG.fr>=0&&TWG.fr<=TWG.fw)return;return f.apply(this,arguments)})(DEST_find);
TWG.jm=0;TWG.jf=-1;TWG.jn=0;TWG.rm=0;/* ios-r17k: JS ms (frame minus composer.render) of the first 120 drivable frames: max, its frame, frames measured */
{const r0=composer.render;composer.render=function(){if(TWG.run)return;if(!(TWG.fr>=1&&TWG.fr<=120))return r0.apply(this,arguments);const t=performance.now();try{return r0.apply(this,arguments)}finally{TWG.rm+=performance.now()-t}}}
frame=(f=>function(now){if(TWG.fr>=0&&TWG.fr<1e4)TWG.fr++;if(!(TWG.fr>=1&&TWG.fr<=120))return f(now);const t=performance.now();TWG.rm=0;try{return f(now)}finally{const d=performance.now()-t-TWG.rm;TWG.jn++;if(d>TWG.jm){TWG.jm=Math.round(d);TWG.jf=TWG.fr}}})(frame);
{const _ls=lazyStep;lazyStep=function(){if(TWG.fr>=0&&TWG.fr<=TWG.lz){TWG.held++;return}return _ls.apply(this,arguments)}}
// perf-r16b (review 2K-16 N2): hubTrafficStep time in the first 60 drivable frames (max ms, its frame, car count at f0 / f60), so GO perf/touch-first-frames reads the number tBoot reads (PF1HT).
TWG.pcw=new URLSearchParams(location.search).get('twgpc')!=='0';TWG.pcMs=-1;TWG.pcB=TWG.pcw?10:0;TWG.pcF=300;/* ios-r17k: ?twgpc=0 = old behaviour */
TWG.ht=0;TWG.htF=-1;TWG.htN=0;TWG.c0=-1;TWG.c60=-1;{const _ht=hubTrafficStep;hubTrafficStep=function(){if(!(TWG.fr>=0&&TWG.fr<=60))return _ht.apply(this,arguments);const t=performance.now();try{return _ht.apply(this,arguments)}finally{const d=performance.now()-t;TWG.htN++;if(d>TWG.ht){TWG.ht=Math.round(d);TWG.htF=TWG.fr}const n=HUB.cars?HUB.cars.length:0;if(TWG.c0<0)TWG.c0=n;TWG.c60=n}}}
