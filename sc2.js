/* ===== SC2 · humans at 1.8 m, a clear verge between road and facades, forgiving walls (module sc2.js, after sc.js; roam only) =====
   Owner (live v82): "I turn slightly and crash into buildings. Make space between roads and buildings. Humans are still giants."
   · humans: pavement peds + quest/passenger minifigs ~1.85 m; the garage driver in world ships (seated) ~1.6 m standing height;
     Chapter-1 goon cars capped at 5.6 m long, the moped goon 2.2 m with a 1.85 m rider
   · setback: building footprints keep ≥ 3 m from the road edge (Athens per street class, Frankfurt footprint check), colliders follow
   · walls: a glancing hit (< 35°) slides along the wall at ≥ 85% speed and turns the car a little back toward the road; only steeper hits bounce */
Object.assign(SC_K,{ped:.44,fig:.46,drv:2,glance:35,slide:.85,away:.09,goonL:5.6,moped:.62,
  sbA:{ped:3,res:3.6,link:3.6,sec:3.8,main:4,arterial:4.5,hill:3}, // Athens: road reserve beyond the half width (was ped 1.2 · res 2.2 · sec 3 · main 3.2)
  sbF:4});                                                          // Frankfurt: footprint sample points ≥ this beyond the half width (was 2.5)
SC_S.ng=0;
// ---- driver: world ships (shipMesh → GB_attach with cache) get the bigger seated figure; the garage editor (cache=false) keeps its own
GB_attach=(f=>function(g,b,fig,cache){SC_S.drv=!!cache&&SC_S.on;try{return f(g,b,fig,cache)}finally{SC_S.drv=false}})(GB_attach);
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
 ng:()=>SC_S.ng,bh:(x,z)=>!!roamHit(x,z,0,groundY(x,z)+.5),
 humans:()=>{const o={ped:+(((1.25+.32+1.4+.96+.25)*(SC_S.on?SC_K.ped:.66))).toFixed(2)};{const f=minifig('#f00');f.userData.ex.visible=false;const B=new THREE.Box3();f.updateMatrixWorld(true);f.traverse(c=>{if(c.isMesh)B.expandByObject(c)});o.fig=+(B.max.y-B.min.y).toFixed(2)}
  try{const M=[],L=[];GB_figGeo(GB_figGet(),M,L,false);const B=new THREE.Box3();for(const g of M){g.computeBoundingBox();B.union(g.boundingBox)}const k=pl?pl.mesh.userData.m.scale.y:SHIP_K;o.driver=+((B.max.y-B.min.y)*1.5*(SC_S.on?SC_K.drv:1)*k).toFixed(2)}catch(e){o.driver=null}
  o.moped=+(4.01*.75*(SC_S.on?SC_K.moped:1)).toFixed(2);return o},
 peds:()=>(HUB.peds||[]).filter(p=>p._x!=null).map(p=>[p._x,p._z,p.y||0]),
 // share of street-edge samples (every 6 m, both sides, all non-pedestrian streets) with a building collider within d m of the road edge
 verge:(d=3)=>{let n=0,hit=0;for(const S of CITY_S){if(S.r.cls==='ped'||S.r.cls==='hill'||S.r.cls==='quay')continue;const P=S.pts;for(let i=1;i<P.length;i+=2){const p=P[i],tx=p.tx,tz=p.tz;if(tx==null)continue;for(const sd of[-1,1]){const nx=tz*sd,nz=-tx*sd;let bad=false;n++;for(let e=.5;e<=d&&!bad;e+=.5){const x=p.x+nx*(S.r.w/2+e),z=p.z+nz*(S.r.w/2+e);if(roamHit(x,z,0,groundY(x,z)+.5))bad=true}if(bad)hit++}}}if(typeof FILL_R!=='undefined'&&CID==='fra'){try{hubRoads()}catch(e){}for(const r of FILL_R||[])for(let t=3;t<r.L-3;t+=6)for(const sd of[-1,1]){const nx=r.uz*sd,nz=-r.ux*sd,cx=r.x0+r.ux*t,cz=r.z0+r.uz*t;let bad=false;n++;for(let e=.5;e<=d&&!bad;e+=.5){const x=cx+nx*(r.w/2+e),z=cz+nz*(r.w/2+e);if(roamHit(x,z,0,groundY(x,z)+.5))bad=true}if(bad)hit++}}return{n,hit,pct:+(100*hit/Math.max(1,n)).toFixed(2)}},
 streets:(n,minL)=>{const out=[];const L=CITY_S.map((S,i)=>[S,i]).filter(([S])=>S.r.cls!=='ped'&&S.r.cls!=='hill'&&S.r.cls!=='quay'&&!S.r.ab);for(const[S]of L){const P=S.pts;let a=0;for(let i=1;i<P.length;i++){const d=Math.hypot(P[i].x-P[a].x,P[i].z-P[a].z),h0=Math.atan2(P[a+1].x-P[a].x,P[a+1].z-P[a].z),h1=Math.atan2(P[i].x-P[i-1].x,P[i].z-P[i-1].z);if(Math.abs(angDiff(h0,h1))>.25){a=i-1;continue}
   if(d>=minL){const pts=P.slice(a,i+1).map(p=>[p.x,p.z]);if(pts.some(q=>(HUB.gates||[]).some(G=>Math.hypot(G.x-q[0],G.z-q[1])<120)||q[0]<WX0+80||q[0]>WX1-80||q[1]<WZS+80||q[1]>WZN-80||CID==='ath'&&[[0,0],[40,0],[-40,0],[0,40],[0,-40]].some(([a,b])=>{const[e,n]=RW(q[0]+a,q[1]+b);return !athIn(ATHD,e,n)})))break;if(!out.some(o=>Math.hypot(o.pts[0][0]-pts[0][0],o.pts[0][1]-pts[0][1])<300))out.push({w:S.r.w,cls:S.r.cls,pts});break}}if(out.length>=n*3)break}
  return out.sort((a,b)=>a.w-b.w).filter((o,i,A)=>i%Math.max(1,Math.floor(A.length/n))===0).slice(0,n)}});
