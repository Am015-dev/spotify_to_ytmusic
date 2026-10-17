// shots.js <url> <outdir>: dest-1 shots (852x393): a smashed street item (bench) and a shortcut entrance with its brick arrows (Frankfurt).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [U,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await(await b.newContext({viewport:{width:852,height:393}})).newPage();p.setDefaultTimeout(600000);
 await p.goto(U+'?test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__qa,null,{timeout:600000});await p.waitForTimeout(3000);
 const ev=(s)=>p.evaluate(s=>window.__qa.ev(s),s);
 // shortcut: first valid candidate, car 20 m before the entrance, heading along it
 console.log(await ev(`(()=>{DEST_reset();while(!DEST.sc)DEST_find(1e9);const c=DEST.sc.find(c=>{roamWarp(c.a.x,c.a.z,0,true);__qa.step(8);c.ok=null;return DEST_check(c)});if(!c)return'none';const h=Math.atan2(c.b.x-c.a.x,c.b.z-c.a.z);roamWarp(c.a.x-Math.sin(h)*16,c.a.z-Math.cos(h)*16,h,true);RO.v=7;camSnap=true;__qa.step(8);RO.v=7;__qa.step(2);return JSON.stringify({len:c.len,road:c.road,x:Math.round(RO.x),z:Math.round(RO.z)})})()`));
 await p.waitForTimeout(2500);await p.evaluate(()=>__tq.draw());await p.screenshot({path:OUT+'/dest_shortcut.jpg',type:'jpeg',quality:82});
 // smashed item: drive at a bench at 55 km/h, shoot 5 frames after the smash
 console.log(await ev(`(()=>{const pr=HUB.props.find(p=>p.t==='bench'&&p.alive&&Math.hypot(p.x-RO.x,p.z-RO.z)<900)||HUB.props.find(p=>p.t==='bench'&&p.alive);if(!pr)return'no bench';const h=pr.ry||0;const hh=Math.atan2(Math.sin(h),Math.cos(h));roamWarp(pr.x-Math.sin(hh)*30,pr.z-Math.cos(hh)*30,hh,true);RO.v=0;__qa.step(12);const hd=Math.atan2(pr.x-RO.x,pr.z-RO.z);RO.h=RO.vh=hd;RO.v=15.5;const n0=HUB.smashed;let f=0;for(;f<90&&HUB.smashed===n0;f++){RO.v=Math.max(RO.v,15.5);__qa.step(1)}__qa.step(5);return JSON.stringify({smashed:HUB.smashed-n0,frames:f,v:Math.round(RO.v*3.6)})})()`));
 await p.waitForTimeout(400);await p.evaluate(()=>__tq.draw());await p.screenshot({path:OUT+'/dest_smash.jpg',type:'jpeg',quality:82});await b.close()})();
