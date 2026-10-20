const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();
await p.goto('http://localhost:8813/index.html?test=ath&draw=0');
await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__chk&&window.__bot&&window.__botG,null,{polling:250,timeout:120000});
const a=JSON.parse(process.argv[2]);
console.log(await p.evaluate(a=>{const B=__botG,R=B.BOT_rec();B.roamWarp(a.x,a.z,a.h,true);B.RO.v=0;for(let i=0;i<45;i++)R.step();B.RO.v=a.v;
 const sx=B.RO.x+Math.sin(B.RO.h)*15,sz=B.RO.z+Math.cos(B.RO.h)*15;let P=B.navPath(sx,sz,a.gx,a.gz);const fx=Math.sin(B.RO.h),fz=Math.cos(B.RO.h);while(P.length>3&&Math.hypot(P[0][0]-B.RO.x,P[0][1]-B.RO.z)<45&&(P[0][0]-B.RO.x)*fx+(P[0][1]-B.RO.z)*fz<0)P.shift();
 __bot.trace=[];const r=B.BOT_leg(R,P,40);const o={why:r.why,t:Math.round(r.t),left:r.left,resets:r.resets,P0:P.slice(0,4).map(q=>q.map(Math.round)),tr:__bot.trace.filter((x,i)=>i%2==0).slice(0,24)};R.done();return JSON.stringify(o)},a));await b.close()})();
