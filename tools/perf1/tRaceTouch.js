// r9a-perf: tRaceTouch.js <outdir> <ver> : race frame cost on the TOUCH profile (852x393, isMobile, hasTouch, Graphics Auto = no q=), bot race, rAF stubbed
// (60 Hz fake clock), composer.render stubbed except every SAMPLE-th frame (draw calls only). Prints median / p95 / frames>50 ms of the JS frame, plus tkStep ms
// (the AI update lives in it) and the AI car draw cost. env: CITY=fra|ath (fra=Westend, ath=Akropolis final) QS=pack=0 SECS=30 SAMPLE=120 THROTTLE=1 (CPU slowdown)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),V=process.argv[3],CITY=process.env.CITY||'fra',SECS=+(process.env.SECS||30),SAMPLE=+(process.env.SAMPLE||120),THR=+(process.env.THROTTLE||1);
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const INIT=`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};window.__dbg=1;
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){console.log('TICKERR '+e.message)}}}return t};window.__auto=true;setInterval(()=>{if(window.__auto)window.__tick(1)},16)})();`;
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0,async()=>{
 const port=srv.address().port;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-accelerated-2d-canvas']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);await p.addInitScript(INIT);
 p.on('console',m=>{const t=m.text();if(/TICKERR/.test(t))console.log(t.slice(0,200))});p.on('pageerror',e=>console.log('ERR',e.message.slice(0,150)));
 const cdp=await ctx.newCDPSession(p);if(THR>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:THR});
 await p.goto(`http://127.0.0.1:${port}/${V}/index.html?test=${CITY}${process.env.QS?'&'+process.env.QS:''}`);
 await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__oc,null,{polling:500});
 const r=await p.evaluate(async([N,S,city])=>{window.__auto=false;const ev=__oc.ev;window.__ev=ev;const RO=ev("RO"),R=ev("renderer");const B={tkStep:0};
  ev(`{const f=tkStep;tkStep=function(){const t=performance.now();try{return f.apply(this,arguments)}finally{PF1.t+=performance.now()-t}}}`.replace('PF1.t','window.__tk'));window.__tk=0;
  ev(`{const R0=composer.render.bind(composer);composer.__real=R0;composer.render=function(){if(window.__real)R0()}}`);
  const start=()=>{if(RO.sp)try{ev('sprintEnd()')}catch(e){}
   if(city==='ath'){ev(`(()=>{const m=tkMarkOf(ATH_BOSS_EV),C=tkCourseOf(m);tkStart(m,C);RO.sp.cd=0;window.__bot=tkBot(tkGeoOf(C).pA,{lag:.15})})()`)}
   else ev(`(()=>{const m=tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p));tkStart(m,TK_C);RO.sp.cd=0;window.__bot=tkBot(tkGeoOf(TK_C).pA,{lag:.15})})()`)};
  start();const nai=RO.sp.ai.length;const fr=[],tk=[],calls=[];let restarts=0;
  for(let i=0;i<N;i++){if(!RO.sp){restarts++;start()}try{__bot(RO.sp)}catch(e){}window.__tk=0;const real=i%S===S-1;window.__real=real;if(real){R.info.autoReset=false;R.info.reset()}
   const t=performance.now();__tick(1);const ms=performance.now()-t;if(real){calls.push(R.info.render.calls);R.info.autoReset=true}else{fr.push(ms);tk.push(window.__tk)}
   if(i%30===0)await new Promise(r=>setTimeout(r,0))}
  const a=x=>x.slice().sort((p,q)=>p-q),pc=(x,q)=>{x=a(x);return +x[Math.min(x.length-1,Math.floor(x.length*q))].toFixed(2)},avg=x=>+(x.reduce((p,q)=>p+q,0)/x.length).toFixed(2);
  return{ai:nai,frames:fr.length,restarts,med:pc(fr,.5),avg:avg(fr),p95:pc(fr,.95),p99:pc(fr,.99),max:+Math.max(...fr).toFixed(0),n50:fr.filter(x=>x>50).length,tkMed:pc(tk,.5),tkAvg:avg(tk),tkP95:pc(tk,.95),calls:calls.length?Math.round(calls.reduce((p,q)=>p+q,0)/calls.length):0}},[SECS*60,SAMPLE,CITY]);
 console.log((process.env.QS||'pack')+' '+CITY+' '+JSON.stringify(r));await b.close();srv.close()});
