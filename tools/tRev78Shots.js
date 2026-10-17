// tRev78Shots: Frankfurt start area (markers) + traffic right after a 1.5 km warp and back. node tools/tRev78Shots.js <base url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(400000);
 await p.goto(BASE+'?test=fra');await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(4000);
 await p.screenshot({path:OUT+'/start_0.png'});
 await p.evaluate(s=>__tk.q(s),`(()=>{const q=rfSnap(-375,475,120),x=q?q[0]:-375,z=q?q[1]:475,f=rfSnap(1125,975,200)||[1125,975,0];roamWarp(f[0],f[1],f[2]||0,true);RO.v=0;for(let i=0;i<60;i++)roamStep(1/30);roamWarp(x,z,q&&q[2]!=null?q[2]:0,true);RO.v=0;for(let i=0;i<150;i++)roamStep(1/30);return 1})()`);
 for(let i=0;i<3;i++){await p.waitForTimeout(2500);console.log('warp',i,await p.evaluate(s=>__tk.q(s),`(HUB.cars||[]).filter(c=>!c.dead&&Math.hypot(c.x-RO.x,c.z-RO.z)<250).length`));await p.screenshot({path:OUT+'/warp_'+i+'.png'})}
 await b.close()})();
