// tools/ct/ctbShot.js <url> <outdir> <fra|ath> [tag] : city-2 LEGO buildings probe at 852×393 (headless). Enters roam, prints CTB stats (kinds, sizes,
// tris, GPU MB), renderer draws/tris/heap/glMB at the start view, shoots the start view, a raised street view along the road and close-ups of the
// nearest CTB buildings (one per model). Compare with the same url + ctb=0 (old buildings).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const GLHOOK=`(()=>{const B=new WeakMap();const G={buf:0};window.__GLM=G;for(const C of [window.WebGL2RenderingContext,window.WebGLRenderingContext]){if(!C)continue;const P=C.prototype;
 const bd=P.bufferData;P.bufferData=function(t,d,u){const b=this.getParameter(t===this.ELEMENT_ARRAY_BUFFER?this.ELEMENT_ARRAY_BUFFER_BINDING:this.ARRAY_BUFFER_BINDING);const n=typeof d==='number'?d:(d&&d.byteLength)||0;if(b){G.buf+=n-(B.get(b)||0);B.set(b,n)}return bd.apply(this,arguments)};
 const db=P.deleteBuffer;P.deleteBuffer=function(b){if(b&&B.has(b)){G.buf-=B.get(b);B.delete(b)}return db.apply(this,arguments)}}})();`;
const FRAME=p=>p.evaluate(()=>new Promise(res=>{try{gc()}catch(e){}requestAnimationFrame(()=>{const r=__ct.r();r.info.autoReset=false;r.info.reset();requestAnimationFrame(()=>{const i=r.info.render,o={calls:i.calls,tris:i.triangles,heapMB:+(performance.memory.usedJSHeapSize/1048576).toFixed(1),glMB:+(__GLM.buf/1048576).toFixed(1),geos:r.info.memory.geometries};r.info.autoReset=true;res(o)})})}));
(async()=>{const [URL,OUT,CITY,TAG='']=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--js-flags=--expose-gc','--enable-precise-memory-info','--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();await p.addInitScript(GLHOOK);p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'||/CTB/.test(m.text()))errs.push(m.text().slice(0,300))});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:1500000});
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath')localStorage.setItem('mho_city@1','ath')},CITY);
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:1500000});
 await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{timeout:1500000});
 await p.evaluate(()=>{__mho.storyClose&&__mho.storyClose();__mho.roamSim(20);try{__ju.autoClose(true)}catch(e){}});await p.waitForTimeout(3000);
 console.log('CTB',CITY,TAG,JSON.stringify(await p.evaluate(()=>window.__ctb&&__ctb.stat())));
 console.log('RENDER start',TAG,JSON.stringify(await FRAME(p)));
 await p.screenshot({path:`${OUT}/${CITY}${TAG}_start.png`});
 // raised street view: 3 m above the car, looking 70 m along the camera's heading
 await p.evaluate(()=>__gnb.cam(__ctb.look(4,3.2,70,4)));
 await p.waitForTimeout(1500);console.log('RENDER street',TAG,JSON.stringify(await FRAME(p)));await p.screenshot({path:`${OUT}/${CITY}${TAG}_street.png`});
 if(process.env.CAM||CITY==='ath'){const c=process.env.CAM?process.env.CAM.split(',').map(Number):await p.evaluate(()=>{const P=__ctb.pos();return __ctb.scam(P.x,P.z)});console.log('CAM',c&&c.map(v=>+v.toFixed(1)).join(','));
  if(c){await p.evaluate(c=>{__mho.roamSim&&0;__gnb.cam(c)},c);await p.waitForTimeout(2500);console.log('RENDER cam',TAG,JSON.stringify(await FRAME(p)));await p.screenshot({path:`${OUT}/${CITY}${TAG}_cam.png`})}}
 await p.evaluate(()=>__gnb.cam(__ctb.look(30,22,60,0)));
 await p.waitForTimeout(1500);await p.screenshot({path:`${OUT}/${CITY}${TAG}_high.png`});
 if(!process.env.NOB&&!/ctb=0/.test(URL)){const bs=await p.evaluate(()=>{const S=__ctb.CTB,out=[],RO=__ctb.pos();for(const k in S.K){if(!S.K[k])continue;const L=S.K[k].L;let b=null;for(const o of L){const d=Math.hypot(o.x-RO.x,o.z-RO.z);if(!b||d<b.d)b={k,d,x:o.x,y:o.y,z:o.z,a:o.a,W:S.K[k].W,D:S.K[k].D,H:S.K[k].H}}if(b)out.push(b)}return out.sort((a,b)=>a.d-b.d)});
  for(const B of bs.slice(0,+(process.env.NB||12))){const fx=-Math.sin(B.a),fz=-Math.cos(B.a),sx=Math.cos(B.a),sz=-Math.sin(B.a),R=Math.max(B.W,B.H)*1.1+5;
   await p.evaluate(c=>__gnb.cam(c),[B.x+fx*R+sx*R*.45,B.y+1.6+B.H*.3,B.z+fz*R+sz*R*.45,B.x,B.y+B.H*.42,B.z]);await p.waitForTimeout(1200);const f=`${OUT}/${CITY}${TAG}_bld_${B.k}.png`;await p.screenshot({path:f});console.log('shot',f)}}
 await p.evaluate(()=>__gnb.cam(null));console.log('ERR',JSON.stringify(errs.slice(0,8)));await b.close()})();
