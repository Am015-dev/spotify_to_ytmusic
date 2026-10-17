// tRev77Race: Westend Split sprint (Rossi rival) mid-race shots + finish screen. node tools/tRev77Race.js <base url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(600000);p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
 await p.goto(BASE+'?test=fra');await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 const Q=s=>p.evaluate(s=>__tk.q(s),s);
 await Q(`(()=>{const C=TK_C;tkStart(tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p)),C);RO.sp.cd=0;K.ArrowUp=K.KeyW=true;return 1})()`);
 await p.waitForTimeout(25000);
 // mid-race: put the player 14 m behind the rival on the start leg, gas held
 await Q(`(()=>{const sp=RO.sp,a=sp.ai[0],Gm=tkGeoOf(sp.C),f=Math.max(.02,(a.s-14)/tkLen(Gm.seg.start)),q=tkAt(Gm.seg.start,f);RO.x=q.x;RO.z=q.z;RO.y=groundAt(q.x,q.z,99);RO.h=RO.vh=q.h;RO.v=Math.max(RO.v,a.v||20);return 1})()`);
 for(let i=0;i<5;i++){await p.waitForTimeout(1500);console.log('mid',i,await Q(`[Math.round(RO.v),RO.sp.t.toFixed(1),Math.round(RO.sp.ai[0].s),RO.sp.gi].join(' ')`));await p.screenshot({path:OUT+'/race_westend_'+i+'.png'})}
 // finish: last gate, then the result screen
 await Q(`(()=>{const sp=RO.sp,g=sp.G[sp.G.length-1];sp.gi=sp.G.length-1;RO.x=g.x-Math.sin(g.h)*4;RO.z=g.z-Math.cos(g.h)*4;RO.y=groundAt(RO.x,RO.z,99);RO.h=RO.vh=g.h;RO.v=Math.max(RO.v,25);return 1})()`);
 for(let i=0;i<6;i++){await p.waitForTimeout(2500);console.log('fin',i,await Q(`[Math.round(RO.v),RO.sp&&RO.sp.done,(document.body.innerText.match(/(1ST|2ND|3RD|4TH|DNF)[^\\n]*/)||[''])[0]].join(' ')`));await p.screenshot({path:OUT+'/finish_'+i+'.png'})}
 await b.close()})();
