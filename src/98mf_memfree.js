// ===== MEMFREE (mem-1): drop the CPU copy of static world geometry once it has really been drawn (the GPU copy stays). Flag TUNE.memFree (0 = off).
// Heap after load was ~500 MB, ~290 MB of it BufferGeometry typed arrays that nothing reads again. A sweep (every 2.5 s, <=400 meshes) hooks
// mesh.onAfterRender; after the first draw (= uploaded) it computes the bounds, nulls position/normal/color/uv/index arrays (same trick as STR strFree / SM3).
// Skipped: instanced, car/footman groups, anything a raycast or CPU-side reader may touch (trG ground, gk, simp, lf, keep, P, bmk, cd, dr, gb, sim, ramp).
if(TUNE.memFree===undefined)TUNE.memFree=new URLSearchParams(location.search).get('mf')==='1'?1:0;   // default OFF (breaks xf1/grass + terr4/5 hill tests, they read world mesh arrays); ?mf=1 on
const MEMF={seen:new WeakSet(),n:0,mb:0,skip:['trG','gk','simp','lf','keep','P','bmk','cd','dr','gb','sim','ramp','lz','sky','nr']};
function MEMF_free(m){const g=m.geometry;if(!g||g.userData.mfDone)return;g.userData.mfDone=1;if(!g.boundingSphere)g.computeBoundingSphere();if(!g.boundingBox)g.computeBoundingBox();
  const A=Object.values(g.attributes);if(g.index)A.push(g.index);let b=0;for(const a of A){if(!a.array||a.isInstancedBufferAttribute||a.isInterleavedBufferAttribute||a.usage!==THREE.StaticDrawUsage)continue;b+=a.array.byteLength;a.array=null;a.getX=a.getY=a.getZ=a.getW=BA_freed}
  MEMF.n++;MEMF.mb+=b/1048576}
function MEMF_sweep(){if(!TUNE.memFree)return;const hook=m=>{if(m.isMesh&&!m.isInstancedMesh&&!m.isSkinnedMesh&&m.geometry&&!MEMF.seen.has(m)){MEMF.seen.add(m);const u=m.userData;for(const s of MEMF.skip)if(u[s])return;
    const f=m.onAfterRender;m.onAfterRender=function(){MEMF_free(this);this.onAfterRender=f}}};
  const walk=o=>{if(o===RO.grp||o.userData.keep&&!o.isMesh||o.userData.gb)return;hook(o);for(const c of o.children)walk(c)};walk(scene)}
setInterval(MEMF_sweep,2500);
