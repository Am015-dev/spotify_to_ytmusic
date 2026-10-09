const{chromium,boot}=require('../tools/d24lib');const fs=require('fs');const out=process.argv[3];fs.mkdirSync(require('path').dirname(out),{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'fra',url:process.argv[2],phone:true});
await p.evaluate(()=>{__mho.warp(-1200,960,3.14159,true)});for(let i=0;i<30;i++)await p.evaluate(()=>__tick(10));
const t=JSON.parse(await p.evaluate(()=>__oc.ev(`(()=>{let b=null,bd=1e9;for(const r of DR.solid){const cx=(r.x0+r.x1)/2,cz=(r.z0+r.z1)/2;const d=Math.hypot(cx+1200,cz-960);if(d<bd){bd=d;b=r}}
 const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2;let best=null;for(const q of HUB.nodes){if(!q||q.ab||!q.nb||!q.nb.length)continue;const dx=Math.max(b.x0-q.x,0,q.x-b.x1),dz=Math.max(b.z0-q.z,0,q.z-b.z1),d=Math.hypot(dx,dz);if(d>14&&d<40&&(!best||d<best.d))best={d,x:q.x,z:q.z}}
 return JSON.stringify({b,best,cx,cz})})()`)));console.log(JSON.stringify(t));
const R=t.b;const px=R.x1+22,pz=(R.z0+R.z1)/2;
await p.evaluate(([x,z])=>{__mho.warp(x,z,0,true)},[px,pz]);for(let i=0;i<30;i++)await p.evaluate(()=>__tick(10));
await p.evaluate(([px,pz,tx,tz])=>__oc.ev(`(()=>{window.__camLock=[new THREE.Vector3(${px},groundY(${px},${pz})+14,${pz}+60),new THREE.Vector3(${tx},groundY(${px},${pz})+3,${tz}-20)];if(!window.__rcO){window.__rcO=roamCam;roamCam=function(){const r=window.__rcO.apply(this,arguments);if(window.__camLock){camera.position.copy(window.__camLock[0]);camera.lookAt(window.__camLock[1])}return r}}})()`),[px,pz,R.x1,pz-40]);
for(let i=0;i<4;i++)await p.evaluate(()=>__tick(1));await shot(out);console.log(errs);await b.close()})()
