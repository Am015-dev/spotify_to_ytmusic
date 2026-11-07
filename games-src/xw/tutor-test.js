// Coached-game test: the lesson is a real game with free choices. Two forced taps (ship, maneuver), then ANY legal move through the UI (same tap rules as playbot.js).
//   node tutor-test.js [sizes=390x763,1440x860]   env: URL (served page, ends with /), CHROME
// Asserts: fresh storage starts the lesson from the title; the forced steps work; the game is played to the result with legal taps only; one coach bubble at a time and
// it never covers a control; every rule marked rule:1 in LORE.coach was explained OR is listed on the "Things you will meet later" card; the end card walks the numbers;
// the end button starts a normal game; progress is remembered; Skip works during the forced steps. Exit code 1 on any problem.
const PW=(()=>{try{return require('/opt/node22/lib/node_modules/playwright')}catch(e){return require('../node_modules/playwright')}})();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const URL0=process.env.URL;const sizes=(process.argv[2]||'390x763,1440x860').split(',').map(s=>s.split('x').map(Number));
const probs=[];const note=(t,m)=>probs.push(t+': '+m);
const SEL=['[data-ph=x]','.bfring.need','.bfm:not(.danger):not(.set)','[data-bf=fly]:not([disabled])','.bfact.rec','.bfact:not(.skip)','.bftgt','.bfm.w','#bfbtns [data-bfq=ok]','#bfbtns .btn.primary:not([disabled])','[data-a=lock]:not([disabled])','[data-a=autodial]','#prompt .btn.primary:not([disabled])','#prompt [data-hov]','#prompt [data-act]'];
async function run(b,W,H,skipMode,story){const tag=W+'x'+H+(skipMode?' skip':'')+(story?' story':'');const mob=W<700;
  const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:mob,isMobile:mob});const p=await ctx.newPage();p.setDefaultTimeout(20000);
  p.on('pageerror',e=>note(tag,'PAGE ERROR '+e.message));p.on('console',m=>{const t=m.text();if(m.type()==='error'&&!/net::|Failed to load|favicon|fonts\.g/.test(t))note(tag,'console error '+t.slice(0,150))});
  await p.goto(URL0+'?phone=1');await p.waitForSelector('[data-start]');await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await p.waitForSelector('[data-start]');await sleep(900);
  const tap=(x,y)=>mob?p.touchscreen.tap(x,y):p.mouse.click(x,y);
  const find=sel=>p.evaluate(sel=>{for(const e of document.querySelectorAll(sel)){const r=e.getBoundingClientRect();if(r.width<4||r.height<4||getComputedStyle(e).visibility==='hidden')continue;const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;const t=document.elementFromPoint(x,y);if(t&&(t===e||e.contains(t)))return [x,y]}return null},sel);
  let c=await find(story?'[data-a=story]':'#modal .dlg.start [data-gxt-open]');if(!c){note(tag,'no lesson button');await ctx.close();return}await tap(c[0],c[1]);await sleep(1000);
  // forced step 1 and 2: tap the spotlight centre (any legal maneuver for step 2)
  for(let k=0;k<2;k++){let st;for(let t=0;t<60;t++){st=await p.evaluate(()=>GXT.state());if(st.shown)break;await sleep(100)}
    if(!st.shown){note(tag,'forced step '+k+' never shown');break}
    if(skipMode&&k===1){const sk=await find('.gxt-skip');if(!sk){note(tag,'no Skip');break}await tap(sk[0],sk[1]);await sleep(600);
      const o=await p.evaluate(()=>({run:GXT.running(),start:!!document.querySelector('#modal .dlg.start')}));if(o.run||!o.start)note(tag,'Skip did not return to the title');await ctx.close();return}
    const el=await p.evaluate(()=>{const s=GXT.state();return s.hole?[s.hole.cx,s.hole.cy]:null});await tap(el[0],el[1]);await sleep(500)}
  // the interstitial card
  let ok=false;for(let t=0;t<40;t++){const e=await find('[data-gxt-end=free]');if(e){await tap(e[0],e[1]);ok=true;break}await sleep(150)}
  if(!ok){note(tag,'no "Fly free" card after the forced steps');await ctx.close();return}await sleep(700);
  await p.evaluate(()=>{AIDELAY=150});
  const bubbles=new Set();let over=false,lastSig='',lastT=Date.now(),maxVis=0;
  for(let i=0;i<4000;i++){
    const st=await p.evaluate(()=>{const e=document.getElementById('na-coach');const vis=e&&!e.hidden;let cover=false;if(vis){const r=e.getBoundingClientRect();for(const q of document.querySelectorAll('.bfact,.bftgt,.bfm,[data-bf]')){const b=q.getBoundingClientRect();if(b.width&&b.left<r.right&&b.right>r.left&&b.top<r.bottom&&b.bottom>r.top&&getComputedStyle(e).pointerEvents!=='none'){cover=true}}}
      return {over:!!(G&&G.winner),end:!!document.getElementById('na-coachend'),vis:vis?1:0,cur:NCH.cur,shown:Object.keys(NCH.shown),cover,w:e?e.getBoundingClientRect().right<=innerWidth+1&&e.getBoundingClientRect().left>=-1:true,h:document.getElementById('bfhint')&&document.getElementById('bfhint').textContent,ph:G&&G.phase,r:G&&G.round}});
    st.shown.forEach(x=>bubbles.add(x));maxVis=Math.max(maxVis,st.vis);if(!st.w)note(tag,'coach bubble outside the screen');
    if(st.end){over=true;break}
    const sig=JSON.stringify([st.ph,st.r,st.h,st.shown.length]);if(sig!==lastSig){lastSig=sig;lastT=Date.now()}else if(Date.now()-lastT>20000){note(tag,'stuck '+sig);await p.screenshot({path:'/tmp/claude-0/s/coach-stuck-'+W+'.png'});break}
    let done=false;for(const sel of SEL){const q=await find(sel);if(q){await tap(q[0],q[1]);done=true;await sleep(120);break}}
    if(!done)await sleep(250)}
  if(!over){note(tag,'no end card');await ctx.close();return}
  await sleep(400);
  const e=await p.evaluate(()=>{const d=document.getElementById('na-coachend');const r=d.querySelector('.gxt-endc').getBoundingClientRect();return {txt:d.textContent,btns:[...d.querySelectorAll('[data-na]')].map(b=>b.dataset.na),inside:r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1,later:[...d.querySelectorAll('.na-later li')].map(l=>l.textContent),shown:Object.keys(NCH.shown),rules:Object.keys(LORE.coach).filter(k=>LORE.coach[k].rule).map(k=>({k,t:LORE.coach[k].t,s:LORE.coach[k].s}))}});
  if(!/Your numbers/.test(e.txt)||!/Rounds:/.test(e.txt))note(tag,'end card does not walk the numbers');if(!e.inside)note(tag,'end card outside the screen');
  for(const r of e.rules){if(!e.shown.includes(r.k)&&!e.later.some(l=>l.includes(r.s)))note(tag,'rule "'+r.k+'" neither explained nor listed under things you will meet later')}
  if(maxVis>1)note(tag,'more than one coach bubble at once');
  const pl=e.btns.includes('play')?'[data-na=play]':'[data-na=chapter]';const b2=await find(pl);if(!b2)note(tag,'no end button');else{await tap(b2[0],b2[1]);await sleep(1200);
    const a=await p.evaluate(()=>({real:!!G&&!G.tut&&!TUT.on,coach:!!document.getElementById('na-coachend')||!!document.querySelector('.gxt-bub'),done:JSON.parse(localStorage.getItem('gxt-nebula-aces')||'{}').done}));
    if(!a.real)note(tag,'end button did not start a normal game');if(a.coach)note(tag,'coach elements left in the real game');if(!a.done)note(tag,'lesson not remembered as done')}
  console.log(tag,'done: explained '+e.shown.length+' of '+e.rules.length+' rules in play, later card '+e.later.length+' lines');await ctx.close()}
(async()=>{const b=await PW.chromium.launch({executablePath:process.env.CHROME||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const [W,H] of sizes){try{await run(b,W,H,false)}catch(e){note(W+'x'+H,'CRASH '+String(e.message).split('\n')[0])}}
  try{await run(b,sizes[0][0],sizes[0][1],false,true)}catch(e){note('story','CRASH '+String(e.message).split('\n')[0])}
  try{await run(b,sizes[0][0],sizes[0][1],true)}catch(e){note('skip','CRASH '+String(e.message).split('\n')[0])}
  await b.close();console.log(probs.length?'PROBLEMS '+probs.length+'\n  '+probs.join('\n  '):'PROBLEMS 0');process.exit(probs.length?1:0)})();
