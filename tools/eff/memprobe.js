// PERF-2 memory probe: enter roam (CITY=fra|ath, ?fast=1), drive, then garage open/close. Samples:
//  heapMB = V8 heap after full GC (CDP JSHeapUsedSize) · totMB = performance.memory (heap + typed-array backing stores)
//  glMB = live WebGL buffer bytes (bufferData/deleteBuffer hook, exact) · texMB (texImage2D/texStorage2D estimate) · geoms/tex = renderer.info.memory
//  cpuMB = typed arrays still attached to scene geometries (dedup by ArrayBuffer) · own = top owners of cpu/gpu bytes in the scene
// usage: CITY=ath DRIVE=60 node tools/eff/memprobe.js <url local_dbg.html> [out.json]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2],OUT=process.argv[3],CITY=process.env.CITY||'fra',DRIVE=+(process.env.DRIVE||60);
const HOOK=`(()=>{const B=new WeakMap();const G={buf:0,tex:0};window.__GLM=G;for(const C of [window.WebGL2RenderingContext,window.WebGLRenderingContext]){if(!C)continue;const P=C.prototype;
 const bd=P.bufferData;P.bufferData=function(t,d,u){const b=this.getParameter(t===this.ELEMENT_ARRAY_BUFFER?this.ELEMENT_ARRAY_BUFFER_BINDING:this.ARRAY_BUFFER_BINDING);const n=typeof d==='number'?d:(d&&d.byteLength)||0;if(b){G.buf+=n-(B.get(b)||0);B.set(b,n)}return bd.apply(this,arguments)};
 const db=P.deleteBuffer;P.deleteBuffer=function(b){if(b&&B.has(b)){G.buf-=B.get(b);B.delete(b)}return db.apply(this,arguments)}}})();`;
const SAMPLE=()=>{gc();const r=__dbg.renderer,seen=new Set(),own={};let cpu=0;const key=o=>{let a=o,path=[];while(a&&a.parent&&path.length<12){path.push(a.name||(a.userData&&Object.keys(a.userData).slice(0,2).join('+'))||a.type);a=a.parent}path.reverse();return path.slice(0,3).join('/')};
 __dbg.scene.traverse(o=>{const g=o.geometry;if(!g)return;const k=key(o),e=own[k]||(own[k]={n:0,cpu:0,gpu:0});e.n++;const at=Object.values(g.attributes);if(g.index)at.push(g.index);for(const a of at){const d=a.isInterleavedBufferAttribute?a.data:a,arr=d.array;const id=arr?arr.buffer:d;if(seen.has(id))continue;seen.add(id);const by=arr?arr.byteLength:0;cpu+=by;e.cpu+=by;e.gpu+=by||d.count*(a.itemSize||1)*4}});
 const top=Object.entries(own).map(([k,v])=>[k,v.n,+(v.cpu/1048576).toFixed(1),+(v.gpu/1048576).toFixed(1)]).sort((a,b)=>b[3]-a[3]).slice(0,14);
 return{totMB:+(performance.memory.usedJSHeapSize/1048576).toFixed(1),glMB:+(__GLM.buf/1048576).toFixed(1),cpuMB:+(cpu/1048576).toFixed(1),geoms:r.info.memory.geometries,tex:r.info.memory.textures,progs:r.info.programs.length,top}};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info','--js-flags=--expose-gc']});
const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(1800000);await p.addInitScript(HOOK);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
const cdp=await ctx.newCDPSession(p);await cdp.send('Performance.enable');const R={city:CITY,s:[]};
const samp=async lbl=>{const s=await p.evaluate(SAMPLE);const m=await cdp.send('Performance.getMetrics');s.heapMB=+(m.metrics.find(x=>x.name==='JSHeapUsedSize').value/1048576).toFixed(1);s.lbl=lbl;R.s.push(s);const{top,...o}=s;console.log(JSON.stringify(o))};
await p.goto(URL+'?fast=1');await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},CITY);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});await samp('menu');
let t=Date.now();await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:200});R.enter_s=(Date.now()-t)/1000;console.log('enter',R.enter_s);await samp('roam');
await p.keyboard.down('ArrowUp');for(let i=0;i<DRIVE;i++){await p.waitForTimeout(1000);if(i%6===3){await p.keyboard.down(i%12===3?'ArrowLeft':'ArrowRight');await p.waitForTimeout(500);await p.keyboard.up('ArrowLeft');await p.keyboard.up('ArrowRight')}if(i%20===19)await samp('drive'+(i+1))}await p.keyboard.up('ArrowUp');
await p.evaluate(()=>document.querySelector('#roamPause [data-p=garage]').click());await p.waitForFunction(()=>{const g=document.querySelector('#gbx');return g&&!g.hidden&&g.getBoundingClientRect().width>10},null,{polling:200});await p.waitForTimeout(3000);await samp('garage');
const cl=await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.offsetWidth&&/^(✕|×|DONE|CLOSE|BACK|◀ BACK|SAVE.*|EXIT)/i.test(b.textContent.trim())&&b.closest('[id]')&&/gb|gar/i.test(b.closest('[id]').id));if(b)b.click();return b&&b.textContent.trim()});
await p.waitForTimeout(5000);await samp('after_garage:'+cl);
R.errs=errs;if(OUT)fs.writeFileSync(OUT,JSON.stringify(R,null,1));console.log('top owners (last):');for(const x of R.s[R.s.length-1].top)console.log(' ',x.join(' '));console.log('errs',errs.slice(0,4));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
