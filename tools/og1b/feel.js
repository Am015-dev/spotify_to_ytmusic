// og1b feel run (BUILT page, phone profile: iPhone UA, 852x393 touch, CPU x THROTTLE): 60 s wall of real CDP touch in the city (GAS held, ◀/▶ holds),
// then 60 s on a built track (CLIFF RUN) with ?og1=1 through tools/bx/lib.js drive (it holds the shared #touch GAS / ◀ ▶).
// Shots 852x393: roam at rest / at speed, builder ON at rest / at speed -> docs/shots/og1b/. Prints speed samples (game m/s per wall second).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const L=require('../bx/lib.js');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const U=(process.env.U||'http://127.0.0.1:8766/out/og1b/index.html')+'?test=fra&xcall=1&og1=1',D='docs/shots/og1b/';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await c.newPage();const E=[];p.on('pageerror',e=>E.push(String(e).slice(0,160)));const cdp=await c.newCDPSession(p);if(process.env.THROTTLE)await cdp.send('Emulation.setCPUThrottlingRate',{rate:+process.env.THROTTLE});
 await p.goto(U,{timeout:300000});await p.waitForFunction(()=>window.__xc&&__xc.XC.done&&window.__bx&&window.__tq&&__tq.ready,null,{timeout:400000,polling:1000});await sleep(2000);
 const ev=s=>p.evaluate(s=>window.__xc.ev(s),s);const h=L.holder(p,cdp);
 // city: GAS held, a steer hold every few seconds
 await p.screenshot({path:D+'1_roam_rest.jpg',quality:80});const rs=[];let shotS=0;const t0=Date.now();await h.set('tG',1);
 for(let s=0;s<60;s++){const k=s%10;if(k===6)await h.set('tL',1);if(k===7)await h.set('tL',0);if(k===8)await h.set('tR',1);if(k===9)await h.set('tR',0);await sleep(1000);const v=await ev('+Math.abs(RO.v).toFixed(1)+","+T.toFixed(1)');rs.push(v);if(!shotS&&parseFloat(v)>18){shotS=1;await p.screenshot({path:D+'2_roam_speed.jpg',quality:80})}}
 await h.clear();if(!shotS)await p.screenshot({path:D+'2_roam_speed.jpg',quality:80});console.log('CITY v,gameT per s:',rs.join(' '));
 // builder ON: CLIFF RUN
 await ev("(()=>{try{BX_open()}catch(e){}const X=window.__bx;if(!X.BX.on)X.open();X.load(X.demos()['CLIFF RUN'],'CLIFF RUN');X.drive();return 1})()");await sleep(1500);
 await p.screenshot({path:D+'3_builder_rest.jpg',quality:80});
 const st=await L.drive(p,cdp,{ch:[0],secs:999,maxWall:60,stopLaps:9,shots:{'4_builder_speed':s=>s.v&&s.v.sp>18},out:D,tag:''}).catch(e=>({err:String(e).slice(0,200)}));
 const m=await p.evaluate(()=>__bx.st());console.log('BUILDER',JSON.stringify({t:m.m.t,dist:m.m.dist,resp:m.m.resp,wall:m.m.wall,laps:m.m.laps,sp:m.v&&m.v.sp,err:st&&st.err}));
 console.log('ERR',E.length,E.slice(0,3).join(' | '));await b.close()})().catch(e=>{console.log('FEEL_FAIL',String(e).slice(0,300));process.exit(1)});
