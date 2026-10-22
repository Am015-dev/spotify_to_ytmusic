// framejs.js <outdir/ver> : per-frame JS cost of the game step (render stubbed, rAF stubbed 60 Hz), ?test=CITY, hold ArrowUp for TICKS frames at THROTTLE x CPU.
// Prints one JSON line {city,jsMed,jsP95,dist}; PROF=1 adds a CDP profile: top self-time functions and inclusive time of the frame subsystems.
// env: CITY=fra|ath TICKS=3600 THROTTLE=6 PROF=0
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const DIR=path.resolve(process.argv[2]),CITY=process.env.CITY||'fra',TICKS=+(process.env.TICKS||3600),THR=+(process.env.THROTTLE||6),PROF=!!+process.env.PROF;
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const INIT=`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){}}}return t};window.__auto=true;setInterval(()=>{if(window.__auto)window.__tick(1)},16)})();`;
const srv=http.createServer((q,r)=>{const f=path.join(DIR,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}if(f.endsWith('index.html'))d=Buffer.from(d.toString().replace('const composer=new EffectComposer(renderer,rt);','const composer=new EffectComposer(renderer,rt);window.__R=renderer;window.__C=composer;'));r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0,async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(3600000);await p.addInitScript(INIT);if(process.env.INIT2)await p.addInitScript(fs.readFileSync(process.env.INIT2,'utf8'));
 const row={city:CITY};
 try{await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?test=${CITY}`);
  await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__R,null,{polling:500});
  await p.evaluate(()=>{window.__auto=false;__C.render=()=>{}});
  await p.keyboard.down('ArrowUp');await p.evaluate(()=>__tick(120));
  const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:THR});
  if(PROF){await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:500});await cdp.send('Profiler.start')}
  Object.assign(row,await p.evaluate(async N=>{const ms=[],RO=__mho.RO,x0=RO.x,z0=RO.z;let d=0,px=x0,pz=z0;
   for(let i=0;i<N;i++){const t=performance.now();__tick(1);ms.push(performance.now()-t);d+=Math.min(50,Math.hypot(RO.x-px,RO.z-pz));px=RO.x;pz=RO.z;if(i%60===0)await new Promise(r=>setTimeout(r,0))}
   ms.sort((a,b)=>a-b);return{jsMed:+ms[ms.length>>1].toFixed(1),jsP95:+ms[Math.floor(ms.length*.95)].toFixed(1),jsMax:+ms[ms.length-1].toFixed(0),dist:Math.round(d)}},TICKS));
  if(PROF){const {profile}=await cdp.send('Profiler.stop');const byId={};for(const n of profile.nodes)byId[n.id]=n;const cnt={};profile.samples.forEach((s,i)=>{cnt[s]=(cnt[s]||0)+(profile.timeDeltas[i]||0)});
   const key=n=>(n.callFrame.functionName||'(anon)')+':'+n.callFrame.lineNumber+':'+n.callFrame.url.split('/').pop().slice(0,12);
   const par={};for(const n of profile.nodes)for(const c of n.children||[])par[c]=n.id;
   const self={},incl={};let tot=0;for(const id in cnt){const v=cnt[id];tot+=v;const n=byId[id];self[key(n)]=(self[key(n)]||0)+v;const seen=new Set();let x=+id;while(x!=null){const k=key(byId[x]);if(!seen.has(k)){seen.add(k);incl[k]=(incl[k]||0)+v}x=par[x]}}
   const idle=(self['(idle):-1:']||0)+(self['(program):-1:']||0);const busy=tot-idle;const pr=o=>Object.entries(o).filter(([k])=>!k.startsWith('(')).sort((a,b)=>b[1]-a[1]);
   row.profBusyS=+(busy/1e6).toFixed(1);row.self=pr(self).slice(0,25).map(([k,v])=>(v/busy*100).toFixed(1)+'% '+k);row.incl=pr(incl).slice(0,60).map(([k,v])=>(v/busy*100).toFixed(1)+'% '+k)}
 }catch(e){row.err=e.message.slice(0,200)}
 console.log(JSON.stringify(row));await b.close();srv.close()});
