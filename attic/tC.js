// tC: Milestone 1 real-input tests (scenes, missions via bot, checkpoint retry, goons, items + touch ITEM button, NEXT guidance, map reveal, Athens counter, perf)
// usage: node tC.js [A B C D E F G H P]   (default: all)
const {boot}=require('./common.js');const BOT=require('./m1bot.js');const fs=require('fs');
const SEL=process.argv.slice(2);const want=k=>!SEL.length||SEL.includes(k);
let pass=0,fail=0;const R=[];const ok=(c,msg,info)=>{c?pass++:fail++;const l=(c?'PASS ':'FAIL ')+msg+(info!==undefined?' · '+(typeof info==='string'?info:JSON.stringify(info)):'');R.push(l);console.log(l)};
const SH='shots/';const SHOT=async(p,path)=>{try{await p.screenshot({path,timeout:240000})}catch(e){console.log('shot fail',path,e.message.slice(0,80))}};const allErrs=[];
async function B(o){const r=await boot(o);r.cerr=[];r.p.on('console',m=>{if(m.type()==='error')r.cerr.push(m.text().slice(0,200))});await r.p.evaluate(BOT);
 for(let i=0;i<60;i++){const n=await r.p.evaluate(()=>!window.__m1||(__m1.marks().length||__mho.cid()!=='fra'));if(n)break;await r.p.evaluate(()=>__mho.roamSim(30));await r.p.waitForTimeout(300)}
 await r.p.evaluate(()=>{window.__cam={n:0,bad:0,bld:0,ex:[]};const f=()=>{try{if(window.__m1&&__mho.state==='roam'&&!__m1.cs()){const q=__m1.camInside();__cam.n++;if(q.bld)__cam.bld++;if(q.deb||q.goon){__cam.bad++;if(__cam.ex.length<5)__cam.ex.push(q)}}}catch(e){}requestAnimationFrame(f)};requestAnimationFrame(f)});return r}
async function done(r,tag){try{const c=await r.p.evaluate(()=>window.__cam);if(c&&c.n>20)ok(c.bad===0,`${tag}: camera never inside a goon mesh or debris (sampled every frame)`,c)}catch(e){}allErrs.push(...r.errs.map(e=>tag+': '+e),...r.cerr.map(e=>tag+' console: '+e));await r.b.close()}
const bot=(p,spd,maxT,o)=>p.evaluate(([s,m,o])=>__m1bot(s,m,o||{}),[spd,maxT,o]);
async function runMission(p,id,shots,tag){await p.evaluate(id=>{window.__m1log=null;window.__m1b={};const s=__m1.st();if(id!=='hotdrop'&&['heist','toll','duel'].includes(id))s.step=Math.max(s.step,['hotdrop','heist','toll','duel'].indexOf(id));if(id==='duel'){s.done.hunt=1;s.done.hotdrop=s.done.heist=s.done.toll=1}__m1.start(id)},id);
 let shot=0;for(let k=0;k<200;k++){const r=await bot(p,50,40,{brkPh:!!shots});if(r.ph&&shots){await p.waitForTimeout(700);await p.evaluate(()=>__mho.roamSim(40));await p.waitForTimeout(500);await SHOT(p,`${SH}${tag||'m'}_${id}_ph${r.ph}.png`);shot++}if(!r.on)break}
 return p.evaluate(()=>({le:__m1.M1.lastEnd,log:window.__m1log,ml:{...__m1.M1.log}}))}
(async()=>{
// ---------------- A: new story (fresh save) on desktop: Kaiser < 2 min, skippable scenes, opening completes, results NEXT, map reveal
if(want('A')){const r=await B({view:'desk',roam:{tut:0}}),p=r.p;await p.evaluate(()=>{__m1.M1.csHold=1;__m1.M1.resHold=1});const t0=Date.now();
 let cs=null,gt0=0;for(let i=0;i<80&&!cs;i++){cs=await p.evaluate(()=>__m1.cs());if(!cs){await p.evaluate(()=>__mho.roamSim(10));gt0+=10/60;await p.waitForTimeout(250)}}
 ok(cs&&cs.who==='HILDE','A1 new save auto-starts the opening scene (Hilde)',{cs,wallS:(Date.now()-t0)/1000,gameS:+gt0.toFixed(1)});
 ok(await p.evaluate(()=>!__mho.storyClose&&false||document.querySelector('#story').hidden),'A2 the old chapter-1 text panel is replaced by the scene');
 await p.waitForTimeout(1200);await SHOT(p,SH+'cs_open_desk.png');
 const box=await p.evaluate(()=>{const r=document.querySelector('#m1Cs .tk').getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});await p.mouse.click(box[0],box[1]);await p.waitForTimeout(300);
 const cs2=await p.evaluate(()=>__m1.cs());ok(cs2&&cs2.i===1,'A3 a real click advances the scene line',cs2);
 await p.mouse.click(box[0],box[1]);await p.waitForTimeout(300);ok(!(await p.evaluate(()=>__m1.cs())),'A4 second click ends the 2-line scene');
 // drive with the bot until the Kaiser scene
 await p.evaluate(()=>{window.__m1log={cs:[],skips:0,gt:0,ph:[]};window.__m1b={}});let kz=null;
 for(let k=0;k<20&&!kz;k++){const q=await bot(p,50,20,{stopCs:true});if(q.cs){kz={...q.cs,gt:await p.evaluate(()=>+(__mho.qv.ch().t).toFixed(1))};break}if(!q.on)break}
 ok(kz&&kz.who==='KAISER'&&kz.gt<120,'A5 Kaiser appears on screen (scene) within 2 min of mission time',kz);
 await p.waitForTimeout(1500);await p.evaluate(()=>__mho.roamSim(1));await p.waitForTimeout(800);await SHOT(p,SH+'cs_kaiser_desk.png');
 await p.keyboard.press('Escape');await p.waitForTimeout(300);ok(!(await p.evaluate(()=>__m1.cs())),'A6 Escape key skips the whole scene');
 // rest of the opening by bot, screenshot each phase
 let shotN=0;for(let k=0;k<200;k++){const q=await bot(p,50,40,{brkPh:true});if(q.ph){await p.waitForTimeout(600);await p.evaluate(()=>__mho.roamSim(30));await p.waitForTimeout(500);await SHOT(p,`${SH}m_hotdrop_ph${q.ph}.png`);shotN++}if(!q.on)break}
 await p.waitForTimeout(400);await SHOT(p,SH+'results_hotdrop_desk.png');
 const E=await p.evaluate(()=>({le:__m1.M1.lastEnd,log:window.__m1log,res:!document.querySelector('#chRes').hidden,txt:document.querySelector('#chRes')?.innerText.slice(0,200)}));
 const ph=[...new Set(E.log.ph)];ok(E.le&&E.le.ok&&E.le.t>=240&&E.le.t<=420,'A7 Hot Drop completes via bot in 4–7 min game time',{t:E.le&&+E.le.t.toFixed(1),ok:E.le&&E.le.ok,why:E.le&&E.le.why});
 ok(ph.length>=3,'A8 Hot Drop has ≥3 distinct phases',ph);ok(E.log.skips+2<=4,'A9 scene taps/skips to get through the opening ≤ 4',E.log.skips+2);
 const nb=await p.evaluate(()=>{const b=document.querySelector('#m1ResNext');if(!b||b.closest('#chRes').hidden)return null;const r=b.getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2,b.textContent]});
 ok(E.res&&nb&&/NEXT ▸/.test(nb[2]),'A10 results card shows a NEXT button',nb&&nb[2]);
 if(nb){await p.mouse.click(nb[0],nb[1]);await p.waitForTimeout(300)}
 const wp=await p.evaluate(()=>{const w=__mho.RO.wp;return w&&w.ev&&w.ev.mid});ok(nb&&wp==='heist','A11 clicking results NEXT routes to the next objective (Ebbelwoi Heist)',{btn:nb&&nb[2],wp});
 // garage end scene appears once no event runs; skip with the SKIP button
 let es=null;for(let i=0;i<20&&!es;i++){await p.evaluate(()=>__mho.roamSim(5));await p.waitForTimeout(300);es=await p.evaluate(()=>__m1.cs())}ok(es&&es.n>=2,'A12 garage scene after the opening (BRIX intro)',es);await p.waitForTimeout(600);await SHOT(p,SH+'cs_garage_desk.png');
 const sk=await p.evaluate(()=>{const r=document.querySelector('#m1Skip').getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});await p.mouse.click(sk[0],sk[1]);await p.waitForTimeout(300);ok(!(await p.evaluate(()=>__m1.cs())),'A13 SKIP button ends the scene');
 await p.evaluate(()=>__mho.roamSim(30));await p.waitForTimeout(500);const pill=await p.evaluate(()=>{const e=document.querySelector('#m1Next');return{vis:!e.hidden,t:e.innerText}});ok(pill.vis&&/Heist/.test(pill.t),'A14 NEXT pill shows the next story beat',pill);await SHOT(p,SH+'next_pill_desk.png');
 const mp=await p.evaluate(()=>{const M=__mho,RO=M.RO;const vis=RO.marks.filter(m=>__mho.mark&&true).filter(m=>{try{return !!m&&__m1.allow(m)}catch(e){return false}});const known=RO.marks.filter(m=>{const o=m;return true});return{gated:__m1.gated(),shown:RO.marks.filter(m=>m.g&&m.g.visible).map(m=>m.m1?'m1:'+m.ev.mid:m.kind+':'+(m.ev?m.ev.id||m.ev.p:m.id))}});
 ok(mp.gated&&mp.shown.every(s=>/^(m1:|garage|flight|otg:sp1|otg:cl1)/.test(s)),'A15 fresh save: only chapter-1 icons in the world',mp.shown);
 await p.evaluate(()=>__mho.toggleMap(true));await p.waitForTimeout(800);await SHOT(p,SH+'map_ch1_desk.png');await p.evaluate(()=>__mho.toggleMap(false));
 await done(r,'A')}
// ---------------- B: story missions + activities via bot (existing save: migrated, not gated)
if(want('B')){const r=await B({view:'desk'}),p=r.p;
 const st=await p.evaluate(()=>({st:__m1.st(),gated:__m1.gated(),next:__m1.next().t}));ok(!st.gated&&st.st.fresh===0&&/Hot Drop/.test(st.next),'B1 existing save migrates: not gated, NEXT offers the opening',st);
 for(const id of ['heist','toll','duel']){const E=await runMission(p,id,true,'m');const ph=[...new Set(E.log.ph)];
  ok(E.le&&E.le.ok&&E.le.t>=240&&E.le.t<=420,`B ${id} completes via bot in 4–7 min game time`,{t:E.le&&+E.le.t.toFixed(1),ok:E.le&&E.le.ok,why:E.le&&E.le.why,rams:E.ml.ram,td:E.ml.td});
  ok(ph.length>=3,`B ${id} ≥3 distinct phases`,ph);await p.waitForTimeout(400);if(id==='toll')await SHOT(p,SH+'results_toll_desk.png');await p.waitForTimeout(1600);await p.evaluate(()=>__m1.skip());}
 const fl=await p.evaluate(()=>({F:__mho.story&&JSON.parse(localStorage.getItem('mho_flags@1')||'{}'),st:__m1.st()}));ok(fl.st.wpn===1&&fl.F.ROSSI===1,'B duel win unlocks the item slot and Rossi’s flag',{wpn:fl.st.wpn,rossi:fl.F.ROSSI});
 for(const id of ['hunt','rampage']){const E=await runMission(p,id,id==='hunt','a');const ph=[...new Set(E.log.ph)];ok(E.le&&E.le.ok&&ph.length>=3,`B activity ${id} completes via bot with ≥3 phases`,{t:E.le&&+E.le.t.toFixed(1),ok:E.le&&E.le.ok,why:E.le&&E.le.why,ph,rams:E.ml.ram,td:E.ml.td});await p.waitForTimeout(500)}
 const L=await p.evaluate(()=>({...__m1.M1.log}));ok(L.ram>0,'B goons ram the player (contact events logged)',L.ram);ok(L.td>0,'B takedowns register',L.td);
 await p.evaluate(()=>{__m1.skip();const s=__m1.st();s.step=4});await p.evaluate(()=>{__m1.M1.pT=0;__mho.roamSim(2)});await p.waitForTimeout(400);const pl=await p.evaluate(()=>document.querySelector('#m1Next').innerText);ok(/Rival|Boss|·/.test(pl)&&pl.length>5,'B after chapter 1 the NEXT pill points at the next rival',pl);
 await done(r,'B')}
// ---------------- C: checkpoint retry (<2 s) after a health fail mid-mission
if(want('C')){const r=await B({view:'desk'}),p=r.p;await p.evaluate(()=>{__m1.M1.resHold=1});
 await p.evaluate(()=>{window.__m1log=null;window.__m1b={};const s=__m1.st();s.step=1;__m1.start('heist')});
 for(let k=0;k<30;k++){const q=await bot(p,50,10);const si=await p.evaluate(()=>__mho.qv.ch()&&__mho.qv.ch().si);if(si>=1||!q.on)break}
 await bot(p,50,3);const cp=await p.evaluate(()=>{const c=__m1.M1.cp;return c&&{si:c.si,ph:c.ph,x:c.x,z:c.z}});
 await p.evaluate(()=>{__m1.M1.hp=0;__mho.roamSim(2)});await p.waitForTimeout(500);const fr=await p.evaluate(()=>({le:__m1.M1.lastEnd,btn:document.querySelector('#m1Retry')&&document.querySelector('#m1Retry').textContent}));
 ok(fr.le&&!fr.le.ok&&/WRECKED/.test(fr.le.why||'')&&fr.btn,'C1 HP 0 fails the mission with a RETRY PHASE button',fr);await SHOT(p,SH+'fail_retry_desk.png');
 const b=await p.evaluate(()=>{const r=document.querySelector('#m1Retry').getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});const t0=Date.now();await p.mouse.click(b[0],b[1]);
 await p.waitForFunction(si=>__mho.qv.ch()&&__mho.qv.ch().si===si,cp.si,{timeout:10000}).catch(()=>{});const wall=Date.now()-t0;
 const after=await p.evaluate(()=>({ch:__mho.qv.ch()&&__mho.qv.ch().si,x:__mho.RO.x,z:__mho.RO.z,hp:__m1.M1.hp,ms:__m1.M1.retryMs,goons:__m1.goons().length}));
 ok(after.ch===cp.si&&Math.hypot(after.x-cp.x,after.z-cp.z)<6&&after.hp>=60,'C2 retry restores the phase checkpoint (stage, position, HP, goons)',{cp,after});
 ok(wall<2000&&after.ms<500,'C3 retry from checkpoint takes < 2 s',{wallMs:wall,inPageMs:after.ms&&+after.ms.toFixed(1)});
 const E=await (async()=>{for(let k=0;k<100;k++){const q=await bot(p,50,40);if(!q.on)break}return p.evaluate(()=>__m1.M1.lastEnd)})();ok(E&&E.ok,'C4 the retried mission can still be completed',E);
 // idle player gets wrecked by goons in a fight → fail → retry works
 await p.evaluate(()=>{window.__m1b={};__m1.start('hunt')});for(let k=0;k<12;k++){const q=await bot(p,50,15,{idle:true});if(!q.on)break}
 const f2=await p.evaluate(()=>({le:__m1.M1.lastEnd,rams:__m1.M1.log.ram}));ok(f2.le&&!f2.le.ok&&/WRECKED|TIME/.test(f2.le.why),'C5 standing still in a goon fight leads to a fail',f2);
 await p.waitForTimeout(300);const okr=await p.evaluate(()=>__m1.retry());await p.waitForTimeout(200);ok(okr&&(await p.evaluate(()=>!!__mho.qv.ch())),'C6 retry after a health fail restarts the phase');
 await p.evaluate(()=>__mho.qv.abandon());await done(r,'C')}
// ---------------- E: free-roam items, keyboard FIRE (desktop)
if(want('E')){const r=await B({view:'desk'}),p=r.p;
 await p.evaluate(()=>{const s=__m1.st();s.wpn=1;s.step=4;__m1.boxCity()});const bx=await p.evaluate(()=>__m1.boxes().filter(b=>!b.mis));ok(bx.length>=20,'E1 item boxes spread over the city after unlock',bx.length);
 const got=await p.evaluate(()=>{const b=__m1.boxes().filter(b=>!b.mis).sort((a,c)=>Math.hypot(a.x-__mho.RO.x,a.z-__mho.RO.z)-Math.hypot(c.x-__mho.RO.x,c.z-__mho.RO.z))[0];__m1.warp(b.x-20,b.z,Math.PI/2);const R=__mho.RO;for(let i=0;i<120&&!__m1.M1.inv;i++){const d=Math.hypot(b.x-R.x,b.z-R.z);if(d>1){R.x+=(b.x-R.x)/d*Math.min(d,.6);R.z+=(b.z-R.z)/d*Math.min(d,.6)}__mho.roamSim(1)}return{inv:__m1.M1.inv,pick:__m1.M1.log.pick}});
 ok(!!got.inv,'E2 driving through a ? box picks up an item',got);
 await p.evaluate(()=>{__m1.give('missile');__m1.clear();const R=__mho.RO;const id=__m1.spawn('rammer',1)[0];const g=__m1.M1.goons.find(q=>q.id===id);g.x=R.x+Math.sin(R.h)*45;g.z=R.z+Math.cos(R.h)*45;g.cd=99});await p.waitForTimeout(300);
 const f0=await p.evaluate(()=>__m1.M1.log.fire);await p.keyboard.press('KeyF');await p.waitForTimeout(250);await p.evaluate(()=>__mho.roamSim(8));await p.waitForTimeout(150);await SHOT(p,SH+'weapon_missile_desk.png');
 const f1=await p.evaluate(()=>({fire:__m1.M1.log.fire,proj:__m1.M1.proj.length,last:__m1.M1.lastFire}));ok(f1.fire===f0+1&&f1.last==='missile','E3 keyboard F fires the missile',f1);
 await p.evaluate(()=>__mho.roamSim(90));const h1=await p.evaluate(()=>({hit:__m1.M1.log.hit,goons:__m1.goons()}));ok(h1.hit>=1,'E4 the homing missile hits the goon',h1);
 await p.evaluate(()=>__m1.give('mines'));await p.keyboard.press('KeyE');await p.waitForTimeout(200);const mn=await p.evaluate(()=>__m1.M1.mines.length);ok(mn===3,'E5 E key (alt) drops 3 mines',mn);await p.evaluate(()=>__mho.roamSim(20));await SHOT(p,SH+'weapon_mines_desk.png');
 await p.evaluate(()=>__m1.give('ghost'));await p.keyboard.press('KeyF');await p.waitForTimeout(100);const gh=await p.evaluate(()=>__m1.M1.ghost);ok(gh>4,'E6 ghost item gives 6 s of ghost',gh);
 await done(r,'E')}
// ---------------- T: touch ITEM button: placement (no overlap) + in-page touch fire, portrait and landscape 844x390
if(want('T'))for(const view of ['port','land']){const r=await B({view}),p=r.p;
 await p.evaluate(()=>{const s=__m1.st();s.wpn=1;s.step=4;__m1.give('missile')});await p.evaluate(()=>__mho.roamSim(40));await p.waitForTimeout(800);
 const L=await p.evaluate(()=>{const rc=e=>{const r=e.getBoundingClientRect();return{id:e.id,x:r.x,y:r.y,w:r.width,h:r.height}};const tw=document.querySelector('#tW');const others=[...document.querySelectorAll('#touch .tbtn,#roam button,#roamMini,#roamGauge,#m1Next')].filter(e=>e!==tw&&e.offsetParent!==null&&getComputedStyle(e).visibility!=='hidden').map(rc).filter(r=>r.w>4&&r.h>4);return{tw:rc(tw),disp:getComputedStyle(tw).display,others,vw:innerWidth,vh:innerHeight}});
 const ov=L.others.filter(o=>o.x<L.tw.x+L.tw.w&&o.x+o.w>L.tw.x&&o.y<L.tw.y+L.tw.h&&o.y+o.h>L.tw.y).map(o=>o.id);const inV=L.tw.x>=0&&L.tw.y>=0&&L.tw.x+L.tw.w<=L.vw&&L.tw.y+L.tw.h<=L.vh;
 ok(L.disp!=='none'&&inV&&!ov.length,`T ${view}: ITEM button visible, on screen, overlaps nothing`,{tw:L.tw,ov,vw:L.vw,vh:L.vh});
 const f=await p.evaluate(()=>{const el=document.querySelector('#tW'),r=el.getBoundingClientRect(),t=new Touch({identifier:77,target:el,clientX:r.x+r.width/2,clientY:r.y+r.height/2});const f0=__m1.M1.log.fire;el.dispatchEvent(new TouchEvent('touchstart',{touches:[t],changedTouches:[t],bubbles:true,cancelable:true}));el.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[t],bubbles:true,cancelable:true}));return{d:__m1.M1.log.fire-f0,last:__m1.M1.lastFire}});
 ok(f.d===1&&f.last==='missile',`T ${view}: touching ITEM fires the held item`,f);await p.evaluate(()=>__mho.roamSim(6));await SHOT(p,`${SH}touch_item_${view}.png`);
 // scene on the phone + NEXT pill
 await p.evaluate(()=>{const s=__m1.st();s.step=0;__m1.M1.pT=0;__mho.roamSim(2)});await p.waitForTimeout(500);await SHOT(p,`${SH}next_pill_${view}.png`);
 const pv=await p.evaluate(()=>{const e=document.querySelector('#m1Next');const r=e.getBoundingClientRect();return{vis:!e.hidden,t:e.innerText,r:[r.x,r.y,r.width,r.height]}});ok(pv.vis&&pv.t.length>5&&pv.r[0]>=0&&pv.r[0]+pv.r[2]<=(view==='port'?390:844),`T ${view}: NEXT pill visible and on screen`,pv);
 await p.evaluate(()=>__m1.start('hotdrop'));await p.waitForTimeout(1500);await SHOT(p,`${SH}cs_open_${view}.png`);
 const tap=await p.evaluate(()=>{const el=document.querySelector('#m1Cs'),t=new Touch({identifier:78,target:el,clientX:100,clientY:100});const i0=__m1.cs().i;el.dispatchEvent(new TouchEvent('touchstart',{touches:[t],changedTouches:[t],bubbles:true,cancelable:true}));return{i0,i1:__m1.cs()&&__m1.cs().i}});ok(tap.i1===tap.i0+1,`T ${view}: a tap advances the scene`,tap);
 await p.evaluate(()=>{__m1.skip()});for(let k=0;k<6;k++){const q=await bot(p,50,20,{brkPh:true});if(q.ph===2)break}await p.waitForTimeout(600);await p.evaluate(()=>__mho.roamSim(20));await p.waitForTimeout(500);await SHOT(p,`${SH}m_hotdrop_goons_${view}.png`);
 await p.evaluate(()=>__mho.qv.abandon());await done(r,'T'+view)}
// ---------------- K: takedowns right next to the player never bury the camera
if(want('K')){const r=await B({view:'desk'}),p=r.p;await p.evaluate(()=>{const s=__m1.st();s.step=2;__m1.start('hunt')});await p.evaluate(()=>__mho.roamSim(220));
 for(let k=0;k<12;k++){await p.evaluate(()=>{const R=__mho.RO,G=__m1.M1.goons.filter(g=>!g.dead);for(const g of G.slice(0,2)){g.x=R.x+Math.sin(R.h)*5;g.z=R.z+Math.cos(R.h)*5;g.cd=99;R.v=35;R.vh=R.h}});await p.waitForTimeout(700)}
 await SHOT(p,SH+'takedown_close_desk.png');const c=await p.evaluate(()=>({cam:window.__cam,td:__m1.M1.log.td}));ok(c.td>0&&c.cam.bad===0,'K1 close-range takedowns keep the camera clear of wrecks/debris',c);await p.evaluate(()=>__mho.qv.abandon());await done(r,'K')}
// ---------------- G: Athens chapter counter
if(want('G')){const r=await B({view:'desk',city:'ath'}),p=r.p;const a=await p.evaluate(()=>{const c0=__mho.chapter();__mho.flagSet('PAPPAS',1);__mho.flagSet('LAMBROU',1);const c1=__mho.chapter();return{c0,c1,cid:__mho.cid()}});
 ok(a.cid==='ath'&&a.c0===1&&a.c1===2,'G1 Athens chapter counter advances with Athens flags (2 flags → chapter 2)',a);
 await p.evaluate(()=>{__m1.M1.pT=0;__mho.roamSim(2)});await p.waitForTimeout(400);const t=await p.evaluate(()=>{const e=document.querySelector('#m1Next');return e&&{vis:!e.hidden,t:e.innerText}});ok(t&&t.vis&&t.t.length>5,'G2 NEXT pill shows an Athens objective',t);
 await done(r,'G')}
// ---------------- P: perf vs v75 (same view, idle roam + 6 goons in rfC)
if(want('P')){const meas=async(page,goons)=>{const r=await B({view:'desk',page}),p=r.p;if(goons)await p.evaluate(()=>{const s=__m1.st();s.step=2;__m1.start('hunt');__m1.skip();__mho.roamSim(200);__m1.spawn('rammer',3)});await p.evaluate(()=>__mho.roamSim(120));await p.waitForTimeout(2000);
  const sim=await p.evaluate(()=>{const T=[];for(let k=0;k<5;k++){const t=performance.now();__mho.roamSim(120);T.push(performance.now()-t)}T.sort((a,b)=>a-b);return +(T[2]/120).toFixed(3)});
  const g=await p.evaluate(()=>window.__m1?__m1.goons().length:0);await p.waitForTimeout(3000);const info=await p.evaluate(()=>__mho.info());await done(r,'P'+page);return{simMsPerStep:sim,goons:g,...info}};
 const a=await meas('dev/v75_local.html',false),b=await meas('local.html',true),a2=await meas('dev/v75_local.html',false),b2=await meas('local.html',true);const va=Math.min(a.simMsPerStep,a2.simMsPerStep),vb=Math.min(b.simMsPerStep,b2.simMsPerStep);
 ok(vb<=va*1.15,'P1 game-logic cost per 1/60 s step with 6 goons in a fight ≤ v75 idle +15% (best of 2 boots)',{v75:va,rfC:vb,ratio:+(vb/va).toFixed(2),runs:[a,b,a2,b2]})}

console.log('\nERRORS',allErrs.length,allErrs.slice(0,10));ok(allErrs.length===0,'Z no page errors / console errors across all runs',allErrs.length);
console.log(`\nTOTAL ${pass} pass / ${fail} fail`);fs.writeFileSync('tC_result'+(SEL.length?'_'+SEL.join(''):'')+'.txt',R.join('\n')+`\nTOTAL ${pass} pass / ${fail} fail\nERRORS ${JSON.stringify(allErrs)}\n`)})();
