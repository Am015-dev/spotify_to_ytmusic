// foliage-cam-1 (review 2K #9): instanced/AS trees whose crown (cylinder over the trunk, +2 m margin) holds the chase camera or a point 50-75 % of the way
// to the car are hidden (prop alive:false: AS LODs, smash and respawn skip it; tile instance zeroed, matrix remembered) and put back once the line has been
// clear 0.4 s. Throttled to 8 Hz, 3x3 prop-grid cells, roam car camera only. ?fcam=0 turns it off. NOT a wall/terrain fix: the 'foliage' GO hits on the
// Messe -> Mainkai road are building/road meshes without a roamHit collider (see docs/HANDOFF_fcam1.md).
const FC={on:!/[?&]fcam=0/.test(location.search),t:0,hid:[],M:new THREE.Matrix4(),Z:new THREE.Matrix4().makeScale(0,0,0),n:0,lift:0,hide:0};
function FC_crown(p){let c=p._fc;if(c)return c;const A=window.__as&&__as.A;let V=A&&p.av&&A.V&&A.V[p.av];if(V&&V.H&&V.rx&&V.cls!=='keep'){const a=p.cvs?p.cvs[0]:1,b=p.cvs?p.cvs[1]:1;return p._fc=[V.rx*a+2,p.y+V.H*b*.2,p.y+V.H*b]}
  const g=p.im&&p.im.geometry;if(!g)return p._fc=[0,0,0];if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;p.im.getMatrixAt(p.i,FC.M);const e=FC.M.elements,s=Math.hypot(e[4],e[5],e[6])||1,sx=Math.hypot(e[0],e[1],e[2])||1;
  const h=(b.max.y-b.min.y)*s;return p._fc=[Math.max(b.max.x-b.min.x,b.max.z-b.min.z)*.5*sx*.85,p.y+b.min.y*s+h*.35,p.y+b.max.y*s]}
// hidden = alive:false for the prop (the AS tree LODs, smash and respawn all skip dead props), its tile instance zeroed; AS_step is forced to refill
function FC_kick(){const A=window.__as&&__as.A;if(A)A.cx=1e9}
function FC_restore(all){let k=0;for(let i=FC.hid.length-1;i>=0;i--){const h=FC.hid[i],p=h.p;if(!all&&FC.t-h.t<.4)continue;FC.hid.splice(i,1);
  if(!p.im||p.im.count<=p.i)continue;try{p.alive=true;p.im.setMatrixAt(p.i,h.m);p.im.instanceMatrix.needsUpdate=true;k++}catch(e){}}if(k)FC_kick()}
function FC_step(){const c=camera.position,ox=RO.x,oy=RO.y+1,oz=RO.z;
  // sample points on the car -> camera line: camera, 75 %, 50 % of the way back (the 25 % point stays out: trunks near the car remain solid)
  const S=[[c.x,c.y,c.z],[ox+(c.x-ox)*.75,oy+(c.y-oy)*.75,oz+(c.z-oz)*.75],[ox+(c.x-ox)*.5,oy+(c.y-oy)*.5,oz+(c.z-oz)*.5]];
  const kx=Math.floor(c.x/16),kz=Math.floor(c.z/16);let k=0;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=HUB.pgrid&&HUB.pgrid.get((kx+a)*10000+kz+b);if(!l)continue;
    for(const p of l){if(!CVF_RX.test(p.t))continue;const f=p.alive===false?FC.hid.find(h=>h.p===p):null;if(p.alive===false&&!f)continue;const cr=FC_crown(p);if(!cr[0])continue;let hit=0;
      if((p.x-ox)**2+(p.z-oz)**2<9)continue;
      for(let q=0;q<3&&!hit;q++){const w=S[q];if(w[1]>cr[1]&&w[1]<cr[2]+.6&&(w[0]-p.x)**2+(w[2]-p.z)**2<cr[0]*cr[0])hit=1}
      if(!hit)continue;if(f){f.t=FC.t;continue}
      p.im.getMatrixAt(p.i,FC.M);FC.hid.push({p,m:FC.M.clone(),t:FC.t});p.alive=false;p.rt=1e9;p.im.setMatrixAt(p.i,FC.Z);p.im.instanceMatrix.needsUpdate=true;FC.hide++;k++}}
  if(k)FC_kick();FC_restore(false)}
// camera pull-in (fcam-2, like 2K Drive): the car -> camera line is cast against the big building / glass meshes (learned list, refreshed every 8 s; the
// roamHit colliders do not cover these facades). The ray goes camera -> car (both faces); a wall on the line moves the camera in at once (k = car side of the wall/len, never closer than 3 m to the car);
// k eases back out at ~1.2/s. Orientation is kept (translation along the line only). The offset is removed at the start of the next frame so the
// follow-spring in roamCam never sees the pulled position. ?fcam=0 turns it off, ?fcpull=0 only the pull-in.
FC.pull=!/[?&]fcpull=0/.test(location.search);FC.k=1;FC.off=new THREE.Vector3();FC.rc=new THREE.Raycaster();FC.o=new THREE.Vector3();FC.dv=new THREE.Vector3();FC.occ=[];FC.occT=-99;FC.rt=0;FC.kt=1;FC.pulls=0;
function FC_occ(){FC.occT=FC.t;const L=[];scene.traverse(o=>{if(!o.isMesh||!o.visible||o===pl.mesh||pl.mesh.getObjectById(o.id))return;const m=o.material,mm=Array.isArray(m)?m[0]:m;if(mm&&mm.transparent&&mm.opacity<.5)return;
  const g=o.geometry,n=g&&g.attributes&&g.attributes.position?g.attributes.position.count:0;if(o.isInstancedMesh?(o.userData.bvL||o.userData.cv||o.userData.athB):n>=4000)L.push(o)});FC.occ=L}
function FC_pull(dt){const c=camera.position;
  if(!FC.pull)return;const o=FC.o.set(RO.x,RO.y+1,RO.z),dv=FC.dv.copy(c).sub(o),d=dv.length();if(d<3.2)return;
  if(FC.t-FC.occT>8)FC_occ();
  FC.rt+=dt;if(FC.rt>=.05){FC.rt=0;const rc=FC.rc;rc.set(c,dv.clone().multiplyScalar(-1/d));rc.far=d-2.2;rc.near=0;let t=-1;   // camera -> car ; the hit nearest the car wins
   for(const m of FC.occ){const ms=Array.isArray(m.material)?m.material:[m.material],sd=ms.map(q=>q.side);   // both faces: walls that face away from the camera (camera behind a wall) count too
    let h;try{for(const q of ms)q.side=THREE.DoubleSide;h=rc.intersectObject(m,false)}finally{ms.forEach((q,i)=>q.side=sd[i])}for(const x of h)if(x.distance>t)t=x.distance}
   FC.kt=t>=0?Math.max(3/d,Math.min(1,(d-t-.7)/d)):1}
  FC.k=FC.kt<FC.k?FC.kt:Math.min(FC.kt,FC.k+dt*.8);
  if(FC.k<.999){FC.off.copy(dv).multiplyScalar(1-FC.k);c.sub(FC.off);FC.pulls++}}
roamCam=(f=>function(dt){if(FC.off.lengthSq()){camera.position.add(FC.off);FC.off.set(0,0,0)}f(dt);if(!FC.on||state!=='roam'||(RO.foot&&RO.foot!=='car')||(typeof M1!=='undefined'&&M1.cs)){if(FC.hid.length)FC_restore(true);FC.k=1;FC.kt=1;return}
  // foliage over / around the camera
  FC.t+=dt;FC.n+=dt;if(FC.n>=.125){FC.n=0;try{FC_step()}catch(e){}}try{FC_pull(dt)}catch(e){}})(roamCam);
window.__fcam=FC;
