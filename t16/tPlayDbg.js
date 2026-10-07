// tPlay.js — human-play release gate. Plays the game the way a person does: real touch (CDP multi-touch on the GAS / ◀ ▶ / DRIFT /
// BOOST / BRAKE / ❚❚ controls) or real keyboard, reaction delay, ±15° heading wobble, follows the NEXT objective / minimap GPS route.
// No warps, no enterRoam(), no clicks on hidden UI. Time: requestAnimationFrame is driven by the test (exactly 60 frames per game second)
// so the real game loop (frame → roamStep, loading screens, HUD, camera) runs at full fidelity on a slow software-GL box.
// usage: node tools/tPlay.js <url-of-local_dbg.html> [outdir]
//   env FAST=1 (fast test mode: ?fast=1 + THROTTLE=1) · MODE=phone|desk|both (default both) · MIN=minutes per city (default 4) · CITIES=fra,ath · THROTTLE=4 · SHOTS=1
// Fails when (per city): wall/building hits > 1 per minute · stuck > 3 % · any console error · any loading screen in Athens ·
//   pedestrian > 1.2× adult scale relative to a car · any visible HUD element overlapping a touch control.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const URL0=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',URL=process.env.FAST==='1'&&!/[?&]fast=1/.test(URL0)?URL0+(URL0.includes('?')?'&':'?')+'fast=1':URL0,OUT=process.argv[3]||'qa';fs.mkdirSync(OUT,{recursive:true});
const FASTM=process.env.FAST==='1';  // FAST=1: game URL gets ?fast=1 (src/test/fast.js) and no CPU throttle (results are frame-stepped, so throttle only changes wall time)
const MODE=process.env.MODE||'both',MIN=+(process.env.MIN||4),CITIES=(process.env.CITIES||'fra,ath').split(','),THR=+(process.env.THROTTLE||(FASTM?1:4)),SHOTS=process.env.SHOTS!=='0';
const results=[];let fails=0;const ok=(c,m,i)=>{console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''));if(!c)fails++};
// ---- in-page: test-driven rAF clock + per-frame monitor
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}if(window.__mon)try{window.__mon()}catch(e){window.__monErr=String(e)}
  if(window.__auto&&window.__fast&&window.__mho&&__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on)){window.__auto=false;break}}return t};  // FAST: auto-ticking ends on the exact frame roam is ready (no wall-clock-dependent idle frames)

 setInterval(()=>{if(window.__dbg&&!window.__fastR&&!window.__shooting){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
// monitor: hits (speed loss not from the brake), stuck, speed, loading screens, smashes, camera inside a building
const MON=()=>{const M=__mho,R=M.RO;window.__Q={f:0,drive:0,vSum:0,hits:[],stuck:0,stEp:0,ld:0,ldOn:false,ldT:[],camIn:0,smash:0,traf:0,trafN:0,hist:[],lastHit:-99,pos:[],ev:[],ch:null,yh:[],bh:[],y0:0,camS:[]};
 const Q=__Q;let sm0=null;
 window.__mon=()=>{if(M.state!=='roam'){const on=!!(M.LD&&M.LD.on);if(on&&!Q.ldOn){Q.ld++;Q.ldT.push(Q.f)}Q.ldOn=on;return}
  Q.f++;const on=!!(M.LD&&M.LD.on)||!!document.querySelector('#loading:not([hidden]),#ldScreen:not([hidden])');if(on&&!Q.ldOn){Q.ld++;Q.ldT.push(Q.f)}Q.ldOn=on;
  const busy=R.card||R.mapOpen||R.story||R.frozen||R.wk||on||!document.querySelector('#settings').hidden;const v=Math.abs(R.v||0);
  const ch=R.ch||R.sp;if(!!ch!==!!Q.ch){if(ch)Q.ev.push({f:Q.f,start:(ch.m&&ch.m.ev&&(ch.m.ev.name||ch.m.ev.id))||ch.kind||'event'});else{const r=document.querySelector('#chRes');Q.ev.push({f:Q.f,end:r&&!r.hidden?r.textContent.trim().slice(0,60):'(no result)'})}Q.ch=ch}
  Q.hist.push(v);if(Q.hist.length>8)Q.hist.shift();Q.yh.push(R.y-M.gnd(R.x,R.z,R.y+.3));if(Q.yh.length>12)Q.yh.shift();Q.bh.push(!!R.boosting);if(Q.bh.length>10)Q.bh.shift();if(Q.f%6===0)Q.y0=R.y;
  const sm=M.HUB.smashed||0;if(sm0==null)sm0=sm;if(sm>sm0){Q.smash+=sm-sm0;Q.smashF=Q.f}sm0=sm;
  if(busy)return;Q.drive++;Q.vSum+=v;
  if(Q.f%30===0){let n=0;for(const c of M.HUB.cars||[]){if(!c.dead&&Math.hypot(c.x-R.x,c.z-R.z)<120)n++}Q.traf+=n;Q.trafN++;Q.pos.push([Math.round(R.x),Math.round(R.z)])}
  // hit: lost >25 % of speed within 6 frames from > 6 m/s without braking
  const vmax=Math.max(...Q.hist),brk=(M.touch&&M.touch.brake)||M.K.ArrowDown||M.K.KeyS;
  if(!brk&&vmax>6&&v<vmax*.75&&Q.f-Q.lastHit>36&&!(Q.smashF&&Q.f-Q.smashF<4)){Q.lastHit=Q.f;
   const wall=!!(M.roamHitAt(R.x,R.z,3.4,R.y));let car=0;for(const c of M.HUB.cars||[]){if(!c.dead&&Math.hypot(c.x-R.x,c.z-R.z)<8)car=1}
   let goon=0;try{let G=window.__m1&&__m1.goons;if(typeof G==='function')G=G();for(const g of G||[])if(Math.hypot((g.x??1e9)-R.x,(g.z??1e9)-R.z)<9)goon=1}catch(e){}let ped=0;for(const q of M.HUB.peds||[])if(Math.hypot((q._x??1e9)-R.x,(q._z??1e9)-R.z)<6)ped=1;const air=Q.yh.some(y=>y>.6),bst=Q.bh[0]&&!R.boosting;
   const M1o=window.__m1&&(typeof __m1.M1==='function'?__m1.M1():__m1.M1);const ctx=[M1o&&M1o.cs?'cutscene':'',M1o&&M1o.tdc&&M1o.tdc.t>0?'talkcam':'',R.ch&&R.ch.go===undefined?'':'',(document.querySelector('#msg')||{}).textContent||''].filter(Boolean).join('|').slice(0,40);
   Q.hits.push({ctx,f:Q.f,v0:+(vmax*3.6).toFixed(0),v1:+(v*3.6).toFixed(0),drop:+(1-v/vmax).toFixed(2),kind:(M.touch&&M.touch.park)?'parked':wall?'wall':goon?'mission-car':car?'traffic':ped?'ped':air?'landing':bst?'boost-end':'other',x:Math.round(R.x),z:Math.round(R.z),dy:+(R.y-Q.y0).toFixed(1)})}
  if(v<5/3.6){Q.stEp++;if(Q.stEp===121){Q.stPos=Q.stPos||[];if(Q.stPos.length<20)Q.stPos.push([Math.round(R.x),Math.round(R.z)])}}else{if(Q.stEp>120)Q.stuck+=Q.stEp;Q.stEp=0}
  const cam=window.__dbg&&__dbg.camera;if(cam&&Q.f%3===0){const b=M.roamHitAt(cam.position.x,cam.position.z,.3,cam.position.y);if(b){Q.camIn++;if(Q.camS.length<8&&Q.f-(Q.camF||-999)>240){Q.camF=Q.f;Q.camS.push({f:Q.f,car:[Math.round(R.x),Math.round(R.z),+R.y.toFixed(1)],cam:[+cam.position.x.toFixed(1),+cam.position.z.toFixed(1),+cam.position.y.toFixed(1)],b:{x:+(+b.x).toFixed(1),z:+(+b.z).toFixed(1),hw:+(+b.hw).toFixed(1),hd:+(+b.hd).toFixed(1),h:b.h&&+b.h.toFixed(1),y0:b.y0&&+b.y0.toFixed(1),rot:b.c!=null}})}}}};};
const STAT=()=>{const Q=__Q,mins=Q.drive/3600,st=Q.stuck+(Q.stEp>120?Q.stEp:0);const w=Q.hits.filter(h=>h.kind==='wall');const kinds={};for(const h of Q.hits)kinds[h.kind]=(kinds[h.kind]||0)+1;
 return{min:+mins.toFixed(2),hits:Q.hits.length,kinds,wallHits:w.length,wallPerMin:+(w.length/Math.max(.01,mins)).toFixed(2),hitsPerMin:+(Q.hits.length/Math.max(.01,mins)).toFixed(2),
  bigDrop:Q.hits.filter(h=>h.drop>.5).length,stPos:Q.stPos||[],stuckPct:+(100*st/Math.max(1,Q.drive)).toFixed(1),avgKmh:+(Q.vSum/Math.max(1,Q.drive)*3.6).toFixed(1),
  loads:Q.ld,loadsPerMin:+(Q.ld/Math.max(.01,Q.f/3600)).toFixed(2),camInsidePct:+(100*Q.camIn/Math.max(1,Q.drive/3)).toFixed(1),camInside:Q.camS,smashPerMin:+(Q.smash/Math.max(.01,mins)).toFixed(1),
  traffic120m:+(Q.traf/Math.max(1,Q.trafN)).toFixed(1),missions:Q.ev.slice(0,30),raw:{drive:Q.drive,f:Q.f,stuck:st,vSum:Q.vSum,camIn:Q.camIn,smash:Q.smash,ld:Q.ld,traf:Q.traf,trafN:Q.trafN},allHits:Q.hits,worst:Q.hits.slice().sort((a,b)=>b.drop-a.drop).slice(0,5),monErr:window.__monErr||null}};
// HUD vs touch-control overlap + tiny text
const LAYOUT=()=>{  // tiny = visible text under 12 px
const vis=e=>{const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05)return false;for(let a=e;a;a=a.parentElement){if(a.hidden)return false;const c=getComputedStyle(a);if(c.display==='none'||+c.opacity<.05)return false}const r=e.getBoundingClientRect();return r.width>4&&r.height>4};
 const ctl=[...document.querySelectorAll('#touch .tbtn')].filter(vis).map(e=>({id:e.id,r:e.getBoundingClientRect()}));const VA=innerWidth*innerHeight;const ov=[],tiny=[];
 for(const e of document.body.querySelectorAll('*')){if(e.closest('#touch')||e.tagName==='CANVAS'||e.tagName==='SCRIPT'||e.tagName==='STYLE')continue;const cs=getComputedStyle(e);
  const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!own&&cs.position!=='fixed'&&cs.position!=='absolute')continue;if(!vis(e))continue;const r=e.getBoundingClientRect();if(r.width*r.height>VA*.3)continue;
  if(own&&parseFloat(cs.fontSize)<11.5)tiny.push((e.id||e.className||e.tagName)+':'+cs.fontSize+':'+e.textContent.trim().slice(0,24));
  if(!own&&cs.backgroundColor==='rgba(0, 0, 0, 0)'&&cs.backgroundImage==='none'&&!e.querySelector('canvas,img,svg'))continue;
  for(const c of ctl){const w=Math.min(r.right,c.r.right)-Math.max(r.left,c.r.left),h=Math.min(r.bottom,c.r.bottom)-Math.max(r.top,c.r.top);if(w>6&&h>6)ov.push(c.id+'×'+(e.id?'#'+e.id:e.className?'.'+String(e.className).split(' ')[0]:e.tagName)+(own?'«'+e.textContent.trim().slice(0,16)+'»':''))}}
 // HUD panels overlapping each other (positioned elements with an id, not nested)
 const pan=[...document.querySelectorAll('body [id]')].filter(e=>!e.closest('#touch')&&e.tagName!=='CANVAS'&&['fixed','absolute'].includes(getComputedStyle(e).position)&&vis(e)).map(e=>({e,r:e.getBoundingClientRect()})).filter(o=>o.r.width*o.r.height<VA*.3);const hud=[];
 for(let i=0;i<pan.length;i++)for(let j=i+1;j<pan.length;j++){const A=pan[i],B=pan[j];if(A.e.contains(B.e)||B.e.contains(A.e))continue;const w=Math.min(A.r.right,B.r.right)-Math.max(A.r.left,B.r.left),h=Math.min(A.r.bottom,B.r.bottom)-Math.max(A.r.top,B.r.top);if(w>10&&h>10)hud.push('#'+A.e.id+'×#'+B.e.id)}
 return{ctl:ctl.length,ov:[...new Set(ov)],tiny:[...new Set(tiny)].slice(0,12),hud:[...new Set(hud)].slice(0,30)}};
// scale: pedestrians / quest minifigs / traffic cars / player car / buildings (metres, from world-space bounding boxes)
const SCALE=()=>{const T=__dbg.THREE,M=__mho,R=M.RO,H=M.HUB,B=new T.Box3(),m4=new T.Matrix4(),sz=new T.Vector3();const med=a=>{a=a.filter(v=>v!=null).sort((x,y)=>x-y);return a.length?+a[a.length>>1].toFixed(2):null};
 const inst=(im,j)=>{if(!im||!im.geometry)return null;if(!im.geometry.boundingBox)im.geometry.computeBoundingBox();im.getMatrixAt(j,m4);B.copy(im.geometry.boundingBox).applyMatrix4(m4);return B.clone()};
 // pedestrians: union of their instanced body parts, height above their feet
 const peds=(H.peds||[]).map((p,i)=>({p,i,d:Math.hypot((p._x??1e9)-R.x,(p._z??1e9)-R.z)})).sort((a,b)=>a.d-b.d).slice(0,8).map(({p,i})=>{const U=new T.Box3();for(const k in (H.pP||{})){const b=inst(H.pP[k],i);if(b&&!b.isEmpty())U.union(b)}return U.isEmpty()?null:U.max.y-(p.y||0)-(p.jy||0)});
 const cars=(H.cars||[]).filter(c=>!c.dead&&H.cim&&H.cim[c.k]).map(c=>({c,d:Math.hypot(c.x-R.x,c.z-R.z)})).sort((a,b)=>a.d-b.d).slice(0,8).map(({c})=>{const b=inst(H.cim[c.k],c.j);if(!b)return null;b.getSize(sz);return{l:Math.max(sz.x,sz.z),h:sz.y}});
 let pc=null;if(M.pl&&M.pl.mesh){M.pl.mesh.updateMatrixWorld(true);B.makeEmpty();M.pl.mesh.traverseVisible(o=>{if(o.isMesh&&o.geometry&&!(o.material&&(o.material.transparent||o.material.blending===T.AdditiveBlending))){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();B.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld))}});B.getSize(sz);pc={h:+sz.y.toFixed(2),l:+Math.max(sz.x,sz.z).toFixed(2),w:+Math.min(sz.x,sz.z).toFixed(2)}}
 const pedH=med(peds),carL=med(cars.map(c=>c&&c.l)),carH=med(cars.map(c=>c&&c.h));
 const rel=h=>h&&carL?+((h/carL)/(1.8/4.5)).toFixed(2):null;   // adult 1.8 m vs car 4.5 m: >1 = people too big for the cars
 return{pedH,carL,carH,player:pc,pedRel:rel(pedH),pedVsPlayer:pedH&&pc?+((pedH/pc.l)/(1.8/4.5)).toFixed(2):null,nPed:peds.filter(Boolean).length,nCar:cars.filter(Boolean).length}};
// invisible walls / hulls on the road: colliders covering paved road ≥ 1.5 m inside its edge, 300 m around the car
const ROADPROBE=()=>{const M=__mho,R=M.RO,out=[];let n=0,hit=0;const seen=new Set();const ath=M.cid()==='ath';
 const inside=(x,z)=>{if(ath){const r=M.athRoad(x,z,48);return!!r&&r.e<=-1.5}return!(M.roadD(x,z)>0||M.roadD(x+1.5,z)>0||M.roadD(x-1.5,z)>0||M.roadD(x,z+1.5)>0||M.roadD(x,z-1.5)>0)};
 for(let x=R.x-150;x<R.x+150;x+=4)for(let z=R.z-150;z<R.z+150;z+=4){if(!inside(x,z))continue;n++;
  const g=M.gnd(x,z,R.y+20);const b=M.roamHitAt(x,z,.05,g+.5);if(b){hit++;if(!seen.has(b)){seen.add(b);if(out.length<12)out.push({x:Math.round(x),z:Math.round(z),bx:+(+b.x).toFixed(1),bz:+(+b.z).toFixed(1),hw:+(+b.hw).toFixed(1),hd:+(+b.hd).toFixed(1),h:b.h,keys:Object.keys(b).filter(k=>!['x','z','hw','hd','h','c','s'].includes(k)).slice(0,8).join('/'),t:b.t||b.kind||b.type||b.k||null})}}}
 return{roadPts:n,blocked:hit,pct:+(100*hit/Math.max(1,n)).toFixed(2),colliders:seen.size,sample:out}};
// a page reload in the middle of play (e.g. a district change that falls back to a reload) restarts the in-page monitor: merge the parts
function merge(parts,reloads){if(parts.length===1&&!reloads)return parts[0];const R={drive:0,f:0,stuck:0,vSum:0,camIn:0,smash:0,ld:0,traf:0,trafN:0};let H=[],ev=[],cs=[];for(const p of parts){for(const k in R)R[k]+=p.raw[k];H=H.concat(p.allHits);ev=ev.concat(p.missions);cs=cs.concat(p.camInside||[])}
 const mins=R.drive/3600,w=H.filter(h=>h.kind==='wall'),kinds={};for(const h of H)kinds[h.kind]=(kinds[h.kind]||0)+1;
 return{...parts[parts.length-1],min:+mins.toFixed(2),hits:H.length,kinds,wallHits:w.length,wallPerMin:+(w.length/Math.max(.01,mins)).toFixed(2),hitsPerMin:+(H.length/Math.max(.01,mins)).toFixed(2),bigDrop:H.filter(h=>h.drop>.5).length,
  stuckPct:+(100*R.stuck/Math.max(1,R.drive)).toFixed(1),avgKmh:+(R.vSum/Math.max(1,R.drive)*3.6).toFixed(1),loads:R.ld+reloads,reloads,loadsPerMin:+((R.ld+reloads)/Math.max(.01,R.f/3600)).toFixed(2),camInsidePct:+(100*R.camIn/Math.max(1,R.drive/3)).toFixed(1),camInside:cs.slice(0,8),
  smashPerMin:+(R.smash/Math.max(.01,mins)).toFixed(1),traffic120m:+(R.traf/Math.max(1,R.trafN)).toFixed(1),missions:ev.slice(0,30),worst:H.slice().sort((a,b)=>b.drop-a.drop).slice(0,5)}}
// ---------------------------------------------------------------------------------------------------------------------------------
async function play(b,mode){const phone=mode==='phone';const vp=phone?{width:852,height:393}:{width:1440,height:900};
 const ctx=await b.newContext(phone?{viewport:vp,deviceScaleFactor:3,isMobile:true,hasTouch:true}:{viewport:vp});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[],warns=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{const t=m.text().slice(0,200);if(m.type()==='error')errs.push('console: '+t);else if(m.type()==='warning'&&!/GL Driver|GPU stall|WebGL-/.test(t))warns.push(t)});
 await p.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);if(THR>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:THR});
 // FAST=1: touch events carry a synthetic timestamp (e.timeStamp follows it): start + game frames/60 + gesture gaps, so the real
 // 440/450 ms finger gaps and the BRAKE spacing cost no wall time and tap timing is deterministic. Without FAST: real time, as before.
 let SYN=Date.now()/1000;const clk=()=>FASTM?SYN*1000:Date.now();const gap=ms=>FASTM?(SYN+=ms/1000,Promise.resolve()):p.waitForTimeout(ms);
 if(FASTM){const s0=cdp.send.bind(cdp);cdp.send=(m,o)=>s0(m,m==='Input.dispatchTouchEvent'?{...o,timestamp:SYN}:o)}
 const shot=async name=>{if(!SHOTS)return;await p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1)});await p.screenshot({path:path.join(OUT,`${mode}_${name}.jpg`),type:'jpeg',quality:62,timeout:900000});await p.evaluate(()=>{window.__shooting=0;if(!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}})};
 // ---- input: touch fingers (CDP multi-touch) or keys
 const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
 const center=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width<4||cs.display==='none'||cs.visibility==='hidden')return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
 const down=async(name,xy)=>{if(!xy)return false;if(F[name])await up(name);let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[name]={x:xy[0],y:xy[1],id};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()});return true};
 const move=async(name,xy)=>{if(!F[name]||!xy)return;F[name].x=xy[0];F[name].y=xy[1];await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:pts()})};
 // CDP does not release a finger that is just missing from a touchMove, so lift all and put the others back down (game time is frozen meanwhile)
 const up=async name=>{if(!F[name])return;delete F[name];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length){await gap(440);if(F.brake)brkReal=clk();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})}};  // 440 ms real: not a double-tap (roll / park)
 const tap=async(sel)=>{const xy=await center(sel);if(!xy)return false;if(phone){await down('tap',xy);await tick(4);await up('tap')}else{await p.mouse.click(xy[0],xy[1])}await tick(4);return true};
 const TT={wait:0,nw:0,tick:0,ev:0};if(process.env.TT){const w0=p.waitForTimeout.bind(p);p.waitForTimeout=async ms=>{const t=Date.now();await w0(ms);TT.wait+=Date.now()-t;TT.nw++};const e0=p.evaluate.bind(p);p.evaluate=async(...a)=>{const t=Date.now();try{return await e0(...a)}finally{TT.ev+=Date.now()-t}}}
 const ttl=m=>{if(process.env.TT)console.log('TT',m,JSON.stringify(TT))};
 const tick=n=>{if(FASTM)SYN+=n/60;return p.evaluate(n=>__tick(n),n)};const KD={};const key=async(k,on)=>{if(!!KD[k]===on)return;KD[k]=on;on?await p.keyboard.down(k):await p.keyboard.up(k)};
 const ctl={steer:0,gas:false,brake:false,drift:false,boost:false};let brkReal=0;  // a person never taps BRAKE twice within 420 ms (that is the PARK gesture)
 async function apply(c){if(phone){
   if(c.gas!==ctl.gas){c.gas?await down('gas',await center('#tG')):await up('gas')}
   if(c.steer!==ctl.steer){if(!c.steer)await up('st');else{const xy=await center(c.steer<0?'#tL':'#tR');if(F.st)await move('st',xy);else await down('st',xy)}}
   for(const [k,s] of [['brake','#tB'],['drift','#tD'],['boost','#tN']])if(c[k]!==ctl[k]){if(c[k]&&k==='brake'){const w=420-(clk()-brkReal);if(w>0)await gap(w);brkReal=clk()}c[k]?await down(k,await center(s)):await up(k)}}
  else{await key('ArrowUp',c.gas);await key('ArrowDown',c.brake);await key('ArrowLeft',c.steer<0);await key('ArrowRight',c.steer>0);await key('KeyX',c.drift);await key('Shift',c.boost)}
  Object.assign(ctl,c)}
 const releaseAll=async()=>{await apply({steer:0,gas:false,brake:false,drift:false,boost:false})};
 // ---- overlays a person taps through (only visible ones)
 const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','#setDone','.m1go','#resBtn','#tutSkip'];
 async function tapThrough(){for(const s of CONT){if(s==='#setDone'&&!(await p.evaluate(()=>window.__wantSet===false)))continue;if(await tap(s))return s}return null}
 const cityRes={};
 for(const city of CITIES){const T0=Date.now();
  await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
  await p.evaluate(([c])=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(c==='ath'){localStorage.setItem('mho_city@1',c);localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},[city]);
  await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
  if(mode==='phone'&&city===CITIES[0])await shot('menu');
  // a person taps STORY; the loading screen plays; then intro cards are tapped away
  // fra: a brand-new player (STORY → Slot 1 NEW GAME); ath: an existing Athens save (STORY → CONTINUE, the page reloads into Athens)
  await tap('#hcStory');await tick(10);await tap('#slotList .go');
  for(let i=0;i<120;i++){try{if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break;await p.waitForTimeout(2000)}catch(e){await p.waitForTimeout(2000)}}await p.evaluate(()=>{window.__auto=false});
  for(let i=0;i<30;i++){await tick(30);if(!(await tapThrough()))break}
  await p.evaluate(MON);ttl(city+' in roam');
  // scale + layout at the start
  const sc=await p.evaluate(SCALE);const road=await p.evaluate(ROADPROBE);let lay=await p.evaluate(LAYOUT);const ovAll=new Set(lay.ov),tinyAll=new Set(lay.tiny),hudAll=new Set(lay.hud);await shot(city+'_start');let rotR=null;if(phone&&city===CITIES[0])rotR=await rotTrip();
  // ---- the drive: human driver
  const rng=(s=>()=>(s=(s*16807)%2147483647)/2147483647)((city==='fra'?11:23)+(+process.env.SEED||0)*1000);let seenHits=0,hitShots=0,brakeUntil=-1,wob=0,route=null,routeT=-1e9,dest=null,destKind='',lastBrake=-1e9,boostT=0,driftT=0,stuckT=0,revT=0,lastNext=-1e9,events=[],lagged=[];
  const frames=MIN*3600;let f=0,lastLay=0,shotN=0,nextShot=frames/4;let extra={map:null,pause:null,garage:null,otg:null};
  const parts=[];let reloads=0,snap=null,lastSnap=0;
  while(f<frames){try{
   if(f-lastSnap>=600){lastSnap=f;snap=await p.evaluate(STAT)}
   // side trips a person makes once: map drag+pinch, pause/resume, garage
   if(f>=frames*.3&&!extra.map){await releaseAll();extra.map=await mapTrip()||{};}
   if(f>=frames*.5&&!extra.pause){await releaseAll();extra.pause=await pauseTrip()||{};}
   if(f>=frames*.7&&!extra.garage){await releaseAll();extra.garage=await garageTrip()||{};}
   if(f>=nextShot){nextShot+=frames/4;await shot(`${city}_drive${Math.round(f/frames*4)}`)}
   const s=await p.evaluate(()=>{const M=__mho,R=M.RO;const n=document.querySelector('#m1Next');const Hh=window.__Q?__Q.hits:[];return{nh:Hh.length,lh:Hh.length?Hh[Hh.length-1]:null,x:R.x,z:R.z,y:R.y,h:R.h,v:R.v,wp:R.wp&&{x:R.wp.x,z:R.wp.z},busy:!!(R.card||R.mapOpen||R.story||R.frozen),ch:!!(R.ch||R.sp),arr:(()=>{const a=document.querySelector('#roamArrow');if(!a||a.hidden)return null;const m=/rotate\((-?[\d.]+)rad/.exec(a.querySelector('i').style.transform||''),d=/([\d.]+)\s*m\s*$/.exec(a.querySelector('span').textContent||'');if(!m||!d)return null;const ang=-(+m[1])+R.h,D=+d[1];return{x:R.x+Math.sin(ang)*D,z:R.z+Math.cos(ang)*D,d:D}})(),nextVis:!!n&&!n.hidden&&n.getBoundingClientRect().width>20,state:M.state,cid:M.cid(),ld:!!(M.LD&&M.LD.on)}});
   if(s.nh>seenHits){seenHits=s.nh;if(s.lh&&s.lh.kind==='wall'&&s.lh.drop>.5&&hitShots<3){hitShots++;await shot(`${city}_wallhit${hitShots}`)}}
   if(s.state!=='roam'){await releaseAll();const t=await tapThrough();if(!t)await tick(30);f+=30;continue}
   if(s.busy){await releaseAll();const t=await tapThrough();await tick(t?6:30);f+=t?6:30;if(!t&&rng()<.2){await tap('#roamMapX')}continue}
   // destination: the route the minimap shows (NEXT objective) → else an on-the-go event / a random spot 400–800 m away
   if(!s.wp&&!s.ch&&s.nextVis&&f-lastNext>600){lastNext=f;await tap('#m1Next');events.push('next@'+f);route=null}
   const goal=s.arr||s.wp;if(goal&&(!dest||Math.hypot(goal.x-dest[0],goal.z-dest[1])>25)){dest=[goal.x,goal.z];destKind=s.arr?'arrow':'objective';route=null}
   if(!dest||Math.hypot(dest[0]-s.x,dest[1]-s.z)<20){if(!goal){const a=rng()*6.283,L=400+rng()*400;dest=[s.x+Math.sin(a)*L,s.z+Math.cos(a)*L];destKind='wander';route=null}}
   if(!route||f-routeT>360){routeT=f;route=await p.evaluate(([x0,z0,x1,z1])=>{try{const M=__mho,q=M.rsnap(x1,z1,400);const P=M.qv.path(x0,z0,q[0],q[1]).P;return P&&P.length>1?P:null}catch(e){return null}},[s.x,s.z,dest[0],dest[1]]);if(!route){dest=null;await tick(6);f+=6;continue}}
   // a person drives straight at a target they can see: clear line (no building) within 250 m
   let los=false;if(dest){const dD0=Math.hypot(dest[0]-s.x,dest[1]-s.z);if(dD0<250)los=await p.evaluate(([x0,z0,x1,z1,y])=>{const L=Math.hypot(x1-x0,z1-z0);for(let d=3;d<L;d+=4){const x=x0+(x1-x0)*d/L,z=z0+(z1-z0)*d/L;if(__mho.roamHitAt(x,z,1.4,y+.5))return false}return true},[s.x,s.z,dest[0],dest[1],s.y])}
   // perception lag 0.25 s: decide on the state seen 2 decisions ago
   lagged.push(s);if(lagged.length>3)lagged.shift();const o=lagged[0];
   let bi=0,bd=1e9;for(let k=0;k<route.length;k++){const d=Math.hypot(route[k][0]-o.x,route[k][1]-o.z);if(d<bd){bd=d;bi=k}}const off=bd>30;if(off&&f-routeT>120&&!los)route=null;if(!route){await tick(6);f+=6;continue}
   let k=bi,acc=0;const look=9+Math.abs(o.v)*.4;while(k<route.length-1&&acc<look){acc+=Math.hypot(route[k+1][0]-route[k][0],route[k+1][1]-route[k][1]);k++}
   if(off)k=bi;let tx=route[k][0],tz=route[k][1];const dD=Math.hypot(dest[0]-o.x,dest[1]-o.z);if(los||dD<40||(k>=route.length-2&&dD<220)){tx=dest[0];tz=dest[1]}  // beacon in sight: drive straight at it
   let a=Math.atan2(tx-o.x,tz-o.z)-o.h;a=Math.atan2(Math.sin(a),Math.cos(a));
   wob+=(rng()-.5)*.08-wob*.05;wob=Math.max(-.26,Math.min(.26,wob));const ae=a+wob*Math.min(1,Math.abs(o.v)/15);  // ±15° wobble while moving
   // corner ahead (next 40 m)
   let k2=bi,a2=0;acc=0;const cl=Math.max(40,Math.abs(o.v)*1.6);while(k2<route.length-1&&acc<cl){acc+=Math.hypot(route[k2+1][0]-route[k2][0],route[k2+1][1]-route[k2][1]);k2++}if(k2>bi+1){const h1=Math.atan2(route[Math.min(k2,route.length-1)][0]-route[bi][0],route[Math.min(k2,route.length-1)][1]-route[bi][1]);a2=Math.abs(Math.atan2(Math.sin(h1-o.h),Math.cos(h1-o.h)))}
   const c={steer:ae>.13?-1:ae<-.13?1:0,gas:true,brake:false,drift:false,boost:false};
   if(o.v<0)c.steer=-c.steer; // reversing: wheel works backwards
   let wantB=false;if(Math.abs(ae)>.7&&o.v>14){c.gas=false;wantB=true}else if(a2>.9&&o.v>20){c.gas=false;if(o.v>32)wantB=true}
   // one held press per corner (a quick second tap would be the double-tap PARK gesture)
   if(wantB&&(ctl.brake||f-lastBrake>60))brakeUntil=Math.max(brakeUntil,f+18);if(f<brakeUntil){c.brake=true;lastBrake=f}
   if(Math.abs(ae)<.08&&a2<.2&&o.v>12&&o.v<45&&f-boostT>600){boostT=f}if(f-boostT<90)c.boost=true;
   if(Math.abs(ae)>.45&&Math.abs(ae)<1.1&&o.v>23&&f-driftT>900){driftT=f}if(f-driftT<50&&Math.abs(ae)>.2)c.drift=true;
   // stuck like a person: after 1.5 s at a standstill, reverse with opposite lock for 1.2 s
   if(Math.abs(s.v)<1.4)stuckT+=6;else stuckT=0;if(stuckT===96&&SHOTS&&(global.stkN||0)<3){global.stkN=(global.stkN||0)+1;await shot(`${city}_stuck${global.stkN}`);console.log('STUCKAT',global.stkN,JSON.stringify(await p.evaluate(()=>{const R=__mho.RO;return{x:R.x|0,z:R.z|0,h:+R.h.toFixed(2),v:+R.v.toFixed(2),onRoad:(()=>{try{return __mho.onRoad?__mho.onRoad(R.x,R.z):null}catch(e){return null}})()}})))}if(stuckT>90&&f>revT+150){revT=f;stuckT=0}
   if(f-revT<72){c.gas=false;c.brake=true;c.boost=false;c.drift=false;c.steer=ae>0?1:-1}
   if(process.env.DEBUG&&f%120===0)console.log('dbg',f,JSON.stringify({x:Math.round(s.x),z:Math.round(s.z),v:Math.round(s.v*3.6),arr:s.arr&&[Math.round(s.arr.x),Math.round(s.arr.z),Math.round(s.arr.d)],dest:dest&&dest.map(Math.round),kind:destKind,los,rl:route&&route.length,bi,bd:Math.round(bd),ae:+ae.toFixed(2),c}));
   await apply(c);await tick(6);f+=6;
   if(f-lastLay>=300){lastLay=f;lay=await p.evaluate(LAYOUT);const nw=lay.ov.filter(x=>!ovAll.has(x));lay.ov.forEach(x=>ovAll.add(x));lay.tiny.forEach(x=>tinyAll.add(x));const nh=lay.hud.filter(x=>!hudAll.has(x));lay.hud.forEach(x=>hudAll.add(x));if(nh.length&&shotN<6){shotN++;await shot(`${city}_hud${shotN}`)}if(nw.length&&shotN<4){shotN++;await shot(`${city}_overlap${shotN}`)}}
  }catch(e){if(!/context was destroyed|navigation|Target closed|detached/i.test(e.message))throw e;
    // the page reloaded under the player's thumbs: count it, wait for the game, carry on
    reloads++;events.push('RELOAD@'+f);if(snap)parts.push(snap);snap=null;for(const k in F)delete F[k];Object.assign(ctl,{steer:0,gas:false,brake:false,drift:false,boost:false});
    for(let i=0;i<90;i++){try{await p.waitForTimeout(2000);const st2=await p.evaluate(()=>window.__mho&&__mho.state);if(st2==='roam')break;if(st2==='menu'){await tap('#hcStory');await tick(10);await tap('#slotList .go')}}catch(_){}}
    await p.evaluate(()=>{window.__auto=false});await shot(`${city}_reload${reloads}`);await p.evaluate(MON);lastSnap=f;f+=60;continue}}
  ttl(city+' drive done');await releaseAll();await tick(30);let st=await p.evaluate(STAT);parts.push(st);st=merge(parts,reloads);delete st.raw;delete st.allHits;const roadEnd=await p.evaluate(ROADPROBE);await shot(city+'_end');
  const perf=await p.evaluate(()=>{const r=__dbg.renderer;window.__shooting=1;__dbg.composer.render=window.__fastR||__dbg.composer.render;window.__fastR=null;r.info.autoReset=false;r.info.reset();__tick(1);r.info.autoReset=true;window.__shooting=0;const i=r.info.render;const o={calls:i.calls,tris:i.triangles,jsMs:+__mho.PERF.js.toFixed(1),geoms:r.info.memory.geometries,tex:r.info.memory.textures};window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{};return o});
  try{console.log('B2KLOG',JSON.stringify(await p.evaluate(()=>window.__b2k?{l:__b2k.log,st:__b2k.st()}:null)))}catch(e){}ttl(city+' end');cityRes[city]={...st,rot:rotR,scale:sc,road,roadEnd,overlap:[...ovAll],hudOverlap:[...hudAll],tiny:[...tinyAll],extra,events:events.slice(0,12),perf,wallSec:Math.round((Date.now()-T0)/1000)};
  console.log(mode,city,JSON.stringify(cityRes[city]));
 }
 // ---- side trips (all through visible UI)
 // rotation: portrait ↔ landscape 3× mid-drive (iOS order: orientationchange, then the size arrives late), one rotation with GAS held,
 // then iOS's lost touchcancel (a finger id left behind). Afterwards every control must answer a fresh touch and nothing may stay latched.
 async function rotTrip(){const r={steps:[]};const L={width:852,height:393},P={width:393,height:852};
  const rot=async v=>{const land=v.width>v.height;await p.evaluate(()=>dispatchEvent(new Event('orientationchange')));await tick(6);
   await cdp.send('Emulation.setDeviceMetricsOverride',{width:v.width,height:v.height,deviceScaleFactor:3,mobile:true,screenOrientation:land?{type:'landscapePrimary',angle:90}:{type:'portraitPrimary',angle:0}});
   await p.evaluate(()=>{dispatchEvent(new Event('resize'));window.visualViewport&&visualViewport.dispatchEvent(new Event('resize'))});await tick(60);await p.waitForTimeout(900);await tick(6)};
  await down('gas',await center('#tG'));for(let i=0;i<3;i++){await rot(P);await rot(L)}for(const k in F)delete F[k];await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  // iOS: a finger that was down during the rotation never gets touchend/touchcancel → emulate the stale ids it leaves behind
  await p.evaluate(()=>{const T=__mho.touch;T.bz=7;T.sid=8});await tick(2);
  const probe=async(sel,read)=>{const xy=await center(sel);if(!xy)return'hidden';const cov=await p.evaluate(([x,y,s])=>{const e=document.querySelector(s),t=document.elementFromPoint(x,y);return t===e||e.contains(t)||(t&&t.id==='btnZone'&&/tL|tR/.test(s))?'':'covered by '+(t&&(t.id||t.className||t.tagName))},[xy[0],xy[1],sel]);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:xy[0],y:xy[1],id:3}]});await tick(1);const on=await p.evaluate(read);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await tick(2);
   await gap(450);return cov||(on?'ok':'NO RESPONSE')};
  r.ctl={'◀':await probe('#tL',()=>__mho.touch.dir===-1),'▶':await probe('#tR',()=>__mho.touch.dir===1),GAS:await probe('#tG',()=>!!__mho.touch.gas),BRAKE:await probe('#tB',()=>!!__mho.touch.brake||!!__mho.touch.park),BOOST:await probe('#tN',()=>!!__mho.touch.boost),DRIFT:await probe('#tD',()=>!!__mho.touch.hb)};
  r.stuck=await p.evaluate(()=>{const T=__mho.touch;return['gas','brake','boost','hb'].filter(k=>T[k]).concat(T.dir?['dir']:[],T.bz!=null&&T.bz!==7?['bz']:[])});
  r.vp=await p.evaluate(()=>[innerWidth,innerHeight,__dbg.renderer.domElement.width,__dbg.renderer.domElement.height]);await shot('after_rotation');return r}
 async function mapTrip(){const r={opened:false,drag:null,pinch:null};if(!(await tap('#roamMapBtn')))return r;await tick(20);r.opened=await p.evaluate(()=>!!__mho.RO.mapOpen);const c=await center('#roamMapC');if(!c)return r;
  const st0=await p.evaluate(()=>({z:__mho.RO.mapZ,c:__mho.RO.mapC&&[Math.round(__mho.RO.mapC.x),Math.round(__mho.RO.mapC.z)]}));
  if(phone){await down('m1',c);for(let i=1;i<=8;i++){await move('m1',[c[0]-i*15,c[1]-i*8]);await tick(2)}await up('m1');await tick(6);
   const st1=await p.evaluate(()=>({z:__mho.RO.mapZ,c:__mho.RO.mapC&&[Math.round(__mho.RO.mapC.x),Math.round(__mho.RO.mapC.z)]}));r.drag=JSON.stringify(st1)!==JSON.stringify(st0);
   await down('a',[c[0]-40,c[1]]);await down('b',[c[0]+40,c[1]]);for(let i=1;i<=8;i++){await move('a',[c[0]-40-i*12,c[1]]);await move('b',[c[0]+40+i*12,c[1]]);await tick(2)}await up('a');await up('b');await tick(6);
   const st2=await p.evaluate(()=>__mho.RO.mapZ);r.pinch=st2!==st1.z}
  else{await p.mouse.move(c[0],c[1]);await p.mouse.down();for(let i=1;i<=8;i++){await p.mouse.move(c[0]-i*15,c[1]-i*8);await tick(2)}await p.mouse.up();await p.mouse.wheel(0,-400);await tick(6);const st1=await p.evaluate(()=>({z:__mho.RO.mapZ,c:__mho.RO.mapC&&[Math.round(__mho.RO.mapC.x),Math.round(__mho.RO.mapC.z)]}));r.drag=JSON.stringify(st1)!==JSON.stringify(st0)}
  r.covers=await p.evaluate(()=>{const m=document.querySelector('#roamMapC');const box=m.closest('[id=roamMap]')||m.parentElement;const R=m.getBoundingClientRect(),o=new Set();for(let i=1;i<12;i++)for(let j=1;j<8;j++){const e=document.elementFromPoint(R.left+R.width*i/12,R.top+R.height*j/8);if(e&&!box.contains(e)){let a=e;while(a&&!a.id)a=a.parentElement;o.add(a?'#'+a.id:e.tagName)}}return[...o]});
  await shot('map');await tap('#roamMapX');await tick(20);r.closed=await p.evaluate(()=>!__mho.RO.mapOpen);return r}
 async function pauseTrip(){const r={};const pos=()=>p.evaluate(()=>[__mho.RO.x,__mho.RO.z]);
  if(phone){await tap('#tP');r.tP_settings=await p.evaluate(()=>!document.querySelector('#settings').hidden);r.opts=await p.evaluate(()=>[...document.querySelectorAll('#setBody .opt b,#setBody label,#setBody h4')].map(e=>e.textContent.trim().slice(0,18)).filter(Boolean).slice(0,30));
   await p.evaluate(()=>window.__wantSet=false);await tap('#setDone');await p.evaluate(()=>window.__wantSet=true);await tick(10)}
  await tap('#roamExit');r.opened=await p.evaluate(()=>!document.querySelector('#roamPause').hidden);await shot('pause');
  const x0=await pos();await tick(120);const x1=await pos();r.frozen=Math.hypot(x1[0]-x0[0],x1[1]-x0[1])<.5;
  await tap('#roamPause [data-p=resume]');await tick(10);r.resumed=await p.evaluate(()=>document.querySelector('#roamPause').hidden&&!__mho.RO.frozen);return r}
 async function garageTrip(){const r={};r.pause=await tap('#roamExit');await tick(6);r.btn=await p.evaluate(()=>{const b=document.querySelector('#roamPause [data-p=garage]');return!!b&&!b.hidden&&b.offsetWidth>0});if(!(await tap('#roamPause [data-p=garage]'))){await tap('#roamPause [data-p=resume]');await tick(10);r.back=await p.evaluate(()=>document.querySelector('#roamPause').hidden);return r}await tick(60);
  r.open=await p.evaluate(()=>[...document.querySelectorAll('body > [id]')].filter(e=>!e.hidden&&e.offsetWidth>300&&/gb|gar/i.test(e.id)).map(e=>e.id));await shot('garage');
  r.refused=await p.evaluate(()=>/GARAGE CLOSED/.test(document.body.innerText));
  const close=await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.offsetWidth&&/^(✕|×|DONE|CLOSE|BACK|◀ BACK|SAVE.*|EXIT)/i.test(b.textContent.trim())&&b.closest('[id]')&&/gb|gar/i.test(b.closest('[id]').id));if(b)b.setAttribute('data-qa','gx');return b&&b.textContent.trim()});r.closeBtn=close;if(close)await tap('[data-qa=gx]');await tick(60);
  if(await p.evaluate(()=>!document.querySelector('#roamPause').hidden))await tap('#roamPause [data-p=resume]');await tick(10);
  r.back=await p.evaluate(()=>__mho.state==='roam'&&!__mho.RO.frozen&&document.querySelector('#roamPause').hidden);return r}
 await ctx.close();return{mode,cities:cityRes,errs:[...new Set(errs)].slice(0,20),warns:[...new Set(warns)].slice(0,20)}}
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const T0=Date.now();
 for(const m of MODE==='both'?['phone','desk']:[MODE]){const r=await play(b,m);results.push(r);
  for(const [c,s] of Object.entries(r.cities)){ok(s.wallPerMin<=1,`${m} ${c}: wall/building hits ≤ 1/min`,{wallPerMin:s.wallPerMin,bigDrop:s.bigDrop,hits:s.hits});ok(s.stuckPct<=3,`${m} ${c}: stuck ≤ 3 %`,{stuckPct:s.stuckPct});
   ok(!s.reloads,`${m} ${c}: the page never reloads while playing`,{reloads:s.reloads||0,events:(s.events||[]).filter(e=>/RELOAD/.test(e))});
   if(c==='ath')ok(s.loads===0,`${m} ath: no loading screens while driving`,{loads:s.loads});
   ok(s.scale.pedRel==null||s.scale.pedRel<=1.2,`${m} ${c}: pedestrians ≤ 1.2× adult scale vs cars`,s.scale);
   if(s.rot)ok(Object.values(s.rot.ctl).every(v=>v==='ok')&&!s.rot.stuck.length,`${m}: after 3 rotations every touch control answers, nothing latched`,s.rot);
   if(m==='phone')ok(!s.tiny.length,`${m} ${c}: no HUD text under 12 px`,s.tiny.slice(0,8));
   if(m==='phone')ok(!s.overlap.length,`${m} ${c}: no HUD element over a touch control`,s.overlap.slice(0,8));
   ok(s.road.blocked+s.roadEnd.blocked===0,`${m} ${c}: no collider on the paved road (invisible walls / oversize hulls)`,{pts:s.road.roadPts+s.roadEnd.roadPts,start:s.road.colliders,end:s.roadEnd.colliders,ex:s.road.sample.concat(s.roadEnd.sample).slice(0,3)});
   ok(s.camInsidePct<=2,`${m} ${c}: chase camera inside a building ≤ 2 % of frames`,{camInsidePct:s.camInsidePct,ex:(s.camInside||[]).slice(0,2)});
   ok(!s.monErr,`${m} ${c}: monitor ran`,s.monErr)}
  ok(!r.errs.length,`${m}: zero console / page errors`,r.errs.slice(0,6))}
 fs.writeFileSync(path.join(OUT,'tPlay.json'),JSON.stringify(results,null,1));
 console.log(`${fails?'TPLAY FAIL '+fails:'TPLAY PASS'} · ${Math.round((Date.now()-T0)/1000)} s · ${OUT}/tPlay.json`);await b.close();process.exit(fails?1:0)})();
