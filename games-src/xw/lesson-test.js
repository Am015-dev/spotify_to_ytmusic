// Lesson test (W486): the guided first game. Fresh storage, then the walker taps ONLY what the lesson highlights (the spotlight in the
// first steps, then the ghost finger) and plain "continue" taps when nothing is highlighted. Checks:
//  - every core rule (LORE.coach rule:1) is taught during the scripted battle, in the expected order
//  - each lesson line is 12 words or fewer; while a rule line is up, one control is highlighted (or it is a watch-only moment)
//  - a tap on anything other than the taught move or action is refused during the scripted rounds
//  - the duel's end card has no "coming up later" list and leads to the flight drill, where the walker really barrel rolls, boosts,
//    tries a move off the mat (refused) and bumps the rival ship
//  - the end card starts a real game.          Run: GX_URL=http://127.0.0.1:8765 node lesson-test.js [390x844]
const fs=require('fs');const {chromium}=require('playwright');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ORDER=['goal','fly','order','action','moves','shoot','dice','usefocus','res1','res2','defend','endround','marks','stress','lock','roll','boost','edge','bump'];
const WATCH=new Set(['moves','order','res1','res2','defend','stress','endround','dice','bump']);   // these happen while the board plays out; the next tap is "continue"
const [W,H]=(process.argv[2]||'390x844').split('x').map(Number);let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++};
(async()=>{const xp=fs.existsSync('/opt/pw-browsers/chromium')?{executablePath:'/opt/pw-browsers/chromium'}:{};const b=await chromium.launch(xp);
  const c=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(process.env.GX_URL+'/nebula-aces/');await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(3500);
  const tapXY=(x,y)=>p.touchscreen.tap(x,y);
  const box=sel=>p.evaluate(sel=>{for(const e of document.querySelectorAll(sel)){const r=e.getBoundingClientRect();if(r.width<4||r.height<4||getComputedStyle(e).visibility==='hidden'||e.closest('[hidden]'))continue;return [r.left+r.width/2,r.top+r.height/2]}return null},sel);
  let q=await box('#modal .dlg.start [data-gxt-open]');ok(!!q,'title offers the lesson');if(!q){await b.close();process.exit(1)}await tapXY(...q);await sleep(1500);
  // forced spotlight steps: follow them until the hand-over card
  const stepsSeen=new Set();let badTried=false;
  for(let t=0;t<200;t++){if(await box('[data-gxt-end=free]'))break;
    const st=await p.evaluate(()=>{const s=GXT.state();const cur=GXT.current&&GXT.current();let r=null;try{const tg=cur&&cur.target&&cur.target();const el=tg&&tg.getBoundingClientRect?tg.getBoundingClientRect():tg;if(el)r=[el.left+el.width/2,el.top+el.height/2]}catch(e){}return {shown:s.shown,id:cur&&cur.id,wait:!!(cur&&cur.wait),r,say:cur&&cur.say}});
    if(!st.shown){await sleep(150);continue}
    if(!stepsSeen.has(st.id)){stepsSeen.add(st.id);ok(true,'lesson step '+st.id+' shown');ok(String(st.say||'').split(/\s+/).length<=12,`step ${st.id} line is 12 words or fewer: "${st.say}"`)}
    if(st.id==='dial'&&!badTried){badTried=true;const bad=await p.evaluate(()=>{const s=ship('s1');return dialOf(s).findIndex((m,i)=>i!==dialIx(s,TUT_ME[0])&&document.querySelector(`.bfm[data-bfm="${i}"]`))});
      const bb=await box(`.bfm[data-bfm="${bad}"]`);if(bb){await tapXY(...bb);await sleep(600);ok(await p.evaluate(()=>UI.draft.s1==null),'a different move is refused in the lesson')}continue}
    if(!st.wait){const n=await box('.gxt-bub .gxt-next');if(n)await tapXY(...n)}else if(st.r)await tapXY(...st.r);
    await sleep(700)}
  ok(['goal0','ship','dial'].every(x=>stepsSeen.has(x)),'spotlight steps goal, ship, dial all shown');
  // the hand-over card, then the scripted battle: follow the finger
  {let e=null;for(let t=0;t<30&&!(e=await box('[data-gxt-end=free]'));t++)await sleep(200);ok(!!e,'hand-over card shown');if(e){await tapXY(...e);await sleep(1200)}}
  const seen=[],fingAt={};let last='',same=0,refusedAction=null,lastCur=null,drillOn=false;
  for(let n=0;n<700;n++){const st=await p.evaluate(()=>{const fe=BF.fing&&document.body.contains(BF.fing)&&BF.fing.offsetParent?BF.fing.getBoundingClientRect():null;
      return {cur:NCH.cur,shown:Object.keys(NCH.shown),end:!!document.getElementById('na-coachend'),r:G&&G.round,ph:G&&G.phase,staged:tutStaged(),f:fe?[fe.left+fe.width/2,fe.top+fe.height/2]:null,fcls:BF.fing?String(BF.fing.className):'',
        txt:NCH.cur&&LORE.coach[NCH.cur]?LORE.coach[NCH.cur].s:''}});
    if(st.cur&&st.f)fingAt[st.cur]=true;if(st.cur&&!seen.includes(st.cur)){seen.push(st.cur);ok(st.txt.split(/\s+/).length<=12,`"${st.cur}" line is 12 words or fewer`)}
    if(st.end){const dr=await box('#na-coachend [data-na=drill]');if(!dr)break;
      ok(await p.evaluate(()=>!/coming up later/i.test(document.getElementById('na-coachend').textContent)&&!document.querySelector('.na-later')),'duel end card has no "coming up later" list');
      await tapXY(...dr);await sleep(1500);drillOn=true;continue}
    if(refusedAction==null&&st.ph==='action'&&st.staged&&st.f){const other=await p.evaluate(()=>{const e=[...document.querySelectorAll('.bfact:not(.rec):not(.skip)')].find(x=>x.offsetParent);if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
      if(other){await tapXY(...other);await sleep(600);refusedAction=await p.evaluate(()=>G.phase==='action');ok(refusedAction,'another action is refused in the lesson')}else refusedAction=true}
    const sig=JSON.stringify([st.r,st.ph,st.shown.length,!!st.f]);if(sig===last)same++;else{same=0;last=sig}if(same>80){ok(false,'lesson stuck at '+sig);await p.screenshot({path:(process.env.SHOT_DIR||'.')+'/lesson-stuck.png'});break}
    if(st.cur&&st.cur!==lastCur){lastCur=st.cur;await sleep(600);continue}   // a new line: read it first, like a person
    if(st.f)await tapXY(...st.f);
    else{let d=null;for(const sel of ['[data-ph=x]','#bfbtns .btn.primary:not([disabled])','#bfdice','[data-bf=brief]','[data-bf=dlock]','.bfact.rec','.bftgt','.bfring.need','#bfbtns [data-act]'])if(d=await box(sel))break;if(d)await tapXY(...d);else await tapXY(W/2,H*.4)}
    await sleep(350)}
  console.log('END STATE',JSON.stringify(await p.evaluate(()=>({r:G.round,w:G.winner,q:NCH.q,shown:Object.keys(NCH.shown),hp:G.ships.map(s=>s.name+':'+s.hull+'/'+s.sh+(s.alive?'':'X')+' st'+s.stress)}))));
  const rules=await p.evaluate(()=>GXCOACH.rules);
  {const did=await p.evaluate(()=>TUT.did||{});ok(drillOn,'the flight drill ran after the duel');for(const k of ['roll','boost','edge','bump'])ok(!!did[k],'drill played: '+k+(k==='edge'?' (a move off the mat was tried and refused)':''))}
  {const fo=await p.evaluate(()=>(BF.flyOrder||[]).map(id=>{const s=ship(id);return s?s.ps:null}));ok(fo.length>0&&fo.every((v,i)=>!i||v>=fo[i-1]),'ships fly one by one, lowest pilot skill first: '+fo.join(' then '))}{const L=await p.evaluate(()=>({log:NCH.log||[],fs:NCH.fs||{}}));seen.length=0;L.log.forEach(x=>{if(!seen.includes(x))seen.push(x)});Object.assign(fingAt,L.fs);
    for(const id of seen)ok(String((await p.evaluate(id=>LORE.coach[id].s,id))).split(/\s+/).length<=12,`"${id}" line is 12 words or fewer`)}
  const order=seen.filter(x=>ORDER.includes(x));
  for(const r of rules)ok(seen.includes(r)||r==='goal','rule taught in play: '+r);
  ok(JSON.stringify(order)===JSON.stringify(ORDER.filter(x=>order.includes(x))),'rules come in the lesson order: '+order.join(' > '));
  for(const r of order)if(!WATCH.has(r))ok(fingAt[r],`while "${r}" is up, one control is highlighted`);
  const e=await box('#na-coachend [data-na=play], #na-coachend [data-na=chapter]');ok(!!e,'end card offers a real game');
  if(e){await tapXY(...e);await sleep(1500);ok(await p.evaluate(()=>!!G&&!G.tut&&!TUT.on),'the end button starts a real game')}
  ok(!errs.length,'no page errors '+errs.slice(0,2).join(' | '));
  console.log('lesson-test: '+(fails?fails+' failed':'all pass')+'; taught: '+seen.join(', '));await b.close();process.exit(fails?1:0)})();
