// trk-5 GRAND TOUR shot pass: ONE browser session, the race on the GRAND TOUR driven by the clean autopilot in fast time (rivals move with the real race code),
// frozen at 9 beats along the lap; each frame is rendered with the real chase camera.   node tools/fs/tShots.js <built page url> <outdir>   (ONE=1 = first shot only, a dry run)
// Shots warp nothing: the car really drives there (the sim just runs faster than real time between frames).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const BASE=process.argv[2],OUT=process.argv[3]||'qa_trk5',sleep=ms=>new Promise(r=>setTimeout(r,ms));fs.mkdirSync(OUT,{recursive:true});
const SHOTS=process.env.FEW?[['a',3,0],['b',30,0],['c',60,.75],['d',90,0]]:[['01_start',3,0],['02_smash',5,-.25],['03_town_jump',18,.55],['04_windmill',30,.2],['05_canyon_gate',60,.75],['06_loop',64,.15],['07_barn_exit',111,.15],['08_splash',130,.9],['09_beach',141,.3]];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const p=await c.newPage();p.setDefaultTimeout(240000);const E=[];p.on('pageerror',e=>E.push(String(e).slice(0,160)));
 await p.goto(BASE+'?test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__bx,null,{polling:250,timeout:150000});await p.evaluate(()=>{__tq.o.draw=1});
 await p.evaluate(()=>{__bx.raceStart('GRAND TOUR')});await sleep(2500);
 // drive (clean autopilot, shortcuts route) until the car reaches piece k, then t seconds more; the camera is settled by stepping it
 const run=(k,t)=>p.evaluate(([k,t])=>{const B=__bx.BX,F=__bx.fs,V=B.v,dt=1/120,W=__bx.lap([0,0]).map(o=>o.s.p);B.hold=0;B._st=B._st||{i:0};let n=0,t0=null;
  while(n++<120*120){const inp=B.inp=window.__bx.autoInp?__bx.autoInp(W,B._st):null;__bx.step(dt,inp);if(n%4===0)__bx.far(dt*4);if(t0==null&&V.on&&__bx.fsPcs().indexOf(V.on)===k)t0=B.m.t;if(t0!=null&&B.m.t-t0>=t)break}for(let i=0;i<40;i++)__bx.cam(1/30);B.hold=1;return{t:+B.m.t.toFixed(1),pos:B.race&&B.race.pos,y:+V.p.y.toFixed(1),resp:B.m.respWhy.join(""),stuck:F.stuckN,p:[V.p.x|0,V.p.z|0],sp:V.v.length()|0,st:B._st.i}},[k,t]);
 for(const[f,k,t]of process.env.ONE?SHOTS.slice(0,1):SHOTS){const r=await run(t<0?k-1:k,Math.abs(t));await p.evaluate(()=>{__bx.BX.shotNow=1});await sleep(1200);await p.screenshot({path:OUT+'/'+f+'.jpg',type:'jpeg',quality:82});console.log('shot',f,JSON.stringify(r))}
 console.log(JSON.stringify({errors:E.length,err:E.slice(0,3)}));await b.close()})();
