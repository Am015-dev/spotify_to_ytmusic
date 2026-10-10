// Scripted bug sweep: plays the real page with touch taps.
// Run: (cd games-src/azul/game && python3 -m http.server 8095 &) ; NODE_PATH=/opt/node-tools/node_modules node sweep.js
// Help kit (gx-help): tips ON in 3 of 4 games (every first-time bubble must appear once, point at its target, never cover the target or a glowing thing, be short,
// dismiss on a tap, and the game is still completed); the 4th game has tips OFF (no bubble may appear). The lightbulb is tapped on every other turn: the ghost
// finger must sit on the tile/row/space the advice function names, the why is <= 15 words, the rules cards are 2-4, <= 20 words, with a picture; no advice -> rules only.
// Env: GAMES=40 ROT=5 CONC=4 URL=... QUICK=1 (4 games, 1 rotation, chapter 3 only)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const URL=process.env.URL||'http://localhost:8095/sunglaze.html';
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mozilla/5.0 Mobile/15E148 Safari/604.1)';
const SLOW=!!process.env.SLOW;const QUICK=!!process.env.QUICK;const GAMES=+(process.env.GAMES||(QUICK?4:40)),ROT=+(process.env.ROT||(QUICK?1:5)),CONC=+(process.env.CONC||4);
const SHOTS=path.join(__dirname,'sweep-shots');fs.rmSync(SHOTS,{recursive:true,force:true});fs.mkdirSync(SHOTS,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const COUNT={};const FAILS=[];let shotN=0;
function pass(k){(COUNT[k]=COUNT[k]||{p:0,f:0}).p++}
async function fail(k,ctx,msg,page){(COUNT[k]=COUNT[k]||{p:0,f:0}).f++;const f={k,ctx,msg};
  if(FAILS.length<10&&page){const n=++shotN;f.shot='fail-'+n+'-'+k.replace(/\W+/g,'_')+'.png';try{await page.screenshot({path:path.join(SHOTS,f.shot)})}catch(e){}}FAILS.push(f)}
async function chk(ok,k,ctx,msg,page){if(ok)pass(k);else await fail(k,ctx,msg,page)}
const rnd=n=>Math.floor(Math.random()*n);
const wc=t=>String(t||'').replace(/[^a-zA-Z0-9'’+]+/g,' ').trim().split(' ').filter(Boolean).length;
const HT={bubbles:{},bulbs:0,bulbNull:0,rules:0,tipsOff:0};
async function newPage(b,w,h,init){const c=await b.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:UA});
  if(SLOW)await c.addInitScript(()=>{window.__slow=1});if(init)await c.addInitScript(init);await c.addInitScript(()=>{try{localStorage.setItem('sgz_offer','1')}catch(e){}});const p=await c.newPage();p.errs=[];
  p.on('pageerror',e=>p.errs.push('pageerror: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|Fetch API cannot load/.test(m.text()))p.errs.push('console: '+m.text())});
  await p.goto(URL);await sleep(1200);return p}
const tapEl=async(p,sel)=>{const r=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return r.width>0?{x:r.left+r.width/2,y:r.top+r.height/2}:null},sel);if(!r)return false;await p.touchscreen.tap(r.x,r.y);return true};
const st=p=>p.evaluate(()=>({over:!!G.over,busy:BF.busy,q:BF.q.length,side:sideToAct(),phase:G.phase,logN:G.logN,round:G.round,cur:G.cur,sel:UI.sel?1:0}));
async function startGame(p,ex){await p.evaluate(ex=>{UI.setup.ex=ex;UI.speed=3;if(!window.__slow){bfD=ms=>ms*.18;AIDELAY=150};document.querySelector('[data-ui=start]').click()},ex);await sleep(500);
  await p.evaluate(()=>{const o=document.querySelector('[data-ui=story-ok]');if(o)o.click();UI.speed=3;if(!window.__slow){bfD=ms=>ms*.18;AIDELAY=150}});await sleep(900)}
// waits until it's the human's turn (or game over); false on a stuck state (nothing changes within 8 s)
async function waitTurn(p){let last='',t0=Date.now();for(;;){const r=await p.evaluate(()=>{if(!G)return {ok:false,sig:'x'};const ok=G.over||(!BF.busy&&BF.q.length===0&&sideToAct()===0&&!document.querySelector('.bf-bosscard'));
      return {ok,sig:JSON.stringify([G.logN,BF.busy,BF.say,BF.q.length,G.phase,G.round,[...document.querySelectorAll('[data-bfsc]')].map(e=>e.textContent),document.querySelectorAll('.bf-pop,.bf-fly').length,BF.disp&&BF.disp.pl.map(q=>q.floor.length+q.lines.map(l=>l.length).join(''))])}}).catch(()=>({ok:false,sig:'err'}));
    if(r.ok)return true;if(r.sig!==last){last=r.sig;t0=Date.now()}else if(Date.now()-t0>8000)return false;await sleep(100)}}
const sameState=(a,b)=>a.logN===b.logN&&a.cur===b.cur&&a.phase===b.phase&&a.round===b.round;

// every check that runs when it is the human's turn and nothing is animating
async function turnChecks(p,ctx,o){
  const sw=await p.evaluate(()=>({h:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)>innerWidth+1}));
  await chk(!sw.h,'no horizontal scroll',ctx,'page scrolls sideways',p);
  const sc=await p.evaluate(()=>G.pl.map(q=>{const e=document.querySelector(`[data-bfsc="${q.i}"]`);return {want:'★'+q.score,got:e&&e.textContent}}));
  await chk(sc.every(x=>x.want===x.got),'on-screen scores = engine',ctx,'scores '+JSON.stringify(sc),p);
  const covF=()=>p.evaluate(()=>{const bad=[];for(const e of document.querySelectorAll('.bf-t[role=button],[data-bf],#bulbbtn,.bf-chip,[data-bfcell],.bf-row[role=button],.bf-k.can')){const r=e.getBoundingClientRect();if(r.width<4||r.height<4)continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')continue;
      const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight){bad.push('offscreen '+e.className);continue}const t=document.elementFromPoint(x,y);if(!t||!(t===e||e.contains(t)||t.contains(e))){const q=t&&t.getBoundingClientRect();bad.push((e.dataset.k||e.className)+' '+[r.left,r.top,r.width,r.height].map(Math.round)+' covered by '+(t?t.tagName+'.'+String(t.className).slice(0,24)+' '+t.dataset.k+' '+[q.left,q.top,q.width,q.height].map(Math.round):'none'))}}return bad});
  let cov=await covF();if(cov.length){await sleep(500);cov=await covF()}// give a settling animation a moment
  await chk(!cov.length,'no tappable covered',ctx,cov.slice(0,3).join('; '),p);
  if(o.noGlow){// non-glowing piece: my wall cell in the offer phase must not move the game
    const before=await st(p);await tapEl(p,'.bf-me .bf-wall .bf-c');await sleep(250);const after=await st(p);await chk(sameState(before,after),'tap on non-glowing piece is inert',ctx,'game advanced',p);
    await p.evaluate(()=>{UI.sel=null;UI.tgt=null;bfDraw()})}
}
function st0(p){return st(p)}
// the rules cards (tapped from the bulb's "How does this work?" or opened for a bulb without advice): 2-4 cards, <= 20 words, a picture each, inside the screen, closable
async function rulesCheck(p,ctx,ph){
  const R=await p.evaluate(()=>{const e=document.querySelector('.gxh-rules');if(!e)return null;const out=[];const n=+e.dataset.count;const card=e.querySelector('.gxh-card').getBoundingClientRect();
    for(let i=0;i<n;i++){out.push({t:e.querySelector('.gxh-rt').textContent,x:e.querySelector('.gxh-rx').textContent,pic:!!e.querySelector('.gxh-pic svg')});if(i<n-1)e.querySelector('.gxh-next').click()}
    const r=e.querySelector('.gxh-card').getBoundingClientRect();return {n,cards:out,inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}});
  if(!R){await fail('rules cards open',ctx,'no rules overlay for '+ph,p);return}
  HT.rules++;await chk(R.n>=2&&R.n<=4,'rules: 2-4 cards',ctx,ph+' has '+R.n,p);
  await chk(R.cards.every(c=>wc(c.x)<=20&&wc(c.t)<=5),'rules: card text short',ctx,JSON.stringify(R.cards.map(c=>wc(c.x))),p);
  await chk(R.cards.every(c=>c.pic),'rules: every card has a picture',ctx,ph,p);await chk(R.inside,'rules: card inside the screen',ctx,ph,p);
  await p.evaluate(()=>document.querySelector('.gxh-rules .gxh-x').click());await sleep(120);
  await chk(!(await p.evaluate(()=>!!document.querySelector('.gxh-rules'))),'rules: cards close',ctx,ph,p)}
// the first-time coach bubble of a phase: appears once, points at its target, covers neither it nor a glowing thing, is short, dismisses on a tap
async function coachBubble(p,ctx,ph){
  const hs=await p.evaluate(ph=>({on:GXH.enabled(),cur:hlpPhase()}),ph);
  if(hs.cur!==ph)return;p.cb=p.cb||{};
  if(!hs.on){const b=await p.evaluate(()=>!!document.querySelector('.gxh-bub.on[data-phase]'));await chk(!b,'tips off: no coach bubble',ctx,ph,p);return}
  if(p.cb[ph]){await sleep(450);const b=await p.evaluate(()=>!!document.querySelector('.gxh-bub.on[data-phase]'));await chk(!b,'bubble shows once per phase',ctx,'bubble again for '+ph,p);return}
  p.cb[ph]=1;
  let b=null;const t1=Date.now();
  while(Date.now()-t1<3000){b=await p.evaluate(ph=>{const e=document.querySelector('.gxh-bub.on[data-phase]');if(!e)return null;const te=HLP_STEPS[ph].target();const tq=te&&te.getBoundingClientRect();const T=tq&&{left:tq.left,top:tq.top,right:tq.right,bottom:tq.bottom};const r=e.getBoundingClientRect();
    const cores=[...document.querySelectorAll('.bf-row.ok .bf-rack,.bf-floor.ok .bf-fl,.bf-c.pick,.bf-k.can,.bf-pool.can,[data-gxh-avoid]')].filter(x=>!x.closest('[data-help]')).map(x=>x.getBoundingClientRect()).filter(q=>q.width&&q.height&&q.right>0&&q.bottom>0&&q.left<innerWidth&&q.top<innerHeight).map(q=>{let w=q.width,h=q.height;const cx=q.left+w/2,cy=q.top+h/2;if(w>56)w=32;if(h>56)h=32;return {left:cx-w/2+3,top:cy-h/2+3,right:cx+w/2-3,bottom:cy+h/2-3}});   // 3 px of slack: the kit keeps 2-4 px off, layout can settle by a pixel after it places a bubble
    const c=cores.find(c=>r.left<c.right&&r.right>c.left&&r.top<c.bottom&&r.bottom>c.top);if(c)window.__cov={core:[c.left,c.top,c.right,c.bottom].map(Math.round),bub:[r.left,r.top,r.right,r.bottom].map(Math.round),hole:T};
    return {id:e.dataset.phase,title:e.querySelector('.gxh-tt').textContent,text:e.querySelector('.gxh-tx').textContent,arrow:!!e.querySelector('.gxh-arr'),ok:!!e.querySelector('.gxh-ok'),r:[r.left,r.top,r.right,r.bottom],T,covers:!!c,inside:r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1}},ph).catch(()=>null);if(b)break;await sleep(80)}
  if(!b){await fail('coach bubble appears',ctx,'no coach bubble for phase '+ph,p);return}
  HT.bubbles[ph]=(HT.bubbles[ph]||0)+1;pass('coach bubble appears');
  await chk(b.id===ph,'bubble matches its phase',ctx,b.id+' in '+ph,p);await chk(wc(b.title)<=4&&wc(b.text)<=20,'bubble short',ctx,b.title+' / '+b.text,p);
  await chk(b.arrow&&b.ok,'bubble has arrow and Got it',ctx,ph,p);await chk(b.inside,'bubble inside the screen',ctx,JSON.stringify(b.r),p);
  if(b.T){const [l,t,r,bt]=b.r;await chk(!(l<b.T.right&&r>b.T.left&&t<b.T.bottom&&bt>b.T.top),'bubble never covers its target',ctx,ph,p)}
  await chk(!b.covers,'bubble never covers a glowing target',ctx,ph+' '+JSON.stringify(await p.evaluate(()=>window.__cov)),p);
  // dismiss on a tap on the bubble's own button, then on a tap elsewhere for the next phase
  await tapEl(p,'.gxh-bub .gxh-ok');await sleep(150);
  await chk(!(await p.evaluate(()=>!!document.querySelector('.gxh-bub'))),'bubble dismisses on a tap',ctx,ph,p)}
// the lightbulb: the finger sits on what the advice function names; no advice -> rules cards only
async function hintCheck(p,ctx){
  const info=await p.evaluate(()=>{const hp=me();const ms=legalTakes(G,hp.i);const R=ms.map(m=>({m,net:phNow(m,hp.i).net})).sort((a,b)=>b.net-a.net);const max=R[0].net;
    const teach=!BF.seen.took;const a=adviceFor(hp.i);let an=null;if(a)an=(R.find(x=>JSON.stringify(x.m)===JSON.stringify(a.m))||{}).net;
    const close=R.filter(x=>x.net>=max-1).length;return {has:!!a,max,an,teach,close,why:a?a.why:'',m:a?a.m:null}});
  await p.evaluate(()=>{GXH.hide();UI.sel=null;UI.tgt=null;bfDraw()});await sleep(120);HT.bulbs++;
  const bulb=await p.evaluate(()=>{const b=document.getElementById('bulbbtn');if(!b)return null;const r=b.getBoundingClientRect();return {w:r.width,h:r.height,old:!!document.querySelector('[data-bf=hint]')}});
  await chk(!!bulb&&bulb.w>=40&&bulb.h>=40&&!bulb.old,'one bulb, big enough',ctx,JSON.stringify(bulb),p);
  if(!bulb)return;
  if(info.has){await chk(info.an===info.max,'hint = best net move',ctx,`hinted net ${info.an} but best is ${info.max}`,p);
    await chk(info.teach||info.close===1,'hint only when clear-cut',ctx,`${info.close} moves within 1 point`,p);
    await chk(!/fewest/i.test(info.why)||info.m.line===5,'hint text honest',ctx,info.why,p);
    await tapEl(p,'#bulbbtn');await sleep(350);
    const f=await p.evaluate(m=>{const fg=document.querySelector('.gxh-finger');if(!fg)return {vis:false};const tx=+fg.dataset.tx,ty=+fg.dataset.ty;
      const els=[...document.querySelectorAll(m.src<0?'[data-k^="c_"]':`[data-k^="f${m.src}_"]`)];let best=1e9;for(const e of els){const q=e.getBoundingClientRect();best=Math.min(best,Math.hypot(q.left+q.width/2-tx,q.top+q.height/2-ty))}
      const b=document.querySelector('.gxh-bub.gxh-bulbb');return {vis:true,d:best,n:els.length,why:b&&b.querySelector('.gxh-tx').textContent,link:!!(b&&b.querySelector('.gxh-link')),rings:document.querySelectorAll('.gxh-ring').length}},info.m);
    await chk(f.vis&&f.d<40,'finger names the hinted move',ctx,'finger '+JSON.stringify(f),p);
    if(f.vis){await chk(f.why&&wc(f.why)<=15,'bulb why <= 15 words',ctx,f.why,p);await chk(f.link,'bulb bubble has "How does this work?"',ctx,'no link',p)}
    if(f.vis&&Math.random()<.5&&f.link){await tapEl(p,'.gxh-bub .gxh-link');await sleep(250);await rulesCheck(p,ctx,'bulb link')}}
  else{HT.bulbNull++;await tapEl(p,'#bulbbtn');await sleep(350);
    const f=await p.evaluate(()=>({finger:!!document.querySelector('.gxh-finger'),rules:!!document.querySelector('.gxh-rules')}));
    await chk(!f.finger,'no finger when no hint',ctx,'finger shown without a hint',p);await chk(f.rules,'no hint: rules cards open',ctx,'no rules overlay',p);if(f.rules)await rulesCheck(p,ctx,'no-advice bulb')}
  await p.evaluate(()=>{GXH.hide();const r=document.querySelector('.gxh-rules');if(r)r.remove()});await sleep(100)}
// one human move by touch
async function humanMove(p,ctx){
  const m=await p.evaluate(()=>{const ms=validMoves(0);return ms.length?ms[Math.floor(Math.random()*ms.length)]:null});
  if(!m){await fail('legal move exists',ctx,'no legal move',p);return false}
  const before=await st(p);
  if(m.act==='wall'){const cells=await p.evaluate(()=>[...document.querySelectorAll('[data-bfcell]')].map(e=>e.dataset.bfcell).sort().join('|'));
    const want=await p.evaluate(()=>validMoves(0).map(m=>m.r+','+m.c).sort().join('|'));await chk(cells===want,'glowing wall cells = legal cells',ctx,cells+' vs '+want,p);
    await coachBubble(p,ctx,'wall');await tapEl(p,`[data-bfcell="${m.r},${m.c}"]`)}
  else{const key=await p.evaluate(m=>{const a=m.src<0?G.ctr:G.fac[m.src];const k=a.findIndex(t=>m.c===PRISM?t===PRISM:t===m.c);return k<0?null:(m.src<0?'c_':'f'+m.src+'_')+k},m);
    if(!key){await fail('legal move exists',ctx,'source tile missing '+JSON.stringify(m),p);return false}
    await tapEl(p,`[data-k="${key}"]`);await sleep(250);
    const sel=await p.evaluate(()=>UI.sel&&{src:UI.sel.src,c:UI.sel.c,j:UI.sel.j?1:0});
    await chk(sel&&sel.src===m.src&&sel.c===m.c,'tile tap selects it',ctx,JSON.stringify(sel)+' for '+JSON.stringify(m),p);
    if(sel&&m.c<5&&(sel.j?1:0)!==(m.j?1:0)){await tapEl(p,'[data-bf=prism]');await sleep(200)}
    await coachBubble(p,ctx,'rack');
    const rows=await p.evaluate(()=>{const ok=[...document.querySelectorAll('.bf-row.ok')].map(e=>+e.dataset.bfrow).sort().join(',');const want=movesFor(UI.sel).map(m=>m.line).filter(l=>l<5).sort().join(',');return {ok,want}});
    await chk(rows.ok===rows.want,'glowing rows = legal rows',ctx,JSON.stringify(rows),p);
    await tapEl(p,m.line===5?'[data-bfrow="5"]':`[data-bfrow="${m.line}"] .bf-rack`)}
  try{await p.waitForFunction(n=>G.logN!==n,before.logN,{timeout:3000,polling:50});await chk(true,'glowing target responds',ctx,'',p)}
  catch(e){await fail('glowing target responds',ctx,'tap on '+JSON.stringify(m)+' did nothing',p);await p.evaluate(()=>{UI.sel=null;bfDraw()});return false}
  return true}

async function playGame(b,i,vp,rotate){
  const ex=[{gray:false,prism:false},{gray:false,prism:true},{gray:true,prism:false},{gray:false,prism:false}][i%4];
  let [w,h]=vp;const p=await newPage(b,w,h);const ctx=`game${i} ${w}x${h}${rotate?' rot':''} ex=${ex.gray?'gray':ex.prism?'prism':'plain'}`;
  const tipsOn=i%4!==3;if(!tipsOn){await p.evaluate(()=>GXH.setEnabled(false));HT.tipsOff++}
  await startGame(p,ex);let turns=0,rotated=false,bad=0;
  for(;turns<150;turns++){
    if(!await waitTurn(p)){await fail('no stuck state',ctx,'nothing changed in 8s at turn '+turns+' '+JSON.stringify(await p.evaluate(()=>({ph:G.phase,side:sideToAct(),aiT:aiTimer,hold:phHold(),pause:UI.pause,busy:BF.busy,q:BF.q.length,over:!!G.over,boss:!!document.querySelector('.bf-bosscard'),modal:UI.modal,ov:(document.querySelector('.bf-ov')||{}).innerText,say:BF.say,sel:UI.sel}))),p);break}
    const s=await st(p);if(s.over)break;
    if(rotate&&!rotated&&turns===6){rotated=true;await p.setViewportSize({width:h,height:w});await p.evaluate(()=>{dispatchEvent(new Event('resize'));dispatchEvent(new Event('orientationchange'))});await sleep(800);
      await turnChecks(p,ctx+' (landscape)',{});await p.setViewportSize({width:w,height:h});await p.evaluate(()=>dispatchEvent(new Event('resize')));await sleep(800)}
    if(!await waitTurn(p))break;
    const c=ctx+' t'+turns;
    if(s.phase==='offer'&&(turns<3||turns%4===0))await coachBubble(p,c,'pick');
    await turnChecks(p,c,{noGlow:s.phase==='offer'});
    if(s.phase==='offer'&&turns%2===0)await hintCheck(p,c);
    if(!await humanMove(p,c)&&++bad>3)break;
    const e=p.errs.splice(0);await chk(!e.length,'no console/page errors',c,e.join(' | ').slice(0,300),p)}
  {const hst=await p.evaluate(()=>GXH.state());const dup=hst.shown.filter((x,i)=>hst.shown.indexOf(x)!==i);await chk(!dup.length,'bubble shown twice',ctx,dup.join(),p);if(!tipsOn)await chk(!hst.shown.length,'tips off: nothing shown',ctx,hst.shown.join(),p)}
  const fin=await p.evaluate(()=>({over:!!G.over,inv:checkInvariants()}));await chk(fin.over,'game finishes',ctx,'not over after '+turns+' turns',p);
  await chk(!fin.inv.length,'engine invariants',ctx,fin.inv.join('; '),p);
  const e=p.errs.splice(0);await chk(!e.length,'no console/page errors',ctx+' end',e.join(' | ').slice(0,300),p);
  await p.context().close()}

// ---- story chapters: 1 (no twist), 3 (boss takes the Sun token), 10 (boss studies deeper) ----
const CH_INIT=()=>{try{const ch={};for(let i=1;i<=10;i++)ch['c'+i]={beaten:true,stars:1,best:null,tries:0,losses:0,easy:false};ch.c1.beaten=false;
  localStorage.setItem('gns-campaign-sunglaze',JSON.stringify({v:1,ch,unlocked:[],last:null}))}catch(e){}};
async function storyGame(b,id,vp){const [w,h]=vp;const p=await newPage(b,w,h,CH_INIT);const ctx=`story ${id} ${w}x${h}`;
  await p.evaluate(()=>{UI.speed=3;if(!window.__slow){bfD=ms=>ms*.18;AIDELAY=150};const o=document.querySelector('[data-ui=story-ok]');if(o)o.click()});
  if(id!=='c1')await p.evaluate(id=>{const pr=JSON.parse(localStorage.getItem('gns-campaign-sunglaze'));pr.ch.c1.beaten=true;for(let i=2;i<10;i++)pr.ch['c'+i].beaten=true;localStorage.setItem('gns-campaign-sunglaze',JSON.stringify(pr))},id);
  // the chapter map title must not be cut off
  await p.evaluate(()=>campOpen());await sleep(600);
  const ti=await p.evaluate(()=>{const e=document.querySelector('.gxc-htitle');if(!e)return null;const b=e.querySelector('b')||e;return {sw:e.scrollWidth,cw:e.clientWidth,sh:e.scrollHeight,ch:e.clientHeight,txt:e.textContent,bh:b.getBoundingClientRect().height}});
  await chk(ti&&ti.sw<=ti.cw+1&&ti.sh<=ti.ch+1,'chapter map title fits',ctx,JSON.stringify(ti),p);
  await p.evaluate(()=>{GXC.scene=()=>Promise.resolve();GXC.bossCard=()=>Promise.resolve(true);UI.speed=3;if(!window.__slow){bfD=ms=>ms*.18;AIDELAY=150}});
  await p.evaluate(id=>GXC.play(id),id);await sleep(900);await p.evaluate(()=>{UI.speed=3;if(!window.__slow){bfD=ms=>ms*.18;AIDELAY=150}});
  const tw=await p.evaluate(()=>{const d=UI.cmp;return {id:d&&d.id,twist:d&&d.twist&&d.twist.id,first:G.first,cur:G.cur,roll:LVL.hard.roll,K:LVL.hard.K,slip:LVL.easy.slip,coach:UI.coach,chip:!!document.querySelector('.bf-bossb'),camp:G.campId,
    log:G.log.map(l=>l.t).join(' | ')}});
  await chk(tw.id===id,'story chapter starts',ctx,JSON.stringify(tw),p);
  if(id==='c3'){await chk(tw.twist==='boss-sun'&&tw.first===1&&/Boss rule/.test(tw.log),'boss twist applies: boss-sun',ctx,'first='+tw.first+' '+tw.log.slice(0,200),p);
    const firstTake=await p.evaluate(()=>{const t=G.log.map(l=>l.t).reverse().find(t=>/ takes \d+ | takes the /.test(t)||/ takes .*from/.test(t));return t});await chk(/^Saffra/.test(firstTake||''),'boss takes the first move',ctx,String(firstTake),p)}
  if(id==='c10')await chk(tw.twist==='boss-deep-sight'&&tw.roll===4&&tw.K===14,'boss twist applies: deep-sight',ctx,JSON.stringify(tw),p);
  if(id==='c1')await chk(!tw.twist&&Math.abs(tw.slip-.8)<1e-9&&tw.coach,'chapter 1 setup (no twist, beginner slips)',ctx,JSON.stringify(tw),p);
  if(id!=='c1'){await chk(tw.chip,'boss rule chip shown',ctx,'no .bf-bossb',p);
    await tapEl(p,'.bf-bossb');await sleep(300);const card=await p.evaluate(()=>{const c=document.querySelector('.bf-bosscard');return c&&c.textContent});await chk(card&&/rule/i.test(card),'tap chip reads the rule',ctx,String(card),p);
    await tapEl(p,'.bf-bosscard [data-bf=close]');await sleep(300)}
  // play some turns, then reload and Continue the saved game: the chapter must survive
  let turns=0;for(;turns<150;turns++){
    if(!await waitTurn(p)){await fail('no stuck state',ctx,'nothing changed in 8s at turn '+turns+' '+JSON.stringify(await p.evaluate(()=>({ph:G.phase,side:sideToAct(),aiT:aiTimer,hold:phHold(),pause:UI.pause,busy:BF.busy,q:BF.q.length,over:!!G.over,boss:!!document.querySelector('.bf-bosscard'),modal:UI.modal,ov:(document.querySelector('.bf-ov')||{}).innerText,say:BF.say,sel:UI.sel}))),p);break}
    const s=await st(p);if(s.over)break;
    if(id==='c3'&&turns===4){await p.reload();await sleep(1500);
      await p.evaluate(()=>{UI.speed=3;if(!window.__slow){bfD=ms=>ms*.18;AIDELAY=150}});const had=await tapEl(p,'[data-ui=continue]');await sleep(1500);
      const r=await p.evaluate(()=>({id:UI.cmp&&UI.cmp.id,active:GXC.active()&&GXC.active().id,chip:!!document.querySelector('.bf-bossb'),camp:G&&G.campId}));
      await chk(had&&r.id==='c3'&&r.active==='c3'&&r.chip,'resumed story game keeps its chapter',ctx,JSON.stringify({had,...r}),p);
      await p.evaluate(()=>{UI.speed=3;if(!window.__slow){bfD=ms=>ms*.18;AIDELAY=150}});continue}
    await turnChecks(p,ctx+' t'+turns,{});if(!await humanMove(p,ctx+' t'+turns))break;
    const e=p.errs.splice(0);await chk(!e.length,'no console/page errors',ctx+' t'+turns,e.join(' | ').slice(0,300),p)}
  const fin=await p.evaluate(()=>({over:!!G.over,inv:checkInvariants(),won:G.over&&G.over.win.includes(0)}));
  await chk(fin.over,'story game finishes',ctx,'not over',p);await chk(!fin.inv.length,'engine invariants',ctx,fin.inv.join('; '),p);
  if(fin.over){let res=false;for(let k=0;k<100&&!res;k++){await sleep(200);res=await p.evaluate(()=>!!document.querySelector('.gxc-res-on .gxc-res'))}await chk(res,'chapter result screen appears',ctx,'no result screen',p)}
  const e=p.errs.splice(0);await chk(!e.length,'no console/page errors',ctx+' end',e.join(' | ').slice(0,300),p);await p.context().close()}

(async()=>{const b=await chromium.launch();const t0=Date.now();
  const jobs=[];const VPS=process.env.VP?[process.env.VP.split('x').map(Number)]:[[390,763],[375,553]];
  for(let i=0;i<(process.env.NOGAMES?0:GAMES);i++)jobs.push(()=>playGame(b,i,VPS[i%VPS.length],false));
  for(let i=0;i<(process.env.NOGAMES?0:ROT);i++)jobs.push(()=>playGame(b,1000+i,VPS[i%VPS.length],true));
  for(const id of process.env.NOSTORY?[]:process.env.ONLY?process.env.ONLY.split(','):QUICK?['c3']:['c1','c3','c10'])for(const vp of VPS)jobs.push(()=>storyGame(b,id,vp));
  let next=0;const workers=Array.from({length:CONC},async()=>{while(next<jobs.length){const j=jobs[next++];try{await j()}catch(e){await fail('sweep crashed',String(e.message).slice(0,80),e.stack.split('\n').slice(0,3).join(' '),null)}}});
  await Promise.all(workers);await b.close();
  let P=0,F=0;console.log('\n=== SWEEP SUMMARY ('+Math.round((Date.now()-t0)/1000)+'s) ===');
  for(const k of Object.keys(COUNT).sort()){const c=COUNT[k];P+=c.p;F+=c.f;console.log(`${c.f?'FAIL':'PASS'}  ${k.padEnd(44)} pass=${c.p} fail=${c.f}`)}
  console.log('help: bubbles '+JSON.stringify(HT.bubbles)+', bulb taps '+HT.bulbs+' ('+HT.bulbNull+' with no advice), rules opened '+HT.rules+', tips-off games '+HT.tipsOff);
  console.log(`TOTAL pass=${P} fail=${F}`);
  FAILS.slice(0,+(process.env.SHOWFAILS||10)).forEach((f,i)=>console.log(`#${i+1} [${f.k}] ${f.ctx}: ${f.msg}${f.shot?'  shot: sweep-shots/'+f.shot:''}`));
  process.exit(F?1:0)})();
