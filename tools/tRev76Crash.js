// tRev76Crash: portrait race, car thrown at the roadside at speed; shots every 0.4 s after the hit. node tools/tRev76Crash.js <base url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(600000);p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
 await p.goto(BASE+'?test=fra');await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 const Q=s=>p.evaluate(s=>__tk.q(s),s);
 await Q(`(()=>{const C=TK_C;tkStart(tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p)),C);RO.sp.cd=0;const G=tkGeoOf(C);const P=G.seg.start,q=tkAt(P,.2);RO.x=q.x;RO.z=q.z;RO.y=groundAt(q.x,q.z,99);RO.h=RO.vh=q.h+1.3;RO.v=38;K.ArrowUp=K.KeyW=true;return 1})()`);
 for(let i=0;i<8;i++){await p.waitForTimeout(400);console.log(i,await Q(`[Math.round(RO.v),RO.hp,RO.health].join(' ')`));await p.screenshot({path:OUT+'/crash_port_'+i+'.png'})}
 await b.close()})();
