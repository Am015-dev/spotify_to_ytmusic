// ath/v88v/ringshot.js <url> <out-prefix> : Athens spot 0.5; a yellow test ring (r 4.2 m, like a pop-up ring) 30 m ahead across the lane;
// stand the car k m before its plane (chase cam) and screenshot: the camera reaches the ring before the car does
const enter=require('../../bc/enter.js');const URL=process.argv[2],OUT=process.argv[3];
(async()=>{const seed=`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`;
 const E=await enter(URL,{gfx:'normal',seed});const {p,errs}=E;p.setDefaultTimeout(900000);await E.roamApi();await p.evaluate(()=>window.__wb&&__wb.fast());
 const g=await p.evaluate(()=>{const N=__mho.HUB.nodes,ok=[];for(let i=0;i<N.length;i++){const a=N[i];if(a&&a.nb&&a.nb.length>=2&&!a.ab&&N[a.nb[0]])ok.push(i)}const a=N[ok[Math.floor(.5*ok.length)]],b=N[a.nb[0]],h=Math.atan2(b.x-a.x,b.z-a.z),gx=a.x+Math.sin(h)*30,gz=a.z+Math.cos(h)*30,gy=__mho.gnd(gx,gz,60);
   __g9ev(`(()=>{const m=new THREE.Mesh(new THREE.TorusGeometry(4.2,.42,8,32),neonMat('#ffd400',2.6));m.position.set(${gx},${gy}+4.5,${gz});m.rotation.y=${h};HUB.grp.add(m);window.__tr=m})()`);return{gx,gz,gh:h}});
 for(const k of(process.env.KS||"12,4,0,-2,-4,-5.5").split(",").map(Number)){await p.evaluate(([g,k])=>{const M=__mho,R=M.RO,x=g.gx-Math.sin(g.gh)*k,z=g.gz-Math.cos(g.gh)*k;M.warp(x,z,g.gh,performance.now());R.x=x;R.z=z;R.y=M.gnd(x,z,R.y+30);R.v=0;R.vh=g.gh;R.h=g.gh},[g,k]);await p.waitForTimeout(3000);
  const s=await p.evaluate(g=>{const c=__g9ev('camera').matrixWorld.elements;return{camD:+Math.hypot(c[12]-g.gx,c[14]-g.gz).toFixed(1)}},g);
  await p.screenshot({path:`${OUT}_${k}.png`});console.log('k',k,JSON.stringify(s))}
 console.log('errors',errs.length);await E.b.close()})();
