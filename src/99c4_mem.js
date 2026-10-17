// crash-1: GOs mem/stable + mem/tier (lazy chunk: 99c_checklist.js is at its 200 KB cap). State asserts only (no real-time play).
// stable: 5 min of scripted game time (drive + steer, 2 warps, 1 race with the bot), a draw every 20 s game time; geometries/textures/JS heap at the end must be
// <= 110 % of the 60 s sample (monotonic growth = leak). crash-2: judged in BYTES (JS heap + live GPU MB from MEM_GPU), not renderer.info counts: the counts rise with every
// first-visit upload of boot-built city geometry while memFree drops its CPU copy (no growth in bytes); geo/tex counts are still printed. tier: the iOS UA turns the low-memory tier on (pixel ratio <= 1.5, memFree on), a PC UA does not, ?lowmem=0 wins.
function MEM1_smp(){try{if(window.gc){gc();gc()}}catch(e){}const i=renderer.info.memory,pm=performance.memory;const gpu=typeof MEM_GPU!=='undefined'?MEM_GPU.mb():0,heap=pm?Math.round(pm.usedJSHeapSize/1048576):0;return{heap,gpu:Math.round(gpu),tot:Math.round(heap+gpu),geo:i.geometries,tex:i.textures}}
function MEM1_draw(){try{if(window.__tq)__tq.draw();else composer.render()}catch(e){}}
function MEM1_go(kind,say){const ok=b=>b?' ✅':' ❌';
 if(kind==='tier'){const ios='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',pc='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36',pad='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15';
  const a=LOWMEM_is(ios,5,null),p=LOWMEM_is(pad,5,null),b=!LOWMEM_is(pc,0,null),m=!LOWMEM_is(pad,0,null),c=!LOWMEM_is(ios,5,'0'),pr=renderer.getPixelRatio(),d=!LOWMEM||pr<=1.5+1e-6&&!!TUNE.memFree;
  return'📍 LOW-MEM TIER · iPhone '+a+' · iPad '+p+' · PC off '+b+' · Mac off '+m+' · ?lowmem=0 off '+c+' · this page '+(LOWMEM?'ON':'off')+' · pixel ratio '+pr.toFixed(2)+' · memFree '+(TUNE.memFree|0)+ok(a&&p&&b&&m&&c&&d)}
 if(kind==='stable'){const N=5*60*30,R={};let i=0,sp=null,bot=null;const warp=()=>{const q=rfSnap(RO.x+(Math.random()-.5)*2400,RO.z+(Math.random()-.5)*2400,300);if(q)roamWarp(q[0],q[1],q[2]||0,true);RO.v=0};
  const step=()=>{for(let n=0;n<150&&i<N;n++,i++){const t=i/30;
    if(i===Math.round(N*.25)||i===Math.round(N*.5))warp();
    if(i===Math.round(N*.7))try{const mk=tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p));tkStart(mk,TK_C);sp=RO.sp;sp.cd=0;bot=tkBot(tkGeoOf(TK_C).pA,{lag:.15})}catch(e){sp=null}
    if(i===Math.round(N*.85)&&sp){try{$('#spRes').hidden=true}catch(e){}RO.fin=false;if(RO.sp===sp)try{sprintEnd()}catch(e){}sp=null}
    if(sp&&RO.sp===sp)bot(sp);else{K.ArrowUp=true;K.ArrowLeft=((i/90|0)%3===0)}
    roamStep(1/30);if(i%600===0)MEM1_draw();if(i===1800)R.a=MEM1_smp()}
   if(i<N){setTimeout(step,0);return}
   K.ArrowUp=K.ArrowLeft=K.ArrowRight=false;MEM1_draw();R.z=MEM1_smp();const a=R.a,z=R.z,g=k=>a[k]?Math.round((z[k]-a[k])/a[k]*100):0,pass=g('tot')<=10&&g('heap')<=10;window.__chk.mem=R;
   say('📍 MEM STABLE · 5 min play'+(LOWMEM?' (low-mem tier)':'')+' · at 60 s heap '+a.heap+' + GPU '+a.gpu+' = '+a.tot+' MB → end '+z.heap+' + '+z.gpu+' = '+z.tot+' MB ('+g('tot')+' %, heap '+g('heap')+' %) ≤ +10 % · counts geo '+a.geo+'→'+z.geo+' tex '+a.tex+'→'+z.tex+' (first-visit uploads of boot-built city, CPU copy dropped)'+ok(pass))};
  setTimeout(step,0);return'📍 MEM STABLE · 5 min scripted play…'}}
