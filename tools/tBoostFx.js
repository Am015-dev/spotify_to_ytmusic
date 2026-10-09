// tBoostFx.js — boost visuals check (fix21). Phone 852×393 touch, normal build (no ?fast=1: fast mode hides particles).
// RACE: taps RACE → circuit → START RACE, holds GAS, taps BOOST (#tN) with real touch, shots at +0.15/+0.5/+1.2/+2.6 s of boost
// (2.6 s = Brickbash) + a low side shot of the player car while boosting. ROAM: STORY → new game, holds GAS, holds BOOST, same shots.
// Logs the FX numbers per shot: live SPARK particles (count / max size / max distance from the car), thruster scale + world offset.
// usage: node tools/tBoostFx.js <url local_dbg.html> <outdir> race|roam|tab   env TRACK=grand CITY=fra TAG=prefix
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const URL=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',OUT=process.argv[3]||'qa21',MODE=process.argv[4]||'race',TRACK=process.env.TRACK||'grand',CITY=process.env.CITY||'fra',TAG=process.env.TAG||'';fs.mkdirSync(OUT,{recursive:true});
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 setInterval(()=>{if(window.__dbg&&!window.__noR&&!window.__shooting){window.__noR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
// FX probe: sparks alive near the player car, thruster group, camera fov
const FXP=`__oc.ev('(()=>{const s=pl;if(!s||!s.mesh)return null;const c=new THREE.Vector3();(s.mesh.userData.m||s.mesh).getWorldPosition(c);let n=0,far=0,big=0;const P=SPARK&&SPARK.list;if(Array.isArray(P))for(const q of P){const pp=q.p||q.pos;if(!pp||!(q.life>0))continue;n++;far=Math.max(far,pp.distanceTo(c));big=Math.max(big,q.size||q.s||0)} let tb=null;const T=window.B2K&&B2K.box?null:null;try{const g=scene.getObjectByName("b2kTurb");if(g&&g.visible){const ws=[];g.traverse(o=>{if(o.isMesh&&o.geometry.type==="ConeGeometry"){const w=new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);const sc=new THREE.Vector3().setFromMatrixScale(o.matrixWorld);ws.push({d:+w.distanceTo(c).toFixed(2),sc:+sc.x.toFixed(2),len:+sc.z.toFixed(2)})}});tb=ws}}catch(e){tb=String(e)} return {state,v:+(s.v||Math.abs(RO.v)||0).toFixed(1),bm:+s.bm.toFixed(1),nitro:!!s.nitro,bash:window.B2K.bash(),sparks:n,sparkFar:+far.toFixed(1),sparkBig:+big.toFixed(2),turb:tb,fov:+camera.fov.toFixed(1),uBoost:+__dbg.FX.uniforms.uBoost.value.toFixed(2),sl:+(typeof speedLines!=="undefined"?speedLines.mesh.material.opacity:0).toFixed(2),b2kErr:window.B2K.st().err}})()')`;
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const p=await ctx.newPage();p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);
 let SYN=Date.now()/1000;{const s0=cdp.send.bind(cdp);cdp.send=(m,o)=>s0(m,m==='Input.dispatchTouchEvent'?{...o,timestamp:SYN}:o)}
 const tick=n=>{SYN+=n/60;return p.evaluate(n=>__tick(n),n)};
 const rOn=()=>p.evaluate(()=>{window.__shooting=1;if(window.__noR){__dbg.composer.render=window.__noR;window.__noR=null}});
 const rOff=()=>p.evaluate(()=>{window.__shooting=0;if(!window.__noR){window.__noR=__dbg.composer.render;__dbg.composer.render=()=>{}}});
 const LOG=[];const shot=async name=>{await rOn();await tick(1);const fx=await p.evaluate(FXP).catch(e=>String(e));await p.screenshot({path:path.join(OUT,`${TAG}${name}.jpg`),type:'jpeg',quality:80});await rOff();LOG.push({name,fx});console.log('SHOT',name,JSON.stringify(fx))};
 const shotCam=async(name,code)=>{await p.evaluate(code=>{window.__shooting=1;const r=window.__noR||__dbg.composer.render;window.__noR=null;window.__cr=r;__dbg.composer.render=function(){try{__oc.ev(code)}catch(e){console.warn('cam',e)}return r.apply(this,arguments)};__tick(1)},code);
  await p.screenshot({path:path.join(OUT,`${TAG}${name}.jpg`),type:'jpeg',quality:80});await p.evaluate(()=>{__dbg.composer.render=()=>{};window.__noR=window.__cr;window.__shooting=0});SYN+=1/60;console.log('SHOT',name)};
 const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
 const center=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width<4||cs.display==='none'||cs.visibility==='hidden')return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
 const down=async(name,xy)=>{if(!xy)return false;if(F[name])await up(name);let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[name]={x:xy[0],y:xy[1],id};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()});return true};
 const up=async name=>{if(!F[name])return;delete F[name];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length){SYN+=.44;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})}};
 const tapXY=async xy=>{if(!xy)return false;await down('tap',xy);await tick(4);await up('tap');await tick(2);return true};
 const tap=async sel=>tapXY(await center(sel));
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 const sideCam=`{const s=pl,h=s.mesh.userData.m||s.mesh;const P=new THREE.Vector3();h.getWorldPosition(P);const fw=new THREE.Vector3(0,0,-1).transformDirection(h.matrixWorld);const rt=new THREE.Vector3(1,0,0).transformDirection(h.matrixWorld);if(state==='roam'){fw.set(Math.sin(RO.h),0,Math.cos(RO.h));rt.set(Math.cos(RO.h),0,-Math.sin(RO.h))}camera.position.copy(P).addScaledVector(rt,6).addScaledVector(fw,-3.5).add(new THREE.Vector3(0,1.1,0));camera.lookAt(P.clone().addScaledVector(fw,-1.2).add(new THREE.Vector3(0,.6,0)));camera.updateMatrixWorld()}`;
 if(MODE==='race'||MODE==='tab'){
  await p.evaluate(()=>{localStorage.setItem('mho_prof@1',JSON.stringify({xp:40000}))});
  await tap('[data-a="quick"]');await p.waitForTimeout(300);await tick(10);
  await tapXY(await p.evaluate(c=>{const e=[...document.querySelectorAll('[data-c]')].find(x=>x.dataset.c===c&&x.offsetParent);if(!e)return null;const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]},CITY));await tick(10);
  const card=await p.evaluate(t=>{const ids=__oc.ev('[...TDF,...(typeof ATH_TRACKS!=="undefined"?ATH_TRACKS:[])].map(d=>[d.id,d.short||d.name])');const want=(ids.find(a=>a[0]===t)||[])[1]||t;
   const e=[...document.querySelectorAll('#menu *')].filter(x=>x.offsetParent&&x.children.length&&x.textContent.trim().startsWith(want)).pop();if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]},TRACK);
  await tapXY(card);await tick(10);
  const sb=await p.evaluate(()=>{const e=document.querySelector('#startBtn');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});await tapXY(sb);
  for(let i=0;i<300;i++){const s=await p.evaluate(()=>__mho.state);if(s==='race')break;await tick(15)}
  await p.evaluate(()=>{window.__auto=false});
  await down('gas',await center('#tG'));await tick(240);await shot('race_noboost');
  if(MODE==='tab'){await tap('#tuG');await tick(4);await p.evaluate(()=>{const b=[...document.querySelectorAll('#tuD [data-g]')].find(x=>x.dataset.g==='FX');if(b)b.click()});await tick(4);await shot('tune_fx_tab');
   // live apply: sparkles OFF via the checkbox, flame size 2 via its slider (real taps/inputs on the drawer)
   const r=await p.evaluate(()=>{const c=document.querySelector('#tuD input[type=checkbox][data-k="TUNE.fxSpk"]');c.click();const sl=document.querySelector('#tuD input[data-k="TUNE.fxFlS"]');sl.value=2;sl.dispatchEvent(new Event('input',{bubbles:true}));return __oc.ev('[TUNE.fxSpk,TUNE.fxFlS]')});console.log('LIVE',JSON.stringify(r));
   await tick(4);await shot('tune_fx_changed');console.log('ERR',JSON.stringify(errs.slice(0,8)));await b.close();return}
 }else{
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
  await tap('#hcStory');await tick(10);await tap('#slotList .go');
  for(let i=0;i<150;i++){try{if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break;await p.waitForTimeout(2000)}catch(e){await p.waitForTimeout(2000)}}await p.evaluate(()=>{window.__auto=false});
  for(let i=0;i<30;i++){await tick(30);let hit=false;for(const s of['#storyGo','#m1Cs','#rcGo','.m1go','#tutSkip','#resBtn']){if(await tap(s)){hit=true;break}}if(!hit)break}
  if(MODE==='tab'){// TUNE drawer FX tab
   await tap('#tuneGear');await tick(10);await p.evaluate(()=>{const b=[...document.querySelectorAll('#tuneD [data-g]')].find(x=>x.dataset.g==='FX');if(b)b.click()});await tick(5);await shot('tune_fx_tab');
   const t=await p.evaluate(()=>window.__tune&&__tune.vals?__tune.vals():null);console.log('TUNE',JSON.stringify(t&&Object.keys(t).filter(k=>k.startsWith('FX')).length));
   console.log('ERR',JSON.stringify(errs.slice(0,8)));await b.close();return}
  await down('gas',await center('#tG'));await tick(300);await shot('roam_noboost');
 }
 // fill the meter the way a player does over time? Keep it real: wait until the meter has >= 60 (regen/pads), max 25 s
 for(let i=0;i<50;i++){const bm=await p.evaluate(()=>window.B2K.st().bm);if(bm>=60)break;await tick(30)}
 await down('boost',await center('#tN'));
 const pre=MODE==='race'?'race':'roam';
 await tick(9);await shot(pre+'_boost_015');await tick(21);await shot(pre+'_boost_05');await shotCam(pre+'_boost_side',sideCam);await tick(42);await shot(pre+'_boost_12');await tick(84);await shot(pre+'_boost_26');
 await up('boost');await tick(60);await shot(pre+'_after');
 fs.writeFileSync(path.join(OUT,TAG+pre+'.json'),JSON.stringify({LOG,errs},null,1));console.log('ERR',JSON.stringify(errs.slice(0,8)));await b.close()})().catch(e=>{console.error('FAIL',e);process.exit(1)});
