// coach-test.js: plays the COACHED first game (tutorial) from fresh storage through the real page, choosing legal moves through the UI
// (any legal move, taps on visible uncovered elements only), at 390x763 and 1440x860. Asserts: it reaches the end card, one bubble at a time,
// bubbles never block input (pointer-events none except Got it), every coverage rule was explained or is on the "Things you'll meet later" card,
// the final scoring shows the player's real numbers, nothing was saved, the tutorial is remembered as done.
//   node coach-test.js [url=http://localhost:8765/]      Exit code 1 on any problem.
const PW=require('playwright');const U=require('./uiplay.js');const fs=require('fs'),path=require('path');const {sleep,tapSel}=U;
const URL_=process.argv[2]||'http://localhost:8765/';const probs=[];const note=m=>{if(probs.length<30)probs.push(m)};
(async()=>{const b=await PW.chromium.launch();
 for(const [W,H] of [[390,763],[1440,860]]){const tag=W+'x'+H;const touch=W<800;
  const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:touch,hasTouch:true});const p=await ctx.newPage();
  p.on('pageerror',e=>note(tag+' PAGE ERROR '+e.message));p.on('console',m=>{const t=m.text();if(m.type()==='error'&&!/Failed to load|net::|favicon|Fetch API/.test(t))note(tag+' console error '+t.slice(0,150))});
  await p.goto(URL_);await sleep(1200);await p.evaluate(()=>localStorage.clear());await p.reload();await sleep(1200);
  if(!await tapSel(p,'#start [data-a=offeryes]',touch,probs)){note(tag+' no tutorial button');continue}await sleep(1200);
  let multi=0,blocking=0,seenIds=new Set();
  const watch=setInterval(async()=>{try{const s=await p.evaluate(()=>({n:document.querySelectorAll('#coach').length,pe:document.getElementById('coach')?(document.getElementById('coach').dataset.pass==='1'?'none':getComputedStyle(document.getElementById('coach')).pointerEvents):'none',id:document.getElementById('coach')&&document.getElementById('coach').dataset.step,fs:document.getElementById('coach')?parseFloat(getComputedStyle(document.querySelector('#coach .cox')).fontSize):99}));
    if(s.n>1)multi++;if(s.pe!=='none')blocking++;if(s.id)seenIds.add(s.id);if(s.fs<14)note(tag+' coach text under 14px')}catch(e){}},150);
  const r=await U.playToEnd(p,{touch,maxMs:400000,log:probs,beforeTap:async()=>{for(let i=0;i<40&&await p.evaluate(()=>!!document.getElementById('coach'));i++)await sleep(200)}});clearInterval(watch);
  if(!r.over)note(tag+' coached game did not finish '+JSON.stringify(r).slice(0,150));
  await sleep(800);
  const e=await p.evaluate(()=>{const d=document.getElementById('coachend');if(!d)return null;return {score:d.querySelector('.coscore').textContent,later:[...d.querySelectorAll('.colater li')].map(l=>l.textContent),seen:Object.keys(UI.coach.seen),btns:[...d.querySelectorAll('[data-ce]')].map(x=>x.dataset.ce),saved:!!localStorage.getItem(SAVE),done:JSON.parse(localStorage.getItem('gxt-short-fuse')||'{}').done}});
  if(!e){note(tag+' no end card');continue}
  if(multi)note(tag+' more than one bubble at once');if(blocking)note(tag+' a bubble blocked input (tappable bubbles must pass the tap through: data-pass=1)');
  if(!/Guesses that hit/.test(e.score)||!/Fuse left/.test(e.score))note(tag+' scoring walk-through missing');
  const gx=await p.evaluate(()=>({d:GXCOACH.done,r:GXCOACH.running,x:GXCOACH.explained.length}));if(!gx.d||gx.r||gx.x!==e.seen.length)note(tag+' GXCOACH wrong '+JSON.stringify(gx));
  if(e.saved)note(tag+' staged game was saved');if(!e.done)note(tag+' tutorial not remembered as done');
  const rules=['goal','mine','crew','fuse','token','tokens2','point','hit','miss','solo','crew1','crew2','check','gear','probe','yellow','red','rmiss'];
  const doc=fs.readFileSync(path.join(__dirname,'..','TUTORIAL-COVERAGE.md'),'utf8');
  for(const id of rules){if(!doc.includes('`'+id+'`'))note(tag+' coverage doc lacks '+id);}
  const unseen=rules.filter(id=>!e.seen.includes(id));if(e.later.length!==unseen.length)note(tag+' later card ('+e.later.length+') does not list exactly the unexplained rules ('+unseen.join(',')+')');
  console.log(tag,'coached game',r.win?'WON':'LOST','taps',r.taps,'explained',e.seen.join(','),'| later:',unseen.join(',')||'none');
  await ctx.close()}
 await b.close();console.log(probs.length?'PROBLEMS '+probs.length+'\n  '+probs.join('\n  '):'PROBLEMS 0');process.exit(probs.length?1:0)})();
