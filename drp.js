// DR probe (measurement only, changes nothing): window.__dr.* used by tDR.js for before/after numbers
function DR_edge(x,z){let e=1e9;const q=cityAt(x,z);if(q){e=q.d-q.road.w/2;if(e<6&&e>-.5)e=Math.min(e,CE_roadE(x,z))}const f=fillAt(x,z);if(f)e=Math.min(e,f.d-f.r.w/2);
  if(CID!=='fra'){try{const a=abAt(x,z);if(a)e=Math.min(e,a.d-a.road.w/2)}catch(_){}}try{e=Math.min(e,lzRoadD(x,z))}catch(_){}return e}
window.__dr={edge:DR_edge,
 props(x,z,R=1e9){const o={total:0,road:0,path:0,side:0,lamp:0,types:{}};for(const p of HUB.props||[]){if(!p.alive&&!(p.rt<1e8))continue;if(R<1e9&&Math.hypot(p.x-x,p.z-z)>R)continue;o.total++;const e=DR_edge(p.x,p.z);if(e<0){o.road++;o.roadT=o.roadT||{};o.roadT[p.t]=(o.roadT[p.t]||0)+1}if(e<2.5){o.path++;o.types[p.t]=(o.types[p.t]||0)+1}else if(e<6)o.side++}return o},
 traffic(R=150){const C=HUB.cars||[];let alive=0,near=0,stop=0;for(const c of C){if(c.dead>0)continue;alive++;if(Math.hypot(c.x-RO.x,c.z-RO.z)<R){near++;if((c.cv??c.v)<.5)stop++}}return{total:C.length,alive,near,stop}},
 objs(){let n=0,m=0,im=0,inst=0;scene.traverse(o=>{n++;if(o.isMesh&&o.visible){m++;if(o.isInstancedMesh){im++;inst+=o.count}}});return{objs:n,meshes:m,instMeshes:im,instances:inst}},
 draws(){renderer.info.autoReset=false;renderer.info.reset();(window.__fastR||composer.render).call(composer);const r={calls:renderer.info.render.calls,tris:renderer.info.render.triangles};renderer.info.autoReset=true;return r},
 // keyboard bot along the street-graph path between two points; returns average km/h, min, stuck seconds, hits
 drive(x0,z0,x1,z1,maxS=150){const M=__mho,R=RO,K=M.K;const q0=M.rsnap(x0,z0,400),q1=M.rsnap(x1,z1,400);const P=M.qv.path(q0[0],q0[1],q1[0],q1[1]).P;if(!P||P.length<5)return{skip:1};if(P.some(q=>(HUB.gates||[]).some(g=>Math.hypot(g.x-q[0],g.z-q[1])<90)))return{skip:'gate'};
  M.warp(P[0][0],P[0][1],Math.atan2(P[2][0]-P[0][0],P[2][1]-P[0][1]));M.roamSim(3);const cum=[0];for(let k=1;k<P.length;k++)cum.push(cum[k-1]+Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]));
  const sm0=HUB.smashed||0;let i=0,t=0,sv=0,st=0,mst=0,slow=0,drops=0,pv=0,minRet=1;for(t=0;t<maxS*60;t++){let bj=i,bd=1e9;for(let k=i;k<Math.min(P.length,i+60);k++){const d=Math.hypot(P[k][0]-R.x,P[k][1]-R.z);if(d<bd){bd=d;bj=k}}i=bj;
   let k=i;while(k<P.length-1&&cum[k]-cum[i]<9+Math.abs(R.v)*.35)k++;let a=Math.atan2(P[k][0]-R.x,P[k][1]-R.z)-R.h;a=Math.atan2(Math.sin(a),Math.cos(a));const vt=40*Math.max(.35,1-Math.abs(a)*.9);
   K.ArrowLeft=a>.035;K.ArrowRight=a<-.035;K.ArrowUp=R.v<vt;K.ArrowDown=R.v>vt+6;const s0=HUB.smashed;const v0=Math.abs(R.v);M.roamSim(1);const v1=Math.abs(R.v);if(HUB.smashed>s0&&v0>5)minRet=Math.min(minRet,v1/v0);
   sv+=v1;if(v1<2)st++;else st=0;mst=Math.max(mst,st);if(v1<4)slow++;if(i>=P.length-3)break}
  K.ArrowLeft=K.ArrowRight=K.ArrowUp=K.ArrowDown=false;const n=t+1;return{len:Math.round(cum[cum.length-1]),s:+(n/60).toFixed(1),kmh:+(sv/n*3.6).toFixed(1),vavg:+(sv/n*3.6).toFixed(1),stuck:+(mst/60).toFixed(1),slowS:+(slow/60).toFixed(1),smash:(HUB.smashed||0)-sm0,minRet:+minRet.toFixed(3),done:i>=P.length-3}},
 dist(n){const D=(typeof DIST_R!=='undefined'?DIST_R:[]).find(d=>d.name===n);return D&&[(D.x0+D.x1)/2,(D.z0+D.z1)/2]},
 dists(){return typeof DIST_R!=='undefined'?[...new Set(DIST_R.map(d=>d.name))]:[]},
 bounds(){return{HX0,HX1,HZS,HZN}},
 blocks(){const o={};for(const B of HUB.blocks||[])o[B.t]=(o[B.t]||0)+1;return o}};
