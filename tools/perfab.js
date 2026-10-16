// perfdrive.js <outdir> <ver,ver,...> : per build x tier (Q=med,high; default tier of phone/PC), ?test=fra|ath&q=<tier>, hold ArrowUp and DRIVE N fake-time frames (rAF stubbed, 60 Hz).
// Per-frame JS cost (render stubbed) -> median/p95/max ms (streaming hitches). Every SAMPLE ticks one real composer frame -> draw calls, tris, shadow-map renders, programs, heap.
// env: CITY=fra|ath  TIERS=med,high  TICKS=1800 (30 s)  SAMPLE=120
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),VERS=process.argv[3].split(','),CITY=process.env.CITY||'fra',TIERS=(process.env.TIERS||'med,high').split(','),TICKS=+(process.env.TICKS||1800),SAMPLE=+(process.env.SAMPLE||120);
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const INIT=`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){}}}return t};window.__auto=true;setInterval(()=>{if(window.__auto)window.__tick(1)},16)})();`;
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}if(f.endsWith('index.html')){d=Buffer.from(d.toString().replace('const composer=new EffectComposer(renderer,rt);','const composer=new EffectComposer(renderer,rt);window.__R=renderer;window.__C=composer;'))}r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0,async()=>{
 const port=srv.address().port;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--expose-gc']});
 for(const v of VERS)for(const Q of TIERS){
  const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);await p.addInitScript(INIT);
  const t0=Date.now();const row={v:v.replace('v90m-beta.',''),Q,city:CITY};
  try{await p.goto(`http://127.0.0.1:${port}/${v}/index.html?test=${CITY}&q=${Q}`);
   await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__R,null,{polling:500});row.boot=+((Date.now()-t0)/1000).toFixed(0);
   await p.evaluate(()=>{window.__auto=false;const R=__R,C=__C;C.__real=C.render;C.render=()=>{};let sh=0;const sr=R.shadowMap.render.bind(R.shadowMap);R.shadowMap.render=function(l){if(l&&l.length)sh++;return sr.apply(this,arguments)};window.__shN=()=>sh});
   await p.keyboard.down('ArrowUp');await p.evaluate(()=>__tick(120));
   const r=await p.evaluate(()=>{const R=__R,C=__C,o={};const m=(far,sh)=>{if(far){const cm=C.passes[0].camera;cm.far=far;cm.updateProjectionMatrix()}R.shadowMap.autoUpdate=sh;if(sh===false)R.shadowMap.needsUpdate=false;R.info.autoReset=false;R.info.reset();C.render=C.__real;__tick(1);C.render=()=>{};const k=R.info.render;return[k.calls,+(k.triangles/1e6).toFixed(2)]};
 o.far=C.passes[0].camera.far;o.base=m(null,true);o.base2=m(null,true);o.shOffTwice=m(null,false);return o});Object.assign(row,r)}catch(e){row.err=e.message.slice(0,100)}
  console.log(JSON.stringify(row));await ctx.close()}
 await b.close();srv.close()});
