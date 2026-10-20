// ===== MEMFREE (mem-1): drop the CPU copy of static world geometry once it has really been drawn (the GPU copy stays). Flag TUNE.memFree (0 = off).
// Heap after load was ~500 MB, ~290 MB of it BufferGeometry typed arrays that nothing reads again. A sweep (every 2.5 s, <=400 meshes) hooks
// mesh.onAfterRender; after the first draw (= uploaded) it computes the bounds, nulls position/normal/color/uv/index arrays (same trick as STR strFree / SM3).
// Skipped: instanced, car/footman groups, anything a raycast or CPU-side reader may touch (trG ground, gk, simp, lf, keep, P, bmk, cd, dr, gb, sim, ramp).
if(TUNE.memFree===undefined){const q=new URLSearchParams(location.search).get('mf');TUNE.memFree=q==='1'||LOWMEM&&q!=='0'?1:0}   // crash-1: on in the low-mem tier (iPhone)   // default OFF (breaks xf1/grass + terr4/5 hill tests, they read world mesh arrays); ?mf=1 on
const MEMF={seen:new WeakSet(),n:0,mb:0,skip:['trG','gk','simp','lf','keep','P','bmk','cd','dr','gb','sim','ramp','lz','sky','nr']};
// crash-3: ground / drive-surface meshes (trG, gk, dr) are raycast and height-read on the CPU, so they keep position + index; their normal/uv/color
// copies (~60 % of the bytes, nothing reads them after upload) are dropped in the low-mem tier (MEMF.part).
MEMF.part=['trG','gk','dr'];MEMF.attrs=['normal','uv','color'];
function MEMF_free(m,part){const g=m.geometry;if(!g||g.userData.mfDone)return;g.userData.mfDone=part?2:1;if(!g.boundingSphere)g.computeBoundingSphere();if(!g.boundingBox)g.computeBoundingBox();
  const A=part?MEMF.attrs.map(k=>g.attributes[k]).filter(Boolean):Object.values(g.attributes);if(g.index&&!part)A.push(g.index);let b=0;for(const a of A){if(!a.array||a.isInstancedBufferAttribute||a.isInterleavedBufferAttribute||a.usage!==THREE.StaticDrawUsage)continue;b+=a.array.byteLength;a.array=null;a.getX=a.getY=a.getZ=a.getW=BA_freed}
  MEMF.n++;MEMF.mb+=b/1048576}
function MEMF_sweep(){if(!TUNE.memFree)return;const hook=m=>{if(m.isInstancedMesh&&TUNE.gpuStr&&m.geometry&&!MEMF.seen.has(m)&&!m.userData.sky){MEMF.seen.add(m);MEMF_ipack(m);return}
  if(m.isMesh&&!m.isInstancedMesh&&!m.isSkinnedMesh&&m.geometry&&!MEMF.seen.has(m)){MEMF.seen.add(m);const u=m.userData;let part=0,cd=0;for(const s of MEMF.skip)if(u[s]){if(LOWMEM&&MEMF.part.includes(s)){part=1;MEMF_gadd(m);break}if(s==='cd'&&TUNE.gpuStr){cd=1;continue}return}
    if(!part&&TUNE.gpuStr){const g=m.geometry,w=MEMF.gu.get(g);if(w===undefined){MEMF.gu.set(g,m);m.updateMatrixWorld();MEMF_pack(m,cd?u.cd:0);return}if(w){MEMF.gu.set(g,null);const i=MEMF.S.findIndex(e=>e.m===w);if(i>=0){const e=MEMF.S.splice(i,1)[0];e.m.layers.enable(0)}}if(cd)return}   // crash-5: shared geometry -> memFree as before (crash-6: a shared cd geometry is left alone)
    const f=m.onAfterRender;m.onAfterRender=function(){MEMF_free(this,part);this.onAfterRender=f}}};
  const walk=o=>{if(o===RO.grp||o.userData.keep&&!o.isMesh||o.userData.gb)return;hook(o);for(const c of o.children)walk(c)};walk(scene)}
setInterval(MEMF_sweep,2500);
// crash-5: GPU streaming of static city meshes in the low-mem tier (TUNE.gpuStr, ?gs=0 off). memFree used to drop their CPU copy after the first
// draw, so every chunk ever seen stayed on the GPU (buffers 146 -> 224 MB in 5 min). Now their arrays are packed once (normal -> Int8, colour -> Uint8,
// index -> Uint16 when it fits; ~45 % of the float bytes) and kept; a mesh farther than Rout from the camera has its GPU buffers freed
// (geometry.dispose + hidden via layers) and is shown again inside Rin (hysteresis), at most MEMF.cap re-uploads per frame. Shared geometries are left to memFree.
if(TUNE.gpuStr===undefined)TUNE.gpuStr=LOWMEM&&new URLSearchParams(location.search).get('gs')!=='0'?1:0;
Object.assign(MEMF,{S:[],gu:new WeakMap(),cap:3,Rin:1450,Rout:1800,st:{pack:0,cpuMB:0,up:0,dn:0,cd:0,im:0,imMB:0}});
// crash-6: 'cd' meshes (LDraw props, 23 MB, skipped by memFree) are streamed too, with radii from their own cull distance (hidden beyond cd anyway);
// instanced meshes (50 MB) only get the packed arrays (MEMF_ipack): their instances follow the car or are drawn through the WB near proxies.
function MEMF_q(g){if(g.userData.mfDone)return 0;g.dispose();const A=g.attributes;
  const q=(k,T,s)=>{const a=A[k];if(!a||!a.array||a.normalized||a.isInterleavedBufferAttribute||!(a.array instanceof Float32Array))return;const n=a.array.length,o=new T(n);for(let i=0;i<n;i++)o[i]=Math.round(Math.max(k==='color'?0:-1,Math.min(1,a.array[i]))*s);g.setAttribute(k,new THREE.BufferAttribute(o,a.itemSize,true))};
  q('normal',Int8Array,127);q('color',Uint8Array,255);if(g.index&&g.index.array instanceof Uint32Array&&A.position.count<65536)g.setIndex(new THREE.BufferAttribute(Uint16Array.from(g.index.array),1));
  let b=0;for(const a of [...Object.values(g.attributes),g.index])if(a&&a.array)b+=a.array.byteLength;g.userData.mfDone=3;MEMF.st.pack++;MEMF.st.cpuMB+=b/1048576;return b}
function MEMF_pack(m,cd){const g=m.geometry;if(!g.boundingSphere)g.computeBoundingSphere();if(!g.boundingBox)g.computeBoundingBox();MEMF_q(g);
  const s=g.boundingSphere,v=new THREE.Vector3().copy(s.center).applyMatrix4(m.matrixWorld);MEMF.S.push({m,x:v.x,z:v.z,r:Math.min(s.radius,1200),on:true,ri:cd?Math.min(MEMF.Rin,cd+150):MEMF.Rin,ro:cd?Math.min(MEMF.Rout,cd+400):MEMF.Rout});MEMF_dh(MEMF.S[MEMF.S.length-1]);if(cd)MEMF.st.cd++}
function MEMF_ipack(m){const g=m.geometry;if(g.userData.mfDone||!g.attributes.position)return;if(!g.boundingSphere)g.computeBoundingSphere();if(!g.boundingBox)g.computeBoundingBox();MEMF.st.imMB+=MEMF_q(g)/1048576;MEMF.st.im++}
function MEMF_gstep(){let S=MEMF.S;if(!S.length||!TUNE.gpuStr)return;if((MEMF.fr=(MEMF.fr||0)+1)%300===0){const inS=o=>{while(o.parent)o=o.parent;return o===scene};S=MEMF.S=S.filter(e=>inS(e.m))}   // drop meshes of a freed city
const cx=camera.position.x,cz=camera.position.z,T=MEMF.ts,cf=T?camera.far:0,zg=T?150:250,zc=T?2:1;let up=0,zs=0;
  for(const e of S){const d=Math.hypot(e.x-cx,e.z-cz)-e.r,ro=T?Math.min(e.ro,cf+50):e.ro,ri=T?Math.min(e.ri,cf-50):e.ri;if(e.on){if(d>ro){e.on=false;e.m.layers.disableAll();e.m.geometry.dispose();MEMF.st.dn++}
      else if(T&&MEMF.nz){if(e.cz){if(e.cz.st===1&&(d<MEMF.nr||MEMF.gHold>performance.now())&&MEMF.ubusy<3)MEMF_unzip(e)}else if(e.dr&&!e.zb&&!e.zfail&&d>MEMF.nr+150&&MEMF.gHold<performance.now()&&MEMF_zready()&&(MEMF_rz(e)||zs<1&&MEMF.zbusy<zc&&(zs++,e.zr=MEMF.nr,MEMF_zip(e),1)));}}   // ios-r18a: drawn, uploaded chunk past the near radius
    else if(e.cz){if(e.cz.st===1&&d<ro&&MEMF.ubusy<(T?3:2))MEMF_unzip(e)}   // restoring: stays hidden until the arrays are back (r18a: tstream unzips at the off line, 150 m inside the zip line)
    else if(d<ri&&up<MEMF.cap){e.on=true;e.zb=0;e.m.layers.enable(0);if(T)MEMF_dh(e);up++;MEMF.st.up++}
    else if(MEMF.zOn&&MEMF_zready()&&!e.zb&&!e.zfail&&(T&&d>ro+zg&&MEMF_rz(e)||zs<1&&MEMF.zbusy<zc&&d>ro+zg&&(zs++,e.zr=ro,MEMF_zip(e),1)));}}
// perf-r17m: a streamed chunk that stays off for good (farther than Rout + 250 m) gives up its packed CPU arrays for ONE deflated copy (lossless; CompressionStream, one
// chunk per step, ~half the bytes). It is inflated again once the camera is back inside Rout (before Rin shows it) and applied as zero-copy views; it is never shown
// before that. ?zfar=0 off; needs CompressionStream (iOS 16.4+), else nothing changes.
Object.assign(MEMF,{zOn:LOWMEM&&TUNE.gpuStr&&typeof CompressionStream==='function'&&typeof DecompressionStream==='function'&&!/[?&]zfar=0/.test(location.search),zbusy:0,ubusy:0,zst:{n:0,rawMB:0,zMB:0,back:0,maxMs:0}});
// not while the world is still being built (TR_bldFix and the roam builders read hub meshes' positions): 45 s after the first roam frame
function MEMF_zready(){if(!(typeof booted!=='undefined'&&booted&&state==='roam')){MEMF.zT=0;return false}const n=performance.now();if(!MEMF.zT)MEMF.zT=n+(MEMF.ts?4000:45000);return n>MEMF.zT}
// ios-r17n touch streaming slice 1 (docs/STREAM_TOUCH.md, ?tstream=1, default OFF): chunk radii follow the camera far plane (touch 1500 m: off past far + 50 m,
// back inside far - 50 m; nothing past the far plane is drawn anyway), and an off chunk is deflated 150 m past that, from 4 s after the first roam frame
// (TR_bldFix runs inside the hub build, before ready), two at a time; inflate starts 100 m before the show line.
MEMF.ts=MEMF.zOn&&/[?&]tstream=1/.test(location.search);
async function MEMF_zip(e){const g=e.m.geometry,P=[],zon=e.on&&!e.g;let tot=0;e.zb=1;MEMF.zbusy++;if(zon&&!e.dr){MEMF.zbusy--;e.zb=0;return}
  try{const A=Object.entries(g.attributes);if(g.index)A.push(['@i',g.index]);
    for(const[k,a]of A){if(!a.array&&e.g)continue;if(!a.array||a.isInterleavedBufferAttribute||a.isInstancedBufferAttribute||a.usage!==THREE.StaticDrawUsage){e.zfail=1;return}const b=a.array.byteLength;P.push({k,a,T:a.array.constructor,n:a.array.length,off:tot,b});tot+=(b+3)&~3}
    const t0=performance.now(),buf=new Uint8Array(tot);for(const p of P)buf.set(new Uint8Array(p.a.array.buffer,p.a.array.byteOffset,p.b),p.off);
    const z=new Uint8Array(await new Response(new Blob([buf]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer());
    if((e.on&&!zon)||(zon&&(!e.on||!e.dr))||e.zb!==1||Math.hypot(e.x-camera.position.x,e.z-camera.position.z)-e.r<(e.zr||e.ro))return;   // came back into range meanwhile: keep the raw arrays
    if(e.g&&(MEMF.gHold>performance.now()||!P.length))return;e.cz={z,P:P.map(p=>({k:p.k,T:p.T,n:p.n,off:p.off})),st:1};if(e.g){e.lm=e.m.layers.mask;e.m.layers.disableAll();MEMF.gst.n++;MEMF.gst.rawMB+=tot/1048576;MEMF.gst.zMB+=z.length/1048576}for(const p of P){p.a.array=null;p.a.getX=p.a.getY=p.a.getZ=p.a.getW=BA_freed}
    const st=MEMF.zst;st.n++;if(zon)st.on=(st.on||0)+1;st.rawMB+=tot/1048576;st.zMB+=z.length/1048576;st.maxMs=Math.max(st.maxMs,performance.now()-t0)}
  catch(err){e.zfail=1}finally{MEMF.zbusy--;e.zb=0}}
async function MEMF_unzip(e){const c=e.cz;c.st=2;MEMF.ubusy++;
  try{const ab=await new Response(new Blob([c.z]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer(),g=e.m.geometry,t0=performance.now();
    for(const p of c.P){const a=p.k==='@i'?g.index:g.attributes[p.k];delete a.getX;delete a.getY;delete a.getZ;delete a.getW;a.array=new p.T(ab,p.off,p.n)}
    if(MEMF.ts&&!e.g)e.zk={z:c.z,P:c.P,ab};if(e.g){e.m.layers.mask=e.lm;MEMF.gst.back++}else if(!e.on)g.dispose();e.cz=null;MEMF.zst.back++;MEMF.zst.maxMs=Math.max(MEMF.zst.maxMs,performance.now()-t0)}
  catch(err){c.st=1;e.zfail=1}finally{MEMF.ubusy--}}
(function MEMF_raf(){try{MEMF_gstep()}catch(e){}try{MEMF_Gstep()}catch(e){}requestAnimationFrame(MEMF_raf)})();
// ios-r17r (?tstream=1): the off chunks are deflated under the load curtain, so the gain shows at ready. roamLoad starts MEMF_cur next to TWG_run and awaits
// both: the chunk copy is one memcpy per zip (≤ 8 ms of zip starts per frame, then a frame), up to MEMF.czN in flight, and the curtain waits at most
// MEMF.cms ms past TWG (?tscur=<ms>, default 250); whatever is left is zipped after ready by MEMF_gstep as before. Distances from the car (RO), not the camera.
Object.assign(MEMF,{cms:(q=>q==null?250:+q)(new URLSearchParams(location.search).get('tscur')),czN:6});MEMF.zst.cur=0;
async function MEMF_cur(){if(!MEMF.ts||!TUNE.gpuStr)return;const t0=performance.now();try{MEMF_sweep()}catch(e){}{const inS=o=>{while(o.parent)o=o.parent;return o===scene};MEMF.S=MEMF.S.filter(e=>inS(e.m))}   // not the meshes of a city just left
  const x=RO.x,z=RO.z,cf=camera.far,L=[];for(const e of MEMF.S){const d=Math.hypot(e.x-x,e.z-z)-e.r,ro=Math.min(e.ro,cf+50);
    if(d>ro&&e.on){e.on=false;e.m.layers.disableAll();e.m.geometry.dispose();MEMF.st.dn++}if(!e.on&&!e.cz&&!e.zb&&!e.zfail&&d>ro+150){e.zr=ro;L.push(e)}else if(MEMF.nz&&e.on&&e.dr&&!e.cz&&!e.zb&&!e.zfail&&d>MEMF.nr+150){e.zr=MEMF.nr;L.push(e)}}
  {const g=[];for(const e of MEMF.G){if(!e.cz&&!e.zb&&!e.zfail&&Math.hypot(e.x-x,e.z-z)-e.r>cf+200){e.zr=cf+50;g.push(e)}}L.unshift(...g)}   // ground first (r17y)
  const P=[];let t=performance.now();MEMF.cur=1;
  try{for(const e of L){if(MEMF.cend&&performance.now()>MEMF.cend)break;while(MEMF.zbusy>=MEMF.czN||performance.now()-t>8){await nextFrame();t=performance.now()}
      if((e.on&&!e.g&&!e.dr)||e.cz||e.zb)continue;P.push(MEMF_zip(e).then(()=>{if(e.cz)MEMF.zst.cur++}))}
    await Promise.race([Promise.all(P),new Promise(r=>{const w=()=>MEMF.cend&&performance.now()>MEMF.cend?r():setTimeout(w,20);w()})])}
  finally{MEMF.cur=0;MEMF.cms0=Math.round(performance.now()-t0)}}
// ios-r17y touch streaming slice 2 (?tstream=1): far ground / drive meshes (trG, gk, dr: ~58 MB in Athens, most never drawn) keep position + index for CPU
// readers, but only GO tests read them far from the car (docs/STREAM_TOUCH.md). Past camera.far + 200 m from the camera (or the car, under the curtain) their
// remaining arrays are deflated like chunks; the GPU buffers stay, the mesh is hidden via layers (nothing past the far plane is drawn; raycasts skip it) and
// is inflated from far + 150 m (zero-copy views, layers restored). MEMF_gall() is the inflate-all hook: the GO runner awaits it before a non-perf GO and no
// ground is zipped for MEMF.gHoldMs after it.
Object.assign(MEMF,{G:[],gg:new WeakMap(),gHold:0,gHoldMs:180000,gst:{n:0,rawMB:0,zMB:0,back:0}});
function MEMF_gadd(m){if(!MEMF.ts||m.isInstancedMesh)return;const g=m.geometry,P=g.attributes.position;if(!P||!P.array)return;const w=MEMF.gg.get(g);if(w){w.zfail=1;return}   // shared geometry: left alone
  if(!g.boundingSphere)g.computeBoundingSphere();if(!g.boundingBox)g.computeBoundingBox();m.updateMatrixWorld();const s=g.boundingSphere,v=new THREE.Vector3().copy(s.center).applyMatrix4(m.matrixWorld);
  const e={m,g:1,x:v.x,z:v.z,r:s.radius};MEMF.gg.set(g,e);MEMF.G.push(e)}
function MEMF_Gstep(){const G=MEMF.G;if(!G.length||!MEMF.ts)return;if((MEMF.gfr=(MEMF.gfr||0)+1)%300===0){const inS=o=>{while(o.parent)o=o.parent;return o===scene};MEMF.G=G.filter(e=>inS(e.m))}
  const cx=camera.position.x,cz=camera.position.z,cf=camera.far,hold=MEMF.gHold>performance.now(),ok=!hold&&MEMF_zready();let zs=0;
  for(const e of G){const d=Math.hypot(e.x-cx,e.z-cz)-e.r;if(e.cz){if(e.cz.st===1&&(hold||d<cf+50)&&MEMF.ubusy<3)MEMF_unzip(e)}
    else if(ok&&!e.zb&&!e.zfail&&zs<1&&MEMF.zbusy<2&&d>cf+200){zs++;e.zr=cf+50;MEMF_zip(e)}}}
async function MEMF_gall(){MEMF.gHold=performance.now()+MEMF.gHoldMs;const t0=performance.now();
  const Z=()=>MEMF.G.concat(MEMF.S.filter(e=>e.on));while((MEMF.zbusy||MEMF.ubusy||Z().some(e=>e.cz))&&performance.now()-t0<10000){for(const e of Z())if(e.cz&&e.cz.st===1&&MEMF.ubusy<4)MEMF_unzip(e);await new Promise(r=>setTimeout(r,16))}
  return !Z().some(e=>e.cz)}
function MEMF_gpre(id,run,say){if(!MEMF.ts||/^perf\//.test(id))return false;say('📍 Restoring ground arrays…');MEMF_gall().then(run,run);return true}   // called by the GO runner (99c goJump)
// ios-r18a slice 3 (?tstream=1): a streamed chunk that is shown and already drawn (uploaded: the GPU copy is what is drawn) keeps no raw CPU copy past
// MEMF.nr from the camera (default 500 m, ?tsnr=<m>, ?tsnz=0 off): its arrays go to ONE deflated copy (the chunk's compact plan) and come back as zero-copy views
// inside MEMF.nr (no re-upload: the GPU buffers are untouched), so nothing near the car or any CPU reader changes and nothing drawn changes. After an inflate the
// deflated copy is kept (e.zk), so leaving again is instant (MEMF_rz: no memcpy, no CompressionStream). Zip / unzip lines are 150 m apart (no churn).
Object.assign(MEMF,{nr:(q=>q==null?500:+q)(new URLSearchParams(location.search).get('tsnr')),nz:MEMF.ts&&!/[?&]tsnz=0/.test(location.search)});MEMF.zst.rz=0;
function MEMF_dh(e){if(!MEMF.ts)return;const m=e.m,f=m.onAfterRender;e.dr=0;m.onAfterRender=function(){e.dr=1;this.onAfterRender=f;return f.apply(this,arguments)}}
function MEMF_rz(e){const k=e.zk;if(!k||e.cz||e.zb||e.zfail||e.on&&!e.dr)return false;const g=e.m.geometry,A=[];
  for(const p of k.P){const a=p.k==='@i'?g.index:g.attributes[p.k];if(!a||!a.array||a.array.buffer!==k.ab){e.zk=null;return false}A.push(a)}
  e.cz={z:k.z,P:k.P,st:1};for(const a of A){a.array=null;a.getX=a.getY=a.getZ=a.getW=BA_freed}MEMF.zst.rz++;return true}
