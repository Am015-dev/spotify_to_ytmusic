// perf-r17u: node tools/perf1/tPcHeap.js out <ver> (env CITY=fra|ath SECS=60 STEP=15 PROF=1 QS=lfr=500): desktop GC heap at ready and every STEP s of driven roam, frames >50 ms, PROF=1 owner diff
// pc heap growth probe: desktop tier, ?test=CITY&draw=0, rAF stepped manually (render stubbed via draw=0), GC'd heap at ready/+N s
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),V=process.argv[3],CITY=process.env.CITY||'fra',SECS=+(process.env.SECS||30);
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':{'.html':'text/html','.js':'application/javascript','.json':'application/json'}[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0);
(async()=>{const T=Date.now(),L=s=>console.log(((Date.now()-T)/1000).toFixed(0)+'s '+s);const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info','--js-flags=--expose-gc']});
 const ctx=await b.newContext({viewport:{width:1920,height:1080}});const p=await ctx.newPage();p.setDefaultTimeout(400000);const cdp=await ctx.newCDPSession(p);
 await p.addInitScript(`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};window.__dbg=1;window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){}}}return t};window.__auto=true;setInterval(()=>{if(window.__auto)window.__tick(1)},16)})()`);
 await p.goto(`http://127.0.0.1:${srv.address().port}/${V}/index.html?test=${CITY}&draw=0${process.env.QS?'&'+process.env.QS:''}`);
 await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__oc,null,{polling:500});L('ready');
 await p.evaluate(()=>{window.__auto=false});const SD=process.env.SHOTS||'.',TG=process.env.TAG||'x';fs.mkdirSync(SD,{recursive:true});
 const shot=async t=>{await p.evaluate(()=>__tq.draw()).catch(()=>{});await new Promise(r=>setTimeout(r,500));await p.screenshot({path:`${SD}/${CITY}-${TG}-${t}s.jpg`,type:'jpeg',quality:80});L('shot '+t)};
 await shot(0);for(const [i,a] of [[-375,475],[700,-350],[-900,300]].entries()){await p.evaluate(async a=>{const ev=__oc.ev;ev('K').KeyW=false;const q=ev('rfSnap')(a[0],a[1],120);if(q)ev('roamWarp')(q[0],q[1],q[2]||0,true);for(let k=0;k<240;k++){__tick(1);if(k%30===29)await new Promise(r=>setTimeout(r,0))}},a);await shot('A'+i)}
 let done=0;const step=15;
 while(done<60){await p.evaluate(async n=>{const ev=__oc.ev,RO=ev('RO');if(!window.__drv)window.__drv=ev(`(()=>{const W=a=>Math.atan2(Math.sin(a),Math.cos(a));return()=>{const la=12+RO.v*.9,fx=Math.sin(RO.h),fz=Math.cos(RO.h),q=rfAim(RO.x+fx*la,RO.z+fz*la,fx,fz,60),e=q?W(Math.atan2(q[0]-RO.x,q[1]-RO.z)-RO.h):0;K.KeyW=K.ArrowUp=true;K.ArrowLeft=e>.06;K.ArrowRight=e<-.06;if(Math.abs(RO.v)<.5&&(window.__stk=(window.__stk|0)+1)>90){window.__stk=0;const s=rfSnap(RO.x+(Math.random()-.5)*400,RO.z+(Math.random()-.5)*400,200);if(s)roamWarp(s[0],s[1],s[2]||0,true)}}})()`);
 for(let i=0;i<n;i++){try{__drv()}catch(e){}__tick(1);if(i%30===29)await new Promise(r=>setTimeout(r,0))}},step*60);done+=step;if(done%30===0)await shot(done)}
 if(process.env.EVAL)console.log('EVAL',JSON.stringify(await p.evaluate(process.env.EVAL)));
 console.log('DONE '+CITY+' '+TG);await b.close();srv.close()})();
