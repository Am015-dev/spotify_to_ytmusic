// tW10.js — worker 10 driving probe: straight-line braking + traffic contact, with REAL input (CDP touch on #tG/#tB/#tL/#tR, or keys).
// Same start as tPlay (STORY → NEW GAME, tap through intro cards, test-driven rAF clock). Per-frame log of heading, yaw rate, lateral velocity.
// usage: FAST=1 node tools/tW10.js <url local_dbg.html> <outdir>   env MODE=phone|desk · TEST=brake|traffic|both · SHOTS=1
// brake: positions the car on a long straight Autobahn stretch (setup only), then real input: GAS to 40/80/120 km/h, then BRAKE held 4 s.
//   reports per run: yaw drift (deg, h vs h at brake start), peak yaw rate (deg/s), peak lateral velocity (m/s), restart after stop (UNSTUCK kick).
// traffic: puts a traffic car 30 m ahead in the lane (setup only), real GAS into it at 20/60/120 km/h; logs the traffic car's motion after contact.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const src=fs.readFileSync(path.join(__dirname,'tPlay.js'),'utf8');const INIT=eval('`'+/const INIT=`([\s\S]*?)`;/.exec(src)[1]+'`');
const FASTM=process.env.FAST==='1',URL0=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',URL=FASTM&&!/fast=1/.test(URL0)?URL0+(URL0.includes('?')?'&':'?')+'fast=1':URL0;
const OUT=process.argv[3]||'qa_w10';fs.mkdirSync(OUT,{recursive:true});const MODE=process.env.MODE||'phone',TEST=process.env.TEST||'both',SHOTS=process.env.SHOTS==='1';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const phone=MODE==='phone';const ctx=await b.newContext(phone?{viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900}});
 const p=await ctx.newPage();p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);let SYN=Date.now()/1000;if(FASTM){const s0=cdp.send.bind(cdp);cdp.send=(m,o)=>s0(m,m==='Input.dispatchTouchEvent'?{...o,timestamp:SYN}:o)}
 const tick=n=>{if(FASTM)SYN+=n/60;return p.evaluate(n=>__tick(n),n)};
 const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
 const center=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();if(r.width<4)return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;if(getComputedStyle(e).display==='none')return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
 const down=async(n,xy)=>{if(!xy)return false;let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[n]={x:xy[0],y:xy[1],id};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()});return true};
 const up=async n=>{if(!F[n])return;delete F[n];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length){SYN+=.44;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})}};
 const tap=async s=>{const xy=await center(s);if(!xy)return false;if(phone){await down('tap',xy);await tick(4);await up('tap')}else await p.mouse.click(xy[0],xy[1]);await tick(4);return true};
 const KD={};const key=async(k,on)=>{if(!!KD[k]===on)return;KD[k]=on;on?await p.keyboard.down(k):await p.keyboard.up(k)};
 const ctl={gas:false,brake:false};
 async function apply(c){if(phone){if(c.gas!==ctl.gas){c.gas?await down('gas',await center('#tG')):await up('gas')}if(c.brake!==ctl.brake){if(c.brake){SYN+=.45;await down('brake',await center('#tB'))}else await up('brake')}}
  else{await key('ArrowUp',c.gas);await key('ArrowDown',c.brake)}Object.assign(ctl,c)}
 const shot=async name=>{if(!SHOTS)return;await p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1)});await p.screenshot({path:path.join(OUT,`${MODE}_${name}.jpg`),type:'jpeg',quality:70});await p.evaluate(()=>{window.__shooting=0;if(!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}})};
 // ---- start like a player
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await tap('#hcStory');await tick(10);await tap('#slotList .go');
 for(let i=0;i<150;i++){if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break;await p.waitForTimeout(2000)}await p.evaluate(()=>{window.__auto=false});
 const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','#setDone','.m1go','#resBtn','#tutSkip'];
 for(let i=0;i<30;i++){await tick(30);let t=null;for(const s of CONT)if(await tap(s)){t=s;break}if(!t)break}
 if(phone)await tap('#tG'),await tick(2);  // touch controls active (TOUCH.used)
 // per-frame log
 await p.evaluate(()=>{window.__L=[];window.__mon=()=>{const R=__mho.RO;if(!window.__logOn)return;const H=__mho.HUB;const tc=window.__tc!=null&&H.cars?H.cars[window.__tc]:null;
  __L.push({h:R.h,vh:R.vh??R.h,yr:R.yr||0,v:R.v,x:R.x,z:R.z,st:R.stkT||0,ct:R.crTurn,tc:tc&&{x:tc.x,z:tc.z,v:tc.cv,dead:tc.dead>0}})}});
 const busy=()=>p.evaluate(()=>{const R=__mho.RO;return!!(R.card||R.mapOpen||R.story||R.frozen)});
 async function clear(){for(let i=0;i<10;i++){if(!(await busy()))return;let t=null;for(const s of CONT)if(await tap(s)){t=s;break}await tick(20)}}
 // setup: straight stretch (pick the longest straight run of an Autobahn sample)
 const ST=await p.evaluate(()=>{const M=__mho;let best=null;M.abS().forEach((S,k)=>{if(!S.ab)return;for(let i=0;i+40<S.n;i+=4){const a=M.abPt(k,i),c=M.abPt(k,i+40);const d=Math.abs(Math.atan2(a.tx,a.tz)-Math.atan2(c.tx,c.tz));if(d<.02&&(!best||d<best.d))best={k,i,d,x:a.x,z:a.z,h:Math.atan2(a.tx,a.tz)}}});return best});
 const place=async(x,z,h)=>{await p.evaluate(([x,z,h])=>{const M=__mho,R=M.RO;M.warp(x,z,h,performance.now());R.x=x;R.z=z;R.y=M.gnd(x,z,R.y+30);R.v=0;R.yr=0;R.vh=h;R.h=h;R.stkT=0;R.crTurn=null},[x,z,h]);await tick(30);await clear();await p.evaluate(([x,z,h,sv])=>{const R=__mho.RO;R.x=x;R.z=z;R.h=R.vh=h;R.v=sv},[x,z,h,+(process.env.START_V||0)]);await tick(2)};
 // warm-up: a few seconds of driving first (the first drive after the intro is slow)
 await apply({gas:true,brake:false});await tick(240);await apply({gas:false,brake:false});await tick(60);
 const res={mode:MODE,straight:ST,brake:[],traffic:[],errs};
 const D=180/Math.PI;const ad=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};
 if(TEST!=='traffic'&&TEST!=='shots')for(const kmh of[40,80,120]){
  await place(ST.x,ST.z,ST.h);await p.evaluate(()=>{__L.length=0;window.__logOn=1});
  await apply({gas:true,brake:false});let reached=0;for(let f=0;f<60*20;f+=6){await tick(6);const v=await p.evaluate(()=>__mho.RO.v);if(v*3.6>=kmh){reached=v;break}}
  const n0=await p.evaluate(()=>__L.length);await apply({gas:false,brake:true});
  for(let f=0;f<240;f+=6){await tick(6);if(f===12)await shot(`brake${kmh}`)}
  await apply({gas:false,brake:false});const L=await p.evaluate(()=>__L);await p.evaluate(()=>{window.__logOn=0});
  const B=L.slice(n0),h0=B[0].h;let yaw=0,yr=0,lat=0,stopF=-1,restart=0,ct=0,kickV=0;
  B.forEach((q,i)=>{if(stopF<0&&Math.abs(q.v)<.3)stopF=i;if(stopF<0){yaw=Math.max(yaw,Math.abs(ad(q.h,h0)));yr=Math.max(yr,Math.abs(q.yr));lat=Math.max(lat,Math.abs(Math.sin(ad(q.h,q.vh))*q.v))}
   if(q.ct!=null)ct=1;if(stopF>=0&&i>stopF)kickV=Math.max(kickV,q.v)});
  const yawAll=Math.max(...B.map(q=>Math.abs(ad(q.h,h0))));
  res.brake.push({kmh,reachedKmh:+(reached*3.6).toFixed(0),framesToStop:stopF,yawDeg:+(yaw*D).toFixed(2),yawRateDeg:+(yr*D).toFixed(2),latV:+lat.toFixed(2),afterStop:{maxFwdKmh:+(kickV*3.6).toFixed(1),unstuckTurn:!!ct,yawDegTotal:+(yawAll*D).toFixed(1)},
   trace:B.filter((q,i)=>i%6===0).map(q=>[+(q.v*3.6).toFixed(0),+(ad(q.h,h0)*D).toFixed(2),+(q.yr*D).toFixed(1),+q.st.toFixed(2)])})}
 if(TEST!=='brake'&&TEST!=='shots')for(const kmh of(process.env.KMH||'20,60,120,160').split(',').map(Number)){
  // setup only: a stopped city traffic car on a straight segment (as at a red light); the player is placed behind it in its lane.
  // then real input: GAS (+BOOST for 160) until the target speed, then off the gas and coast into it.
  const runway=Math.max(45,(kmh/3.6)**2/(2*2.2)+30);await place(ST.x,ST.z,ST.h);
  // setup only: re-route one traffic car onto this Autobahn lane, stopped, runway metres ahead of the player
  const sel=await p.evaluate(([runway])=>{const M=__mho,R=M.RO,H=M.HUB,N=H.nodes,fx=Math.sin(R.h),fz=Math.cos(R.h),tx=R.x+fx*runway,tz=R.z+fz*runway;let best=null;
   for(let i=0;i<N.length;i++){const A=N[i];if(!A||!A.ab)continue;for(const k of A.nb||[]){const B=N[k];if(!B||!B.ab)continue;const L=Math.hypot(B.x-A.x,B.z-A.z)||1,ux=(B.x-A.x)/L,uz=(B.z-A.z)/L;if(ux*fx+uz*fz<.995)continue;
    const t=((tx-A.x)*ux+(tz-A.z)*uz)/L;if(t<0||t>1)continue;const off=Math.abs((tx-A.x)*uz-(tz-A.z)*ux);if(!best||off<best.off)best={a:i,b:k,t,off,h:Math.atan2(ux,uz)}}}
   if(!best)return null;let j=-1,bd=1e9;(H.cars||[]).forEach((c,i)=>{if(c.dead>0||c.tr||c.__used)return;const d=Math.hypot(c.x-R.x,c.z-R.z);if(d<bd){bd=d;j=i}});if(j<0)return null;
   const c=H.cars[j];c.a=best.a;c.b=best.b;c.t=best.t;c.v=0;c.cv=0;c.hv=.01;c.route=[];c.__used=1;window.__tc=j;return{j,...best}},[runway]);
  if(!sel){res.traffic.push({kmh,err:'no traffic car'});continue}
  await p.evaluate(()=>{const M=__mho,R=M.RO,N=M.HUB.nodes,c=M.HUB.cars[window.__tc],A=N[c.a],B=N[c.b],L=Math.hypot(B.x-A.x,B.z-A.z),ux=(B.x-A.x)/L,uz=(B.z-A.z)/L,s=(R.x-A.x)*ux+(R.z-A.z)*uz;R.x=A.x+ux*s;R.z=A.z+uz*s;R.h=R.vh=Math.atan2(ux,uz)});
  await tick(2);
  const M0=await p.evaluate(()=>({smash:__mho.HUB.smashed||0}));await p.evaluate(()=>{__L.length=0;window.__logOn=1});
  await apply({gas:true,brake:false});if(kmh>=120&&!phone)await key('Shift',true);let hitF=-1,offGas=false,minD=1e9;
  for(let f=0;f<60*20;f+=1){await tick(1);const s=await p.evaluate(()=>{const R=__mho.RO,c=__mho.HUB.cars[window.__tc];return{v:R.v,d:Math.hypot(c.x-R.x,c.z-R.z),dead:c.dead>0}});minD=Math.min(minD,s.d);
   if(!phone){if(s.v*3.6>=kmh){offGas=true;await key('ArrowUp',false);await key('Shift',false)}else if(offGas&&s.v*3.6<kmh-4){await key('ArrowUp',true)}}
   if(hitF<0&&(s.d<5.2||s.dead)){hitF=await p.evaluate(()=>__L.length);await shot(`hit${kmh}_0`);break}}
  if(!phone){await key('Shift',false)}await apply({gas:false,brake:false});
  if(hitF<0){const why=await p.evaluate(()=>{const R=__mho.RO;return{v:R.v,x:R.x,z:R.z,busy:!!(R.card||R.mapOpen||R.story||R.frozen),card:R.card&&String(R.card.id||R.card.kind||'card'),K:Object.keys(__mho.K).filter(k=>__mho.K[k]),st:__mho.state,stk:R.stkT,ct:R.crTurn,L:__L.filter((q,i)=>i%15===0).slice(0,16).map(q=>[+q.h.toFixed(2),+q.v.toFixed(1),Math.round(q.x),Math.round(q.z)])}});res.traffic.push({kmh,err:'no contact',minD,sel,why});continue}
  for(let f=0;f<150;f+=3){await tick(3);if(f===15)await shot(`hit${kmh}_1`);if(f===60)await shot(`hit${kmh}_2`)}
  const L=await p.evaluate(()=>__L);await p.evaluate(()=>{window.__logOn=0});const A=L.slice(Math.max(0,hitF-3));const c0=A[0].tc,pv0=A[0].v;
  let maxD=0,back=0,maxStep=0,maxBackStep=0;const fx=Math.sin(ST.h),fz=Math.cos(ST.h);for(let i=1;i<A.length;i++){const a=A[i-1].tc,q=A[i].tc;if(!a||!q||q.dead)continue;const st=Math.hypot(q.x-a.x,q.z-a.z);maxStep=Math.max(maxStep,st);const along=(q.x-a.x)*fx+(q.z-a.z)*fz;if(along<0)maxBackStep=Math.max(maxBackStep,-along);const D0=(q.x-c0.x)*fx+(q.z-c0.z)*fz;if(D0<maxD-.05)back=Math.max(back,maxD-D0);maxD=Math.max(maxD,D0)}
  let pStep=0,pBack=0;for(let i=1;i<A.length;i++){const st=Math.hypot(A[i].x-A[i-1].x,A[i].z-A[i-1].z);pStep=Math.max(pStep,st);const al=(A[i].x-A[i-1].x)*fx+(A[i].z-A[i-1].z)*fz;if(al<-.02)pBack=Math.max(pBack,-al)}
  const smash=(await p.evaluate(()=>__mho.HUB.smashed||0))-M0.smash;
  res.traffic.push({kmh,contactKmh:+(pv0*3.6).toFixed(0),playerKmh:A.filter((q,i)=>i%6===0).slice(0,12).map(q=>+(q.v*3.6).toFixed(0)),trafficFwdM:+maxD.toFixed(2),trafficBackStepM:+maxBackStep.toFixed(2),trafficSpringBackM:+back.toFixed(2),trafficMaxStepM:+maxStep.toFixed(2),playerMaxStepM:+pStep.toFixed(2),playerBackStepM:+pBack.toFixed(2),dead:!!(A[A.length-1].tc&&A[A.length-1].tc.dead),smash,
   tTrace:A.filter((q,i)=>i%3===0).slice(0,25).map(q=>q.tc&&[+(((q.tc.x-c0.x)*fx+(q.tc.z-c0.z)*fz)).toFixed(2),+(q.v*3.6).toFixed(0),+(((q.x-c0.x)*fx+(q.z-c0.z)*fz)).toFixed(2)])})}
 if(TEST==='shots'){
  // low side view of the player car + a traffic car, and tyre-to-road gaps (player wheels, traffic wheel instances)
  await p.evaluate(()=>{const D=__dbg;if(!D.__ovr){D.__ovr=1;const f=D.composer.render.bind(D.composer);const wrap=(...a)=>{const o=window.__camOv;if(o){D.camera.position.set(o[0],o[1],o[2]);D.camera.lookAt(o[3],o[4],o[5]);D.camera.updateMatrixWorld()}return f(...a)};D.composer.render=wrap;if(window.__fastR)window.__fastR=wrap}});
  const GAP=()=>{const M=__mho,R=M.RO,T=__dbg.THREE,B=new T.Box3(),m4=new T.Matrix4();const out={};
   if(M.pl&&M.pl.mesh){M.pl.mesh.updateMatrixWorld(true);let lo=1e9;M.pl.mesh.traverseVisible(o=>{if(o.isMesh&&o.userData&&o.userData.r&&o.geometry){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();B.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);lo=Math.min(lo,B.min.y)}});out.player=lo<1e8?+(lo-M.gnd(R.x,R.z,R.y+.3)).toFixed(3):null}
   const c=M.HUB.cars[window.__tc];if(c){const im=M.HUB.cim[c.k],w=im&&im.userData.w;if(w){if(!w.geometry.boundingBox)w.geometry.computeBoundingBox();w.getMatrixAt(c.j,m4);B.copy(w.geometry.boundingBox).applyMatrix4(m4);out.traffic=+(B.min.y-M.gnd(c.x,c.z,c.y+.3)).toFixed(3)}}return out};
  const sides=[];
  for(const where of['autobahn','city']){
   if(where==='autobahn'){await place(ST.x,ST.z,ST.h)}
   const sel=await p.evaluate(([where])=>{const M=__mho,R=M.RO,H=M.HUB,N=H.nodes;let j=-1,bd=1e9;(H.cars||[]).forEach((c,i)=>{if(c.dead>0||c.tr)return;const A=N[c.a],B=N[c.b];if(!A||!B)return;if(where==='autobahn'?!(A.ab&&B.ab):(A.ab||B.ab||A.g||B.g))return;const d=Math.hypot(c.x-R.x,c.z-R.z);if(d<bd){bd=d;j=i}});if(j<0)return null;
    const c=H.cars[j];c.v=0;c.cv=0;c.hv=.01;c.route=[];window.__tc=j;const A=N[c.a],B=N[c.b],L=Math.hypot(B.x-A.x,B.z-A.z),ux=(B.x-A.x)/L,uz=(B.z-A.z)/L;return{x:c.x,z:c.z,h:Math.atan2(ux,uz)}},[where]);
   if(!sel){sides.push({where,err:'no car'});continue}
   await place(sel.x-Math.sin(sel.h)*8,sel.z-Math.cos(sel.h)*8,sel.h);await tick(20);
   const gap=await p.evaluate(GAP);
   await p.evaluate(([x,z,h])=>{const M=__mho,R=M.RO,mx=(R.x+x)/2,mz=(R.z+z)/2,g=M.gnd(mx,mz,R.y+.3),sx=Math.cos(h),sz=-Math.sin(h);window.__camOv=[mx+sx*11,g+.9,mz+sz*11,mx,g+.7,mz]},[sel.x,sel.z,sel.h]);
   const old=SHOTS;await (async()=>{await p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1)});await p.screenshot({path:path.join(OUT,`${MODE}_side_${where}.jpg`),type:'jpeg',quality:80});await p.evaluate(()=>{window.__shooting=0;window.__camOv=null;if(!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}})})();
   sides.push({where,gap})}
  res.sides=sides}
 res.errs=errs;fs.writeFileSync(path.join(OUT,`w10_${MODE}.json`),JSON.stringify(res,null,1));
 console.log(JSON.stringify({mode:MODE,sides:res.sides,brake:res.brake.map(({trace,...r})=>r),traffic:res.traffic.map(({tTrace,...r})=>r),errs:errs.slice(0,5)},null,0));await b.close()})().catch(e=>{console.error('ERR',e);process.exit(1)});
