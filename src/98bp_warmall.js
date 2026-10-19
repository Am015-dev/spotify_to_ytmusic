// boot-2 (2026-10-18): the loader's program warm-up (ldPrewarm → P2_compile) used renderer.compile, which walks only VISIBLE objects, and LIFE built its
// meshes on the first roam frame. So pooled/hidden meshes (LIFE batches, instanced pools, shown later) still linked their programs at 0.5-7 s of driving (85-250 ms frames).
// Inside the loader: build LIFE now (lazy models/lx.js, if it has arrived) and compile with every object in the scene made visible for that one call.
// perf-r13b (REVIEW_2K_13 N2): desktop q=high boot had 6-60 s long tasks (SwiftShader). P2_warm / P2_compile queued every program at once and, without
// KHR_parallel_shader_compile, the next sync call (PB_gpu's getParameter, the first getUniforms or draw) waited for ALL of them in one task.
// LKG compiles one program-distinct object at a time and links it (getUniforms) before the next, yielding every ~8 ms: in the loader (ldPrewarm), and in a
// gate after roamPost that builds the environment and links what the first roam frame draws before it draws. Desktop only (touch keeps its path); ?lkg=0|1.
const LKG={on:(()=>{const q=new URLSearchParams(location.search).get('lkg');return q?q==='1':!LOWMEM})(),q:null,i:0,ts:null,fin:null,arm:0,fr:0,n:0,steps:0,maxMs:0,lt:[]};
try{new PerformanceObserver(l=>{for(const e of l.getEntries())if(LKG.lt.length<400)LKG.lt.push([Math.round(e.startTime),Math.round(e.duration)])}).observe({type:'longtask',buffered:true})}catch(e){}
function LKG_begin(sc,cam){const Q=[],K=new Set(),add=o=>{const ms=[].concat(o.material||[]);if(!ms.length||o.isScene)return;const g=o.geometry,a=g&&g.attributes||{};
  const k=ms.map(m=>m.id).join('.')+'|'+o.type+(o.instanceColor?'c':'')+(a.color?'v':'')+(a.uv1?'u':'')+(a.tangent?'t':'')+(g&&g.morphAttributes&&Object.keys(g.morphAttributes).length?'m':'');
  if(!K.has(k)){K.add(k);Q.push(o)}};sc.traverse(add);
 // compile(obj, cam, target) walks target's visible lights once per call: a light-only stand-in scene keeps that O(lights), not O(scene)
 const L=[];sc.traverseVisible(o=>{if(o.isLight&&o.layers.test(cam.layers))L.push(o)});const T=new THREE.Scene();T.fog=sc.fog;T.environment=sc.environment;T.environmentIntensity=sc.environmentIntensity;
 T.traverseVisible=f=>{for(const o of L)f(o)};LKG.q=Q;LKG.i=0;LKG.ts=T}
function LKG_step(cam,bud){const R=renderer,t0=performance.now(),rt=R.getRenderTarget(),f=R.getActiveCubeFace(),l=R.getActiveMipmapLevel();R.setRenderTarget(composer.readBuffer);LKG.steps++;
 try{while(LKG.i<LKG.q.length&&performance.now()-t0<bud){const o=LKG.q[LKG.i++],P=R.info.programs,n0=P.length,v=o.visible,t1=performance.now();o.visible=true;
   try{R.compile(o,cam,LKG.ts)}catch(e){}finally{o.visible=v}
   for(let j=n0;j<P.length;j++){try{P[j].getUniforms()}catch(e){}LKG.n++}{const d1=performance.now()-t1;if(d1>(LKG.oMs|0)){LKG.oMs=d1;LKG.oLab=[].concat(o.material)[0].type+' #'+LKG.i+'/'+LKG.q.length}}}}
 finally{R.setRenderTarget(rt,f,l)}const d=performance.now()-t0;if(d>LKG.maxMs)LKG.maxMs=d;return LKG.i>=LKG.q.length}
async function LKG_drain(sc,cam){let k=0;while(LKG.q&&!LKG_step(cam,8)&&k++<3000)await nextFrame()}
// the loader's mid-way whole-scene warm (hubEnter → P2_warm) only queued links for the next sync point: ldPrewarm links them one by one instead
P2_warm=(f=>function(){if(LKG.on&&typeof state!=='undefined'&&state==='loading')return;return f.apply(this,arguments)})(P2_warm);
roamPost=(f=>function(){const r=f.apply(this,arguments);if(LKG.on){LKG.arm=1;LKG.fr=0;LKG.q=null;LKG.g0=0;LKG.wq=0}return r})(roamPost);
{const r0=composer.render;composer.render=function(){if(LKG.arm)return;return r0.apply(this,arguments)}}
// perf-r14a: after the links, LKG.wf real game frames run with render still off (first-frame init: OG_build, LIFE's first step, traffic spawn), so they land before the first drivable frame (?lkwf=0 = off)
frame=(f=>function(now){if(!LKG.arm)return f(now);if(LKG.wq>0){LKG.wq--;BMK('gate wf '+LKG.wq);const t=performance.now();try{return f(now)}finally{LKG.wfMs=Math.max(LKG.wfMs|0,performance.now()-t);LKG.wfN=(LKG.wfN|0)+1;if(LKG.wq<=0){LKG.arm=0;LKG.tEnd=performance.now();LKG.idEnd=Math.max(0,...renderer.info.programs.map(p=>p.id))}}}requestAnimationFrame(frame);
 try{if(++LKG.fr>900){LKG.arm=0;LKG.to=1;LKG.tEnd=performance.now();LKG.idEnd=Math.max(0,...renderer.info.programs.map(p=>p.id));return}if(ENVD){BMK('gate env');buildEnv();return}if(!LKG.q){if(LKG.gfx&&typeof GFX_pre==='function'){if(!BHS_EN){if(!LKG.g0){LKG.g0=1;BMK('gate gfx_pre');GFX_pre();try{if(typeof W12_cars==='function')W12_cars();if(TUNE.bwOn&&typeof BW_flagAll==='function')BW_flagAll()}catch(e){}}}else if((LKG.g0|0)<3){/* perf-r14e (bhs only; perf-r14f): GFX_pre | W12_cars | BW_flagAll each in its own gate frame (was one 2-3.5 s task); same order */const g=LKG.g0=(LKG.g0|0)+1;if(g===1){BMK('gate gfx_pre');GFX_pre()}else try{if(g===2){BMK('gate w12');if(typeof W12_cars==='function')W12_cars()}else{BMK('gate bwflag');if(TUNE.bwOn&&typeof BW_flagAll==='function')BW_flagAll()}}catch(e){}return}if(GFX.castMore&&RO.shadowOn){GFX_cast();return}}BMK('gate begin');LKG_begin(scene,camera);BMK('gate begin end');return}if(LKG_step(camera,8)){LKG.q=null;LKG.idEnd=Math.max(0,...renderer.info.programs.map(p=>p.id));LKG.wq=LKG.wf;if(!LKG.wq){LKG.arm=0;LKG.tEnd=performance.now()}}}catch(e){console.warn('LKG',e);LKG.arm=0;LKG.q=null}})(frame);
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
const TWG={on:(q=>q?q==='1':false)(new URLSearchParams(location.search).get('twg')),n:(q=>q==null?12:+q|0)(new URLSearchParams(location.search).get('twgn')),lz:60,run:0,fr:-1,ms:0,nf:0,held:0};   // default OFF: target (no frame > 60 ms in f0-f120) not met yet, see docs/HANDOFF_perf.md
async function TWG_run(){if(!TWG.on||LKG.on||!TWG.n||state!=='roam'||!RO.on)return;const t0=performance.now(),x=RO.x,z=RO.z,h=RO.h;TWG.run=1;const lo=LD.on;LD.on=false;   // frame() skips while LD.on; the #ld2 curtain itself stays up until roamLoad's ldHide
 try{for(let i=0;i<TWG.n;i++){RO.v=0;await nextFrame();TWG.nf++}}catch(e){console.warn('TWG',e)}finally{TWG.run=0;LD.on=lo;RO.x=x;RO.z=z;RO.h=h;RO.v=0;TWG.fr=0;TWG.ms=Math.round(performance.now()-t0)}}
{const r0=composer.render;composer.render=function(){if(TWG.run)return;return r0.apply(this,arguments)}}
frame=(f=>function(now){if(TWG.fr>=0&&TWG.fr<1e4)TWG.fr++;return f(now)})(frame);
{const _ls=lazyStep;lazyStep=function(){if(TWG.fr>=0&&TWG.fr<=TWG.lz){TWG.held++;return}return _ls.apply(this,arguments)}}
