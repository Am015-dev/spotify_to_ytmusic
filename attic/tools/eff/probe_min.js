const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const URL=process.argv[2]||'https://am015-dev.github.io/spotify_to_ytmusic/mainhattan-overdrive/';
const CITY=process.env.CITY||'fra';
const HOOK=`(()=>{const G={calls:0,tris:0};window.__G=G;for(const C of [window.WebGL2RenderingContext,window.WebGLRenderingContext]){if(!C)continue;const P=C.prototype;const wr=(n,fn)=>{const o=P[n];if(!o)return;P[n]=function(){fn(arguments);return o.apply(this,arguments)}};wr('drawElements',a=>{G.calls++;if(a[0]===4)G.tris+=a[1]/3});wr('drawArrays',a=>{G.calls++;if(a[0]===4)G.tris+=a[2]/3});wr('drawElementsInstanced',a=>{G.calls++;if(a[0]===4)G.tris+=a[1]/3*a[4]});wr('drawArraysInstanced',a=>{G.calls++;if(a[0]===4)G.tris+=a[2]/3*a[3]})}const raf=window.requestAnimationFrame.bind(window);let acc={c:0,t:0,n:0,ms:0};G.win=()=>{const r={calls:Math.round(acc.c/Math.max(1,acc.n)),tris:Math.round(acc.t/Math.max(1,acc.n)),cbMs:+(acc.ms/Math.max(1,acc.n)).toFixed(1),frames:acc.n};acc={c:0,t:0,n:0,ms:0};return r};window.requestAnimationFrame=cb=>raf(t=>{const c0=G.calls,t0=G.tris,p=performance.now();cb(t);const d=G.calls-c0;if(d>0){acc.c+=d;acc.t+=G.tris-t0;acc.n++;acc.ms+=performance.now()-p}})})();`;
(async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info','--js-flags=--expose-gc']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:(process.env.MIN?1:3),isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();await p.addInitScript(HOOK);if(process.env.MIN)await p.addInitScript("Object.defineProperty(window,'devicePixelRatio',{get:()=>0.35,configurable:true})");p.setDefaultTimeout(600000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,120)));
 const cdp=await ctx.newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Performance.enable');
 const req={};cdp.on('Network.responseReceived',e=>{req[e.requestId]={url:e.response.url,mime:e.response.mimeType,enc:e.response.headers['content-encoding']||'',cc:e.response.headers['cache-control']||'',t0:e.response.timing?e.response.timing.requestTime:0}});
 cdp.on('Network.loadingFinished',e=>{if(req[e.requestId]){req[e.requestId].bytes=e.encodedDataLength;req[e.requestId].tEnd=e.timestamp}});
 const R={city:CITY};const T0=Date.now();const lap=k=>{R[k]=+((Date.now()-T0)/1000).toFixed(2);console.log(k,R[k])};
 const heap=async k=>{await p.evaluate(()=>window.gc&&gc());const m=await cdp.send('Performance.getMetrics');const g=n=>m.metrics.find(x=>x.name===n).value;R[k+'_heapMB']=+(g('JSHeapUsedSize')/1048576).toFixed(0);R[k+'_nodes']=g('Nodes');console.log(k,'heap',R[k+'_heapMB'])};
 const info=async k=>{await p.evaluate(()=>__G.win());await p.waitForTimeout(2500);const i=await p.evaluate(()=>({...__G.win(),progs:__mho.info().progs}));R[k+'_gl']=i;console.log(k,JSON.stringify(i))};
 const fps=async ms=>p.evaluate(ms=>new Promise(r=>{let n=0,mx=0,l=performance.now();const t0=l;const f=()=>{const t=performance.now();mx=Math.max(mx,t-l);l=t;n++;if(t-t0<ms)requestAnimationFrame(f);else r({fps:+(n/((t-t0)/1000)).toFixed(1),worstMs:Math.round(mx)})};requestAnimationFrame(f)}),ms);
 // tracing for parse/compile during first load
 await cdp.send('Tracing.start',{categories:'v8,devtools.timeline,disabled-by-default-v8.compile',transferMode:'ReturnAsStream'});
 await p.goto(URL,{waitUntil:'load'});lap('load_event');
 await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:100});lap('menu_ready');
 const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');const tc=await done;
 let s='';for(;;){const c=await cdp.send('IO.read',{handle:tc.stream});s+=c.data;if(c.eof)break}
 const ev=JSON.parse(s.startsWith('[')?s:s).traceEvents||JSON.parse(s);const sum={};for(const e of ev){if(e.ph!=='X'||!e.dur)continue;const n=e.name;if(/Compile|Parse|EvaluateScript|FunctionCall|v8.run|GC|MajorGC|MinorGC/.test(n)&&e.tid){sum[n]=(sum[n]||0)+e.dur}}
 R.trace_ms=Object.fromEntries(Object.entries(sum).map(([k,v])=>[k,Math.round(v/1000)]).sort((a,b)=>b[1]-a[1]).slice(0,12));console.log(JSON.stringify(R.trace_ms));
 R.paint=await p.evaluate(()=>performance.getEntriesByType('paint').map(e=>[e.name,Math.round(e.startTime)]));
 R.nav=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return{ttfb:Math.round(n.responseStart),dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd)}});
 R.res=await p.evaluate(()=>performance.getEntriesByType('resource').map(e=>({n:e.name.split('/').slice(-1)[0].slice(0,50),kb:Math.round(e.transferSize/1024),dec:Math.round(e.decodedBodySize/1024),ms:Math.round(e.duration),st:Math.round(e.startTime)})));
 await heap('menu');await info('menu');R.menu_fps=await fps(3000);
 // enter roam
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},CITY);
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:100});
 let t=Date.now();await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:100});R.roam_enter_s=+((Date.now()-t)/1000).toFixed(1);console.log('roam enter',R.roam_enter_s);
 await p.waitForTimeout(1500);await heap('roam');await info('roam_idle');R.roam_idle_fps=await fps(3000);
 await p.keyboard.down('ArrowUp');await p.waitForTimeout(1500);const samp=[];for(let i=0;i<4;i++){await p.evaluate(()=>__G.win());const f=await fps(2500);const g=await p.evaluate(()=>__G.win());samp.push({...f,...g});await p.keyboard.down(i%2?'ArrowLeft':'ArrowRight');await p.waitForTimeout(400);await p.keyboard.up('ArrowLeft');await p.keyboard.up('ArrowRight')}
 await p.keyboard.up('ArrowUp');R.drive=samp;console.log('drive',JSON.stringify(samp));await heap('roam_after_drive');
 const cpu=await cdp.send('Performance.getMetrics');R.cpu=Object.fromEntries(cpu.metrics.filter(m=>/Duration/.test(m.name)).map(m=>[m.name,+m.value.toFixed(1)]));
 // garage
 t=Date.now();await p.evaluate(()=>document.querySelector('#roamPause [data-p=garage]').click());await p.waitForFunction(()=>{const g=document.querySelector('#gbx');return g&&!g.hidden&&g.getBoundingClientRect().width>10},null,{polling:50});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));R.garage_open_s=+((Date.now()-t)/1000).toFixed(2);console.log('garage',R.garage_open_s);
 await p.waitForTimeout(1000);await heap('garage');await info('garage');R.garage_fps=await fps(3000);
 if(CITY==='fra'){ // race from menu
  await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:100});await heap('menu2');
  t=Date.now();await p.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'Enter',key:'Enter',bubbles:true})));
  await p.waitForFunction(()=>__mho.state&&__mho.state!=='menu'&&!(__mho.LD&&__mho.LD.on),null,{polling:50});R.race_state=await p.evaluate(()=>__mho.state);R.race_enter_s=+((Date.now()-t)/1000).toFixed(2);
  await p.waitForTimeout(4000);await heap('race');await info('race');R.race_fps=await fps(3000);}
 R.errs=errs.slice(0,5);
 const nets=Object.values(req).filter(r=>r.bytes).map(r=>({f:r.url.split('/').slice(-1)[0].slice(0,40)||r.url.slice(0,60),kB:Math.round(r.bytes/1024),enc:r.enc,cc:r.cc})).sort((a,b)=>b.kB-a.kB);R.net=nets;R.net_total_kB=nets.reduce((a,b)=>a+b.kB,0);
 require('fs').writeFileSync('probe_'+CITY+(process.env.MIN?'_min':'')+'.json',JSON.stringify(R,null,1));console.log('total kB',R.net_total_kB);
 await b.close()})().catch(e=>{console.error(e);process.exit(1)});
