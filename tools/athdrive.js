// athdrive.js (athperf-r21n): PC-like (900x581 dpr 1.5, no touch) fake-clock drive on a BUILT page: ?test=<city>, hold ArrowUp, TICKS frames (render stubbed except every SAMPLE).
// Prints boot s, per-frame JS ms median/p95/max, the first frames > 50 ms, heap min/max MB (GC churn).   node tools/athdrive.js out <ver> [city]   env TICKS=1800 Q=<extra query>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),V=process.argv[3],CITY=process.argv[4]||'ath',TICKS=+(process.env.TICKS||1800),SAMPLE=+(process.env.SAMPLE||120);
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const INIT=`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){}}}return t};window.__auto=true;setInterval(()=>{if(window.__auto)window.__tick(1)},16)})();`;
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}if(f.endsWith('index.html'))d=Buffer.from(d.toString().replace('const composer=new EffectComposer(renderer,rt);','const composer=new EffectComposer(renderer,rt);window.__R=renderer;window.__C=composer;'));r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})});
srv.listen(0,async()=>{const port=srv.address().port;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:900,height:581},deviceScaleFactor:1.5});const p=await ctx.newPage();p.setDefaultTimeout(900000);await p.addInitScript(INIT);
 const t0=Date.now();await p.goto(`http://127.0.0.1:${port}/${V}/index.html?test=${CITY}${process.env.Q?'&'+process.env.Q:''}`);
 await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__R,null,{polling:500});const boot=(Date.now()-t0)/1000;
 const st=await p.evaluate(()=>{const L=__tq.st;return L.map((x,i)=>[(((L[i+1]||[__tq.tReady])[0]-x[0])/1000).toFixed(1),x[1]]).filter(x=>x[0]>0.3).map(x=>x.join(' ')).join(' | ')});
 await p.evaluate(()=>{window.__auto=false;const C=__C;C.__real=C.render;C.render=()=>{}});
 await p.keyboard.down('ArrowUp');await p.evaluate(()=>__tick(120));const cdp=process.env.PROF?await ctx.newCDPSession(p):null;if(cdp){await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:500});await cdp.send('Profiler.start')}
 const r=await p.evaluate(async([N,S])=>{const C=__C,ms=[],big=[];let hmin=1e9,hmax=0;const PB=null;
  for(let i=0;i<N;i++){const real=i%S===S-1;if(real)C.render=C.__real;const t=performance.now();__tick(1);const d=performance.now()-t;if(real)C.render=()=>{};else ms.push(d);
   const h=performance.memory.usedJSHeapSize/1048576;if(h<hmin)hmin=h;if(h>hmax)hmax=h;
   if(d>50&&!real&&big.length<12){const fs={};if(PB&&PB.fs)for(const k in PB.fs)fs[k]=Math.round(PB.fs[k]);big.push([i,Math.round(d),JSON.stringify(fs)])}
   if(i%60===0)await new Promise(r=>setTimeout(r,0))}
  ms.sort((a,b)=>a-b);return{med:+ms[ms.length>>1].toFixed(1),p95:+ms[Math.floor(ms.length*.95)].toFixed(1),max:Math.round(ms[ms.length-1]),n50:ms.filter(m=>m>50).length,hmin:Math.round(hmin),hmax:Math.round(hmax),big}},[TICKS,SAMPLE]);
 if(cdp){const {profile:P}=await cdp.send('Profiler.stop');const self={};const byId=new Map(P.nodes.map(n=>[n.id,n]));for(let i=0;i<P.samples.length;i++){const n=byId.get(P.samples[i]),f=n.callFrame,k=(f.functionName||'(anon)')+' '+f.url.split('/').pop().slice(0,20)+':'+(f.lineNumber+1);self[k]=(self[k]||0)+(P.timeDeltas[i+1]||0)/1000}console.log(Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,+process.env.PROF||25).map(([k,v])=>v.toFixed(0).padStart(6)+' '+k).join('\n'))}
 console.log(`DRIVE ${V} ${CITY} boot ${boot.toFixed(1)} s | js med ${r.med} p95 ${r.p95} max ${r.max} ms, >50ms ${r.n50} | heap ${r.hmin}-${r.hmax} MB\nstages: ${st}`);for(const x of r.big)console.log('  f'+x[0]+' '+x[1]+'ms '+x[2]);
 await b.close();srv.close();process.exit(0)});
