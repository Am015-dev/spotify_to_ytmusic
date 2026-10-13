// tSink.js — sink-1 probe: start Frankfurt roam, GAS 6 s, brake, F (exit), print per-wheel tyre gap (wheel bottom − ground) in car and on foot. env GO=<checklist id> spawns via __chk.go first.
// tFoot.js — v89a on-foot gate, real input only (CDP touch on #tG/#tB/#ofZone or real keys). No warps, no enterRoam(), no hidden clicks.
// drive (GAS + ◀ ▶ along the GPS route) → stop → 🚪 EXIT → walk ≥ 30 m with the floating stick → ENTER a parked traffic car (or your own car if
// none) → drive 100 m. Checks: 0 console errors, state machine, minifig 1.75–1.85 m vs peds, stuck %, camera-in-building %, tyre gap after re-entry,
// draws car vs foot vs after re-entry, ≤ 5 visible touch controls on foot, no HUD over controls, text ≥ 12 px.
// usage: node tools/tFoot.js <url> [outdir]   env MODE=phone|desk|iframe|all (default all) · CITIES=fra,ath · FAST=1
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const URL0=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',OUT=process.argv[3]||'qa_foot';fs.mkdirSync(OUT,{recursive:true});
const FASTM=process.env.FAST==='1',URL=FASTM&&!/fast=1/.test(URL0)?URL0+(URL0.includes('?')?'&':'?')+'fast=1':URL0;
const MODES=(process.env.MODE||'all')==='all'?['phone','desk','iframe']:process.env.MODE.split(','),CITIES=(process.env.CITIES||'fra,ath').split(',');
let fails=0;const ok=(c,m,i)=>{console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''));if(!c)fails++};
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}
  if(window.__auto&&window.__fast&&window.__mho&&__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on)){window.__auto=false;break}}return t};
 setInterval(()=>{if(window.__dbg&&!window.__fastR&&!window.__shooting){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
const LAYOUT=()=>{const vis=e=>{const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05)return false;for(let a=e;a;a=a.parentElement){if(a.hidden)return false;const c=getComputedStyle(a);if(c.display==='none'||+c.opacity<.05)return false}const r=e.getBoundingClientRect();return r.width>4&&r.height>4};
 const ctl=[...document.querySelectorAll('#touch .tbtn,#ofZone')].filter(vis).map(e=>({id:e.id,r:e.getBoundingClientRect(),t:e.textContent.trim().slice(0,12)}));const ov=[],tiny=[];const VA=innerWidth*innerHeight;
 for(const e of document.body.querySelectorAll('*')){if(e.closest('#touch')||/CANVAS|SCRIPT|STYLE/.test(e.tagName))continue;const cs=getComputedStyle(e);const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!own&&cs.position!=='fixed'&&cs.position!=='absolute')continue;if(!vis(e))continue;const r=e.getBoundingClientRect();if(r.width*r.height>VA*.3)continue;
  if(own&&parseFloat(cs.fontSize)<11.5)tiny.push((e.id||e.className||e.tagName)+':'+cs.fontSize+':'+e.textContent.trim().slice(0,24));if(!own&&cs.backgroundColor==='rgba(0, 0, 0, 0)'&&cs.backgroundImage==='none'&&!e.querySelector('canvas,img,svg'))continue;
  for(const c of ctl){if(c.id==='ofZone')continue;const w=Math.min(r.right,c.r.right)-Math.max(r.left,c.r.left),h=Math.min(r.bottom,c.r.bottom)-Math.max(r.top,c.r.top);if(w>6&&h>6)ov.push(c.id+'×'+(e.id?'#'+e.id:String(e.className).split(' ')[0]||e.tagName))}}
 for(const e of document.querySelectorAll('#touch .tbtn'))if(vis(e)&&parseFloat(getComputedStyle(e).fontSize)<11.5)tiny.push(e.id+':'+getComputedStyle(e).fontSize);
 return{ctl:ctl.map(c=>c.id+(c.t?':'+c.t:'')),n:ctl.filter(c=>c.id!=='ofZone').length+(ctl.some(c=>c.id==='ofZone')?1:0),ov:[...new Set(ov)],tiny:[...new Set(tiny)].slice(0,10)}};
// in-page probes (debug build: __oc.ev runs in the module scope)
const PROBE=()=>__oc.ev(`(()=>{const F=__mho.foot,T=THREE,B=new T.Box3(),m4=new T.Matrix4(),v=new T.Vector3();let fig=null;if(OF.fig&&OF.fig.g.visible){OF.fig.g.updateMatrixWorld(true);B.setFromObject(OF.fig.g);fig=+(B.max.y-B.min.y).toFixed(3)}
 const peds=[];for(let i=0;i<(HUB.peds||[]).length;i++){const p=HUB.peds[i];if(Math.hypot((p._x??1e9)-RO.x,(p._z??1e9)-RO.z)>60)continue;const U=new T.Box3();for(const k in (HUB.pP||{})){const im=HUB.pP[k];if(!im.geometry.boundingBox)im.geometry.computeBoundingBox();im.getMatrixAt(i,m4);const b=im.geometry.boundingBox.clone().applyMatrix4(m4);if(!b.isEmpty()&&b.max.y-b.min.y<20)U.union(b)}if(!U.isEmpty())peds.push(+(U.max.y-(p.y||0)-(p.jy||0)).toFixed(2));if(peds.length>=6)break}
 // tyre gap: lowest visible point of the player's body vs the ground under it (instanced bodies: geometry box × instance × world)
 let low=1e9;if(pl&&RO.foot==='car'){pl.mesh.updateMatrixWorld(true);const ud=pl.mesh.userData;ud.m.traverseVisible(o=>{if(!o.isMesh||!o.geometry||(o.material&&(o.material.transparent||o.material.blending===T.AdditiveBlending)))return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
   if(o.isInstancedMesh){o.getMatrixAt(0,m4);m4.premultiply(o.matrixWorld)}else m4.copy(o.matrixWorld);const p=o.geometry.attributes.position;for(let i=0;i<p.count;i+=3){v.fromBufferAttribute(p,i).applyMatrix4(m4);if(Math.hypot(v.x-RO.x,v.z-RO.z)<3.2&&v.y<RO.y+.7){const c=v.y-groundAt(v.x,v.z,v.y+1);if(c<low)low=c}}})}
 const gap=low<1e8?+low.toFixed(3):null;
 let pc=null;try{let n=0;for(const c of HUB.cars)if(c.pk&&!(c.dead>0)&&Math.hypot(c.x-RO.x,c.z-RO.z)<150)n++;pc=n}catch(e){}
 return{F,fig,peds,gap,parkedNear:pc,cy:+OF.cy.toFixed(3),RO:{x:RO.x,z:RO.z,y:RO.y,h:RO.h,v:RO.v},calls:__dbg.renderer.info.render.calls,tris:__dbg.renderer.info.render.triangles}})()`);
async function run(b,mode,city){const phone=mode!=='desk';const vp=phone?{width:852,height:393}:{width:1440,height:900};const tag=mode+'_'+city;
 const ctx=await b.newContext(phone?{viewport:vp,deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:vp});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];const onP=pg=>{pg.on('pageerror',e=>errs.push(e.message.slice(0,200)));pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))})};onP(p);
 await ctx.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);
 const url=mode==='iframe'?URL.replace(/local_dbg\.html.*/,'iframe852.html'):URL;
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(([c])=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(c==='ath'){localStorage.setItem('mho_city@1',c);localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},[city]);
 await p.goto(url);let G=p;if(mode==='iframe'){await p.waitForTimeout(1500);G=p.frames().find(f=>/local_dbg/.test(f.url()));}
 await G.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 const off=mode==='iframe'?[0,0]:[0,0];
 const tick=n=>G.evaluate(n=>__tick(n),n);
 const shot=async name=>{await G.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1);const I=__dbg.renderer.info;I.autoReset=false;I.reset();__tick(1)});const f=path.join(OUT,`${tag}_${name}.jpg`);await p.screenshot({path:f,type:'jpeg',quality:70});
  const pr=await G.evaluate(PROBE);await G.evaluate(()=>{__dbg.renderer.info.autoReset=true;window.__shooting=0;if(!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}});return pr};
 const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
 const center=sel=>G.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width<4||cs.display==='none'||cs.visibility==='hidden')return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
 const down=async(name,xy)=>{if(!xy)return false;if(F[name])await up(name);let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[name]={x:xy[0],y:xy[1],id};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()});return true};
 const move=async(name,xy)=>{if(!F[name])return;F[name].x=xy[0];F[name].y=xy[1];await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:pts()})};
 const up=async name=>{if(!F[name])return;delete F[name];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length){await p.waitForTimeout(60);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})}};
 const tap=async sel=>{const xy=await center(sel);if(!xy)return false;if(phone){await down('tap',xy);await tick(4);await up('tap')}else await p.mouse.click(xy[0],xy[1]);await tick(4);return true};
 const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','.m1go','#resBtn','#tutSkip'];const through=async()=>{for(const s of CONT)if(await tap(s))return s;return null};
 await tap('#hcStory');await tick(10);await tap('#slotList .go');
 for(let i=0;i<150;i++){if(await G.evaluate(()=>window.__mho&&__mho.state==='roam'))break;await p.waitForTimeout(1000)}
 await G.evaluate(()=>{window.__auto=false});for(let i=0;i<30;i++){await tick(30);if(!(await through()))break}
 const GAP=()=>G.evaluate(()=>__oc.ev(`(()=>{const ud=pl.mesh.userData,W=[];pl.mesh.updateMatrixWorld(true);ud.m.traverse(w=>{if(w.isMesh&&w.userData.r){let v=true,q=w;while(q&&q!==ud.m){if(!q.visible)v=false;q=q.parent}if(v)W.push(w)}});const A=new THREE.Vector3(),S=new THREE.Vector3();
  return {n:W.length,rx:+pl.mesh.rotation.x.toFixed(3),rz:+pl.mesh.rotation.z.toFixed(3),hy:+ud.m.position.y.toFixed(3),g:W.map(w=>{w.getWorldPosition(A);w.getWorldScale(S);return +(A.y-w.userData.r*S.y-groundAt(A.x,A.z,A.y+1)).toFixed(3)}),foot:RO.foot}})()`));
 // drive 6 s on GAS, brake hard, exit
 const kb=async(k,n)=>{await p.keyboard.down(k);await tick(n);await p.keyboard.up(k)};
 if(process.env.GO){const r=await G.evaluate(id=>__chk.go(id),process.env.GO);console.log('GO',r);await tick(120)}
 else{await kb('ArrowUp',360);await p.keyboard.down('ArrowDown');for(let i=0;i<40;i++){await tick(6);if(Math.abs(await G.evaluate(()=>__mho.RO.v))<.4)break}await p.keyboard.up('ArrowDown');await tick(60)}
 console.log('car',JSON.stringify(await GAP()));
 await kb('KeyF',2);await tick(90);console.log('foot',JSON.stringify(await GAP()));
 await G.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}});await G.evaluate(()=>__tick(2));await p.screenshot({path:OUT+'/foot.jpg'});
 console.log('errs',errs.length,errs.slice(0,3));await b.close();process.exit(0)}
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});await run(b,'desk','fra')})();
