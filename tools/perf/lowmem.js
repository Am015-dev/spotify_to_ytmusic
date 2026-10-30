// lowmem-r24h: phone-profile memory + frame probe on a BUILT page (plan lane 1). node tools/perf/lowmem.js <page url> <fra|ath> [extra query, e.g. low=0] [shot.jpg]
// iPhone UA, 852x393 touch, DPR 3. Boots ?test=<city>&draw=0, settles 10 s game time, then reads JS heap (after gc) + MEM_GPU.est() (buffers + textures + mips + render buffers + canvas)
// + renderer.info; then 6x CPU and drives a fixed route 30 s (900 x 1/30 s, roamStep + one real composer frame each) -> median / p95 frame ms. One JSON line.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,C,XQ,SHOT]=process.argv.slice(2);
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
(async()=>{const b=await chromium.launch({args:['--js-flags=--expose-gc','--enable-precise-memory-info','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:UA});const p=await ctx.newPage();p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+(C||'fra')+'&draw=0'+(XQ?'&'+XQ:''));await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:300000});
 const ev=s=>p.evaluate(s=>__xc.ev(s),s);
 await ev(`window.__LM={mem(){try{gc();gc()}catch(e){}const i=renderer.info,G=MEM_GPU;return{low:!!LOWMEM,heap:Math.round(performance.memory.usedJSHeapSize/1048576),gpu:MEM_GPU.est(),texMB:+((G.tb+G.mxb)/1048576).toFixed(1),bufMB:+(G.bb/1048576).toFixed(1),rbMB:+(G.rbb/1048576).toFixed(1),cv:renderer.domElement.width+'x'+renderer.domElement.height,geo:i.memory.geometries,tex:i.memory.textures,sh:!!renderer.shadowMap.enabled,cars:(HUB.cars||[]).filter(c=>!c.dead).length}},
  drive(n,draw){const ms=[];let calls=0;K.ArrowUp=true;for(let i=0;i<n;i++){K.ArrowLeft=((i/90|0)%4===1);K.ArrowRight=((i/90|0)%4===3);const t=performance.now();roamStep(1/30);if(draw){__tq.draw();calls+=renderer.info.render.calls}ms.push(performance.now()-t)}K.ArrowUp=K.ArrowLeft=K.ArrowRight=false;ms.sort((a,b)=>a-b);return{med:+ms[n>>1].toFixed(1),p95:+ms[Math.floor(n*.95)].toFixed(1),calls:Math.round(calls/Math.max(1,n))}}}`);
 await ev('__LM.drive(300,0)');await p.evaluate(()=>__tq.draw());const m=await ev('__LM.mem()');
 if(SHOT)await p.screenshot({path:SHOT,type:'jpeg',quality:80});
 const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
 const f=await ev('__LM.drive(900,1)');await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});const m2=await ev('__LM.mem()');
 console.log(JSON.stringify({city:C,q:XQ||'',...m,heapEnd:m2.heap,gpuEnd:m2.gpu,...f,errs:errs.slice(0,3)}));await b.close()})();
