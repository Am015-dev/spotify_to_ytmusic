// tLoad.js <outdir> [fra|ath] : the PLAYER's load on a throttled phone network. Serves <outdir> (a build: index.html, km.js, models.js, models/, music/)
// like GitHub Pages (gzip for html/js/json, no cache), emulates "Fast 4G" (NET=down Mbps,latency ms; default 9,40), opens index.html?test=<city>&draw=0
// and prints the wall time to drivable (__tq.ready), bytes on the wire, and the biggest/latest resources. hot-1, 2026-10-14.
//   <outdir> may be a URL (the live page).  QS='' → no test flags (needs READY=js condition, default __tq.ready).
//   MAX=20 → exit 1 when drivable takes longer (assert).   AFTER=1 → also list the requests made after drivable.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path'),zlib=require('zlib');
const DIR=path.resolve(/^https?:/.test(process.argv[2]||'')?'.':process.argv[2]||'out/hot'),C=process.argv[3]||'fra',[MB,LAT]=(process.env.NET||'9,40').split(',').map(Number),PORT=8870+Math.floor(Math.random()*100);
const MT={'.js':'text/javascript','.json':'application/json','.html':'text/html','.mp3':'audio/mpeg','.png':'image/png'};const GZ=new Map();
http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(DIR,path.normalize(u).replace(/^(\.\.[\/\\])+/,''));
 fs.readFile(f,(e,s)=>{if(e){r.writeHead(404);r.end();return}const ext=path.extname(f),h={'content-type':(MT[ext]||'application/octet-stream')+(/js|json|html/.test(ext)?'; charset=utf-8':''),'cache-control':'no-cache'};
  if(/\.(js|json|html)$/.test(f)&&/gzip/.test(q.headers['accept-encoding']||'')){let z=GZ.get(f);if(!z)GZ.set(f,z=zlib.gzipSync(s,{level:6}));h['content-encoding']='gzip';r.writeHead(200,h);r.end(z)}else{r.writeHead(200,h);r.end(s)}})}).listen(PORT,'127.0.0.1',async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-accelerated-2d-canvas']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 const cdp=await ctx.newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:LAT,downloadThroughput:MB*1e6/8,uploadThroughput:3e6/8});
 const R=new Map();let T0=0,tReady=0;cdp.on('Network.requestWillBeSent',e=>{R.set(e.requestId,{url:e.request.url,t0:e.timestamp})});
 cdp.on('Network.loadingFinished',e=>{const o=R.get(e.requestId);if(o){o.bytes=e.encodedDataLength;o.t1=e.timestamp}});
 const t=Date.now();const p0=await cdp.send('Runtime.evaluate',{expression:'1'});T0=null;
 const BASE=/^https?:/.test(process.argv[2]||'')?process.argv[2]:`http://127.0.0.1:${PORT}/index.html`,QS=process.env.QS??`test=${C}&draw=0`;
 await p.goto(BASE+(QS?(BASE.includes('?')?'&':'?')+QS:''),{waitUntil:'commit'});
 await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:200,timeout:240000});const wall=(Date.now()-t)/1000;tReady=Math.min(...[...R.values()].map(o=>o.t0))+wall;
 const L=[...R.values()],t00=Math.min(...L.map(o=>o.t0)),nm=u=>u.replace(/^https?:\/\/[^/]+\//,'').replace(/\?.*$/,'').slice(-48);
 const before=L.filter(o=>o.t0-t00<wall),bytes=before.reduce((a,o)=>a+(o.bytes||0),0);
 const st=await p.evaluate(()=>__tq.st.map(x=>(x[0]/1000).toFixed(1)+' '+x[1]).join(' | ')).catch(()=>'');
 console.log(`LOAD ${C} drivable ${wall.toFixed(1)} s on ${MB} Mbps/${LAT} ms · ${before.length} requests ${(bytes/1e6).toFixed(2)} MB before drivable · errors ${errs.length}${errs.length?' · '+errs[0]:''}`);
 console.log('biggest: '+before.sort((a,b)=>(b.bytes||0)-(a.bytes||0)).slice(0,8).map(o=>`${nm(o.url)} ${((o.bytes||0)/1e6).toFixed(2)} MB done ${o.t1?(o.t1-t00).toFixed(1):'?'} s`).join(' · '));
 console.log('stages (s after script start): '+st);
 if(process.env.LIST)console.log(L.slice().sort((a,b)=>a.t0-b.t0).map(o=>`${(o.t0-t00).toFixed(1)}-${o.t1?(o.t1-t00).toFixed(1):'?'} ${((o.bytes||0)/1e3).toFixed(0)}k ${nm(o.url)}`).join('\n'));
 if(process.env.AFTER){await p.waitForTimeout(5000);const af=L.filter(o=>o.t0-t00>=wall);console.log('after drivable: '+af.length+' requests '+(af.reduce((a,o)=>a+(o.bytes||0),0)/1e6).toFixed(2)+' MB')}
 await b.close();process.exit(process.env.MAX&&wall>+process.env.MAX?1:0)});
