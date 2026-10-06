// Sweep: full games through the real page with touch taps only (glowing places, pawn tray, big button, answer buttons)
// at 390x763 and 375x553. Fails on: page errors, a glowing place that does not respond, a stuck screen (>8 s without
// progress), resource numbers on screen != engine, status text > 8 words, covered big button, horizontal scroll.
// usage: NODE_PATH=/opt/node-tools/node_modules node sweep.js [gamesPerSize=12]
const PW=require(process.env.PW||'playwright');const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'shipwreck.html'));const N=+(process.argv[2]||12),SEED0=+(process.argv[3]||101);let bad=0,games=0;
const SC=['marooned','hexed','stranded','settlers'];
async function tapSel(p,sel){const pt=await p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}},sel);if(!pt)return false;await p.touchscreen.tap(pt.x,pt.y);return true}
async function one(b,W,H,seed){const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});
 await ctx.route('**/*',r=>new URL(r.request().url()).host==='swi.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const tag=`${W}x${H} seed ${seed}`;const prob=m=>{bad++;console.log(tag,'PROBLEM',m)};
 await p.goto('https://swi.test/');await p.waitForTimeout(900);
 await p.evaluate(([s,sc])=>{try{localStorage.clear()}catch(e){}setSeed(s);AIDELAY=0;UI.speed=8;UI.setup.scen=sc;render()},[seed,SC[seed%4]]);
 await p.tap('[data-a=start]');await p.waitForTimeout(1200);
 let same=0,last='',lastT=Date.now(),steps=0,glow=0,resChecks=0,minPct=100;
 while(steps++<(+process.env.MAXSTEPS||3000)){
  const s=await p.evaluate(()=>{const vis=e=>e&&e.offsetParent!==null;const lb=document.querySelector('#phlabel');const chip=document.querySelector('#phchip');const bd=document.querySelector('.gx-board').getBoundingClientRect();
   let eng=null;try{if(PHO.st==='plan2'||PHO.st==='plan'){eng={f:food(),w:G.res.wood}}}catch(e){}
   const btn=document.querySelector('#bf .btn.go');let cov=false;if(btn){const r=btn.getBoundingClientRect();const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);cov=!(e&&(e===btn||btn.contains(e)))}
   return {st:PHO.st,over:!!G.over,sig:[G.round,G.logN,UI.shown,G.plan&&G.plan.acts.map(a=>a.pw.length).join(''),PHO.st,!!G.q,UI.confirm?1:0].join('|'),words:lb?lb.textContent.trim().split(/\s+/).filter(Boolean).length:0,lb:lb&&lb.textContent,chip:chip?chip.textContent:'',eng,cov,pct:bd.height/innerHeight*100,sw:document.documentElement.scrollWidth>innerWidth+1,hasPawn:!!curPawn(),pick:UI.pick||[],ans:!!document.querySelector('#bf [data-ans]')}});
  if(s.over||s.st==='over')break;minPct=Math.min(minPct,s.pct);
  if(s.words>8)prob('status >8 words: '+s.lb);if(s.sw)prob('horizontal scroll');if(s.cov)prob('big button covered at '+s.st);
  if(s.eng){const m=/🍖(\d+)🪵(\d+)/.exec(s.chip);resChecks++;if(!m||+m[1]!==s.eng.f||+m[2]!==s.eng.w)prob(`resources on screen "${s.chip}" != engine food ${s.eng.f} wood ${s.eng.w}`)}
  if(s.sig!==last){last=s.sig;lastT=Date.now();same=0}else same++;s.stuckish=same;if(false){}else if(Date.now()-lastT>8000){prob('stuck >8s at '+s.st+' '+s.lb+' '+JSON.stringify(await p.evaluate(()=>({tray:document.querySelector('#bf').innerText.replace(/\n/g,'|'),pb:planProblems(),conf:UI.confirm,acts:G.plan.acts.map(a=>a.type+':'+a.pw.join('+')),cur:!!curPawn(),pick:UI.pick,q:!!G.q,over:!!G.over}))));break}
  if(s.st==='plan2'||s.st==='plan'){
   if(await p.$('#bf [data-a=go][data-force]')){await tapSel(p,'#bf [data-a=go][data-force]');await p.waitForTimeout(200);continue}
   if(s.hasPawn&&s.pick.length){const id=s.pick[(Math.random()*s.pick.length)|0];const pt=await p.evaluate(i=>{const t=BF.tilePt(i);return t&&{x:t.ox+t.x,y:t.oy+t.y}},id);
     if(pt){const a0=await p.evaluate(()=>G.plan.acts.reduce((n,a)=>n+a.pw.length,0));await p.touchscreen.tap(pt.x,pt.y);await p.waitForTimeout(250);glow++;
      if(await p.$('#ppop:not([hidden]) .bfr[data-place]')){await tapSel(p,'#ppop .bfr[data-place]');await p.waitForTimeout(250)}
      const r=await p.evaluate(a0=>({a1:G.plan.acts.reduce((n,a)=>n+a.pw.length,0),pop:!!PHO.pop,msg:document.querySelector('#phlabel').textContent}),a0);
      if(r.a1===a0&&!r.pop&&!/can't|Nothing|Too far/.test(r.msg))prob('glowing place '+id+' did not respond: '+r.msg);await p.evaluate(()=>PHO.closePop(true));continue}}
   if(s.hasPawn){await tapSel(p,'#bf [data-a=suggest]');await p.waitForTimeout(200);continue}
   if(!s.hasPawn&&s.stuckish>1&&await tapSel(p,'#bf .bfpw.bad')){await p.waitForTimeout(250);continue}
   if(!s.hasPawn&&s.stuckish>1){const pt=await p.evaluate(()=>{const e=document.querySelector('#bfchips .bfa.warn[data-rm]');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});if(pt){await p.touchscreen.tap(pt.x,pt.y);await p.waitForTimeout(250);continue}}
   const g=(await p.$('#bf [data-a=go][data-force]'))?'#bf [data-a=go][data-force]':'#bf [data-a=go]';if(await tapSel(p,g)){await p.waitForTimeout(200);continue}}
  if(s.ans){const n=await p.$$eval('#bf [data-ans]',e=>e.length);await tapSel(p,`#bf [data-ans="${(Math.random()*n)|0}"]`);await p.waitForTimeout(150);continue}
  if(Math.random()<.5&&await tapSel(p,'#bf [data-a=next]')){await p.waitForTimeout(100);continue}
  await p.waitForTimeout(250)}
 if(steps>=(+process.env.MAXSTEPS||3000))prob('game did not finish in 3000 steps');
 if(errs.length){bad+=errs.length;console.log(tag,'PAGE ERRORS',errs.slice(0,3))}
 games++;console.log(tag,'scen',SC[seed%4],'steps',steps,'glowTaps',glow,'resChecks',resChecks,'board%',minPct.toFixed(0));await ctx.close()}
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 await Promise.all([[390,763],[375,553]].map(async([W,H])=>{for(let i=0;i<N;i++)await one(b,W,H,SEED0+i)}));
 console.log(bad?`FAIL ${bad} problems`:`PASS ${games} games`);await b.close();process.exit(bad?1:0)})()
