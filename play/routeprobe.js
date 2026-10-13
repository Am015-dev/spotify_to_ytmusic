// play/routeprobe.js <url> : Athens GPS route from the tPlay start towards the first objective + road edge distance along it (diagnostic)
const enter=require('../bc/enter.js');const [URL,X0,Z0,X1,Z1]=process.argv.slice(2);
(async()=>{const seed=`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`;
 const E=await enter(URL,{seed});const {p}=E;p.setDefaultTimeout(900000);await E.roamApi();
 const r=await p.evaluate(([x0,z0,x1,z1])=>{const M=__mho;const q=M.rsnap(x1,z1,400);const P=M.qv.path(x0,z0,q[0],q[1]).P;const out=P.map(([x,z])=>{const r=M.athRoad(x,z,48);return[Math.round(x),Math.round(z),r?+r.e.toFixed(1):null,r&&r.w]});
  // sample between points: road edge distance and nearest collider
  const bad=[];for(let i=0;i<P.length-1;i++){const [ax,az]=P[i],[bx,bz]=P[i+1],L=Math.hypot(bx-ax,bz-az);for(let d=0;d<L;d+=3){const x=ax+(bx-ax)*d/L,z=az+(bz-az)*d/L;const r=M.athRoad(x,z,48);const g=M.gnd(x,z,200);const b=M.roamHitAt(x,z,2,g+.5);if((r&&r.e>0)||b)bad.push([i,Math.round(x),Math.round(z),r?+r.e.toFixed(1):null,b?[+(+b.x).toFixed(0),+(+b.z).toFixed(0),+(+b.hw).toFixed(1),+(+b.hd).toFixed(1)]:null])}}
  return{snap:q,n:P.length,P:out,bad:bad.slice(0,60),nb:bad.length}},[+X0,+Z0,+X1,+Z1]);
 console.log(JSON.stringify(r));await E.b.close()})();
