// crash-6: who grows the heap after minute 1? Same scripted play as crash2/tMem2.js; a V8 sampling heap profile runs from t=60 s to the end and the
// live-at-end allocation sites are printed by retained MB (GROW lines). node tools/crash6/tGrow.js <page url> <label> [fra|ath] [minutes=5]
// (crash-2 copy of crash1/tMem.js + live GPU MB from MEM_GPU and the textures > 1024 px): iPhone-16 memory probe on a BUILT page. node tools/crash1/tMem.js <page url> <label> [fra|ath] [minutes=5]
// iPhone emulation (852x393, DPR 3, touch, iOS UA). Scripted play in game time: roam drive + smashes, 2 warps, 1 race; a draw every 2 s game time.
// Prints one JSON line per sample (heap after GC, renderer.info, canvas, live cars/debris/scene objects) and a final summary line.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,LB,C0,MIN]=process.argv.slice(2);const C=C0||'fra',M=+(MIN||5);
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
(async()=>{const b=await chromium.launch({args:['--js-flags=--expose-gc','--enable-precise-memory-info','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:UA});const p=await ctx.newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+C+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:240000});
 const ev=s=>p.evaluate(s=>__xc.ev(s),s);
 await ev(`window.__M1={smp(t){try{gc();gc()}catch(e){}const i=renderer.info,cv=renderer.domElement;let obj=0,mesh=0,vb=0;const G=new Set;scene.traverse(o=>{obj++;if(o.isMesh||o.isPoints||o.isLine){mesh++;if(o.geometry&&!G.has(o.geometry)){G.add(o.geometry);for(const k in o.geometry.attributes){const a=o.geometry.attributes[k];if(a&&a.array)vb+=a.array.byteLength}}}});
  return{t,heap:Math.round(performance.memory.usedJSHeapSize/1048576),geo:i.memory.geometries,tex:i.memory.textures,prog:(i.programs||[]).length,calls:i.render.calls,tri:i.render.triangles,cv:cv.width+'x'+cv.height,pr:+renderer.getPixelRatio().toFixed(2),cars:(HUB.cars||[]).filter(c=>!c.dead).length,obj,mesh,sceneGeoMB:Math.round(vb/1048576),lowGfx,q:SET.q,gpu:typeof MEM_GPU!=='undefined'?MEM_GPU.mb():-1,gpuB:typeof MEM_GPU!=='undefined'?Math.round(MEM_GPU.bb/1048576):-1,tot:Math.round(performance.memory.usedJSHeapSize/1048576+(typeof MEM_GPU!=='undefined'?MEM_GPU.mb():0))}},
  drive(n,steer){K.ArrowUp=true;for(let i=0;i<n;i++){K.ArrowLeft=steer&&((i/90|0)%3===0);roamStep(1/30)}K.ArrowUp=K.ArrowLeft=false}}`);
 const S=[];const T0=Date.now();const smp=async t=>{await p.evaluate(()=>__tq.draw()).catch(()=>{});const r=await ev(`__M1.smp(${t})`);r.wall=Math.round((Date.now()-T0)/1000);S.push(r);console.log(JSON.stringify(r))};
 await smp(0);const cdp=await ctx.newCDPSession(p);let samp=0;const steps=Math.round(M*60/2);let t=0;
 for(let k=0;k<steps;k++){t+=2;const ph=k/steps;
  if(Math.abs(ph-.25)<.5/steps||Math.abs(ph-.5)<.5/steps)await ev(`{const q=rfSnap(RO.x+(Math.random()-.5)*2400,RO.z+(Math.random()-.5)*2400,300);if(q)roamWarp(q[0],q[1],q[2]||0,true);RO.v=0}`);
  if(Math.abs(ph-.7)<.5/steps)await ev(`{try{const {sp,bot}=XC_need?null:null}catch(e){}}`).catch(()=>{});
  if(ph>=.7&&ph<.85){await ev(`{if(!window.__M1.sp&&typeof RV2K2_race==='function'){try{const m=tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p));tkStart(m,TK_C);RO.sp.cd=0;window.__M1.sp=RO.sp;window.__M1.bot=typeof tkBot==='function'?tkBot(tkGeoOf(TK_C).pA,{lag:.15}):null}catch(e){window.__M1.sp=1}}
    const s=window.__M1.sp;if(s&&s!==1&&RO.sp===s){for(let i=0;i<60;i++){if(window.__M1.bot)window.__M1.bot(s);else K.ArrowUp=true;roamStep(1/30)}}else __M1.drive(60,1)}`)}
  else{if(ph>=.85)await ev(`{const s=window.__M1.sp;if(s&&s!==1&&RO.sp===s){try{$('#spRes').hidden=true}catch(e){}try{sprintEnd()}catch(e){}}}`);
   await ev(`__M1.drive(60,1)`)}
  if(!samp&&t>=60){samp=1;await p.evaluate(()=>{try{gc();gc()}catch(e){}});await cdp.send('HeapProfiler.enable');await cdp.send('HeapProfiler.startSampling',{samplingInterval:16384})}
  if(k%(+process.env.EVERY||5)===0||k===steps-1)await smp(t)}
 await p.evaluate(()=>{try{gc();gc()}catch(e){}});const {profile}=await cdp.send('HeapProfiler.getSamplingProfile');const A={};const walk=(n,st)=>{const f=n.callFrame,k=(f.functionName||'(anon)')+' '+(f.url||'').split('/').pop().slice(0,24)+':'+(f.lineNumber+1);const st2=[k,...st].slice(0,3);if(n.selfSize){const kk=st2.join(' < ');A[kk]=(A[kk]||0)+n.selfSize}for(const c of n.children)walk(c,st2)};walk(profile.head,[]);
 Object.entries(A).sort((x,y)=>y[1]-x[1]).slice(0,+process.env.TOP||20).forEach(([k,v])=>console.log('GROW',(v/1048576).toFixed(1),'MB',k.slice(0,300)));
 const a=S.find(s=>s.t>=60)||S[0],z=S[S.length-1],g=(x,y)=>a[x]?Math.round((z[x]-a[x])/a[x]*100):0;
 console.log('SUMMARY',LB,C,JSON.stringify({first:S[0],at60:a,end:z,grow:{heap:g('heap'),geo:g('geo'),tex:g('tex'),gpu:g('gpu'),tot:g('tot')},maxHeap:Math.max(...S.map(s=>s.heap)),maxCars:Math.max(...S.map(s=>s.cars)),errs:errs.slice(0,3)}));await b.close()})();
