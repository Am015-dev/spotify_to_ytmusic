// node tools/roads/rdTraffic.js <url> <fra|ath> [seconds=120]: observer run — install rdXmon, stub rendering, step the game N s at the start spot
// and at the two busiest signal junctions (player parked), print the counts. Quick A/B for traffic + pedestrian rules (tPlay = the real-input gate).
const enter=require('../../bc/enter.js');const fs=require('fs');const path=require('path');const URL=process.argv[2],CITY=process.argv[3]||'fra',SEC=+(process.argv[4]||120);
(async()=>{const seed=`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','${CITY}');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}')`;
 const E=await enter(URL,{gfx:'min',seed});const {p,errs}=E;p.setDefaultTimeout(1800000);await E.roamApi();await p.waitForTimeout(1500);
 await p.evaluate(c=>__g9ev(c),fs.readFileSync(path.join(__dirname,'rdXmon.js'),'utf8'));
 const spots=await p.evaluate(()=>__g9ev(`JSON.stringify([[RO.x,RO.z],...CV.sig.slice().sort((a,b)=>b.ap.length-a.ap.length||Math.hypot(a.x-RO.x,a.z-RO.z)-Math.hypot(b.x-RO.x,b.z-RO.z)).slice(0,2).map(J=>[J.x,J.z])].map(([x0,z0])=>{for(let r=12;r<80;r+=4)for(let a=0;a<6.28;a+=.4){const x=x0+Math.cos(a)*r,z=z0+Math.sin(a)*r,q=cityAt(x,z),f=fillAt(x,z);if((!q||q.d>q.road.w/2+5)&&(!f||f.d>f.r.w/2+5)&&!roamHit(x,z,3))return[x,z]}return[x0,z0]}))`));
 await p.evaluate(()=>{window.__dbg.composer.render=()=>{}});const t0=Date.now();
 for(const [x,z] of JSON.parse(spots)){await p.evaluate(([x,z])=>__g9ev(`RO.x=${x};RO.z=${z};RO.v=0;if(pl){pl.x=${x};pl.z=${z}}`),[x,z]);
  for(let s=0;s<SEC;s+=5){await p.evaluate(()=>{for(let i=0;i<300;i++){window.__tick(1);__g9ev('RO.v=0');window.__xmon()}})}}
 const o=await p.evaluate(()=>__xmonOut());o.rd=await p.evaluate(()=>window.__rd?JSON.stringify([__rd.PS,__rd.US&&__rd.US()]):null);o.wall=Math.round((Date.now()-t0)/1000);console.log(JSON.stringify(o));console.log('errors',errs.length,errs.slice(0,3).join(' | '));await E.b.close()})();
