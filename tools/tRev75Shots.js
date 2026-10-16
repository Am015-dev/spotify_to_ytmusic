// tRev75Shots (rev-75): node tools/tRev75Shots.js <base url> <outdir> <burst|cardstop|portrait>  (burst also shoots the boat on the river)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,which]=process.argv.slice(2);
(async()=>{const por=which==='portrait',city=which==='cardstop'?'ath':'fra';
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:por?{width:393,height:852}:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(600000);p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
 await p.goto(BASE+'?test='+city);await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 const Q=s=>p.evaluate(s=>__tk.q(s),s);const shot=n=>p.screenshot({path:OUT+'/'+n+'.png'});
 if(which==='burst'){console.log(await Q(`(()=>{const S0=__xf.slip(0);if(!S0)return'noslip';const h=Math.atan2(S0.ix,S0.iz);roamWarp(S0.x-S0.ix*25,S0.z-S0.iz*25,h);RO.h=RO.vh=h;RO.v=0;window.__f0=new Set();scene.traverse(o=>__f0.add(o.id));K.KeyW=K.ArrowUp=true;return'ok'})()`));
  let n=0,t0=Date.now(),seen=false,k=0;while(Date.now()-t0<300000){const a=await Q(`(()=>{let b=0;scene.traverse(o=>{if(/brickfx_burst/.test(o.name||''))b++});return[RO.veh||'car',b]})()`);
   if(a[1]>0&&k<3){await shot('burst_'+k++)}
   if(a[0]==='boat'&&!seen){seen=true;t0=Date.now();}
   if(seen&&Date.now()-t0>6000){await shot('river_boat');break}
   await p.waitForTimeout(40)}
  await Q(`K.KeyW=K.ArrowUp=false`);console.log('burst shots',k)}
 if(which==='cardstop'){console.log(await Q(`(()=>{const M=RO.marks.filter(m=>m&&m.x!=null&&/quest|story|side/.test(m.kind||'')).sort((a,b)=>Math.hypot(a.x-RO.x,a.z-RO.z)-Math.hypot(b.x-RO.x,b.z-RO.z))[0];if(!M)return'nomark';window.__M=M;const q=rfSnap(M.x,M.z,40);roamWarp(q?q[0]:M.x,q?q[1]:M.z,q&&q[2]!=null?q[2]:RO.h,true);RO.v=22;K.KeyW=K.ArrowUp=true;return'ok '+M.kind})()`));
  let n=0,t0=Date.now();while(Date.now()-t0<120000&&n<3){const d=await Q(`Math.hypot(__M.x-RO.x,__M.z-RO.z)`);if(d<26){await shot('quest_pass_'+n++);await p.waitForTimeout(400)}await p.waitForTimeout(60)}
  console.log('card',await Q(`(()=>{const c=document.getElementById('roamCard');return c&&!c.hidden?'CARD':'nocard'})()`));await Q(`K.KeyW=K.ArrowUp=false`)}
 await b.close()})();
