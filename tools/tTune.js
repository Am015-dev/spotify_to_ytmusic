// tTune.js (tune20): TUNE drawer + defaults A/B. Real touch (CDP) on the phone layout 852×393, keyboard for the scripted A/B drive.
// usage: node tools/tTune.js <url> <outdir> <mode>   mode: ab (scripted drive, prints numbers) · ui (drawer shots, slider→turn rate, fake-db save/load) · plain (no ?tune: drawer must not exist)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path');
const T0=Date.now();const URL=process.argv[2],OUT=process.argv[3]||'qa20',MODE=process.argv[4]||'ab';fs.mkdirSync(OUT,{recursive:true});
// test-driven rAF (60 frames per game second) + seeded Math.random, so two builds see the same world and traffic
const INIT=`(()=>{let s=12345;Math.random=()=>(s=(s*16807)%2147483647)/2147483647;const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 setInterval(()=>{if(window.__dbg&&!window.__fastR&&!window.__shooting){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
// in-memory artifact db (same call shapes as the db capability), kept in sessionStorage so it survives a reload
const FAKEDB=`(()=>{const K='__fakedb',ld=()=>JSON.parse(sessionStorage.getItem(K)||'{}'),sv=o=>sessionStorage.setItem(K,JSON.stringify(o));window.__dbW=0;
 const snap=(p,d)=>({id:p.split('/').pop(),exists:d!==undefined,data:()=>d===undefined?undefined:JSON.parse(JSON.stringify(d)),metadata:{fromCache:false,hasPendingWrites:false}});
 const doc=p=>({id:p.split('/').pop(),path:p,get:async()=>snap(p,ld()[p]),set:async d=>{const o=ld();o[p]=d;sv(o);window.__dbW++},update:async d=>{const o=ld();o[p]=Object.assign(o[p]||{},d);sv(o);window.__dbW++},delete:async()=>{const o=ld();delete o[p];sv(o);window.__dbW++}});
 const col=(p,ord,lim)=>({path:p,doc:id=>doc(p+'/'+id),orderBy:(f,dir)=>col(p,[f,dir],lim),limit:n=>col(p,ord,n),where:()=>col(p,ord,lim),
  get:async()=>{const o=ld();let ks=Object.keys(o).filter(k=>k.startsWith(p+'/')&&k.split('/').length===p.split('/').length+1);let ds=ks.map(k=>snap(k,o[k]));
   if(ord)ds.sort((a,b)=>(a.data()[ord[0]]-b.data()[ord[0]])*(ord[1]==='desc'?-1:1));if(lim)ds=ds.slice(0,lim);return{docs:ds,size:ds.length,empty:!ds.length}}});
 const db={doc,collection:p=>col(p)};window.claude={use:n=>new Promise(r=>setTimeout(()=>r(n==='db'?db:null),300))}})();`;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(600000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.addInitScript(INIT);if(MODE==='ui')await p.addInitScript(FAKEDB);const cdp=await ctx.newCDPSession(p);
 const tick=n=>p.evaluate(n=>__tick(n),n);
 const shot=async n=>{await p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1)});await p.screenshot({path:path.join(OUT,n+'.jpg'),type:'jpeg',quality:70});await p.evaluate(()=>{window.__shooting=0});console.log('shot',n,Date.now()-T0)};
 const rect=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();if(r.width<2)return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;return{x:r.left,y:r.top,w:r.width,h:r.height}},sel);
 const touch=async(x,y)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await tick(3);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await tick(3)};
 const tap=async sel=>{const r=await rect(sel);if(!r)return false;await touch(r.x+r.w/2,r.y+r.h/2);return true};
 const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','#setDone','.m1go','#resBtn','#tutSkip'];
 const through=async()=>{for(const s of CONT){if(s==='#setDone'&&!(await p.evaluate(()=>window.__wantSet===false)))continue;if(await tap(s))return s}return null};
 async function toRoam(clear){await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
  if(clear){await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500})}
  await tap('#hcStory');await tick(10);await tap('#slotList .go');
  for(let i=0;i<150;i++){if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on)))break;await p.waitForTimeout(1000)}
  console.log('roam',Date.now()-T0);await p.evaluate(()=>{window.__auto=false});for(let i=0;i<30;i++){await tick(30);if(!(await through()))break}await tick(60)}
 const key=async(k,on)=>on?p.keyboard.down(k):p.keyboard.up(k);
 const S=()=>p.evaluate(()=>{const R=__mho.RO;const d=Math.atan2(Math.sin(R.h-(R.vh??R.h)),Math.cos(R.h-(R.vh??R.h)));return{v:R.v,h:R.h,slip:d,x:R.x,z:R.z,bm:__mho.pl.bm,top:R.top}});
 // scripted drive: [frames, keys]
 const PLAN=[[240,['ArrowUp']],[90,['ArrowUp','ArrowRight']],[120,['ArrowUp']],[90,['ArrowUp','Shift']],[60,['ArrowUp','ArrowLeft','KeyX']],[60,['ArrowUp']],[60,['ArrowDown']],[120,['ArrowUp','ArrowLeft']],[180,['ArrowUp']],[60,['Space','ArrowUp']],[120,['ArrowUp']]];
 async function drive(tag){const held=new Set(),log=[];let f=0,stuck=0,maxV=0,slipSum=0,slipMax=0,n=0;const s0=await S();
  for(const [fr,ks] of PLAN){for(const k of[...held])if(!ks.includes(k)){await key(k,false);held.delete(k)}for(const k of ks)if(!held.has(k)){await key(k,true);held.add(k)}
   for(let i=0;i<fr;i+=6){await tick(6);f+=6;const s=await S();n++;maxV=Math.max(maxV,s.v);slipSum+=Math.abs(s.slip);slipMax=Math.max(slipMax,Math.abs(s.slip));if(Math.abs(s.v)<1.4)stuck++;if(f%30===0)log.push([f,+(s.v*3.6).toFixed(2),+(s.slip*57.3).toFixed(2),+s.x.toFixed(2),+s.z.toFixed(2)])}}
  for(const k of held)await key(k,false);const s1=await S();
  return{tag,maxKmh:+(maxV*3.6).toFixed(2),slipAvgDeg:+(slipSum/n*57.3).toFixed(3),slipMaxDeg:+(slipMax*57.3).toFixed(2),stuckPct:+(100*stuck/n).toFixed(1),dist:+Math.hypot(s1.x-s0.x,s1.z-s0.z).toFixed(2),endKmh:+(s1.v*3.6).toFixed(2),bm:+s1.bm.toFixed(2),log}}
 // turn rate: hold GAS 3 s, then GAS+RIGHT 1 s; yaw rate deg/s over the steer second
 async function turnRate(){await key('ArrowDown',true);for(let i=0;i<40;i++){await tick(10);if(Math.abs((await S()).v)<.5)break}await key('ArrowDown',false);
  await key('ArrowUp',true);await tick(75);const a=await S();await key('ArrowRight',true);await tick(30);const c=await S();await key('ArrowRight',false);await key('ArrowUp',false);
  let d=c.h-a.h;d=Math.atan2(Math.sin(d),Math.cos(d));return{kmh:+(a.v*3.6).toFixed(1),kmhEnd:+(c.v*3.6).toFixed(1),yawDegS:+Math.abs(d*57.3*2).toFixed(1)}}
 const R={mode:MODE,url:URL};
 if(MODE==='ab'){await toRoam(true);R.ab=await drive('A');await shot('ab_end')}
 if(MODE==='plain'){await toRoam(true);R.gear=await rect('#tuG');R.drawer=await p.evaluate(()=>!!document.querySelector('#tuD'));R.tune=await p.evaluate(()=>window.__tune?__tune.TU.show:null);await shot('plain_roam')}
 if(MODE==='ui'){await toRoam(true);await p.evaluate(()=>{window.__auto=false});await tick(30);
  R.gear=await rect('#tuG');R.dbAtLoad=await p.evaluate(()=>window.__dbW);await shot('tune_closed');
  // controls vs gear / drawer overlap
  const ctl=async()=>p.evaluate(()=>[...document.querySelectorAll('#touch .tbtn')].filter(e=>e.getBoundingClientRect().width>4&&getComputedStyle(e).display!=='none').map(e=>{const r=e.getBoundingClientRect();return{id:e.id,x:r.left,y:r.top,w:r.width,h:r.height}}));
  const ov=(a,c)=>c.filter(q=>Math.min(a.x+a.w,q.x+q.w)-Math.max(a.x,q.x)>0&&Math.min(a.y+a.h,q.y+q.h)-Math.max(a.y,q.y)>0).map(q=>q.id);
  R.ctl=await ctl();R.gearOverlap=ov(R.gear,R.ctl);
  R.turnDefault=await turnRate();
  await tap('#tuG');await tick(20);R.drawer=await rect('#tuD');R.drawerOverlap=ov(R.drawer,await ctl());await shot('tune_open_steer');
  // steering slider: a real touch at 80 % along the "Steer angle (slow)" track
  const sl=await rect('#tuD input[data-k="TUNE.stAng"]');await touch(sl.x+sl.w*.8,sl.y+sl.h/2);R.stAng=await p.evaluate(()=>__tune.get('TUNE.stAng'));await shot('tune_steer_moved');
  await tap('#tuD [data-a=x]');await tick(10);R.turnChanged=await turnRate();
  await tap('#tuG');await tick(10);await tap('#tuD [data-g=Camera]');await tick(10);await shot('tune_open_camera');
  const cd=await rect('#tuD input[data-k="RCAM.chase.b"]');await touch(cd.x+cd.w*.9,cd.y+cd.h/2);R.camB=await p.evaluate(()=>__tune.get('RCAM.chase.b'));await tap('#tuD [data-a=x]');await tick(60);await shot('tune_cam_far');
  // saves: SAVE v1 (note), RESET steering, SAVE v2, ★ v1, reload → v1 values come back
  await tap('#tuG');await tick(5);await tap('#tuD [data-g=Saves]');await tick(5);await p.fill('#tuN','far cam + sharp steer');await tap('#tuD [data-a=save]');await p.waitForTimeout(500);await tick(5);
  await tap('#tuD [data-g=Steer]');await tick(3);await tap('#tuD [data-a=reset]');await tick(3);await tap('#tuD [data-g=Saves]');await tick(3);await p.fill('#tuN','default steer');await tap('#tuD [data-a=save]');await p.waitForTimeout(500);await tick(5);
  await tap('#tuD [data-a=cur][data-v="1"]');await p.waitForTimeout(300);await tick(5);await shot('tune_saves');
  R.list=await p.evaluate(()=>__tune.TU.list.map(q=>({v:q.v,note:q.note,stAng:q.values['TUNE.stAng'],camB:q.values['RCAM.chase.b']})));R.cur=await p.evaluate(()=>__tune.TU.cur);
  await tap('#tuD [data-a=load][data-v="2"]');await tick(3);R.afterLoad2=await p.evaluate(()=>__tune.get('TUNE.stAng'));
  await tap('#tuD [data-a=exp]');await p.waitForTimeout(300);await tick(3);R.exportLen=await p.evaluate(()=>(__tune.TU.exp||'').length);
  const w0=await p.evaluate(()=>window.__dbW);await p.reload();await p.waitForFunction(()=>window.__tune&&__tune.TU.src!=='defaults',null,{timeout:20000}).catch(()=>{});
  R.reload={src:await p.evaluate(()=>__tune.TU.src),stAng:await p.evaluate(()=>__tune.get('TUNE.stAng')),camB:await p.evaluate(()=>__tune.get('RCAM.chase.b')),writesOnLoad:await p.evaluate(()=>window.__dbW)}}
 R.errors=errs;fs.writeFileSync(path.join(OUT,MODE+'.json'),JSON.stringify(R,null,1));console.log(JSON.stringify(R).slice(0,6000));await b.close()})();
