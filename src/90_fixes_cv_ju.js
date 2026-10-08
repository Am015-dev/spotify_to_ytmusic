// ===== OB (owner bugs): burst cause log + phantom-burst fixes
// every debris / stud burst / transform burst is logged with the function that fired it (cause); bursts fire only from real hits, pickups or real vehicle switches
const OB={log:[],on:false,n:0,unc:0,sw:[],off:(()=>{try{return localStorage.getItem('ob_off')==='1'}catch(e){return false}})()};  // ob_off=1: old behaviour (for before/after measurements)
function OB_who(){const L=(new Error().stack||'').split('\n').slice(2);if(L.some(l=>/AU_fountain/.test(l)))return'smashCheck';for(const l of L){const m=l.match(/at (?:[\w$]+\.)*([\w$]+) \(/);if(m&&!/^(OB_|debris$|studBurst$|burst$|AU_fountain$|forEach$|map$|apply$|call$)/.test(m[1]))return m[1]}return '?'}
function OB_prop(at){if(!at||!HUB.pgrid)return null;const L=HUB.pgrid.get(Math.floor(at.x/16)*10000+Math.floor(at.z/16))||[];for(const p of L)if(Math.abs(p.x-at.x)<.01&&Math.abs(p.z-at.z)<.01){let v=true;for(let o=p.im;o;o=o.parent)if(!o.visible)v=false;return{t:p.t,vis:v,dy:+(p.y-groundY(p.x,p.z)).toFixed(1),py:+p.y.toFixed(1),ry:+RO.y.toFixed(1)}}return null}
function OB_rec(k,at){OB.n++;OB.n0=OB.n0||0;if(!OB.on)return;const w=OB_who(),d=at?Math.round(Math.hypot(at.x-RO.x,at.z-RO.z)):-1;const hit=OB.hit&&OB.hit.f===OB.n0?OB.hit.k:null;OB.log.push({k,w,hit,hp:Math.round(RO.hp??100),wk:!!RO.wk,ch:RO.ch?(RO.ch.t||RO.ch.kind||1):0,p:k==='debris'&&w==='smashCheck'?OB_prop(V3(at.x,0,at.z)):undefined,x:Math.round(RO.x),z:Math.round(RO.z),d,st:state,t:+FL.clk.toFixed(2)});if(OB.log.length>400)OB.log.shift()}
debris=(f=>function(at){OB_rec('debris',at);return f.apply(this,arguments)})(debris);
studBurst=(f=>function(at){OB_rec('stud',at);return f.apply(this,arguments)})(studBurst);
FL_burst=(f=>function(v){OB.sw.push({v,s:FL.s,x:Math.round(RO.x),z:Math.round(RO.z),t:+FL.clk.toFixed(2)});if(OB.sw.length>60)OB.sw.shift();return f.apply(this,arguments)})(FL_burst);
window.__ob=Object.assign(window.__ob||{},{halfW:(x,z)=>{const q=cityAt(x,z);return q?q.road.w/2:6},near:()=>({cars:OB.cm.size,props:OB.pm.size}),get B(){return OB},logOn:v=>{OB.on=v!==false;OB.log=[];OB.sw=[];OB.cm.clear();OB.pm.clear()},get FL(){return FL}});
// ---- fix 1 · auto vehicle switch: wide hysteresis band so road ↔ pavement ↔ grass verge never flips the vehicle.
// leave the road only ≥ OB_LEAVE m past the road edge (pavement, verges, kerbs stay "road"); re-enter at ≤ 2.5 m;
// the new surface must hold for OB_HOLD s AND ≥ OB_DIST m of travel; at least OB_MINHOLD s between switches; never mid-air.
const OB_LEAVE=14,OB_HOLD=.15,OB_DIST=3,OB_MINHOLD=1.2;
const OB_raw0=FL_raw,OB_terr0=FL_terr;
if(!OB.off)FL_raw=function(T0,ground){if(T0.deck)return'road';if(ground<-1.5)return'water';return FL_road(RO.x,RO.z,FL.s==='road'?OB_LEAVE:2.5)?'road':'dirt'};
if(!OB.off)FL_terr=function(T0,ground,dt=1/60){const raw=FL_raw(T0,ground),air=RO.y>ground+.5;FL.lastSurf=raw;FL.hold=Math.max(0,FL.hold-dt);
  if(FL.s==null){FL.s=raw;FL.cand=raw}
  if(!air&&raw!==FL.s){if(raw!==FL.cand){FL.cand=raw;FL.cT=0;FL.cD=0}FL.cT+=dt;FL.cD=(FL.cD||0)+Math.abs(RO.v)*dt;
    if(FL.cT>=OB_HOLD&&(FL.cD>=OB_DIST||raw==='water')&&FL.hold<=0){FL.s=raw;FL.hold=OB_MINHOLD;FL.cT=0;FL.cD=0}}
  else if(!air){FL.cand=FL.s;FL.cT=0;FL.cD=0}
  return raw};
// ---- fix 2 · contact tests: the old checks were circles (props: r+2.1 m, traffic: 5 m) so passing a lamp, bin or a car in the next lane
// 1–3 m away "smashed" it with a full brick burst. Now: the car's real footprint (oriented box) must touch the prop / the other car's box.
const OB_HW=1.25,OB_HL=2.45;
function OB_touch(px,pz,r,ox=RO.x,oz=RO.z,oh=RO.h){const dx=px-ox,dz=pz-oz,s=Math.sin(oh),c=Math.cos(oh),a=dx*s+dz*c,b=dx*c-dz*s;
  const qa=Math.max(0,Math.abs(a)-OB_HL),qb=Math.max(0,Math.abs(b)-OB_HW);const g=Math.hypot(qa,qb),ok=g<r+.25;if(ok)OB.hit={k:'prop',f:OB.fr};else OB.pm.add(px*7919+pz);return ok||OB.off}
function OB_obb(ax,az,ah,aw,al,bx,bz,bh,bw,bl){const A=[[Math.sin(ah),Math.cos(ah)],[Math.cos(ah),-Math.sin(ah)]],B=[[Math.sin(bh),Math.cos(bh)],[Math.cos(bh),-Math.sin(bh)]],d=[bx-ax,bz-az];
  for(const u of[...A,...B]){const ra=al*Math.abs(A[0][0]*u[0]+A[0][1]*u[1])+aw*Math.abs(A[1][0]*u[0]+A[1][1]*u[1]),rb=bl*Math.abs(B[0][0]*u[0]+B[0][1]*u[1])+bw*Math.abs(B[1][0]*u[0]+B[1][1]*u[1]);if(Math.abs(d[0]*u[0]+d[1]*u[1])>ra+rb+.2)return false}return true}
const OB_cdim=k=>{const n=HCAR[k]||'';return n==='#troll'?[1.4,6]:n==='#scoot'?[.5,1.1]:/truck|delivery|van/.test(n)?[1.3,3.3]:[1.15,2.4]};
function OB_car(x,z,dx,dz,c){const k=c.k,[w,l]=OB_cdim(k),r=OB_obb(RO.x,RO.z,RO.h,OB_HW,OB_HL,x,z,Math.atan2(dx,dz),w,l);if(r)OB.hit={k:'car',f:OB.fr};else OB.cm.add(c);return r||OB.off}
function OB_carP(k,P){const N=HUB.nodes,A=N[k.a],B=N[k.b];const h=A&&B?Math.atan2(B.x-A.x,B.z-A.z):0;const[w,l]=OB_cdim(k.k);return OB_obb(P.x,P.z,P.h??RO.h,OB_HW,OB_HL,k.x,k.z,h,w,l)}
OB.cm=new Set();OB.pm=new Set();OB.fr=0;
// frame counter for the contact flag (a burst is 'with contact' when a contact test passed in the same sim step)
roamStep=(f=>function(dt){OB.fr++;OB.n0=OB.fr;return f.apply(this,arguments)})(roamStep);

// OB: Euro-Skulptur (Willy-Brandt-Platz) rebuilt as a readable € sign: blue C arc (~300°, open to the right), two yellow bars
// reaching left past the arc, on a neck + plinth, ringed by 12 yellow five-pointed stars (EU flag), ~14 m tall.
// Everything is merged into ONE vertex-coloured geometry added to the landmark batch (BM.plain) -> no extra draw call.
let OB_EURO=null;
// Base height = what TR_bldFix computes for the collider footprint (max(min,max-.8) of 9 ground samples), so its terrain lift is 0:
// the base game lifted only the vertices near the 2x2 collider (the old arc/stars got sheared = the "weird shape").
const OB_EURO_HW=3.4,OB_EURO_HD=2.1;
function OB_euroBuild(bt,BM,x,z){const GY=(a,b)=>(typeof groundY==='function'?groundY(a,b):0)||0,P=[];for(const u of[-1,0,1])for(const v of[-1,0,1])P.push(GY(x+u*OB_EURO_HW,z+v*OB_EURO_HD));
 const gy=Math.max(Math.min(...P),Math.max(...P)-.8),C=c=>new THREE.Color(c),GS=[];
 const put=(g,col)=>{g=g.index?g.toNonIndexed():g;g.clearGroups();for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));colorize(g,C(col));GS.push(g);return g};
 const BLUE='#1d3fb8',YEL='#ffc81e',STONE='#9a9ea6';
 const PH=1.0,CY=7.4,RO=4.2,RI=2.85,DEP=1.2,GAP=.62,RS=6.0,SR=.58;
 // plinth + step + neck
 {const g=new THREE.BoxGeometry(5.2,PH,3.2);g.translate(0,PH/2,0);put(g,STONE)}
 {const g=new THREE.BoxGeometry(6.4,.25,4.2);g.translate(0,.125,0);put(g,'#c8c4ba')}
 {const g=new THREE.BoxGeometry(1.3,CY-RO-PH+.4,1.0);g.translate(0,PH+(CY-RO-PH+.4)/2,0);put(g,'#2a3550')}
 // the C arc (flat-faced extrusion like the glyph), opening to +x
 {const s=new THREE.Shape(),a0=GAP,a1=Math.PI*2-GAP;s.absarc(0,0,RO,a0,a1,false);s.lineTo(Math.cos(a1)*RI,Math.sin(a1)*RI);s.absarc(0,0,RI,a1,a0,true);s.lineTo(Math.cos(a0)*RO,Math.sin(a0)*RO);
  const g=new THREE.ExtrudeGeometry(s,{depth:DEP,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:1,curveSegments:40});g.translate(0,CY,-DEP/2);put(g,BLUE)}
 // two horizontal bars, extending left past the arc
 for(const o of[-.95,.95]){const g=new THREE.BoxGeometry(7.0,.72,DEP+.36);g.translate(-1.75,CY+o,0);put(g,YEL)}
 // 12 five-pointed stars on a circle in the same vertical plane (slightly in front, readable from both sides)
 {const st=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?SR*.4:SR,a=Math.PI/2+i*Math.PI/5;i?st.lineTo(Math.cos(a)*r,Math.sin(a)*r):st.moveTo(Math.cos(a)*r,Math.sin(a)*r)}
  for(let k=0;k<12;k++){const a=Math.PI/2-k*Math.PI/6,g=new THREE.ExtrudeGeometry(st,{depth:.28,bevelEnabled:false});g.translate(Math.cos(a)*RS,CY+Math.sin(a)*RS,-.14);put(g,YEL)}}
 const m=mergeGeometries(GS,false);m.translate(x,gy,z);m.computeBoundingBox();
 OB_EURO={x,z,gy,hw:OB_EURO_HW,hd:OB_EURO_HD,mesh:new THREE.Mesh(m),parts:GS.length};bt.add(m,BM.plain);return OB_EURO}
window.__ob=Object.assign(window.__ob||{},{euro:()=>{if(!OB_EURO)return null;const b=new THREE.Box3().setFromObject(OB_EURO.mesh),s=b.getSize(new THREE.Vector3());
 return{x:OB_EURO.x,z:OB_EURO.z,gy:+OB_EURO.gy.toFixed(2),min:b.min.toArray().map(v=>+v.toFixed(2)),size:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)],parts:OB_EURO.parts,drawCalls:1,extraDrawCalls:0,verts:OB_EURO.mesh.geometry.attributes.position.count}}});

// ===== OC (owner bugs 2): soft night lights, real-scale Acropolis, height fixes, nothing standing on the roads
const OC={dropT:{},pool:null,lamps:[],acro:null,moved:0,dropped:0,sunk:0,scaled:{},skip:/^(parthenon|erechtheion|propylaea|odeon)$/};
// ---------- 1 · night lights. Headlights: one faint additive fan per car that fades along its length and to its edges (peak +0.24 after
// FL's 2.4x night colour, no hard polygon); street lamps: a small bulb under each head + a warm radial pool on the ground (one draw call)
function OC_beamGeo(){const NL=14,NW=8,L=20,P=[],C=[],I=[];
  for(let i=0;i<=NL;i++){const t=i/NL,z=2.3+t*L,hw=.95+t*L*.3,f=Math.min(1,t/.06)*(1-t)*(1-t);for(let j=0;j<=NW;j++){const u=j/NW*2-1,g=(1-u*u)*(1-u*u),k=.1*f*g;P.push(u*hw,.16,z);C.push(k,k*.93,k*.78)}}
  for(let i=0;i<NL;i++)for(let j=0;j<NW;j++){const a=i*(NW+1)+j,b=a+1,c=a+NW+1,d=c+1;I.push(a,c,b,b,c,d)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(P.length/3*2).fill(0),2));g.computeVertexNormals();return g}
FL_headlights=function(n){if(!HUB.grp||!HUB.cars)return;let H=FL.hl;const N=HUB.cars.length+1;
  if(!H||H.parent!==HUB.grp||H.count<N){if(H&&H.parent)H.parent.remove(H);
    const L=[cbox(.42,.26,.12,-.72,.85,2.25,'#fff6d8'),cbox(.42,.26,.12,.72,.85,2.25,'#fff6d8'),cbox(.36,.2,.1,-.74,.9,-2.25,'#ff2a20'),cbox(.36,.2,.1,.74,.9,-2.25,'#ff2a20')];L.push(OC_beamGeo());
    const mat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,color:0x000000,fog:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
    H=FL.hl=new THREE.InstancedMesh(mergeG(L),mat,N+8);H.frustumCulled=false;H.renderOrder=2;HUB.grp.add(H);H.userData.keep=1;H.userData.oc=1}
  H.material.color.setScalar(2.4*n);let j=0;
  if(pl&&RO.on){FL_hq.setFromAxisAngle(FL_hy,RO.h);FL_hm.compose(FL_hv.set(RO.x,RO.y,RO.z),FL_hq,FL_hs.set(1.2,1.2,1.25));H.setMatrixAt(j++,FL_hm)}
  for(const c of HUB.cars){if(c.dead>0)continue;const im=HUB.cim[c.k];if(!im)continue;im.getMatrixAt(c.j,FL_hm);H.setMatrixAt(j++,FL_hm)}
  H.count=j;H.instanceMatrix.needsUpdate=true;OC_poolStep(n)};
// radial pool: 6 concentric discs (radius 1 .. 0.2) merged into one geometry, each adding 1/6 of the light: a soft stepped falloff to the rim
function OC_poolGeo(){const L=[];for(let k=0;k<6;k++){const r=.5*(1-k*.16);L.push(new THREE.CircleGeometry(r,28).rotateX(-Math.PI/2).toNonIndexed())}const P=[];for(const g of L)P.push(...g.attributes.position.array);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));return g}
// lamp heads: the 1.4 m white glow ball becomes a small flattened bulb under the head; pools of light on the ground under every lamp
function OC_lampsBuild(){const D=HUB.ptypes;if(!D||!D.lamp||!HUB.lampGlow)return;const bulb=new THREE.SphereGeometry(.3,10,6);bulb.scale(1.3,.5,1);bulb.translate(0,-.3,0);
  HUB.grp.traverse(o=>{if(o.isInstancedMesh&&o.material===HUB.lampGlow)o.geometry=bulb});
  const L=OC.lamps=HUB.props.filter(p=>p.t==='lamp');if(OC.pool&&OC.pool.parent)OC.pool.parent.remove(OC.pool);OC.pool=null;if(!L.length)return;
  const g=OC_poolGeo(),mat=new THREE.MeshBasicMaterial({color:new THREE.Color(1,.74,.42),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,fog:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-6});
  const im=new THREE.InstancedMesh(g,mat,L.length),m=new THREE.Matrix4(),q=new THREE.Quaternion(),up=V3(0,1,0),nv=V3(),s=V3(10,1,10);
  L.forEach((p,i)=>{const o=D.lamp.head.clone().applyAxisAngle(up,p.ry),x=p.x+o.x*.8,z=p.z+o.z*.8,[gx,gz]=TR_grad(x,z,2.5);nv.set(-gx,1,-gz).normalize();q.setFromUnitVectors(up,nv);m.compose(V3(x,groundY(x,z)+.12,z),q,s);im.setMatrixAt(i,m);p.ocP=i});
  im.computeBoundingSphere();im.frustumCulled=false;im.renderOrder=1;im.visible=false;im.userData.keep=1;im.userData.ocPool=1;HUB.grp.add(im);OC.pool=im;OC.pm=m;OC.dead=new Set()}
function OC_poolStep(n){const P=OC.pool;if(!P)return;P.material.opacity=.04*n;OC.poolPeak=6*.04*n;P.visible=n>.02;if(!P.visible)return;OC.pt=(OC.pt||0)+1;if(OC.pt%20)return;let ch=false;
  for(const p of OC.lamps){const dead=!p.alive;if(dead===OC.dead.has(p))continue;if(dead){OC.dead.add(p);P.getMatrixAt(p.ocP,OC.pm);p.ocM=OC.pm.clone();OC.pm.makeScale(0,0,0)}else{OC.dead.delete(p);OC.pm.copy(p.ocM)}P.setMatrixAt(p.ocP,OC.pm);ch=true}if(ch)P.instanceMatrix.needsUpdate=true}
// ---------- 2 · props: nothing stands on a drivable surface (streets, filler roads, Autobahn, biome roads, trails, junctions); real heights;
// ground-placed props sit on the lowest ground under their footprint (no floating edge on slopes)
const OC_GAME=new Set(['bricks','tower','gold','cone','barrier','clight']);// smash pickups / roadworks deliberately placed on the lanes
const OC_fp=(t,D)=>t.startsWith('car')||/^CE_(car|taxi)/.test(t)?1.1:Math.min((D[t]?D[t].r:1)*.5,1.2);
function OC_roadE(x,z){let e=1e9;const r=athRoadD(x,z,48);if(r)e=r.e;const f=fillAt(x,z);if(f)e=Math.min(e,f.d-f.r.w/2);const a=abAt(x,z);if(a)e=Math.min(e,a.d-a.road.w/2);
  e=Math.min(e,lzRoadD(x,z),OC_segE(x,z));for(const J of OC_junc(x,z))e=Math.min(e,Math.hypot(J.x-x,J.z-z)-J.r);return e}
// trails and Taunus roads: exact distance to their sampled centrelines (segments), edge = half width
function OC_segE(x,z){if(!OC.sg){OC.sg=new Map();const L=[...TRAILS.map(T=>[T.pts,(T.w||12)/2])];if(CID==='fra')for(const S of mtnSamples())L.push([S.pts,6]);
    for(const[P,h]of L)for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],k=Math.floor((a.x+b.x)/2/64)*100000+Math.floor((a.z+b.z)/2/64);let A=OC.sg.get(k);if(!A)OC.sg.set(k,A=[]);A.push(a,b,h)}}
  let e=1e9;const kx=Math.floor(x/64),kz=Math.floor(z/64);for(let u=-1;u<=1;u++)for(let v=-1;v<=1;v++){const A=OC.sg.get((kx+u)*100000+kz+v);if(!A)continue;for(let j=0;j<A.length;j+=3){const a=A[j],b=A[j+1],dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz||1e-9;let t=((x-a.x)*dx+(z-a.z)*dz)/l2;t=t<0?0:t>1?1:t;e=Math.min(e,Math.hypot(a.x+dx*t-x,a.z+dz*t-z)-A[j+2])}}return e}
function OC_junc(x,z){if(!OC.jg||OC.jgn!==JUNC.length){OC.jg=new Map();OC.jgn=JUNC.length;for(const J of JUNC){if(!(J.r>0))continue;const k=Math.floor(J.x/64)*100000+Math.floor(J.z/64);let A=OC.jg.get(k);if(!A)OC.jg.set(k,A=[]);A.push(J)}}
  const out=[],kx=Math.floor(x/64),kz=Math.floor(z/64);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const A=OC.jg.get((kx+a)*100000+kz+b);if(A)out.push(...A)}return out}
function OC_minG(x,z,r){let m=groundY(x,z);for(let k=0;k<6;k++){const a=k/6*Math.PI*2;m=Math.min(m,groundY(x+Math.cos(a)*r,z+Math.sin(a)*r))}return m}
function OC_props(L,D){OC_scaleDefs(D);let j=0;for(const p of L){let ground=Math.abs(p.y-groundY(p.x,p.z))<.05;
    if(!OC_GAME.has(p.t)){const fp=OC_fp(p.t,D),m=.35;let e=OC_roadE(p.x,p.z);
      if(e<fp+m){const car=p.t.startsWith('car')||/^CE_(car|taxi)/.test(p.t);let ok=false;
        if(!car&&p.t!=='lamp'){const h=.8,gx=OC_roadE(p.x+h,p.z)-OC_roadE(p.x-h,p.z),gz=OC_roadE(p.x,p.z+h)-OC_roadE(p.x,p.z-h),gl=Math.hypot(gx,gz);
          if(gl>.1){for(const ex of[.6,2]){const s=fp+m+ex-e,x=p.x+gx/gl*s,z=p.z+gz/gl*s;if(OC_roadE(x,z)>=fp+m&&!roamHit(x,z,(D[p.t]?D[p.t].r:1)*.6)&&!inRiver(x,z,-1)){p.x=x;p.z=z;if(ground)p.y=groundY(x,z);ok=true;OC.moved++;break}}}}
        if(!ok){OC.dropped++;const k=car?'cars':/tree|olive|pine|cypress|bush/.test(p.t)?'trees':p.t==='lamp'?'lamps':'other';OC.dropT[k]=(OC.dropT[k]||0)+1;continue}}}
    const g0=groundY(p.x,p.z);if(!ground&&p.y<g0-.3&&p.y>g0-4){p.y=g0;ground=true}// buried props come up to the ground
    if(ground&&D[p.t]){const y=OC_minG(p.x,p.z,OC_fp(p.t,D));if(g0-y>1){OC.steep=(OC.steep||0)+1;continue}if(p.y-y>.05){p.y=y;OC.sunk++}p.gp=1}
    L[j++]=p}L.length=j;HUB.OC={moved:OC.moved,dropped:OC.dropped,by:OC.dropT,sunk:OC.sunk,steep:OC.steep||0};return L}
const OC_onRoad=(t,x,z)=>!OC_GAME.has(t)&&HUB.ptypes&&OC_roadE(x,z)<OC_fp(t,HUB.ptypes)+.35;
// real heights: Athens street tree 4.8 m -> 6.5 m, olive 3.7 -> 6.1 m; parked and traffic cars (toy 3.0-3.5 m tall, 5.9-6.3 m long) -> ~1.6 x 1.95 x 4.6 m
function OC_carScale(g,car){if(g.userData.oc)return;g.computeBoundingBox();const b=g.boundingBox,w=b.max.x-b.min.x,h=b.max.y-b.min.y,l=b.max.z-b.min.z;if(h<2.2)return;
  if(w<1.2){const k=1.75/h;g.scale(k,k,k)}else if(car||l<=6.4&&w>=3.2)g.scale(1.95/w,1.6/h,4.6/l);else g.scale(Math.min(1,2.5/w),Math.min(1,(h>4.5?4.2:3.4)/h),1);// cars: real size; vans, trucks, buses: real width, height capped
  g.userData.oc=1;g.computeBoundingBox();g.computeBoundingSphere()}
function OC_scaleDefs(D){const S={tree:CID==='fra'?null:[1.25,1.35,1.25],CE_olive:[1.2,1.65,1.2]};for(const t in S){const d=D[t];if(!d||!S[t]||d.g.userData.oc)continue;d.g.scale(...S[t]);d.g.userData.oc=1;OC.scaled[t]=S[t]}
  for(const t of['car','car2','car3','car4'])if(D[t]){OC_carScale(D[t].g,1);OC.scaled[t]=1}}
function OC_traffic(){for(const k in HUB.cim||{}){const im=HUB.cim[k];if(im&&im.geometry){OC_carScale(im.geometry);im.computeBoundingSphere&&im.computeBoundingSphere()}}}
// ---------- 3 · the Acropolis at real scale (1 world unit = 1 m). Plateau ~266 x 156 m (hill data), Parthenon 69.5 x 30.9 m stylobate,
// 8 x 17 Doric columns 10.43 m, entablature 3.29 m, pediments; Erechtheion + caryatid porch, Propylaea, Athena Nike on its bastion,
// Odeon of Herodes Atticus, Theatre of Dionysus; scaffolding + tower crane at the Parthenon. Offsets in metres east/north of the Parthenon
// centre (site plan + Wikipedia coordinates). Built right after the terrain fix, merged into one batch, colliders added to the grid.
const OC_AK={parth:[0,0],erech:[-15,60],propy:[-118,15],nike:[-137,-9],odeon:[-186,-88],dion:[111,-125],crane:[-6,27]};
function OC_acroBuild(){if(CID==='fra'||!HUB.grp||OC.acroG===HUB.grp)return;OC.acroG=HUB.grp;const[px,pz]=WP(80,-507);if(px<WX0+300||px>WX1-300||pz<WZS+300||pz>WZN-300)return;
  const bt=new LBatch(),BM=HUB.BM,MB='#e6d8b8',MW='#efe4cb',MD='#d4c29c',W=(e,n)=>[px-e,pz+n],cols=[],bl=[],box=(w,h,d,x,y,z,c,ry=0)=>bt.add(cbox(w,h,d,x,y+h/2,z,c,ry),BM.plain);
  const col=(x,y,z,r,h,c=MB,seg=10)=>{bt.add(ccyl(r*.8,r,h,x,y+h/2,z,c,seg),BM.plain);bt.add(cbox(r*2.1,.32,r*2.1,x,y+h-.16,z,c),BM.plain)};
  const ped=(x,y,z,span,th,h,c=MW,alongX=true)=>{const g=roofGeo(span,th,h);if(alongX)g.rotateY(Math.PI/2);g.translate(x,y,z);bt.add(colorize(g,new THREE.Color(c)),BM.plain)};
  const gmin=(x,z,hw,hd)=>{let m=1e9;for(const a of[-1,0,1])for(const b of[-1,0,1])m=Math.min(m,groundY(x+a*hw,z+b*hd));return m};
  const coll=(x,z,hw,hd,y0,top,ry)=>bl.push(hubAddB({x,z,hw,hd,h:top,y0:y0-1.5,ry}));const A={cols:0};
  // Parthenon
  {const[x,z]=W(...OC_AK.parth),SW=69.5,SD=30.9,y0=gmin(x,z,SW/2+1.5,SD/2+1.5);box(SW+6,y0-gmin(x,z,SW/2+3,SD/2+3)+.5,SD+6,x,gmin(x,z,SW/2+3,SD/2+3)-.5,z,MD);
    for(let k=0;k<3;k++)box(SW+2.8-k*1.4,.51,SD+2.8-k*1.4,x,y0+k*.51,z,k===2?MW:MB);const yb=y0+1.53,CH=10.43,ix=(SW-2)/16,iz=(SD-2)/7;
    for(let i=0;i<17;i++)for(const s of[-1,1]){col(x-SW/2+1+i*ix,yb,z+s*(SD/2-1),.95,CH);A.cols++}for(let j=1;j<7;j++)for(const s of[-1,1]){col(x+s*(SW/2-1),yb,z-SD/2+1+j*iz,.95,CH);A.cols++}
    const ye=yb+CH;for(const s of[-1,1]){box(SW,2.7,2.3,x,ye,z+s*(SD/2-1),MB);box(SW+.6,.6,2.9,x,ye+2.7,z+s*(SD/2-.9),MW);box(2.3,2.7,SD,x+s*(SW/2-1),ye,z,MB);box(2.9,.6,SD+.6,x+s*(SW/2-.9),ye+2.7,z,MW);
      ped(x+s*(SW/2-1),ye+3.3,z,SD+.6,2.2,3.7,MW);for(let i=0;i<6;i++)col(x+s*(SW/2-6),yb,z-SD/2+6+i*(SD-12)/5,.8,CH-.9)}
    for(const s of[-1,1]){let lx=-SW/2+9;for(const[len,h]of[[9,4.2],[7,2.1],[11,5.5],[6,1.4],[10,3.6]]){box(len,h,1.5,x+lx+len/2,yb,z+s*(SD/2-5.5),MD);lx+=len+1.2}}
    box(1.6,11.8,SD-11,x-SW/2+12,yb,z,MD);box(1.4,6,SD-12,x+SW/2-14,yb,z,MD);box(SW-24,.25,SD-12,x,yb,z,'#cbb994');
    // scaffolding on the west front (poles, ledgers, planks, braces)
    const sx=x+SW/2+2.2;for(let i=0;i<=13;i++){const zz=z-SD/2-1+i*(SD+2)/13;for(const o of[0,1.6])bt.add(cbox(.12,19.6,.12,sx+o,yb+8.3,zz,'#8d939a'),BM.plain)}
    for(let k=0;k<9;k++){const yy=yb+.9+k*2.1;for(const o of[0,1.6])bt.add(cbox(.1,.1,SD+2,sx+o,yy,z,'#8d939a'),BM.plain);if(k%2)bt.add(cbox(1.7,.08,SD+2,sx+.8,yy+.1,z,'#b8935a'),BM.plain)}
    for(let i=0;i<4;i++){const g=new THREE.BoxGeometry(.08,.08,11.5);g.rotateX(-.95);g.translate(sx+1.7,yb+9,z-SD/2+3+i*8.2);bt.add(colorize(g,new THREE.Color('#8d939a')),BM.plain)}
    coll(x,z,SW/2+1.4,SD/2+1.4,y0,yb+CH+6.6,0);coll(sx+.8,z,1.1,SD/2+1,yb,yb+19,0);A.parth={x,z,y0,yb,w:SW,d:SD,ny:8,nx:17,top:+(yb+CH+3.3+3.7-y0).toFixed(2)}}
  // tower crane on the north side (mast, jib, counter-jib, cab, counterweight, hook)
  {const[x,z]=W(...OC_AK.crane),y=groundY(x,z),Y='#f2c200',H=42;for(let k=0;k<7;k++)box(1.8,H/7-.4,1.8,x,y+k*H/7,z,Y);for(let k=0;k<7;k++)for(const s of[-1,1])bt.add(cbox(.1,6,.1,x+s*.85,y+k*H/7+3,z+.85*s,'#d8a800'),BM.plain);
    box(2.2,2.4,2.2,x,y+H,z,'#d8a800');box(46,1.2,1.2,x-14,y+H+2.4,z,Y);box(14,1,1.2,x+16,y+H+2.4,z,Y);box(4,2.6,2.4,x+20,y+H+.2,z,'#7a7a7a');box(2.2,2,2.2,x+1.8,y+H-1.6,z-1.7,'#ffffff');
    box(.1,8,.1,x,y+H+3.6,z,Y);box(.06,16,.06,x-30,y+H+2.4-16,z,'#333333');box(.8,.8,.8,x-30,y+H+2.4-16.8,z,'#e8302a');coll(x,z,1.2,1.2,y,y+H+3,0);A.crane=H+3.6}
  // Erechtheion: main block 23.5 x 11.6 m, east porch (6 Ionic columns), north porch (4+2), caryatid porch on the south side (6 korai on a podium)
  {const[x,z]=W(...OC_AK.erech),y=gmin(x,z,14,9),BW=23.5,BD=11.6;box(BW+2,1,BD+2,x,y-.4,z,MD);box(BW,8.6,BD,x+1,y+.6,z,MB);box(BW+.8,1.4,BD+.8,x+1,y+9.2,z,MW);
    for(let i=0;i<6;i++)col(x-BW/2-1.6,y+.6,z-BD/2+1+i*(BD-2)/5,.42,6.6);box(1.6,1.4,BD,x-BW/2-1.6,y+7.2,z,MW);ped(x-BW/2-1.2,y+8.6,z,BD+.6,2.4,2.2,MW);
    {const nx=x+BW/2-5.5,nz=z+BD/2+3.8;box(10.7,.6,7.6,nx,y-.2,nz,MD);for(let i=0;i<4;i++)col(nx-4.5+i*3,y+.4,nz+3.2,.45,7.6);for(const s of[-1,1])col(nx+s*4.5,y+.4,nz,.45,7.6);box(10.7,1.6,7.6,nx,y+8,nz,MW)}
    {const cx=x+BW/2-4,cz=z-BD/2-1.9;box(5.6,1.8,3.8,cx,y+.6,cz,MD);for(const[a,b]of[[-2.2,-1.5],[-.75,-1.5],[.75,-1.5],[2.2,-1.5],[-2.2,0],[2.2,0]]){bt.add(ccyl(.28,.36,2.3,cx+a,y+2.4+1.15,cz+b,'#f2e8d2',8),BM.plain);bt.add(csph(.3,cx+a,y+4.85,cz+b,'#f2e8d2'),BM.plain)}box(5.9,.7,4.1,cx,y+5.1,cz,MW)}
    coll(x+1,z+1.5,BW/2+1.6,BD/2+3,y,y+10.6,0);A.erech={x,z,y}}
  // Propylaea: central gate building (6 Doric columns west and east, pediments), Pinakotheke (NW wing), SW wing; stairs down the west approach
  {const[x,z]=W(...OC_AK.propy),y=gmin(x,z,14,12);box(24,1.2,20,x,y-.6,z,MD);const yw=y+.6;
    for(const[ex,h]of[[12,8.8],[-12,8.5]])for(let i=0;i<6;i++){col(x+ex,yw,z-8.5+i*3.4,.78,h);}for(const s of[-1,1])box(22,9.2,1.4,x,yw,z+s*9.5,MB);for(const zz of[-5.1,5.1])box(1.4,9,2.6,x+1,yw,z+zz,MB);
    for(const ex of[12,-12]){box(2.2,2.4,20,x+ex,yw+8.8,z,MB);ped(x+ex,yw+11.2,z,20.4,2.2,2.6,MW)}box(22,.5,20,x,yw+11,z,MW);
    {const[nx,nz]=[x+6,z+18];box(14,7.6,11,nx,yw,nz,MB);box(14.6,.8,11.6,nx,yw+7.6,nz,MW);for(let i=0;i<3;i++)col(nx+7.6,yw,nz-3.2+i*3.2,.55,6.4);coll(nx,nz,7.6,5.8,yw,yw+8.4,0)}
    {const[sx2,sz2]=[x+6,z-15];box(10,7.6,8,sx2,yw,sz2,MB);box(10.6,.8,8.6,sx2,yw+7.6,sz2,MW);for(let i=0;i<3;i++)col(sx2+5.6,yw,sz2-2.4+i*2.4,.55,6.4);coll(sx2,sz2,5.6,4.3,yw,yw+8.4,0)}
    for(let k=1;k<=22;k++){const xx=x+13+k*1.9,g=groundY(xx,z),top=Math.min(yw,Math.max(g+.18,yw-k*.42));if(top<g+.08)break;box(1.9,top-g+.6,20,xx,g-.6,z,k%2?MW:MB)}
    for(const s of[-1,1])coll(x,z+s*9.5,11.5,.9,yw,yw+11.5,0);for(const zz of[-5.1,5.1])coll(x+1,z+zz,.9,1.4,yw,yw+11.5,0);A.propy={x,z,y}}
  // Temple of Athena Nike (8.27 x 5.64 m, 4+4 Ionic columns 4.1 m) on its bastion at the south-west corner
  {const[x,z]=W(...OC_AK.nike),yt=groundY(...W(-118,0))-.4,gb=gmin(x,z,8,6);box(16,yt-gb+1,12,x,gb-1,z,'#cdb88f');box(16.4,.4,12.4,x,yt,z,MD);
    for(let k=0;k<3;k++)box(8.27+1.2-k*.6,.3,5.64+1.2-k*.6,x,yt+.4+k*.3,z,MB);const yb=yt+1.3;for(const s of[-1,1])for(let i=0;i<4;i++)col(x+s*3.6,yb,z-2.1+i*1.4,.27,4.1,MB,8);
    box(4.4,4.1,4.6,x,yb,z,MB);box(8.4,.9,5.8,x,yb+4.1,z,MW);for(const s of[-1,1])ped(x+s*3.9,yb+5,z,5.8,.6,1,MW);box(7.6,.2,5.6,x,yb+5,z,MD);coll(x,z,8,6,gb,yb+6,0);A.nike={x,z,y:yt}}
  // Odeon of Herodes Atticus: 76 m semicircular cavea against the slope (north), 28 m three-storey arched stage wall (south)
  {const[x,z]=W(...OC_AK.odeon),yo=groundY(x,z);box(19,.3,10,x,yo-.1,z,'#cfc2a6');for(let t=0;t<15;t++){const R=11+t*1.9,top=yo+.5+t*1.05,n=Math.ceil(R*Math.PI/4.6);
      for(let k=0;k<n;k++){const a=Math.PI*(k+.5)/n,cx=x+Math.cos(a)*R,cz=z+Math.sin(a)*R,g=groundY(cx,cz);if(g>top-.2)continue;box(R*Math.PI/n+.4,top-g+.8,2.1,cx,g-.8,cz,t%5===4?'#cdbfa2':'#e2d6bc',Math.PI/2-a)}}
    const zs=z-8,gs=gmin(x,zs,40,2.5),L=80;box(L,28+(yo-gs),4.6,x,gs,zs,'#cdb88f');for(let r=0;r<3;r++)for(let k=0;k<11;k++)for(const s of[-1,1])box(3.6,r?5.6:7.4,.3,x-35+k*7,yo+(r?5+r*7.6:1),zs+s*2.35,'#4a3a2a');
    for(const s of[-1,1])box(8,24,22,x+s*(L/2+2),gmin(x+s*(L/2+2),z+3,4,11),z+3,'#cdb88f');
    for(let k=-3;k<=3;k++)coll(x+k*11.5,zs,5.8,2.4,gs,yo+28,0);for(let k=0;k<7;k++){const a=Math.PI*(k+.5)/7;coll(x+Math.cos(a)*30,z+Math.sin(a)*30,6,4.5,yo,yo+16,-a)}A.odeon={x,z,y:yo,R:39.5,wall:28}}
  // Theatre of Dionysus: cavea on the south slope (marble lower tiers, front-row thrones), orchestra, low stage foundations
  {const[x,z]=W(...OC_AK.dion),yo=groundY(x,z);bt.add(ccyl(10,10,.3,x,yo,z,'#d9cdb2',24),BM.plain);for(let t=0;t<18;t++){const R=11+t*1.55,top=yo+.45+t*.78,n=Math.ceil(R*1.25*Math.PI/4.2);
      for(let k=0;k<n;k++){const a=-.12*Math.PI+1.24*Math.PI*(k+.5)/n,cx=x+Math.cos(a)*R,cz=z+Math.sin(a)*R,g=groundY(cx,cz);if(g>top-.2)continue;box(R*1.24*Math.PI/n+.3,top-g+.8,1.7,cx,g-.8,cz,t===0?'#f0e6d0':t%6===5?'#cbbd9e':'#dfd3b8',Math.PI/2-a)}}
    const zs=z-14,gs=gmin(x,zs,22,3);box(44,2.4+(yo-gs),5,x,gs,zs,'#c9b994');for(let k=0;k<6;k++)col(x-15+k*6,yo+2.4,zs,.4,3.2,MB,8);coll(x,zs,22,2.5,gs,yo+3,0);A.dion={x,z,y:yo}}
  // circuit walls along the plateau edge (the base ring is skipped: the terrain fix lifted it by the plateau height); open to the west approach
  {const H=HILL_BY.akro,N=72,pt=t=>{const u=Math.sin(t),v=Math.cos(t),de=(u*H.rx*.975)*H.ca+(v*H.rz*.975)*H.sa,dn=-(u*H.rx*.975)*H.sa+(v*H.rz*.975)*H.ca;return[H.cx-de*H.sx,H.cz+dn*H.sz,u]},yH=groundY(H.cx,H.cz);
    for(let k=0;k<N;k++){const t0=k/N*Math.PI*2,t1=(k+1)/N*Math.PI*2,[x0,z0,u0]=pt(t0),[x1,z1,u1]=pt(t1);if((u0+u1)/2<-.42)continue;const cx=(x0+x1)/2,cz=(z0+z1)/2,L=Math.hypot(x1-x0,z1-z0)+1.6,ry=Math.atan2(-(z1-z0),x1-x0),g=groundY(cx,cz);
      box(L,yH+1.3-(g-7),2.2,cx,g-7,cz,'#cdb995',ry);box(L,.35,2.6,cx,yH+1.3,cz,'#bba882',ry);coll(cx,cz,L/2,1.1,g,yH+1.6,ry)}}
  bt.flush(HUB.grp);hubGridAdd(bl);OC.acro=A;HUB.ocAcro=A}
function OC_unbury(){const F=HUB.bld.filter(b=>b.trMin!=null&&b.trBase!=null&&b.trMin>-1&&b.trMax-b.trBase>1);OC.unb=F.length;if(!F.length)return;
  const find=(x,z,m)=>{for(const b of F){const dx=x-b.x,dz=z-b.z,lx=b.c==null?dx:dx*b.c-dz*b.s,lz=b.c==null?dz:dx*b.s+dz*b.c;if(Math.abs(lx)<=b.hw+m&&Math.abs(lz)<=b.hd+m)return b}return null};const M=new THREE.Matrix4(),P=V3(),pl=[];
  for(const b of F)b.ocUp=b.trMax-.8-b.trBase;
  for(const o of HUB.grp.children){if(!(o.isMesh||o.isInstancedMesh)||o.userData.trG||!o.geometry||!o.geometry.attributes.position)continue;let ch=false;
    if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);P.setFromMatrixPosition(M);const b=find(P.x,P.z,.4);if(!b||P.y<b.trBase-.5)continue;M.elements[13]+=b.ocUp;o.setMatrixAt(i,M);ch=true}if(ch){o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere()}continue}
    const A=o.geometry.attributes.position,p=A.array;for(let i=0;i<p.length;i+=3){const b=find(p[i],p[i+2],.4);if(b&&p[i+1]>=b.trBase-.5){p[i+1]+=b.ocUp;ch=true}}if(ch){A.needsUpdate=true;o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere()}}
  for(const b of F){b.h+=b.ocUp;if(b.y0!=null)b.y0+=b.ocUp;b.trBase+=b.ocUp;b.trDoor=(b.trDoor||0)+b.ocUp;TR_PL.push(b);pl.push(cbox(b.hw*2+.7,b.trBase-b.trMin+.45,b.hd*2+.7,b.x,(b.trBase+b.trMin-.4)/2,b.z,'#b5a68c',b.c==null?0:Math.atan2(-b.s,b.c)))}
  const m=new THREE.Mesh(mergeG(pl),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92}));m.receiveShadow=true;m.userData.trPl=1;HUB.grp.add(m)}
{const _hg=hubGrid;hubGrid=()=>{if(CID==='fra'&&HUB.grp&&OC.altG!==HUB.grp){OC.altG=HUB.grp;try{OC_altFix()}catch(e){console.warn('OC alt',e)}}const first=HUB.grp&&OC.ubG!==HUB.grp,r=_hg();if(first){OC.ubG=HUB.grp;try{OC_unbury()}catch(e){console.warn('OC unbury',e)}}try{OC_acroBuild()}catch(e){console.warn('OC acro',e)}return r}}
{const _ts=hubTrafficStep;hubTrafficStep=function(){if(HUB.cim&&OC.cimS!==HUB.cim){OC.cimS=HUB.cim;OC_traffic()}return _ts.apply(this,arguments)}}
// Frankfurt Altstadt core (Römerberg - Dom - Paulsplatz): non-landmark blocks above 19 m are brought down to 4-5 storeys (14.5-18 m incl. roof),
// before the terrain fix (bodies still at y=0): colliders, instances and merged vertices inside each footprint scale in y
function OC_altFix(){const R=LM_BY['Römer'],K=LM_BY['Kaiserdom'];if(!R||!K)return;const cx=(R.x+K.x)/2,cz=(R.z+K.z)/2,inC=(x,z)=>((x-cx)/280)**2+((z-cz)/170)**2<1&&!inRiver(x,z);OC.alt={cx,cz,n:0};
  const LMS=Object.values(LM_BY).filter(L=>L&&L.x!=null),lmk=b=>LMS.some(L=>Math.hypot(b.x-L.x,b.z-L.z)<Math.max(L.r||0,28));const F=[];
  for(const b of HUB.bld){if(!inC(b.x,b.z)||b.hw*b.hd<20||lmk(b)||b.h<19||b.h>140||(b.y0||0)>1)continue;const T=14.5+3.5*((Math.sin(b.x*12.99+b.z*78.23)*43758.5)%1+1)%1,k=T/b.h;b.h=T;F.push([b,k]);OC.alt.n++}
  if(!F.length)return;const find=(x,z)=>{for(const[b,k]of F){const dx=x-b.x,dz=z-b.z,lx=b.c==null?dx:dx*b.c-dz*b.s,lz=b.c==null?dz:dx*b.s+dz*b.c;if(Math.abs(lx)<=b.hw+.4&&Math.abs(lz)<=b.hd+.4)return k}return 0};
  const M=new THREE.Matrix4(),P=V3();for(const o of HUB.grp.children){if(!(o.isMesh||o.isInstancedMesh)||!o.geometry||!o.geometry.attributes.position)continue;let ch=false;
    if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);P.setFromMatrixPosition(M);const k=find(P.x,P.z);if(!k||P.y>1)continue;const e=M.elements;e[4]*=k;e[5]*=k;e[6]*=k;e[13]*=k;o.setMatrixAt(i,M);ch=true}if(ch){o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere()}continue}
    const A=o.geometry.attributes.position,p=A.array;for(let i=0;i<p.length;i+=3){const k=find(p[i],p[i+2]);if(k&&p[i+1]>.05){p[i+1]*=k;ch=true}}if(ch){A.needsUpdate=true;o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere()}}}
{const _bp=buildHubProps;buildHubProps=function(){const r=_bp.apply(this,arguments);try{OC_lampsBuild();OC_traffic()}catch(e){console.warn('OC lamps',e)}return r}}
// ---------- 4 · height audit (both cities): props, traffic, buildings (storeys), named landmarks, floating / buried
const OC_REAL={Commerzbank:259,'Main Tower':240,Messeturm:257,'Athens Tower':103,Lycabettus:277,Parthenon:13.72+1.53+3.7};
const OC_RANGE={tree:[6,12],lamp:CID==='ath'?[4.5,6.5]:[6.5,9.5],car:[1.2,2.1],storey:[3,3.4],poly_c:[5,8],poly_o:[3,6],neo:[2,4],plaka:[1,3],fraAlt:[3,5],tower:[.9,1.1]};
const OC_TREES=['tree','tree2','tree3','CE_pine','CE_cypress','CE_olive'],OC_CARS=['car','car2','car3','car4','CE_car','CE_car2','CE_taxi'];
function OC_audit(){const D=HUB.ptypes,T=[],out={rows:T,bad:[],float:0,buried:0,fl:[],bu:[]},hgt=g=>{g.computeBoundingBox();return g.boundingBox.max.y-g.boundingBox.min.y};
  const row=(cls,name,v,lo,hi,real)=>{const ok=v>=lo-1e-6&&v<=hi+1e-6;T.push({cls,name,v:+v.toFixed(2),lo,hi,real,ok});if(!ok)out.bad.push(cls+':'+name+'='+v.toFixed(2))};
  const used=t=>HUB.props.some(p=>p.t===t);for(const t of OC_TREES)if(D[t]&&used(t))row('tree',t,hgt(D[t].g),...OC_RANGE.tree);if(D.lamp)row('lamp','lamp',hgt(D.lamp.g),...OC_RANGE.lamp,CID==='ath'?5.5:8);
  for(const t of OC_CARS)if(D[t]&&used(t))row('car',t,hgt(D[t].g),...OC_RANGE.car,1.5);OC_traffic();for(const k in HUB.cim||{}){const g=HUB.cim[k].geometry;g.computeBoundingBox();const l=g.boundingBox.max.z-g.boundingBox.min.z;const w=g.boundingBox.max.x-g.boundingBox.min.x;if(w<1.2)row('two-wheeler','traffic#'+k+' (scooter + rider)',hgt(g),1.3,2,1.7);else if(l<5.2)row('car','traffic#'+k,hgt(g),...OC_RANGE.car,1.5);else row('heavy','traffic#'+k+' (van/truck/bus)',hgt(g),1.9,4.3,3.2)}
  // buildings: Athens instanced bodies (storeys by style), Frankfurt colliders (Altstadt storeys, named towers)
  if(CID!=='fra'){const st={},M=new THREE.Matrix4(),P=V3(),Q=new THREE.Quaternion(),S=V3();HUB.grp.traverse(o=>{const k=o.userData&&o.userData.athB;if(!o.isInstancedMesh||!['poly','neo','plaka'].includes(k))return;const fh=k==='poly'?3.1:3.3;
      for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);M.decompose(P,Q,S);if(S.y<1.5)continue;const g=OC_minG(P.x,P.z,Math.min(S.x,S.z)/2);if(P.y>g+2.5)continue;const sty=athStyleAt(P.x,P.z),fl=Math.round((S.y-.6)/fh),
        c=k==='poly'?(sty==='poly'||sty==='kolon'?'poly_c':'poly_'+sty):k==='neo'?'neo':S.x*S.z>110&&S.y<5?'villa':'plaka',r=c==='villa'?[1,3]:k==='poly'&&c!=='poly_c'?[sty==='villa'?2:3,sty==='old'||sty==='plaka'?5:sty==='town'||sty==='villa'?4:6]:OC_RANGE[c];const e=st[c]||(st[c]={n:0,min:99,max:0,sum:0,bad:0,r});e.n++;e.sum+=fl;e.min=Math.min(e.min,fl);e.max=Math.max(e.max,fl);if(fl<r[0]||fl>r[1])e.bad++}});
    for(const c in st){const e=st[c];T.push({cls:'storeys',name:c,v:+(e.sum/e.n).toFixed(2),min:e.min,max:e.max,n:e.n,lo:e.r[0],hi:e.r[1],ok:!e.bad,bad:e.bad});if(e.bad)out.bad.push('storeys '+c+' x'+e.bad)}
    row('storey','poly',3.1,...OC_RANGE.storey);row('storey','neo/plaka',3.3,...OC_RANGE.storey);
    const at=HUB.bld.filter(b=>{const L=athLmNear(b.x,b.z);return L&&L.id==='athenstower'}).reduce((m,b)=>Math.max(m,b.h-(b.trBase??groundY(b.x,b.z))),0);if(at)row('landmark','Athens Tower',at,103*.95,103*1.05,103);
    const ly=HILL_BY.lyka;if(ly&&ly.cx>WX0&&ly.cx<WX1&&ly.cz>WZS&&ly.cz<WZN){let m=0;for(let r=0;r<200;r+=5)for(let k=0;k<24;k++){const a=k/24*Math.PI*2;m=Math.max(m,groundY(ly.cx+Math.cos(a)*r,ly.cz+Math.sin(a)*r))}row('landmark','Lycabettus (m a.s.l.)',m+TR_DATUM,277*.95,277*1.05,277)}
    if(OC.acro){const A=OC.acro;row('landmark','Parthenon (stylobate->apex)',A.parth.top-1.53,17.4*.95,17.4*1.05,17.4);const H=HILL_BY.akro;row('landmark','Acropolis plateau (m a.s.l.)',H.H+TR_DATUM,150,160,156)}}
  else{for(const n of['Commerzbank','Main Tower','Messeturm']){const L=LM_BY[n];if(!L)continue;let m=0;for(const b of HUB.bld)if(Math.hypot(b.x-L.x,b.z-L.z)<45)m=Math.max(m,b.h-(b.trBase??groundY(b.x,b.z)));row('landmark',n,m,OC_REAL[n]*.95,OC_REAL[n]*1.05,OC_REAL[n])}
    const st={n:0,min:99,max:0,sum:0,bad:0},A=OC.alt,LMS=Object.values(LM_BY).filter(L=>L&&L.x!=null);for(const b of HUB.bld){if(!A||((b.x-A.cx)/280)**2+((b.z-A.cz)/170)**2>=1||inRiver(b.x,b.z)||b.hw*b.hd<20||LMS.some(L=>Math.hypot(b.x-L.x,b.z-L.z)<Math.max(L.r||0,28)))continue;const h=b.h-(b.trBase??groundY(b.x,b.z)),fl=Math.floor(h/3.25);if(h<6)continue;st.n++;st.sum+=fl;st.min=Math.min(st.min,fl);st.max=Math.max(st.max,fl);if(fl<OC_RANGE.fraAlt[0]-1||fl>OC_RANGE.fraAlt[1]+1)st.bad++}
    if(st.n){T.push({cls:'storeys',name:'Altstadt core (roof incl., floor(h/3.25))',v:+(st.sum/st.n).toFixed(2),min:st.min,max:st.max,n:st.n,lo:3,hi:5,ok:!st.bad,bad:st.bad});if(st.bad)out.bad.push('Altstadt x'+st.bad)}}
  // floating / buried: ground-placed props (centre and footprint), building colliders on the terrain, the Acropolis monuments
  for(const p of HUB.props){if(!D[p.t]||!p.alive||!p.gp)continue;const g0=groundY(p.x,p.z);const fp=OC_fp(p.t,D),gm=OC_minG(p.x,p.z,fp);if(p.y-gm>.3){out.float++;if(out.fl.length<6)out.fl.push([p.t,Math.round(p.x),Math.round(p.z),+(p.y-gm).toFixed(2)])}if(g0-p.y>1){out.buried++;if(out.bu.length<6)out.bu.push([p.t,Math.round(p.x),Math.round(p.z),+(g0-p.y).toFixed(2)])}}
  const pl=new Set(TR_PL);out.riverbed=0;for(const b of HUB.bld){if(b.trMin==null||b.trBase==null)continue;if(b.trMin<-1){out.riverbed++;continue}// bridge piers / quay walls stand in the riverbed by design
  if(b.trBase-b.trMin>.3&&!pl.has(b)){out.float++;if(out.fl.length<12)out.fl.push(['bld',Math.round(b.x),Math.round(b.z),+(b.trBase-b.trMin).toFixed(2)])}if(b.trMax-b.trBase>1){out.buried++;if(out.bu.length<12)out.bu.push(['bld',Math.round(b.x),Math.round(b.z),+(b.trMax-b.trBase).toFixed(2)])}}
  if(OC.acro)for(const k of['parth','erech','propy','nike']){const a=OC.acro[k],y=a.y0??a.y,g=groundY(a.x,a.z);if(y-g>.3||g-y>1){out.float++;out.fl.push([k,Math.round(a.x),Math.round(a.z),+(y-g).toFixed(2)])}}
  return out}
// Lycabettus: the 20 m DEM rounds the peak off (~257 m); a smooth cone (r 190 m) restores the real 277 m a.s.l. summit
function OC_lyka(h,nx,nz,r){if(CID==='fra'||typeof HILL_BY==='undefined'||!HILL_BY.lyka)return;const L=HILL_BY.lyka;if(L.cx<WX0+300||L.cx>WX1-300||L.cz<WZS+300||L.cz>WZN-300)return;let b=-1,bi=0,bj=0;const i0=Math.max(0,Math.floor((L.cx-260-WX0)/r)),i1=Math.min(nx-1,Math.ceil((L.cx+260-WX0)/r)),j0=Math.max(0,Math.floor((L.cz-260-WZS)/r)),j1=Math.min(nz-1,Math.ceil((L.cz+260-WZS)/r));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)if(h[j*nx+i]>b){b=h[j*nx+i];bi=i;bj=j}const d=277-TR_DATUM-b;if(!(d>0)||b<100)return;const R=190;
  for(let j=Math.max(0,bj-Math.ceil(R/r));j<=Math.min(nz-1,bj+Math.ceil(R/r));j++)for(let i=Math.max(0,bi-Math.ceil(R/r));i<=Math.min(nx-1,bi+Math.ceil(R/r));i++){const t=1-Math.hypot(i-bi,j-bj)*r/R;if(t>0)h[j*nx+i]+=d*t*t*(3-2*t)}window.__ocLyka=d}
// the Acropolis south slope (Odeon - Theatre of Dionysus) is an archaeological park: no apartment blocks in the building raster there
function OC_zone(cap){if(CID==='fra')return;const[px,pz]=WP(80,-507),W=(e,n)=>[px-e,pz+n],[ox,oz]=W(...OC_AK.odeon),[dx,dz]=W(...OC_AK.dion);cap(ox,oz,dx,dz,50,3);cap(ox,oz,ox,oz,56,3);cap(dx,dz,dx,dz,64,3)}
function OC_top(t){return Math.max(t,156-TR_DATUM)}// plateau at the real summit level (156 m a.s.l.), ~70 m above the Plaka streets
function OC_fix(U,x,z){if(U.k!=='poly')return U;const s=athStyleAt(x,z),lo=s==='old'||s==='town'||s==='outer'||s==='plaka'?3:s==='villa'?2:5,hi=s==='old'||s==='plaka'?5:s==='town'||s==='villa'?4:s==='outer'?6:8,f=Math.min(hi,Math.max(lo,U.fl));return f===U.fl?U:{...U,fl:f}}
const OC_gy=(t,x,z)=>HUB.ptypes&&HUB.ptypes[t]?Math.max(OC_minG(x,z,OC_fp(t,HUB.ptypes)),groundY(x,z)-.9):groundY(x,z);
function OC_ifl(f,s){return s==='poly'||s==='kolon'?f+2:f}// interior polykatoikia in the central districts: 5-7 storeys (was 3-5)
window.__oc={ev:s=>window.__dbg?eval(s):null,OC,acro:()=>OC.acro,props:()=>HUB.OC,fp:t=>OC_fp(t,HUB.ptypes),GAME:[...OC_GAME],roadE:(x,z)=>OC_roadE(x,z),audit:()=>OC_audit()};

/* ===== CV · traffic signals + rules (both cities), city variety (rooflines, colours, medians, plazas, parks) ===== */
const CV={G:new Map(),t:0,acc:0,sig:[],yl:[],seg:new Map(),JG:new Map(),K:2097152,pedOK:0,pedBad:0,dd:0,bs:[],fv:[],tick:0,last:null},CV_MAJ={arterial:1,main:1,ring:1};
function CV_h(x,z,k=0){const h=Math.sin(x*12.9898+z*78.233+k*37.719)*43758.5453;return h-Math.floor(h)}
function CV_pal(a,h){return a[Math.floor(h*a.length)%a.length]}
// phase of approach k at junction J: 'g' green, 'y' amber, 'r' red; walk = last WALK s of the cycle (all cars red)
const CV_AM=2.5,CV_AR=2,CV_WK=9;
function CV_u(J){const u=(CV.t-J.off)%J.C;return u<0?u+J.C:u}
function CV_st(J,k){const u=CV_u(J),s=J.s[k],g=J.g[k];return u>=s&&u<s+g?'g':u>=s+g&&u<s+g+CV_AM?'y':'r'}
function CV_walk(J){const u=CV_u(J)-J.Cw;return u>=0?u:-1}
function CV_near(x,z,f){const kx=Math.floor(x/64),kz=Math.floor(z/64);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=CV.JG.get((kx+a)*100000+kz+b);if(L)for(const J of L)if(f(J))return J}return null}
function CV_sigBuild(){const N=HUB.nodes,NG=N.ng,K=CV.K;CV.sig=[];CV.yl=[];CV.seg=new Map();CV.JG=new Map();const all=[];
  for(const J of JUNC){if(!(J.r>0))continue;const nm=new Set(),nm2=new Set();let road=0;for(const i of J.ids||[]){const S=CITY_S[i];if(!S||S.r.cls==='ped'||S.r.cls==='hill'||S.r.cls==='quay')continue;road++;const id=S.r.id??S.r.name??i;if(CV_MAJ[S.r.cls])nm.add(id);if(S.r.cls==='sec')nm2.add(id)}
    if(road<2)continue;const C={x:J.x,z:J.z,r:J.r,R0:J.r+1.5,sig:nm.size>=2,s2:nm.size===1&&nm2.size>=1,ed:[],ap:[],pd:1e9};all.push(C)}
  if(CID==='fra')for(const X of FILL_X)all.push({x:X.x,z:X.z,r:Math.max(X.wa,X.wb)/2,R0:Math.max(X.wa,X.wb)/2+1.5,sig:false,ed:[],ap:[],pd:1e9});
  if(all.filter(C=>C.sig).length<8)for(const C of all)if(C.s2)C.sig=true;
  for(let i=0;i<all.length;i++){const A=all[i];if(A.dead)continue;for(let j=i+1;j<all.length;j++){const B=all[j];if(B.dead||Math.abs(A.x-B.x)>60||Math.abs(A.z-B.z)>60)continue;const d=Math.hypot(A.x-B.x,A.z-B.z);if(d<A.R0+B.R0-2){const x=(A.x+B.x)/2,z=(A.z+B.z)/2,R0=Math.max(Math.hypot(A.x-x,A.z-z)+A.R0,Math.hypot(B.x-x,B.z-z)+B.R0);if(R0>32)continue;A.x=x;A.z=z;A.R0=R0;A.r=R0-1.5;A.sig=A.sig||B.sig;B.dead=1;j=i}}}
  for(let i=all.length-1;i>=0;i--)if(all[i].dead)all.splice(i,1);all.forEach((C,i)=>C.id=i);
  for(const C of all){const k=Math.floor(C.x/64)*100000+Math.floor(C.z/64);if(!CV.JG.has(k))CV.JG.set(k,[]);CV.JG.get(k).push(C)}
  // incoming edges: start outside the stop circle, run into it, towards the centre
  for(let i=0;i<NG;i++){const A=N[i];if(A.ab)continue;for(const j of A.nb){if(j>=NG)continue;const B=N[j],mx=(A.x+B.x)/2,mz=(A.z+B.z)/2;let best=null,bd=1e9;
    const kx=Math.floor(mx/64),kz=Math.floor(mz/64),ex=B.x-A.x,ez=B.z-A.z,L2=ex*ex+ez*ez||1;
    for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const L=CV.JG.get((kx+a)*100000+kz+b);if(L)for(const C of L){const dA=Math.hypot(A.x-C.x,A.z-C.z);if(dA<C.R0||dA>140)continue;if(ex*(C.x-A.x)+ez*(C.z-A.z)<=0)continue;const t=Math.max(0,Math.min(1,((C.x-A.x)*ex+(C.z-A.z)*ez)/L2)),dm=Math.hypot(A.x+ex*t-C.x,A.z+ez*t-C.z);if(dm<C.R0*.9&&dA-(C.sig?60:0)<bd){bd=dA-(C.sig?60:0);best=C}}}
    if(best)best.ed.push([i,j])}}
  const need=new Map();
  for(const C of all){const G=[];for(const e of C.ed){const A=N[e[0]],l=Math.hypot(C.x-A.x,C.z-A.z)||1,dx=(C.x-A.x)/l,dz=(C.z-A.z)/l;let g=G.find(q=>q.dx*dx+q.dz*dz>.82);if(!g)G.push(g={dx:0,dz:0,e:[],w:0});g.dx+=dx;g.dz+=dz;g.e.push(e);g.w=Math.max(g.w,A.w||14)}
    if(G.length<2){C.sig=false}
    for(const g of G){const l=Math.hypot(g.dx,g.dz)||1;g.dx/=l;g.dz/=l;let lat=0;for(const[i]of g.e)lat+=(N[i].x-C.x)*g.dz-(N[i].z-C.z)*g.dx;g.lat=lat/g.e.length}
    G.sort((a,b)=>b.w-a.w);C.ap=G;const hw=q=>Math.min(14,q.w/2);
    G.forEach((g,k)=>{for(const[i,j]of g.e){CV.seg.set(i*K+j,{J:C,k});need.set(i,[C,k])}});
    if(!C.sig){CV.yl.push(C);continue}
    C.s=[];C.g=[];let t=0;G.forEach((g,k)=>{C.s.push(t);C.g.push(g.w>=16?12:8);t+=C.g[k]+CV_AM+CV_AR});C.Cw=t;C.C=t+CV_WK;
    const a0=G[0];C.off=((C.x*a0.dx+C.z*a0.dz)/13)%C.C;CV.sig.push(C)}
  // the edge before each incoming edge is part of the approach too (braking room)
  for(let i=0;i<NG;i++){for(const j of N[i].nb){const q=need.get(j);if(!q||CV.seg.has(i*K+j))continue;const[C,k]=q;if(Math.hypot(N[i].x-C.x,N[i].z-C.z)>C.R0)CV.seg.set(i*K+j,{J:C,k,pre:1})}}
  CV_sigMesh()}
function CV_sigMesh(){const S=CV.sig,grp=HUB.grp;let nh=0;for(const J of S)nh+=J.ap.length;if(!nh)return;
  const pg=mergeG([ccyl(.16,.2,6.2,0,3.1,0,'#3b4148',8),cbox(3.8,.18,.18,1.9,5.95,0,'#3b4148'),cbox(.6,1.75,.55,3.6,5.2,0,'#20242a'),cbox(.75,.12,.7,3.6,6.12,0,'#20242a'),cbox(.42,.55,.42,0,2.75,0,'#20242a')]).scale(1.5,1.5,1.5);
  const pm=new THREE.InstancedMesh(pg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.4}),nh),
    lm=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.36,1),new THREE.MeshBasicMaterial({toneMapped:false}),nh*4),
    sm=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.05,.55),new THREE.MeshStandardMaterial({color:'#f4f4ef',roughness:.8,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}),nh);
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),up=V3(0,1,0),v=V3(),sc=V3(),c=new THREE.Color();let h=0;
  for(const J of S){J.li=h*4;J.lc=[];J.ap.forEach((g,k)=>{const hw=Math.min(14,g.w/2),sd=Math.abs(g.lat)<1?1:Math.sign(g.lat),lx=g.dz,lz=-g.dx,ry=Math.atan2(g.dx,g.dz),
      bx=J.x-g.dx*J.R0,bz=J.z-g.dz*J.R0,one=Math.abs(g.lat)<1,sx=bx+lx*(one?0:sd*hw/2),sz=bz+lz*(one?0:sd*hw/2);
      m.compose(v.set(sx,groundY(sx,sz)+.07,sz),q.setFromAxisAngle(up,ry),sc.set(one?hw*2-1:hw-.6,1,1));sm.setMatrixAt(h,m);
      const px=bx-g.dx*1.2+lx*sd*(hw+1.3),pz=bz-g.dz*1.2+lz*sd*(hw+1.3),gy=groundY(px,pz),ar=sd>0?ry+Math.PI:ry,ax=-lx*sd,az=-lz*sd;
      m.compose(v.set(px,gy,pz),q.setFromAxisAngle(up,ar),sc.set(1,1,1));pm.setMatrixAt(h,m);
      const hx=px+ax*5.4-g.dx*.48,hz=pz+az*5.4-g.dz*.48;for(let n=0;n<3;n++){m.makeTranslation(hx,gy+8.62-n*.82,hz);lm.setMatrixAt(h*4+n,m)}
      m.makeTranslation(px+ax*.36-g.dx*.15,gy+4.12,pz+az*.36-g.dz*.15);lm.setMatrixAt(h*4+3,m);for(let n=0;n<4;n++)lm.setColorAt(h*4+n,c.setRGB(.1,.1,.1));h++})}
  for(const o of[pm,lm,sm]){o.frustumCulled=false;o.userData.cv=1;grp.add(o)}lm.instanceColor.needsUpdate=true;CV.lm=lm;
  // turn indicators: small amber blinkers at the car corners (near the player only)
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.35,.5),new THREE.MeshBasicMaterial({color:new THREE.Color(3,1.6,.1),toneMapped:false}),160);im.count=0;im.frustumCulled=false;grp.add(im);CV.im=im}
const CV_LC={g:[[.2,.04,.03],[.25,.15,.02],[.15,2.8,.7]],y:[[.2,.04,.03],[3,1.7,.1],[.03,.15,.06]],r:[[3,.25,.15],[.25,.15,.02],[.03,.15,.06]]};
function CV_lamps(){const L=CV.lm;if(!L)return;let ch=0;const c=new THREE.Color();for(const J of CV.sig){if(Math.abs(J.x-RO.x)>700||Math.abs(J.z-RO.z)>700)continue;const w=CV_walk(J)>=0;
  J.ap.forEach((g,k)=>{const s=CV_st(J,k)+(w?'w':'');if(J.lc[k]===s)return;J.lc[k]=s;const T=CV_LC[s[0]];for(let n=0;n<3;n++)L.setColorAt(J.li+k*4+n,c.setRGB(...T[n]));L.setColorAt(J.li+k*4+3,w?c.setRGB(2.6,2.6,2.6):c.setRGB(1.6,.45,.08));ch=1})}if(ch)L.instanceColor.needsUpdate=true}
// AI: fixed 10 Hz tick near the player (leaders, junction occupancy), per-frame speed caps from lights / leaders / yields
function CV_tick(){const N=HUB.nodes,G=new Map(),near=[];CV.tick++;
  for(const c of HUB.cars){c.CVn=0;c.CVl=null;if(c.dead>0||(c.route&&!c.CVr))continue;const A=N[c.a],B=N[c.b];if(!A||!B||A.ab)continue;if(Math.abs(c.x-RO.x)>320||Math.abs(c.z-RO.z)>320)continue;
    const L=Math.hypot(B.x-A.x,B.z-A.z)||1;c.CVhx=(B.x-A.x)/L;c.CVhz=(B.z-A.z)/L;c.CVn=1;near.push(c);const k=Math.floor(c.x/16)*100000+Math.floor(c.z/16);if(!G.has(k))G.set(k,[]);G.get(k).push(c);}
  CV.G=G;for(const c of near){const kx=Math.floor(c.x/16),kz=Math.floor(c.z/16);let bd=18,b=null;for(let a=-1;a<=1;a++)for(let e=-1;e<=1;e++){const L=G.get((kx+a)*100000+kz+e);if(L)for(const o of L){if(o===c)continue;const rx=o.x-c.x,rz=o.z-c.z,al=rx*c.CVhx+rz*c.CVhz;if(al<.5||al>=bd)continue;if(Math.abs(rx*c.CVhz-rz*c.CVhx)<2.4&&o.CVhx*c.CVhx+o.CVhz*c.CVhz>.3){bd=al;b=o}}}c.CVl=b}
  CV_lamps()}
function CV_pre(dt){const N=HUB.nodes;CV.acc+=dt;CV.fr=(CV.fr||0)+1;if(CV.acc>=.1){CV.acc=0;CV_tick()}
  // box reservations: a junction admits one path at a time (followers in the same lane to the same exit may share it)
  const same=(o,c)=>o.CVf===c.CVf&&o.CVx!=null&&o.CVx===c.CVx&&Math.hypot(o.x-c.x,o.z-c.z)>10&&o.CVhx*c.CVhx+o.CVhz*c.CVhz>.9&&Math.abs((o.x-c.x)*c.CVhz-(o.z-c.z)*c.CVhx)<1.8;
  for(const c of HUB.cars){if(!c.CVn||c.dead>0)continue;const A=N[c.a],B=N[c.b];if(A&&B){const L=Math.hypot(B.x-A.x,B.z-A.z)||1;c.CVhx=(B.x-A.x)/L;c.CVhz=(B.z-A.z)/L}
    c.CVin=null;CV_near(c.x,c.z,J=>{if(Math.hypot(J.x-c.x,J.z-c.z)>=J.R0)return false;if(!c.CVin||J.sig)c.CVin=J;if(J.of!==CV.fr){J.of=CV.fr;J.oc=[]}J.oc.push(c);if(J.sig&&c.CVgh!==J){const r=J.res||(J.res=new Map());if(!r.has(c))r.set(c,CV.t)}return false})}
  for(const J of CV.act||[])if(J.res)for(const[c,t]of J.res){const rx=J.x-c.x,rz=J.z-c.z,l=Math.hypot(rx,rz);if(CV.t-t>7&&c.CVin===J)c.CVgh=J;if(c.dead>0||!c.CVn||CV.t-t>7||l>J.R0+1&&rx*c.CVhx+rz*c.CVhz<0||l>J.R0+30)J.res.delete(c)}
  CV.act=new Set();
  for(const c of HUB.cars){if(c.CVr&&c.route&&!c.route.length){c.route=null;c.CVr=0}if(!c.CVn||c.dead>0)continue;const A=N[c.a],B=N[c.b];if(!A||!B)continue;let vm=1e9;const g=CV.seg.get(c.a*CV.K+c.b),In=c.CVin;if(In)CV.act.add(In);
    let J=null,jd=1e9;if(!In||!In.sig)CV_near(c.x,c.z,Q=>{if(Q===In)return false;const rx=Q.x-c.x,rz=Q.z-c.z,l=Math.hypot(rx,rz),e=l-(Q.sig?1e3:0);if(l<Q.R0+(Q.sig?40:16)&&e<jd&&rx*c.CVhx+rz*c.CVhz>l*.45&&Math.abs(rx*c.CVhz-rz*c.CVhx)<Q.R0*.8){jd=e;J=Q}return false});
    if(J){CV.act.add(J);let d=Math.hypot(J.x-c.x,J.z-c.z)-J.R0,k=-1,bd=-2;J.ap.forEach((a,i)=>{const v=a.dx*c.CVhx+a.dz*c.CVhz;if(v>bd){bd=v;k=i}});if(k>=0)d=(J.x-c.x)*J.ap[k].dx+(J.z-c.z)*J.ap[k].dz-J.R0;c.CVf=J.id*8+k;const res=J.res||(J.res=new Map());
      if(J.sig&&J.ap.length>1){if(!res.has(c)){const s=k<0?'r':CV_st(J,k);let go=s==='g'||s==='y'&&d<(c.cv||0)**2/12+2;const l=c.CVl;
        if(go&&l&&!(l.dead>0)&&(l.cv||0)<3&&Math.hypot(l.x-J.x,l.z-J.z)<J.R0+8)go=false;
        if(go)for(const o of res.keys()){if(o===c||same(o,c))continue;const ox=o.x-J.x,oz=o.z-J.z;if(ox*o.CVhx+oz*o.CVhz>0&&Math.hypot(ox,oz)>J.R0*.45)continue;go=false;break}
        if(go&&d<6)res.set(c,CV.t);else if(!go)vm=Math.sqrt(10*Math.max(0,d-3.2))}}
      else{vm=Math.min(vm,6+Math.max(0,d)*.6);const o=J.of===CV.fr?J.oc.find(o=>o!==c&&Math.abs(o.CVhx*c.CVhx+o.CVhz*c.CVhz)<.7):null;if(o&&d>2&&(c.CVw=(c.CVw||0)+dt)<4)vm=Math.min(vm,Math.sqrt(10*Math.max(0,d-3.2)));else if(!o)c.CVw=0}}
    if(g&&!g.pre&&!c.route&&!c.CVp){let nx=B.nb.filter(n=>n!==c.a&&n<N.ng);if(c.tr)nx=nx.filter(n=>N[n].tr);if(nx.length){const n=nx[Math.floor(Math.random()*nx.length)],C=N[n],l=Math.hypot(C.x-B.x,C.z-B.z)||1,s=((C.x-B.x)*c.CVhz-(C.z-B.z)*c.CVhx)/l;c.route=[n];c.CVx=n;c.CVr=1;c.CVp=1;if(Math.abs(s)>.4){c.CVi=s>0?1:-1;c.CViT=6}}}
    if(!g){c.CVp=0;if(!J&&!In)c.CVx=null}
    const Jb=In&&In.sig?In:J;if(Jb&&Jb.sig&&(In===Jb||Jb.res&&Jb.res.has(c))){const R=Jb.res,pc=R&&R.has(c)?R.get(c):1e9;let hold=0;const kx=Math.floor(c.x/16),kz=Math.floor(c.z/16);
      for(let a=-1;a<=1;a++)for(let e=-1;e<=1;e++)for(const o of CV.G.get((kx+a)*100000+kz+e)||[]){if(o===c||o.dead>0)continue;const rx=o.x-c.x,rz=o.z-c.z,dd=Math.hypot(rx,rz);if(dd>8)continue;const al=rx*c.CVhx+rz*c.CVhz;if(al<-.5)continue;
        const po=R&&R.has(o)?R.get(o):1e9;if(po<pc||po===pc&&o.j+o.k*997<c.j+c.k*997||dd<6&&al>0&&Math.abs(rx*c.CVhz-rz*c.CVhx)<3)hold=1}
      if(hold){vm=0;c.CVst=(c.CVst||0)+dt;if(c.CVst>5&&In&&Math.hypot(c.x-RO.x,c.z-RO.z)>50){c.dead=.05;c.CVst=0;c.route=null;c.CVr=0;CV.rc=(CV.rc||0)+1;for(const Q of[In,J])if(Q&&Q.res)Q.res.delete(c)}}else c.CVst=0}
    const o=c.CVl;if(o&&!(o.dead>0)){const rx=o.x-c.x,rz=o.z-c.z,al=rx*c.CVhx+rz*c.CVhz;if(al>0&&Math.abs(rx*c.CVhz-rz*c.CVhx)<2.6)vm=Math.min(vm,al<7.5?0:(o.cv||0)+Math.sqrt(8*(al-7.5)))}
    if(vm<1e9){c.CVv=c.v;c.v=Math.min(c.v,vm);c.cv=Math.min(c.cv??c.v,vm);if(vm<.5)c.CVfz=[c.a,c.b,c.t]}}}
function CV_post(dt){for(const c of HUB.cars){if(c.CVv!=null){c.v=c.CVv;c.CVv=null}if(c.CVfz){if(!(c.dead>0)){[c.a,c.b,c.t]=c.CVfz;c.cv=0}c.CVfz=null}}
  const im=CV.im;if(im){let n=0;const on=(CV.t*3|0)%2===0;for(const c of HUB.cars){if(!(c.CViT>0))continue;c.CViT-=dt;if(!on||!c.CVn||n>=158||c.dead>0)continue;const rx=c.CVhz*c.CVi*1.55,rz=-c.CVhx*c.CVi*1.55;for(const f of[2.7,-2.7]){_m.makeTranslation(c.x+rx+c.CVhx*f,c.y+1.1,c.z+rz+c.CVhz*f);im.setMatrixAt(n++,_m)}}im.count=n;im.instanceMatrix.needsUpdate=true}
  // the player is free: running a red is just cheeky
  if(RO.on){const hx=Math.sin(RO.h),hz=Math.cos(RO.h);if(CV.ddT>0)CV.ddT-=dt;CV_near(RO.x,RO.z,J=>{if(!J.sig)return false;const d=Math.hypot(RO.x-J.x,RO.z-J.z),pd=J.pd;J.pd=d;if(!(pd>=J.R0&&d<J.R0)||Math.abs(RO.v)<4||CV.ddT>0)return false;let k=-1,bd=.6;J.ap.forEach((g,i)=>{const v=g.dx*hx+g.dz*hz;if(v>bd){bd=v;k=i}});
    if(k>=0&&CV_st(J,k)==='r'){CV.dd++;CV.ddT=3;try{const S2=season();S2.cr+=10;saveSeason(S2);feed('+10 studs DAREDEVIL',0,'#ff7a1c');AU.sfx('near')}catch(e){}}return false})}}
// pedestrians: wait at the kerb of a signalled junction, enter only in the first seconds of the walk phase, hurry across
function CV_pedPre(dt){const P=HUB.peds,N=HUB.nodes;if(!P)return;for(const p of P){p.CVj=null;const A=N[p.a],B=N[p.b];if(!A||!B||p.jy>0)continue;const g=CV.seg.get(p.a*CV.K+p.b),J=g&&!g.pre&&g.J.sig?g.J:null;
  const bx=A.x+(B.x-A.x)*p.t,bz=A.z+(B.z-A.z)*p.t;if(p.CVh){p.v=p.CVh;p.CVh=0}const In=CV_near(bx,bz,J=>J.sig&&Math.hypot(J.x-bx,J.z-bz)<J.R0);if(In){p.CVh=p.v;p.v*=2.2}
  if(!J)continue;const dr=Math.hypot(bx-J.x,bz-J.z)-J.R0;p.CVj=J;p.CVd=dr;if(dr<=0)continue;const w=CV_walk(J);if(w>=0&&w<3.5)continue;
  const L=Math.hypot(B.x-A.x,B.z-A.z)||1;if(dr-p.v*dt*2-.4<0){p.CVs=p.v;p.v=0}}}
function CV_pedPost(){const P=HUB.peds,N=HUB.nodes;if(!P)return;for(const p of P){if(p.CVs!=null){p.v=p.CVs;p.CVs=null}const J=p.CVj;if(!J||!(p.CVd>0))continue;const A=N[p.a],B=N[p.b];if(!A||!B)continue;
  const bx=A.x+(B.x-A.x)*p.t,bz=A.z+(B.z-A.z)*p.t;if(Math.hypot(bx-J.x,bz-J.z)<J.R0&&Math.hypot(bx-J.x,bz-J.z)>J.R0-6){if(CV_walk(J)>=0)CV.pedOK++;else CV.pedBad++}}}
{const _bt=buildHubTraffic;buildHubTraffic=()=>{_bt();try{CV_sigBuild();if(CID==='fra')CV_fraVar()}catch(e){console.warn('CV',e)}}
 const _ht=hubTrafficStep;hubTrafficStep=dt=>{if(!CV.sig.length&&!CV.yl.length||!HUB.cars)return _ht(dt);CV.t+=dt;CV_pre(dt);_ht(dt);CV_post(dt)}
 const _ps=pedStep;pedStep=dt=>{if(!CV.sig.length)return _ps(dt);CV_pedPre(dt);_ps(dt);CV_pedPost()}
 const _ce=CE_streets;CE_streets=(add,rnd,D)=>{_ce(add,rnd,D);try{CV_streets(add,D)}catch(e){console.warn('CV',e)}}}
// ---------- city variety: Athens units (hooked into athBuildG put), per-building seed for height, colour, roof, balconies, shopfront
const CV_AP={poly:['#f4f1ea','#efe3c8','#f2d9b0','#e9e4dc','#f3dcd2','#dfe9ee','#e8d5c0','#f0e0a8','#d8e4d0','#f6e2d6','#cfd8e0','#e9c9a8'],neo:['#efe0bf','#f2d7a0','#e8cfa6','#e6b8a0','#f0c8b8','#dcc8a8','#f3e9d8','#e8d0b0','#c9d6c0'],
  plaka:['#f7f3ea','#f3e3c3','#e8c9a0','#d9e6ef','#f4d8c8','#ffffff','#f1e6b8','#e8b890'],villa:['#ffffff','#fbf6ea','#f6eedc','#fff8f0','#f0e0c8','#e8eef0','#f4e4d4'],glass:['#2f5d73','#3a6a80','#4a7a8a','#2a4a5a','#5a8a98','#3a5a6a']};
function CV_put(E,U,x,z,ry,c,s,fr){const k=U.k,h0=CV_h(x,z),h1=CV_h(x,z,1),h2=CV_h(x,z,2),L=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c],hx=v=>parseInt(v.slice(1),16),q=cityAt(x,z),
  kif=k==='poly'&&q&&q.d<q.road.w/2+32&&/kifis/i.test((q.road.name||'')+(q.road.id||'')),dn=districtAt(x,z)||'';let deco=0,pal=CV_AP[kif?'glass':k]||CV_AP.poly;
  if(k==='poly')U.fl=(f=>typeof OC_fix==='function'?OC_fix({...U,fl:f},x,z).fl:f)(kif?7+Math.floor(h0*6):Math.max(3,Math.min(9,U.fl+[-1,0,0,1,2][Math.floor(h0*5)])));else if(k==='neo'&&!/Plaka/.test(dn))U.fl=Math.max(2,Math.min(4,U.fl+(h0<.3?1:0)));
  let ci=Math.floor(h1*pal.length),P=CV.last;if(P&&Math.hypot(P[0]-x,P[1]-z)<30&&P[2]===U.fl&&P[3]===pal[ci])ci=(ci+1)%pal.length;U.cvc=hx(pal[ci]);
  const{w,d,fh}=U,fl=U.fl,h=fl*fh+(k==='villa'?.4:.6);
  if(kif){E('box',x,.5,z,ry,w+.24,h-.8,d+.24,U.cvc);for(let f=1;f<fl;f++)E('box',x,f*fh-.1,z,ry,w+.34,.32,d+.34,0xd8dde0);E('box',x,h,z,ry,w*.55,2.6,d*.55,0x9aa4aa);deco=9}
  else if(k==='poly'&&fr&&!U.nb){deco=1+Math.floor(h2*4);const ac=hx(CV_pal(['#3f8a4a','#e8822a','#2f7fd0','#c8302a','#d8b030','#7a4a8a','#2a8a8a'],h0*7%1)),[fx,fz]=L(0,d/2+1.05);
    for(let f=1;f<fl;f++){if(deco===2&&(f+Math.floor(h1*3))%3)E('box',fx,f*fh+2.05,fz,ry,w*.8,.1,1.3,ac);else if(deco===3)E('box',fx,f*fh-.2,fz,ry,w-.9,.85,.08,0x8fc4d8);else if(deco===4&&f%2)E('box',fx,f*fh-.2,fz,ry,w*.55,.35,.35,0x4a8a3a)}
    if(h0>.55){const[gx,gz]=L(0,d/2+.08);E('box',gx,.1,gz,ry,w-.6,2.7,.14,hx(CV_pal(['#2c3e48','#4a3a34','#2a4a3a','#3a3a48'],h2)));const[sx,sz]=L(0,d/2+.3);E('box',sx,2.9,sz,ry,w*(.5+h1*.4),.7,.4,hx(CV_pal(['#e8302a','#2a7ad8','#ffcc00','#3aa04a','#ff7a1c','#d6337f','#1fb5b0'],h0*11%1)));deco+=10}}
  else if(k==='neo'){const n=2+Math.floor(h2*3);for(let i=0;i<n;i++){const[px,pz]=L((i/(n-1)-.5)*(w-1.2),d/2+.12);E('box',px,.2,pz,ry,.55,h-.6,.26,0xf8f4ea)}deco=n;if(h1>.5){const[bx,bz]=L(0,d/2+.5);E('box',bx,fh-.05,bz,ry,w*.4,.18,1,0xf6f2e8)}}
  else if(k==='plaka'){const sc=hx(CV_pal(['#2f6f9a','#3a7a4a','#8a2a2a','#5a8aa8','#a8642a'],h2)),[dx,dz]=L((h0-.5)*w*.4,d/2+.06);E('box',dx,0,dz,ry,1.1,2.3,.1,sc);for(let f=0;f<fl;f++)for(const sx of[-.3,.3]){if(f===0&&Math.abs(sx-(h0-.5)*.4)<.2)continue;const[wx,wz]=L(sx*w,d/2+.06);E('box',wx,f*3.3+1.2,wz,ry,.9,1.3,.08,sc)}deco=Math.floor(h2*5)}
  else if(k==='villa'){E('box',x,.02,z,ry,w+7,.07,d+7,0x6a9a4a);for(const[a,b,lw,ld]of[[0,d/2+3.6,w+7.6,.8],[0,-d/2-3.6,w+7.6,.8],[w/2+3.6,0,.8,d+7.6],[-w/2-3.6,0,.8,d+7.6]]){if(b>0&&h1<.5){const[gx,gz]=L(a-(w+7.6)/4-1.5,b);E('box',gx,0,gz,ry,(w+7.6)/2-3,1.3,.8,0x4f7f3a);continue}const[gx,gz]=L(a,b);E('box',gx,0,gz,ry,lw,1.3,ld,0x4f7f3a)}deco=1}
  CV.last=[x,z,U.fl,pal[ci]];CV.bs.push([Math.round(x),Math.round(z),U.fl,U.cvc,deco,k])}
// ---------- Frankfurt: Kenney instances re-shaped per district (height, glass colour, crowns, half-timber) after the build
function CV_fsty(x,z){const n=districtAt(x,z)||'';return /Banken|Bahnhof|Innenstadt|Westhafen|Messe|City/i.test(n)?'bank':/R[öo]mer|Altstadt|Sachsen/i.test(n)?'old':/Westend|Nordend|Bornheim|Bockenheim/i.test(n)?'grz':/Osthafen|Hafen/i.test(n)?'ware':/Ostend|Gallus|Europa/i.test(n)?'off':'mix'}
const CV_FP={bank:['#9ec8e8','#a8e0d8','#d8c8a0','#c8d4e0','#8fb0d8','#e0e8f0','#b8d8c0'],old:['#fff4e0','#f6e0c8','#f8f0d8','#f0d8d0','#e8eef0','#fbe8c0'],grz:['#e8b8a0','#f0d8b0','#e0c8a8','#d8c0b8','#f4e8d0','#c8d0d8'],off:['#d0d8e0','#e8ecf0','#b8c8d8','#c0d0c8','#f0f0f0'],ware:['#c87850','#b86848','#d89068','#a86040','#c8a080'],mix:['#ffffff','#fff0e0','#e8f0ff','#f0ffe8','#ffe8f0','#fff8d8','#f0e8ff']};
function CV_fraVar(){const grp=HUB.grp,BI=new Map();for(const b of HUB.bld)BI.set(Math.round(b.x)+'|'+Math.round(b.z),b);const pos=V3(),qu=new THREE.Quaternion(),sc=V3(),c=new THREE.Color(),cr=[],tb=[];
  for(const im of grp.children){if(!im.isInstancedMesh||!im.userData.ks||im.userData.cv)continue;const g=im.geometry;if(!g.boundingBox)g.computeBoundingBox();const bb=g.boundingBox,hy=bb.max.y,wx=bb.max.x-bb.min.x,wz=bb.max.z-bb.min.z;
    for(let i=0;i<im.count;i++){im.getMatrixAt(i,_m);_m.decompose(pos,qu,sc);const st=CV_fsty(pos.x,pos.z),h0=CV_h(pos.x,pos.z),h1=CV_h(pos.x,pos.z,1),H=hy*sc.y,tall=H>45;
      const f=st==='bank'?(tall?.8+h0*.95:.9+h0*.5):st==='old'?.9+h0*.25:st==='grz'?.95+h0*.2:st==='off'?1+h0*.45:st==='ware'?.75+h0*.2:.88+h0*.35;sc.y*=f;_m.compose(pos,qu,sc);im.setMatrixAt(i,_m);
      im.setColorAt(i,c.set(CV_pal(CV_FP[tall&&st!=='bank'?'off':st],h1)));const b=BI.get(Math.round(pos.x)+'|'+Math.round(pos.z));if(b)b.h*=f;
      if(st==='bank'&&tall||st==='off'&&H*f>60)cr.push([pos.x,pos.z,H*f,wx*sc.x,wz*sc.z,qu.clone(),h0,h1]);else if(st==='old'&&!tall)tb.push([pos.x,pos.z,H*f*.55,wx*sc.x,wz*sc.z,qu.clone()]);CV.fv.push([Math.round(pos.x),Math.round(pos.z),im.id,+(sc.y).toFixed(2),c.getHex()])}
    im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere()}
  const mk=(geo,L,mat,fn)=>{if(!L.length)return;const m=new THREE.InstancedMesh(geo,mat,L.length);L.forEach((e,i)=>{fn(e,i,m)});m.userData.cv=1;m.computeBoundingSphere();grp.add(m)},Q=V3();
  const st=mergeG([cbox(1,.3,1,0,.15,0,'#ffffff'),cbox(.74,.3,.74,0,.45,0,'#ffffff'),cbox(.48,.3,.48,0,.75,0,'#ffffff'),ccyl(.03,.05,.6,0,1.2,0,'#ffffff',6)]),py=mergeG([(()=>{const g=new THREE.ConeGeometry(.72,1,4);g.rotateY(Math.PI/4);g.translate(0,.5,0);return colorize(g,new THREE.Color('#ffffff'))})(),cbox(1,.08,1,0,.04,0,'#ffffff')]);
  const cm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.25,metalness:.6,emissive:0x223344,emissiveIntensity:.4});
  for(const[geo,L]of[[st,cr.filter(e=>e[6]<.55)],[py,cr.filter(e=>e[6]>=.55)]])mk(geo,L,cm,(e,i,m)=>{_m.compose(Q.set(e[0],e[2]-.05,e[1]),e[5],V3(e[3]*.92,10+e[7]*18,e[4]*.92));m.setMatrixAt(i,_m);m.setColorAt(i,new THREE.Color(CV_pal(['#e8f0ff','#ffd27a','#c8d0d8','#9ad8ff','#ff8a6a'],e[7])))});
  // half-timber: dark beams (posts, rails, braces) on all four walls of the old-town houses
  const B=[],bm='#4a2e1c';for(const s of[1,-1]){for(const x of[-.5,-.17,.17,.5])B.push(cbox(.035,1,.02,x,.5,s*.5,bm),cbox(.02,1,.035,s*.5,.5,x,bm));for(const y of[.02,.5,.98])B.push(cbox(1.02,.035,.02,0,y,s*.5,bm),cbox(.02,.035,1.02,s*.5,y,0,bm));
    for(const x of[-.335,.335]){const g=new THREE.BoxGeometry(.03,.6,.02);g.rotateZ(x>0?.6:-.6);g.translate(x,.25,s*.5);B.push(colorize(g,new THREE.Color(bm)));const g2=new THREE.BoxGeometry(.02,.6,.03);g2.rotateX(x>0?.6:-.6);g2.translate(s*.5,.25,x);B.push(colorize(g2,new THREE.Color(bm)))}}
  mk(mergeG(B),tb,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8}),(e,i,m)=>{_m.compose(Q.set(e[0],.3,e[1]),e[5],V3(e[3]+.12,e[2],e[4]+.12));m.setMatrixAt(i,_m)});CV.cr=cr.length;CV.tb=tb.length}
// ---------- street types: tree-lined boulevard medians, tiled pedestrian streets, plaza fountains, small parks
function CV_streets(add,D){const rd=mul(9090),grp=HUB.grp,MP=[],MC=[],TP=[],TU=[],TI=[];let nm=0,nt=0,nf=0,np=0;const has=t=>D[t]?t:'tree',nearJ=(x,z,m)=>JUNC.some(J=>Math.abs(J.x-x)<J.r+m&&Math.abs(J.z-z)<J.r+m&&Math.hypot(J.x-x,J.z-z)<J.r+m);
  const quad=(A,a,b,c,d)=>A.push(...a,...b,...c,...a,...c,...d);
  for(const S of CITY_S){const cl=S.r.cls,P=S.pts,w=S.r.w;if((cl==='arterial'||cl==='ring')&&w>=17&&!S.prof&&S.L>80){for(let i=2;i<P.length-3;i+=2){const p=P[i],o=P[i+2];if(nearJ(p.x,p.z,14)||nearJ(o.x,o.z,14)||onAnyDeck(p.x,p.z)||onAnyDeck(o.x,o.z)||inRiver(p.x,p.z,-2)||(HUB.gates||[]).some(g=>Math.hypot(g.x-p.x,g.z-p.z)<40))continue;
      const y1=Math.min(Math.max(groundY(p.x,p.z),p.y||0),groundY(p.x,p.z)+1.2)+.16,y2=Math.min(Math.max(groundY(o.x,o.z),o.y||0),groundY(o.x,o.z)+1.2)+.16,hw=.85,a=[p.x-p.tz*hw,y1,p.z+p.tx*hw],b=[p.x+p.tz*hw,y1,p.z-p.tx*hw],c=[o.x+o.tz*hw,y2,o.z-o.tx*hw],d=[o.x-o.tz*hw,y2,o.z+o.tx*hw];quad(MP,a,b,c,d);for(let k=0;k<6;k++)MC.push(.38,.56,.27);
      for(const[e,f]of[[a,d],[c,b]]){quad(MP,[e[0],e[1]-.2,e[2]],e,f,[f[0],f[1]-.2,f[2]]);for(let k=0;k<6;k++)MC.push(.85,.83,.8)}nm++;if(i%4===2){add(has(CID==='fra'?'tree':'CE_cypress'),p.x,p.z,rd()*6.28);nt++}else if(rd()<.5)add(has(CID==='fra'?'planter':'bush'),(p.x+o.x)/2,(p.z+o.z)/2,rd()*6.28)}}
    if(cl==='ped'&&S.L>20){const hw=w/2-.6;let u=0;for(let i=0;i<P.length-1;i++){const p=P[i],o=P[i+1],y1=Math.min(Math.max(groundY(p.x,p.z),p.y||0),groundY(p.x,p.z)+1.2)+.075,y2=Math.min(Math.max(groundY(o.x,o.z),o.y||0),groundY(o.x,o.z)+1.2)+.075,l=Math.hypot(o.x-p.x,o.z-p.z);
      quad(TP,[p.x-p.tz*hw,y1,p.z+p.tx*hw],[p.x+p.tz*hw,y1,p.z-p.tx*hw],[o.x+o.tz*hw,y2,o.z-o.tx*hw],[o.x-o.tz*hw,y2,o.z+o.tx*hw]);const u2=u+l/4,v=hw/2;TU.push(0,u,v,u,v,u2,0,u,v,u2,0,u2);u=u2}np++}}
  const mesh=(P,mat,C,U)=>{if(!P.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));if(C)g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));if(U)g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.userData.cv=1;grp.add(m)};
  mesh(MP,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,side:THREE.DoubleSide}),MC);
  if(TP.length){const[cvs,gx]=cv(128,128);gx.fillStyle='#a89a86';gx.fillRect(0,0,128,128);const r=mul(55);for(let y=0;y<8;y++)for(let x=0;x<4;x++){const v=200+r()*40|0;gx.fillStyle=(x+y)%2?`rgb(${v},${v-14},${v-34})`:`rgb(${v-30},${v-46},${v-60})`;gx.fillRect(x*32+(y%2)*16-16+1,y*16+1,30,14);gx.fillRect(x*32+(y%2)*16+16+1,y*16+1,30,14)}
    const t=tex(cvs);t.wrapS=t.wrapT=THREE.RepeatWrapping;KEEP_TEX.add(t);mesh(TP,new THREE.MeshStandardMaterial({map:t,roughness:.8,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}),null,TU)}
  // plazas: a fountain in every square big enough that has none; parks: tree clumps, benches along a cross path
  const F=[];for(const B of HUB.blocks||[]){const w=B.x1-B.x0,d=B.z1-B.z0,cx=(B.x0+B.x1)/2,cz=(B.z0+B.z1)/2;
    if(B.t==='plaza'&&w*d>700&&!/Syntagmat|Avissinias/.test(B.name||'')&&!roamHit(cx,cz,6)){const y=groundY(cx,cz),b={x:cx,z:cz,hw:3.3,hd:3.3,h:y+1.6};F.push(ccyl(3.4,3.6,.75,cx,y+.37,cz,'#e4dccb',20),ccyl(3.05,3.05,.1,cx,y+.66,cz,'#4aa8d8',20),ccyl(.35,.5,2.2,cx,y+1.1,cz,'#e4dccb',10),ccyl(1.3,.8,.4,cx,y+2.3,cz,'#e4dccb',14),ccyl(1.15,1.15,.06,cx,y+2.48,cz,'#7fc8ec',14),ccyl(.08,.3,1.6,cx,y+3.2,cz,'#d8f0ff',8));HUB.bld.push(b);hubGridAdd([b]);nf++}
    if(B.t==='park'&&w>30&&d>30){let n=0;for(let x=B.x0+7;x<B.x1-6;x+=13)for(let z=B.z0+7;z<B.z1-6;z+=13){if(n>60)break;const jx=x+(rd()-.5)*7,jz=z+(rd()-.5)*7;if(Math.abs(jx-cx)<3||Math.abs(jz-cz)<3)continue;const r=rd();if(r<.55){add(has(r<.2&&CID!=='fra'?'CE_olive':'tree'),jx,jz);n++}else if(r<.68)add(has('bush'),jx,jz)}
      for(let s=-1;s<=1;s+=2){add(has('bench'),cx+s*7,cz+2.5,0);add(has('bench'),cx-2.5,cz+s*7,Math.PI/2)}TI.push(n)}}
  if(F.length){const m=new THREE.Mesh(mergeG(F),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5}));m.userData.cv=1;grp.add(m)}
  CV.st={median:nm,medTrees:nt,fountains:nf,pedStreets:np,parks:TI.length,parkTrees:TI.reduce((a,b)=>a+b,0)}}
window.__cvCars=()=>HUB.cars;window.__cvPeds=()=>HUB.peds;window.__cvNodes=()=>HUB.nodes;window.__cvDist=n=>{const D=DIST_R.find(d=>d.name===n);return D&&[(D.x0+D.x1)/2,(D.z0+D.z1)/2]};
window.__cv={CV,st:CV_st,walk:CV_walk,
 info:()=>({rc:CV.rc||0,sig:CV.sig.length,yl:CV.yl.length,heads:CV.sig.reduce((a,J)=>a+J.ap.length,0),seg:CV.seg.size,dd:CV.dd,pedOK:CV.pedOK,pedBad:CV.pedBad,st:CV.st,bs:CV.bs.length,fv:CV.fv.length,cr:CV.cr,tb:CV.tb,dist:[...new Set(DIST_R.map(d=>d.name))]}),
 sigs:()=>CV.sig.map((J,i)=>({i,x:J.x,z:J.z,R0:J.R0,C:J.C,n:J.ap.length,ap:J.ap.map(g=>({dx:g.dx,dz:g.dz,ne:g.e.length,w:g.w}))})),
 // neighbours differ: Athens = consecutive units on a street side; Frankfurt = nearest other building instance
 nbr:()=>{let n=0,df=0;if(CV.bs.length){for(let i=1;i<CV.bs.length;i++){const a=CV.bs[i-1],b=CV.bs[i];if(Math.hypot(a[0]-b[0],a[1]-b[1])>30)continue;n++;if(a[2]!==b[2]||a[3]!==b[3]||a[4]!==b[4]||a[5]!==b[5])df++}}
  else{const L=CV.fv;for(let i=0;i<L.length;i++){let bj=-1,bd=40;for(let j=0;j<L.length;j++){if(i===j)continue;const d=Math.hypot(L[i][0]-L[j][0],L[i][1]-L[j][1]);if(d<bd){bd=d;bj=j}}if(bj<0)continue;n++;const a=L[i],b=L[bj];if(a[2]!==b[2]||Math.abs(a[3]-b[3])>.03||a[4]!==b[4])df++}}return{n,df,frac:n?df/n:0}}};

/* ===== JU · moment-to-moment feel for free roam + missions (module ju.js, inserted before window.__mho; races untouched) =====
   Targets and sources: docs/juice_research.md. Everything wraps existing functions; JU.on=false makes every wrapper pass straight
   through (tJU.js measures before/after on one build). No per-frame allocations: scratch vectors are made once below.
   · camera: lower + tighter at speed, look-ahead into turns, FOV curve, punch on impacts      · hit-stop 65–90 ms on takedowns / big smashes
   · drift tiers paced 0.5/1.1/2.0 s with a tier-up cue, payout grows per tier               · near miss at city speeds
   · landing squash + kick · combo: pulse per link, big pop on cash-out · stud trail when nothing happened for 5 s
   · speed blur / speed lines inside the mission caps · wind + road rumble                      · split-screen: no hit-stop, no camera punch */
const JU={on:true,hold:false,rt:1/60,hs:0,hsCd:0,frz:false,off:0,clk:0,ev:{n:0,m:0,lm:0,last:0,gap:0,k:{}},sm0:0,cr0:0,
  kick:0,la:0,drop:0,fx:0,sq:0,airT0:0,dropT:0,nmF:0,co:new THREE.Vector3(),cf:0,v0:new THREE.Vector3(),v1:new THREE.Vector3(),Y:new THREE.Vector3(0,1,0)};
const JU_C={tierK:.55,tierT:[.5,1.1,2],turbo:[.8,1.6,2.6],bm:[8,18,32],hsTd:.09,hsBig:.075,hsSmall:.065,deadT:Infinity,airMin:.8};
const JU_TC=[new THREE.Color(.6,1.6,2.6),new THREE.Color(2.6,1.2,.3),new THREE.Color(1.8,.6,2.6)];
function JU_ev(k){const E=JU.ev;E.n++;if(JU.clk-E.lm>.3||!E.m)E.m++;E.lm=JU.clk;E.k[k]=(E.k[k]||0)+1;const g=JU.clk-E.last;if(g>E.gap)E.gap=g;E.last=JU.clk}
function JU_roam(){return state==='roam'&&!!pl}
function JU_busy(){return !!(RO.card||RO.mapOpen||RO.story||RO.frozen||RO.wk)}
function JU_split(){try{if(typeof SPLIT!=='undefined'&&SPLIT&&SPLIT.on)return true}catch(e){}return !!window.__splitOn||document.body.classList.contains('split')}
function JU_mis(){return !!(RO.ch&&RO.ch.m&&RO.ch.m.m1)}
const JU_tier=d=>d>JU_C.tierT[2]?3:d>JU_C.tierT[1]?2:d>JU_C.tierT[0]?1:0;
const JU_ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
// passive counters (both builds): every visible reward / feedback event
feed=(f=>function(l,p,c){if(JU_roam())JU_ev(/NEAR MISS/.test(l)?'near':/^AIR /.test(l)?'air':'feed');return f(l,p,c)})(feed);
say=(f=>function(a,b,t){if(JU_roam()&&(a||b))JU_ev('say');return f(a,b,t)})(say);
studGain=(f=>function(v,b){if(JU_roam())JU_ev('stud');return f(v,b)})(studGain);
// ---- hit-stop: the frame clock stands still for JU.hs seconds of real time (sim dt = 0, sound already fired on the impact frame)
function JU_hit(s){if(!JU.on||!JU_roam()||JU_busy()||JU_split())return;const k=fxK();JU.kick=Math.max(JU.kick,Math.min(1,s/JU_C.hsTd)*k);if(JU.hsCd>0||!k)return;JU.hs=Math.max(JU.hs,s);JU.hsCd=.35}
function JU_gate(rt){JU.hsCd=Math.max(0,JU.hsCd-rt);if(JU.hs>0){JU.hs-=rt;JU.frz=true}else JU.frz=false;return JU.frz}
frame=(f=>function(now){if(JU.hold){requestAnimationFrame(frame);composer.render();return}const rt=Math.min(.05,Math.max(0,(now-(JU.ln??now))/1000));JU.ln=now;JU.rt=rt;if(JU_gate(rt))JU.off+=rt*1000;f(now-JU.off);if(state!=='roam'&&pl&&pl.mesh.scale.y!==1)pl.mesh.scale.set(1,1,1)})(frame);
AU.sfx=(f=>function(n){if(JU.on&&state==='roam'&&n==='takedown')JU_hit(JU_C.hsTd);return f.call(this,n)})(AU.sfx);
// big brick sprays: traffic smash (18 × 1.1), big props (18 × 1), mission rams (≥ 18)
debris=(f=>function(at,vel,n,cols,size=1,floor){if(JU.on&&state==='roam'&&n>=18&&size>=1)JU_hit(n*size>19?JU_C.hsBig:JU_C.hsSmall);return f(at,vel,n,cols,size,floor)})(debris);
// ---- combo: pulse on every link, big pop on cash-out
let JU_popEl=null;function JU_pop(a,b,col){if(!JU_popEl){const st=document.createElement('style');st.textContent='#juPop{position:fixed;left:50%;top:38%;transform:translate(-50%,-50%);font:900 italic 46px var(--hud,system-ui);color:#ffd12c;text-shadow:0 3px 0 rgba(0,0,0,.55),0 0 16px rgba(0,0,0,.35);opacity:0;pointer-events:none;z-index:6;text-align:center;white-space:nowrap}#juPop small{display:block;font:800 18px system-ui;letter-spacing:.12em;color:#fff}#juPop.on{animation:juPop 1.2s ease-out forwards}@keyframes juPop{0%{opacity:0;scale:.4}12%{opacity:1;scale:1.25}24%{scale:1}78%{opacity:1}100%{opacity:0;scale:1;translate:0 -30px}}#roamCombo.juP{animation:juCb .22s ease-out}@keyframes juCb{0%{scale:1.3}100%{scale:1}}@media (max-height:520px){#juPop{font-size:28px;top:44%}#juPop small{font-size:13px}}';document.head.appendChild(st);JU_popEl=document.createElement('div');JU_popEl.id='juPop';document.body.appendChild(JU_popEl)}
  JU_popEl.style.color=col||'#ffd12c';JU_popEl.innerHTML=a+(b?`<small>${b}</small>`:'');JU_popEl.classList.remove('on');void JU_popEl.offsetWidth;JU_popEl.classList.add('on');JU_ev('pop')}
comboAdd=(f=>function(k){if(JU_roam())JU_ev('chain');f(k);if(JU.on&&state==='roam'){const el=huQ('#roamCombo');if(el){el.classList.remove('juP');void el.offsetWidth;el.classList.add('juP')}}})(comboAdd);
comboStep=(f=>function(dt){const n0=CB.n,m0=comboMult();f(dt);if(JU.on&&n0>=5&&CB.n===0&&JU_roam()){const bonus=Math.round(n0*2*m0*streetMul());JU_pop(`CHAIN ${n0} ×${m0}`,`+${bonus} STUDS`,['#ffd12c','#ffd12c','#4ceaff','#ff9a3c','#ff9a3c','#ff2d95'][Math.min(5,m0)]);
  const fw=JU.v0.set(Math.sin(RO.h),0,Math.cos(RO.h)),at=JU.v1.set(RO.x,RO.y+2,RO.z);for(let i=0;i<Math.min(10,2+Math.floor(n0/4));i++)studBurst(at,fw,Math.abs(RO.v));AU.sfx(m0>=3?'finish':'style');fovKick=Math.max(fovKick,5+m0);JU.kick=Math.max(JU.kick,.35*fxK())}})(comboStep);
// ---- roam step: clock, drift tiers, near miss, air + landing, stud trail
roamStep=(f=>function(dt){const busy=JU_busy();if(!busy)JU.clk+=dt;if(!JU.on||!pl||!dt)return f(dt);
  const s=pl,d0=RO.dDir,t0=RO.dT||0,tr0=d0?JU_tier(t0):0,a0=!!s.air;f(dt);if(RO.wk||!pl)return;
  // drift: slower charge (tiers at 0.5 / 1.1 / 2.0 s when steering into it), a cue per tier, payout 8 / 18 / 32 % bar + 0.8 / 1.6 / 2.6 s turbo
  if(d0&&RO.dDir){RO.dT=t0+(RO.dT-t0)*JU_C.tierK;const tr=JU_tier(RO.dT);if(tr>tr0){const fx0=Math.sin(RO.h),fz0=Math.cos(RO.h);burst(SPARK,JU.v1.set(RO.x-fx0*3,RO.y+.6,RO.z-fz0*3),10+tr*6,9+tr*3,.35,JU_TC[tr-1]);AU.sfx('style');JU_ev('tier');JU.kick=Math.max(JU.kick,.12*tr*fxK())}}
  else if(d0&&!RO.dDir&&tr0>0){RO.turbo=Math.max(RO.turbo||0,JU_C.turbo[tr0-1]);s.bm=Math.min(100,s.bm+JU_C.bm[tr0-1]-6*tr0);if(tr0===3)JU_pop('ULTRA TURBO','','#c46bff')}
  const sp=Math.abs(RO.v);
  // near miss: a traffic car passes 5–8 m beside us at ≥ 15 m/s (the base one needs 45 m/s); shares the base cooldown c.nm
  if(sp>=15&&!s.air&&!busy&&(JU.nmF=(JU.nmF+1)&1)===0){const fx=Math.sin(RO.vh??RO.h),fz=Math.cos(RO.vh??RO.h);for(const c of HUB.cars){if(c.dead>0||c.x==null)continue;const dx=c.x-RO.x,dz=c.z-RO.z;if(dx*dx+dz*dz>144){c.jpa=null;continue}const al=dx*fx+dz*fz,lat=Math.abs(dx*fz-dz*fx);
    if(c.jpa!=null&&c.jpa>0&&al<=0&&lat>(SC_S&&SC_S.on?2.9:4.8)&&lat<(SC_S&&SC_S.on?5.5:8)&&Math.abs((c.y||0)-RO.y)<3&&!(c.nm>0)){c.nm=3;award(s,'NEAR MISS',6,100,'#4ceaff');AU.sfx('near');comboAdd(2)}c.jpa=al}}
  // air: the base already pays an air bonus over 1 s (roamLanded); here: squash on landing, camera kick on big landings, slight stretch in the air
  if(s.air&&!a0)JU.airT0=JU.clk;else if(!s.air&&a0){const at=JU.clk-JU.airT0;JU.sq=Math.min(.24,.14+at*.1);if(at>=JU_C.airMin)JU.kick=Math.max(JU.kick,Math.min(.45,at*.3)*fxK())}
  JU.sq=Math.max(0,JU.sq-dt*1.1);{const q=s.air?-.05:JU.sq*Math.min(1,JU.sq*8),m=s.mesh.scale;if(Math.abs(m.y-(1-q))>1e-4)m.set(1+q*.45,1-q,1+q*.45)}
  // stud trail: nothing rewarding for 5 s while driving → a fountain of studs on the road ahead (pooled stud meshes)
  JU.dropT=Math.max(0,JU.dropT-dt);if(!busy&&sp>3&&JU.dropT<=0&&JU.clk-JU.ev.last>JU_C.deadT){JU.dropT=2.5;const sg=Math.sign(RO.v||1),fx=Math.sin(RO.h)*sg,fz=Math.cos(RO.h)*sg,ahead=Math.min(45,14+sp*.7);JU.v0.set(fx,0,fz);let n=0;
    for(let k=0;k<6;k++){const x=RO.x+fx*(ahead+k*3.5),z=RO.z+fz*(ahead+k*3.5);if(roamHit(x,z,1,RO.y))break;studBurst(JU.v1.set(x,groundAt(x,z,RO.y+3)+.8,z),JU.v0,0);n++}
    // blocked ahead (a wall, a tight turn): pop them in a ring around the car instead, inside the stud magnet
    if(!n){JU.v0.set(0,0,0);for(let k=0;k<6;k++){const a=k*1.047,x=RO.x+Math.sin(a)*6,z=RO.z+Math.cos(a)*6;if(!roamHit(x,z,1,RO.y))studBurst(JU.v1.set(x,groundAt(x,z,RO.y+3)+.8,z),JU.v0,0)}}}})(roamStep);
// ---- camera: offsets are removed before the base camera runs and re-applied after, so they never feed back into its smoothing
roamCam=(f=>function(dt){const c=camera;c.position.sub(JU.co);c.fov-=JU.cf;JU.co.set(0,0,0);JU.cf=0;f(dt);
  if(!JU.on||!JU_roam()||(typeof M1!=='undefined'&&(M1.cs||M1.tdc&&M1.tdc.t>0))){c.updateProjectionMatrix();return}
  const rt=JU.rt,sp=Math.abs(RO.v),k=clamp(sp/Math.max(30,RO.top||60),0,1.3),e=1-Math.exp(-rt*4),boost=!!pl.nitro;
  JU.drop+=(2.2*SC_cam()*JU_ss(.3,1.05,k)*(pl.air?.3:1)-JU.drop)*e;JU.fx+=((2*JU_ss(.6,1,k)+(boost?2.5:0))-JU.fx)*e;
  JU.la+=(clamp((RO.yr||0)*.07*Math.min(1,sp/20)+(RO.dDir?RO.dDir*.05:0),-.15,.15)-JU.la)*(1-Math.exp(-rt*5));
  if(!JU.frz)JU.kick*=Math.exp(-rt*9);if(JU.kick<.002)JU.kick=0;
  // tighter chase at speed: the base lag lets the camera drift ~30 m back at top speed; keep it within 24 m (boost may stretch to 27)
  const dx=RO.x-c.position.x,dz=RO.z-c.position.z,dh=Math.hypot(dx,dz)||1,lim=(boost?27:24)*SC_cam(),pull=Math.max(0,dh-lim)*.9+JU.kick*1.6;
  JU.co.set(dx/dh*pull,-JU.drop+JU.kick*.5,dz/dh*pull);if(c.position.y+JU.co.y<RO.y+2.2)JU.co.y=RO.y+2.2-c.position.y;c.position.add(JU.co);
  if(JU.la)c.rotateOnWorldAxis(JU.Y,JU.la);
  JU.cf=JU.fx+JU.kick*5;c.fov+=JU.cf;c.updateProjectionMatrix();
  // speed blur + speed lines: capped at the mission limits everywhere (uSpeed ≤ .25, uBoost ≤ .15, lines ≤ .3 in missions)
  const U=FX.uniforms,K=fxK();U.uSpeed.value+=(Math.min(.25,.25*JU_ss(.55,1.1,k))*K-U.uSpeed.value)*e;U.uBoost.value+=((boost?.15:RO.turbo>0?.1:0)*K*TUNE.fxGlow-U.uBoost.value)*e;
  {const el=huQ('#speedFx');if(el){let w=Math.max(boost?clamp(sp/40,0,1)*.85*TUNE.fxLines:0,.32*JU_ss(.7,1.05,k));if(JU_mis())w=Math.min(w,.3);w*=K;const o=+el.style.opacity||0,n=Math.abs(w-o)<.004?w:Math.round((o+(w-o)*.15)*1000)/1000;if(n!==o)el.style.opacity=n}}})(roamCam);
// ---- wind rises with speed relative to the roam top speed, a low road rumble under it (one extra noise loop, made once)
AU.engine=(f=>function(s,thr,on){f.call(this,s,thr,on);if(!JU.on||!this.a||state!=='roam'||!this.wind)return;const t=this.a.currentTime,x=clamp(Math.abs(RO.v)/Math.max(30,RO.top||60),0,1.3);
  if(!this.juR){try{const a=this.a,src=a.createBufferSource();src.buffer=this.nb;src.loop=true;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=110;const g=a.createGain();g.gain.value=0;src.connect(lp);lp.connect(g);g.connect(this.fx);src.start();this.juR=g}catch(e){this.juR={gain:{setTargetAtTime(){}}}}}
  this.wind.g.gain.setTargetAtTime(on?x*x*.3+(s.nitro?.1:0)+(s.air?.1:0):0,t,.1);this.wind.f.frequency.setTargetAtTime(500+x*2200,t,.1);this.juR.gain.setTargetAtTime(on&&!s.air?Math.min(.35,x*.3+JU.sq):0,t,.08)})(AU.engine);
// one deterministic roam frame at 1/60 s (tests), the same order as frame(): hit-stop gate, sim, camera, particles, decays
function JU_step1(){const h=1/60;JU.rt=h;let dt=(paused||JU_gate(h))?0:h;if(dt&&slowmo>0){slowmo-=dt;dt*=.35}T+=dt;if(!RO.frozen)roamStep(dt);roamCam(dt);updPool(SPARK,dt,20);updPool(FIRE,dt,-2);updPool(SMOKE,dt,-1.5);updPool(FIREB,dt,-3);updDebris(dt);updPool(WATER,dt,24);updPool(GLOWP,0);shake=Math.max(0,shake-dt*3);flash=Math.max(0,flash-dt*2.2);hitFx=Math.max(0,hitFx-dt*2.5);FX.uniforms.uCA.value=hitFx*.035+flash*.02}
window.__ju={get JU(){return JU},C:JU_C,on:b=>{JU.on=!!b;if(!JU.on&&pl)pl.mesh.scale.set(1,1,1)},hold:b=>{JU.hold=!!b;JU.ln=null},
  tier:()=>{const d=RO.dDir?RO.dT||0:0;return JU.on?JU_tier(d):d>2?3:d>1.1?2:d>.5?1:0},setBm:v=>{if(pl)pl.bm=v},
  // tests drive like a player: a popped-up card / story panel is dismissed with its own close control
  step:n=>{for(let i=0;i<n;i++){if(JU.autoClose&&(RO.card||RO.story||RO.mapOpen)){if(RO.card){const b=document.querySelector('#rcNo');if(b)b.click();else RO.card=null}if(RO.story)try{storyClose()}catch(e){}if(RO.mapOpen)toggleMap(false);JU.closed=(JU.closed||0)+1}JU_step1()}},autoClose:b=>{JU.autoClose=!!b},debugPop:()=>JU_pop('CHAIN 31 ×3','+186 STUDS','#ff9a3c'),
  reset:()=>{JU.clk=0;JU.ev={n:0,m:0,lm:0,last:0,gap:0,k:{}};JU.sm0=HUB.smashed||0;JU.cr0=season().cr;JU.dropT=0},
  stats:()=>({t:+JU.clk.toFixed(2),ev:JU.ev.n,moments:JU.ev.m,k:{...JU.ev.k},gap:+Math.max(JU.ev.gap,JU.clk-JU.ev.last).toFixed(2),smash:(HUB.smashed||0)-JU.sm0,studs:season().cr-JU.cr0}),
  cam:()=>{const c=camera.position,dx=c.x-RO.x,dz=c.z-RO.z,fw=new THREE.Vector3();camera.getWorldDirection(fw);const ya=Math.atan2(fw.x,fw.z);return{fov:+camera.fov.toFixed(2),h:+(c.y-RO.y).toFixed(2),back:+Math.hypot(dx,dz).toFixed(2),yaw:+(Math.atan2(Math.sin(ya-RO.h),Math.cos(ya-RO.h))*57.3).toFixed(1)}},
  car:()=>({x:RO.x,z:RO.z,y:RO.y,v:RO.v,h:RO.h,top:RO.top,bm:pl?pl.bm:0,boosting:!!RO.boosting,nitro:!!(pl&&pl.nitro),turbo:RO.turbo||0,dDir:RO.dDir||0,dT:RO.dT||0,air:!!(pl&&pl.air),inCity:!!RO.inCity,hp:RO.hp,shake,fovKick,paused:paused||JU.frz,sq:pl?pl.mesh.scale.y:1}),
  fx:()=>({uBoost:FX.uniforms.uBoost.value,uSpeed:FX.uniforms.uSpeed.value,uCA:FX.uniforms.uCA.value,hitFx,flash,shake,speedFx:+(document.querySelector('#speedFx').style.opacity||0)}),
  // test helpers: live traffic cars nearest first (with heading), and freeze one in place (index into HUB.cars, -1 = release)
  cars:()=>{const N=HUB.nodes;return HUB.cars.map((c,i)=>({c,i})).filter(o=>!(o.c.dead>0)&&o.c.x!=null&&N[o.c.a]&&N[o.c.b]).map(({c,i})=>{const A=N[c.a],B=N[c.b];return{i,x:c.x,z:c.z,y:c.y||0,h:Math.atan2(B.x-A.x,B.z-A.z),d:Math.hypot(c.x-RO.x,c.z-RO.z)}}).filter(o=>o.d>40).sort((a,b)=>a.d-b.d).slice(0,40)},
  freezeCar:i=>{if(JU.fzc){const c=JU.fzc;c.v=c.fv0;c.hv=c.fh0;JU.fzc=null}if(i>=0){const c=HUB.cars[i];c.fv0=c.v;c.fh0=c.hv;c.v=0;c.hv=1e-6;c.cv=0;JU.fzc=c}},
  // put the car 26 m behind the nearest live traffic car, on its lane, heading the same way at v m/s
  aimTraffic:(v=38)=>{let b=null,bd=1e9;for(const c of HUB.cars){if(c.dead>0||c.x==null)continue;const d=Math.hypot(c.x-RO.x,c.z-RO.z);if(d<bd&&d>30){bd=d;b=c}}if(!b)return null;const N=HUB.nodes,A=N[b.a],B=N[b.b],L=Math.hypot(B.x-A.x,B.z-A.z)||1,dx=(B.x-A.x)/L,dz=(B.z-A.z)/L;
    RO.x=b.x-dx*26;RO.z=b.z-dz*26;RO.y=groundAt(RO.x,RO.z,b.y+3);RO.vy=0;RO.h=RO.vh=Math.atan2(dx,dz);RO.yr=0;RO.v=v;camSnap=true;return{x:b.x,z:b.z}}};

// ---- W12 · car paint reads as LEGO colours (Bright Red read pink-magenta, blue lavender, yellow pale). Two causes, measured on a side view:
// 1) the player's glossy paint mirrored the sky environment at envMapIntensity 1.2 (traffic is capped at .6): base specular + clearcoat add
//    a blue-white veil, which in sRGB lifts the near-zero channels of a saturated paint (red 208,23,18 → 245,51,69). Env off → 224,6,6.
// 2) the OutputPass Neutral tone map desaturates every pixel whose brightest channel passes ~0.76 toward white; sunlit paint gets there.
// Fix, car materials only (world look unchanged): player paint env capped at .6 like traffic, and a hue-preserving soft knee before the tone
// map keeps a saturated paint's brightest channel under 0.76; white/grey highlights (low saturation) are left to the tone map as before.
const W12P={t:0,K:.55,M:.76,env:.6};
function W12_paint(m){if(!m||m.userData.w12||!(m.isMeshStandardMaterial))return;m.userData.w12=1;const ob=m.onBeforeCompile,pk=m.customProgramCacheKey;
  m.onBeforeCompile=function(sh,r){if(ob)ob.call(this,sh,r);sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>',
   `#include <opaque_fragment>\n{vec3 w12c=gl_FragColor.rgb;float w12p=max(w12c.r,max(w12c.g,w12c.b));if(w12p>${W12P.K.toFixed(3)}){float w12d=${(W12P.M-W12P.K).toFixed(3)},w12s=clamp((w12p-min(w12c.r,min(w12c.g,w12c.b)))/w12p*1.4,0.,1.);
     gl_FragColor.rgb=w12c*mix(1.,(${W12P.K.toFixed(3)}+w12d*(1.-exp(-(w12p-${W12P.K.toFixed(3)})/w12d)))/w12p,w12s);}}`)};
  m.customProgramCacheKey=function(){const cur=this.onBeforeCompile;this.onBeforeCompile=ob;const k=pk.call(this);this.onBeforeCompile=cur;return k+'|w12'};m.needsUpdate=true}
function W12_cars(){try{if(typeof ART10!=='undefined')ART10.mats.forEach(W12_paint)}catch(e){}
  if(typeof pl!=='undefined'&&pl&&pl.mesh)pl.mesh.traverse(o=>{if(o.isMesh)for(const m of[].concat(o.material)){W12_paint(m);if(W12P.env&&m&&m.vertexColors&&!m.transparent&&m.roughness>=.1&&m.userData.a10e!==undefined&&m.userData.a10e>W12P.env){m.userData.a10e=W12P.env;m.envMapIntensity=Math.min(m.envMapIntensity,W12P.env)}}});
  if(HUB&&HUB.cim)for(const k in HUB.cim){const im=HUB.cim[k];if(!im)continue;for(const m of[].concat(im.material))W12_paint(m);const u=im.userData||{};for(const q of[u.w,u.g])if(q)for(const m of[].concat(q.material))W12_paint(m)}}
roamStep=(f=>function(dt){f(dt);const t=performance.now();if(t-W12P.t>500){W12P.t=t;W12_cars()}})(roamStep);
