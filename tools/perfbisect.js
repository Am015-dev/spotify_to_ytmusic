// perfbisect.js <outdir> <ver,ver,...> : per built version, ?test=fra|ath&draw=1 -> boot s, renderer.info, heap, median frame ms. Prints table rows.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),VERS=process.argv[3].split(','),FR=+(process.env.FRAMES||300),Q=process.env.Q||'';
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}if(f.endsWith('index.html')){d=Buffer.from(d.toString().replace('const composer=new EffectComposer(renderer,rt);','const composer=new EffectComposer(renderer,rt);window.__R=renderer;window.__C=composer;'))}r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0,async()=>{
 const port=srv.address().port;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--expose-gc']});
 for(const v of VERS)for(const city of['fra','ath']){
  const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(240000);
  const t0=Date.now();let row={v,city};
  try{await p.goto(`http://127.0.0.1:${port}/${v}/index.html?test=${city}&draw=1${Q?'&q='+Q:''}`);
   await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:500});row.boot=+((Date.now()-t0)/1000).toFixed(1);
   const r=await p.evaluate(async FR=>{const R=window.__R,composer=window.__C;const w=ms=>new Promise(r=>setTimeout(r,ms));await w(4000);
    R.info.autoReset=true;const ms=[];let last=performance.now();
    for(let i=0;i<FR;i++){await new Promise(r=>requestAnimationFrame(r));const n=performance.now();if(i>10)ms.push(n-last);last=n}
    ms.sort((a,b)=>a-b);
    // one forced frame for info (autoReset: info holds last render)
    R.info.autoReset=false;R.info.reset();composer.render();
    const i=R.info;return{calls:i.render.calls,tris:i.render.triangles,geo:i.memory.geometries,tex:i.memory.textures,prog:i.programs?i.programs.length:0,heapMB:performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(0):0,med:+ms[ms.length>>1].toFixed(0),p90:+ms[Math.floor(ms.length*.9)].toFixed(0)}},FR);Object.assign(row,r)}catch(e){row.err=e.message.slice(0,80)}
  console.log(JSON.stringify(row));await ctx.close()}
 await b.close();srv.close()});
