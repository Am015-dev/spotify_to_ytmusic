// perf-r17u: node tools/perf1/tPcHeap.js out <ver> (env CITY=fra|ath SECS=60 STEP=15 PROF=1 QS=lfr=500): desktop GC heap at ready and every STEP s of driven roam, frames >50 ms, PROF=1 owner diff
// pc heap growth probe: desktop tier, ?test=CITY&draw=0, rAF stepped manually (render stubbed via draw=0), GC'd heap at ready/+N s
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),V=process.argv[3],CITY=process.env.CITY||'fra',SECS=+(process.env.SECS||30);
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':{'.html':'text/html','.js':'application/javascript','.json':'application/json'}[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0);
(async()=>{const T=Date.now(),L=s=>console.log(((Date.now()-T)/1000).toFixed(0)+'s '+s);const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info','--js-flags=--expose-gc']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();p.setDefaultTimeout(400000);const cdp=await ctx.newCDPSession(p);
 await p.addInitScript(`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};window.__dbg=1;window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){}}}return t};window.__auto=true;setInterval(()=>{if(window.__auto)window.__tick(1)},16)})()`);
 await p.goto(`http://127.0.0.1:${srv.address().port}/${V}/index.html?test=${CITY}&draw=0${process.env.QS?'&'+process.env.QS:''}`);
 await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__oc,null,{polling:500});L('ready');
 const mb=async()=>{await cdp.send('HeapProfiler.collectGarbage');await cdp.send('HeapProfiler.collectGarbage');return +(await p.evaluate(()=>performance.memory.usedJSHeapSize/1048576)).toFixed(1)};
 await p.evaluate(()=>{window.__auto=false});
 const h0=await mb();
 const r=await p.evaluate(()=>{const ev=__oc.ev;return ev(`(()=>{const o=[];for(const L of LAZY)if(L.lf&&!L.done)o.push(L.id);return o})()`)});
 console.log('undone tiles',r.length);
 const hs=[h0];
 for(const id of r.slice(0,60)){await p.evaluate(id=>{__oc.ev(`(()=>{const L=LAZY.find(l=>l.id==='${id}');lzRun(L)})()`)},id);hs.push(await mb())}
 const ds=await p.evaluate(()=>__oc.ev(`(()=>{let a=0,b=0,c=0;for(const L of LAZY)if(L.lf&&L.done){a+=L.props.length;b+=L.lfG.length;c+=L.lfP.length}return[a,b,c,LAZY.filter(l=>l.lf&&l.done).length]})()`));console.log('built',JSON.stringify(ds));
 await p.evaluate(()=>{__oc.ev(`(()=>{for(const L of LAZY)if(L.lf&&L.done){STR_lzFree(L)}})()`)});console.log('after free',await mb());
 console.log('RESULT',hs[0],hs[hs.length-1]);
 const info=await p.evaluate(()=>__oc.ev(`(()=>{let s=0;return LAZY.filter(l=>l.lf&&l.done).map(L=>[L.id,L.props.length,L.lfG.length,L.lfP.length])})()`));console.log(JSON.stringify(info));
 await b.close();srv.close()})();
