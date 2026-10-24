// fastload.js <outdir e.g. out/fc1> [fc=1|0|none]: 1st vs 2nd load of the BUILT page from a static server with Cache-Control: no-store (so only the persistent chunk
// cache, src/10zf_fastload.js, can make load 2 faster), phone profile (852x393, iPhone UA, touch), CPU x6 (CPU=1 off), Fast 4G (9 Mbit/s, 150 ms; NET=0 off).
// Prints one JSON line per load: time to drivable (__tq.drv), time to ready (lazy chunks), requests/bytes, FST stats; then the garage-swap timings (cached vs network car chunk).
// PAGECACHE=1: index.html + models.js (the sync head files FST does not store) get max-age=3600, as a real host's HTTP cache would give them. fastload-r24g. Same browser context for both loads (the store lives in the context); PAGE_ERR=1 also loads once with caches/indexedDB throwing (boot must still work).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const DIR=path.resolve(process.argv[2]||'out/fc1'),FC=process.argv[3]||'',CPU=+(process.env.CPU||6),NET=process.env.NET!=='0',CITY=process.env.CITY||'fra';
const MT={'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg'};
(async()=>{let bytes=0,reqs=0;
 const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(DIR,u==='/'?'index.html':u);if(!f.startsWith(DIR)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
  const b=fs.readFileSync(f);reqs++;bytes+=b.length;r.writeHead(200,{'content-type':MT[path.extname(f)]||'application/octet-stream','cache-control':process.env.PAGECACHE&&/^\/(index\.html|models\.js)$/.test(u)?'max-age=3600':'no-store','content-length':b.length});r.end(b)}).listen(0);
 const port=srv.address().port,b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const load=async(label,extra,init)=>{const p=await ctx.newPage();p.setDefaultTimeout(400000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
  const cdp=await ctx.newCDPSession(p);if(NET)await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:9e6/8,uploadThroughput:1.5e6/8});
  if(CPU>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:CPU});if(init)await p.addInitScript(init);
  bytes=0;reqs=0;const t0=Date.now();await p.goto(`http://127.0.0.1:${port}/index.html?test=${CITY}&draw=0&fcahead=1${FC?'&fc='+FC:''}${extra||''}`);
  await p.waitForFunction(()=>window.__tq&&__tq.drv,null,{polling:200});const tDrv=(Date.now()-t0)/1000,bDrv=bytes,rDrv=reqs;
  await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:200});const tReady=(Date.now()-t0)/1000;
  const st=await p.evaluate(()=>window.__fc?{st:__fc.FST.st,be:__fc.FST.be,on:__fc.FST.on,store:Object.values(__fc.FST.src).filter(x=>x==='store').length,net:Object.values(__fc.FST.src).filter(x=>x==='net').length,err:__fc.FST.lastErr}:null);
  console.log(JSON.stringify({label,tDrv,tReady,reqsToDrv:rDrv,MBtoDrv:+(bDrv/1e6).toFixed(2),reqs,MB:+(bytes/1e6).toFixed(2),errs:errs.length,e0:errs[0],fc:st}));return p};
 const p1=await load('load1');
 // read-ahead: wait for it (stub run directly: the 4 s idle timer is not what we measure), then time garage swaps on THIS page
 const sw=async(p,id)=>p.evaluate(async id=>{const t=performance.now();await __xc.ev(`LD_need(['${id}'])`);return +(performance.now()-t).toFixed(1)},id);
 const ids=await p1.evaluate(async()=>{const a=await __fc.ahead();return{plan:a?a.urls:[],fin:a&&a.fin}});console.log(JSON.stringify({ahead:ids}));
 const cars=ids.plan.filter(u=>/^models\//.test(u)).map(u=>u.replace(/^models\/|\.js.*$/g,''));
 await p1.close();
 const p2=await load('load2');
 const res={};if(cars[0])res.cachedSwapMs=await sw(p2,cars[0]);if(cars[1])res.cachedSwap2Ms=await sw(p2,cars[1]);
 const o2=await p2.evaluate(()=>{const c=window.__LDX.c,g=__xc.ev('LDL.got');return Object.keys(c).filter(k=>!g.has(k)&&!/^(cg|bank|boat)/.test(k)).slice(60,62)});
 if(o2[0])res.uncachedSwapMs=await sw(p2,o2[0]);if(o2[1])res.uncachedSwap2Ms=await sw(p2,o2[1]);
 console.log(JSON.stringify({swap:res,cars,uncached:o2}));
 if(process.env.PAGE_ERR){await p2.close();const p3=await load('load_storage_throws','',()=>{const th=()=>{throw new Error('storage blocked')};try{Object.defineProperty(window,'caches',{get:th,configurable:true})}catch(e){}try{Object.defineProperty(window,'indexedDB',{get:th,configurable:true})}catch(e){}});}
 await b.close();srv.close()})().catch(e=>{console.log('FAIL '+e);process.exit(1)});
