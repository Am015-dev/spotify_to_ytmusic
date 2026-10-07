// Sweep: full games through the real page with touch taps only (glowing places, pawn tray, big button, answer buttons)
// at 390x763 and 375x553. Fails on: page errors, a glowing place that does not respond, a stuck screen (>8 s without
// progress), resource numbers on screen != engine, status text > 8 words, covered big button, horizontal scroll.
// Help kit checks (gx-help): fresh profile, every first-time bubble shows once, points at the board, never covers its target or a glowing place,
// dismisses on a tap; the bulb's finger is the advisor's own move (recPlan / aiChoose), why <= 15 words, rules 2-4 cards <= 20 words with a picture;
// 1 game in 5 plays with tips off and must show no bubble at all.
// usage: NODE_PATH=/opt/node-tools/node_modules node sweep.js [gamesPerSize=12]
const PW=require(process.env.PW||'playwright');const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'shipwreck.html'));const N=+(process.argv[2]||12),SEED0=+(process.argv[3]||101);let bad=0,games=0;const HELP={bubbles:{},bulbs:0,bulbNull:0,rules:0,beatBulbs:0,off:0};
const SC=['marooned','hexed','stranded','settlers'];
async function tapSel(p,sel){const pt=await p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}},sel);if(!pt)return false;await p.touchscreen.tap(pt.x,pt.y);return true}
async function one(b,W,H,seed){const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});
 await ctx.route('**/*',r=>new URL(r.request().url()).host==='swi.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const tag=`${W}x${H} seed ${seed}`;const tipsOn=seed%5!==4;const prob=m=>{bad++;console.log(tag,'PROBLEM',m)};
 await p.goto('https://swi.test/');await p.waitForTimeout(900);
 await p.evaluate(([s,sc,tips])=>{try{localStorage.clear()}catch(e){}GXH.reset();GXH.setEnabled(tips);setSeed(s);AIDELAY=0;UI.speed=8;try{setGfx('low')}catch(e){}UI.setup.scen=sc;render()},[seed,SC[seed%4],tipsOn]);
 await p.tap('[data-a=start]');await p.waitForTimeout(1200);
 const innerWidthOf=w=>w;
 // ---- help kit checks
 const seenPh=new Set();let bulbN=0;
 const wc=t=>String(t||'').replace(/[^a-zA-Z0-9'’+]+/g,' ').trim().split(' ').filter(Boolean).length;
 const NEUTRAL=[W-8,100];   // open water at the top right of the island: a tap there does nothing
 const ctr=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();if(!r.width)return null;return [r.left+r.width/2,r.top+r.height/2]},sel);
 const rulesCheck=async(ph)=>{HELP.rules++;
  const R=await p.evaluate(()=>{const e=document.querySelector('.gxh-rules');if(!e)return null;const out=[];const n=+e.dataset.count;const card=e.querySelector('.gxh-card');
   for(let i=0;i<n;i++){out.push({t:e.querySelector('.gxh-rt').textContent,x:e.querySelector('.gxh-rx').textContent,pic:!!e.querySelector('.gxh-pic svg')});if(i<n-1)e.querySelector('.gxh-next').click()}
   const r=card.getBoundingClientRect();return {n,cards:out,inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}});
  if(!R){prob('rules cards did not open ('+ph+')');return}
  if(R.n<2||R.n>4)prob('rules for '+ph+' have '+R.n+' cards (want 2-4)');
  R.cards.forEach(c=>{if(wc(c.x)>20)prob('rules card over 20 words ('+ph+'): '+c.x);if(!c.pic)prob('rules card without a picture ('+ph+'): '+c.t)});
  if(!R.inside)prob('rules card outside the screen ('+ph+')');
  await p.evaluate(()=>document.querySelector('.gxh-rules .gxh-x').click());await p.waitForTimeout(100);
  if(await p.evaluate(()=>!!document.querySelector('.gxh-rules')))prob('rules cards did not close')};
 const helpFlow=async()=>{
  const hs=await p.evaluate(()=>({ph:hlpPhase(),busy:hlpBusy(),step:!!HLP_STEPS[hlpPhase()],st:GXH.state(),tl:window.innerWidth}));
  if(await p.evaluate(()=>{let n=0;if(GX.open){GX.close();n=1}if(PHO.pop&&PHO.pop.k==='status'){PHO.closePop();n=1}return n}))HELP.stray=(HELP.stray||0)+1;   // a tap that landed on the camp chip or the i button: counted, closed
  if(hs.st.rules){prob('rules overlay stuck open');await p.evaluate(()=>{const x=document.querySelector('.gxh-rules .gxh-x');if(x)x.click()});return false}
  if(!tipsOn){if(hs.st.shown.length||hs.st.cur){prob('tips are off but a bubble appeared: '+JSON.stringify(hs.st))}return false}
  // 1) the first-time bubble of this phase
  if(hs.ph&&hs.step&&!hs.busy&&!seenPh.has(hs.ph)){seenPh.add(hs.ph);
   if(hs.st.seen.includes(hs.ph)&&!hs.st.cur)return false;   // its bubble was shown and tapped away by the play loop before this check
   let b=null;const t1=Date.now();
   while(Date.now()-t1<2500){b=await p.evaluate(ph=>{const e=document.querySelector('.gxh-bub.on[data-phase]');if(!e)return null;const rc=r=>({left:r.left,top:r.top,right:r.right,bottom:r.bottom});
     const t=HLP_STEPS[ph].target();let T=null;if(t){if(t.getBoundingClientRect)T=rc(t.getBoundingClientRect());else if(t.left!=null)T={left:t.left,top:t.top,right:t.left+(t.width||0),bottom:t.top+(t.height||0)}}
     const glows=[...document.querySelectorAll('.bfgl')].filter(g=>g.offsetParent!==null&&g.style.visibility!=='hidden').map(g=>{const r=g.getBoundingClientRect();return {cx:r.left+r.width/2,cy:r.top+r.height/2}});
     const r=e.getBoundingClientRect();return {id:e.dataset.phase,title:e.querySelector('.gxh-tt').textContent,text:e.querySelector('.gxh-tx').textContent,arrow:!!e.querySelector('.gxh-arr'),ok:!!e.querySelector('.gxh-ok'),r:rc(r),T,glows,sw:document.documentElement.scrollWidth>innerWidth+1}},hs.ph).catch(()=>null);if(b)break;await p.waitForTimeout(80)}
   if(!b)prob('no coach bubble for phase '+hs.ph+' '+await p.evaluate(()=>JSON.stringify({st:GXH.state(),busy:hlpBusy(),pop:PHO.pop,t:(()=>{try{return HLP_STEPS[hlpPhase()].target()}catch(e){return String(e)}})()})));
   else{HELP.bubbles[hs.ph]=(HELP.bubbles[hs.ph]||0)+1;
    if(b.id!==hs.ph)prob('bubble for '+b.id+' shown in phase '+hs.ph);
    if(wc(b.title)>4)prob('bubble title over 4 words: '+b.title);if(wc(b.text)>20)prob('bubble text over 20 words ('+wc(b.text)+'): '+b.text);
    if(!b.arrow||!b.ok)prob('bubble without arrow or Got it ('+hs.ph+')');
    if(b.T&&b.r.left<b.T.right&&b.r.right>b.T.left&&b.r.top<b.T.bottom&&b.r.bottom>b.T.top)prob('bubble covers its target ('+hs.ph+')');
    for(const g of b.glows)if(g.cx>b.r.left-12&&g.cx<b.r.right+12&&g.cy>b.r.top-12&&g.cy<b.r.bottom+12)prob('bubble covers a glowing place ('+hs.ph+') at '+Math.round(g.cx)+','+Math.round(g.cy));
    if(b.r.left<0||b.r.right>innerWidthOf(W)||b.sw)prob('bubble outside the screen ('+hs.ph+')');
    if(Math.random()<.5){await p.touchscreen.tap(...NEUTRAL)}else{await p.evaluate(()=>{const o=document.querySelector('.gxh-bub .gxh-ok');if(o)o.click()})}
    await p.waitForTimeout(150);
    if(await p.evaluate(()=>!!document.querySelector('.gxh-bub')))prob('bubble did not dismiss on a tap ('+hs.ph+')');
    return true}}
  // 2) the lightbulb: the first time in every phase, then now and then
  const ph2=hs.ph,beat=!ph2&&!hs.busy&&Math.random()<.06;
  if(!hs.busy&&((ph2&&(!seenPh.has('bulb:'+ph2)||Math.random()<.25))||beat)&&bulbN<14){if(ph2)seenPh.add('bulb:'+ph2);bulbN++;
   const pre=await p.evaluate(()=>{const ph=hlpPhase();const sug=hlpSuggest();let exp=null;
     if(ph==='job'){const c=curPawn();const rt=c&&BF.recTile(c);const t=rt&&BF.tilePt(rt.id);const f=c&&document.querySelector('#bf [data-pawn="'+c.id+'"]');const fr=f&&f.getBoundingClientRect();exp=t&&{tx:t.ox+t.x,ty:t.oy+t.y,fx:fr&&fr.left+fr.width/2,fy:fr&&fr.top+fr.height/2}}
     else if(ph==='choice'||ph==='dice'||ph==='place'){const q=G.q;let i=-1;try{i=aiChoose(q.title,q.opts,P(q.who),q)}catch(e){}
       if(ph==='place'){const t=i>=0&&BF.tilePt(q.opts[i].pos);exp=t&&{tx:t.ox+t.x,ty:t.oy+t.y}}else{const e=document.querySelector('#bf [data-ans="'+i+'"]');const r=e&&e.getBoundingClientRect();exp=r&&{tx:r.left+r.width/2,ty:r.top+r.height/2}}}
     else if(ph==='ready'&&sug&&sug.key==='ready'){const e=document.querySelector('#bf .btn.go');const r=e&&e.getBoundingClientRect();exp=r&&{tx:r.left+r.width/2,ty:r.top+r.height/2}}
     return {ph,sug:!!sug,exp,sig:[G.round,G.logN,UI.shown,G.plan.acts.map(a=>a.pw.length).join(''),!!G.q].join('|')}});
   const bb=await ctr('#bulbbtn');if(!bb){prob('no bulb button');return false}
   await p.touchscreen.tap(...bb);await p.waitForTimeout(350);
   const r=await p.evaluate(()=>{const f=document.querySelector('.gxh-finger'),b=document.querySelector('.gxh-bub.on'),ru=document.querySelector('.gxh-rules');
     return {f:f&&{...f.dataset},ring:document.querySelectorAll('.gxh-ring').length,why:b&&b.querySelector('.gxh-tx').textContent,link:!!(b&&b.querySelector('.gxh-link')),rules:!!ru}});
   if(pre.sug){HELP.bulbs++;
    if(!r.f)prob('bulb tapped, no finger ('+pre.ph+')');
    else if(pre.exp){if(Math.abs(+r.f.tx-pre.exp.tx)>2||Math.abs(+r.f.ty-pre.exp.ty)>2)prob('bulb finger target '+r.f.tx+','+r.f.ty+' != the advisor\'s move '+Math.round(pre.exp.tx)+','+Math.round(pre.exp.ty)+' ('+pre.ph+')');
     if(pre.exp.fx!=null&&(r.f.fx==null||Math.abs(+r.f.fx-pre.exp.fx)>2||Math.abs(+r.f.fy-pre.exp.fy)>2))prob('bulb finger start != the pawn in hand ('+pre.ph+')')}
    if(!r.ring)prob('bulb: nothing glows at the suggestion ('+pre.ph+')');
    if(!r.why||wc(r.why)>15)prob('bulb why '+wc(r.why)+' words: '+r.why);if(!r.link)prob('bulb bubble has no "How does this work?" ('+pre.ph+')');
    if(Math.random()<.5&&r.link){const lk=await ctr('.gxh-bub .gxh-link');if(lk){await p.touchscreen.tap(...lk);await p.waitForTimeout(250);await rulesCheck(pre.ph)}}
    else{await p.touchscreen.tap(...NEUTRAL);await p.waitForTimeout(150)}}
   else if(!pre.ph){HELP.bulbNull++;if(r.rules){HELP.beatBulbs++;await rulesCheck('scene')}}   // a scene is playing: the game moves on by itself, so only the cards are checked
   else{HELP.bulbNull++;if(r.f)prob('bulb with no suggestion still pointed a finger ('+pre.ph+')');if(!r.rules)prob('bulb with no suggestion did not open the rules ('+pre.ph+')');else{if(!pre.ph)HELP.beatBulbs++;await rulesCheck(pre.ph||'scene')}}
   await p.evaluate(()=>GXH.hide());
   const a=await p.evaluate(()=>({g:!!document.querySelector('.gxh-bub,.gxh-ring,.gxh-finger,.gxh-rules'),sig:[G.round,G.logN,UI.shown,G.plan.acts.map(a=>a.pw.length).join(''),!!G.q].join('|')}));
   if(a.g)prob('help still on screen after a tap ('+pre.ph+')');
   if(pre.ph&&a.sig!==pre.sig)prob('tapping the bulb changed the game ('+pre.sig+' -> '+a.sig+')');
   return true}
  return false};
 let noPick=0,badTaps=0,same=0,last='',lastT=Date.now(),steps=0,glow=0,resChecks=0,minPct=100;
 while(steps++<(+process.env.MAXSTEPS||3000)){
  if(steps%50===0&&process.env.HB)console.log(tag,'hb',steps,JSON.stringify(await p.evaluate(()=>({st:PHO.st,lb:document.querySelector('#phlabel').textContent,r:G.round,tray:document.querySelector('#bf').innerText.replace(/\n/g,'|').slice(0,80),acts:G.plan.acts.map(a=>a.type+':'+a.pw.join('+')).join(' '),pb:planProblems().slice(0,2),shown:UI.shown,n:UI.beats.length,cur:!!curPawn(),pick:(UI.pick||[]).length,bad:(()=>{const e=document.querySelector('#bf .bfpw.bad');if(!e)return null;const r=e.getBoundingClientRect();const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return [Math.round(r.left),Math.round(r.top),Math.round(r.width),t&&(t.className||t.tagName)]})(),cls:[...document.querySelectorAll('#bf .bfpw')].map(e=>e.className.replace('bfpw','').trim()).join('/')}))));
  const s=await p.evaluate(()=>{const vis=e=>e&&e.offsetParent!==null;const lb=document.querySelector('#phlabel');const chip=document.querySelector('#phchip');const bd=document.querySelector('.gx-board').getBoundingClientRect();
   let eng=null;try{if(PHO.st==='plan2'||PHO.st==='plan'){eng={f:food(),w:G.res.wood}}}catch(e){}
   const btn=document.querySelector('#bf .btn.go');let cov=false;if(btn){const r=btn.getBoundingClientRect();const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);cov=!(e&&(e===btn||btn.contains(e)))}
   return {st:PHO.st,over:!!G.over,sig:[G.round,G.logN,UI.shown,G.plan&&G.plan.acts.map(a=>a.pw.length).join(''),PHO.st,!!G.q,UI.confirm?1:0].join('|'),words:lb?lb.textContent.trim().split(/\s+/).filter(Boolean).length:0,lb:lb&&lb.textContent,chip:chip?chip.textContent:'',eng,cov,pct:bd.height/innerHeight*100,sw:document.documentElement.scrollWidth>innerWidth+1,hasPawn:!!curPawn(),pick:UI.pick||[],ans:!!document.querySelector('#bf [data-ans]'),posq:BF.posQ()?UI.pick:null}});
  if(s.over||s.st==='over')break;minPct=Math.min(minPct,s.pct);
  if(await helpFlow()){lastT=Date.now();continue}
  if(s.words>8)prob('status >8 words: '+s.lb);if(s.sw)prob('horizontal scroll');if(s.cov&&!global.__shot){global.__shot=1;await p.screenshot({path:'/tmp/claude-0/cov.png'})}if(s.cov)prob('big button covered at '+s.st+' by '+await p.evaluate(()=>{const b=document.querySelector('#bf .btn.go');const r=b.getBoundingClientRect();const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return (e&&(e.tagName+'.'+String(e.className).slice(0,50)))+' help='+JSON.stringify(GXH.state().cur)+' btn='+[r.left,r.top,r.width,r.height].map(Math.round)}));
  if(s.eng){const m=/🍖(\d+)🪵(\d+)/.exec(s.chip);resChecks++;if(!m||+m[1]!==s.eng.f||+m[2]!==s.eng.w)prob(`resources on screen "${s.chip}" != engine food ${s.eng.f} wood ${s.eng.w}`)}
  if(s.sig!==last){last=s.sig;lastT=Date.now();same=0}else same++;s.stuckish=same;if(false){}else if(Date.now()-lastT>8000){prob('stuck >8s at '+s.st+' '+s.lb+' '+JSON.stringify(await p.evaluate(()=>({tray:document.querySelector('#bf').innerText.replace(/\n/g,'|'),pb:planProblems(),conf:UI.confirm,acts:G.plan.acts.map(a=>a.type+':'+a.pw.join('+')),cur:!!curPawn(),pick:UI.pick,cls:[...document.querySelectorAll('#bf .bfpw')].map(e=>e.className).join('/'),ids:G.plan.acts.map(a=>a.id).join(),q:!!G.q,over:!!G.over}))));break}
  if(s.st==='plan2'||s.st==='plan'){
   if(await p.$('#bf [data-a=go][data-force]')){await tapSel(p,'#bf [data-a=go][data-force]');await p.waitForTimeout(200);continue}
   if(s.hasPawn&&s.pick.length){const id=s.pick[(Math.random()*s.pick.length)|0];const pt=await p.evaluate(i=>{const t=BF.tilePt(i);return t&&{x:t.ox+t.x,y:t.oy+t.y}},id);
     if(pt){const a0=await p.evaluate(()=>G.plan.acts.reduce((n,a)=>n+a.pw.length,0));await p.touchscreen.tap(pt.x,pt.y);await p.waitForTimeout(250);glow++;
      if(await p.$('#ppop:not([hidden]) .bfr[data-place]')){await tapSel(p,'#ppop .bfr[data-place]');await p.waitForTimeout(250)}
      const r=await p.evaluate(a0=>({a1:G.plan.acts.reduce((n,a)=>n+a.pw.length,0),pop:!!PHO.pop,msg:document.querySelector('#phlabel').textContent}),a0);
      if(r.a1===a0&&!r.pop&&!/can't|Nothing|Too far/.test(r.msg))prob('glowing place '+id+' did not respond: '+r.msg+' '+JSON.stringify(await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);const b=document.querySelector('.gx-board').getBoundingClientRect();return {x:Math.round(x),y:Math.round(y),el:e&&(e.id||e.className||e.tagName),board:[b.top,b.bottom,innerWidth],pop:PHO.pop&&PHO.pop.k}},[pt.x,pt.y])));await p.evaluate(()=>PHO.closePop(true));continue}}
   if(s.hasPawn&&(++noPick%2)){await tapSel(p,'#bf [data-a=suggest]');await p.waitForTimeout(200);continue}
   if(!s.hasPawn&&s.stuckish>1&&(++badTaps%3===0)){await tapSel(p,'#bf [data-a=suggest]');await p.waitForTimeout(250);continue}
   if(!s.hasPawn&&s.stuckish>1&&await tapSel(p,'#bf .bfpw.bad')){await p.waitForTimeout(250);continue}
   if(!s.hasPawn&&s.stuckish>1){const pt=await p.evaluate(()=>{const e=document.querySelector('#bfchips .bfa.warn[data-rm]');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});if(pt){await p.touchscreen.tap(pt.x,pt.y);await p.waitForTimeout(250);continue}}
   const g=(await p.$('#bf [data-a=go][data-force]'))?'#bf [data-a=go][data-force]':'#bf [data-a=go]';if(await tapSel(p,g)){await p.waitForTimeout(200);continue}}
  if(s.posq&&s.posq.length){const id=s.posq[(Math.random()*s.posq.length)|0];const pt=await p.evaluate(i=>{const t=BF.tilePt(i);return t&&{x:t.ox+t.x,y:t.oy+t.y}},id);if(pt){const q0=await p.evaluate(()=>G.q&&G.q.title);await p.touchscreen.tap(pt.x,pt.y);await p.waitForTimeout(250);const q1=await p.evaluate(()=>G.q&&G.q.title);if(q0&&q0===q1&&same>3)console.log(tag,'posQ tap no response',JSON.stringify(await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);const b=document.querySelector('.gx-board').getBoundingClientRect();return {x:Math.round(x),y:Math.round(y),el:e&&(e.id||e.className||e.tagName),board:[b.top,b.bottom,innerWidth]}},[pt.x,pt.y])));continue}}
  if(s.ans){const n=await p.$$eval('#bf [data-ans]',e=>e.length);await tapSel(p,`#bf [data-ans="${(Math.random()*n)|0}"]`);await p.waitForTimeout(150);continue}
  if(Math.random()<.5&&await tapSel(p,'#bf [data-a=next]')){await p.waitForTimeout(100);continue}
  await p.waitForTimeout(250)}
 if(steps>=(+process.env.MAXSTEPS||3000))prob('game did not finish in 3000 steps');
 if(errs.length){bad+=errs.length;console.log(tag,'PAGE ERRORS',errs.slice(0,3))}
 games++;console.log(tag,'scen',SC[seed%4],'steps',steps,'glowTaps',glow,'resChecks',resChecks,'board%',minPct.toFixed(0));await ctx.close()}
const LAUNCH={args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']};
// one fresh browser per game; a browser killed from outside (shared machine) is retried, not counted as a game bug
async function game(W,H,seed){for(let a=0;a<3;a++){let b;try{b=await PW.chromium.launch(LAUNCH);await one(b,W,H,seed);return}catch(e){console.log(`${W}x${H} seed ${seed} retry (${String(e.message).split('\n')[0].slice(0,70)})`)}finally{if(b)await b.close().catch(()=>{})}}bad++;console.log(`${W}x${H} seed ${seed} PROBLEM could not finish after 3 tries`)}
(async()=>{await Promise.all([[390,763],[375,553]].map(async([W,H])=>{for(let i=0;i<N;i++)await game(W,H,SEED0+i)}));
 console.log('help kit:',JSON.stringify(HELP));if(N>=8)for(const k of['job','ready','choice','intro','daysum'])if(!HELP.bubbles[k]){bad++;console.log('PROBLEM no coach bubble was ever checked for phase',k)}
 console.log(bad?`FAIL ${bad} problems`:`PASS ${games} games`);process.exit(bad?1:0)})()
