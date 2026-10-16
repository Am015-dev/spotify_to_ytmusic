#!/usr/bin/env node
// pitscan.js: numeric terrain review of a BUILT page (no real-time play). Reusable after any terrain fix.
//   node tools/pitscan.js [out/<ver> | url] [--city fra|ath|both] [--json file.json] [--quick] [--no-ray] [--shots dir]
// A) pits: 10 m grid of groundY, priority-flood fill -> every enclosed basin >3 m deep with its wall slope; steep (>30 deg) cells within 30 m of a road edge / POI.
// B) sink: ~300 random drivable points, warp the car, settle 45 frames, compare wheel + body height to a raycast on the rendered terrain/street meshes (gap >0.1 m).
// C) pass-through: horizontal rays (1 m above ground) from road edges against every solid mesh; hit within 5 m with no collider within 0.5 m = pass-through.
// D) escape: spawn at the 5 worst pits, hold gas 10 s, auto-steer to the nearest road, report stuck yes/no.
// Output: one JSON per city on stdout (--json writes it too); docs/PIT_REVIEW.md is made from it by hand/tools. Page functions below run INSIDE the game (module scope).
const L=require('./qa/lib');const fs=require('fs');
const argv=process.argv.slice(2),flag=n=>argv.includes('--'+n),opt=(n,d)=>{const i=argv.indexOf('--'+n);return i>=0?argv[i+1]:d};
const base=argv[0]&&!argv[0].startsWith('--')?argv[0]:'out/v90m-beta.66';
const QUICK=flag('quick'),ONLY=opt('only','');

// ---------- in-page code (stringified; uses game globals groundY, CITY_S, RF, HUB, RO, roamHit, roamWarp, __qa) ----------
function pageNear(){ // road + POI index
  const S=30,H=new Map(),add=(x,z,k,w)=>{const c=Math.floor(x/S)*100000+Math.floor(z/S);let a=H.get(c);if(!a)H.set(c,a=[]);a.push([x,z,k,w])};
  const pois=[];const P=(n,x,z)=>{if(isFinite(x)&&isFinite(z)){pois.push({n,x,z});add(x,z,'P:'+n,0)}};
  try{for(const l of RF.lm||[])P(l[1]||l[0],l[2],l[3])}catch(e){}
  try{for(const k in RF.spots||{}){const s=RF.spots[k];if(s&&s.length>=2)P(k,s[0],s[1])}}catch(e){}
  try{(RF.taxi||[]).forEach((t,i)=>P('taxi'+i,t[0],t[1]))}catch(e){}
  for(const s of CITY_S){const p=s.pts,w=(s.r.w||8)/2,nm=s.r.name||s.r.id||'road';for(let i=0;i<p.length;i++){add(p[i].x,p[i].z,nm,w);if(i){const a=p[i-1],dx=p[i].x-a.x,dz=p[i].z-a.z,n=Math.floor(Math.hypot(dx,dz)/8);for(let k=1;k<n;k++)add(a.x+dx*k/n,a.z+dz*k/n,nm,w)}}}
  // nearest (edge distance for roads) within R metres: {d,n}
  const near=(x,z,R)=>{let best=1e9,bn='';const c=Math.ceil(R/S),cx=Math.floor(x/S),cz=Math.floor(z/S);for(let a=-c;a<=c;a++)for(let b=-c;b<=c;b++){const A=H.get((cx+a)*100000+cz+b);if(!A)continue;for(const q of A){const d=Math.hypot(q[0]-x,q[1]-z)-q[3];if(d<best){best=d;bn=q[2]}}}return{d:best,n:bn}};
  window.__ps={near,pois,H};return pois.length}
function pageTerrain(o){
  const S=10,x0=WX0,z0=WZS,nx=Math.floor((WX1-WX0)/S),nz=Math.floor((WZN-WZS)/S),N=nx*nz,h=new Float32Array(N);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)h[j*nx+i]=groundY(x0+i*S,z0+j*S);
  const sl=new Float32Array(N);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,v=h[k];let m=0;if(i>0)m=Math.max(m,Math.abs(v-h[k-1]));if(i<nx-1)m=Math.max(m,Math.abs(v-h[k+1]));if(j>0)m=Math.max(m,Math.abs(v-h[k-nx]));if(j<nz-1)m=Math.max(m,Math.abs(v-h[k+nx]));sl[k]=Math.atan(m/S)*57.2958}
  // priority flood (edges drain to the outside)
  const F=new Float32Array(h),seen=new Uint8Array(N),hk=new Float32Array(N+1),hi=new Int32Array(N+1);let hn=0;
  const push=(k,v)=>{let i=++hn;while(i>1&&hk[i>>1]>v){hk[i]=hk[i>>1];hi[i]=hi[i>>1];i>>=1}hk[i]=v;hi[i]=k};
  const pop=()=>{const k=hi[1],v=hk[hn],ik=hi[hn];hn--;let i=1;for(;;){let c=i*2;if(c>hn)break;if(c<hn&&hk[c+1]<hk[c])c++;if(hk[c]>=v)break;hk[i]=hk[c];hi[i]=hi[c];i=c}hk[i]=v;hi[i]=ik;return k};
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(i===0||j===0||i===nx-1||j===nz-1){const k=j*nx+i;seen[k]=1;push(k,h[k])}
  while(hn){const k=pop(),v=F[k],i=k%nx,j=(k/nx)|0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=nz)continue;const q=b*nx+a;if(seen[q])continue;seen[q]=1;if(F[q]<v)F[q]=v;push(q,F[q])}}
  const px=k=>x0+(k%nx)*S,pz=k=>z0+((k/nx)|0)*S,near=window.__ps.near;
  // basins
  const lab=new Int32Array(N),pits=[];let id=0;
  for(let s=0;s<N;s++){if(lab[s]||F[s]-h[s]<.25)continue;id++;const st=[s];lab[s]=id;let mx=0,mk=s,n=0,rim=0,rk=s,sx=0,sz=0;const ring=new Set();
    while(st.length){const k=st.pop();n++;const f=F[k]-h[k];if(f>mx){mx=f;mk=k}sx+=px(k);sz+=pz(k);if(sl[k]>rim){rim=sl[k];rk=k}
      const i=k%nx,j=(k/nx)|0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=nz)continue;const q=b*nx+a;if(F[q]-h[q]>=.25){if(!lab[q]){lab[q]=id;st.push(q)}}else ring.add(q)}}
    let sp=1e9,spk=s;for(const q of ring)if(h[q]<sp){sp=h[q];spk=q}
    for(const q of ring)if(sl[q]>rim){rim=sl[q];rk=q}
    if(mx>=3){const x=px(mk),z=pz(mk),nr=near(x,z,400);pits.push({x:Math.round(x),z:Math.round(z),depth:+mx.toFixed(1),floorY:+h[mk].toFixed(1),rimY:+F[mk].toFixed(1),rimSlope:+rim.toFixed(0),spillSlope:+sl[spk].toFixed(0),spillAt:[Math.round(px(spk)),Math.round(pz(spk))],rimAt:[Math.round(px(rk)),Math.round(pz(rk))],areaM2:n*S*S,nearM:Math.round(nr.d),near:nr.n})}}
  pits.sort((a,b)=>b.depth-a.depth);
  // steep cells near a road edge / POI (<=30 m): cluster
  const hot=[],lab2=new Int32Array(N),cand=k=>sl[k]>30;let id2=0,nSteep=0;
  for(let s=0;s<N;s++){if(!cand(s)||lab2[s])continue;nSteep++;const x=px(s),z=pz(s);if(near(x,z,30).d>30)continue; // cheap reject of the seed only; cluster grows over steep cells
    id2++;const st=[s];lab2[s]=id2;let n=0,best=0,bk=s,close=1e9,cn='',cx=0,cz=0;
    while(st.length){const k=st.pop();n++;if(sl[k]>best){best=sl[k];bk=k}const nr=near(px(k),pz(k),30);if(nr.d<close){close=nr.d;cn=nr.n;cx=px(k);cz=pz(k)}
      const i=k%nx,j=(k/nx)|0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=nz)continue;const q=b*nx+a;if(cand(q)&&!lab2[q]){lab2[q]=id2;st.push(q)}}}
    if(close<=30)hot.push({x:Math.round(cx),z:Math.round(cz),maxSlope:+best.toFixed(0),cells:n,roadDist:+close.toFixed(0),near:cn,peakAt:[Math.round(px(bk)),Math.round(pz(bk))],y:+h[bk].toFixed(1)})}
  hot.sort((a,b)=>b.maxSlope-a.maxSlope||b.cells-a.cells);
  const loc=pits.filter(p=>p.areaM2<=250000&&p.nearM<=600);
  return{grid:[nx,nz],S,pitsTotal:pits.length,valleys:pits.filter(p=>p.areaM2>250000).length,pitsLocalNear:loc.length,pitsLocalNearSteep:loc.filter(p=>p.rimSlope>25).length,pits:loc.slice(0,80),farOrBig:pits.filter(p=>!(p.areaM2<=250000&&p.nearM<=600)).slice(0,10),hotTotal:hot.length,hot:hot.slice(0,60),steepCells:nSteep}}
function pageSink(o){ // o={n,seed}
  let s=o.seed;const R=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},near=window.__ps.near;
  // ground meshes: big terrain tiles + street/junction ribbons
  const T=[],Rm=new Set([HUB.M.street,HUB.M.resSt,HUB.M.jn,HUB.M.dirt].filter(Boolean)),bx=new THREE.Box3();
  scene.traverse(m=>{if(!m.isMesh||m.isInstancedMesh||!m.geometry||!m.geometry.attributes.position)return;const g=m.geometry;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox,w=b.max.x-b.min.x,d=b.max.z-b.min.z;
    if(Rm.has(m.material))T.push(m);else if(w>200&&d>200&&g.attributes.position.count>1000&&b.max.y-b.min.y>1)T.push(m)});
  const rc=new THREE.Raycaster(),dn=new THREE.Vector3(0,-1,0),org=new THREE.Vector3();
  const meshY=(x,z)=>{const g0=groundY(x,z);org.set(x,g0+15,z);rc.set(org,dn);rc.far=30;let best=NaN,bd=1e9;for(const m of T){const b=m.geometry.boundingBox;if(x<b.min.x-1||x>b.max.x+1||z<b.min.z-1||z>b.max.z+1)continue;m.updateWorldMatrix(true,false);for(const h of rc.intersectObject(m,false)){const d=Math.abs(h.point.y-g0);if(d<bd){bd=d;best=h.point.y}}}return best};
  // candidate points: half on roads, half on open ground within 200 m of a road; slope <25 deg, no collider, not under a deck
  const pts=[];let tries=0;const roads=[];for(const c of CITY_S)for(let i=0;i<c.pts.length;i+=3)roads.push(c.pts[i]);
  while(pts.length<o.n&&tries++<o.n*400){let x,z,kind;if(pts.length%2===0){const p=roads[Math.floor(R()*roads.length)];x=p.x+(R()-.5)*4;z=p.z+(R()-.5)*4;kind='road'}else{const p=roads[Math.floor(R()*roads.length)],a=R()*6.283,r=30+R()*170;x=p.x+Math.cos(a)*r;z=p.z+Math.sin(a)*r;kind='open'}
    if(x<WX0+60||x>WX1-60||z<WZS+60||z>WZN-60)continue;let under=false;for(const b of ALL_DECKS){const hh=deckAt(b,x,z);if(hh!=null&&hh>.2){under=true;break}}if(under)continue;
    const e=3,sx=(groundY(x+e,z)-groundY(x-e,z))/(2*e),sz=(groundY(x,z+e)-groundY(x,z-e))/(2*e);if(Math.atan(Math.hypot(sx,sz))*57.3>25)continue;if(roamHit(x,z,2.6,groundY(x,z)+1))continue;pts.push({x,z,kind})}
  const out=[];let step=0;
  for(const p of pts){try{roamWarp(p.x,p.z,R()*6.28,true)}catch(e){}RO.v=0;RO.vy=0;__qa.step(45);
    const ud=pl&&pl.mesh&&pl.mesh.userData;if(!ud||!ud.m)continue;ud.m.updateMatrixWorld(true);
    const ws=[];ud.m.traverse(w=>{if(!w.isMesh||!w.userData.r)return;let v=true,q=w;while(q&&q!==ud.m){if(!q.visible)v=false;q=q.parent}if(v)ws.push(w)});
    const v3=new THREE.Vector3(),sc=new THREE.Vector3();let wg=0,wgAt=null,lo=1e9;
    for(const w of ws){w.getWorldPosition(v3);w.getWorldScale(sc);const my=meshY(v3.x,v3.z),gap=v3.y-w.userData.r*sc.y-my;if(isFinite(gap)&&Math.abs(gap)>Math.abs(wg)){wg=gap;wgAt=[+v3.x.toFixed(1),+v3.z.toFixed(1)]}}
    let bs=0,bsAt=null;try{const pp=CR_bodyPts(ud);let c=0;for(const q of pp){if((c++)%3)continue;v3.copy(q).applyMatrix4(ud.m.matrixWorld);const my=meshY(v3.x,v3.z),d=v3.y-my;if(isFinite(d)&&d<bs){bs=d;bsAt=[+v3.x.toFixed(1),+v3.z.toFixed(1)]}}}catch(e){}
    const ga=groundAt(RO.x,RO.z,RO.y+1.5),my0=meshY(RO.x,RO.z);
    out.push({x:+RO.x.toFixed(1),z:+RO.z.toFixed(1),kind:p.kind,wheelGap:+wg.toFixed(2),bodyGap:+bs.toFixed(2),physVsMesh:+(ga-my0).toFixed(2),wheels:ws.length,at:wgAt||bsAt})}
  return{tiles:T.length,n:out.length,pts:out}}
function pageThrough(o){ // warp to N road-edge samples (streams the chunks in), horizontal rays at 1 m above ground, hit <=5 m with no collider within .5 m = pass-through
  let s=o.seed;const R=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const skip=new Set([HUB.M.street,HUB.M.resSt,HUB.M.jn,HUB.M.dirt,HUB.M.walk,HUB.M.road,HUB.M.grass,HUB.M.cobble,HUB.M.yard].filter(Boolean));
  const rc=new THREE.Raycaster(),org=new THREE.Vector3(),dir=new THREE.Vector3(),wb=new THREE.Box3(),propIM=new Set(HUB.props.map(q=>q.im));
  const roads=[];for(const c of CITY_S)for(let i=0;i<c.pts.length;i+=2)roads.push([c.pts[i],c.r.w||8,c.r.name||c.r.id||'road']);
  const res=[];let rays=0,hits=0,meshes=0;
  for(let n=0;n<o.n;n++){const[p,w,nm]=roads[Math.floor(R()*roads.length)];try{roamWarp(p.x,p.z,R()*6.28,true)}catch(e){}__qa.step(60);
    const M=[],bbs=[];scene.traverse(m=>{if(!m.isMesh||propIM.has(m)||!m.geometry||!m.geometry.attributes.position||skip.has(m.material)||!m.visible)return;if(m.material&&(m.material.transparent||m.material.opacity<1))return;let q=m;while(q){if(q===pl.mesh)return;q=q.parent}
      const g=m.geometry;if(!g.boundingBox)g.computeBoundingBox();m.updateWorldMatrix(true,false);let bb=g.boundingBox;if(m.isInstancedMesh){if(!m.boundingBox&&m.computeBoundingBox)m.computeBoundingBox();bb=m.boundingBox||null}if(bb)wb.copy(bb).applyMatrix4(m.matrixWorld);else wb.set(new THREE.Vector3(-1e9,-1e9,-1e9),new THREE.Vector3(1e9,1e9,1e9));if(wb.max.x-wb.min.x>300&&wb.max.z-wb.min.z>300)return;if(wb.min.x>p.x+30||wb.max.x<p.x-30||wb.min.z>p.z+30||wb.max.z<p.z-30)return;M.push(m);bbs.push(wb.clone())});meshes+=M.length;
    for(let e=0;e<3;e++){const a=R()*6.283,off=w/2+.5,x=p.x+Math.cos(a)*off,z=p.z+Math.sin(a)*off,y=groundY(x,z)+1;
      for(let k=0;k<4;k++){const ang=a+k*1.5708;dir.set(Math.cos(ang),0,Math.sin(ang));org.set(x,y,z);rc.set(org,dir);rc.far=5;rays++;let best=null;
        for(let i=0;i<M.length;i++){const b=bbs[i];if(x<b.min.x-5||x>b.max.x+5||z<b.min.z-5||z>b.max.z+5||y<b.min.y||y>b.max.y)continue;const h=rc.intersectObject(M[i],false);if(h.length&&(!best||h[0].distance<best.distance))best={distance:h[0].distance,point:h[0].point.clone(),n:h[0].face?h[0].face.normal.y:0,m:M[i]}}
        if(!best||Math.abs(best.n)>.8)continue;hits++;const hp=best.point;let cd=1e9;
        for(let da=-1;da<=1;da++)for(let db=-1;db<=1;db++){const LL=HUB.grid.get((Math.floor(hp.x/40)+da)*10000+Math.floor(hp.z/40)+db);if(!LL)continue;for(const b of LL){if(b.h&&hp.y>b.h+.5)continue;const dx=hp.x-b.x,dz=hp.z-b.z;let lx=dx,lz=dz;if(b.c!=null){lx=dx*b.c-dz*b.s;lz=dx*b.s+dz*b.c}const ex=Math.max(0,Math.abs(lx)-b.hw),ez=Math.max(0,Math.abs(lz)-b.hd),d=Math.hypot(ex,ez);if(d<cd)cd=d}}
        if(cd>.5)res.push({x:+hp.x.toFixed(1),z:+hp.z.toFixed(1),y:+hp.y.toFixed(1),hitDist:+best.distance.toFixed(1),colDist:cd>1e8?null:+cd.toFixed(1),what:(best.m.name||(best.m.parent&&best.m.parent.name)||best.m.material.type)+'/v'+best.m.geometry.attributes.position.count,road:nm})}}}
  const seen=new Set(),u=[];for(const r of res){const k=Math.round(r.x/3)+','+Math.round(r.z/3);if(seen.has(k))continue;seen.add(k);u.push(r)}
  return{avgMeshes:Math.round(meshes/o.n),rays,solidHits:hits,noCollider:u.length,list:u.slice(0,80)}}
function pageEscape(o){ // o={spots:[{x,z,roadX,roadZ,rimY}],sec}
  const res=[];const K_=K;let sign=null;
  const run=(sp)=>{try{roamWarp(sp.x,sp.z,0,true)}catch(e){}RO.v=0;RO.vy=0;RO.x=sp.x;RO.z=sp.z;RO.y=groundY(sp.x,sp.z)+.5;__qa.step(30);const sx=RO.x,sz=RO.z,sy=RO.y;let path=0,lx=sx,lz=sz,minD=1e9,tmax=0;
    const tgt=sp.road;K_.ArrowUp=true;
    for(let t=0;t<o.sec;t++){for(let f=0;f<6;f++){const hd=Math.atan2(tgt[0]-RO.x,tgt[1]-RO.z);let df=hd-RO.h;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;
        const want=Math.abs(df)<.08?0:(df>0?1:-1);K_.ArrowRight=want*sign>0;K_.ArrowLeft=want*sign<0;__qa.step(10);path+=Math.hypot(RO.x-lx,RO.z-lz);lx=RO.x;lz=RO.z;const d=Math.hypot(tgt[0]-RO.x,tgt[1]-RO.z);if(d<minD)minD=d}}
    K_.ArrowUp=K_.ArrowLeft=K_.ArrowRight=false;__qa.step(5);
    const d0=Math.hypot(tgt[0]-sx,tgt[1]-sz),d1=Math.hypot(tgt[0]-RO.x,tgt[1]-RO.z),dy=RO.y-sy;
    return{x:Math.round(sp.x),z:Math.round(sp.z),startY:+sy.toFixed(1),endY:+RO.y.toFixed(1),rimY:sp.rimY,moved:+Math.hypot(RO.x-sx,RO.z-sz).toFixed(0),path:+path.toFixed(0),d0:+d0.toFixed(0),d1:+d1.toFixed(0),minD:+minD.toFixed(0),out:RO.y>=sp.rimY-.5||d1<=sp.roadHw+3,stuck:!(RO.y>=sp.rimY-.5||d1<=sp.roadHw+3)}};
  // steering sign probe: which key turns h up?
  {RO.v=0;K_.ArrowUp=true;K_.ArrowRight=true;const h0=RO.h;__qa.step(40);let d=RO.h-h0;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;K_.ArrowUp=K_.ArrowRight=false;__qa.step(30);sign=d>=0?1:-1}
  for(const sp of o.spots)res.push(run(sp));return{sign,res}}

// ---------- node driver ----------
async function city(c){
  const A=await L.open({base,city:c});const p=A.p,t0=Date.now(),out={city:c,build:await L.ev(p,'OD_CHANGELOG[0].v')};
  const log=(m)=>console.error(`[${c}] ${((Date.now()-t0)/1000).toFixed(0)}s ${m}`);
    const call=async(fn,arg)=>{const r=await L.ev(p,'(()=>{const ARG='+JSON.stringify(arg||{})+';return JSON.stringify(('+fn.toString()+')(ARG))})()');if(typeof r==='string'&&r.startsWith('ERR'))throw new Error(fn.name+' '+r);return JSON.parse(r)};
  out.pois=await call(pageNear);log('index '+out.pois+' POIs');
  out.terrain=await call(pageTerrain);log(`A pits ${out.terrain.pitsTotal}, steep clusters ${out.terrain.hotTotal}`);
  if(ONLY==='terrain'){await A.close();return out}
  out.sink=await call(pageSink,{n:QUICK?30:300,seed:90166});out.sink.bad=out.sink.pts.filter(r=>Math.abs(r.wheelGap)>.1||r.bodyGap<-.1);log(`B sink ${out.sink.bad.length}/${out.sink.n} >0.1 m`);
  if(!flag('no-ray')){out.through=await call(pageThrough,{n:QUICK?15:120,seed:7});log(`C through ${out.through.noCollider}/${out.through.solidHits} solid hits`)}
  // D: five worst pits. spawn at the pit floor, aim at the nearest road/POI (found in-page)
  const worst=out.terrain.pits.slice(0,5);
  if(worst.length){const sp=await call(o=>o.p.map(q=>{const nr=window.__ps.near(q.x,q.z,1500);let best=null,bd=1e9;for(const[k,A]of window.__ps.H)for(const a of A){if(a[2].startsWith('P:')&&false)continue;const d=Math.hypot(a[0]-q.x,a[1]-q.z);if(d<bd){bd=d;best=a}}return{x:q.x,z:q.z,rimY:q.rimY,road:[best[0],best[1]],roadHw:best[3],near:best[2]}}),{p:worst});
    const e=await call(pageEscape,{spots:sp,sec:10});out.escape=e.res.map((r,i)=>Object.assign({pit:i+1,depth:worst[i].depth,near:sp[i].near},r));log('D escape '+out.escape.filter(r=>r.stuck).length+'/'+out.escape.length+' stuck')}
  await A.close();return out}
(async()=>{const which=opt('city','both'),cs=which==='both'?['fra','ath']:[which],all={};
  for(const c of cs)all[c]=await city(c);
  const js=JSON.stringify(all);if(opt('json'))fs.writeFileSync(opt('json'),js);
  const sm=Object.values(all).map(r=>`${r.city}: pits>3m ${r.terrain.pitsTotal} (rim>25deg ${r.terrain.pits.filter(x=>x.rimSlope>25).length}) | steep>30deg near road/POI ${r.terrain.hotTotal} | sink/float>0.1m ${r.sink?r.sink.bad.length+'/'+r.sink.n:'-'} | pass-through ${r.through?r.through.noCollider:'-'} | stuck ${r.escape?r.escape.filter(x=>x.stuck).length+'/'+r.escape.length:'-'}`);
  console.log(sm.join('\n'));})().catch(e=>{console.error(e);process.exit(1)});
