// g17/cam.js <url>: on-screen box of the ride in BUILD (street car vs boats / off-road), shots g17/cam/*.png
const E=require('../bc/enter.js');const fs=require('fs');fs.mkdirSync('g17/cam',{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:'normal',tick:0});const{p,tap,ev}=T;await tap('#gbMenuBtn');await p.waitForTimeout(3500);
 const box=`(()=>{GB_cam();const b=new THREE.Box3();for(const o of GB.mesh.userData.gbM||[])b.union(new THREE.Box3().setFromObject(o));const r=$('#gbC').getBoundingClientRect();let l=1e9,R=-1e9,t=1e9,B=-1e9;for(let i=0;i<8;i++){const v=new THREE.Vector3(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z).project(GB.cam);const x=r.left+(v.x+1)/2*r.width,y=r.top+(1-v.y)/2*r.height;l=Math.min(l,x);R=Math.max(R,x);t=Math.min(t,y);B=Math.max(B,y)}return JSON.stringify({box:[l,t,R,B].map(Math.round),w:Math.round(R-l),h:Math.round(B-t),k:+BC_gk().toFixed(2),dist:GB_.dist})})()`;
 for(const[id,f]of[['rod','car'],['t_speedboat','boat'],['t_pboat','boat'],['t_beast','off'],['posei','boat']]){
  await ev(f==='car'?'GB_enter()':`(__fb.begin('${id}','${f}'),GB_enter())`);await p.waitForTimeout(1500);console.log(id,f,await ev(box));await p.screenshot({path:`g17/cam/${id}_${f}.png`});await ev('GB_exit()');await p.waitForTimeout(800)}
 console.log('errs',T.errs.length);await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
