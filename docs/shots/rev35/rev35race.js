// REVIEW_2K_35 probe: race chord window through REAL CDP touches at WALL-CLOCK gaps (page loop running, nothing stepped).
// node rev35race.js <url index.html> <fra|ath> ; phone profile: iPhone UA, 852x393 touch, dpr 2, CPU 6x after boot.
// Setup only via evaluate (startRace() from roam); every press is a trusted Input.dispatchTouchEvent fired on a node timer (not awaited),
// so the gaps are browser-side wall clock; the page records e.timeStamp of each BZ touchstart so the real gap is reported.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [BASE,C]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 const cdp=await ctx.newCDPSession(p);const EV=(fn,arg)=>p.evaluate(c=>__xc.ev(c),'('+fn.toString()+')('+JSON.stringify(arg||{})+')');
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 await p.goto(BASE+'?test='+C);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:300000});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
 await EV(A=>{if(A.m)menuTab=A.m;startRace();return 1},{m:process.env.MODE||''});
 for(let i=0;i<120;i++){const s=await EV(()=>state);if(s==='race'||(!process.env.MODE&&RO_sp()))break;await sleep(500)}
 await sleep(1500);console.log(C,'state',await EV(()=>state+(RO.sp?'+sp':'')+' tab='+menuTab+' raceT='+(typeof raceT!=='undefined'?raceT.toFixed(1):'?')));
 const pos=await EV(()=>{const c=s=>{const r=document.querySelector(s).getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]};
  window.__ts=[];window.__ev=[];for(const ty of ['touchstart','touchend','touchcancel'])document.addEventListener(ty,e=>{__ev.push([ty[5],Math.round(e.timeStamp)%100000,[...e.changedTouches].map(t=>bzSide(t)).join('/'),e.touches.length,e.target.id||e.target.tagName,CRSM.acc])},{capture:true,passive:true});document.getElementById('btnZone').addEventListener('touchstart',e=>{for(const t of e.changedTouches)__ts.push([Math.round(e.timeStamp),t.clientX<innerWidth/2?'L':'R',Math.round(performance.now()-e.timeStamp)])},{passive:true,capture:true});return{L:c('#tL'),R:c('#tR')}});
 const ID={L:4,R:1};const pt=k=>({x:pos[k][0],y:pos[k][1],id:ID[k]});const T=(type,ks)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:ks.map(pt)});
 // one trial: first arrow A down; after `gap` ms second arrow B down (A still held); after `ov` ms A lifts (touchEnd all + touchStart [B]); B lifts 150 ms later
 const trial=async(A,gap,ov)=>{const a0=await EV(()=>CRSM.acc);await EV(()=>{__ts=[];return 1});const B=A==='L'?'R':'L',P=[];
  if(gap===0){P.push(T('touchStart',[A,B]))}else{P.push(T('touchStart',[A]));await sleep(gap);P.push(T('touchStart',[A,B]))}
  await sleep(ov);P.push(T('touchEnd',[]));P.push(T('touchStart',[B]));await sleep(150);P.push(T('touchEnd',[]));await Promise.all(P);await sleep(900);
  const r=await EV(()=>({acc:CRSM.acc,ts:__ts,st:state+(RO.sp?'+sp':'')}));const g=r.ts.length>=2?r.ts[1][0]-r.ts[0][0]:0;return{roll:r.acc-a0,g,st:r.st,lag:Math.max(0,...r.ts.map(x=>x[2]))}};
 const out={};const run=async(name,A,gap,ov,n)=>{const R=[];for(let i=0;i<n;i++){const x=await trial(i%2?(A==='L'?'R':'L'):A,gap,ov);R.push(x)}
  const rolls=R.filter(x=>x.roll>0).length;out[name]={rolls,n,gaps:R.map(x=>x.g).join(','),lag:R.map(x=>x.lag+(x.roll>0?'*':'')).join(','),st:R.map(x=>x.st).filter((v,i,a)=>a.indexOf(v)===i).join()};console.log(C,name.padEnd(22),rolls+'/'+n+' rolled','page gaps ms:',out[name].gaps,out[name].st,'lag ms (*=rolled):',out[name].lag)};
 // (a) hard two-thumb correction = hand-over: old arrow held 300 ms, new lands, overlap 20/40/60/80 ms
 if(process.env.ONLY){await run('handover300_ov40','L',300,40,6);console.log(C,'JSON',JSON.stringify(out));await b.close();return}
 for(const ov of [20,40,60,80])await run('handover300_ov'+ov,'L',300,ov,10);
 // quick reversal: old arrow held only 40/80/120 ms when the new one lands (overlap 40 ms)
 for(const h of [40,80,120])await run('reversal_hold'+h,'L',h,40,6);
 // deliberate two-thumb press: separate touch events with land gaps 0 (one event)/15/30/45/60/80/100 ms, both held 300 ms
 for(const g of [0,15,30,45])await run('chord_gap'+g,'L',g,300,10);
 for(const g of [60,80,100])await run('chord_gap'+g,'L',g,300,6);
 console.log(C,'errs',JSON.stringify(errs.slice(0,3)));console.log(C,'JSON',JSON.stringify(out));await b.close()})().catch(e=>{console.log('ERR '+String(e).slice(0,300));process.exit(1)});
