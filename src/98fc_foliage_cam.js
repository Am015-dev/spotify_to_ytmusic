// foliage-cam-1 (review 2K #9): instanced/AS trees whose crown (cylinder over the trunk, +2 m margin) holds the chase camera or a point 50-75 % of the way
// to the car are hidden (prop alive:false: AS LODs, smash and respawn skip it; tile instance zeroed, matrix remembered) and put back once the line has been
// clear 0.4 s. Throttled to 8 Hz, 3x3 prop-grid cells, roam car camera only. ?fcam=0 turns it off. NOT a wall/terrain fix: the 'foliage' GO hits on the
// Messe -> Mainkai road are building/road meshes without a roamHit collider (see docs/HANDOFF_fcam1.md).
const FC={on:!/[?&]fcam=0/.test(location.search),t:0,hid:[],M:new THREE.Matrix4(),Z:new THREE.Matrix4().makeScale(0,0,0),n:0,lift:0,hide:0,near:0,nearR:10};
function FC_crown(p){let c=p._fc;if(c)return c;const A=window.__as&&__as.A;let V=A&&p.av&&A.V&&A.V[p.av];if(V&&V.H&&V.rx&&V.cls!=='keep'){const a=p.cvs?p.cvs[0]:1,b=p.cvs?p.cvs[1]:1;return p._fc=[V.rx*a+2,p.y+V.H*b*.2,p.y+V.H*b]}
  const g=p.im&&p.im.geometry;if(!g)return p._fc=[0,0,0];if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;p.im.getMatrixAt(p.i,FC.M);const e=FC.M.elements,s=Math.hypot(e[4],e[5],e[6])||1,sx=Math.hypot(e[0],e[1],e[2])||1;
  const h=(b.max.y-b.min.y)*s;return p._fc=[Math.max(b.max.x-b.min.x,b.max.z-b.min.z)*.5*sx*.85,p.y+b.min.y*s+h*.35,p.y+b.max.y*s]}
// world-r30b (gauntlet seen/camera-in-props): any other grid prop (kiosk, umbrella, statue, bush, sign) whose body holds the camera or the 75 % point of the car -> camera line
// is hidden the same way (a glance put the lens inside a giant minifig head + an umbrella); body = the whole instance box (+0.5 m), not the crown. ?fcprop=0 off
FC.prop=!/[?&]fcprop=0/.test(location.search);
function FC_body(p){let c=p._fb;if(c)return c;const g=p.im&&p.im.geometry;if(!g)return p._fb=[0,0,0];if(!g.boundingBox){if(!g.attributes.position||!g.attributes.position.array)return p._fb=[0,0,0];g.computeBoundingBox()}const b=g.boundingBox;p.im.getMatrixAt(p.i,FC.M);
  const e=FC.M.elements,s=Math.hypot(e[4],e[5],e[6])||1,sx=Math.hypot(e[0],e[1],e[2])||1,h=(b.max.y-b.min.y)*s;if(h<.9)return p._fb=[0,0,0];return p._fb=[Math.max(b.max.x-b.min.x,b.max.z-b.min.z)*.5*sx+.5,p.y+b.min.y*s,p.y+b.max.y*s]}
// hidden = alive:false for the prop (the AS tree LODs, smash and respawn all skip dead props), its tile instance zeroed; AS_step is forced to refill
function FC_kick(){const A=window.__as&&__as.A;if(A)A.cx=1e9}
function FC_restore(all){let k=0;for(let i=FC.hid.length-1;i>=0;i--){const h=FC.hid[i],p=h.p;if(!all&&FC.t-h.t<.4)continue;FC.hid.splice(i,1);
  if(!p.im)continue;try{p.alive=true;p.im.setMatrixAt(p.i,h.m);p.im.instanceMatrix.needsUpdate=true;k++}catch(e){}}if(k)FC_kick()}
function FC_step(){const c=camera.position,ox=RO.x,oy=RO.y+1,oz=RO.z;
  // sample points on the car -> camera line: camera, 75 %, 50 % of the way back (the 25 % point stays out: trunks near the car remain solid)
  const S=[[c.x,c.y,c.z],[ox+(c.x-ox)*.75,oy+(c.y-oy)*.75,oz+(c.z-oz)*.75],[ox+(c.x-ox)*.5,oy+(c.y-oy)*.5,oz+(c.z-oz)*.5]];
  // r8: a crown whose centre is within FC.nearR m of the camera, above the car and not behind the lens fills a screen corner (rev8 #7): hidden the same way
  const fw=camera.getWorldDirection(FC.fw||(FC.fw=new THREE.Vector3())),nr2=FC.nearR*FC.nearR;
  const kx=Math.floor(c.x/16),kz=Math.floor(c.z/16);let k=0;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=HUB.pgrid&&HUB.pgrid.get((kx+a)*10000+kz+b);if(!l)continue;
    for(const p of l){const tree=CVF_RX.test(p.t);if(p._hcE||!tree&&(!FC.prop||!p.im||p.t==='lamp'))continue;const f=p.alive===false?FC.hid.find(h=>h.p===p):null;if(p.alive===false&&!f)continue;const cr=tree?FC_crown(p):FC_body(p);if(!cr[0])continue;let hit=0;
      if((p.x-ox)**2+(p.z-oz)**2<9)continue;
      for(let q=0;q<(tree?3:2)&&!hit;q++){const w=S[q];if(w[1]>cr[1]&&w[1]<cr[2]+.6&&(w[0]-p.x)**2+(w[2]-p.z)**2<cr[0]*cr[0])hit=1}
      if(!hit&&!tree)continue;if(!hit){const my=(cr[1]+cr[2])/2,dx=p.x-c.x,dy=my-c.y,dz=p.z-c.z;if(my>oy+1&&dx*dx+dy*dy+dz*dz<nr2&&dx*fw.x+dy*fw.y+dz*fw.z>-cr[0]){hit=1;if(!f)FC.near++}}
      if(!hit)continue;if(f){f.t=FC.t;continue}
      p.im.getMatrixAt(p.i,FC.M);FC.hid.push({p,m:FC.M.clone(),t:FC.t});p.alive=false;p.rt=1e9;p.im.setMatrixAt(p.i,FC.Z);p.im.instanceMatrix.needsUpdate=true;FC.hide++;k++}}
  if(k)FC_kick();FC_restore(false)}
// camera pull-in (fcam-2, like 2K Drive): the car -> camera line is cast against the big building / glass meshes (learned list, refreshed every 8 s; the
// roamHit colliders do not cover these facades). The ray goes camera -> car (both faces); a wall on the line moves the camera in at once (k = car side of the wall/len, never closer than 3 m to the car);
// k eases back out at ~1.2/s. Orientation is kept (translation along the line only). The offset is removed at the start of the next frame so the
// follow-spring in roamCam never sees the pulled position. ?fcam=0 turns it off, ?fcpull=0 only the pull-in.
FC.pull=!/[?&]fcpull=0/.test(location.search);FC.k=1;FC.off=new THREE.Vector3();FC.rc=new THREE.Raycaster();FC.o=new THREE.Vector3();FC.dv=new THREE.Vector3();FC.occ=[];FC.occT=-99;FC.rt=0;FC.kt=1;FC.pulls=0;
function FC_occ(){FC.occT=FC.t;const L=[];scene.traverse(o=>{if(!o.isMesh||!o.visible||o===pl.mesh)return;if(!o.raycast.length)return;let q=o.parent;while(q&&q!==pl.mesh)q=q.parent;if(q)return;/* perf-r10e: meshes with a no-op raycast (raycast=()=>{}: 1384 of Athens' 1393 instanced occluders) are not occluders; parent walk (was pl.mesh.getObjectById per scene mesh = a car-subtree traverse each, 33 ms) */const m=o.material,mm=Array.isArray(m)?m[0]:m;if(mm&&mm.transparent&&mm.opacity<.5)return;
  const g=o.geometry,n=g&&g.attributes&&g.attributes.position?g.attributes.position.count:0;if(o.isInstancedMesh?(o.userData.bvL||o.userData.cv||o.userData.athB):n>=4000)L.push(o)});FC.occ=L}
// perf-1 (2026-10-17): FC_pull tested the camera->car ray against EVERY triangle of the merged city meshes (three's Mesh.raycast has no spatial index; the
// merged chunks' bounding spheres always contain the ray): 215 occluders, 3.6 M triangles, 66 ms per pull, every 3rd frame (p95 frame 109 ms, desktop).
// Each occluder geometry now gets a 2D triangle grid (local x/z, 8 m cells), built lazily for meshes whose box is near the car, ≤ 1.5 ms per frame.
// Instanced and batched meshes (per-instance matrices) keep three's raycast. Same answer as the raycast: double-sided triangles, hits between 0 and far, distance from the camera. ?fcbvh=0 = the old path.
const FCG={on:!/[?&]fcbvh=0/.test(location.search),W:new WeakMap(),cs:8,ms:1.5,q:[],pq:[],iM:new THREE.Matrix4(),a:new THREE.Vector3(),b:new THREE.Vector3(),bx:new THREE.Box3(),sg:new THREE.Box3(),st:{built:0,tris:0,hits:0,miss:0,ms:0,mb:0},R:new Int32Array(4)};
function FCG_ok(g){const p=g&&g.attributes&&g.attributes.position;return!!p&&p.itemSize>=3&&!g.morphAttributes.position}
function FCG_get(g){const e=FCG.W.get(g),p=g.attributes.position;if(e&&e.pos===p&&e.ver===p.version&&e.ix===g.index)return e;
  const n=g.index?g.index.count/3|0:p.count/3|0,ne={pos:p,ver:p.version,ix:g.index,n,i:0,bigT:[],done:false,seen:null,tot:0,stamp:0};FCG.W.set(g,ne);return ne}
function FCG_vtx(g){const p=g.attributes.position,f=!p.isInterleavedBufferAttribute&&!p.normalized&&p.array instanceof Float32Array&&p.itemSize===3?p.array:null;
  return f?(i,o)=>{o[0]=f[i*3];o[1]=f[i*3+1];o[2]=f[i*3+2]}:(i,o)=>{o[0]=p.getX(i);o[1]=p.getY(i);o[2]=p.getZ(i)}}
// perf-r18i: the grid is typed arrays only (no [] or Map per cell): a dense cell table over the mesh's x/z box, counting sort in three sliced phases
// (0 count per cell, 1 prefix sum, 2 fill one Int32Array, triangles in ascending order per cell). S[c]..S[c+1] = the triangles of cell c = cx*H+cz. Same cells, same hits.
// A box with more than 2^19 cells doubles this grid's cell size (e.cs) until it fits: coarser cells only add candidates, the exact test is unchanged.
function FCG_rng(V,ix,k,A,B,C,R,cs,ox,oz){const a=ix?ix[k*3]:k*3,b=ix?ix[k*3+1]:k*3+1,c=ix?ix[k*3+2]:k*3+2;V(a,A);V(b,B);V(c,C);
  R[0]=Math.floor(Math.min(A[0],B[0],C[0])/cs)-ox;R[1]=Math.floor(Math.max(A[0],B[0],C[0])/cs)-ox;R[2]=Math.floor(Math.min(A[2],B[2],C[2])/cs)-oz;R[3]=Math.floor(Math.max(A[2],B[2],C[2])/cs)-oz}
function FCG_build(g,e,t0){const ix=g.index&&g.index.array,V=FCG_vtx(g),A=[0,0,0],B=[0,0,0],C=[0,0,0],R=FCG.R;
  if(e.ph===undefined){if(!g.boundingBox)g.computeBoundingBox();const bb=g.boundingBox;let cs=FCG.cs,ox,oz,W,H;
    for(;;){ox=Math.floor(bb.min.x/cs);oz=Math.floor(bb.min.z/cs);W=Math.floor(bb.max.x/cs)-ox+1;H=Math.floor(bb.max.z/cs)-oz+1;if(!(W*H>524288))break;cs*=2}
    if(!(W>0&&H>0)){W=1;H=1}   // empty box
    e.cs=cs;e.ox=ox;e.oz=oz;e.W=W;e.H=H;e.S=new Int32Array(W*H+1);e.ph=0;e.i=0;e.tot=0}
  const cs=e.cs,ox=e.ox,oz=e.oz,W=e.W,H=e.H,S=e.S,n=e.n;
  if(e.ph===0){while(e.i<n){const k=e.i++;FCG_rng(V,ix,k,A,B,C,R,cs,ox,oz);
      if((R[1]-R[0]+1)*(R[3]-R[2]+1)>256){e.bigT.push(k);continue}   // huge triangles (ground sheets): tested on every ray
      for(let x=Math.max(R[0],0),xe=Math.min(R[1],W-1);x<=xe;x++)for(let z=Math.max(R[2],0),ze=Math.min(R[3],H-1);z<=ze;z++){S[x*H+z]++;e.tot++}
      if((k&63)===63&&performance.now()-t0>FCG.ms)return}
    e.ph=1;e.i=0;e.run=0;e.I=new Int32Array(e.tot)}
  if(e.ph===1){const N=W*H;while(e.i<N){const end=Math.min(N,e.i+32768);let r=e.run;for(let c=e.i;c<end;c++){r+=S[c];S[c]=r}e.run=r;e.i=end;if(performance.now()-t0>FCG.ms&&e.i<N)return}
    S[N]=e.tot;e.ph=2;e.i=n-1}
  if(e.ph===2){const I=e.I,bt=e.bigT;let bi=bt.length-1;   // descending k: --S[c] leaves S[c] = the cell's start, triangles ascending
    while(e.i>=0){const k=e.i--;if(bi>=0&&bt[bi]===k){bi--;continue}FCG_rng(V,ix,k,A,B,C,R,cs,ox,oz);
      for(let x=Math.max(R[0],0),xe=Math.min(R[1],W-1);x<=xe;x++)for(let z=Math.max(R[2],0),ze=Math.min(R[3],H-1);z<=ze;z++)I[--S[x*H+z]]=k;
      if((k&63)===63&&performance.now()-t0>FCG.ms)return}}
  e.seen=new Uint32Array(e.n);e.done=true;e.ph=3;FCG.st.built++;FCG.st.tris+=e.n;FCG.st.mb+=(S.byteLength+e.I.byteLength+e.seen.byteLength)/1048576}
// perf-r17d: the bounding box of a big merged mesh is scanned 20 k vertices at a time inside the budget (same box as GFX_bbox)
function FCG_bbox(g,e,t0){const p=g.attributes.position,a=p.array;if(p.isInterleavedBufferAttribute||!(a instanceof Float32Array)||p.itemSize!==3||p.normalized||g.morphAttributes.position||a.length<p.count*3){GFX_bbox(g);return true}
  const B=e.bb||(e.bb={i:0,n:p.count,v:[Infinity,Infinity,Infinity,-Infinity,-Infinity,-Infinity]}),v=B.v;let x0=v[0],y0=v[1],z0=v[2],x1=v[3],y1=v[4],z1=v[5];
  while(B.i<B.n){const end=Math.min(B.n,B.i+20000);for(let i=B.i*3,ie=end*3;i<ie;i+=3){const x=a[i],y=a[i+1],z=a[i+2];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z}B.i=end;v[0]=x0;v[1]=y0;v[2]=z0;v[3]=x1;v[4]=y1;v[5]=z1;if(B.i<B.n&&performance.now()-t0>FCG.ms)return false}
  g.boundingBox=B.n?new THREE.Box3(new THREE.Vector3(x0,y0,z0),new THREE.Vector3(x1,y1,z1)):new THREE.Box3();e.bb=null;return true}
// queue meshes whose world box is within 80 m of the camera->car segment; build ≤ FCG.ms per frame (nearest first)
function FCG_work(c,o){const t0=performance.now();FCG.sg.makeEmpty().expandByPoint(c).expandByPoint(o).expandByScalar(80);
  for(const m of FC.occ){if(m.isInstancedMesh||m.isBatchedMesh||!FCG_ok(m.geometry))continue;const g=m.geometry,e=FCG_get(g);if(e.done)continue;if(!g.boundingBox&&!FCG_bbox(g,e,t0))break;   // perf-10: boxes inside the budget (one frame boxed every new occluder)
    if(!FCG.bx.copy(g.boundingBox).applyMatrix4(m.matrixWorld).intersectsBox(FCG.sg))continue;FCG_build(g,e,t0);if(performance.now()-t0>FCG.ms)break}
  FCG.st.ms+=performance.now()-t0}
// distance (from c) of the hit nearest the far end on the segment c -> c+dir*far, -1 = no hit, null = use three's raycast for this mesh
function FCG_hit(m,c,far){const g=m.geometry;if(!FCG_ok(g)||!m.layers.test(FC.rc.layers))return FCG_ok(g)?-1:null;const e=FCG.W.get(g);
  if(!e||!e.done||e.pos!==g.attributes.position||e.ver!==g.attributes.position.version||e.ix!==g.index){FCG.st.miss++;return -1}   // perf-10: not indexed yet = no hit until FCG_work has built it (was three's full-triangle raycast: 40-55 ms frames in Frankfurt)
  const rd=FC.rc.ray.direction,ew=FCG.a.copy(rd).multiplyScalar(far).add(c);if(!g.boundingBox)g.computeBoundingBox();
  if(!FCG.bx.copy(g.boundingBox).applyMatrix4(m.matrixWorld).intersectsBox(FCG.sg.makeEmpty().expandByPoint(c).expandByPoint(ew)))return -1;
  const iM=FCG.iM.copy(m.matrixWorld).invert(),lo=FCG.b.copy(c).applyMatrix4(iM),le=ew.applyMatrix4(iM),cs=e.cs;
  const ox=lo.x,oy=lo.y,oz=lo.z,dx=le.x-ox,dy=le.y-oy,dz=le.z-oz,x0=Math.floor(Math.min(ox,le.x)/cs),x1=Math.floor(Math.max(ox,le.x)/cs),z0=Math.floor(Math.min(oz,le.z)/cs),z1=Math.floor(Math.max(oz,le.z)/cs);
  if((x1-x0+1)*(z1-z0+1)>400)return null;
  const ix=g.index&&g.index.array,V=FCG_vtx(g),A=[0,0,0],B=[0,0,0],C=[0,0,0],sn=++e.stamp>>>0;let best=-1;FCG.st.hits++;
  for(let x=x0-1;x<=x1;x++)for(let z=z0;z<=z1;z++){let L,i0,i1;if(x<x0){if(z>z0)continue;L=e.bigT;i0=0;i1=L.length}else{const cx=x-e.ox,cz=z-e.oz;if(cx<0||cz<0||cx>=e.W||cz>=e.H)continue;const c=cx*e.H+cz;L=e.I;i0=e.S[c];i1=e.S[c+1]}
    for(let ii=i0;ii<i1;ii++){const k=L[ii];if(e.seen[k]===sn)continue;e.seen[k]=sn;V(ix?ix[k*3]:k*3,A);V(ix?ix[k*3+1]:k*3+1,B);V(ix?ix[k*3+2]:k*3+2,C);
      // Moller-Trumbore, both faces, t in [0,1] along the local segment (affine: same fraction of the world segment)
      const e1x=B[0]-A[0],e1y=B[1]-A[1],e1z=B[2]-A[2],e2x=C[0]-A[0],e2y=C[1]-A[1],e2z=C[2]-A[2],px=dy*e2z-dz*e2y,py=dz*e2x-dx*e2z,pz=dx*e2y-dy*e2x,det=e1x*px+e1y*py+e1z*pz;
      if(det>-1e-12&&det<1e-12)continue;const inv=1/det,tx=ox-A[0],ty=oy-A[1],tz=oz-A[2],u=(tx*px+ty*py+tz*pz)*inv;if(u<0||u>1)continue;
      const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x,v=(dx*qx+dy*qy+dz*qz)*inv;if(v<0||u+v>1)continue;const tt=(e2x*qx+e2y*qy+e2z*qz)*inv;if(tt<0||tt>1)continue;
      const dist=tt*far;if(dist>best)best=dist}}
  return best}
function FC_pull(dt){const c=camera.position;
  if(!FC.pull)return;const o=FC.o.set(RO.x,RO.y+1,RO.z),dv=FC.dv.copy(c).sub(o),d=dv.length();if(d<3.2)return;
  if(FC.t-FC.occT>8)FC_occ();if(FCG.on)FCG_work(c,o);
  FC.rt+=dt;if(FC.rt>=.05){FC.rt=0;const rc=FC.rc;rc.set(c,(FC.rd||(FC.rd=new THREE.Vector3())).copy(dv).multiplyScalar(-1/d));rc.far=d-2.2;rc.near=0;let t=-1;   // camera -> car ; the hit nearest the car wins
   /* boot-4: no per-occluder arrays / closures / clone at 20 Hz (FC_pull was the top allocator of the first minute); side save in FC.sd, hits in FC.h */
   const SD=FC.sd||(FC.sd=[]),H=FC.h||(FC.h=[]);for(let oi=0;oi<FC.occ.length;oi++){const m=FC.occ[oi];   // both faces: walls that face away from the camera (camera behind a wall) count too
    if(FCG.on&&!m.isInstancedMesh&&!m.isBatchedMesh){const r=FCG_hit(m,c,rc.far);if(r!==null){if(r>t)t=r;continue}}   // perf-1: grid path (null = not indexed yet / not usable -> three raycast)
    const mm=m.material,ma=Array.isArray(mm),nm=ma?mm.length:1;H.length=0;try{for(let i=0;i<nm;i++){const q=ma?mm[i]:mm;SD[i]=q.side;q.side=THREE.DoubleSide}rc.intersectObject(m,false,H)}finally{for(let i=0;i<nm;i++)(ma?mm[i]:mm).side=SD[i]}for(let i=0;i<H.length;i++)if(H[i].distance>t)t=H[i].distance}
   FC.hT=t>=0?(FC.hT||0)+.05:0;FC.kt=t>=0&&FC.hT>=.3?Math.max(3/d,Math.min(1,(d-t-.7)/d)):1}   /* rv4A: a wall must stay on the line 0.3 s (a corner clipped while passing is ignored) */
  FC.k=FC.kt<FC.k?Math.max(FC.kt,FC.k-dt*2):Math.min(FC.kt,FC.k+dt*.5);   /* rv4A: eases in at 2/s (was a snap) and out at 0.5/s (was 0.8): road-follow in Athens swung 18/min */
  if(FC.k<.999){FC.off.copy(dv).multiplyScalar(1-FC.k);c.sub(FC.off);FC.pulls++}}
roamCam=(f=>function(dt){if(FC.off.lengthSq()){camera.position.add(FC.off);FC.off.set(0,0,0)}f(dt);if(!FC.on||state!=='roam'||(RO.foot&&RO.foot!=='car')||(typeof M1!=='undefined'&&M1.cs)){if(FC.hid.length)FC_restore(true);FC.k=1;FC.kt=1;return}
  // foliage over / around the camera
  FC.t+=dt;FC.n+=dt;if(FC.n>=.125){FC.n=0;try{FC_step()}catch(e){}}try{FC_pull(dt)}catch(e){}})(roamCam);
window.__fcam=FC;
// perf-r10e GO r10e/fcpull: the camera wall-pull list holds only meshes that can be hit (no raycast=()=>{} no-ops), FC_occ is cheap, and one 20 Hz raycast pass is cheap.
// Pass line: 0 no-op occluders, FC_occ < 15 ms, raycast pass (median of 20, camera 9 m behind the car) < 5 ms.
function FC_r10eGo(){if(state!=='roam'||!RO.on||!pl)return'📍 Start free roam first';let t0=performance.now();FC_occ();const occMs=performance.now()-t0,nop=FC.occ.filter(m=>!m.raycast.length).length;
 const c=camera.position,c0=c.clone(),T=[],pull=FC.pull,k=FC.k;FC.pull=true;try{for(let i=0;i<20;i++){c.set(RO.x-Math.sin(RO.h)*9,RO.y+4,RO.z-Math.cos(RO.h)*9);FC.rt=1;FC.occT=FC.t;t0=performance.now();FC_pull(1/60);T.push(performance.now()-t0)}}finally{c.copy(c0);FC.pull=pull;FC.k=k}
 T.sort((a,b)=>a-b);const r={occ:FC.occ.length,nop,occMs:+occMs.toFixed(1),passMs:+T[10].toFixed(2)};window.__chk=window.__chk||{};window.__chk.r10e=r;
 return`📍 camera occluders ${r.occ}, no-op raycast ones ${nop}; FC_occ ${r.occMs} ms; one raycast pass ${r.passMs} ms (median of 20)`+(nop===0&&occMs<15&&r.passMs<5?' ✅':' ❌')}
(function FC_r10eReg(i){const C=window.__chk;if(C&&C.GO){if(Array.isArray(C.items)&&!C.items.some(x=>x.ver==='r10e'))C.items.push({ver:'r10e',id:'fcpull',area:'perf',text:'perf-r10e · the camera wall-pull only raycasts meshes that can be hit, and one pass stays under 5 ms'});C.GO['r10e/fcpull']=[{c:'fra',n:'fcpull',fn:()=>FC_r10eGo()},{c:'ath',n:'fcpull',fn:()=>FC_r10eGo()}];return}if(i<600)setTimeout(()=>FC_r10eReg(i+1),100)})(0);
// world-r30b (gauntlet seen/prop-on-car): a mission starts with a clear spot. Grid props within 4.5 m of the car or of its first 12 m ahead are hidden the FC way
// (alive:false, instance zeroed, matrix kept) and come back once the car is 30 m away; a street-life cluster (stall / café / crowd) in that zone is flagged C.mv
// (LV_clStep re-places it at a far corner, people included). Was: a flat beige slab and a black/red/yellow block sat on the road inside the player's car at START.
function FC_clear(R){const x=RO.x,z=RO.z,fx=Math.sin(RO.h),fz=Math.cos(RO.h),near=(px,pz,r)=>{const dx=px-x,dz=pz-z,a=Math.max(0,Math.min(12,dx*fx+dz*fz)),ex=dx-fx*a,ez=dz-fz*a;return ex*ex+ez*ez<(R+r)*(R+r)};let n=0;
  const kx=Math.floor(x/16),kz=Math.floor(z/16);for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const l=HUB.pgrid&&HUB.pgrid.get((kx+a)*10000+kz+b);if(!l)continue;
    for(const p of l){if(!p.im||p.alive===false||p.t==='lamp')continue;const bd=CVF_RX.test(p.t)?[1]:FC_body(p);if(!bd[0]||!near(p.x,p.z,Math.min(bd[0],3)))continue;
      p.im.getMatrixAt(p.i,FC.M);FC.hid.push({p,m:FC.M.clone(),t:1e9,ms:[x,z]});p.alive=false;p.rt=1e9;p.im.setMatrixAt(p.i,FC.Z);p.im.instanceMatrix.needsUpdate=true;n++}}
  try{if(LV.cl)for(const C of LV.cl.L)if(C.on&&(near(C.x,C.z,3.5)||(C.pr||[]).some(q=>!q.dead&&near(q.x,q.z,q.r)))){C.mv=1;n++}}catch(e){}
  if(n)FC_kick();FC.clr=(FC.clr||0)+n;return n}
function FC_clearBack(){for(const h of FC.hid)if(h.ms&&Math.hypot(RO.x-h.ms[0],RO.z-h.ms[1])>30){h.t=-1;h.ms=null}}
chStart=(f=>function(m,o){let r;try{FC_clear(4.5)}catch(e){FC.cerr=String(e).slice(0,120)}r=f.apply(this,arguments);try{FC_clear(4.5)}catch(e){}return r})(chStart);
roamOpen=(f=>function(m){const r=f.apply(this,arguments);try{if(RO.card)FC_clear(4.5)}catch(e){}return r})(roamOpen);
roamHud=(f=>function(){const r=f.apply(this,arguments);if(FC.hid.length&&((FC.cb=(FC.cb||0)+1)%30===0))try{FC_clearBack();if(!FC.on||state!=='roam')FC_restore(false)}catch(e){}return r})(roamHud);
