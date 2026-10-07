// tW11.js — worker 11 evidence probe (same start/harness as tW10: real CDP touch on #tG/#tB/#tL/#tR, test-driven rAF clock).
// usage: FAST=1 node tools/tW11.js <url local_dbg.html> <outdir>   env TEST=wall|tyre|turn|slalom|side|all (default all)
// wall:   car placed 12 m from a building wall (setup only), then real GAS held: drive in, keep GAS 5 s after contact. Reports time pinned, UNSTUCK, freed (≥4 m from contact and > 8 km/h).
// tyre:   per-tyre clearance after a REAL render (wheel clamp runs in onBeforeRender): tyre bottom (wheel centre − r·scale) − ground under that tyre
//         (gnd ray from 0.6 m above the tyre, and a THREE ray against the visible road meshes). Player at rest, at 60 km/h, and after a stop.
// turn:   90° right turn at a city junction (real ▶ touch), 6-frame strip; slip = |h−vh|, camera lag = time camera yaw trails car yaw at 45°.
// slalom: Autobahn straight, ◀/▶ alternating every 0.8 s at ~70 km/h, 6-frame strip; max slip.
// side:   low side view aimed at the PLAYER car with a traffic car ahead in the same lane, same direction.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');const {execSync}=require('child_process');
const src=fs.readFileSync(path.join(__dirname,'tPlay.js'),'utf8');const INIT=eval('`'+/const INIT=`([\s\S]*?)`;/.exec(src)[1]+'`');
const FASTM=process.env.FAST==='1',URL0=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',URL=FASTM&&!/fast=1/.test(URL0)?URL0+(URL0.includes('?')?'&':'?')+'fast=1':URL0;
const OUT=process.argv[3]||'qa_w11';fs.mkdirSync(OUT,{recursive:true});const TEST=process.env.TEST||'all',has=t=>TEST==='all'||TEST.split(',').includes(t);
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
 const log=async on=>{await p.evaluate(on=>{window.__logOn=on;if(on)window.__L=[]},on);if(!on)return p.evaluate(()=>__L)};
 // warm-up
 await apply({gas:true});await tick(240);await apply({gas:false});await tick(60);
 const D=180/Math.PI;const ad=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};
 const res={url:URL0,errs};const S0=await p.evaluate(()=>{const R=__mho.RO;return{x:R.x,z:R.z,h:R.h}});
 const ST=await p.evaluate(()=>{const M=__mho;let best=null;M.abS().forEach((S,k)=>{if(!S.ab)return;for(let i=0;i+40<S.n;i+=4){const a=M.abPt(k,i),c=M.abPt(k,i+40);const d=Math.abs(Math.atan2(a.tx,a.tz)-Math.atan2(c.tx,c.tz));if(d<.02&&(!best||d<best.d))best={k,i,d,x:a.x,z:a.z,h:Math.atan2(a.tx,a.tz)}}});return best});
 // per-tyre clearance (call right after a real render)
 const TYRE=()=>{const M=__mho,R=M.RO,T=__dbg.THREE,P=new T.Vector3(),rc=new T.Raycaster(),out=[];if(!M.pl||!M.pl.mesh)return null;const car=M.pl.mesh;car.updateMatrixWorld(true);
  const road=[];__dbg.scene.traverseVisible(o=>{if(o.isMesh&&!o.isInstancedMesh&&!o.isSkinnedMesh){let a=o;while(a&&a!==car)a=a.parent;if(!a&&o.geometry&&o.geometry.attributes.position&&o.geometry.attributes.position.count<400000){if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();const s=o.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld);if(Math.hypot(s.center.x-R.x,s.center.z-R.z)<s.radius+3)road.push(o)}}});
  car.traverseVisible(o=>{if(!(o.userData&&o.userData.r&&o.userData.by!==undefined))return;const e=o.matrixWorld.elements,s=Math.hypot(e[4],e[5],e[6])||1;o.getWorldPosition(P);const bot=P.y-o.userData.r*s;
   const g=M.gnd(P.x,P.z,bot+.6);rc.set(new T.Vector3(P.x,bot+.6,P.z),new T.Vector3(0,-1,0));rc.far=3;const hits=rc.intersectObjects(road,false),hit=hits.find(h=>!(h.object.material&&(h.object.material.transparent||h.object.material.depthWrite===false)));const hd=hits.slice(0,3).map(h=>{const o=h.object,m=Array.isArray(o.material)?o.material[0]:o.material,bb=new T.Box3().setFromObject(o),sz=bb.getSize(new T.Vector3());return[(o.name||o.type)+(m&&m.transparent?'(T)':''),+(bot-h.point.y).toFixed(3),o.geometry.attributes.position.count,m&&m.color?m.color.getHexString():'',m&&m.map?'tex':'',[sz.x,sz.y,sz.z].map(v=>+v.toFixed(1)),o.parent&&o.parent.type,o.renderOrder,o.userData&&Object.keys(o.userData).join('|')]});
   out.push({x:+P.x.toFixed(2),z:+P.z.toFixed(2),r:+(o.userData.r*s).toFixed(3),gap_gnd:+(bot-g).toFixed(3),gap_mesh:hit?+(bot-hit.point.y).toFixed(3):null,hd})});
  const body=new T.Box3();return{tyres:out,carY:+R.y.toFixed(3),gndCar:+(R.y-M.gnd(R.x,R.z,R.y+.6)).toFixed(3)}};
 if(has('tyre')){const T=[];
  // city street at rest, Autobahn at rest, Autobahn at speed, after a stop
  await place(S0.x,S0.z,S0.h);await tick(30);await render();T.push({at:'city rest',...await p.evaluate(TYRE)});await unrender();
  await place(ST.x,ST.z,ST.h);await tick(30);await render();T.push({at:'autobahn rest',...await p.evaluate(TYRE)});await unrender();
  await apply({gas:true});await tick(300);await render();T.push({at:'autobahn gas 5s',v:await p.evaluate(()=>+(__mho.RO.v*3.6).toFixed(0)),...await p.evaluate(TYRE)});await unrender();
  await apply({gas:false,brake:true});await tick(300);await apply({brake:false});await tick(30);await render();T.push({at:'after stop',...await p.evaluate(TYRE)});await unrender();
  res.tyre=T;console.log('TYRE',JSON.stringify(T))}
 if(has('wall')){await place(S0.x,S0.z,S0.h);
  const W=await p.evaluate(()=>{const M=__mho,R=M.RO,out=[];for(let r=0;r<400&&out.length<6;r+=20)for(let a=0;a<64&&out.length<6;a++){const cx=R.x+Math.sin(a*.1)*r,cz=R.z+Math.cos(a*.1)*r,cy=M.gnd(cx,cz,R.y+20);if(M.roamHitAt(cx,cz,3,cy))continue;
    for(let k=0;k<16;k++){const h=k*Math.PI/8,sx=Math.sin(h),sz=Math.cos(h);let d=0;for(d=1;d<30;d+=.5){if(M.roamHitAt(cx+sx*d,cz+sz*d,1.2,cy))break}if(d<14||d>=30)continue;let ok=true;for(let t=0;t<d-1;t+=1){const y=M.gnd(cx+sx*t,cz+sz*t,cy+3);if(Math.abs(y-cy)>.8)ok=false}if(!ok)continue;
     // wall normal check: left/right rays hit at similar distance → roughly perpendicular wall
     out.push({x:cx,z:cz,h,d});break}}return out});
  res.wall=[];
  for(const [i,w] of W.slice(0,3).entries())for(const off of[0,25]){const h=w.h+off/D;await place(w.x+Math.sin(w.h)*(w.d-5),w.z+Math.cos(w.h)*(w.d-5),h,20/3.6);await log(true);
   await apply({gas:true});let contact=-1;
   for(let f=0;f<60*12;f+=6){await tick(6);const L=await p.evaluate(()=>__L.length?__L[__L.length-1]:null);if(contact<0&&L){const q=await p.evaluate(()=>__L.slice(-12).map(o=>Math.abs(o.v)));if(Math.max(...q)>3&&Math.abs(L.v)<Math.max(...q)*.6)contact=f}if(contact>=0&&f-contact>=300)break}
   await apply({gas:false});const Lg=await log(false);const c0=contact>=0?Math.min(Lg.length-1,contact):0,C=Lg[c0]||Lg[0],E=Lg[Lg.length-1];
   let pin=0,pinMax=0;for(const o of Lg.slice(c0)){if(Math.abs(o.v)<5/3.6){pin++;pinMax=Math.max(pinMax,pin)}else pin=0}
   const unstuck=Lg.some(o=>/UNSTUCK/.test(o.msg)),dist=Math.hypot(E.x-C.x,E.z-C.z),freed=dist>=4&&Math.abs(E.v)>8/3.6;
   const r={wall:i,angle:off,contactKmh:+(Math.max(...Lg.slice(Math.max(0,c0-20),c0+1).map(o=>Math.abs(o.v)))*3.6).toFixed(0),pinnedMaxS:+(pinMax/60).toFixed(2),unstuckMsg:unstuck,turnDeg:+(ad(E.h,C.h)*D).toFixed(0),movedFromContactM:+dist.toFixed(1),endKmh:+(E.v*3.6).toFixed(0),freed,contact:contact>=0};
   res.wall.push(r);console.log('WALL',JSON.stringify(r));if(i===0&&off===0)await shot('wall_end')}}
 if(has('turn')){await place(S0.x,S0.z,S0.h);
  // a junction with two near-perpendicular legs ≥ 45 m, ordinary city road (no Autobahn, no hills)
  const J=await p.evaluate(()=>{const M=__mho,R=M.RO,N=M.HUB.nodes;let best=null;for(let i=0;i<N.length;i++){const n=N[i];if(!n||!n.nb||n.nb.length<3||n.ab||n.g)continue;const d0=Math.hypot(n.x-R.x,n.z-R.z);if(d0>900)continue;
   for(const a of n.nb)for(const c of n.nb){if(a===c)continue;const A=N[a],C=N[c];if(!A||!C||A.ab||C.ab||A.g||C.g)continue;const la=Math.hypot(A.x-n.x,A.z-n.z),lc=Math.hypot(C.x-n.x,C.z-n.z);if(la<45||lc<45)continue;
    const hin=Math.atan2(n.x-A.x,n.z-A.z),hout=Math.atan2(C.x-n.x,C.z-n.z);let t=hout-hin;while(t>Math.PI)t-=2*Math.PI;while(t<-Math.PI)t+=2*Math.PI;   // right turn = heading decreases? decide by sign below
    if(Math.abs(Math.abs(t)-Math.PI/2)>.15)continue;const s=Math.abs(Math.abs(t)-Math.PI/2)+d0/5000;if(!best||s<best.s)best={s,A:[A.x,A.z],n:[n.x,n.z],C:[C.x,C.z],hin,hout,t,w:Math.min(A.w||n.w||20,20)}}}return best});
  res.turnJ=J;
  if(J){const right=J.t<0;  // probe which key turns which way: assume ▶ makes h decrease if J.t<0, else use ◀
   const hin=J.hin,sx=Math.sin(hin),sz=Math.cos(hin),nx=Math.cos(hin),nz=-Math.sin(hin);const lane=(J.w||12)*.2*(1);
   const st=[J.n[0]-sx*42+nx*0,J.n[1]-sz*42+nz*0];await place(st[0],st[1],hin);await log(true);await apply({gas:true});
   // first: which side key decreases heading? test briefly earlier is costly; use dist trigger and steer by sign check at runtime
   const shots=[];let steering=null,done=false,f=0,tStart=null;
   while(f<60*9){await tick(3);f+=3;const s=await p.evaluate(([nx0,nz0])=>{const R=__mho.RO;return{x:R.x,z:R.z,h:R.h,v:R.v,d:(nx0-R.x)*Math.sin(R.h)+(nz0-R.z)*Math.cos(R.h)}},J.n);
    if(!steering){const g=Math.abs(s.v)<45/3.6;if(g!==ctl.gas)await apply({gas:g})}
    if(!steering&&s.d<16){steering=J.t>0?'L':'R';await apply({gas:true,[steering]:true});tStart=f}
    if(steering&&!done){const turned=ad(s.h,hin);if(Math.abs(turned)>=Math.abs(J.t)-.12){await apply({L:false,R:false});done=true;var tEnd=f}}
    if(steering&&shots.length<6&&(f-tStart)%15===0)shots.push(await shot('turn_'+shots.length));
    if(done&&f-tEnd>90)break}
   await apply({gas:false,L:false,R:false});const Lg=await log(false);
   // if the key turned the wrong way (heading moved opposite), report it
   const tot=ad(Lg[Lg.length-1].h,hin)*D;
   const slip=Math.max(...Lg.filter(o=>Math.abs(o.v)>3).map(o=>Math.abs(ad(o.h,o.vh))*D));
   const t45=Lg.findIndex(o=>Math.abs(ad(o.h,hin))>=Math.PI/4),c45=Lg.findIndex(o=>Math.abs(ad(o.cy,Lg[0].cy))>=Math.PI/4);
   res.turn={key:steering,turnedDeg:+tot.toFixed(0),maxSlipDeg:+slip.toFixed(1),camLagS:t45>=0&&c45>=0?+((c45-t45)/60).toFixed(2):null,entryKmh:+(Math.max(...Lg.map(o=>Math.abs(o.v)))*3.6).toFixed(0),shots};
   if(shots.length)execSync(`montage ${shots.join(' ')} -tile 3x2 -geometry 852x393+2+2 ${path.join(OUT,'strip_turn90.jpg')}`);console.log('TURN',JSON.stringify(res.turn))}}
 if(has('slalom')){let H=ST.h+(process.env.FLIP==='0'?0:Math.PI);
  // drive in the traffic direction: if the WRONG WAY banner shows after a short run, turn round (same lane line, other heading)
  for(let k=0;k<0;k++){await place(ST.x,ST.z,H);await apply({gas:true});await tick(120);const ww=await p.evaluate(()=>[...document.querySelectorAll('body *')].some(e=>e.children.length===0&&/WRONG WAY/.test(e.textContent)&&e.getBoundingClientRect().width>0&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).opacity!=='0'));await apply({gas:false});if(!ww)break;H=ST.h+Math.PI}
  // lane: shift 0 m first; slalom = ◀ 0.4 s, then ▶/◀ 0.8 s each, ▶ 0.4 s (stays centred), speed held ~70 km/h
  await place(ST.x,ST.z,H);await log(true);await apply({gas:true});
  for(let f=0;f<60*6&&(await p.evaluate(()=>__mho.RO.v*3.6))<70;f+=6)await tick(6);
  const seq=[['L',24],['R',48],['L',48],['R',48],['L',48],['R',24]],shots=[];
  for(const [side,n] of seq){await apply({L:side==='L',R:side==='R'});for(let f=0;f<n;f+=6){await tick(6);const v=await p.evaluate(()=>__mho.RO.v*3.6);if((v<70)!==ctl.gas)await apply({gas:v<70})}shots.push(await shot('slalom_'+shots.length))}
  await apply({L:false,R:false,gas:false});await tick(60);const Lg=await log(false);
  const ww=await p.evaluate(()=>[...document.querySelectorAll('body *')].some(e=>e.children.length===0&&/WRONG WAY/.test(e.textContent)&&e.getBoundingClientRect().width>0));
  res.slalom={heading:H===ST.h?'abPt':'abPt+180',startKmh:70,maxSlipDeg:+Math.max(...Lg.filter(o=>Math.abs(o.v)>3).map(o=>Math.abs(ad(o.h,o.vh))*D)).toFixed(1),maxHeadingSwingDeg:+(Math.max(...Lg.map(o=>Math.abs(ad(o.h,H))))*D).toFixed(0),
   lateralDriftM:+Math.max(...Lg.map(o=>Math.abs((o.x-ST.x)*Math.cos(H)-(o.z-ST.z)*Math.sin(H)))).toFixed(1),camLagS:null,shots};
  execSync(`montage ${shots.join(' ')} -tile 3x2 -geometry 852x393+2+2 ${path.join(OUT,'strip_slalom.jpg')}`);console.log('SLALOM',JSON.stringify(res.slalom))}
 if(has('side')){res.side=[];
  for(const where of['city','autobahn']){await place(where==='autobahn'?ST.x:S0.x,where==='autobahn'?ST.z:S0.z,where==='autobahn'?ST.h:S0.h);
   const sel=await p.evaluate(([where])=>{const M=__mho,R=M.RO,H=M.HUB,N=H.nodes;let j=-1,bd=1e9;(H.cars||[]).forEach((c,i)=>{if(c.dead>0||c.tr)return;const A=N[c.a],B=N[c.b];if(!A||!B)return;if(where==='autobahn'?!(A.ab&&B.ab):(A.ab||B.ab||A.g||B.g))return;const L=Math.hypot(B.x-A.x,B.z-A.z);if(L*(1-c.t)<20||L*c.t<14)return;const d=Math.hypot(c.x-R.x,c.z-R.z);if(d<bd){bd=d;j=i}});if(j<0)return null;
    const c=H.cars[j];c.v=0;c.cv=0;c.hv=.01;c.route=[];c.hitT=99;window.__tc=j;const A=N[c.a],B=N[c.b],L=Math.hypot(B.x-A.x,B.z-A.z),ux=(B.x-A.x)/L,uz=(B.z-A.z)/L;return{x:c.x,z:c.z,h:Math.atan2(ux,uz)}},[where]);
   if(!sel){res.side.push({where,err:'no car'});continue}
   await place(sel.x-Math.sin(sel.h)*7.5,sel.z-Math.cos(sel.h)*7.5,sel.h);await tick(30);
   await p.evaluate(([x,z,h])=>{const M=__mho,R=M.RO,ax=R.x+(x-R.x)*.35,az=R.z+(z-R.z)*.35,g=M.gnd(ax,az,R.y+.3),sx=Math.cos(h),sz=-Math.sin(h);window.__camOv=[ax+sx*9,g+1,az+sz*9,ax,g+.6,az]},[sel.x,sel.z,sel.h]);
   await render();const tyre=await p.evaluate(TYRE);const traf=await p.evaluate(()=>{const M=__mho,c=M.HUB.cars[window.__tc],T=__dbg.THREE,B=new T.Box3(),m4=new T.Matrix4(),im=M.HUB.cim[c.k],w=im&&im.userData.w;if(!w)return null;if(!w.geometry.boundingBox)w.geometry.computeBoundingBox();w.getMatrixAt(c.j,m4);B.copy(w.geometry.boundingBox).applyMatrix4(m4);return+(B.min.y-M.gnd(c.x,c.z,c.y+.6)).toFixed(3)});
   await p.evaluate(()=>{const o=window.__camOv,D=__dbg;D.camera.position.set(o[0],o[1],o[2]);D.camera.lookAt(o[3],o[4],o[5]);D.camera.updateMatrixWorld();D.composer.render()});
   const f=path.join(OUT,'side_'+where+'.jpg');await p.screenshot({path:f,type:'jpeg',quality:80});await p.evaluate(()=>{window.__camOv=null});await unrender();
   await render();await p.evaluate(CY=>{const M=__mho,R=M.RO,D=__dbg,sx=Math.cos(R.h),sz=-Math.sin(R.h),fx=Math.sin(R.h),fz=Math.cos(R.h),g=M.gnd(R.x,R.z,R.y+.3);D.camera.position.set(R.x+sx*3.6+fx*.8,g+CY,R.z+sz*3.6+fz*.8);D.camera.lookAt(R.x+fx*.8,g+.2,R.z+fz*.8);D.camera.updateMatrixWorld();D.composer.render()},+(process.env.CY||.35));
   const f2=path.join(OUT,'tyre_'+where+'.jpg');await p.screenshot({path:f2,type:'jpeg',quality:85});await unrender();
   res.side.push({where,shot:f,closeup:f2,playerTyres:tyre,trafficWheelGap:traf});console.log('SIDE',where,JSON.stringify(tyre),traf)}}
 res.errs=errs;fs.writeFileSync(path.join(OUT,'w11.json'),JSON.stringify(res,null,1));console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close()})().catch(e=>{console.error('ERR',e);process.exit(1)});
