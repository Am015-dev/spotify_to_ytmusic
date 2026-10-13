// play/graphprobe.js <url> <cx> <cz> <R> : how far the mission road graph (qvGraph: GPS routes, chase vans) strays off the paved Athens road (diagnostic)
const enter=require('../bc/enter.js');const [URL,CX,CZ,RR]=process.argv.slice(2);
(async()=>{const seed=`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`;
 const E=await enter(URL,{seed});const {p}=E;p.setDefaultTimeout(900000);await E.roamApi();
 const r=await p.evaluate(a=>__g9ev(`(()=>{const [cx,cz,R]=${a};const N=HUB.nodes;let tot=0,off2=0,off6=0,blk=0;const ex=[];const keys='HUB.nodes';const n=N.length;
  for(let i=0;i<n;i++){const A=N[i];if(!A||A.ab||Math.hypot(A.x-cx,A.z-cz)>R)continue;for(const j of A.nb||[]){const B=N[j];if(!B||B.ab)continue;const ax=A.x,az=A.z,bx=B.x,bz=B.z,D=Math.hypot(bx-ax,bz-az);for(let d=0;d<=D;d+=4){const x=ax+(bx-ax)*d/D,z=az+(bz-az)*d/D;tot++;const r=athRoadD(x,z,48);const e=r?r.e:99;if(e>2)off2++;if(e>6)off6++;const b=roamHit(x,z,1.2,groundAt(x,z,200)+.5);if(b){blk++;if(ex.length<10)ex.push([i,j,Math.round(x),Math.round(z),+e.toFixed(1),Math.round(D)])}}}}
  return JSON.stringify({keys,n,tot,off2,off6,blk,ex})})()`),JSON.stringify([+CX,+CZ,+RR]));
 console.log(r);await E.b.close()})();
