// PERF-4 stream tour: does the far city (WB super cells, STR) stay bounded and do frees really release GPU buffers?
// Enters roam (CITY=fra|ath, real rAF + real drawing, DPR 0.35), then warps the car through a grid over the super-cell extent (corners first, then back
// to the start), waiting WAIT s per stop. Samples glMB (exact live WebGL buffer bytes, bufferData/deleteBuffer hook), renderer.info geometries,
// __str stats (built cells, their MB, builds b, frees f) and the all-cells total (what the GPU would hold if the whole map stayed built).
// usage: CITY=fra WAIT=8 node tools/eff/strtour.js <url local_dbg.html> [out.json]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2],OUT=process.argv[3],CITY=process.env.CITY||'fra',WAIT=+(process.env.WAIT||8);
const HOOK=`(()=>{const B=new WeakMap();const G={buf:0,n:0,del:0};window.__GLM=G;for(const C of [window.WebGL2RenderingContext,window.WebGLRenderingContext]){if(!C)continue;const P=C.prototype;
 const bd=P.bufferData;P.bufferData=function(t,d,u){const b=this.getParameter(t===this.ELEMENT_ARRAY_BUFFER?this.ELEMENT_ARRAY_BUFFER_BINDING:this.ARRAY_BUFFER_BINDING);const n=typeof d==='number'?d:(d&&d.byteLength)||0;if(b){if(!B.has(b))G.n++;G.buf+=n-(B.get(b)||0);B.set(b,n)}return bd.apply(this,arguments)};
 const db=P.deleteBuffer;P.deleteBuffer=function(b){if(b&&B.has(b)){G.buf-=B.get(b);B.delete(b);G.n--;G.del++}return db.apply(this,arguments)}}})();`;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info','--js-flags=--expose-gc']});
const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();await p.addInitScript("Object.defineProperty(window,'devicePixelRatio',{get:()=>0.35,configurable:true})");p.setDefaultTimeout(1800000);await p.addInitScript(HOOK);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
const R={city:CITY,s:[]};
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},CITY);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:200});
const info=await p.evaluate(()=>__oc.ev(`(()=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,tot=0;for(const S of WBC.sup){x0=Math.min(x0,S.x0);x1=Math.max(x1,S.x1);z0=Math.min(z0,S.z0);z1=Math.max(z1,S.z1);tot+=S.nt*54}return{n:WBC.sup.length,x0,x1,z0,z1,allMB:+(tot/1048576).toFixed(1),R:STR_R(),load:TUNE.strLoad,unload:TUNE.strUnload,start:[Math.round(RO.x),Math.round(RO.z)],q:SET.q}})()`));
console.log('INFO',JSON.stringify(info));R.info=info;
const samp=async lbl=>{await p.evaluate(()=>{try{gc()}catch(e){}});const s=await p.evaluate(()=>__oc.ev(`({glMB:+(__GLM.buf/1048576).toFixed(1),bufs:__GLM.n,del:__GLM.del,geoms:renderer.info.memory.geometries,heap:+(performance.memory.usedJSHeapSize/1048576).toFixed(1),...__str.sup(),b:__str.st.b,f:__str.st.f,relMB:+__str.st.relMB.toFixed(1),lzB:__str.st.lzB,lzF:__str.st.lzF,cars:HUB.cars&&HUB.cars.length,hl:FL.hl&&FL.hl.count,hlId:FL.hl&&FL.hl.id,x:Math.round(RO.x),z:Math.round(RO.z)})`));s.own=await p.evaluate(()=>{const own={},seen=new Set();let n=0;const key=o=>{let a=o,path=[];while(a&&a.parent&&path.length<12){const u=a.userData||{};path.push(a.name||Object.keys(u).slice(0,2).join('+')||a.type);a=a.parent}path.reverse();return path.slice(0,3).join('/')+'|'+o.type};
 __dbg.scene.traverse(o=>{const g=o.geometry;if(!g||seen.has(g))return;seen.add(g);n++;const k=key(o);own[k]=(own[k]||0)+1});own['#scene']=n;return own});
 s.lbl=lbl;R.s.push(s);const{own,...o}=s;console.log(JSON.stringify(o))};
const odiff=(a,b)=>Object.keys({...a.own,...b.own}).map(k=>[k,(b.own[k]||0)-(a.own[k]||0)]).filter(x=>x[1]).sort((x,y)=>Math.abs(y[1])-Math.abs(x[1])).slice(0,20);
await p.waitForTimeout(WAIT*1000);await samp('start');
// TRACK=1: tag every BufferGeometry that gets attributes from now on with its creation stack; at the end list the ones still alive, not disposed and not in the scene
if(process.env.TRACK)await p.evaluate(()=>{const T=__dbg.THREE,P=T.BufferGeometry.prototype,sa=P.setAttribute,di=P.dispose,L=window.__GT=new Set();
 P.setAttribute=function(){if(!this.__st){this.__st=(new Error().stack||'').split('\n').slice(2,7).map(l=>l.trim().replace(/^at /,'').replace(/\(?http[^)]*\/([^/]+:\d+:\d+)\)?/,'@$1')).join(' < ');L.add(this)}return sa.apply(this,arguments)};
 const ob=T.Object3D.prototype.onBeforeRender;T.Object3D.prototype.onBeforeRender=function(r,sc,c,g){if(g)g.__drawn=1;return ob.apply(this,arguments)};
 P.dispose=function(){this.__disp=1;L.delete(this);return di.apply(this,arguments)}});
await p.waitForFunction(()=>__oc.ev('WBC.sup&&WBC.sup.length>0'),null,{polling:500});Object.assign(info,await p.evaluate(()=>__oc.ev(`(()=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const S of WBC.sup){x0=Math.min(x0,S.x0);x1=Math.max(x1,S.x1);z0=Math.min(z0,S.z0);z1=Math.max(z1,S.z1)}return{x0,x1,z0,z1}})()`)));console.log('BOX',JSON.stringify(info));
const {x0,x1,z0,z1,start}=info,pts=[];for(const [fx,fz] of [[.1,.1],[.9,.1],[.9,.9],[.1,.9],[.5,.5],[.1,.1],[.9,.9]])pts.push([x0+(x1-x0)*fx,z0+(z1-z0)*fz]);pts.push(start);
for(const [x,z] of pts){await p.evaluate(([x,z])=>__oc.ev(`roamWarp(${x},${z},0,true)`),[x,z]);await p.waitForTimeout(WAIT*1000);await samp('at '+Math.round(x)+','+Math.round(z))}
await p.waitForTimeout(WAIT*2000);await samp('start again');
R.bound=await p.evaluate(()=>__oc.ev(`(()=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,tot=0;for(const S of WBC.sup){x0=Math.min(x0,S.x0);x1=Math.max(x1,S.x1);z0=Math.min(z0,S.z0);z1=Math.max(z1,S.z1);tot+=S.nt*54}
 const UL=STR_R()+TUNE.strUnload;let mx=0,at=null;for(let x=x0;x<=x1;x+=250)for(let z=z0;z<=z1;z+=250){let m=0;for(const S of WBC.sup)if(STR_d(S,x,z)<=UL)m+=S.nt*54;if(m>mx){mx=m;at=[x,z]}}
 return{n:WBC.sup.length,box:[x0,x1,z0,z1].map(Math.round),allMB:+(tot/1048576).toFixed(1),maxWindowMB:+(mx/1048576).toFixed(1),at}})()`));console.log('BOUND',JSON.stringify(R.bound));
if(R.s.length>6){R.odiff=odiff(R.s[1],R.s[6]);console.log('OWNER DIFF (same spot, 1st vs 2nd visit):');for(const x of R.odiff)console.log(' ',x.join(' '))}
if(process.env.TRACK){R.track=await p.evaluate(()=>{const inS=new Set();__dbg.scene.traverse(o=>{if(o.geometry)inS.add(o.geometry)});const by={};for(const g of __GT){if(inS.has(g)||!g.__drawn)continue;let b=0;for(const a of Object.values(g.attributes)){const d=a.isInterleavedBufferAttribute?a.data:a;b+=d.array?d.array.byteLength:d.count*(a.itemSize||1)*4}const e=by[g.__st]||(by[g.__st]={n:0,mb:0});e.n++;e.mb+=b/1048576}
 return Object.entries(by).map(([k,v])=>[v.n,+v.mb.toFixed(2),k]).sort((a,b)=>b[1]-a[1]).slice(0,15)});console.log('OFF-SCENE, NOT DISPOSED (n, MB, stack):');for(const x of R.track)console.log(' ',x[0],x[1],x[2].slice(0,400))}
R.errs=errs;if(OUT)fs.writeFileSync(OUT,JSON.stringify(R,null,1));console.log('errs',errs.slice(0,4));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
