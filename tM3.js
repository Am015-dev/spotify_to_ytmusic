// tM3: chapters 3+4 + Kaiser finale (m3.js). Gate + dev unlock, intro scene, all 9 missions via the M1 bot (game time, phases),
// rival finishes first when you idle (+ phase retry keeps rivals), Rocket Hop via real G key, Shockwave landing, touch 🚀 button, finale rewards.
// usage: node tM3.js [A B C D E]
const {boot}=require('./common.js');const BOT=require('./m1bot.js');const F=require('./fast.js');const fs=require('fs');
// m1bot + Rocket Hop: on the finale's leap stage the bot parks on the bridgehead ring and hops (same call as the G key)
const M3BOT=`window.__m3bot=maxT=>{const R=__mho.RO;let t=0;while(R.ch&&t<maxT){const h=__m1.hint();if(h&&h.t==='leap'&&!__m1.cs()&&Math.hypot(h.x-R.x,h.z-R.z)<3&&!((__mho.qv.ch()||{}).cd>0)){R.h=R.vh=R.h;__m3.hop();for(let i=0;i<150;i++)__mho.roamSim(1);t+=2.5;continue}const r=__m1bot(50,Math.min(5,maxT-t),{brkPh:true});t+=r.t||.02;if(r.ph)return{...r,on:!!R.ch};if(!r.on)break}return{t,on:!!R.ch}}`;
const SEL=process.argv.slice(2);const want=k=>!SEL.length||SEL.includes(k);fs.mkdirSync('shots',{recursive:true});
let pass=0,fail=0;const ok=(c,m,i)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''))};const allErr=[];
async function B(o){const r=await boot({page:'local_dbg.html',...o});r.cerr=[];r.p.on('console',m=>{if(m.type()==='error')r.cerr.push(m.text().slice(0,200))});await r.p.evaluate(BOT);await r.p.evaluate(M3BOT);await F.on(r.p);
 for(let i=0;i<60;i++){if(await r.p.evaluate(()=>window.__m1&&__m1.M1.mk))break;await r.p.evaluate(()=>__mho.roamSim(30));await r.p.waitForTimeout(200)}await r.p.evaluate(()=>{__m1.skip();__mho.storyClose&&__mho.storyClose()});return r}
const fin=async(r,tag)=>{allErr.push(...r.errs.map(e=>tag+': '+e),...r.cerr.map(e=>tag+' console: '+e));await r.b.close()};
const clearUi=p=>p.evaluate(()=>{for(let k=0;k<6;k++){__mho.roamSim(20);if(__m1.cs())__m1.skip();try{__mho.storyClose()}catch(e){}}const el=document.querySelector('#chRes');if(el)el.hidden=true});
async function run(p,id,shot){const k=await p.evaluate(()=>__m3.story);await p.evaluate(([id,i])=>{window.__m1log=null;window.__m1b={};__m3.setStep(i);__m3.start(id)},[id,k.indexOf(id)]);let n=0;
 for(let q=0;q<300;q++){const r=await p.evaluate(()=>__m3bot(40));if(r.ph&&shot&&n<1&&r.ph===2){n++;await p.evaluate(()=>__mho.roamSim(30));await F.shot(p,`shots/m3_${id}_ph2.jpg`,{type:'jpeg',quality:60})}if(!r.on)break}
 const E=await p.evaluate(()=>({le:__m1.M1.lastEnd,ph:[...new Set((window.__m1log||{ph:[]}).ph)],st:__m3.st(),log:__m3.log()}));await p.waitForTimeout(1700);await clearUi(p);return E}
(async()=>{
if(want('A')){const r=await B({}),p=r.p;
 const g=await p.evaluate(()=>({on:__m3.on(),marks:__m3.marks().length,next:__m1.next().t}));ok(!g.on&&g.marks===0&&!/Framed/.test(g.next),'A1 locked without M2_done: no chapter-3 mark, NEXT not chapter 3',g);
 await p.evaluate(()=>__m3.unlock());let cs=null;for(let i=0;i<20&&!cs;i++){cs=await p.evaluate(()=>{__mho.roamSim(10);return __m1.cs()})}
 ok(cs&&cs.who==='KAISER','A2 dev unlock (M2_done) plays the chapter-3 intro scene (Kaiser)',cs);await F.shot(p,'shots/m3_intro.jpg',{type:'jpeg',quality:60});
 await p.keyboard.press('Escape');await clearUi(p);const m=await p.evaluate(()=>({marks:__m3.marks(),next:__m1.next(),st:__m3.st()}));
 ok(m.marks.length===1&&m.marks[0].id==='framed'&&/Framed/.test(m.next.t),'A3 Framed mark on the map, NEXT bar points at it',{marks:m.marks,next:m.next.t});
 await p.evaluate(()=>{__m1.nextGo()});const wp=await p.evaluate(()=>__mho.RO.wp&&__mho.RO.wp.ev&&__mho.RO.wp.ev.mid);ok(wp==='framed','A4 NEXT routes the GPS to Framed',wp);
 // reload keeps the unlock + step (save state)
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:240000});await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{timeout:240000});await F.on(p);
 for(let i=0;i<40;i++){if(await p.evaluate(()=>__m3.marks().length))break;await p.evaluate(()=>__mho.roamSim(30))}ok(await p.evaluate(()=>__m3.on()&&__m3.marks()[0]&&__m3.marks()[0].id==='framed'),'A5 unlock and chapter-3 mark survive a reload');await fin(r,'A')}
if(want('B')){const r=await B({}),p=r.p;await p.evaluate(()=>__m3.unlock());await clearUi(p);const T={};
 for(const id of await p.evaluate(()=>__m3.story)){const E=await run(p,id,['framed','train','duel3','blackout','kaiser'].includes(id));const D=await p.evaluate(id=>__m3.def(id),id);T[id]=E.le&&+E.le.t.toFixed(0);
  const isRace=/duel/.test(id);ok(E.le&&E.le.ok&&E.le.mid===id,`B ${id}: completes via bot`,{ok:E.le&&E.le.ok,why:E.le&&E.le.why,si:E.le&&E.le.si,t:T[id]});
  if(!isRace)ok(E.le&&E.le.t>=240&&E.le.t<=420,`B ${id}: 4–7 min game time`,T[id]);ok(D.ph.length>=3&&E.ph.length>=3,`B ${id}: ≥3 phases played`,{def:D.ph.length,played:E.ph})}
 const st=await p.evaluate(()=>({st:__m3.st(),F:JSON.parse(localStorage.getItem('mho_flags@1')||localStorage.getItem('mho_flags')||'{}'),next:__m1.next().t}));
 ok(st.st.step===9&&st.st.hop&&st.st.shock&&st.st.crown,'B rewards: Rocket Hop (ch3), Shockwave (ch4), crown (finale) saved',st.st);
 ok(st.F.FERREIRA&&st.F['ÇELIK']&&st.F.BRANDT&&st.F.NAKAMURA&&st.F.SKYCUP,'B rival flags + SKYCUP set',st.F);ok(!/STORY|RIVAL|FINALE/.test(st.next),'B NEXT falls back to free roam after the finale',st.next);
 console.log('times',JSON.stringify(T));await fin(r,'B')}
if(want('C')){const r=await B({}),p=r.p;await p.evaluate(()=>{__m3.unlock();__m3.setStep(3)});await clearUi(p);
 await p.evaluate(()=>{window.__m1b={};__m3.start('duel3')});await p.evaluate(()=>{for(let i=0;i<6;i++){if(__m1.cs())__m1.skip();__mho.roamSim(30)}});
 const rv=await p.evaluate(()=>__m3.rv());ok(rv&&rv.length===2,'C1 two rivals spawn for the Ferreira/Çelik duel',rv);await F.shot(p,'shots/m3_duel3_start.jpg',{type:'jpeg',quality:60});
 // drive phase 1 with the bot, then idle: rivals must win
 for(let q=0;q<40;q++){const b=await p.evaluate(()=>__m1bot(50,20,{brkPh:true}));if(b.ph||!b.on)break}await p.evaluate(()=>{window.__m1b={}});
 const rv1=await p.evaluate(()=>__m3.rv());for(let q=0;q<60;q++){const b=await p.evaluate(()=>__m1bot(50,20,{idle:true}));if(!b.on)break}
 const le=await p.evaluate(()=>__m1.M1.lastEnd);ok(le&&!le.ok&&/WON THE DUEL/.test(le.why||''),'C2 idling lets a rival finish first (fail)',le);
 const rt=await p.evaluate(()=>{const ok=__m1.retry();for(let i=0;i<8;i++){__mho.roamSim(20)}return{ok,ph:__m1.hint()&&__m1.hint().ph,rv:__m3.rv()}});
 ok(rt.ok&&rt.ph===2&&rt.rv&&rt.rv.length===2&&rt.rv[0].s>500,'C3 RETRY PHASE restarts phase 2 with the rivals at their checkpoint positions',{ph:rt.ph,rv:rt.rv,rv1});
 const ef=await p.evaluate(()=>__m3.M3.log.ehit+'/'+__m1.M1.mines.length);console.log('enemy missile hits / mines',ef);await p.evaluate(()=>__mho.qv.ch()&&__mho.abort&&__mho.abort());await fin(r,'C')}
if(want('D')){const r=await B({}),p=r.p;await p.evaluate(()=>{__m3.unlock();__m3.setStep(3)});await clearUi(p);
 await p.evaluate(()=>{const M=__mho,R=M.RO;M.K.ArrowUp=true;M.roamSim(120)});await p.keyboard.press('KeyG');const h0=await p.evaluate(()=>({vy:__mho.RO.vy,hop:__m3.log().hop}));
 ok(h0.hop===0,'D1 no Rocket Hop before the chapter-3 duel',h0);await p.evaluate(()=>__m3.setStep(4));await p.keyboard.press('KeyG');
 const h1=await p.evaluate(()=>{const R=__mho.RO,o={vy:+R.vy.toFixed(1),hop:__m3.log().hop};let mx=0;const y0=R.y;for(let i=0;i<200;i++){__mho.roamSim(1);mx=Math.max(mx,R.y-y0)}o.peak=+mx.toFixed(1);__mho.K.ArrowUp=false;return o});
 ok(h1.hop===1&&h1.vy>15&&h1.peak>5,'D2 G key launches a Rocket Hop (real key)',h1);await p.keyboard.press('KeyG');ok(await p.evaluate(()=>__m3.log().hop===1||__m3.M3.hcd>0),'D3 hop has a cooldown');
 await p.evaluate(()=>{__m3.setStep(8);__m3.M3.hcd=0;__m1.spawn('rammer',3)});const sw=await p.evaluate(()=>{const R=__mho.RO;for(const g of __m1.M1.goons){g.x=R.x+8;g.z=R.z+6;g.cd=9}const hp0=__m1.goons().map(g=>g.hp);__m3.hop();for(let i=0;i<160;i++)__mho.roamSim(1);return{hp0,hp:__m1.goons().map(g=>g.hp),shock:__m3.log().shock}});
 ok(sw.shock===1&&(sw.hp.length<sw.hp0.length||sw.hp.some((h,i)=>h<sw.hp0[i])),'D4 Shockwave landing (ch4 upgrade) damages goons nearby',sw);await fin(r,'D')}
if(want('E')){const r=await B({view:'land',ls:{}}),p=r.p;await p.evaluate(()=>{__m3.unlock();__m3.setStep(4)});await clearUi(p);await p.evaluate(()=>__mho.roamSim(40));await p.waitForTimeout(800);
 const L=await p.evaluate(()=>{const els=[...document.querySelectorAll('.tbtn,#m1Next')].filter(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>4&&cs.display!=='none'&&cs.visibility!=='hidden'&&!e.hidden}).map(e=>({id:e.id,r:e.getBoundingClientRect()}));const ov=[];for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){const a=els[i].r,b=els[j].r,w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(w>6&&h>6)ov.push(els[i].id+'×'+els[j].id)}const h=document.querySelector('#tM3');const r=h&&h.getBoundingClientRect();return{show:!!h&&getComputedStyle(h).display!=='none',ov,off:r&&(r.left<0||r.top<0||r.right>innerWidth||r.bottom>innerHeight),c:r&&[r.x+r.width/2,r.y+r.height/2]}});
 ok(L.show&&!L.ov.length&&!L.off,'E1 phone landscape: 🚀 button visible, no overlap, on screen',L);await F.shot(p,'shots/m3_touch_land.jpg',{type:'jpeg',quality:60});
 if(L.c){await p.evaluate(()=>{__mho.K.ArrowUp=true;__mho.roamSim(90)});await p.touchscreen.tap(L.c[0],L.c[1]);await p.waitForTimeout(200);const t=await p.evaluate(()=>({hop:__m3.log().hop,vy:__mho.RO.vy}));ok(t.hop===1,'E2 tapping 🚀 fires a Rocket Hop (real touch)',t)}await fin(r,'E')}
console.log(allErr.length?'ERRORS '+JSON.stringify(allErr.slice(0,8)):'no page errors');ok(!allErr.length,'no page/console errors');console.log(`tM3 ${pass} pass / ${fail} fail`);process.exit(fail?1:0)})();
