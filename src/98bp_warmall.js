// boot-2 (2026-10-18): the loader's program warm-up (ldPrewarm → P2_compile) used renderer.compile, which walks only VISIBLE objects, and LIFE built its
// meshes on the first roam frame. So pooled/hidden meshes (LIFE batches, instanced pools, shown later) still linked their programs at 0.5-7 s of driving (85-250 ms frames).
// Inside the loader: build LIFE now (lazy models/lx.js, if it has arrived) and compile with every object in the scene made visible for that one call.
const WARMALL={on:!/[?&]warmall=0/.test(location.search),n:0,life:false};
{const _lp=ldPrewarm,_pc=P2_compile;let on=false;
 ldPrewarm=async function(...a){on=WARMALL.on;try{return await _lp.apply(this,a)}finally{on=false}};
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
  try{return _pc.call(this,sc,cam)}finally{for(const o of hid)o.visible=false;if(gm){sc.remove(gm);gm.geometry.dispose()}if(lf){sc.remove(lf);lf.children[0].geometry.dispose();for(const o of lf.children)if(o.isInstancedMesh)o.dispose()}if(bt){sc.remove(bt);if(bt.children[0])bt.children[0].geometry.dispose()}if(bm){sc.remove(bm);XFB_MP.push(bm.material);bm.dispose()}}}}
