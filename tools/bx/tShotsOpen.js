// trk-4 shot pass: ONE browser session, every view: each demo track driven by the AI (low chase cam) + an aerial view of the open verges,
// the race buttons in portrait, the builder in landscape.   node tools/bx/tShotsOpen.js <built page url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const BASE=process.argv[2],OUT=process.argv[3]||'qa_trk4',sleep=ms=>new Promise(r=>setTimeout(r,ms));fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const p=await c.newPage();p.setDefaultTimeout(180000);const E=[];p.on('pageerror',e=>E.push(String(e).slice(0,160)));
 await p.goto(BASE+'?test=fra&draw=0&bxfast=1');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__bx,null,{polling:250,timeout:150000});await p.evaluate(()=>{__tq.o.draw=1});
 const shot=async f=>{await p.evaluate(()=>{__bx.BX.shotNow=1});await sleep(900);await p.screenshot({path:OUT+'/'+f,type:'jpeg',quality:80});console.log('shot',f)};
 const D=await p.evaluate(()=>Object.keys(__bx.demos()).filter(k=>!__bx.demos()[k].hide));
 for(const k of process.env.ONE?D.slice(0,1):D){const tag=k.split(' ')[0].toLowerCase();
  // AI drive: let it run until it is well into the lap, freeze, shoot
  await p.evaluate(k=>{const B=__bx.BX;if(!B.on)__bx.open();if(B.mode==='drive')document.querySelector('#bxBack').click();__bx.load(__bx.demos()[k],k)},k);
  await p.evaluate(()=>{const B=__bx.BX;document.querySelector('#bxGo').click();B.auto={W:__bx.lap([0,0,0]).map(o=>o.s.p),st:{i:0}}});
  await p.waitForFunction(()=>{const m=__bx.BX.m;return m&&m.t>9},null,{polling:300,timeout:120000});await p.evaluate(()=>{__bx.BX.hold=1});await shot(tag+'_drive.jpg');
  await p.waitForFunction(()=>{__bx.BX.hold=0;const m=__bx.BX.m;return m&&m.t>17},null,{polling:300,timeout:120000});await p.evaluate(()=>{__bx.BX.hold=1});await shot(tag+'_drive2.jpg');
  await p.evaluate(()=>{const B=__bx.BX;B.hold=0;B.auto=null;document.querySelector('#bxBack').click()});await sleep(300);
  await p.evaluate(()=>{const L=__bx.lap([0,0,0]),s=L[Math.floor(L.length*.3)].s.p;__bx.look(s.x,s.z,150,null,.75)});await sleep(1500);await shot(tag+'_air.jpg')}
 if(process.env.ONE){console.log(JSON.stringify({errors:E.length,err:E.slice(0,3)}));return b.close()}
 await p.evaluate(()=>__chk.go('trk4/bx-o-btn'));await p.setViewportSize({width:393,height:852});await sleep(2500);await shot('race_portrait.jpg');
 await p.setViewportSize({width:852,height:393});await sleep(1500);await shot('race_landscape.jpg');
 await p.evaluate(()=>__chk.go('trk4/bx-o-ui'));await sleep(2500);await shot('builder.jpg');
 console.log(JSON.stringify({errors:E.length,err:E.slice(0,3)}));await b.close()})();
