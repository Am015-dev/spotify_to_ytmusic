/* ===== SC · real-world scale for free roam (module sc.js, inserted before window.__mho; races and the garage preview untouched) =====
   Reference: lane 3.2–3.75 m (Athens res street 7.5 m = 2 lanes), car 4.3 × 1.8 m, person 1.8 m, storey ~3.2 m. LEGO-chunky ≤ ~1.2× is fine.
   Before (v82): roam ship 7.35 long × 7.33 wide (wings), traffic cars 5.9–7.9 × 3.45, pedestrians 2.6 m, quest minifigs 6.8 m.
   All roam scale knobs live in SC_K; every number below derives from it. The ship is scaled through userData.m (hull, kits, boat,
   4x4 wheels, garage bricks and driver all live there), its wings fold to the pod line, the collision hull follows the new footprint. */
var SC_K={
  ship:.68,      // × SHIP_K for the roam ship (12.25 local units long → 5.0 m)
  shipX:.75,     // extra width squeeze after the wing fold (7.3 local → 2.24 m wide)
  fold:3.6,      // wings / fins / kit wings fold in to |x| ≤ this (local units; the pods end at 3.85)
  hover:.68,     // hover gap × this
  car:[.6,.7,.785], // traffic km cars (x,y,z) × this: sedan 5.86 → 4.6 m long, 3.45 → 2.07 m wide, 2.99 → 2.1 m tall
  ped:.48,       // pavement minifigs (was .66 = 2.6 m) → 1.9 m
  fig:.5,        // quest-giver / passenger minifigs (was 1.7 = 6.8 m) → 2.0 m
  cam:.8,        // chase camera distances/heights × this (base + juice offsets)
  rad:1.15,      // collision: centre circle radius (half width 1.12)
  off:1.35,      // collision: nose / tail circles at ± this along the heading, radius rad (5.0 m long)
  skid:[.9,1.7] // skid marks: half track, behind the centre
};
var SC_S={on:true,dx:0,dz:0,nb:0};
function SC_cam(){return SC_S&&SC_S.on?SC_K.cam:1}
// ---- ship: fold wings once per stock part, then scale m (non-uniform) and the ground glow / shadow / shield
function SC_fold(ud){const host=ud.carG;if(!host||host.userData.scN===host.children.length)return;host.userData.scN=host.children.length;
  const B=new THREE.Box3(),inv=new THREE.Matrix4();host.updateMatrixWorld(true);inv.copy(host.matrixWorld).invert();
  for(const o of host.children){if(o.userData.scF||o.userData.gb||o.userData.gbG||o===ud.boat||o===ud.wheels)continue;o.userData.scF=1;B.makeEmpty();
    o.traverse(c=>{if(c.isMesh&&c.geometry&&!(c.material&&c.material.blending===THREE.AdditiveBlending)){c.geometry.computeBoundingBox();B.union(c.geometry.boundingBox.clone().applyMatrix4(_m.multiplyMatrices(inv,c.matrixWorld)))}});
    if(B.isEmpty())continue;const mx=Math.max(Math.abs(B.min.x),Math.abs(B.max.x));if(mx<=SC_K.fold+.05)continue;const cx=(B.min.x+B.max.x)/2,hw=(B.max.x-B.min.x)/2;
    if(Math.abs(cx)<.6){o.scale.x*=SC_K.fold/mx}else{const f=Math.min(1,SC_K.fold/mx);if(hw>.8)o.scale.x*=f;o.position.x*=f}}}
function SC_ship(g,isPl){const ud=g.userData;if(!ud||!ud.m)return;if(!SC_S.on){if(ud.scOn){ud.m.scale.setScalar(SHIP_K);ud.scOn=0}return}SC_fold(ud);
  const k=SHIP_K*SC_K.ship;if(!ud.scOn||ud.m.scale.y!==k){ud.m.scale.set(k*SC_K.shipX,k,k);ud.scOn=1;const r=SC_K.ship;ud.under.scale.set(r*SC_K.shipX,r,1);ud.shadow.scale.set(r*SC_K.shipX,r,1);if(isPl)ud.shield.scale.set(4.2*r*SC_K.shipX,2.4*r,5.4*r)}}
roamPose=(f=>function(s,dt){f(s,dt);if(!SC_S.on||!s||!s.mesh)return;SC_ship(s.mesh,true);const ud=s.mesh.userData;ud.m.position.y*=SC_K.hover})(roamPose);
sprintStart=(f=>function(m){f(m);if(SC_S.on&&RO.sp)for(const a of RO.sp.ai)if(a.g)SC_ship(a.g,false)})(sprintStart);
// ---- collision: three circles along the heading instead of one 2.2 m circle (the ship was ~7 m wide, the new one is 2.7 × 5.0 m)
function SC_hit(x,z,y){if(!SC_S.on){SC_S.dx=SC_S.dz=0;return roamHit(x,z,2.2,y)}const fx=Math.sin(RO.h),fz=Math.cos(RO.h),r=SC_K.rad,o=SC_K.off;
  for(const k of[0,1,-1]){const px=x+fx*o*k,pz=z+fz*o*k,b=roamHit(px,pz,r,y);if(b){SC_S.dx=px-x;SC_S.dz=pz-z;return b}}return null}
function SC_push(b,x,z){if(!SC_S.on)return bldPush(b,x,z,2.2);const p=bldPush(b,x+SC_S.dx,z+SC_S.dz,SC_K.rad);return[p[0]-SC_S.dx,p[1]-SC_S.dz,p[2]]}
roamBounce=(f=>function(...a){SC_S.nb++;return f(...a)})(roamBounce);
// ---- traffic: km cars scaled to car size (custom Athens trolley / scooter are already real-size)
buildHubTraffic=(f=>function(){f();if(!SC_S.on||!HUB.cim)return;HCAR.forEach((nm,k)=>{if(nm[0]==='#')return;const im=HUB.cim[k];if(!im||im.userData.sc)return;im.geometry=im.geometry.clone().scale(...SC_K.car);im.userData.sc=1})})(buildHubTraffic);
// ---- chase camera: every preset scaled; juice drop / pull limits read SC_CAM (patched in ju.js lines)
const SC_RC0=JSON.parse(JSON.stringify(RCAM));function SC_rcam(){const k=SC_cam();for(const n in RCAM){const C=RCAM[n];for(const f of['b','bk','h','hk','l','lk','ly'])C[f]=+(SC_RC0[n][f]*k).toFixed(2)}}SC_rcam();
// ---- measurement API for tSC.js (dimensions in metres, as rendered)
window.__sc={K:SC_K,set:on=>{SC_S.on=!!on;SC_rcam()},
 m:()=>{const B=new THREE.Box3(),out={cid:CID},V=new THREE.Vector3();const vis=c=>{for(let q=c;q;q=q.parent)if(q.visible===false)return false;return true};
  const ud0=pl&&pl.mesh.userData,skip=new Set(ud0?[...ud0.ribbons,ud0.under,ud0.shadow,ud0.shield]:[]);
  const dims=(o,all)=>{B.makeEmpty();let top=o;while(top.parent)top=top.parent;top.updateMatrixWorld(true);o.traverse(c=>{if(c.isMesh&&(all||vis(c))&&!skip.has(c)&&c.material&&c.material.blending!==THREE.AdditiveBlending&&c.geometry){c.geometry.computeBoundingBox();B.union(c.geometry.boundingBox.clone().applyMatrix4(c.matrixWorld))}});const s=B.getSize(V);return[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)]};
  if(pl){const ud=pl.mesh.userData,q=pl.mesh.quaternion.clone(),qm=ud.m.quaternion.clone(),sq=pl.mesh.scale.clone();pl.mesh.quaternion.identity();ud.m.quaternion.identity();pl.mesh.scale.set(1,1,1);
   out.ship=dims(ud.carG);const bv=ud.boat.visible;ud.boat.visible=true;out.boat=dims(ud.boat);ud.boat.visible=bv;const ws=ud.wheels.scale.x,wv=ud.wheels.visible;ud.wheels.scale.setScalar(1);ud.wheels.visible=true;out.wheels4x4=dims(ud.wheels);ud.wheels.scale.setScalar(ws);ud.wheels.visible=wv;
   out.hover=+ud.m.position.y.toFixed(2);pl.mesh.quaternion.copy(q);ud.m.quaternion.copy(qm);pl.mesh.scale.copy(sq);out.gb=!!(ud.gbM&&ud.gbM.length)}
  out.hull=SC_S.on?{w:2*SC_K.rad,l:2*(SC_K.off+SC_K.rad)}:{w:4.4,l:4.4};
  out.cars=HCAR.map((nm,k)=>{const g=HUB.cim[k].geometry;g.computeBoundingBox();const s=g.boundingBox.getSize(V);return[nm,+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)]});
  {const f=minifig('#f00');f.userData.ex.visible=false;out.fig=dims(f)[1]}
  {const P=HUB.pP;let y0=1e9,y1=-1e9;for(const k in P){const g=P[k].geometry;g.computeBoundingBox()}const S=SC_S.on?SC_K.ped:.66;// legs hang from the hip (y 0 → -1.25); hip .16; torso .86..2.26; head/hair on top
   out.ped=+((P.legL.geometry.boundingBox.max.y-P.legL.geometry.boundingBox.min.y+.32+1.4+.96+.25)*S).toFixed(2)}
  const ws={};for(const S of CITY_S){(ws[S.r.cls]=ws[S.r.cls]||[]).push(S.r.w)}out.roadW=Object.fromEntries(Object.entries(ws).map(([k,a])=>{a.sort((x,y)=>x-y);return[k,a[a.length>>1]]}));
  const hs=[];if(HUB.grid)for(const L of HUB.grid.values())for(const b of L)if(b.h&&b.h<900)hs.push(b.h);hs.sort((a,b)=>a-b);out.bldH=+(hs[hs.length>>1]||0).toFixed(1);out.cam={...RCAM.chase};return out},
 cam:n=>{for(let i=0;i<n;i++)roamCam(1/60);const c=camera.position;return{fov:+camera.fov.toFixed(1),back:+Math.hypot(c.x-RO.x,c.z-RO.z).toFixed(1),h:+(c.y-RO.y).toFixed(1)}},
 hit:(x,z,y)=>!!SC_hit(x,z,y??RO.y),nb:()=>SC_S.nb,
 // visual footprint (w × l box at the car's heading) overlapping a building: 8 points on the outline
 clip:(w,l)=>{const fx=Math.sin(RO.h),fz=Math.cos(RO.h);for(const[a,b]of[[1,1],[1,-1],[-1,1],[-1,-1],[0,1],[0,-1],[1,0],[-1,0]]){const px=RO.x+fx*b*l/2+fz*a*w/2,pz=RO.z+fz*b*l/2-fx*a*w/2;if(roamHit(px,pz,0,RO.y+.5))return true}return false}};
