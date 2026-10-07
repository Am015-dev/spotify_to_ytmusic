// tW13.js (worker 13 probe; harness from tW12). usage: FAST=1 TEST=traffic|speed node tools/tW13.js <url> <outdir>
//         (gnd ray from 0.6 m above the tyre, and a THREE ray against the visible road meshes). Player at rest, at 60 km/h, and after a stop.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');const {execSync}=require('child_process');
const src=fs.readFileSync(path.join(__dirname,'tPlay.js'),'utf8');const INIT=eval('`'+/const INIT=`([\s\S]*?)`;/.exec(src)[1]+'`');
const FASTM=process.env.FAST==='1',URL0=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',URL=FASTM&&!/fast=1/.test(URL0)?URL0+(URL0.includes('?')?'&':'?')+'fast=1':URL0;
const OUT=process.argv[3]||'qa_w13';fs.mkdirSync(OUT,{recursive:true});const TEST=process.env.TEST||'all',has=t=>TEST==='all'||TEST.split(',').includes(t);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const p=await ctx.newPage();p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);let SYN=Date.now()/1000;if(FASTM){const s0=cdp.send.bind(cdp);cdp.send=(m,o)=>s0(m,m==='Input.dispatchTouchEvent'?{...o,timestamp:SYN}:o)}
 const tick=n=>{if(FASTM)SYN+=n/60;return p.evaluate(n=>__tick(n),n)};
 const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
 const center=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();if(r.width<4)return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;if(getComputedStyle(e).display==='none')return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
 const send=()=>cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()});
 const down=async(n,xy)=>{if(!xy)return false;let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[n]={x:xy[0],y:xy[1],id};await send();return true};
 const up=async n=>{if(!F[n])return;delete F[n];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length){SYN+=.44;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})}};
 const tap=async s=>{const xy=await center(s);if(!xy)return false;await down('tap',xy);await tick(4);await up('tap');await tick(4);return true};
 const ctl={gas:false,brake:false,L:false,R:false};
 async function apply(c){c={...ctl,...c};for(const [k,sel] of [['gas','#tG'],['brake','#tB'],['L','#tL'],['R','#tR']])if(c[k]!==ctl[k]){if(c[k])await down(k,await center(sel));else await up(k)}Object.assign(ctl,c)}
 const render=async()=>p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1)});
 const unrender=async()=>p.evaluate(()=>{window.__shooting=0;if(!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}});
 const shot=async name=>{await render();const f=path.join(OUT,name+'.jpg');await p.screenshot({path:f,type:'jpeg',quality:75});await unrender();return f};
 // ---- start like a player
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await tap('#hcStory');await tick(10);await tap('#slotList .go');
 for(let i=0;i<150;i++){if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break;await p.waitForTimeout(2000)}await p.evaluate(()=>{window.__auto=false});
 const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','#setDone','.m1go','#resBtn','#tutSkip'];
 for(let i=0;i<30;i++){await tick(30);let t=null;for(const s of CONT)if(await tap(s)){t=s;break}if(!t)break}
 await tap('#tG');await tick(2);
 await p.evaluate(()=>{window.__L=[];window.__mon=()=>{if(!window.__logOn)return;const R=__mho.RO,c=__dbg.camera,d=new __dbg.THREE.Vector3();c.getWorldDirection(d);
  __L.push({h:R.h,vh:R.vh??R.h,v:R.v,x:R.x,z:R.z,y:R.y,st:R.stkT||0,cy:Math.atan2(d.x,d.z),msg:(document.querySelector('#msg')||{}).textContent||''})}});
 const busy=()=>p.evaluate(()=>{const R=__mho.RO;return!!(R.card||R.mapOpen||R.story||R.frozen)});
 async function clear(){for(let i=0;i<10;i++){if(!(await busy()))return;for(const s of CONT)if(await tap(s))break;await tick(20)}}
 const place=async(x,z,h,v=0)=>{await p.evaluate(([x,z,h])=>{const M=__mho,R=M.RO;M.warp(x,z,h,performance.now());R.x=x;R.z=z;R.y=M.gnd(x,z,R.y+30);R.v=0;R.yr=0;R.vh=h;R.h=h;R.stkT=0;R.crTurn=null},[x,z,h]);await tick(30);await clear();await p.evaluate(([x,z,h,v])=>{const R=__mho.RO;R.x=x;R.z=z;R.h=R.vh=h;R.v=v;R.yr=0;R.stkT=0},[x,z,h,v]);await tick(2)};
 const EV=s=>p.evaluate(s=>__oc.ev(s),s);
 const log=async on=>{await p.evaluate(on=>{window.__logOn=on;if(on)window.__L=[]},on);if(!on)return p.evaluate(()=>__L)};
 const TAG=process.env.TAG||'x';
 await apply({gas:true});await tick(150);await apply({gas:false});await tick(90);
 if(has('geo')){console.log('GEO',JSON.stringify(await EV(`(()=>{const T=__dbg.THREE,o=[];HCAR.forEach((nm,k)=>{const im=HUB.cim[k];if(!im)return;const bx=g=>{if(!g)return null;g.computeBoundingBox();const b=g.boundingBox;return[b.min.x,b.max.x,b.min.y,b.max.y,b.min.z,b.max.z].map(v=>+v.toFixed(2))};o.push([nm,im.count,bx(im.geometry),im.userData.g&&bx(im.userData.g.geometry),im.userData.w&&bx(im.userData.w.geometry),[].concat(im.material)[0].type])});return o})()`),null,0))}
 const HQ=async on=>p.evaluate(on=>{if(!window.__fast)return;__fast.W=on?1704:426;__fast.H=on?786:196;__oc.ev('resize()')},on);
 if(has('kinds')){await HQ(1);const K=(process.env.KINDS||'0,4,5,8').split(',').map(Number);
  for(const k of K){const c=await p.evaluate(k=>{const H=__mho.HUB,N=H.nodes,R=__mho.RO;const L=H.cars.filter(c=>!c.dead&&c.k===k&&c.x!=null).sort((a,b)=>Math.hypot(a.x-R.x,a.z-R.z)-Math.hypot(b.x-R.x,b.z-R.z));if(!L.length)return null;const c=L[0],A=N[c.a],B=N[c.b],l=Math.hypot(B.x-A.x,B.z-A.z)||1;return{x:c.x,z:c.z,dx:(B.x-A.x)/l,dz:(B.z-A.z)/l}},k);
   if(!c){console.log('nokind',k);continue}await place(c.x-c.dz*6,c.z+c.dx*6,Math.atan2(c.dx,c.dz));
   for(const d of [9,25]){await render();await p.evaluate(([k,d])=>{const M=__mho,D=__dbg,H=M.HUB,R=M.RO;let cc=null,b=1e9;for(const q of H.cars){const e=Math.hypot(q.x-R.x,q.z-R.z);if(!q.dead&&q.k===k&&e<b){b=e;cc=q}}const N=H.nodes,A=N[cc.a],B=N[cc.b],l=Math.hypot(B.x-A.x,B.z-A.z)||1,dx=(B.x-A.x)/l,dz=(B.z-A.z)/l,g=M.gnd(cc.x,cc.z,50);
     D.camera.position.set(cc.x-dx*d*.6+dz*d*.8,g+1.4+d*.06,cc.z-dz*d*.6-dx*d*.8);D.camera.lookAt(cc.x,g+1,cc.z);D.camera.updateMatrixWorld();D.composer.render()},[k,d]);
    await p.screenshot({path:path.join(OUT,`${TAG}_k${k}_${d}.jpg`),type:'jpeg',quality:85});await unrender()}}await HQ(0)}
 if(has('traffic')){
  await shot(TAG+'_chase0');
  const cars=await p.evaluate(()=>{const R=__mho.RO,H=__mho.HUB,N=H.nodes;return (H.cars||[]).filter(c=>!c.dead&&c.x!=null).map(c=>{const A=N[c.a],B=N[c.b],L=Math.hypot(B.x-A.x,B.z-A.z)||1;return{k:c.k,x:c.x,z:c.z,dx:(B.x-A.x)/L,dz:(B.z-A.z)/L,d:Math.hypot(c.x-R.x,c.z-R.z)}}).sort((a,b)=>a.d-b.d).slice(0,4)});
  console.log('CARS',JSON.stringify(cars.map(c=>[c.k,+c.d.toFixed(1)])));
  for(const [i,c] of cars.slice(0,2).entries()){
   // move the player next to that car so culling/LOD follow the camera like in play, then look from several distances
   await place(c.x-c.dz*5,c.z+c.dx*5,Math.atan2(c.dx,c.dz));await tick(5);
   for(const d of [7,18,40,80]){await render();const info=await p.evaluate(([c,d])=>{const M=__mho,D=__dbg,H=M.HUB;let cc=null,b=1e9;for(const q of H.cars){const e=Math.hypot(q.x-c.x,q.z-c.z);if(!q.dead&&e<b){b=e;cc=q}}const g=M.gnd(cc.x,cc.z,50);
     const ox=-c.dx*d*.75+c.dz*d*.65,oz=-c.dz*d*.75-c.dx*d*.65;D.camera.position.set(cc.x+ox,g+1.6+d*.08,cc.z+oz);D.camera.lookAt(cc.x,g+.8,cc.z);D.camera.updateMatrixWorld();D.composer.render();
     const im=H.cim[cc.k],m=[].concat(im.material)[0];return{k:cc.k,vis:im.visible,cnt:im.count,tr:m.transparent,op:m.opacity,dw:m.depthWrite,al:m.alphaTest,bl:m.blending,side:m.side,type:m.type,ro:im.renderOrder,g:im.userData.g&&{vis:im.userData.g.visible,tr:im.userData.g.material.transparent,op:im.userData.g.material.opacity},w:im.userData.w&&im.userData.w.visible}},[c,d]);
    console.log('T',i,d,JSON.stringify(info));const f=path.join(OUT,`${TAG}_tr${i}_${d}.jpg`);await p.screenshot({path:f,type:'jpeg',quality:80});await unrender()}}
 }
 console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close()})().catch(e=>{console.error('ERR',e);process.exit(1)});
