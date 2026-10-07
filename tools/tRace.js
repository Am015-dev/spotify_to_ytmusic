// tRace.js — real-input race gate (phone 852×393 touch or desktop keys). A person taps RACE → circuit → START RACE, holds GAS,
// steers with ◀ ▶ toward a chosen line (items, shortcut entries, centre) with a reaction delay and wobble, taps BOOST on
// straights with a full meter and taps the ITEM button (#tF) 0.5–2 s after picking an item. No warps, no state writes.
// Time is frame-stepped like tPlay (60 frames per game second) so numbers are the same on a slow software-GL box.
// usage: node tools/tRace.js <url local_dbg.html> [outdir]   env TRACK=grand|hafen|… (menu circuit index or id) CITY=fra|ath
//   LAPS=1 (laps to drive, then stop) MAXMIN=6 · MODE=phone|desk · SHOTS=1 · TAG=name prefix for shots
// prints one JSON line RACE_RESULT {...}: lapTimes, avgKmh, topKmh, wallHits/min, transforms, shortcuts, items picked/used, place, errors, fps
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const URL0=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',URL=URL0+(/[?&]fast=1/.test(URL0)?'':(URL0.includes('?')?'&':'?')+'fast=1'),OUT=process.argv[3]||'qa_race';fs.mkdirSync(OUT,{recursive:true});
const TRACK=process.env.TRACK||'grand',CITY=process.env.CITY||'fra',LAPS=+(process.env.LAPS||1),MAXMIN=+(process.env.MAXMIN||6),MODE=process.env.MODE||'phone',SHOTS=process.env.SHOTS!=='0',TAG=process.env.TAG||'';
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 setInterval(()=>{if(window.__dbg&&!window.__fastR&&!window.__shooting){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
// in-page race probe (read-only)
const ST=`(()=>{const E=__oc.ev;return E('(()=>{const s=pl;if(!s)return {state};const f=frameAt(TD,s.dist,mkF());return {state,raceT,dist:s.dist,L:TD.L,lap:s.lap,laps:RC.laps,x:s.x,M:MARGIN,W,v:s.v,top0:s.stats.top0,wall:s.wall,item:s.item,bm:s.bm,place:s.place,n:ships.length,terr:s.terrain||"road",route:s.rtId||"",fin:s.finished,laps_:s.laps.slice(),k:kAt(TD,s.dist+60),pads:pads.filter(p=>p.type==="item"&&(!p.cd||p.cd<=0)).map(p=>[tdd(p.s,s.dist),p.x]).filter(a=>a[0]>10&&a[0]<160).slice(0,4),rts:(window.__rt15?__rt15(s):null),dead:s.dead,cam:camera.fov}})()')})()`;
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const phone=MODE==='phone';const ctx=await b.newContext(phone?{viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900}});
 const p=await ctx.newPage();p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);
 let SYN=Date.now()/1000;{const s0=cdp.send.bind(cdp);cdp.send=(m,o)=>s0(m,m==='Input.dispatchTouchEvent'?{...o,timestamp:SYN}:o)}
 const tick=n=>{SYN+=n/60;return p.evaluate(n=>__tick(n),n)};
 const shot=async name=>{if(!SHOTS)return;await p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1)});await p.screenshot({path:path.join(OUT,`${TAG}${MODE}_${name}.jpg`),type:'jpeg',quality:70});await p.evaluate(()=>{window.__shooting=0;if(!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}})};
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
   if(c.boost!==ctl.boost){c.boost?await down('boost',await center('#tN')):await up('boost')}}
  else{await key('ArrowUp',c.gas);await key('ArrowLeft',c.steer<0);await key('ArrowRight',c.steer>0);await key('Shift',c.boost)}Object.assign(ctl,c)}
 const T0=Date.now();
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
 // countdown: hold GAS from the lights (a person presses as it counts down)
 await apply({gas:true,steer:0,boost:false});
 const rng=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(7);
 let f=0,frames=MAXMIN*3600,lapsDone=0,spd=[],top=0,wallHits=0,wasWall=false,terr='road',transforms=0,routes=new Set(),picked=0,used=0,lastItem=null,useAt=-1,shots={mid:0,short:0,item:0,boost:0},target=0,tgtT=0,react=[],wob=0,boostT=0,prevLap=-1,lapStart=null,lapTimes=[],raceSec=0,raceStart=null,stuck=0;
 const STEP=6;
 while(f<frames){await tick(STEP);f+=STEP;const s=await p.evaluate(ST);if(!s||s.state==='results'||s.fin)break;if(s.state!=='race')continue;
  if(raceStart===null)raceStart=s.raceT;
  const kmh=s.v*3.6;spd.push(kmh);top=Math.max(top,kmh);if(kmh<10&&s.raceT>3)stuck+=STEP/60;
  const w=s.wall>0;if(w&&!wasWall)wallHits++;wasWall=w;
  if(s.terr!==terr){transforms++;terr=s.terr}
  if(s.route)routes.add(s.route);
  if(s.item&&s.item!==lastItem){picked++;useAt=s.raceT+.5+rng()*1.5}lastItem=s.item;
  if(s.item&&useAt>0&&s.raceT>=useAt){useAt=-1;if(await tap(phone?'#tF':'#tF')||(!phone&&(await p.keyboard.press('Space'),1))){used++;if(shots.item<1){shots.item++;await tick(8);await shot('item_use')}}}
  // choose a line like a person: an item box ahead, a marked shortcut entry ahead (rts from the game's own signs), else hold
  if(s.raceT>=tgtT){tgtT=s.raceT+.35+rng()*.3;let t=null;
   if(s.rts&&s.rts.want!=null)t=s.rts.want;else if(!s.item&&s.pads.length){t=s.pads[0][1]}
   wob=(rng()-.5)*2*Math.min(3,s.W*.08);react.push(t==null?null:t+wob)}
  const tgt=react.length>1?react.shift():react[0];
  let st=0;if(tgt!=null){const e=tgt-s.x;if(Math.abs(e)>1.6)st=Math.sign(e)}
  // boost on a straight with >50 % meter for ~1.5 s
  let bo=false;if(s.bm>50&&Math.abs(s.k)<1/900&&s.raceT>boostT){boostT=s.raceT+6;}if(s.raceT<boostT-4.5&&s.bm>5)bo=true;
  await apply({gas:true,steer:st,boost:bo});
  if(bo&&!shots.boost){shots.boost=1;await shot('boost')}
  if(s.terr!=='road'&&shots.short<1){shots.short++;await shot('terrain_'+s.terr)}
  if(s.route&&shots.short<2){shots.short=2;await shot('shortcut_'+s.route)}
  lapTimes=s.laps_.map(x=>+x.toFixed(2));if(lapTimes.length>=LAPS)break;
  if(!shots.mid&&s.raceT-raceStart>40){shots.mid=1;await shot('mid')}
  raceSec=s.raceT-raceStart}
 const s=await p.evaluate(ST);await shot('end');
 // fps: real render cost of 40 frames at this spot (fast mode renders 426×196; same for live and candidate)
 const perf=await p.evaluate(()=>{window.__shooting=1;const r=window.__fastR||__dbg.composer.render;const c=__dbg.composer;const t0=performance.now();for(let i=0;i<40;i++){if(window.__fast)__fast.force=1;r.call(c)};const ms=(performance.now()-t0)/40;window.__shooting=0;return{ms:+ms.toFixed(2),calls:__dbg.renderer.info.render.calls,tris:__dbg.renderer.info.render.triangles}});
 const avg=spd.length?spd.reduce((a,b)=>a+b,0)/spd.length:0;
 const R={track:trk,mode:MODE,lapTimes,raceSec:+raceSec.toFixed(1),avgKmh:+avg.toFixed(1),topKmh:+top.toFixed(1),wallHits,wallPerMin:+(wallHits/Math.max(.1,raceSec/60)).toFixed(2),transforms,routes:[...routes],itemsPicked:picked,itemsUsed:used,place:s.place+'/'+s.n,stuckSec:+stuck.toFixed(1),errors:errs.slice(0,8),render:perf,wallClock:Math.round((Date.now()-T0)/1000)};
 console.log('RACE_RESULT '+JSON.stringify(R));await b.close()})();
