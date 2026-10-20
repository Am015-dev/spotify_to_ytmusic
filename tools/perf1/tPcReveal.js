// athperf-r21n: tPcReveal.js = tIosReveal.js on a PC-like page (900x581 dpr 1.5, no touch, no lowmem); CPU=1 for an unthrottled box.
// ios-r20f: iPhone-like reveal probe. tIosReveal.js <outdir> <ver> : touch 852x393 + ?lowmem=1 + ?rvl=1; the page asks for 6x CDP CPU throttling when its curtain gate starts
// (RVL.thr, src/98bp_warmall.js) and prints one RVL line per city: program links/compiles, texture/buffer uploads (count, ms) and frames > 100 ms in the first 3 s after reveal.
// env: CITY=fra|ath (default both, one page each, in turn) QS=extra query  CPU=<rate> (6)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),V=process.argv[3],CITIES=(process.env.CITY||'fra,ath').split(',');
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0,async()=>{
 const port=srv.address().port,b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});
 for(const c of CITIES){const ctx=await b.newContext({viewport:{width:900,height:581},deviceScaleFactor:1.5}),p=await ctx.newPage();p.setDefaultTimeout(600000);
  const cdp=await ctx.newCDPSession(p);await p.exposeFunction('__rvlThr',(m,a)=>cdp.send(m,a).then(()=>1,e=>String(e)));p.on('pageerror',e=>console.log('ERR',e.message.slice(0,150)));
  p.on('console',m=>{const t=m.text();if(/^RVL /.test(t))console.log(t)});
  await p.goto(`http://127.0.0.1:${port}/${V}/index.html?test=${c}&rvl=1&rvlcpu=${process.env.CPU||6}${process.env.QS?'&'+process.env.QS:''}`);
  if(process.env.PROF){await p.waitForFunction(()=>window.RVL&&RVL.t0>0,null,{polling:20});await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:200});await cdp.send('Profiler.start')}
  await p.waitForFunction(()=>window.RVL&&RVL.done,null,{polling:500});
  if(process.env.PROF){const {profile:P}=await cdp.send('Profiler.stop');const byId=new Map(P.nodes.map(n=>[n.id,n])),par=new Map();for(const n of P.nodes)for(const c of n.children||[])par.set(c,n.id);const self={},inc={};
   const key=n=>{const f=n.callFrame;return(f.functionName||'(anon)')+':'+(f.lineNumber+1)};for(let i=0;i<P.samples.length;i++){const d=(P.timeDeltas[i+1]||0)/1000;let id=P.samples[i];self[key(byId.get(id))]=(self[key(byId.get(id))]||0)+d;const seen=new Set();while(id!=null){const k=key(byId.get(id));if(!seen.has(k)){seen.add(k);inc[k]=(inc[k]||0)+d}id=par.get(id)}}
   const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,+process.env.PROF).map(([k,v])=>v.toFixed(0).padStart(6)+' '+k).join('\n');console.log('--- self\n'+top(self)+'\n--- inclusive\n'+top(inc))}const r=await p.evaluate(()=>RVL.fr.filter(f=>f.dt>60||f.link||f.texMs>20||f.bufMs>20).slice(0,14).map(f=>`t${f.t} dt${Math.round(f.dt)} L${f.link}/${Math.round(f.linkMs+f.compMs)}ms T${f.tex}/${Math.round(f.texMs)}ms B${f.buf}/${Math.round(f.bufMs)}ms js${Math.round(f.fMs-f.rMs)} r${Math.round(f.rMs)}${f.xc?' xc '+f.xc:''}`));
  console.log('RVLF '+c+' '+r.join(' | '));await ctx.close()}
 await b.close();srv.close()});
