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
 const KD={};const key=async(k,on)=>{if(!!KD[k]===on)return;KD[k]=on;on?await p.keyboard.down(k):await p.keyboard.up(k)};
 const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','.m1go','#resBtn','#tutSkip'];const through=async()=>{for(const s of CONT)if(await tap(s))return s;return null};
 await tap('#hcStory');await tick(10);await tap('#slotList .go');
 for(let i=0;i<150;i++){try{if(await G.evaluate(()=>window.__mho&&__mho.state==='roam'))break}catch(e){if(mode==='iframe'){G=p.frames().find(f=>/local_dbg/.test(f.url()))||G}}await p.waitForTimeout(2000)}
 await G.evaluate(()=>{window.__auto=false});for(let i=0;i<30;i++){await tick(30);if(!(await through()))break}
 const st=()=>G.evaluate(()=>{const R=__mho.RO;return{f:__mho.foot,x:R.x,z:R.z,y:R.y,h:R.h,v:R.v,busy:!!(R.card||R.mapOpen||R.story||R.frozen),cy:__oc.ev('OF.cy')}});
 const res={mode,city,ok:true,steps:[]};const log=(k,o)=>{res.steps.push([k,o]);console.log(tag,k,JSON.stringify(o).slice(0,300))};
 // ---- 1. drive ~8 s following the route ahead, then brake to a stop
 const route=async(dist)=>G.evaluate(([d])=>{const R=__mho.RO,x=R.x+Math.sin(R.h)*d,z=R.z+Math.cos(R.h)*d;try{const q=__mho.rsnap(x,z,400);const P=__mho.qv.path(R.x,R.z,q[0],q[1]).P;return P&&P.length>1?P:null}catch(e){return null}},[dist]);
 const steerTo=(s,P)=>{let bi=0,bd=1e9;for(let k=0;k<P.length;k++){const d=Math.hypot(P[k][0]-s.x,P[k][1]-s.z);if(d<bd){bd=d;bi=k}}let k=bi,acc=0;while(k<P.length-1&&acc<12+Math.abs(s.v)*.4){acc+=Math.hypot(P[k+1][0]-P[k][0],P[k+1][1]-P[k][1]);k++}
  let a=Math.atan2(P[k][0]-s.x,P[k][1]-s.z)-s.h;a=Math.atan2(Math.sin(a),Math.cos(a));return a>.13?-1:a<-.13?1:0};
 const ctl={g:false,b:false,s:0};const apply=async c=>{if(phone){if(c.g!==ctl.g)c.g?await down('gas',await center('#tG')):await up('gas');if(c.b!==ctl.b)c.b?await down('brk',await center('#tB')):await up('brk');
   if(c.s!==ctl.s){if(!c.s)await up('st');else{const xy=await center(c.s<0?'#tL':'#tR');F.st?await move('st',xy):await down('st',xy)}}}
  else{await key('ArrowUp',c.g);await key('ArrowDown',c.b);await key('ArrowLeft',c.s<0);await key('ArrowRight',c.s>0)}Object.assign(ctl,c)};
 const drive=async(meters,maxF)=>{let s=await st();const x0=s.x,z0=s.z;let P=await route(260),f=0,stk=0;while(f<maxF){s=await st();if(s.busy){await apply({g:false,b:false,s:0});await through();await tick(12);f+=12;continue}
   if(Math.hypot(s.x-x0,s.z-z0)>=meters)break;if(!P||f%240===0)P=await route(260)||P;let sv=P?steerTo(s,P):0;if(s.v<0)sv=-sv;if(Math.abs(s.v)<1)stk+=6;else stk=0;
   const rev=stk>90&&stk<160;await apply({g:!rev,b:rev,s:rev?-sv:sv});await tick(6);f+=6}const d=Math.hypot(s.x-x0,s.z-z0);
  await apply({g:false,b:true,s:0});for(let i=0;i<40;i++){await tick(6);s=await st();if(Math.abs(s.v)<.4)break}await apply({g:false,b:false,s:0});await tick(45);return d};
 const d1=await drive(60,900);let s=await st();log('drive1',{m:+d1.toFixed(0),v:s.v,btn:s.f.btn,canExit:s.f.canExit});
 const pr0=await shot('1_drive_exitbtn');if(phone){const g=await G.evaluate(()=>__mho.foot.doorGap);log('exitGap',g);ok(g&&g.n>=8&&g.g>=8,tag+' EXIT ≥8 px from BOOST and GAS',g)}let lay=await G.evaluate(LAYOUT);log('layout_car',lay);
 ok(s.f.btn==='exit',tag+' EXIT offered when stopped',{btn:s.f.btn,idle:s.f.idle,why:await G.evaluate(()=>__oc.ev(`JSON.stringify({st:state,on:RO.on,fr:RO.frozen,wk:RO.wk,air:pl.air,ch:!!RO.ch,sp:!!RO.sp,card:!!RO.card,map:!!RO.mapOpen,story:!!RO.story,cs:M1.cs,boat:pl.boatMode,vm:pl.vmode,park:TOUCH.park,v:RO.v})`))});
 // ---- 2. EXIT (tap the door button / F)
 if(phone)await tap('#tB');else{await key('KeyF',true);await key('KeyF',false)}await tick(40);s=await st();
 ok(s.f.state==='walk',tag+' EXIT → on foot',{state:s.f.state});const car0={x:s.f.car&&s.f.car.x,z:s.f.car&&s.f.car.z};
 const pr1=await shot('2_standing');log('scale',{fig:pr1.fig,peds:pr1.peds,figH:pr1.F.figH,calls:pr1.calls,callsCar:pr0.calls});
 ok(pr1.fig>=1.75&&pr1.fig<=1.85,tag+' minifig 1.75–1.85 m',pr1.fig);const pm=pr1.peds.length?pr1.peds.slice().sort()[pr1.peds.length>>1]:null;ok(!pm||(pm>=1.6&&pm<=2.2),tag+' peds near 1.8–2.0 m',pr1.peds);
 log('zone',await G.evaluate(()=>{const z=document.querySelector('#ofZone'),r=z.getBoundingClientRect(),q=document.querySelector('#ofRing').getBoundingClientRect(),x=r.left+Math.min(130,r.width*.45),y=r.bottom-Math.min(90,r.height*.3),e=document.elementFromPoint(x,y);return{z:[r.left,r.top,r.width,r.height],ring:[q.left,q.top,q.width],hit:e&&(e.id||e.className||e.tagName),hh:e&&e.outerHTML.slice(0,160),par:e&&[...(function*(a){while(a=a.parentElement)yield a.id||a.tagName})(e)].join('<'),t:document.querySelector('#touch').getBoundingClientRect().height}}));
 lay=await G.evaluate(LAYOUT);log('layout_foot',lay);ok(lay.n<=5,tag+' ≤5 controls on foot',lay.ctl);ok(!lay.ov.length,tag+' no HUD over controls',lay.ov);ok(!lay.tiny.length,tag+' text ≥12 px',lay.tiny);
 // ---- 3. walk ≥ 30 m with the stick (phone) / keys (desk), then to the nearest parked car
 const stickC=async()=>{const r=await G.evaluate(()=>{const e=document.querySelector('#ofZone');const b=e.getBoundingClientRect();return[b.left+Math.min(130,b.width*.45),b.bottom-Math.min(90,b.height*.3)]});return r};
 let sc=null;const push=async(ax,ay)=>{if(phone){if(!sc){sc=await stickC();await down('stick',sc);await tick(2)}await move('stick',[sc[0]+ax*70,sc[1]-ay*70])}
   else{await key('KeyW',ay>.38);await key('KeyS',ay<-.38);await key('KeyA',ax<-.38);await key('KeyD',ax>.38);await key('Shift',true)}};
 const release=async()=>{if(phone){await up('stick');sc=null}else for(const k of['KeyW','KeyS','KeyA','KeyD','Shift'])await key(k,false)};
 const wpath=(x0,z0,x1,z1)=>G.evaluate(([a,b,c,d])=>{try{const q=__mho.rsnap(c,d,200);const P=__mho.qv.path(a,b,q[0],q[1]).P;return P&&P.length>1?P:null}catch(e){return null}},[x0,z0,x1,z1]);
 // a person walks along the street towards the target, straight at it once close; side-steps after 0.6 s of no progress
 const walkTo=async(tx,tz,stopD,maxF,retarget)=>{let sd=-1,los0=null,f=0,lastP=null,stF=0,side=0,trav=0;s=await st();let P=await wpath(s.f.x,s.f.z,tx,tz);while(f<maxF){s=await st();const d=Math.hypot(tx-s.f.x,tz-s.f.z);if(d<stopD||(retarget&&s.f.btn==='enter'))break;if(retarget&&f%60===0){const t=await retarget();if(t){tx=t.x;tz=t.z}}
   if(lastP){const m=Math.hypot(s.f.x-lastP[0],s.f.z-lastP[1]);trav+=m;if(m<.15)stF+=6;else stF=Math.max(0,stF-3)}lastP=[s.f.x,s.f.z];if(stF>18&&!side){side=f;stF=0;sd=-sd}
   let gx=tx,gz=tz;const los=f%30===0||los0===null?(los0=await G.evaluate(([x0,z0,x1,z1,y])=>{const L=Math.hypot(x1-x0,z1-z0);for(let q=1;q<L;q+=1.5){const x=x0+(x1-x0)*q/L,z=z0+(z1-z0)*q/L;if(__mho.roamHitAt(x,z,.6,y+1))return false}return true},[s.f.x,s.f.z,tx,tz,s.f.y])):los0;if(P&&d>8&&!los){let bi=0,bd=1e9;for(let k=0;k<P.length;k++){const q=Math.hypot(P[k][0]-s.f.x,P[k][1]-s.f.z);if(q<bd){bd=q;bi=k}}let k=bi,acc=0;while(k<P.length-1&&acc<6){acc+=Math.hypot(P[k+1][0]-P[k][0],P[k+1][1]-P[k][1]);k++}gx=P[k][0];gz=P[k][1];if(k>=P.length-1){gx=tx;gz=tz}}
   let a=Math.atan2(gx-s.f.x,gz-s.f.z)-s.cy;a=Math.atan2(Math.sin(a),Math.cos(a));if(side&&f-side<90)a+=1.5*sd;else side=0;await push(-Math.sin(a),Math.cos(a));await tick(6);f+=6}await release();await tick(10);return{trav,f}};
 // target: the nearest parked traffic car (else your own); first walk ≥ 22 m along the street away from it so the walk is ≥ 30 m in total
 const findT=()=>G.evaluate(()=>__oc.ev(`(()=>{let b=null,bd=160;for(const c of HUB.cars){if(!c.pk||c.dead>0)continue;const d=Math.hypot(c.x-OF.x,c.z-OF.z);if(d<bd){bd=d;b={x:c.x,z:c.z,k:'park',d}}}return b||(OF.car&&{x:OF.car.x,z:OF.car.z,k:'cur',d:Math.hypot(OF.car.x-OF.x,OF.car.z-OF.z)})})()`));
 s=await st();let t0=await findT();const a0=t0.d<30?Math.atan2(s.f.x-t0.x,s.f.z-t0.z):s.cy;let ax=0,az=0;
 // a person picks a clear direction (no wall, not through the parked car) roughly away from the target
 for(const da of[0,.5,-.5,1,-1,1.5,-1.5,2.2,-2.2]){const a=a0+da;ax=s.f.x+Math.sin(a)*40;az=s.f.z+Math.cos(a)*40;const clear=await G.evaluate(([x0,z0,x1,z1,y])=>{const c=__mho.foot.car;for(let q=1;q<40;q+=1){const x=x0+(x1-x0)*q/40,z=z0+(z1-z0)*q/40;if(__mho.roamHitAt(x,z,.6,y+1))return false;if(c&&Math.hypot(x-c.x,z-c.z)<3)return false}return true},[s.f.x,s.f.z,ax,az,s.f.y]);if(clear)break}
 const pr2a=await (async()=>{let a=Math.atan2(ax-s.f.x,az-s.f.z)-s.cy;await push(-Math.sin(a),Math.cos(a));await tick(70);return shot('3_walking')})();log('walkshot',{spd:pr2a.F.spd,calls:pr2a.calls});
 const w1=await walkTo(ax,az,2.5,1500);s=await st();log('walk1',{trav:+w1.trav.toFixed(1),n:s.f.n});
 const tgt=await findT();log('target',tgt);
 const w2=await walkTo(tgt.x,tgt.z,2.6,2400,async()=>{const t=await findT();if(t&&t.k===tgt.k){tgt.x=t.x;tgt.z=t.z}return t&&t.k===tgt.k?t:null});for(let i=0;i<20;i++){s=await st();if(s.f.btn==='enter')break;await push(...(()=>{let a=Math.atan2(tgt.x-s.f.x,tgt.z-s.f.z)-s.cy;return[-Math.sin(a)*.5,Math.cos(a)*.5]})());await tick(6)}await release();await tick(6);s=await st();
 ok(w1.trav+w2.trav>=30,tag+' walked ≥30 m with '+(phone?'the stick':'keys'),+(w1.trav+w2.trav).toFixed(1));const pr3=await shot('4_enter_prompt');log('doorGap',s.f.doorGap);if(phone)ok(s.f.doorGap&&s.f.doorGap.n>=8&&s.f.doorGap.g>=8,tag+' ENTER ≥8 px from JUMP and RUN',s.f.doorGap);
 if(phone){// low side view of the minifig at the car (camera only, for the shot; the game state is untouched)
  await G.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1);__oc.ev(`(()=>{const c=OF.near||{x:OF.car.x,z:OF.car.z,h:OF.car.h},dx=OF.x-c.x,dz=OF.z-c.z,l=Math.hypot(dx,dz)||1,mx=(OF.x+c.x)/2,mz=(OF.z+c.z)/2,px=-dz/l,pz=dx/l;camera.position.set(mx+px*7,OF.y+1.1,mz+pz*7);camera.lookAt(mx,OF.y+.8,mz);__dbg.composer.render()})()`)});
  await p.screenshot({path:path.join(OUT,`${tag}_4b_side.jpg`),type:'jpeg',quality:70});await G.evaluate(()=>{window.__shooting=0;if(!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}})}log('near',{stkWhat:await G.evaluate(()=>__oc.ev(`(OF.stk||[]).slice(0,4).map(([x,z])=>{const o=[];for(const p of HUB.props||[])if(p.alive&&Math.hypot(p.x-x,p.z-z)<2.5)o.push(p.t+':'+(HUB.ptypes[p.t]||{}).r);for(const c of HUB.cars)if(!(c.dead>0)&&Math.hypot(c.x-x,c.z-z)<4)o.push('car'+(c.pk?'P':'')+':'+(c.cv||0).toFixed(1));return o.join(',')})`)),stk:s.f.stk,near:s.f.near,btn:s.f.btn,trav:+w2.trav.toFixed(1),n:s.f.n});ok(s.f.btn==='enter'&&!!s.f.near,tag+' ENTER offered at the car',{btn:s.f.btn,near:s.f.near});
 const nk=s.f.near&&s.f.near.k;if(phone)await tap('#tB');else{await key('KeyE',true);await key('KeyE',false)}await tick(50);s=await st();
 ok(s.f.state==='car',tag+' ENTER → driving ('+nk+')',{state:s.f.state,own:s.f.own,taken:s.f.taken});
 const pr4=await shot('5_reentered');log('reenter',{gap:pr4.gap,calls:pr4.calls,callsCar:pr0.calls,callsFoot:pr1.calls,own:s.f.own,parked:s.f.parked});
 // ---- 4. drive 100 m in it
 const d2=await drive(100,2700);s=await st();const pr5=await shot('6_driving_again');log('drive2',{m:+d2.toFixed(0),gap:pr5.gap,calls:pr5.calls});ok(d2>=100,tag+' drove 100 m after ENTER',+d2.toFixed(0));
 ok(pr5.gap!=null&&Math.abs(pr5.gap)<=.05,tag+' tyre gap ≤0.05 m after re-entry',pr5.gap);
 const stuckPct=+(100*s.f.n.stuckF/Math.max(1,s.f.n.walkF)).toFixed(1),camPct=+(100*s.f.n.camIn/Math.max(1,s.f.n.walkF)).toFixed(1);ok(stuckPct<=3,tag+' stuck ≤3 % on foot',stuckPct);ok(camPct<=2,tag+' camera in building ≤2 %',camPct);
 ok(!errs.length,tag+' 0 console errors',errs.slice(0,5));
 res.metrics={walked:w1.trav+w2.trav,stuckPct,camPct,fig:pr1.fig,peds:pr1.peds,gap:pr5.gap,calls:{car:pr0.calls,foot:pr1.calls,walk:pr2a.calls,reent:pr4.calls,drive2:pr5.calls},target:nk,errs};
 await ctx.close();return res}
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const all=[];
 for(const m of MODES)for(const c of CITIES){try{all.push(await run(b,m,c))}catch(e){ok(false,m+'_'+c+' crashed',e.message.slice(0,300))}}
 fs.writeFileSync(path.join(OUT,'tFoot.json'),JSON.stringify(all,null,1));await b.close();console.log(fails?'TFOOT_FAIL '+fails:'TFOOT_PASS');process.exit(fails?1:0)})();
