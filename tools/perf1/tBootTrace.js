// perf-r15g: CDP trace of the desktop GO boot (the tChkGo page: 1280x720, ?test=CITY&draw=0) up to the end of the LKG roam gate; then the longest
// renderer-main task: its nested events (top by duration), GC total, and what the GPU / other threads were doing meanwhile.
// node tools/perf1/tBootTrace.js <out/ver dir> ; env CITY=fra QS=bhs=1 MIN=3000 (report every main task >= MIN ms; default: the longest only)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),CITY=process.env.CITY||'fra';const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0,async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});
 const ctx=await b.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(600000);await p.addInitScript('window.__dbg=1');
 p.on('pageerror',e=>console.log('ERR',String(e).slice(0,150)));const cdp=await ctx.newCDPSession(p);const ev=[];
 const keep=e=>e.ph==='M'||(e.dur>=+(process.env.KEEPUS||2000))||/GC|Scavenge|MarkCompact|Mark|Sweep/.test(e.name);
 cdp.on('Tracing.dataCollected',d=>{for(const e of d.value)if(keep(e))ev.push(e)});
 if(!process.env.NOTR)await cdp.send('Tracing.start',{traceConfig:{includedCategories:['devtools.timeline','disabled-by-default-devtools.timeline','v8.gc','disabled-by-default-v8.gc','gpu','toplevel','blink.user_timing']}});
 p.on('console',m=>{const t=m.text();if(process.env.CON)console.log('C '+t.slice(0,120))});console.log('GOTO');await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?test=${CITY}&draw=0${process.env.QS?'&'+process.env.QS:''}`);
 await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__oc,null,{polling:250});
 console.log('READY '+Math.round(performance.now()));console.log('ARM '+await p.evaluate(()=>new Promise(r=>{let k=0;const A=()=>__oc.ev('LKG.arm');const w=()=>{if(A()&&k++<300)return setTimeout(w,100);r(A())};w()})));console.log('GATE '+Math.round(performance.now()));
 const info=await p.evaluate(()=>({lt:__oc.ev('LKG.lt').slice().sort((a,b)=>b[1]-a[1]).slice(0,4),tEnd:__oc.ev('LKG.tEnd'),bmk:(window.__bmk||[]).slice(-60)}));
 if(!process.env.NOTR){const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');await done}
 const tn={},pn={};for(const e of ev)if(e.ph==='M'){if(e.name==='thread_name')tn[e.pid+':'+e.tid]=e.args.name;if(e.name==='process_name')pn[e.pid]=e.args.name}
 const th=e=>(pn[e.pid]||e.pid)+'/'+(tn[e.pid+':'+e.tid]||e.tid);
 const main=ev.filter(e=>e.ph==='X'&&/RunTask/.test(e.name)&&tn[e.pid+':'+e.tid]==='CrRendererMain');
 const MIN=+(process.env.MIN||0);let L=main.sort((a,b)=>b.dur-a.dur);L=MIN?L.filter(e=>e.dur>=MIN*1000):L.slice(0,1);
 console.log('LT '+JSON.stringify(info.lt)+' tEnd '+info.tEnd);
 for(const T of L){const a=T.ts,z=T.ts+T.dur;console.log('TASK '+(T.dur/1000).toFixed(0)+' ms on '+th(T));
  const ins=ev.filter(e=>e!==T&&e.ph==='X'&&e.ts>=a&&e.ts<=z);const same=ins.filter(e=>e.pid===T.pid&&e.tid===T.tid);
  const gc=same.filter(e=>/GC|Scavenge|MarkCompact/.test(e.name)&&!/Mark|Sweep/.test(e.name.replace(/MarkCompact/,'')));
  console.log(' main nested top: '+same.sort((x,y)=>y.dur-x.dur).slice(0,+(process.env.N||18)).map(e=>e.name+(e.args&&e.args.data&&(e.args.data.functionName||e.args.data.url)?'['+String(e.args.data.functionName||e.args.data.url).slice(-30)+']':'')+':'+(e.dur/1000).toFixed(0)).join(' | '));
  console.log(' main GC events: '+gc.length+' sum '+(gc.reduce((s,e)=>s+e.dur,0)/1000).toFixed(0)+' ms; max '+(gc.length?Math.max(...gc.map(e=>e.dur))/1000:0).toFixed(0));
  const oth={};for(const e of ins)if(!(e.pid===T.pid&&e.tid===T.tid)){const k=th(e)+' '+e.name;oth[k]=(oth[k]||0)+e.dur}
  console.log(' other threads: '+Object.entries(oth).sort((x,y)=>y[1]-x[1]).slice(0,10).map(([k,v])=>k+':'+(v/1000).toFixed(0)).join(' | '))}
 if(process.env.TRACEOUT)fs.writeFileSync(process.env.TRACEOUT,JSON.stringify(ev));
 console.log('BMK '+JSON.stringify(info.bmk.filter(m=>info.lt[0]&&m[0]>info.lt[0][0]-3000&&m[0]<info.lt[0][0]+info.lt[0][1]+500)));
 await b.close();srv.close();process.exit(0)});
