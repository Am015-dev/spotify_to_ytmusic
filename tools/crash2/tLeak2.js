// crash-2: which phase leaks GPU geometries/textures and who created them. node tools/crash2/tLeak2.js <page url> [phases=roam,race,td,warp,smash,garage]
// iPhone emulation. Hooks BufferGeometry/Texture creation (stack) + dispose; after each phase prints renderer.info deltas and the top creation sites of
// geometries/textures that are alive on the GPU but no longer reachable from the scene (= leaked).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,PH]=process.argv.slice(2);const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
(async()=>{const b=await chromium.launch({args:['--js-flags=--expose-gc','--enable-precise-memory-info','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:UA});const p=await ctx.newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:240000});const ev=s=>p.evaluate(s=>__xc.ev(s),s);
 await ev(`{const st=()=>(new Error().stack||'').split('\\n').slice(3,7).map(s=>s.trim().replace(/^at /,'').replace(/\\(?https?:[^)]*\\/([^/:]*:\\d+):\\d+\\)?/,'$1')).join(' < ');window.__LK={g:new Set,t:new Set,p:0};
  const P=THREE.BufferGeometry.prototype,sa=P.setAttribute,di=P.dispose;P.setAttribute=function(){if(!this.__lk){this.__lk=st();this.__p=__LK.p;__LK.g.add(this)}return sa.apply(this,arguments)};P.dispose=function(){__LK.g.delete(this);return di.apply(this,arguments)};
  const T=THREE.Texture.prototype,d=Object.getOwnPropertyDescriptor(T,'needsUpdate'),td=T.dispose;Object.defineProperty(T,'needsUpdate',{set(v){if(v&&!this.__lk){this.__lk=st();this.__p=__LK.p;__LK.t.add(this)}d.set.call(this,v)},configurable:true});T.dispose=function(){__LK.t.delete(this);return td.apply(this,arguments)};
  window.__ph=n=>{try{gc();gc()}catch(e){}__tq.draw();const lg=new Set,lt=new Set;const addM=M=>{for(const x of Array.isArray(M)?M:[M]){if(!x)continue;for(const k in x){const v=x[k];if(v&&v.isTexture)lt.add(v)}if(x.uniforms)for(const k in x.uniforms){const v=x.uniforms[k]&&x.uniforms[k].value;if(v&&v.isTexture)lt.add(v)}}};
   const vis=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true},lv=new Set;scene.traverse(o=>{if(o.geometry){lg.add(o.geometry);if(vis(o))lv.add(o.geometry)}if(o.material)addM(o.material)});const top=(S,L)=>{const by={};let n=0;for(const g of S){if(L.has(g)||!(g._listeners&&g._listeners.dispose&&g._listeners.dispose.length))continue;n++;const k=String(g.__lk).slice(0,260);by[k]=(by[k]||0)+1}return{n,top:Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,6)}};
   const up=g=>g._listeners&&g._listeners.dispose&&g._listeners.dispose.length,nw=S=>{const by={};let n=0;const U=__LK.u=__LK.u||new Set;for(const g of S){if(!up(g)||U.has(g))continue;U.add(g);n++;const k=(lv.has(g)?'VIS ':lg.has(g)||lt.has(g)?'HID ':'OFF ')+String(g.__lk).slice(0,200);by[k]=(by[k]||0)+1}return{n,top:Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,5)}};const nG=nw(__LK.g),nT=nw(__LK.t);__LK.p++;const m=renderer.info.memory;return{phase:n,heap:Math.round(performance.memory.usedJSHeapSize/1048576),geo:m.geometries,tex:m.textures,offG:top(__LK.g,lg).n,offT:top(__LK.t,lt).n,inT:lt.size,newG:nG,newT:nT}};
  window.__drv=n=>{K.ArrowUp=true;for(let i=0;i<n;i++){K.ArrowLeft=((i/90|0)%3===0);roamStep(1/30)}K.ArrowUp=K.ArrowLeft=false}}`);
 const out=async n=>{const r=await ev(`__ph(${JSON.stringify(n)})`);console.log(JSON.stringify(r))};
 await ev(`__drv(1800)`);await out('roam60');
 const race=td=>`{if(window.TDR){TDR.on=${td};TDR.sel=${td};TDR.force=${td}}const mk=tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p));tkStart(mk,TK_C);const sp=RO.sp;sp.cd=0;const bot=tkBot(tkGeoOf(TK_C).pA,{lag:.15});for(let k=0;k<8;k++){for(let i=0;i<150;i++){bot(sp);roamStep(1/30)}__tq.draw()}try{$('#spRes').hidden=true}catch(e){}RO.fin=false;if(RO.sp===sp)try{sprintEnd()}catch(e){}if(window.TDR){TDR.on=TDR.sel=TDR.force=false}__drv(300)}`;
 for(const ph of (PH||'roam,race,race,td,warp,warp,smash,garage,roam').split(',')){
  if(ph==='roam')await ev(`__drv(1800)`);
  if(ph==='race')await ev(race(false));
  if(ph==='td')await ev(race(true));
  if(ph==='warp')await ev(`{const q=rfSnap(RO.x+(Math.random()-.5)*2400,RO.z+(Math.random()-.5)*2400,300);if(q)roamWarp(q[0],q[1],q[2]||0,true);RO.v=0;__drv(600)}`);
  if(ph==='smash')await ev(`{for(let k=0;k<6;k++){try{debris(V3(RO.x,RO.y+1,RO.z),V3(0,4,0),20,[new THREE.Color(0xff0000)],.8)}catch(e){}__drv(60)}__drv(300)}`);
  if(ph==='garage')await ev(`{try{gbOpen();gbClose(true)}catch(e){console.log('gb',e)}__drv(300)}`);
  await out(ph)}
 console.log('ERRS',JSON.stringify(errs.slice(0,4)));await b.close()})();
