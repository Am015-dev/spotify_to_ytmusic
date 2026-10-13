// tools/ct/ctProbe.js <url> <outdir> <fra|ath> : city-1 traffic/building probe at 852×393. Enters roam, prints the LEGO traffic kinds (size, tris),
// renderer draws/tris per frame, GPU memory estimate, errors; shoots a traffic close-up per LEGO kind found near the start and a street view.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const GLHOOK=`(()=>{const B=new WeakMap();const G={buf:0};window.__GLM=G;for(const C of [window.WebGL2RenderingContext,window.WebGLRenderingContext]){if(!C)continue;const P=C.prototype;
 const bd=P.bufferData;P.bufferData=function(t,d,u){const b=this.getParameter(t===this.ELEMENT_ARRAY_BUFFER?this.ELEMENT_ARRAY_BUFFER_BINDING:this.ARRAY_BUFFER_BINDING);const n=typeof d==='number'?d:(d&&d.byteLength)||0;if(b){G.buf+=n-(B.get(b)||0);B.set(b,n)}return bd.apply(this,arguments)};
 const db=P.deleteBuffer;P.deleteBuffer=function(b){if(b&&B.has(b)){G.buf-=B.get(b);B.delete(b)}return db.apply(this,arguments)}}})();`;
// one frame's draw calls / triangles (all composer passes), JS heap and live GL buffer MB
const FRAME=p=>p.evaluate(()=>new Promise(res=>{try{gc()}catch(e){}requestAnimationFrame(()=>{const r=__ct.r();r.info.autoReset=false;r.info.reset();requestAnimationFrame(()=>{const i=r.info.render,o={calls:i.calls,tris:i.triangles,heapMB:+(performance.memory.usedJSHeapSize/1048576).toFixed(1),glMB:+(__GLM.buf/1048576).toFixed(1),geos:r.info.memory.geometries};r.info.autoReset=true;res(o)})})}));
(async()=>{const [URL,OUT,CITY]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--js-flags=--expose-gc','--enable-precise-memory-info','--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();await p.addInitScript(GLHOOK);p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'||/CT |LDW|CTB/.test(m.text()))errs.push(m.text().slice(0,200))});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath')localStorage.setItem('mho_city@1','ath')},CITY);
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{timeout:300000});
 await p.evaluate(()=>{__mho.storyClose&&__mho.storyClose();__mho.roamSim(20);try{__ju.autoClose(true)}catch(e){}});await p.waitForTimeout(3000);
 const info=await p.evaluate(()=>({hcar:__ct.hcar(),stat:__ct.CT.stat,ctb:window.__ctb&&__ctb.stat&&__ctb.stat()}));console.log('CT',CITY,JSON.stringify(info));
 console.log('RENDER start',JSON.stringify(await FRAME(p)));
 for(const [nm,v] of (process.env.VIEWS||'').split(';').filter(Boolean).map(q=>q.split('='))){await p.evaluate(c=>__gnb.cam(c),v.split(',').map(Number));await p.waitForTimeout(1500);console.log('RENDER',nm,JSON.stringify(await FRAME(p)));await p.screenshot({path:`${OUT}/${CITY}_${nm}.png`})}
 await p.evaluate(()=>__gnb.cam(null));
 await p.screenshot({path:`${OUT}/${CITY}_start.png`});
 const cars=await p.evaluate(()=>__ct.cars());const seen={};let n=0;
 for(const c of cars){if(seen[c.nm]||!c.nm.startsWith('ld:')||c.d<20||c.d>220||cars.some(q=>q!==c&&Math.hypot(q.x-c.x,q.z-c.z)<9))continue;seen[c.nm]=1;const a=c.h,fx=Math.sin(a),fz=Math.cos(a);
  await p.evaluate(c=>{__ct.freeze(1);__gnb.cam([c.x+Math.sin(c.h+.7)*7,c.y+2.2,c.z+Math.cos(c.h+.7)*7,c.x,c.y+.8,c.z])},c);await p.waitForTimeout(1200);
  const f=`${OUT}/${CITY}_car_${c.nm.replace(/:/g,'_')}.png`;await p.screenshot({path:f});console.log('shot',f);if(++n>=10)break}
 await p.evaluate(()=>__ct.freeze(0));
 if(!process.env.NOB){const bs=await p.evaluate(()=>{const S=__ctb.CTB,out=[],RO=__ctb.pos();for(const k in S.K){const L=S.K[k].L;let b=null;for(const o of L){const d=Math.hypot(o.x-RO.x,o.z-RO.z);if(!b||d<b.d)b={k,d,...o,W:S.K[k].W,D:S.K[k].D,H:S.K[k].H}}if(b)out.push(b)}return out.sort((a,b)=>a.d-b.d)});
  for(const B of bs.slice(0,+(process.env.NB||4))){const fx=-Math.sin(B.a),fz=-Math.cos(B.a),sx=Math.cos(B.a),sz=-Math.sin(B.a),R=Math.max(B.W,B.H)*1.2+6;
   await p.evaluate(c=>__gnb.cam(c),[B.x+fx*R+sx*R*.5,B.y+1.6+B.H*.35,B.z+fz*R+sz*R*.5,B.x,B.y+B.H*.4,B.z]);await p.waitForTimeout(1500);const f=`${OUT}/${CITY}_bld_${B.k}.png`;await p.screenshot({path:f});console.log('shot',f,JSON.stringify(await FRAME(p)))}
  await p.evaluate(()=>__gnb.cam(null));console.log('CTB',JSON.stringify(await p.evaluate(()=>__ctb.stat())))}
 console.log('ERR',JSON.stringify(errs.slice(0,8)));await b.close()})();
