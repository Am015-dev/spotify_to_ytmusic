// reveal-stall-r22e12: tIosReveal + a CDP performance trace from the curtain gate (first __rvlThr call) to RVL.done. tRvlTrace.js <outdir> <ver> <trace.json>
// env: CITY=fra QS=extra CPU=6. Prints the RVL line, then (tools/perf1/tRvlTop.js) the long tasks per thread with their top children.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),V=process.argv[3],TR=process.argv[4],C=process.env.CITY||'fra';
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const CATS=['devtools.timeline','disabled-by-default-devtools.timeline','disabled-by-default-devtools.timeline.frame','toplevel','v8','v8.execute','v8.gc','blink.gc','disabled-by-default-v8.gc','gpu','disabled-by-default-gpu.service','cc','viz','blink','loading'];
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0,async()=>{
 const port=srv.address().port,b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true}),p=await ctx.newPage();p.setDefaultTimeout(600000);
 const cdp=await ctx.newCDPSession(p),bcdp=await b.newBrowserCDPSession();let tr=0;
 await p.exposeFunction('__rvlThr',async(m,a)=>{if(!tr&&a&&a.rate>1){tr=1;await bcdp.send('Tracing.start',{traceConfig:{includedCategories:CATS,recordMode:'recordContinuously'},transferMode:'ReturnAsStream'})}return cdp.send(m,a).then(()=>1,e=>String(e))});
 p.on('pageerror',e=>console.log('ERR',e.message.slice(0,150)));p.on('console',m=>{const t=m.text();if(/^RVL /.test(t))console.log(t)});
 await p.goto(`http://127.0.0.1:${port}/${V}/index.html?test=${C}&lowmem=1&rvl=1&rvlcpu=${process.env.CPU||6}${process.env.QS?'&'+process.env.QS:''}`);
 await p.waitForFunction(()=>window.RVL&&RVL.done,null,{polling:500});
 const t0=await p.evaluate(()=>performance.timeOrigin+RVL.t0);
 const done=new Promise(res=>bcdp.once('Tracing.tracingComplete',res));await bcdp.send('Tracing.end');const {stream}=await done;
 const ws=fs.createWriteStream(TR);for(;;){const r=await bcdp.send('IO.read',{handle:stream,size:1<<20});ws.write(r.base64Encoded?Buffer.from(r.data,'base64'):r.data);if(r.eof)break}ws.end();await bcdp.send('IO.close',{handle:stream});
 fs.writeFileSync(TR+'.t0',String(t0));await ctx.close();await b.close();srv.close()});
