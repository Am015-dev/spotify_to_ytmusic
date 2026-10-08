// tM1.js — plays STORY mission 1 (Hot Drop) from a fresh save the way a person does: phone 852×393, real CDP touch on GAS/◀▶/BRAKE/BOOST/DRIFT,
// follows the on-screen arrow / GPS route, taps through scenes. Logs every frame: position jumps > 3 m (with the JS callsite that set RO.x/z),
// speed (player + Hilde's truck), UNSTUCK, checkpoint resets / fails, NaN. Shots around each teleport.
// usage: node tools/tM1.js <url> <outdir>   env BETA=1 (iframe + claude.use('db') = empty db) · MIN=game minutes (default 9) · SHOTS=0
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const URL=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',OUT=process.argv[3]||'qa23/run';fs.mkdirSync(OUT,{recursive:true});
const BETA=process.env.BETA==='1',MIN=+(process.env.MIN||9),SHOTS=process.env.SHOTS!=='0';
const INIT=`(()=>{if(${BETA}&&window===window.top)return;
 if(${BETA}){const mk=()=>({get:async()=>({exists:false,data:()=>undefined}),set:async()=>{}});const col=()=>({orderBy:()=>col(),limit:()=>col(),get:async()=>({empty:true,docs:[]})});
  window.claude={use:async n=>n==='db'?{doc:mk,collection:col}:null}}
 const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};window.__auto=true;
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}if(window.__mon)try{window.__mon()}catch(e){window.__monErr=String(e)}}return t};
 setInterval(()=>{if(window.__dbg&&!window.__fastR&&!window.__shooting){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
// per-frame monitor. Setter trap on RO.x/RO.z records the callsite of any single assignment that moves the car > 3 m.
const MON=()=>{const M=__mho,R=M.RO;const L=window.__L={f:0,otp:[],ydrop:[],camj:[],tp:[],nan:0,unst:0,cp:[],fail:[],stage:[],vmax:0,vh:{},truck:[],tvmax:0,ring:[],strip:[],act:null};
 let lastSet=null;for(const k of['x','z']){let v=R[k];Object.defineProperty(R,k,{configurable:true,get:()=>v,set:n=>{if(Math.abs(n-v)>3||!isFinite(n)){lastSet={k,from:+v.toFixed(1),to:+(+n).toFixed(1),st:(new Error().stack||'').split('\n').slice(2,6).map(s=>s.trim().replace(/https?:\/\/[^)]*\//,'').slice(0,90))}}v=n}})}
 const sy=window.say;let px=R.x,pz=R.z,pv=0;let tx=null,tz=null;
 const msg=()=>((document.querySelector('#msg')||{}).textContent||'').trim().slice(0,40);let lastMsg='';
 window.__mon=()=>{if(M.state!=='roam')return;L.f++;const v=Math.abs(R.v||0),kmh=v*3.6;
  if(!isFinite(R.x)||!isFinite(R.z)||!isFinite(R.v)||!isFinite(R.y))L.nan++;
  const ch=R.ch;const V=ch&&ch.v2;const si=V?V.si:-1;const S=V&&V.L&&V.L.st[si];const sk=S?si+':'+S.t:'-';
  if(sk!==L.act){L.stage.push({f:L.f,s:sk,x:Math.round(R.x),z:Math.round(R.z)});L.act=sk}
  const m=msg();if(m!==lastMsg){lastMsg=m;if(/UNSTUCK/.test(m))L.unst++;if(/CHECKPOINT|RETRY|FAIL|ESCAPED|GOT AWAY|WRECK/i.test(m))L.cp.push({f:L.f,m})}
  const d=Math.hypot(R.x-px,R.z-pz);const busy=!!(R.card||R.mapOpen||R.story||R.frozen);
  if(d>3&&d>v/60*1.6+1){L.tp.push({f:L.f,d:+d.toFixed(1),from:[Math.round(px),Math.round(pz)],to:[Math.round(R.x),Math.round(R.z)],kmh:Math.round(kmh),stage:sk,busy,msg:m,cs:!!(window.__m1&&__m1.cs()),set:lastSet,fade:!!document.querySelector("#warpFade.on")})}
  lastSet=null;px=R.x;pz=R.z;
  if(L.py!=null&&L.py-R.y>3)L.ydrop.push({f:L.f,from:+L.py.toFixed(1),to:+R.y.toFixed(1),stage:sk,cs:!!(window.__m1&&__m1.cs()),fade:!!document.querySelector('#warpFade.on')});L.py=R.y;
  const cam=window.__dbg&&__dbg.camera;if(cam){const cp=cam.position;if(L.cp0){const j=Math.hypot(cp.x-L.cp0[0],cp.z-L.cp0[1],cp.y-L.cp0[2]);if(j>8&&L.camj.length<40)L.camj.push({f:L.f,d:+j.toFixed(1),stage:sk,cs:!!(window.__m1&&__m1.cs()),fade:!!document.querySelector('#warpFade.on')})}L.cp0=[cp.x,cp.z,cp.y]}
  const gs=window.__m1?__m1.goons():[];const G1={};for(const g of gs){const o=L.gp&&L.gp[g.id];if(o){const j=Math.hypot(g.x-o[0],g.z-o[1]);if(j>4&&L.otp.length<60)L.otp.push({f:L.f,who:g.k+g.id,d:+j.toFixed(1),distToCar:Math.round(Math.hypot(g.x-R.x,g.z-R.z)),onScreen:(()=>{if(!cam)return null;const T=__dbg.THREE;const v=new T.Vector3(g.x,R.y+1,g.z).project(cam);return Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z<1})(),stage:sk})}G1[g.id]=[g.x,g.z]}L.gp=G1;
  if(S&&S.t==='follow'&&S.vx!=null&&tx!=null){const j=Math.hypot(S.vx-tx,S.vz-tz);if(j>4)L.otp.push({f:L.f,who:'truck',d:+j.toFixed(1),stage:sk})}
  if(S&&S.t==='thieves'&&L.f%30===0){(L.th=L.th||[]).push([L.f,...gs.map(g=>Math.round(Math.hypot(g.x-R.x,g.z-R.z)))])}
  if(!busy&&ch){L.vmax=Math.max(L.vmax,kmh);const b=Math.min(20,Math.floor(kmh/10));L.vh[b*10]=(L.vh[b*10]||0)+1}
  if(S&&(S.t==='follow')&&S.vx!=null){if(tx!=null){const tv=Math.hypot(S.vx-tx,S.vz-tz)*60*3.6;L.tvmax=Math.max(L.tvmax,tv);if(L.f%30===0)L.truck.push([L.f,Math.round(tv),Math.round(kmh),Math.round(Math.hypot(S.vx-R.x,S.vz-R.z))])}tx=S.vx;tz=S.vz}else{tx=tz=null}
  if(L.f%60===0)L.strip.push([L.f,Math.round(R.x),Math.round(R.z),Math.round(kmh),sk]);if(L.strip.length>400)L.strip.shift();
 }};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await ctx.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);
 const pageUrl=BETA?URL.replace(/[^/]*$/,'iframe852.html'):URL;await p.goto(pageUrl);
 const G=()=>BETA?p.frames().find(f=>f!==p.mainFrame()):p.mainFrame();
 const E=(fn,a)=>G().evaluate(fn,a);
 const waitMenu=async()=>{for(let i=0;i<300;i++){try{if(await E(()=>window.__mho&&__mho.state==='menu'))return}catch(e){}await p.waitForTimeout(1000)}throw new Error('no menu')};
 await waitMenu();await E(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});
 if(BETA)await E(()=>location.reload());else await p.reload();await p.waitForTimeout(1500);await waitMenu();
 const tick=n=>E(n=>__tick(n),n);
 const shot=async name=>{if(!SHOTS)return;await E(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1)});await p.screenshot({path:path.join(OUT,name+'.jpg'),type:'jpeg',quality:62});await E(()=>{window.__shooting=0;if(!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}})};
 const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
 const center=sel=>E(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width<4||cs.display==='none'||cs.visibility==='hidden')return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
 const down=async(n,xy)=>{if(!xy)return;if(F[n])await up(n);let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[n]={x:xy[0],y:xy[1],id};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()})};
 const move=async(n,xy)=>{if(!F[n]||!xy)return;F[n].x=xy[0];F[n].y=xy[1];await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:pts()})};
 const up=async n=>{if(!F[n])return;delete F[n];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length){await p.waitForTimeout(440);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})}};
 const tap=async sel=>{const xy=await center(sel);if(!xy)return false;await down('tap',xy);await tick(4);await up('tap');await tick(4);return true};
 const ctl={steer:0,gas:false,brake:false,drift:false,boost:false};let brkReal=0;
 async function apply(c){if(c.gas!==ctl.gas){c.gas?await down('gas',await center('#tG')):await up('gas')}
  if(c.steer!==ctl.steer){if(!c.steer)await up('st');else{const xy=await center(c.steer<0?'#tL':'#tR');if(F.st)await move('st',xy);else await down('st',xy)}}
  for(const[k,s]of[['brake','#tB'],['drift','#tD'],['boost','#tN']])if(c[k]!==ctl[k]){if(c[k]&&k==='brake'){const w=420-(Date.now()-brkReal);if(w>0)await p.waitForTimeout(w);brkReal=Date.now()}c[k]?await down(k,await center(s)):await up(k)}Object.assign(ctl,c)}
 const releaseAll=()=>apply({steer:0,gas:false,brake:false,drift:false,boost:false});
 const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','.m1go','#resBtn','#tutSkip'];
 const tapThrough=async()=>{for(const s of CONT)if(await tap(s))return s;return null};
 await tap('#hcStory');await tick(10);await tap('#slotList .go');
 for(let i=0;i<150;i++){try{if(await E(()=>window.__mho&&__mho.state==='roam'))break}catch(e){}await p.waitForTimeout(2000)}await E(()=>{window.__auto=false});
 await E(MON);await shot('00_roam');
 const rng=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(17);let f=0,route=null,routeT=-1e9,dest=null,wob=0,brakeUntil=-1,lastBrake=-1e9,boostT=-1e9,driftT=-1e9,stuckT=0,revT=-1e9,lagged=[],tpSeen=0,tpShots=0,started=false,ended=null,stShot={},lastNext=-1e9;const frames=MIN*3600;const T0=Date.now();
 while(f<frames){
  const s=await E(()=>{const M=__mho,R=M.RO;const a=document.querySelector('#roamArrow');let arr=null;if(a&&!a.hidden){const m=/rotate\((-?[\d.]+)rad/.exec(a.querySelector('i').style.transform||''),d=/([\d.]+)\s*m\s*$/.exec(a.querySelector('span').textContent||'');if(m&&d){const ang=-(+m[1])+R.h,D=+d[1];arr={x:R.x+Math.sin(ang)*D,z:R.z+Math.cos(ang)*D,d:D}}}
   const n=document.querySelector('#m1Next');const h=window.__m1&&__m1.hint();const r=document.querySelector('#chRes');
   return{x:R.x,z:R.z,h:R.h,v:R.v,y:R.y,wp:R.wp&&{x:R.wp.x,z:R.wp.z},busy:!!(R.card||R.mapOpen||R.story||R.frozen),ch:!!R.ch,arr,hint:h&&h.x!=null?{x:h.x,z:h.z,mode:h.mode}:null,nextVis:!!n&&!n.hidden&&n.getBoundingClientRect().width>20,state:M.state,tp:__L.tp.length,stage:__L.act,res:r&&!r.hidden?r.textContent.trim().slice(0,80):null}});
  if(s.tp>tpSeen){tpSeen=s.tp;if(tpShots<6){tpShots++;await shot(`tp${tpShots}_a`);await tick(20);f+=20;await shot(`tp${tpShots}_b`)}}
  if(s.ch)started=true;if(started&&!s.ch&&!ended){ended={f,res:s.res};await shot('zz_result');console.log('MISSION END',f,s.res);break}
  if(s.stage&&!stShot[s.stage]&&s.ch&&!s.busy){stShot[s.stage]=f;await tick(90);f+=90;await shot('st_'+s.stage.replace(/\W/g,'_'))}
  if(s.state!=='roam'||s.busy){await releaseAll();const t=await tapThrough();await tick(t?6:30);f+=t?6:30;continue}
  if(!s.ch&&s.nextVis&&f-lastNext>300){lastNext=f;await tap('#m1Next');await tick(10);f+=10;continue}
  const goal=s.arr||s.wp;if(goal&&(!dest||Math.hypot(goal.x-dest[0],goal.z-dest[1])>25)){dest=[goal.x,goal.z];route=null}
  if(!dest){await tick(6);f+=6;continue}
  if(!route||f-routeT>360){routeT=f;route=await E(([x0,z0,x1,z1])=>{try{const M=__mho,q=M.rsnap(x1,z1,400);const P=M.qv.path(x0,z0,q[0],q[1]).P;return P&&P.length>1?P:null}catch(e){return null}},[s.x,s.z,dest[0],dest[1]]);if(!route){route=[[s.x,s.z],dest]}}
  let los=false;const dD0=Math.hypot(dest[0]-s.x,dest[1]-s.z);if(dD0<250)los=await E(([x0,z0,x1,z1,y])=>{const L=Math.hypot(x1-x0,z1-z0);for(let d=3;d<L;d+=4){const x=x0+(x1-x0)*d/L,z=z0+(z1-z0)*d/L;if(__mho.roamHitAt(x,z,1.4,y+.5))return false}return true},[s.x,s.z,dest[0],dest[1],s.y]);
  lagged.push(s);if(lagged.length>3)lagged.shift();const o=lagged[0];
  let bi=0,bd=1e9;for(let k=0;k<route.length;k++){const d=Math.hypot(route[k][0]-o.x,route[k][1]-o.z);if(d<bd){bd=d;bi=k}}if(bd>30&&f-routeT>120&&!los)route=null;if(!route){await tick(6);f+=6;continue}
  let k=bi,acc=0;const look=9+Math.abs(o.v)*.4;while(k<route.length-1&&acc<look){acc+=Math.hypot(route[k+1][0]-route[k][0],route[k+1][1]-route[k][1]);k++}
  let tx=route[k][0],tz=route[k][1];const dD=Math.hypot(dest[0]-o.x,dest[1]-o.z);if(los||dD<40){tx=dest[0];tz=dest[1]}
  let a=Math.atan2(tx-o.x,tz-o.z)-o.h;a=Math.atan2(Math.sin(a),Math.cos(a));wob+=(rng()-.5)*.08-wob*.05;wob=Math.max(-.26,Math.min(.26,wob));const ae=a+wob*Math.min(1,Math.abs(o.v)/15);
  let k2=bi,a2=0;acc=0;const cl=Math.max(40,Math.abs(o.v)*1.6);while(k2<route.length-1&&acc<cl){acc+=Math.hypot(route[k2+1][0]-route[k2][0],route[k2+1][1]-route[k2][1]);k2++}if(k2>bi+1){const h1=Math.atan2(route[k2][0]-route[bi][0],route[k2][1]-route[bi][1]);a2=Math.abs(Math.atan2(Math.sin(h1-o.h),Math.cos(h1-o.h)))}
  const c={steer:ae>.13?-1:ae<-.13?1:0,gas:true,brake:false,drift:false,boost:false};if(o.v<0)c.steer=-c.steer;
  let wantB=false;if(Math.abs(ae)>.7&&o.v>14){c.gas=false;wantB=true}else if(a2>.9&&o.v>20){c.gas=false;if(o.v>32)wantB=true}
  if(wantB&&(ctl.brake||f-lastBrake>60))brakeUntil=Math.max(brakeUntil,f+18);if(f<brakeUntil){c.brake=true;lastBrake=f}
  if(Math.abs(ae)<.08&&a2<.2&&o.v>12&&o.v<45&&f-boostT>600)boostT=f;if(f-boostT<90)c.boost=true;
  if(s.hint&&s.hint.mode==='drift'&&o.v>15){c.drift=true;c.steer=-1}
  if(Math.abs(s.v)<1.4)stuckT+=6;else stuckT=0;if(stuckT>90&&f>revT+150){revT=f;stuckT=0}if(f-revT<72){c.gas=false;c.brake=true;c.boost=false;c.drift=false;c.steer=ae>0?1:-1}
  await apply(c);await tick(6);f+=6;
  if(f%1800<6)console.log('t',Math.round(f/60),'s',JSON.stringify(await E(()=>({st:__L.act,tp:__L.tp.length,vmax:Math.round(__L.vmax),tv:Math.round(__L.tvmax),x:Math.round(__mho.RO.x),z:Math.round(__mho.RO.z)}))),Math.round((Date.now()-T0)/1000)+'s wall');
 }
 await releaseAll();const L=await E(()=>__L);L.errs=errs;L.ended=ended;L.gameSec=Math.round(f/60);L.beta=BETA;L.tune=await E(()=>{try{return{src:typeof TU!=='undefined'?TU.src:null}}catch(e){return null}});
 L.strip=L.strip.slice(-60);fs.writeFileSync(path.join(OUT,'log.json'),JSON.stringify(L,null,0));
 console.log('RESULT',JSON.stringify({otp:L.otp.length,ydrop:L.ydrop,camj:L.camj.length,beta:BETA,end:ended,gameSec:L.gameSec,teleports:L.tp.length,nan:L.nan,unstuck:L.unst,cp:L.cp,vmax:Math.round(L.vmax),truckMax:Math.round(L.tvmax),vh:L.vh,stages:L.stage,errs:errs.slice(0,6)}));
 for(const t of L.tp.slice(0,15))console.log('TP',JSON.stringify(t));for(const t of L.otp.slice(0,20))console.log('OTP',JSON.stringify(t));for(const t of L.camj.slice(0,20))console.log('CAMJ',JSON.stringify(t));
 await b.close()})().catch(e=>{console.error('ERR',e);process.exit(1)});
