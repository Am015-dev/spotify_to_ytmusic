// ios-r20f: iPhone-like reveal probe. tIosReveal.js <outdir> <ver> : touch 852x393 + ?lowmem=1 + ?rvl=1; the page asks for 6x CDP CPU throttling when its curtain gate starts
// (RVL.thr, src/98bp_warmall.js) and prints one RVL line per city: program links/compiles, texture/buffer uploads (count, ms) and frames > 100 ms in the first 3 s after reveal.
// env: CITY=fra|ath (default both, one page each, in turn) QS=extra query  CPU=<rate> (6)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),V=process.argv[3],CITIES=(process.env.CITY||'fra,ath').split(',');
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0,async()=>{
 const port=srv.address().port,b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});
 for(const c of CITIES){const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true}),p=await ctx.newPage();p.setDefaultTimeout(600000);
  const cdp=await ctx.newCDPSession(p);await p.exposeFunction('__rvlThr',(m,a)=>cdp.send(m,a).then(()=>1,e=>String(e)));p.on('pageerror',e=>console.log('ERR',e.message.slice(0,150)));
  p.on('console',m=>{const t=m.text();if(/^RVL /.test(t))console.log(t)});
  await p.goto(`http://127.0.0.1:${port}/${V}/index.html?test=${c}&lowmem=1&rvl=1&rvlcpu=${process.env.CPU||6}${process.env.QS?'&'+process.env.QS:''}`);
  await p.waitForFunction(()=>window.RVL&&RVL.done,null,{polling:500});const r=await p.evaluate(()=>RVL.fr.filter(f=>f.dt>60||f.link||f.texMs>20||f.bufMs>20).slice(0,14).map(f=>`t${f.t} dt${Math.round(f.dt)} L${f.link}/${Math.round(f.linkMs+f.compMs)}ms T${f.tex}/${Math.round(f.texMs)}ms B${f.buf}/${Math.round(f.bufMs)}ms js${Math.round(f.fMs-f.rMs)} r${Math.round(f.rMs)}${f.xc?' xc '+f.xc:''}`));
  console.log('RVLF '+c+' '+r.join(' | '));await ctx.close()}
 await b.close();srv.close()});
