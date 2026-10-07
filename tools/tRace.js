// tRace.js — real-input race gate (phone 852×393 touch or desktop keys). A person taps RACE → circuit → START RACE, holds GAS,
// steers with ◀ ▶ toward a chosen line (items, shortcut entries, centre) with a reaction delay and wobble, taps BOOST on
// straights with a full meter and taps the ITEM button (#tF) 0.5–2 s after picking an item. No warps, no state writes.
// Time is frame-stepped like tPlay (60 frames per game second) so numbers are the same on a slow software-GL box.
// usage: node tools/tRace.js <url local_dbg.html> [outdir]   env TRACK=grand|hafen|… (menu circuit index or id) CITY=fra|ath
//   LAPS=1 (laps to drive, then stop) MAXMIN=6 · MODE=phone|desk · SHOTS=1 · TAG=name prefix for shots
// prints one JSON line RACE_RESULT {...}: lapTimes, avgKmh, topKmh, wallHits/min, transforms, shortcuts, items picked/used, place, errors, fps
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const URL0=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',URL=URL0+(/[?&]fast=1/.test(URL0)?'':(URL0.includes('?')?'&':'?')+'fast=1'),OUT=process.argv[3]||'qa_race';fs.mkdirSync(OUT,{recursive:true});
const PRB=require('./r17probe.js'),R17=process.env.R17!=='0';const TRACK=process.env.TRACK||'grand',CITY=process.env.CITY||'fra',LAPS=+(process.env.LAPS||1),MAXMIN=+(process.env.MAXMIN||6),MODE=process.env.MODE||'phone',SHOTS=process.env.SHOTS!=='0',TAG=process.env.TAG||'';
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 setInterval(()=>{if(window.__dbg&&!window.__fastR&&!window.__shooting){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
// in-page race probe (read-only)
const ST=`(()=>{const E=__oc.ev;return E('(()=>{const s=pl;if(!s)return {state};const f=frameAt(TD,s.dist,mkF());return {state,raceT,dist:s.dist,L:TD.L,lap:s.lap,laps:RC.laps,x:s.x,M:MARGIN,W,v:s.v,top0:s.stats.top0,wall:s.wall,item:s.item,bm:s.bm,place:s.place,n:ships.length,terr:s.terrain||"road",route:s.rtId||"",fin:s.finished,laps_:s.laps.slice(),k:kAt(TD,s.dist+60),ka:[30,50,70,90,110,130,150].reduce((a,d)=>a+kAt(TD,s.dist+d),0)/7,pads:pads.filter(p=>p.type==="item"&&(!p.cd||p.cd<=0)).map(p=>[tdd(p.s,s.dist),p.x]).filter(a=>a[0]>10&&a[0]<160).slice(0,4),B:(typeof R15_b==="function"?R15_b(s,s.x):null),gap:Math.round(Math.max(...ships.filter(o=>o!==s).map(o=>o.dist))-s.dist),rts:(window.__rt15?__rt15(s):null),yaw:s.yaw,beta:s.beta,hold:s.holdX,yr:s.yawRate,dead:s.dead,web:(s.webT||0)>0,cam:camera.fov}})()')})()`;
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const phone=MODE==='phone';const ctx=await b.newContext(phone?{viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900}});
 const p=await ctx.newPage();p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.addInitScript(INIT);if(process.env.DIAG)await p.addInitScript('window.__r17diag=1');const cdp=await ctx.newCDPSession(p);
 let SYN=Date.now()/1000;{const s0=cdp.send.bind(cdp);cdp.send=(m,o)=>s0(m,m==='Input.dispatchTouchEvent'?{...o,timestamp:SYN}:o)}
 const pl_air=s=>false;const tick=n=>{SYN+=n/60;return p.evaluate(n=>__tick(n),n)};
 const shot=async name=>{if(!SHOTS)return;await hq(1);await p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1)});await p.screenshot({path:path.join(OUT,`${TAG}${MODE}_${name}.jpg`),type:'jpeg',quality:70});await hq(0);await p.evaluate(()=>{window.__shooting=0;if(!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}})};
 const shotCam=async(name,code)=>{await hq(1);await p.evaluate(code=>{window.__shooting=1;const r=window.__fastR||__dbg.composer.render;window.__fastR=null;window.__r17r=r;__dbg.composer.render=function(){try{__oc.ev(code)}catch(e){console.warn('cam',e)}return r.apply(this,arguments)};__tick(1)},code);
  await p.screenshot({path:path.join(OUT,`${TAG}${MODE}_${name}.jpg`),type:'jpeg',quality:75});await hq(0);await p.evaluate(()=>{__dbg.composer.render=()=>{};window.__fastR=window.__r17r;window.__shooting=0})};
 const XS=process.env.R17SHOTS==='1',X={log:[]};
 const HQ=process.env.HQ==='1',hq=on=>HQ?p.evaluate(on=>{if(!window.__fast)return;__fast.W=on?852:426;__fast.H=on?393:196;__oc.ev('resize()')},on):0;
 const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
 const center=sel=>p.evaluate(s=>{const e=typeof s==='string'?document.querySelector(s):null;if(!e)return null;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width<4||cs.display==='none'||cs.visibility==='hidden')return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
 const down=async(name,xy)=>{if(!xy)return false;if(F[name])await up(name);let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[name]={x:xy[0],y:xy[1],id};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()});return true};
 const move=async(name,xy)=>{if(!F[name]||!xy)return;F[name].x=xy[0];F[name].y=xy[1];await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:pts()})};
 const up=async name=>{if(!F[name])return;delete F[name];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length){SYN+=.44;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})}};
 const tapXY=async xy=>{if(!xy)return false;if(phone){await down('tap',xy);await tick(4);await up('tap')}else await p.mouse.click(xy[0],xy[1]);await tick(2);return true};
 const tap=async sel=>tapXY(await center(sel));
 const KD={};const key=async(k,on)=>{if(!!KD[k]===on)return;KD[k]=on;on?await p.keyboard.down(k):await p.keyboard.up(k)};
 const ctl={steer:0,gas:false,boost:false};
 async function apply(c){if(phone){if(c.gas!==ctl.gas){c.gas?await down('gas',await center('#tG')):await up('gas')}
   if(c.steer!==ctl.steer){if(!c.steer)await up('st');else{const xy=await center(c.steer<0?'#tL':'#tR');if(F.st)await move('st',xy);else await down('st',xy)}}
   if(c.boost!==ctl.boost){c.boost?await down('boost',await center('#tN')):await up('boost')}if(!!c.brake!==!!ctl.brake){c.brake?await down('brake',await center('#tB')):await up('brake')}}
  else{await key('ArrowUp',c.gas);await key('ArrowLeft',c.steer<0);await key('ArrowRight',c.steer>0);await key('Shift',c.boost)}Object.assign(ctl,c)}
 const T0=Date.now();let scQ=[],gaps=[],ptrace=[],perfMid=null,perfS=[],perfNext=10;const measure=async()=>{const t0=Date.now();const o=await p.evaluate(()=>{const r=__dbg.renderer,gl=r.getContext(),px=new Uint8Array(4);window.__shooting=1;__dbg.composer.render=window.__fastR||__dbg.composer.render;window.__fastR=null;
   r.info.autoReset=false;r.info.reset();for(let i=0;i<5;i++){if(window.__fast)__fast.force=1;__tick(1)}gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);r.info.autoReset=true;
   const i=r.info.render;const o={calls:Math.round(i.calls/5),tris:Math.round(i.triangles/5)};window.__shooting=0;window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{};return o});SYN+=5/60;o.ms=+((Date.now()-t0)/5).toFixed(1);return o};
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(()=>{localStorage.setItem('mho_prof@1',JSON.stringify({xp:40000}))});
 // menu: RACE → city tab → circuit card → START RACE (taps)
 await tap('[data-a="quick"]');await p.waitForTimeout(300);await tick(10);
 await tapXY(await p.evaluate(c=>{const e=[...document.querySelectorAll('[data-c]')].find(x=>x.dataset.c===c&&x.offsetParent);if(!e)return null;const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]},CITY));await tick(10);
 const card=await p.evaluate(t=>{const ids=__oc.ev('[...TDF,...(typeof ATH_TRACKS!=="undefined"?ATH_TRACKS:[])].map(d=>[d.id,d.short||d.name])');const want=(ids.find(a=>a[0]===t)||[])[1]||t;
   const e=[...document.querySelectorAll('#menu *')].filter(x=>x.offsetParent&&x.children.length&&x.textContent.trim().startsWith(want)).pop();if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]},TRACK);
 await tapXY(card);await tick(10);
 const sb=await p.evaluate(()=>{const e=document.querySelector('#startBtn');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});await tapXY(sb);
 for(let i=0;i<200;i++){const s=await p.evaluate(()=>__mho.state);if(s==='countdown'||s==='race')break;await tick(15)}
 await p.evaluate(()=>{window.__auto=false});
 const trk=await p.evaluate(()=>__oc.ev('TRK.id+"|"+TRK.name+"|"+TD.L.toFixed(0)+"|W="+W.toFixed(1)'));
 await shot('start');
 if(XS){await shotCam('grid_front',`{const f=frameAt(TD,pl.dist,mkF());const P=pl.mesh.position;camera.position.copy(P).addScaledVector(f.t,24).addScaledVector(f.u,10);camera.lookAt(P.clone().addScaledVector(f.t,-26));camera.updateMatrixWorld()}`);
  await shotCam('grid_back',`{const f=frameAt(TD,pl.dist,mkF());const P=pl.mesh.position;camera.position.copy(P).addScaledVector(f.t,-75).addScaledVector(f.u,15);camera.lookAt(P.clone().addScaledVector(f.t,-18));camera.updateMatrixWorld()}`);
  X.apex=await p.evaluate(()=>__oc.ev('(()=>{let b=0,bs=0;for(let d=0;d<TD.L;d+=4){const k=Math.abs(kAt(TD,d));if(k>b){b=k;bs=d}}return [bs,b]})()'));X.log.push('apex '+JSON.stringify(X.apex))}
 // countdown: hold GAS from the lights (a person presses as it counts down)
 await apply({gas:true,steer:0,boost:false});
 const rng=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(7);
 let pack={},prevOrd=null,overtakes=0,prevMe=null,plChanges=0,wallMin=[],wallAll=[],tyreR={},aiTyre=[];let f=0,frames=MAXMIN*3600,lapsDone=0,spd=[],top=0,wallHits=0,wasWall=false,terr='road',transforms=0,routes=new Set(),picked=0,used=0,lastItem=null,useAt=-1,shots={mid:0,short:0,item:0,boost:0},target=0,tgtT=0,react=[],wob=0,boostT=0,prevLap=-1,lapStart=null,lapTimes=[],raceSec=0,raceStart=null,stuck=0;
 const STEP=6;
 while(f<frames){await tick(STEP);f+=STEP;const s=await p.evaluate(ST);if(!s||s.state==='results'||s.fin)break;if(s.state!=='race')continue;
  if(raceStart===null)raceStart=s.raceT;
  if(R17){const pk=await p.evaluate(PRB.PACK),rt=s.raceT-raceStart,act=pk.filter(q=>!q[2]),ds=act.map(q=>q[1]);if(ds.length>1){const sp=Math.max(...ds)-Math.min(...ds);for(const m of[15,30,60,90])if(rt>=m&&pack['t'+m]==null)pack['t'+m]=Math.round(sp);
    const ord=act.slice().sort((a,b)=>b[1]-a[1]).map(q=>q[0]);if(prevOrd&&!(X.br)){const pos={};prevOrd.forEach((id,i)=>pos[id]=i);for(let i=0;i<ord.length;i++)for(let j=i+1;j<ord.length;j++)if(pos[ord[i]]!=null&&pos[ord[j]]!=null&&pos[ord[i]]>pos[ord[j]])overtakes++;const me=ord.indexOf(pk.find(q=>q[3])[0]);if(prevMe!=null&&me!==prevMe)plChanges++;prevMe=me}prevOrd=ord}
   if(f%30===0||f%30<STEP){const c=(await p.evaluate(PRB.CLEAR('pl')))[0];if(c&&process.env.DIAG&&c.g&&Math.min(...c.g.filter(v=>v!=null))<-.08)console.log('DIAG',(s.raceT-raceStart).toFixed(1),JSON.stringify(c));if(c){const lp=s.laps_.length;if(Number.isFinite(c.wall)){wallMin[lp]=Math.min(wallMin[lp]??99,c.wall);wallAll.push(c.wall)}if(!c.air&&c.g)for(const g of c.g)if(g!=null)(tyreR[c.terr+(c.mode==='hull'?'_hull':'')]||(tyreR[c.terr+(c.mode==='hull'?'_hull':'')]=[])).push(g)}}}
  const kmh=s.v*3.6;spd.push(kmh);top=Math.max(top,kmh);if(kmh<10&&s.raceT>3)stuck+=STEP/60;
  const w=s.wall>0;if(w&&!wasWall){wallHits++;if(process.env.DBGW)console.log('WALL',s.raceT.toFixed(1),'x',s.x.toFixed(1),'B',s.B&&s.B.map(v=>v.toFixed(1)),JSON.stringify(s.rts),s.terr,Math.round(kmh))}wasWall=w;
  if(s.terr!==terr){transforms++;terr=s.terr}
  if(s.rts&&s.rts.in)routes.add(s.rts.in);
  if(s.item&&s.item!==lastItem){picked++;useAt=s.raceT+.5+rng()*1.5}lastItem=s.item;
  if(s.item&&useAt>0&&s.raceT>=useAt){useAt=-1;if(await tap(phone?'#tF':'#tF')||(!phone&&(await p.keyboard.press('Space'),1))){used++;if(shots.item<1){shots.item++;await tick(8);await shot('item_use')}}}
  // choose a line like a person: an item box ahead, a marked shortcut entry ahead (rts from the game's own signs), else hold
  if(s.raceT>=tgtT){tgtT=s.raceT+.35+rng()*.3;let t=null;
   if(process.env.NOSC){}else if(s.rts&&s.rts.in&&Math.abs(s.x)>Math.abs(s.rts.want)-12)t=null;else if(s.rts&&s.rts.want!=null)t=s.rts.want;else if(!s.item&&s.pads.length&&s.pads[0][0]<90){t=s.pads[0][1]}else t=Math.max(-(s.M-3),Math.min(s.M-3,s.ka*3200))
   wob=(rng()-.5)*2*Math.min(3,s.W*.08);react.push(t==null?null:t+wob)}
  const tgt=react.length>1?react.shift():react[0];
  if(process.env.DBG&&s.rts)console.log('DBG',s.raceT.toFixed(1),JSON.stringify(s.rts),'x',s.x.toFixed(1),'tgt',tgt==null?null:tgt.toFixed(1),'B',s.B&&s.B.map(v=>v.toFixed(1)),s.terr,Math.round(s.v*3.6),'yaw',s.yaw.toFixed(3),'beta',s.beta.toFixed(3),'hold',s.hold&&s.hold.toFixed(1),'k',s.k.toFixed(4));
  let brk=false,force=null;if(XS){const rt=s.raceT-raceStart;
   // corner strip: 3 frames at apex-70 m, apex, apex+70 m (the track's tightest corner)
   if(X.apex){for(const [o,nm] of [[-70,'a_entry'],[0,'b_apex'],[70,'c_exit']]){const dd=((X.apex[0]+o-s.dist)%s.L+s.L)%s.L;if(!X[nm]&&dd<s.v*STEP/60*1.2&&s.lap>=0){X[nm]=1;const c=await p.evaluate(()=>__oc.ev('(()=>{const f=frameAt(TD,pl.dist,mkF());const cd=camera.getWorldDirection(new THREE.Vector3());const ang=v=>Math.atan2(v.dot(f.r),v.dot(f.t))*57.3;const md=new THREE.Vector3(0,0,1).transformDirection(pl.mesh.matrixWorld);return {kmh:Math.round(pl.v*3.6),beta:+(pl.beta*57.3).toFixed(1),yaw:+(pl.yaw*57.3).toFixed(1),car:+ang(md).toFixed(1),cam:+ang(cd).toFixed(1),x:+pl.x.toFixed(1),k:+(1/Math.max(1e-6,Math.abs(kAt(TD,pl.dist)))).toFixed(0)}})()'));X.log.push('corner '+nm+' '+JSON.stringify(c));await shot('corner_'+nm)}}}
   // beside an opponent: chase view + a low side view of both cars
   if(!X.side&&rt>20){const nb=await p.evaluate(()=>__oc.ev('(()=>{const o=ships.filter(q=>q!==pl&&!q.eliminated&&!q.air).map(q=>[q,tdd(q.dist,pl.dist)]).filter(a=>Math.abs(a[1])<9).sort((a,b)=>Math.abs(a[1])-Math.abs(b[1]))[0];return o?{i:ships.indexOf(o[0]),dd:o[1],x:o[0].x}:null})()'));
    if(nb&&!pl_air(s)){X.side=1;await shot('beside_ai');await shotCam('side_low',`{const o=ships[${nb.i}];const f=frameAt(TD,(pl.dist+o.dist)/2,mkF());const xs=[pl.x,o.x],hi=Math.max(...xs),lo=Math.min(...xs);const cx=(HALF-1-hi)>(lo+HALF-1)?Math.min(HALF-1,hi+10):Math.max(-HALF+1,lo-10);const m=pl.mesh.position.clone().add(o.mesh.position).multiplyScalar(.5);const P=f.p.clone().addScaledVector(f.r,cx);P.y=m.y+.55;camera.position.copy(P);camera.lookAt(m.x,m.y+.5,m.z);camera.updateMatrixWorld()}`);X.log.push('side '+JSON.stringify(nb))}}
   // WEB hit on the player from the racer right behind (the game's own item code), shots 0.3 s and 2.2 s later
   if(!X.web&&rt>50&&!s.rts?.in){X.web=rt;X.log.push('web '+await p.evaluate(()=>__oc.ev('(()=>{const o=ships.filter(q=>q!==pl&&!q.eliminated&&!q.finished).map(q=>[q,tdd(pl.dist,q.dist)]).filter(a=>a[1]>0).sort((a,b)=>a[1]-b[1])[0];if(!o)return "none";o[0].item="web";useItem(o[0]);return "from "+Math.round(o[1])+" m, webT "+pl.webT})()')))}
   if(X.web&&!X.w1&&rt>X.web+.3){X.w1=1;await shot('web_hit_0.3s')}if(X.web&&!X.w2&&rt>X.web+2.2){X.w2=1;await shot('web_hit_2.2s')}
   // racing-line assist: 1.5 s hands-off, then 1.0 s steering away from the centre; heading/x logged every 0.25 s
   if(!X.as&&rt>32&&Math.abs(s.k)<1/1500&&!s.rts?.in&&!s.rts?.mouth){X.as={t0:rt,x0:s.x,away:s.x>=0?1:-1,log:[]}}
   if(X.as&&!X.as.done){const a=X.as,dt=rt-a.t0;if(dt<2.5){force=dt<1.5?0:a.away;if(!a.lt||rt-a.lt>=.25){a.lt=rt;a.log.push([+dt.toFixed(2),force,+s.x.toFixed(2),+(s.yaw*57.3).toFixed(2),Math.round(s.v*3.6)])}}else{a.done=1;X.log.push('assist '+JSON.stringify(a.log))}}
   // hard brake from top speed on a straight after 75 s
   if(!X.br&&rt>75&&Math.abs(s.k)<1/1500&&s.v*3.6>200){X.br={t0:rt,d0:s.dist,v0:Math.round(s.v*3.6),sh:0,trace:[]}}
   if(X.br&&!X.br.done){const b=X.br,dt=rt-b.t0;brk=true;if(b.sh<3&&dt>=b.sh*.5){b.sh++;await shot('brake_'+(b.sh-1)*.5+'s')}if(!b.lt||rt-b.lt>=.25){b.lt=rt;b.trace.push([+dt.toFixed(2),Math.round(s.v*3.6)])}if(s.v*3.6<=100&&b.d100==null)b.d100=Math.round(s.dist-b.d0);if(s.v<1||dt>12){b.done=1;b.dStop=Math.round(s.dist-b.d0);b.tStop=+dt.toFixed(2);X.log.push('brake '+JSON.stringify(b))}}}
  let st=0;if(tgt!=null){const e=tgt-s.x;if(Math.abs(e)>1.6)st=Math.sign(e)}
  // boost on a straight with >50 % meter for ~1.5 s
  let bo=false;if(s.bm>50&&Math.abs(s.k)<1/900&&s.raceT>boostT){boostT=s.raceT+6;}if(s.raceT<boostT-4.5&&s.bm>5)bo=true;
  if(force!=null)st=force;if(brk){st=0;bo=false}
  await apply({gas:!brk,steer:st,boost:bo,brake:brk});
  if(bo&&!shots.boost){shots.boost=1;await shot('boost')}
  if(s.rts&&s.rts.next&&s.rts.dd<110&&s.rts.dd>60&&!shots['sign_'+s.rts.next]&&!s.web){shots['sign_'+s.rts.next]=1;await shot('sign_'+s.rts.next)}
  if(s.rts&&s.rts.next&&s.rts.dd<175&&s.rts.dd>140&&!shots['sign2_'+s.rts.next]&&!s.web){shots['sign2_'+s.rts.next]=1;await shot('signfar_'+s.rts.next)}
  if(s.rts&&s.rts.in&&!shots['sc_'+s.rts.in]&&!s.web){shots['sc_'+s.rts.in]=1;scQ.push([s.raceT+.7,'shortcut_'+s.rts.in],[s.raceT+2.2,'shortcut2_'+s.rts.in])}
  while(scQ.length&&s.raceT>=scQ[0][0]){const q=scQ.shift();await shot(q[1])}
  lapTimes=s.laps_.map(x=>+x.toFixed(2));if(lapTimes.length>=LAPS)break;
  if(s.raceT-raceStart>perfNext){perfNext+=10;ptrace.push(s.place+'@'+Math.round(kmh)+(s.terr[0])+'g'+s.gap);perfS.push(await measure());if(R17){const cc=await p.evaluate(PRB.CLEAR('all'));aiTyre.push(cc.map(c=>c&&{t:c.terr,m:c.mode,g:c.g,gp:c.gp,kmh:c.kmh}))}gaps.push(await p.evaluate(()=>__oc.ev('(()=>{const s=pl;if(!s||s.air||s.dead>0)return null;s.mesh.updateMatrixWorld(true);const b=new THREE.Box3(),bb=new THREE.Box3();const vis=o=>{for(let a=o;a;a=a.parent)if(!a.visible)return false;return true};s.mesh.traverse(o=>{if(o.isMesh&&vis(o)&&o.geometry&&!(o.material&&o.material.transparent)){o.geometry.computeBoundingBox();bb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);b.union(bb)}});const f=frameAt(TD,s.dist,mkF());const c=b.getCenter(V3());const rel=c.clone().sub(f.p);const lat=rel.dot(f.r);const y=f.p.y+f.r.y*lat+f.t.y*rel.dot(f.t);return +(b.min.y-y).toFixed(3)})()')))}if(!shots.box&&s.pads.length&&s.pads[0][0]>35&&s.pads[0][0]<60&&!s.web){shots.box=1;if(process.env.DBGX)console.log('X',await p.evaluate(c=>__oc.ev(c),process.env.DBGX));await shot('items_ahead');if(process.env.DBGI)console.log('BOX',JSON.stringify(await p.evaluate(()=>window.__r15box&&__r15box())))}if(!shots.mid&&s.raceT-raceStart>40){shots.mid=1;await shot('mid')}
  raceSec=s.raceT-raceStart}
 const s=await p.evaluate(ST);await shot('end');
 // fps: real render cost of 40 frames at this spot (fast mode renders 426×196; same for live and candidate)
 const perf=perfS.length?{ms:+(perfS.reduce((a,b)=>a+b.ms,0)/perfS.length).toFixed(2),n:perfS.length,calls:Math.round(perfS.reduce((a,b)=>a+b.calls,0)/perfS.length),tris:Math.round(perfS.reduce((a,b)=>a+b.tris,0)/perfS.length)}:null;
 const avg=spd.length?spd.reduce((a,b)=>a+b,0)/spd.length:0;
 const R={track:trk,mode:MODE,lapTimes,raceSec:+raceSec.toFixed(1),avgKmh:+avg.toFixed(1),topKmh:+top.toFixed(1),wallHits,wallPerMin:+(wallHits/Math.max(.1,raceSec/60)).toFixed(2),transforms,routes:[...routes],itemsPicked:picked,itemsUsed:used,place:s.place+'/'+s.n,stuckSec:+stuck.toFixed(1),ptrace,tyreGap:gaps.filter(g=>g!=null),errors:errs.slice(0,8),pack,overtakes,plPlaceChanges:plChanges,wallClearMinPerLap:wallMin.map(v=>v==null?null:+v.toFixed(2)),wallClearP10:wallAll.length?+wallAll.slice().sort((a,b)=>a-b)[Math.floor(wallAll.length*.1)].toFixed(2):null,wallClearMed:wallAll.length?+wallAll.slice().sort((a,b)=>a-b)[wallAll.length>>1].toFixed(2):null,tyreRay:Object.fromEntries(Object.entries(tyreR).map(([k,v])=>{v.sort((a,b)=>a-b);return[k,{n:v.length,min:v[0],p50:v[v.length>>1],max:v[v.length-1]}]})),aiTyre,render:perf,wallClock:Math.round((Date.now()-T0)/1000)};
 if(XS)for(const l of X.log)console.log('R17 '+l);console.log('RACE_RESULT '+JSON.stringify(R));await b.close()})();
