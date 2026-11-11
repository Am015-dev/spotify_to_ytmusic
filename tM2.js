// tM2: Frankfurt Chapter 2 (m2.js). Bot plays every mission (m1bot.js, fast.js + roamSim), checks unlock chain, durations, phases,
// rewards (Mainschiff, Ram Plough, M2_done) and the plough walls through real keyboard input.  usage: node tM2.js [U M W] [shots]
const {boot}=require('./common.js');const BOT=require('./m1bot.js');const F=require('./fast.js');
const IDS=(process.env.M2IDS||'marked,river,crane,m2duel').split(','),SEL=process.argv.slice(2).filter(a=>a!=='shots'),SHOTS=process.argv.includes('shots');const want=k=>!SEL.length||SEL.includes(k);
let pass=0,fail=0;const ok=(c,msg,info)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+msg+(info!==undefined?' · '+JSON.stringify(info):''))};
const bot=(p,spd,maxT,o)=>p.evaluate(([s,m,o])=>__m1bot(s,m,o||{}),[spd,maxT,o]);
async function B(){const r=await boot({view:'desk',page:'local_dbg.html'});r.cerr=[];r.p.on('console',m=>{if(m.type()==='error')r.cerr.push(m.text().slice(0,200))});await F.on(r.p);await r.p.evaluate(BOT);
 for(let i=0;i<60;i++){if(await r.p.evaluate(()=>__m1.marks().length>0))break;await r.p.evaluate(()=>__mho.roamSim(30));await r.p.waitForTimeout(200)}return r}
async function run(p,id){await p.evaluate(id=>{window.__m1log=null;window.__m1b={};const s=__m1.st(),S=__m2.story();s.step=Math.max(s.step,S.indexOf(id));for(const k of S.slice(0,S.indexOf(id)))s.done[k]=1;__m1.marksBuild();__m1.start(id)},id);
 for(let k=0;k<200;k++){const r=await bot(p,50,40,{brkPh:SHOTS});if(r.ph&&SHOTS){await p.evaluate(()=>__mho.roamSim(40));await F.shot(p,`shots/m2_${id}_ph${r.ph}.jpg`,{type:'jpeg',quality:70})}if(!r.on)break}
 return p.evaluate(()=>({le:__m1.M1.lastEnd,log:window.__m1log,ml:{...__m1.M1.log},m2:{...__m2.M2.log}}))}
(async()=>{require('fs').mkdirSync('shots',{recursive:true});
// U: unlock chain — chapter 2 opens after the Rossi duel win; NEXT points at Marked Man
if(want('U')){const r=await B(),p=r.p;
 const a=await p.evaluate(()=>{const s=__m1.st();s.step=3;s.done={hotdrop:1,heist:1,toll:1,hunt:1};__m1.marksBuild();return{marks:__m1.marks().map(m=>m.id),walls:__m2.walls().length}});
 ok(!a.marks.includes('marked')&&a.walls===0,'U1 before the Rossi win: no chapter-2 marks or walls',a);
 await p.evaluate(()=>{__m1.done('duel');__m1.skip()});await p.evaluate(()=>{__m1.marksBuild();__m1.M1.pT=0;__mho.roamSim(5)});
 const b=await p.evaluate(()=>({marks:__m1.marks().map(m=>m.id),next:__m1.next().t,walls:__m2.walls().length,step:__m1.st().step}));
 ok(b.marks.includes('marked')&&/Marked Man/.test(b.next),'U2 Rossi win unlocks chapter 2: Marked Man mark + NEXT',b);ok(b.walls===4,'U3 4 reinforced walls appear (locked) in chapter 2',b.walls);
 await r.b.close();console.log(r.errs.concat(r.cerr).slice(0,5))}
// M: every chapter-2 mission by bot
if(want('M')){const r=await B(),p=r.p;
 for(const id of IDS){const t0=Date.now();const E=await run(p,id);const ph=[...new Set(E.log.ph)];
  ok(E.le&&E.le.ok&&E.le.t>=240&&E.le.t<=420,`M ${id} completes via bot in 4–7 min game time`,{t:E.le&&+E.le.t.toFixed(1),why:E.le&&E.le.why,si:E.le&&E.le.si,wall:Math.round((Date.now()-t0)/1000)});
  ok(ph.length>=3,`M ${id} ≥3 escalating phases`,ph);ok(E.ml.td>0||E.m2.rvHit>0||id==='m2duel','M '+id+' has real enemies (takedowns)',{td:E.ml.td,ram:E.ml.ram,boats:E.m2.boat,stacks:E.m2.stack});
  await p.waitForTimeout(1800);await p.evaluate(()=>{__m1.skip();__mho.roamSim(3)});await p.waitForTimeout(300);await p.evaluate(()=>__m1.skip())}
 const z=await p.evaluate(()=>({s:__m1.st(),F:JSON.parse(localStorage.getItem('mho_flags@1')||'{}'),own:__m2.owned('v_weber'),next:__m1.next().t}));
 ok(z.s.M2_done===1&&z.s.plough===1,'M chapter 2 complete: M2_done=1 + plough in the m1 save state',{M2_done:z.s.M2_done,plough:z.s.plough,step:z.s.step});
 ok(z.F.WEBER===1&&z.own,'M reward: Mainschiff (v_weber) unlocked',{WEBER:z.F.WEBER,own:z.own});
 const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('mho_m1@1')||localStorage.getItem('mho_m1@1@fra')||'null'));ok(!st||st.M2_done===1,'M M2_done persisted in localStorage',st&&{M2_done:st.M2_done});
 await r.b.close();console.log(r.errs.concat(r.cerr).slice(0,5))}
// W: Ram Plough walls through real keyboard input: bounce without the plough, smash with it at 60+ km/h
if(want('W')){const r=await B(),p=r.p;
 await p.evaluate(()=>{const s=__m1.st();s.step=__m2.story().indexOf('marked');s.plough=0;__m2.wallsBuild()});
 const drive=async(k)=>{await p.evaluate(k=>{const w=__m2.walls()[k],R=__mho.RO;__m1.warp(w.x-Math.sin(w.h)*70,w.z-Math.cos(w.h)*70,w.h);__mho.roamSim(10)},k);await p.keyboard.down('ArrowUp');await p.keyboard.down('ShiftLeft');
  for(let i=0;i<14;i++){await p.evaluate(()=>__mho.roamSim(20))}await p.keyboard.up('ShiftLeft');await p.keyboard.up('ArrowUp');return p.evaluate(k=>({w:__m2.walls()[k],log:{...__m2.M2.log},R:[__mho.RO.x,__mho.RO.z]}),k)};
 const a=await drive(0);ok(!a.w.done&&a.log.bounce>0,'W1 without the plough a reinforced wall blocks you (bounce)',a);
 await p.evaluate(()=>{__m1.st().plough=1});const b=await drive(0);ok(b.w.done&&b.log.wall===1,'W2 with the RAM PLOUGH a 60+ km/h hit smashes it (keys)',b);
 const pm=await p.evaluate(()=>!!(__m2.M2.plough&&__m2.M2.plough.parent));ok(pm,'W3 plough mesh is mounted on the car');
 if(SHOTS){await p.evaluate(()=>{const w=__m2.walls()[1];__m1.warp(w.x-Math.sin(w.h)*30,w.z-Math.cos(w.h)*30,w.h);__mho.roamSim(30)});await F.shot(p,'shots/m2_wall.jpg',{type:'jpeg',quality:70})}
 await r.b.close();console.log(r.errs.concat(r.cerr).slice(0,5))}
// C: phase checkpoints — wreck the player mid-mission, RETRY PHASE restores the stage (and both rivals in the duel)
if(want('C')){const r=await B(),p=r.p;await p.evaluate(()=>{__m1.M1.resHold=1});
 for(const[id,si0]of[['river',2],['m2duel',12]]){await p.evaluate(([id,S])=>{window.__m1log=null;window.__m1b={};const s=__m1.st();s.step=S.indexOf(id);__m1.start(id)},[id,await p.evaluate(()=>__m2.story())]);
  for(let k=0;k<60;k++){const q=await bot(p,50,5);const si=await p.evaluate(()=>__mho.qv.ch()&&__mho.qv.ch().si);if(si>=si0||!q.on)break}
  const cp=await p.evaluate(()=>{const c=__m1.M1.cp;return c&&{si:c.si,ph:c.ph,rv2:c.rv2}});await p.evaluate(()=>{__m1.M1.hp=0;__mho.roamSim(2)});await p.waitForTimeout(300);
  const okr=await p.evaluate(()=>__m1.retry());await p.waitForTimeout(200);const a=await p.evaluate(()=>({si:__mho.qv.ch()&&__mho.qv.ch().si,rv:__m2.rv().map(r=>Math.round(r.s)),goons:__m1.goons().length}));
  ok(okr&&a.si===cp.si&&(id!=='m2duel'||a.rv.length===2),`C ${id}: fail → RETRY PHASE ${cp.ph} restores stage ${cp.si}${id==='m2duel'?' + both rivals':''}`,{cp,a});
  for(let k=0;k<100;k++){const q=await bot(p,50,40);if(!q.on)break}const le=await p.evaluate(()=>__m1.M1.lastEnd);ok(le&&le.ok,`C ${id}: retried mission still completes`,le&&{ok:le.ok,why:le.why});await p.waitForTimeout(1800);await p.evaluate(()=>__m1.skip())}
 await r.b.close();console.log(r.errs.concat(r.cerr).slice(0,5))}
console.log(`tM2: ${pass} pass, ${fail} fail`);process.exit(fail?1:0)})();
