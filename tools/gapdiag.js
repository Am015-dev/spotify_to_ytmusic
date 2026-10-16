// gapdiag.js (terr-9): 1000 off-road points, drawn ground (userData.trG meshes) minus drive height; prints n, bad (>0.1 m), drawn tris, worst points with the hit triangle size and its vertex error vs groundY.
//   node tools/gapdiag.js out/<ver> fra|ath
const L=require("./qa/lib");
const base=process.argv[2],city=process.argv[3]||'fra';
(async()=>{const A=await L.open({base,city});const p=A.p;
const js=`(()=>{const G=[];HUB.grp.updateMatrixWorld(true);HUB.grp.traverse(m=>{if(m.isMesh&&m.userData.trG)G.push(m)});const RC=new THREE.Raycaster(),r=TR6_rnd(4242);let k=0;const W=[];let bad=0;
for(let t=0;t<40000&&k<1000;t++){const x=HX0+(HX1-HX0)*r(),z=HZS+(HZN-HZS)*r();if(ART7_rd(x,z)<2||rivClear(x,z)<8)continue;const g=groundY(x,z);if(g<-1)continue;
RC.set(new THREE.Vector3(x,g+400,z),new THREE.Vector3(0,-1,0));RC.far=800;const h=RC.intersectObjects(G,false)[0];if(!h)continue;k++;const d=h.point.y-groundAt(x,z,g+.3);if(d>.1){bad++;
const P=h.object.geometry.attributes.position,f=h.face,vs=[f.a,f.b,f.c].map(i=>[P.getX(i),P.getY(i),P.getZ(i)]);const ext=Math.max(...vs.map(v=>v[0]))-Math.min(...vs.map(v=>v[0]));const vd=vs.map(v=>+(v[1]-groundY(v[0],v[2])).toFixed(2));
W.push({x:Math.round(x),z:Math.round(z),d:+d.toFixed(2),tri:+ext.toFixed(1),vd:vd.join('/'),rd:+ART7_rd(x,z).toFixed(0),far:ART7_far(x-ext/2,z-ext/2,ext,ext)})}}
W.sort((a,b)=>b.d-a.d);return JSON.stringify({n:k,bad,tris:G.reduce((s,m)=>s+m.geometry.index.count/3,0),top:W.slice(0,3)})})()`;
console.log(await L.ev(p,js));await A.close();process.exit(0)})();
