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
  const hid=[];sc.traverse(o=>{if(!o.visible){o.visible=true;hid.push(o)}});WARMALL.n=hid.length;
  try{return _pc.call(this,sc,cam)}finally{for(const o of hid)o.visible=false;if(gm){sc.remove(gm);gm.geometry.dispose()}if(bm){sc.remove(bm);XFB_MP.push(bm.material);bm.dispose()}}}}
