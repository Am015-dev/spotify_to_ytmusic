// Toddler test: taps as fast as a human (100-300 ms apart) and as randomly as a toddler, through the tutorial and a full real game, by touch only.
//   node toddler-test.js [sizes=390x844,375x667] [seed=1]        Exit code 1 on any problem.
// Fails on: a page error, a stuck state (nothing changes for 10 s while we keep tapping), a tutorial that does not reach its end card,
// a game that does not reach the result screen, or a dead tap: a tap during a "watch" moment (narration card or rival turn) or on the lit target
// that changes nothing on screen within 300 ms. Random taps on empty table during your own turn are counted but allowed to do nothing.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/thornbound.html');
const SIZES=(process.argv[2]||'390x844,375x667').split(',').map(s=>s.split('x').map(Number));
const SEED=+(process.argv[3]||1);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const probs=[];const note=(t,m)=>{if(probs.length<40)probs.push(t+': '+m)};
function rng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
const OBS=`(()=>{if(window.__mut!=null)return;window.__mut=0;new MutationObserver(l=>{window.__mut+=l.length}).observe(document.body,{subtree:true,childList:true,attributes:true,characterData:true})})()`;
async function tapAndCheck(p,x,y){const m0=await p.evaluate(()=>window.__mut);await p.touchscreen.tap(x,y);await sleep(300);const m1=await p.evaluate(()=>window.__mut);return m1>m0}
const gap=r=>100+Math.floor(r()*200);

async function tutorial(browser,W,H){const tag=W+'x'+H+' tutorial';const r=rng(SEED*7+W);
  const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await ctx.route('**/*',q=>new URL(q.request().url()).host==='gns.test'?q.fulfill({status:200,contentType:'text/html',body:html}):q.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>note(tag,'PAGE ERROR '+e.message));
  await p.goto('https://gns.test/?phone=1');await sleep(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});
  await p.evaluate(()=>tutStart());await sleep(300);await p.evaluate(OBS);
  let last='',lastT=Date.now(),taps=0,dead=0,early=0;const t0=Date.now();let done=false;
  while(Date.now()-t0<240000){
    const s=await p.evaluate(()=>{const S=GXT.state();const end=document.querySelector('.gxt-end [data-gxt-end]');if(end)return {end:1};
      const st=GXT.current();let tgt=null;try{const t=st&&st.target&&st.target();const e=t&&(t.getBoundingClientRect?t.getBoundingClientRect():t);if(e&&e.width)tgt={x:e.left+e.width/2,y:e.top+e.height/2}}catch(e){}
      const nx=document.querySelector('.gxt-next');const nr=nx&&nx.getBoundingClientRect();
      return {i:S.i,id:S.id,phase:S.phase,wait:S.wait,tgt,next:nr&&nr.width?{x:nr.left+nr.width/2,y:nr.top+nr.height/2}:null,sig:[S.i,S.phase,S.count,G&&G.logN,UI.card&&UI.card.kind,UI.hand].join('|')}});
    if(s.end){done=true;break}
    if(s.sig!==last){last=s.sig;lastT=Date.now()}else if(Date.now()-lastT>10000){note(tag,'STUCK 10 s at step '+(s.i+1)+' ('+s.id+') phase '+s.phase);await p.screenshot({path:__dirname+'/../playtest/toddler-stuck-'+W+'.png'});break}
    const roll=r();let x,y,kind;
    if(roll<0.2){x=10+r()*(W-20);y=60+r()*(H-80);kind='random'}           // toddler: anywhere (not the top strip with Skip)
    else if(s.wait&&s.tgt){x=s.tgt.x;y=s.tgt.y;kind=s.phase==='show'?'target':'early'}   // fast player: taps where the step will be, even before it shows
    else if(s.next){x=s.next.x;y=s.next.y;kind='next'}
    else{x=W/2;y=H*0.45;kind='watch'}
    const vis=await tapAndCheck(p,x,y);taps++;if(kind==='early')early++;
    if(!vis&&(kind==='target'||kind==='next'||kind==='watch')){dead++;if(dead<=5)note(tag,'dead tap ('+kind+') at step '+(s.i+1)+' '+s.id+' phase '+s.phase)}
    await sleep(gap(r))}
  if(!done)note(tag,'tutorial did not reach its end card');
  console.log(tag,'taps',taps,'early',early,'dead',dead,Math.round((Date.now()-t0)/1000)+'s',done?'END':'NOT DONE');
  await ctx.close();return dead}

async function game(browser,W,H){const tag=W+'x'+H+' game';const r=rng(SEED*13+H);
  const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await ctx.route('**/*',q=>new URL(q.request().url()).host==='gns.test'?q.fulfill({status:200,contentType:'text/html',body:html}):q.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>note(tag,'PAGE ERROR '+e.message));
  await p.goto('https://gns.test/?phone=1');await sleep(900);
  await p.evaluate(()=>{try{localStorage.clear();localStorage.setItem('gxt-thornbound',JSON.stringify({done:1}))}catch(e){}newGame('me');UI.speed=1});await sleep(400);
  await p.evaluate(OBS);
  let last='',lastT=Date.now(),taps=0,dead=0,watchTaps=0,watchDead=0;const t0=Date.now();let over=false;
  while(Date.now()-t0<300000){
    const s=await p.evaluate(()=>{const gl=document.getElementById('tbgoal');if(gl){const b=gl.querySelector('button').getBoundingClientRect();return {goal:{x:b.left+b.width/2,y:b.top+b.height/2}}}
      if(G.over&&(!UI.card||UI.card.kind==='over'))return {over:1,head:(document.querySelector('#pc h3')||{}).textContent||'',line:(document.querySelector('#pc .tbq')||{}).textContent||'',win:G.over.winner,inf:G.pl.map(p=>p.inf)};
      if(UI.pop){const x=document.querySelector('#ppop .pp-x,#ppop [data-a=pclose]');const r=x&&x.getBoundingClientRect();if(r&&r.width)return {closepop:{x:r.left+r.width/2,y:r.top+r.height/2}}}
      const mine=!UI.card&&G.q&&viewSeatForQ()!=null;const watch=!!(UI.card&&(UI.card.kind==='event'||UI.card.kind==='news'))||(!UI.card&&G.q&&viewSeatForQ()==null);
      let pl=null;try{const f=document.querySelector('#finger');pl=(!f||f.hidden)?null:fingerPlan()}catch(e){}
      const c=e=>{if(!e)return null;const r=e.getBoundingClientRect();return r.width?{x:r.left+r.width/2,y:r.top+r.height/2}:null};const q=s=>document.querySelector(s);
      const alt=c(q('#ppop [data-a=mv]'))||c(q('#act [data-a=mv].pri'))||c(q('#act [data-a=mv]'))||c(q('#main [data-a=mv]'))||c(q('.tb-loc.glow .tb-ring'))||c(q('.tbx-pan g.rglow rect'))||c(q('#handw .hc.glow'))||c(q('#handw .kcb.glow'));
      const bd=q('#board').getBoundingClientRect(),st=q('#tbturn');const sr=st&&!st.hidden?st.getBoundingClientRect():null;
      return {mine,watch,plan:pl,alt,bd:{l:bd.left,t:bd.top,w:bd.width,h:bd.height},strip:sr&&sr.width?{x:sr.left+sr.width*0.4,y:sr.top+sr.height/2}:null,
        sig:[UI.nMoves,G.logN,UI.hand,G.round,UI.card&&(UI.card.kind+(UI.card.id||'')+(UI.card.revN||'')),G.q&&G.q.kind,UI.autCard].join('|')}});
    if(s.over){over=true;
      if(/takes the throne|win the throne/.test(s.head)){const iWon=/You win/.test(s.head);if(/^The crown is yours/.test(s.line)!==iWon)note(tag,'result line disagrees with the headline: '+s.head+' / '+s.line)}
      console.log(tag,'result:',s.head,'|',s.line,'| Influence',s.inf.join('-'));break}
    if(s.closepop){await p.touchscreen.tap(s.closepop.x,s.closepop.y);await sleep(gap(r));continue}
    if(s.goal){await p.touchscreen.tap(s.goal.x,s.goal.y);await sleep(gap(r));continue}
    if(s.sig!==last){last=s.sig;lastT=Date.now()}else if(Date.now()-lastT>10000){note(tag,'STUCK 10 s: '+s.sig+' '+JSON.stringify({plan:s.plan,alt:s.alt})+' '+await p.evaluate(()=>{const a=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return s+'->'+(t?(t.id||t.getAttribute('class')||t.tagName):'')};return JSON.stringify({hand:UI.hand,rec:UI.bf&&UI.bf.rec&&UI.bf.rec.k,pop:!!UI.pop,a:[a('#ppop [data-a=mv]'),a('#act [data-a=mv]'),a('#handw .hc.glow'),a('.tb-loc.glow .tb-ring')],act:(document.querySelector('#act')||{}).textContent.slice(0,120)})}));await p.screenshot({path:__dirname+'/../playtest/toddler-stuck-game-'+W+'.png'});break}
    const roll=r();let x,y,kind;
    if(s.watch){kind='watch';if(roll<0.5&&s.strip){x=s.strip.x;y=s.strip.y}else{x=s.bd.l+s.bd.w*(0.1+0.8*r());y=s.bd.t+s.bd.h*(0.1+0.8*r())}}
    else if(s.mine&&roll<0.15){kind='random';x=s.bd.l+s.bd.w*r();y=s.bd.t+s.bd.h*r()}
    else if(s.mine&&s.plan){kind='target';if(s.plan.from){await p.touchscreen.tap(s.plan.from.x,s.plan.from.y);taps++;await sleep(gap(r))}x=s.plan.to.x;y=s.plan.to.y}
    else if(s.mine&&s.alt){kind='target';x=s.alt.x;y=s.alt.y}
    else{await sleep(100);continue}
    const vis=await tapAndCheck(p,x,y);taps++;if(kind==='watch')watchTaps++;
    if(!vis&&kind!=='random'){dead++;if(kind==='watch')watchDead++;if(dead<=5)note(tag,'dead tap ('+kind+') sig '+s.sig)}
    await sleep(gap(r))}
  if(!over)note(tag,'game did not reach the result screen');
  console.log(tag,'taps',taps,'watch taps',watchTaps,'dead',dead,'(watch dead '+watchDead+')',Math.round((Date.now()-t0)/1000)+'s');
  await ctx.close();return dead}

(async()=>{const b=await PW.chromium.launch({args:['--no-sandbox']});let dead=0;
  const only=process.env.ONLY;const jobs=[];for(const [W,H] of SIZES){if(only!=='game')jobs.push(tutorial(b,W,H));if(only!=='tut')jobs.push(game(b,W,H))}
  const res=await Promise.all(jobs.map(j=>j.catch(e=>{note('job','CRASH '+String(e.message).split('\n')[0]);return 0})));dead=res.reduce((a,x)=>a+x,0);
  await b.close();console.log('DEAD TAPS '+dead);console.log(probs.length?'PROBLEMS '+probs.length+'\n  '+probs.join('\n  '):'PROBLEMS 0');process.exit(probs.length?1:0)})();
