// boottoctl.js: PLAY tap -> first car control, split into phases (boot-r30e, 2026-10-30).
//   node tools/perf/boottoctl.js out/<ver> [--throttle 6] [--prof] [--q 'a=1&b=2'] [--n 1] [--shots <dir>: first controllable frame + 5 s later]
// Same profile as tools/gauntlet.js bootPlayer: iPhone UA, 852x393 touch, dpr 2, software GL, real title -> PLAY tap.
// Prints: toCtl (s), the phase table from the game's own BMK marks (ld <pct> <label>, xc <chunk>, roamPost, render1...),
// network bytes/time fetched after the tap, rAF gaps > 250 ms after the tap, three.js programs linked, and with --prof the top
// inclusive functions of the tap -> control window. Read-only: it never calls a game function.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path'),http=require('http');
const A=process.argv.slice(2),arg=(k,d)=>{const i=A.indexOf('--'+k);return i<0?d:(A[i+1]&&!A[i+1].startsWith('--')?A[i+1]:true)};
const DIR=A[0],THR=+arg('throttle',6),PROF=!!arg('prof',false),Q=arg('q',''),N=+arg('n',1),SHOTS=arg('shots','');
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const serve=dir=>new Promise(res=>{const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg'};const s=http.createServer((q,r)=>{let f=path.join(dir,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});r.end(b)})}).listen(0,'127.0.0.1',()=>res([s,s.address().port]))});
(async()=>{const [srv,port]=await serve(DIR);const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
 for(let run=0;run<N;run++){
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:UA});const p=await ctx.newPage();p.setDefaultTimeout(600000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,140)));const cdp=await ctx.newCDPSession(p);
 if(THR>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:THR});
 const t0=Date.now();await p.goto(`http://127.0.0.1:${port}/index.html${Q?'?'+Q:''}`);await p.waitForSelector('#ob2Play',{state:'visible',timeout:600000});const tTitle=(Date.now()-t0)/1000;
 await p.waitForTimeout(800);
 await p.evaluate(()=>{const S=window.__btS={click:0,ctl:0,gaps:[],last:0,prog:[]};const q=()=>{try{return __tk.q('typeof RO!=="undefined"&&RO.on&&!RO.frozen&&!RO.bootHold')}catch(e){return false}};
  const f=now=>{if(S.click&&!S.ctl){if(S.last&&now-S.last>250)S.gaps.push([Math.round(S.last-S.click),Math.round(now-S.last)]);S.last=now;if(q())S.ctl=Math.round(performance.now())}requestAnimationFrame(f)};requestAnimationFrame(f);
  setInterval(()=>{if(S.click&&!S.ctl&&q())S.ctl=Math.round(performance.now())},40);
  document.getElementById('ob2Play').addEventListener('click',()=>{S.click=Math.round(performance.now());S.last=performance.now()},true)});
 if(PROF){await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:2000});await cdp.send('Profiler.start')}
 const box=await p.locator('#ob2Play').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await p.waitForFunction(()=>window.__btS.ctl>0,null,{polling:250,timeout:900000});
 if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,'first_control.jpg'),type:'jpeg',quality:80});await p.waitForTimeout(5000);await p.screenshot({path:path.join(SHOTS,'plus5s.jpg'),type:'jpeg',quality:80})}
 let prof=null;if(PROF)prof=(await cdp.send('Profiler.stop')).profile;
 const R=await p.evaluate(()=>{const S=window.__btS,c=S.click;const bm=(window.__bmk||[]).filter(x=>x[0]>=c-50).map(x=>[x[0]-c,x[1]]);
  const res=performance.getEntriesByType('resource').filter(e=>e.startTime>=c).map(e=>({n:e.name.split('/').slice(-2).join('/').split('?')[0],st:Math.round(e.startTime-c),d:Math.round(e.duration),b:e.transferSize||e.encodedBodySize||0}));
  let pr=null;try{pr=__tk.q('typeof renderer!=="undefined"?renderer.info.programs.length:null')}catch(e){}
  let pb=null;try{pb=__tk.q('typeof PB!=="undefined"&&PB.t1?Math.round(PB.t1):null')}catch(e){}
  return{pb,toCtl:(S.ctl-c)/1000,bm,res,gaps:S.gaps,pr,sm:(()=>{try{return __tk.q('typeof SM3!=="undefined"?{n:SM3.n,ms:SM3.ms}:null')}catch(e){return null}})(),bh:(()=>{try{return __tk.q('window.__bhSt?{max:Math.round(__bhSt.max),lab:__bhSt.lab,top:__bhSt.L.slice().sort((a,b)=>b[0]-a[0]).slice(0,8)}:null')}catch(e){return null}})()}});
 console.log(`RUN ${run+1} x${THR} title ${tTitle.toFixed(1)} s · PLAY->control ${R.toCtl.toFixed(1)} s · page->drivable (beacon bootMs) ${R.pb} ms · programs ${R.pr} · SM upload ${JSON.stringify(R.sm)} · errors ${errs.length}${errs.length?' '+errs[0]:''}`);
 // phase table: time between consecutive marks (only steps >= 1% of the total)
 const tot=R.toCtl*1000,L=R.bm.concat([[tot,'CONTROL']]);const ph=[];for(let i=0;i<L.length-1;i++){const d=L[i+1][0]-L[i][0];ph.push([L[i][0],d,L[i][1]])}
 console.log('--- phases (start ms, dur ms, mark) >= 1 %');for(const [s,d,l] of ph)if(d>=tot*.01)console.log(String(s).padStart(7)+String(d).padStart(7)+'  '+l);
 const agg={};for(const [s,d,l] of ph){const k=l.replace(/^ld \d+ /,'').replace(/ \d+$/,'');agg[k]=(agg[k]||0)+d}
 console.log('--- by label (ms)\n'+Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,v])=>String(v).padStart(7)+'  '+k).join('\n'));
 const nb=R.res.reduce((a,e)=>a+e.b,0),nd=R.res.reduce((a,e)=>Math.max(a,e.st+e.d),0);console.log(`--- network after tap: ${R.res.length} files ${(nb/1e6).toFixed(2)} MB, last done at ${nd} ms; biggest: `+R.res.sort((a,b)=>b.d-a.d).slice(0,6).map(e=>`${e.n} ${e.d}ms@${e.st}`).join(', '));
 const gs=R.gaps.reduce((a,g)=>a+g[1],0);console.log(`--- rAF gaps > 250 ms: ${R.gaps.length}, sum ${gs} ms; top: `+R.gaps.slice().sort((a,b)=>b[1]-a[1]).slice(0,8).map(g=>`${g[1]}@${g[0]}`).join(' '));
 if(R.bh)console.log('--- buildHubG max step '+R.bh.max+' ms ('+R.bh.lab+'); top '+JSON.stringify(R.bh.top));
 if(prof){const byId=new Map(prof.nodes.map(n=>[n.id,n])),par=new Map();for(const n of prof.nodes)for(const c of n.children||[])par.set(c,n.id);const key=n=>{const f=n.callFrame;return(f.functionName||'(anon)')+' :'+(f.lineNumber+1)};
  const inc={},self={},dt=prof.timeDeltas;for(let i=0;i<prof.samples.length;i++){const d=(dt[i+1]||0)/1000;let id=prof.samples[i];self[key(byId.get(id))]=(self[key(byId.get(id))]||0)+d;const seen=new Set();while(id!=null){const k=key(byId.get(id));if(!seen.has(k)){seen.add(k);inc[k]=(inc[k]||0)+d}id=par.get(id)}}
  const top=(o,n)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k,v])=>v.toFixed(0).padStart(7)+' '+k).join('\n');console.log('--- prof inclusive ms\n'+top(inc,40)+'\n--- prof self ms\n'+top(self,25))}
 await ctx.close()}
 await b.close();srv.close()})().catch(e=>{console.error('BOOTTOCTL FAIL',e);process.exit(1)});
