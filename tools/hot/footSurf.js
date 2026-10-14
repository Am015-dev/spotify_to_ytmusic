// foot-2 state tests (hot page, sync, < 60 s): ground contact + collision of the ON-FOOT figure. Run: node tools/hot.js eval "$(cat tools/hot/footSurf.js)" --city fra|ath
// A  feet vs the visible surface (instanced patch planes + art-4 draped patch meshes): 200 points per city: ~130 inside dirt/sand/grass patches (surface read off the patch MESH matrix, not the lookup) + the rest on bare ground
//    (terrain + mound); feet = OF.y after the real OF_walk physics settles. Pass: |feet - surface| <= 0.05 m.
// B  push the figure (OF_walk with held run input) into 50 parked cars, 50 props, 20 building walls from a random side; penetration of the walker's circle into the visible
//    footprint = max(0, OF_R - signed distance). Pass: <= 0.1 m.   Prints one JSON line.
(()=>{const t0=performance.now(),out={city:CID,A:{},B:{}},rnd=(()=>{let s=20261014;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296})(),pick=a=>a[Math.floor(rnd()*a.length)];
 if(state!=='roam'||!RO.on)return'not in roam';
{let b=null,n=0;for(const L of HUB.pgrid.values())for(const p of L)if(p.alive&&/^(car\d?|CE_car\d?|CE_tax\w*)$/.test(p.t)&&(++n%7===0)&&!b)b=p;if(!b)for(const L of HUB.pgrid.values()){b=L[0];break}roamWarp(b.x,b.z,0)}OF_go("walk");LF_ensure(RO.x,RO.z,2500);const keepIn=OF_input,keepK=Object.assign({},K);let hold=null;OF_input=()=>hold||{fx:0,fy:0,run:false,jump:false};
 const put=(x,z,y)=>{OF.x=x;OF.z=z;OF.y=y;OF.vx=OF.vz=OF.vy=0;OF.air=true;OF.spd=0;hold=null};
 const settle=(x,z,y0)=>{put(x,z,y0);for(let i=0;i<25;i++)OF_walk(.05);return OF.y};
 const sd=(b,x,z)=>{const dx=x-b.x,dz=z-b.z,lx=dx*b.c-dz*b.s,lz=dx*b.s+dz*b.c,ex=Math.abs(lx)-b.hw,ez=Math.abs(lz)-b.hd;return ex>0&&ez>0?Math.hypot(ex,ez):Math.max(ex,ez)};
 try{
 // ---- A ----
 const pm=(LF.ms||[]).filter(m=>m.userData.lf==='patch'&&m.parent),meshes=pm.filter(m=>m.isInstancedMesh),drp=pm.filter(m=>!m.isInstancedMesh),M=new THREE.Matrix4(),V=new THREE.Vector3(),bad=[];
 let dropped=0,hov=0,bur=0,hmax=-9,hmin=9,rise=0,nP=0,nG=0,wP=0,wG=0,skipped=0,allP=0,allBad=0,allW=0;
 // every loaded patch: lookup plane vs mesh matrix at 9 points each (pure arithmetic)
 for(const m of meshes)for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);if(!M.elements[0]&&!M.elements[8]){dropped++;continue}for(let k=0;k<9;k++){const q=LF_PPOLY[k];V.set(q[0]*.85,.04,q[1]*.85).applyMatrix4(M);const y=LF_patchY(V.x,V.z);allP++;const e=y==null?9:V.y-y;if(e>.02){allBad++;allW=Math.max(allW,e)}const tg=groundY(V.x,V.z)+LF_mound(V.x,V.z),dv=V.y-tg;if(dv>.3)hov++;if(dv<-.05)bur++;hmax=Math.max(hmax,dv);hmin=Math.min(hmin,dv)}}
 out.A.allPatchPts=allP;out.A.droppedSteep=dropped;out.A.floatOver30cm=hov;out.A.buriedOver5cm=bur;out.A.devMax=+hmax.toFixed(2);out.A.devMin=+hmin.toFixed(2);out.A.allBad=allBad;out.A.allWorst=+allW.toFixed(3);
 // 130 patch points through the real foot physics
 const cand=[];for(const m of meshes)for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);if(M.elements[0]||M.elements[8])cand.push([m,i])}
 for(let n=0,tr=0;nP+rise<130&&cand.length&&tr++<800;n++){const[m,i]=pick(cand);m.getMatrixAt(i,M);const q=pick(LF_PPOLY),u=.2+rnd()*.7;V.set(q[0]*u,.04,q[1]*u).applyMatrix4(M);const sx=V.x,sz=V.z,sy=V.y;
  if(roamHit(sx,sz,OF_R+.1,sy+1)||inRiver(sx,sz,0)){skipped++;continue}
  const y=settle(sx,sz,sy+1.2);if(Math.hypot(OF.x-sx,OF.z-sz)>.05){skipped++;continue}
  const e=sy-y;nP++;if(e<-.05){rise++;continue}wP=Math.max(wP,e);if(e>.05)bad.push(['patch',+sx.toFixed(1),+sz.toFixed(1),+(y-sy).toFixed(3)])}
 // 70 bare-ground points near loaded patches (terrain + mound is the visible surface; not on patches / decks / ramps)
 const near=meshes.length?[]:null;if(near)for(const m of meshes){m.getMatrixAt(0,M);near.push([M.elements[12],M.elements[14]])}
 for(let tr=0;nG<70&&near&&near.length&&tr<800;tr++){const c=pick(near),x=c[0]+(rnd()-.5)*160,z=c[1]+(rnd()-.5)*160;
  if(LF_patchY(x,z)!=null||roamHit(x,z,OF_R+.1,5)||inRiver(x,z,2)||onAnyDeck(x,z)||slipY(x,z)!=null||(RO.ramps&&RO.ramps.some(r=>Math.abs(r.x-x)<40&&Math.abs(r.z-z)<40))){skipped++;continue}
  const vis=groundY(x,z)+LF_mound(x,z),y=settle(x,z,vis+1.2);if(Math.hypot(OF.x-x,OF.z-z)>.05){skipped++;continue}
  const e=Math.abs(y-vis);nG++;wG=Math.max(wG,e);if(e>.05)bad.push(['ground',+x.toFixed(1),+z.toFixed(1),+(y-vis).toFixed(3)])}
 // art-6: DRAPED patches (art-4: uneven ones are one merged Mesh per tile, every vertex at ground + 3.5 cm, walk height = terrain): 40 triangle centroids through the real foot physics
 let nD=0,wD=0;{const pv=[];for(const m of drp){const P=m.geometry.attributes.position,I=m.geometry.index.array;for(let t=0;t<I.length;t+=15){const c=[0,1,2].map(k=>I[t+k]);pv.push([0,1,2].map(j=>(P.getComponent(c[0],j)+P.getComponent(c[1],j)+P.getComponent(c[2],j))/3))}}// triangle CENTROIDS (vertices always match)
  for(let tr=0;nD<40&&pv.length&&tr<400;tr++){const[x,y,z]=pick(pv);if(roamHit(x,z,OF_R+.1,y+1)||inRiver(x,z,0)||LF_patchY(x,z)!=null){skipped++;continue}const f=settle(x,z,y+1.2);if(Math.hypot(OF.x-x,OF.z-z)>.05){skipped++;continue}
   const e=Math.abs(f-y);nD++;wD=Math.max(wD,e);if(e>.05)bad.push(['drape',+x.toFixed(1),+z.toFixed(1),+(f-y).toFixed(3)])}}
 out.A.drapeMeshes=drp.length;out.A.drapePts=nD;out.A.drapeWorst=+wD.toFixed(3);
 out.A.patchPts=nP;out.A.coveredByHigherPatch=rise;out.A.patchWorst=+wP.toFixed(3);out.A.groundPts=nG;out.A.groundWorst=+wG.toFixed(3);out.A.skipped=skipped;out.A.bad=bad.slice(0,6);out.A.nBad=bad.length;
 // ---- B ----
 const push=(tx,tz,hw0,start,y)=>{ // walk from `start` toward (tx,tz) at run speed for 3 s
  put(start[0],start[1],y);OF.cy=OF.cyIn=Math.atan2(tx-start[0],tz-start[1]);OF.camT=9;OF.inA=null;hold={fx:0,fy:1,run:true,jump:false};
  for(let i=0;i<60;i++){OF_walk(.05);OF.cy=Math.atan2(tx-OF.x,tz-OF.z)}hold=null;return[OF.x,OF.z]};
 const clearStart=(cx,cz,rad,y,test)=>{for(let k=0;k<12;k++){const a=rnd()*6.283,x=cx+Math.sin(a)*rad,z=cz+Math.cos(a)*rad;if(roamHit(x,z,OF_R+.6,y+1))continue;const q=OF_collide(x,z,y);if(Math.hypot(q[0]-x,q[1]-z)>.01)continue;if(Math.abs(groundAt(x,z,y+1)-y)>.4)continue;if(test&&!test(x,z))continue;return[x,z]}return null};
 const res={cars:{n:0,w:0,bad:[]},props:{n:0,w:0,bad:[]},bld:{n:0,w:0,bad:[]},skip:0};
 const rec=(g,pen,tag)=>{g.n++;g.w=Math.max(g.w,pen);if(pen>.1)g.bad.push([tag,+pen.toFixed(2)])};
 const D=HUB.ptypes,props=[];for(const L of HUB.pgrid.values())for(const p of L)if(p.alive&&D[p.t])props.push(p);
 const carT=/^(car\d?|CE_car\d?|CE_tax\w*)$/,isCar=p=>carT.test(p.t),vis=(p)=>{const f=OF_pf(p.t,D[p.t]);if(f.r!=null)return f.r>0&&!/^(lights|awning|parasol|tlight)$/.test(p.t)?{circ:.3}:null;const cy=Math.cos(p.ry||0),sy=Math.sin(p.ry||0);return{b:{x:p.x+cy*f.ox+sy*f.oz,z:p.z-sy*f.ox+cy*f.oz,hw:f.hw,hd:f.hd,c:cy,s:sy}}};
 const near2=[RO.x,RO.z],byDist=a=>a.filter(p=>Math.hypot(p.x-near2[0],p.z-near2[1])<1500);
 const cars=byDist(props.filter(isCar)),others=byDist(props.filter(p=>!isCar(p)));
 const doProps=(arr,g,N)=>{let tries=0;while(g.n<N&&arr.length&&tries++<N*6){const p=pick(arr),v=vis(p);if(!v){continue}const rad=(v.circ?1:Math.hypot(v.b.hw,v.b.hd))+3.5,y=p.y||groundY(p.x,p.z);
   const s=clearStart(p.x,p.z,rad,y,(x,z)=>{for(const o of props)if(o!==p&&Math.abs(o.x-x)<5&&Math.abs(o.z-z)<5)return false;return true});if(!s){res.skip++;continue}
   const e=push(p.x,p.z,0,s,y+.05),d=v.circ?Math.hypot(e[0]-p.x,e[1]-p.z)-v.circ:sd(v.b,e[0],e[1]);rec(g,Math.max(0,OF_R-d),p.t+'@'+(p.x|0)+','+(p.z|0))}};
 doProps(cars,res.cars,50);doProps(others,res.props,50);
 // every ride CLASS (cars, vans, trucks, buses, scooters...): push into 4 cars per class from rear / front / both sides; visible box = the class's real model bbox (HUB.cim[k])
 {res.rides={n:0,w:0,bad:[]};const seen={};for(const c of HUB.cars){if(c.dead>0||c.x==null||c.x===0&&c.z===0)continue;/* art-6: pooled cars sit at (0,0) until placed (matrix ath k6@0,0) */(seen[c.k]=seen[c.k]||[]).push(c)}
  for(const k in seen){const m=HUB.cim&&HUB.cim[k];if(!m||!m.geometry)continue;m.geometry.computeBoundingBox();const bb=m.geometry.boundingBox,hw=(bb.max.x-bb.min.x)/2,hd=(bb.max.z-bb.min.z)/2,box={hw,hd};
   for(const c of seen[k].slice(0,4)){const h=OF_cH(c),ch=Math.cos(h),sh=Math.sin(h),y=c.y||groundY(c.x,c.z),b={x:c.x,z:c.z,hw,hd,c:ch,s:sh};
    for(const[ax,az,rad]of[[0,-1,hd+3.5],[0,1,hd+3.5],[1,0,hw+3.5],[-1,0,hw+3.5]]){const x=c.x+(ax*ch+az*sh)*rad,z=c.z+(-ax*sh+az*ch)*rad;
     if(roamHit(x,z,OF_R+.6,y+1)||Math.abs(groundAt(x,z,y+1)-y)>.5)continue;const e=push(c.x,c.z,0,[x,z],y+.05);rec(res.rides,Math.max(0,OF_R-sd(b,e[0],e[1])),'k'+k+'@'+(c.x|0)+','+(c.z|0))}}}}
 // building walls
 const blds=[];for(const L of HUB.grid.values())for(const b of L)if((b.h||0)-groundY(b.x,b.z)>3&&(b.y0==null||b.y0<=groundY(b.x,b.z)+1.5)&&Math.hypot(b.x-near2[0],b.z-near2[1])<1500)blds.push(b);
 {let tries=0;while(res.bld.n<20&&blds.length&&tries++<200){const b=pick(blds),rad=Math.hypot(b.hw,b.hd)+3.5,y=groundY(b.x,b.z),bb={x:b.x,z:b.z,hw:b.hw,hd:b.hd,c:b.c==null?1:b.c,s:b.c==null?0:b.s};
   const s=clearStart(b.x,b.z,rad,y,(x,z)=>sd(bb,x,z)>1.5&&sd(bb,x,z)<5);if(!s){res.skip++;continue}const e=push(b.x,b.z,0,s,y+.05);rec(res.bld,Math.max(0,OF_R-sd(bb,e[0],e[1])),'bld@'+(b.x|0)+','+(b.z|0))}}
 res.skip&&(out.B.skip=res.skip);for(const k of['cars','props','bld','rides'])out.B[k]={n:res[k].n,worst:+res[k].w.toFixed(3),nBad:res[k].bad.length,bad:res[k].bad.slice(0,5)};
 }finally{OF_input=keepIn;hold=null}
 out.pass=out.A.allBad===0&&out.A.nBad===0&&out.A.patchPts+out.A.coveredByHigherPatch+out.A.groundPts>=200&&out.B.cars.nBad===0&&out.B.props.nBad===0&&out.B.bld.nBad===0&&out.B.rides.nBad===0&&out.B.rides.n>=20&&out.A.patchPts+out.A.groundPts>=150&&(out.B.cars.n+out.B.rides.n)>=50&&out.B.props.n>=40&&out.B.bld.n>=15;out.ms=Math.round(performance.now()-t0);
 return JSON.stringify(out)})()
