// crash-3: boot memory peak under iPhone emulation (852x393, DPR 3, iOS UA). node tools/crash3/tBoot.js <page url> <fra|ath> [settle s=20]
// Samples heap (performance.memory) + live GPU MB (MEM_GPU) every 100 ms in the page from the first script to drivable + settle; prints peak, at-ready and settled.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,C0,SET0]=process.argv.slice(2);const C=C0||'ath',SET=+(SET0||20);
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
(async()=>{const b=await chromium.launch({args:['--js-flags=--expose-gc','--enable-precise-memory-info','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:UA});const p=await ctx.newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await p.addInitScript(()=>{window.__BP={pk:0,ph:0,pg:0,n:0};setInterval(()=>{const h=performance.memory.usedJSHeapSize/1048576,g=typeof MEM_GPU!=='undefined'?MEM_GPU.mb():0,B=window.__BP;B.n++;if(h+g>B.pk){B.pk=h+g;B.ph=h;B.pg=g}},100)});
 const T0=Date.now();await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+C+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:400000});const tReady=(Date.now()-T0)/1000;
 const ev=s=>p.evaluate(s=>__xc.ev(s),s),smp=()=>ev(`(()=>{const h=performance.memory.usedJSHeapSize/1048576,g=MEM_GPU.mb();return{heap:Math.round(h),gpu:Math.round(g),tot:Math.round(h+g),geo:renderer.info.memory.geometries,tex:renderer.info.memory.textures}})()`);
 const atReady=await smp();await p.evaluate(()=>{try{__tq.draw()}catch(e){}});for(let i=0;i<SET;i++){await ev(`{K.ArrowUp=true;for(let k=0;k<30;k++)roamStep(1/30);K.ArrowUp=false;if(Math.random()<.2)__tq.draw()}`);await p.waitForTimeout(1000)}
 const settled=await smp();await p.evaluate(()=>{try{gc();gc()}catch(e){}});const gcd=await smp();const B=await p.evaluate(()=>window.__BP);
 console.log('BOOT',C,JSON.stringify({ready_s:+tReady.toFixed(1),peak:{tot:Math.round(B.pk),heap:Math.round(B.ph),gpu:Math.round(B.pg)},atReady,settled,afterGC:gcd,lowmem:await p.evaluate(()=>window.__lowmem),errs:errs.slice(0,3)}));await b.close()})();
