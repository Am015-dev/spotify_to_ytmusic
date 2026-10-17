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
function MEMF_sweep(){if(!TUNE.memFree)return;const hook=m=>{if(m.isMesh&&!m.isInstancedMesh&&!m.isSkinnedMesh&&m.geometry&&!MEMF.seen.has(m)){MEMF.seen.add(m);const u=m.userData;let part=0;for(const s of MEMF.skip)if(u[s]){if(LOWMEM&&MEMF.part.includes(s)){part=1;break}return}
    if(!part&&TUNE.gpuStr){const g=m.geometry,u=MEMF.gu.get(g);if(u===undefined){MEMF.gu.set(g,m);m.updateMatrixWorld();MEMF_pack(m);return}if(u){MEMF.gu.set(g,null);const i=MEMF.S.findIndex(e=>e.m===u);if(i>=0){const e=MEMF.S.splice(i,1)[0];e.m.layers.enable(0)}}}   // crash-5: shared geometry -> memFree as before
    const f=m.onAfterRender;m.onAfterRender=function(){MEMF_free(this,part);this.onAfterRender=f}}};
  const walk=o=>{if(o===RO.grp||o.userData.keep&&!o.isMesh||o.userData.gb)return;hook(o);for(const c of o.children)walk(c)};walk(scene)}
setInterval(MEMF_sweep,2500);
// crash-5: GPU streaming of static city meshes in the low-mem tier (TUNE.gpuStr, ?gs=0 off). memFree used to drop their CPU copy after the first
// draw, so every chunk ever seen stayed on the GPU (buffers 146 -> 224 MB in 5 min). Now their arrays are packed once (normal -> Int8, colour -> Uint8,
// index -> Uint16 when it fits; ~45 % of the float bytes) and kept; a mesh farther than Rout from the camera has its GPU buffers freed
// (geometry.dispose + hidden via layers) and is shown again inside Rin (hysteresis), at most MEMF.cap re-uploads per frame. Shared geometries are left to memFree.
if(TUNE.gpuStr===undefined)TUNE.gpuStr=LOWMEM&&new URLSearchParams(location.search).get('gs')!=='0'?1:0;
Object.assign(MEMF,{S:[],gu:new Map(),cap:3,Rin:1450,Rout:1800,st:{pack:0,cpuMB:0,up:0,dn:0}});
function MEMF_pack(m){const g=m.geometry;if(!g.boundingSphere)g.computeBoundingSphere();if(!g.boundingBox)g.computeBoundingBox();g.dispose();const A=g.attributes;
  const q=(k,T,s)=>{const a=A[k];if(!a||!a.array||a.normalized||a.isInterleavedBufferAttribute||!(a.array instanceof Float32Array))return;const n=a.array.length,o=new T(n);for(let i=0;i<n;i++)o[i]=Math.round(Math.max(k==='color'?0:-1,Math.min(1,a.array[i]))*s);g.setAttribute(k,new THREE.BufferAttribute(o,a.itemSize,true))};
  q('normal',Int8Array,127);q('color',Uint8Array,255);if(g.index&&g.index.array instanceof Uint32Array&&A.position.count<65536)g.setIndex(new THREE.BufferAttribute(Uint16Array.from(g.index.array),1));
  let b=0;for(const a of [...Object.values(g.attributes),g.index])if(a&&a.array)b+=a.array.byteLength;g.userData.mfDone=3;MEMF.st.pack++;MEMF.st.cpuMB+=b/1048576;
  const s=g.boundingSphere,v=new THREE.Vector3().copy(s.center).applyMatrix4(m.matrixWorld);MEMF.S.push({m,x:v.x,z:v.z,r:Math.min(s.radius,1200),on:true})}
function MEMF_gstep(){let S=MEMF.S;if(!S.length||!TUNE.gpuStr)return;if((MEMF.fr=(MEMF.fr||0)+1)%300===0){const inS=o=>{while(o.parent)o=o.parent;return o===scene};S=MEMF.S=S.filter(e=>inS(e.m))}   // drop meshes of a freed city
const cx=camera.position.x,cz=camera.position.z;let up=0;
  for(const e of S){const d=Math.hypot(e.x-cx,e.z-cz)-e.r;if(e.on){if(d>MEMF.Rout){e.on=false;e.m.layers.disableAll();e.m.geometry.dispose();MEMF.st.dn++}}
    else if(d<MEMF.Rin&&up<MEMF.cap){e.on=true;e.m.layers.enable(0);up++;MEMF.st.up++}}}
(function MEMF_raf(){try{MEMF_gstep()}catch(e){}requestAnimationFrame(MEMF_raf)})();
