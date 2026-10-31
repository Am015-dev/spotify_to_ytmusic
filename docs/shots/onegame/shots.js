// onegame-r31c shot recipe (phone profile). Needs a probe in the BUILT page: insert 'window.__og=function(c){return eval(c)};' before 'window.__mho={' in out/<ver>/index.html (local only, never shipped). Serve out/<ver> on :8731. node shots.js <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const BASE='http://localhost:8731/index.html',OUT=process.argv[2]||'/tmp/og/out';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,140)));
 const t0=Date.now();await p.goto(BASE+'?test=fra');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__rm,null,{polling:250,timeout:400000});
 const out={boot_s:(Date.now()-t0)/1000};
 const gas=async(s)=>{await p.keyboard.down('ArrowUp');await p.waitForTimeout(s*1000);};
 const info=()=>p.evaluate(()=>__og(`({state,team:TEAMS[teamIdx]&&TEAMS[teamIdx].name,ride:(typeof SET!=='undefined'&&SET.ride)||null,RO_v:+(RO.v||0).toFixed(1),RO_top:RO.top,pl_v:pl?+(pl.v||0).toFixed(1):null,pl_top:pl&&pl.stats?+pl.stats.top.toFixed(1):null,fov:camera.fov,BX:window.__bx?{on:__bx.BX.on,mode:__bx.BX.mode,v:__bx.BX.v?+__bx.BX.v.v.length().toFixed(1):null,fov:__bx.BX.cam&&__bx.BX.cam.fov}:null,hud:[...document.querySelectorAll('#hud,#roam,#bx,#touch')].filter(e=>!e.hidden&&getComputedStyle(e).display!=='none').map(e=>e.id)})`));
 // 1 roam
 await gas(4);out.roam=await info();await p.screenshot({path:OUT+'/1_roam.jpg',type:'jpeg',quality:75});await p.keyboard.up('ArrowUp');
 // 2 race mode (spline track) via the race menu list
 const L=await p.evaluate(()=>__rm.list());out.list=L.slice(0,40);
 const iRace=L.findIndex(n=>/race|grand/i.test(n)&&!/city|duel|sprint/i.test(n));const t1=Date.now();
 await p.evaluate(i=>__rm.open(i),iRace<0?0:iRace);await p.waitForFunction(()=>['race','countdown'].includes(__og('state')),null,{timeout:120000}).catch(()=>{});out.race_load_s=(Date.now()-t1)/1000;out.raceName=L[iRace];
 await p.waitForTimeout(4000);await gas(4);out.race=await info();await p.screenshot({path:OUT+'/2_race.jpg',type:'jpeg',quality:75});await p.keyboard.up('ArrowUp');
 await p.evaluate(()=>{try{__rm.close()}catch(e){}});
 // 3 builder: open and drive the first demo track
 const t2=Date.now();await p.evaluate(()=>__og('XC_need("98b2_builder2")'));await p.waitForFunction(()=>window.__bx&&__bx.raceStart,null,{timeout:120000});const dn='CLIFF RUN';await p.evaluate(n=>__bx.raceStart(n),dn);out.bx_load_s=(Date.now()-t2)/1000;out.bxTrack=dn;
 await p.waitForTimeout(4000);await gas(4);out.bx=await info();await p.screenshot({path:OUT+'/3_builder.jpg',type:'jpeg',quality:75});await p.keyboard.up('ArrowUp');
 await p.evaluate(()=>(__bx.close(),1));await p.waitForTimeout(800);out.afterBx=await info();await p.screenshot({path:OUT+'/4_after_builder.jpg',type:'jpeg',quality:75});
 out.errs=errs.slice(0,6);fs.writeFileSync(OUT+'/m.json',JSON.stringify(out,null,1));console.log(JSON.stringify(out).slice(0,2500));await b.close()})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
