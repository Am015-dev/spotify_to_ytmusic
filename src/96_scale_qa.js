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
  carW:2.1,      // traffic km cars: width cap (m) — shrink only, cars the base already sized stay as they are
  carL:{def:4.9,van:5.9,delivery:5.9,truck:6.6,'garbage-truck':7}, // length caps (m)
  ped:.48,       // pavement minifigs (was .66 = 2.6 m) → 1.9 m
  fig:.5,        // quest-giver / passenger minifigs (was 1.7 = 6.8 m) → 2.0 m
  cam:.72,       // chase camera distances/heights × this (base + juice offsets): keeps v82 framing (car length / distance)
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
buildHubTraffic=(f=>function(){f();if(!SC_S.on||!HUB.cim)return;HCAR.forEach((nm,k)=>{if(nm[0]==='#')return;const im=HUB.cim[k];if(!im||im.userData.sc)return;const g=im.geometry;g.computeBoundingBox();const z=g.boundingBox.getSize(new THREE.Vector3()),sx=Math.min(1,SC_K.carW/z.x),sz=Math.min(1,(SC_K.carL[nm]||SC_K.carL.def)/z.z),sy=Math.min(1,(sx+sz)/2);if(sx<1||sz<1){im.geometry=g.clone().scale(sx,sy,sz)}im.userData.sc=1})})(buildHubTraffic);
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

/* ===== SC2 · humans at 1.8 m, a clear verge between road and facades, forgiving walls (module sc2.js, after sc.js; roam only) =====
   Owner (live v82): "I turn slightly and crash into buildings. Make space between roads and buildings. Humans are still giants."
   · humans: pavement peds + quest/passenger minifigs ~1.85 m; the garage driver in world ships (seated) ~1.6 m standing height;
     Chapter-1 goon cars capped at 5.6 m long, the moped goon 2.2 m with a 1.85 m rider
   · setback: building footprints keep ≥ 3 m from the road edge (Athens per street class, Frankfurt footprint check), colliders follow
   · walls: a glancing hit (< 35°) slides along the wall at ≥ 90% speed and turns the car a little back toward the road; only steeper hits bounce */
Object.assign(SC_K,{ped:.44,fig:.46,drv:2,glance:35,slide:.9,away:.14,goonL:5.6,moped:.62,
  sbA:{ped:3,res:3.6,link:3.6,sec:3.8,main:4,arterial:4.5,hill:3}, // Athens: road reserve beyond the half width (was ped 1.2 · res 2.2 · sec 3 · main 3.2)
  sbF:4});                                                          // Frankfurt: footprint sample points ≥ this beyond the half width (was 2.5)
SC_S.ng=0;
// ---- driver: world ships (shipMesh → GB_attach with cache) get the bigger seated figure; the garage editor (cache=false) keeps its own
GB_attach=(f=>function(g,b,fig,cache,bp){SC_S.drv=!!cache&&SC_S.on;try{return f(g,b,fig,cache,bp)}finally{SC_S.drv=false}})(GB_attach);
// ---- Chapter-1 goons: km cars at sc 2.7–3.4 were 7–8.5 m long; the moped rider was 3 m tall
M1_goon=(f=>function(kind,x,z,o){const g=f(kind,x,z,o);if(!SC_S.on||!g||!g.m)return g;try{let k=1;if(kind==='moped')k=SC_K.moped;else{const B=new THREE.Box3().setFromObject(g.m),s=B.getSize(new THREE.Vector3());const L=Math.max(s.x,s.z);if(L>SC_K.goonL)k=SC_K.goonL/L}if(k<1){g.m.scale.multiplyScalar(k);g.scK=k}}catch(e){}return g})(M1_goon);
// ---- forgiving walls
roamBounce=(f=>function(ax,sp,nX,nZ){if(!SC_S.on)return f(ax,sp,nX,nZ);const vx=Math.sin(RO.vh)*RO.v,vz=Math.cos(RO.vh)*RO.v;if(nX==null){if(ax==='x'){nX=-(Math.sign(vx)||1);nZ=0}else{nX=0;nZ=-(Math.sign(vz)||1)}}
  const vn=vx*nX+vz*nZ;if(vn>-.05)return f(ax,sp,nX,nZ);const a=Math.min(1,-vn/Math.max(sp,.1));if(a>=Math.sin(SC_K.glance/57.2958)||sp<4)return f(ax,sp,nX,nZ);
  SC_S.nb++;SC_S.ng++;const tx=vx-vn*nX,tz=vz-vn*nZ,tl=Math.hypot(tx,tz);if(tl<.01)return f(ax,sp,nX,nZ);
  const tf=Math.atan2(tx/tl+nX*SC_K.away,tz/tl+nZ*SC_K.away),ns=Math.max(sp*SC_K.slide,sp*(1-.6*a*a));
  if(Math.abs(angDiff(tf,RO.h))<=Math.PI/2){RO.vh=tf;RO.v=ns;RO.h+=angDiff(tf,RO.h)*.6}else{RO.vh=tf+Math.PI;RO.v=-ns;RO.h+=angDiff(tf+Math.PI,RO.h)*.6}RO.yr*=.5;RO.stkT=0})(roamBounce);
// ---- test hooks
Object.assign(window.__sc,{
 ng:()=>SC_S.ng,figAt:(x,z,h)=>{const f=minifig('#2f7de1');f.userData.ex.visible=false;f.position.set(x,groundY(x,z),z);f.rotation.y=h||0;RO.grp.add(f);return true},bh:(x,z)=>!!roamHit(x,z,0,groundY(x,z)+.5),
 humans:()=>{const o={ped:+(((1.25+.32+1.4+.96+.25)*(SC_S.on?SC_K.ped:.66))).toFixed(2)};{const f=minifig('#f00');f.userData.ex.visible=false;const B=new THREE.Box3();f.updateMatrixWorld(true);f.traverse(c=>{if(c.isMesh)B.expandByObject(c)});o.fig=+(B.max.y-B.min.y).toFixed(2)}
  try{const M=[],L=[];GB_figGeo(GB_figGet(),M,L,false);const B=new THREE.Box3();for(const g of M){g.computeBoundingBox();B.union(g.boundingBox)}const k=pl?pl.mesh.userData.m.scale.y:SHIP_K;o.driver=+((B.max.y-B.min.y)*1.5*(SC_S.on?SC_K.drv:1)*k).toFixed(2)}catch(e){o.driver=null}
  o.moped=+(4.01*.75*(SC_S.on?SC_K.moped:1)).toFixed(2);return o},
 peds:()=>(HUB.peds||[]).filter(p=>p._x!=null).map(p=>[p._x,p._z,p.y||0]),
 // share of street-edge samples (every 6 m, both sides, all non-pedestrian streets) with a building collider within d m of the road edge
 verge:(d=3)=>{let n=0,hit=0;for(const S of CITY_S){if(S.r.cls==='ped'||S.r.cls==='hill'||S.r.cls==='quay')continue;const P=S.pts;for(let i=1;i<P.length;i+=2){const p=P[i],tx=p.tx,tz=p.tz;if(tx==null)continue;for(const sd of[-1,1]){const nx=tz*sd,nz=-tx*sd;let bad=false;n++;for(let e=.5;e<=d&&!bad;e+=.5){const x=p.x+nx*(S.r.w/2+e),z=p.z+nz*(S.r.w/2+e);if(roamHit(x,z,0,groundY(x,z)+.5))bad=true}if(bad)hit++}}}if(typeof FILL_R!=='undefined'&&CID==='fra'){try{hubRoads()}catch(e){}for(const r of FILL_R||[])for(let t=3;t<r.L-3;t+=6)for(const sd of[-1,1]){const nx=r.uz*sd,nz=-r.ux*sd,cx=r.x0+r.ux*t,cz=r.z0+r.uz*t;let bad=false;n++;for(let e=.5;e<=d&&!bad;e+=.5){const x=cx+nx*(r.w/2+e),z=cz+nz*(r.w/2+e);if(roamHit(x,z,0,groundY(x,z)+.5))bad=true}if(bad)hit++}}return{n,hit,pct:+(100*hit/Math.max(1,n)).toFixed(2)}},
 streets:(n,minL)=>{const out=[];const L=CITY_S.map((S,i)=>[S,i]).filter(([S])=>S.r.cls!=='ped'&&S.r.cls!=='hill'&&S.r.cls!=='quay'&&!S.r.ab);for(const[S]of L){const P=S.pts;let a=0;for(let i=1;i<P.length;i++){const d=Math.hypot(P[i].x-P[a].x,P[i].z-P[a].z),h0=Math.atan2(P[a+1].x-P[a].x,P[a+1].z-P[a].z),h1=Math.atan2(P[i].x-P[i-1].x,P[i].z-P[i-1].z);if(Math.abs(angDiff(h0,h1))>.25){a=i-1;continue}
   if(d>=minL){const pts=P.slice(a,i+1).map(p=>[p.x,p.z]);if(pts.some(q=>(HUB.gates||[]).some(G=>Math.hypot(G.x-q[0],G.z-q[1])<120)||q[0]<WX0+80||q[0]>WX1-80||q[1]<WZS+80||q[1]>WZN-80||CID==='ath'&&[[0,0],[40,0],[-40,0],[0,40],[0,-40]].some(([a,b])=>{const[e,n]=RW(q[0]+a,q[1]+b);return !athIn(ATHD,e,n)})))break;if(!out.some(o=>Math.hypot(o.pts[0][0]-pts[0][0],o.pts[0][1]-pts[0][1])<300))out.push({w:S.r.w,cls:S.r.cls,pts});break}}if(out.length>=n*3)break}
  return out.sort((a,b)=>a.w-b.w).filter((o,i,A)=>i%Math.max(1,Math.floor(A.length/n))===0).slice(0,n)}});

window.__sm={get on(){return SM_ON},get st(){return SM},get athd(){return ATHD},gates:()=>SM_ON?SM_gates():[],inD:(x,z,m)=>SM_inD(x,z,m||0),lz:()=>LAZY.map(L=>({id:L.id,done:L.done,qd:L.qd,r:L.rect})),
 atcAt:(id,si)=>{const m=ATC_mark(id)||ATC_mkMark(id);M1.hp=100;M1.restoring={mid:id,si,x:RO.x,z:RO.z,h:RO.h,left:200,t:0,hp:100,ph:null,vanAt:null,rv:null};chStart(m,{O:{x:m.x,z:m.z}});M1.restoring=null;const ch=RO.ch;return ch&&ch.v2?{si:ch.v2.si,t:ch.v2.L.st[ch.v2.si].t}:null},
 atcSt:()=>{const ch=RO.ch;if(!ch||!ch.v2)return null;const S=ch.v2.L.st[ch.v2.si];return{mid:ch.m.ev.mid,si:ch.v2.si,t:S.t,to:S.to||null,x:S.x,z:S.z,dd:S.dd}}};
window.__sm3=SM3;window.__smm=SMM;SMM.fn={tile:(a,b)=>SMM_tile(a,b),center:(x,z)=>SMM_center(x,z)};
/* ===== QA · human-play fixes (module qa.js, inserted before window.__mho; every global is QA_*) =====
   1) Touch players see keyboard hints in NPC lines ("Hold DRIFT (X)", "(SHIFT)", "(SPACE)"): strip them on touch. */
const QA_KEYS=/\s*\((?:SHIFT|Shift|X|Y|SPACE|Space|Esc|ESC|M|T|R)\)/g;
function QA_untouchKeys(el){if(!el||!document.body.classList.contains('touch'))return;const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){const t=n.nodeValue;if(t.indexOf('(')<0)continue;const u=t.replace(QA_KEYS,'');if(u!==t)n.nodeValue=u}}
setInterval(()=>{for(const id of['npcSay','ogHud','qTrk','roamPrompt','roamTut'])QA_untouchKeys(document.getElementById(id))},400);
/* 2) Chase camera inside buildings. The bug-sweep guard (BF) only runs in Frankfurt and runs BEFORE the juice camera offsets
      (drop / pull-in / kick), which are added afterwards and can push the camera back into a wall. tPlay measured the camera inside
      a building collider in 40.9 % of Athens frames. This guard is the outermost roamCam wrapper, runs in every city, and slides the
      camera toward the car until it is out of the building (never into the car). */
const QA_S={camFix:0};
roamCam=(f=>function(dt){f(dt);if(state!=='roam'||(typeof M1!=='undefined'&&M1.cs))return;const c=camera.position;if(!roamHit(c.x,c.z,.4,c.y))return;QA_S.camFix++;
  const x0=c.x,z0=c.z,y0=c.y;let ok=0;for(let k=1;k<=12&&!ok;k++){const u=k/12*.85,x=x0+(RO.x-x0)*u,z=z0+(RO.z-z0)*u,y=y0+(RO.y+2.2-y0)*u*.5;if(!roamHit(x,z,.4,y)){c.set(x,y,z);ok=1}}
  if(!ok){c.set(RO.x-Math.sin(RO.h)*2.5,Math.max(y0,RO.y+6),RO.z-Math.cos(RO.h)*2.5)}camera.lookAt(RO.x+Math.sin(RO.h)*6,RO.y+1.5,RO.z+Math.cos(RO.h)*6)})(roamCam);

// QA4: 30 % more time on every timed story / quest stage
qvEnter=(f=>function(ch,i){const r=f.apply(this,arguments);try{const V=ch&&ch.v2,S=V&&V.L.st[V.si];if(S&&S.T&&V.left>0&&!S.qaT){S.qaT=1;V.left*=1.3}}catch(e){}return r})(qvEnter);
// QA5: thinner Athens traffic (cars parked dead stay hidden; hubTrafficStep never revives dead=1e9)
buildHubTraffic=(f=>function(){const r=f.apply(this,arguments);if(CID!=='fra'&&HUB.cars)HUB.cars.forEach((c,i)=>{if(i%5>1)c.dead=1e9});return r})(buildHubTraffic);
/* ===== QA7 · rotation-proof touch controls (iPhone: "after portrait→landscape the buttons are very unresponsive") =====
   iOS Safari does not always send touchcancel for fingers that were down while the phone rotates. The steering pad and the ◀ ▶ zone
   then keep a stale touch id (TOUCH.sid / TOUCH.bz) and ignore every new touch ("if(TOUCH.bz!=null)return"), and GAS / BRAKE / BOOST
   can stay latched. iOS also reports the old innerWidth/innerHeight for a few hundred ms after orientationchange, so the renderer and
   the steer pad were sized for the old orientation. Fix: (1) every touchstart first drops any stored touch id that is no longer among
   the active touches; (2) on orientationchange / a portrait↔landscape resize all touch state is released and the layout is re-run at
   0, 120, 350 and 800 ms. */
const QA7={o:null,resets:0};
function QA7_release(){TOUCH.sid=null;TOUCH.bz=null;TOUCH.target=0;TOUCH.steer=0;TOUCH.lock=0;TOUCH.gas=false;TOUCH.brake=false;TOUCH.boost=false;TOUCH.hb=false;
  try{bzSet(0)}catch(e){}document.querySelectorAll('#touch .down').forEach(e=>e.classList.remove('down'));try{SZ.classList.remove('on')}catch(e){}QA7.resets++}
function QA7_relayout(){try{resize()}catch(e){}try{if(TOUCH.sid==null)steerHome()}catch(e){}}
addEventListener('touchstart',e=>{const act=new Set([...e.touches].map(t=>t.identifier));if(TOUCH.sid!=null&&!act.has(TOUCH.sid)){TOUCH.sid=null;TOUCH.target=0;try{SZ.classList.remove('on')}catch(_){}}
  if(TOUCH.bz!=null&&!act.has(TOUCH.bz)){TOUCH.bz=null;try{bzSet(0)}catch(_){}}},{capture:true,passive:true});
function QA7_rot(){QA7_release();for(const t of[0,120,350,800])setTimeout(QA7_relayout,t)}
addEventListener('orientationchange',QA7_rot);
addEventListener('resize',()=>{const o=innerWidth>innerHeight;if(QA7.o!==null&&o!==QA7.o)QA7_rot();QA7.o=o});
if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',QA7_rot);

/* ===== QA8 · no giants, fewer rings (owner after v82: "There are still giants, way too many rings in the city") =====
   (1) Every minifig the game builds (minifig(): quest givers at markers, event hosts, passengers, pilots, goon riders…) is tagged, and
       once a second any tagged figure in the world taller than 2.2 m is scaled down to 1.85 m (an adult next to a 4.5 m car / 3 m storey).
       window.__qaHumans() lists every humanoid type near the car with its height (pavement peds included).
   (2) Free roam draws only the nearest on-the-go event ring (the otg2 "E" torus) instead of one at every event spot in range; quest /
       event markers away from the route lose their ground ring beyond 160 m. Event gates and checkpoint rings are untouched (they only
       exist while an event runs). */
minifig=(f=>function(){const g=f.apply(this,arguments);g.userData.qaFig=1;return g})(minifig);
const QA8={t:0,fixed:0};
function QA8_h(o){const B=new THREE.Box3();o.updateMatrixWorld(true);o.traverseVisible(c=>{if(c.isMesh&&c.geometry&&!(c.userData&&c.userData.ex)){if(!c.geometry.boundingBox)c.geometry.computeBoundingBox();B.union(c.geometry.boundingBox.clone().applyMatrix4(c.matrixWorld))}});return B.isEmpty()?0:B.max.y-B.min.y}
function QA8_figs(){const L=[];const root=RO&&RO.grp?scene:null;if(!root)return L;scene.traverse(o=>{if(o.userData&&o.userData.qaFig&&o.parent)L.push(o)});return L}
function QA8_kind(o){for(let a=o;a;a=a.parent){if(pl&&a===pl.mesh)return'driver/pilot on player car';for(const m of RO.marks||[])if(m.g===a)return'marker '+m.kind;if(typeof M1!=='undefined'&&M1.goons&&M1.goons.some(g=>g.m===a))return'mission goon rider'}return'mission/other figure'}
function QA8_step(dt){QA8.t+=dt;if(QA8.t<1)return;QA8.t=0;for(const o of QA8_figs()){if(!o.visible)continue;const h=QA8_h(o);if(h>2.2&&!(pl&&pl.mesh&&QA8_kind(o).startsWith('driver'))){o.scale.multiplyScalar(1.85/h);QA8.fixed++}}}
window.__qaHumans=(r=160)=>{const out={};const put=(k,h)=>{if(!h)return;out[k]=Math.max(out[k]||0,+h.toFixed(2))};
  for(const o of QA8_figs()){if(!o.visible)continue;const p=new THREE.Vector3();o.getWorldPosition(p);if(Math.hypot(p.x-RO.x,p.z-RO.z)>r)continue;put(QA8_kind(o),QA8_h(o))}
  try{const S=SC_S&&SC_S.on?SC_K.ped:.66;if(HUB.peds&&HUB.peds.length)put('pavement pedestrian',(1.25+.32+1.4+.96+.25)*S)}catch(e){}
  try{if(window.__sc&&__sc.humans){const h=__sc.humans();if(h.driver)put('garage driver (seated, standing height)',h.driver);if(h.moped)put('moped goon rider',h.moped)}}catch(e){}
  return{heights:out,fixed:QA8.fixed}};
// rings: only the nearest otg2 event ring
{const f0=OG_draw;OG_draw=function(){if(OG.vis&&state==='roam'&&!OG.ev){let best=null,bd=1e9;for(const sp of OG.vis)if(sp.k==='ev'&&!OG_done(sp)){const d=Math.hypot(sp.x-RO.x,sp.z-RO.z);if(d<bd){bd=d;best=sp}}const keep=OG.vis;OG.vis=keep.filter(sp=>sp.k!=='ev'||sp===best);try{return f0.apply(this,arguments)}finally{OG.vis=keep}}return f0.apply(this,arguments)}}
// quest / event marker ground rings fade out beyond 160 m (the minimap and the NEXT arrow still show them)
roamHud=(f=>function(){const r=f.apply(this,arguments);if(RO.on&&RO.marks&&((QA8.mk=(QA8.mk||0)+1)%15===0))for(const m of RO.marks){if(!m.ring)continue;const near=Math.hypot(m.x-RO.x,m.z-RO.z)<160||m===RO.wp;m.ring.visible=near}QA8_step(1/4);return r})(roamHud);

// ---- v85: clean phone HUD, road spawn, objective line (module v85.js; patch pV85.py)
(function(){
const css=`
body.v85 #roamStuds,body.v85 #roamExit,body.v85 #roamMapBtn,body.v85 #roamVeh,body.v85 #roamHorn,body.v85 #roamCamBtn,body.v85 #roamLogBtn,body.v85 #roamSetBtn,body.v85 #roamEv,body.v85 #roamHint,
body.v85 #rgBar,body.v85 #rgHull,body.v85 #rgGb,body.v85 #rgTip,body.v85 #roamCombo,body.v85 #tF,body.v85 #steerHint{display:none!important}
body.v85[data-mode=roam]:not(.v85b) #roamTop,body.v85[data-mode=roam]:not(.v85b) #m1Next,body.v85[data-mode=roam]:not(.v85b) #raceW,body.v85[data-mode=roam]:not(.v85b) #qTrk,body.v85[data-mode=roam]:not(.v85b) #roamPlate,body.v85[data-mode=roam]:not(.v85b) #ogHud,body.v85[data-mode=roam]:not(.v85b) #ogArea{display:none!important}
body.v85 #roamGauge{background:rgba(10,14,28,.55);border-radius:16px;padding:2px 12px}
body.v85 #roamArrow{display:flex;align-items:center;gap:6px;font-size:15px!important;font-weight:800;color:#fff;background:rgba(10,14,28,.62);border-radius:14px;padding:4px 14px;max-width:60vw!important;text-shadow:0 1px 2px #000}
body.v85 #roamArrow i{font-size:15px}
#touch,#btnZone,.tbtn{touch-action:none}
#roamFT{z-index:40;pointer-events:auto;bottom:auto;top:calc(10px + env(safe-area-inset-top,0px))}
body:not([data-mode=roam]) #ogHud,body:not([data-mode=roam]) #ogArea{display:none!important}
#itemBox{right:auto!important;left:calc(50% - clamp(24px,5.5vh,32px))!important;top:calc(60px + env(safe-area-inset-top,0px))!important}

body.v85 #roamPop{top:calc(64px + env(safe-area-inset-top,0px));min-width:0;padding:3px 12px;border-radius:14px;background:rgba(10,14,28,.62);box-shadow:none}body.v85 #roamPop h5{display:inline;font-size:12px;margin-right:6px}body.v85 #roamPop span{display:inline;font-size:12px}body.v85 #roamPop div,body.v85 #roamPop small{display:none}
body.v85 #tL{left:max(28px,calc(16px + env(safe-area-inset-left,0px)))!important}body.v85 #tR{left:calc(max(28px,16px + env(safe-area-inset-left,0px)) + 14px + clamp(68px,24vh,96px))!important}
body.v85 #tG,body.v85 #tN{right:max(28px,calc(14px + env(safe-area-inset-right,0px)))!important}body.v85 #tP{left:max(28px,calc(10px + env(safe-area-inset-left,0px)))!important}body.v85.touch #hTime{left:calc(max(28px,calc(10px + env(safe-area-inset-left,0px))) + 58px)!important}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);document.body.classList.add('v85');

// off-road limit while a timed quest or sprint race runs: stay on a street, the quest route, or near a gate
let v85offT=0;
function v85Off(dt){let target=1;try{const q=RO.ch&&RO.ch.v2,sp=RO.sp;if((q||sp)&&!RO.onAB&&!(pl&&pl.air)&&!RO.frozen){const x=RO.x,z=RO.z,c=cityAt(x,z);let free=!!c&&c.d<c.road.w/2+9;
   if(!free&&q){const st=q.L.st[q.si||0],P=st&&st.R&&st.R.P;if(P)for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2)),ex=ax+dx*t-x,ez=az+dz*t-z;if(ex*ex+ez*ez<324){free=true;break}}}
   if(!free&&sp&&sp.G)for(const g of sp.G)if(g&&Number.isFinite(g.x)&&(g.x-x)**2+(g.z-z)**2<900){free=true;break}
   if(!free)target=.87}}catch(e){}
  RO.v85o=(RO.v85o==null?1:RO.v85o)+(target-(RO.v85o==null?1:RO.v85o))*Math.min(1,dt*2);
  if(target<1&&Math.abs(RO.v)>12){v85offT-=dt;if(v85offT<=0){v85offT=3.5;feed('OFF ROUTE · SLOWED',0,'#ff7a3c')}}
  return RO.v85o}
window.v85Off=v85Off;
// verbs for the one objective line
window.v85Verb=function(ch){if(!ch)return'';const k=ch.kind;{const V=ch.v2,S=V&&V.L&&V.L.st&&V.L.st[V.si];/* BG23: story stages say what to do (was 'Deliver' for every M1 stage) */if(k==='m1'&&S){const w={follow:'Follow',tail:'Tail',thieves:'Ram',goons:'Ram',survive:'Fight',chase:'Catch',booths:'Smash',tower:'Smash',chain:'Smash',push:'Push',jumpR:'Jump',driftzone:'Drift'}[S.t];if(w)return w}}return({speed:'Radar',chase:'Catch',drift:'Drift',longjump:'Jump',smash:'Smash',m1:'Go'}[k])||'Go'};
// brief overlays: the mission / district / result cards show for 5 s at start and end, then get out of the way
let brief=0,lastCh=null,lastRes=false,lastPlate='';const bc=document.body.classList;
function v85tick(dt){try{if(RO.ch)v85Road(RO.ch);
 if(RO.v85w>0&&!RO.card&&!RO.story&&!RO.frozen&&!RO.mapOpen&&!(TOUCH.brake||K.ArrowDown||K.KeyS)){RO.v85w-=dt;RO.v=Math.max(RO.v,12)}const ch=!!(RO.ch||RO.sp),res=!!document.querySelector('#chRes:not([hidden])'),pl2=(document.querySelector('#roamPlate')||{}).textContent||'';
 if(lastCh===null){brief=5}else if(ch!==lastCh||res&&!lastRes||pl2!==lastPlate)brief=Math.max(brief,5);
 lastCh=ch;lastRes=res;lastPlate=pl2;if(res)brief=Math.max(brief,2);
 if(RO.card||RO.mapOpen||RO.jOpen)brief=Math.max(brief,.1);
 brief=Math.max(0,brief-dt);const on=brief>0;if(on!==bc.contains('v85b'))bc.toggle('v85b',on)}catch(e){}}
// road under the start: the hot-drop run begins on bare plaza paving. When a quest starts, lay a dark asphalt ribbon (white lane markings) along the first straight
// stretch of its route, face the car down it and let it roll. Visual only: no collision.
const V=window.__v85={};let ribbon=null;
function v85Road(ch){try{const q=ch&&ch.v2;if(!q||q._v85)return;q._v85=1;const st=q.L.st[q.si||0],P=st&&st.R&&st.R.P;if(!P||P.length<4)return;
 const a0=Math.atan2(P[1][0]-P[0][0],P[1][1]-P[0][1]),pts=[{x:P[0][0],z:P[0][1]}];let L=0;
 for(let i=1;i<P.length&&L<420;i++){const dx=P[i][0]-P[i-1][0],dz=P[i][1]-P[i-1][1];if(Math.abs(angDiff(Math.atan2(dx,dz),a0))>.35)break;const n=Math.max(1,Math.round(Math.hypot(dx,dz)/8));for(let k=1;k<=n;k++)pts.push({x:P[i-1][0]+dx*k/n,z:P[i-1][1]+dz*k/n});L+=Math.hypot(dx,dz)}
 if(pts.length<6)return;let s=0;const tx=Math.sin(a0),tz=Math.cos(a0);pts.forEach((p,i)=>{p.tx=tx;p.tz=tz;p.s=i*8});
 // start 12 m behind the car so the car is already on it
 const b={x:pts[0].x-tx*12,z:pts[0].z-tz*12,tx,tz,s:-12};pts.unshift(b);
 if(ribbon){ribbon.parent&&ribbon.parent.remove(ribbon);ribbon.geometry.dispose()}
 const mat=new THREE.MeshStandardMaterial({map:HUB.M.road.map,roughness:.85,metalness:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
 ribbon=new THREE.Mesh(abStrip(pts,0,pts.length-1,-8,8,.34,.34,32),mat);ribbon.receiveShadow=true;ribbon.frustumCulled=false;(HUB.grp||scene).add(ribbon);
 // facing along the route, already rolling
 if(Math.hypot(RO.x-P[0][0],RO.z-P[0][1])<40&&Math.abs(RO.v)<6){RO.h=RO.vh=a0;RO.yr=0;RO.v=13;camSnap=true;RO.v85w=4}
 V.road={n:pts.length,a0,L}}catch(e){V.err=String(e&&e.stack||e)}}
roamStep=(f=>function(dt){f(dt);v85tick(dt)})(roamStep);

// ---- power-ups (2K Drive style): GHOST, TELEPORT, WEB CRASHER + bold coloured icons for every item
Object.assign(ITEMS,{ghost:{name:'GHOST',col:'#9fd8ff'},teleport:{name:'TELEPORT',col:'#c46bff'},web:{name:'WEB CRASHER',col:'#e8f3ff'}});for(const k of['ghost','teleport','web'])if(!ITEM_KEYS.includes(k))ITEM_KEYS.push(k);
const V85_EM={emp:'⚡',rail:'🎯',turbo:'🔥',rockets:'🚀',missile:'🎯',mines:'💣',shield:'🛡️',tornado:'🌪️',wall:'🧱',storm:'⛈️',magnet:'🧲',oil:'🛢️',ghost:'👻',teleport:'🌀',web:'🕸️'},V85_IC={};
itemIcon=function(k){if(V85_IC[k])return V85_IC[k];const[c,g]=cv(96,96),col=(ITEMS[k]||{col:'#fff'}).col;const gr=g.createLinearGradient(0,0,0,96);gr.addColorStop(0,col);gr.addColorStop(1,'#141826');g.fillStyle=gr;g.beginPath();const r=20;g.moveTo(r,4);g.lineTo(96-r,4);g.quadraticCurveTo(92,4,92,r);g.lineTo(92,96-r);g.quadraticCurveTo(92,92,96-r,92);g.lineTo(r,92);g.quadraticCurveTo(4,92,4,96-r);g.lineTo(4,r);g.quadraticCurveTo(4,4,r,4);g.closePath();g.fill();g.lineWidth=4;g.strokeStyle='rgba(255,255,255,.85)';g.stroke();
 g.font='54px "Apple Color Emoji","Segoe UI Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(V85_EM[k]||'?',48,52);return V85_IC[k]=c.toDataURL()};
pickItem=(f=>function(s){const act=ships.filter(o=>!o.eliminated),n=act.length||1;const p=n>1?clamp(((s.place||Math.ceil(n/2))-1)/(n-1),0,1):.5;const r=R();
  if(p>.4&&r<.16+p*.14)return'teleport';if(r<.34)return'ghost';if(r<.5)return'web';return f.apply(this,arguments)})(pickItem);
function V85_item(it,s){const at=s.mesh.position.clone().add(s.mesh.userData.m.position);
  if(it==='ghost'){s.shield=Math.max(s.shield,4.5);s.ghostT=4.5;s.boost=Math.max(s.boost,.7);burst(SPARK,at,40,26,.6,new THREE.Color(1.2,2,2.8));if(s.isPlayer){AU.sfx('shield');say('','GHOST · nothing can touch you',1.1);feed('GHOST',0,'#9fd8ff')}}
  else if(it==='teleport'){burst(SPARK,at,90,50,.7,new THREE.Color(1.8,.8,2.8));burst(FIRE,at,12,30,.5,new THREE.Color(1.6,.5,2.4));s.dist+=130;s.inv=Math.max(s.inv,.6);if(s.isPlayer){AU.sfx('boost');flash=.55;shake=Math.max(shake,.5);fovKick=Math.max(fovKick,12);say('','TELEPORT!',.9);feed('TELEPORT +130 m',0,'#c46bff')}}
  else if(it==='web'){let tgt=null,bd=520;for(const o of ships){if(o===s||o.dead>0||o.eliminated||o.finished)continue;const dd=tdd(o.dist,s.dist);if(dd>0&&dd<bd){bd=dd;tgt=o}}
    if(tgt){tgt.webT=4.5;burst(SPARK,tgt.mesh.position.clone().add(tgt.mesh.userData.m.position),50,24,.6,new THREE.Color(2.4,2.4,2.6));if(tgt.isPlayer){flash=.3;AU.sfx('hit')}if(s.isPlayer){AU.sfx('missile');feed('WEB HIT',200,'#e8f3ff')}}else if(s.isPlayer)feed('WEB MISS',0,'#e8f3ff')}}
useItem=(f=>function(s){const it=s.item;if(it==='ghost'||it==='teleport'||it==='web'){if(s.isPlayer&&performance.now()<itemSpinUntil)return;s.item=null;try{V85_item(it,s)}catch(e){console.warn('v85 item',e)}return}return f.apply(this,arguments)})(useItem);
// per-step: web slows and blinds, ghost turns the car see-through
const V85W=document.createElement('div');V85W.id='v85web';V85W.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:3;opacity:0;transition:opacity .2s;background:radial-gradient(circle at 50% 50%,transparent 18%,rgba(240,246,255,.55) 70%),repeating-conic-gradient(from 0deg at 50% 50%,rgba(255,255,255,.75) 0 .7deg,transparent .7deg 15deg),repeating-radial-gradient(circle at 50% 50%,transparent 0 46px,rgba(255,255,255,.6) 46px 49px)';document.body.appendChild(V85W);
stepTraffic=(f=>function(){f.apply(this,arguments);if(state!=='race')return;try{for(const s of ships){if(s.webT>0){s.webT-=H;s.v*=1-.35*H}if(s.ghostT>0)s.ghostT-=H;const gh=s.ghostT>0;if(gh&&!s._gh){s._gh=1;s.mesh.traverse(o=>{if(o.isMesh&&o.material&&!o.userData._om&&!Array.isArray(o.material)){o.userData._om=o.material;const m=o.material.clone();m.transparent=true;m.opacity=.35;o.material=m}})}
   else if(!gh&&s._gh){s._gh=0;s.mesh.traverse(o=>{if(o.userData&&o.userData._om){o.material=o.userData._om;o.userData._om=null}})}}
  const w=pl&&pl.webT>0;V85W.style.opacity=w?Math.min(1,pl.webT/1.2):0}catch(e){}})(stepTraffic);
// rings: free roam shows only the nearest event ring, plus golden/collect rings within 70 m
OG_draw=(f=>function(){if(!OG.ev&&OG.vis&&state==='roam'){let best=null,bd=1e9;for(const sp of OG.vis)if(sp.k==='ev'){const d=Math.hypot(sp.x-RO.x,sp.z-RO.z);if(d<bd){bd=d;best=sp}}const keep=OG.vis;OG.vis=keep.filter(sp=>sp.k==='ev'?sp===best:Math.hypot(sp.x-RO.x,sp.z-RO.z)<70);try{return f.apply(this,arguments)}finally{OG.vis=keep}}return f.apply(this,arguments)})(OG_draw);
// a roam event must not survive into a race or the menu (stale GHOST RACE panel + RETRY)
exitRoam=(f=>function(){try{if(OG.ev)OG_end(null,1)}catch(e){}return f.apply(this,arguments)})(exitRoam);
setupRace=(f=>function(cfg){try{if(cfg&&cfg.type!=='roam'&&OG.ev)OG_end(null,1)}catch(e){}return f.apply(this,arguments)})(setupRace);

})();

