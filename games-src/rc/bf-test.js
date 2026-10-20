// Board-first check: plays full days through the real page with touch taps at 390x763 and 375x553.
// Asserts: no page errors, board >= 60% of height, status line <= 8 words, dock/story card hidden, glowing places respond.
const PW=require(process.env.PW||'playwright');const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'shipwreck.html'));let bad=0;
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [W,H] of [[390,763],[375,553]]){const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});
 await ctx.route('**/*',r=>new URL(r.request().url()).host==='swi.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const prob=m=>{bad++;console.log(W+'x'+H,'PROBLEM',m)};
 await p.goto('https://swi.test/');await p.waitForTimeout(1200);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(7);AIDELAY=0});
 await p.tap('[data-a=start]');await p.waitForTimeout(1500);let minPct=100,days=0,plans=0,tapsTile=0;
 for(let k=0;k<400&&days<3;k++){
  const s=await p.evaluate(()=>{const r=document.querySelector('.gx-board').getBoundingClientRect();const lb=document.querySelector('#phlabel').textContent.trim();
    const vis=e=>e&&e.offsetParent!==null;return {pct:r.height/innerHeight*100,words:lb?lb.split(/\s+/).length:0,lb,st:PHO.st,dock:vis(document.querySelector('.gx-dock')),story:vis(document.querySelector('#story')),over:!!G.over,round:G.round,sw:document.documentElement.scrollWidth>innerWidth+1}});
  minPct=Math.min(minPct,s.pct);if(s.words>8)prob('status >8 words: '+s.lb);if(s.dock||s.story)prob('text panel visible');if(s.sw)prob('horizontal scroll');
  if(s.over)break;days=s.round-1;
  if(s.st==='plan2'){plans++;const ids=await p.evaluate(()=>UI.pick||[]);if(!ids.length&&await p.evaluate(()=>!!curPawn()))prob('no glowing place for a free pawn');
    if(ids.length&&Math.random()<.8){const pt=await p.evaluate(i=>{const t=BF.tilePt(i);return t&&{x:t.ox+t.x,y:t.oy+t.y}},ids[0]);const a0=await p.evaluate(()=>G.plan.acts.reduce((n,a)=>n+a.pw.length,0));await p.touchscreen.tap(pt.x,pt.y);await p.waitForTimeout(300);
      if(await p.$('#ppop:not([hidden]) .bfr[data-place]'))await (await p.$('#ppop .bfr[data-place]')).tap();await p.waitForTimeout(300);tapsTile++;
      const a1=await p.evaluate(()=>G.plan.acts.reduce((n,a)=>n+a.pw.length,0)+':'+(PHO.pop?1:0));if(a1.startsWith(a0+':')&&!(await p.evaluate(()=>PHO.pop)))prob('glowing place did not respond '+JSON.stringify({id:ids[0],pt,a0,a1,msg:await p.evaluate(()=>document.querySelector('#phlabel').textContent),pop:await p.evaluate(()=>PHO.pop&&PHO.pop.k),el:await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&(e.id||e.className||e.tagName)},[pt.x,pt.y]),rows:await p.evaluate(([i])=>legalRowsDbg(i),[ids[0]])}));await p.evaluate(()=>PHO.closePop(true));continue}
    if(await p.evaluate(()=>!!curPawn()))await p.tap('#bf [data-a=suggest]');else await p.tap('#bf [data-a=go]');await p.waitForTimeout(250);continue}
  if(await p.$('#bf [data-ans]')){await p.tap('#bf [data-ans="0"]');await p.waitForTimeout(250);continue}
  if(await p.$('#bf [data-a=next]')){await p.tap('#bf [data-a=next]');await p.waitForTimeout(120);continue}
  if(await p.$('#bf [data-a=go]')){await p.tap('#bf [data-a=go]');continue}
  await p.waitForTimeout(300)}
 console.log(W+'x'+H,'min board %',minPct.toFixed(1),'days',days,'planTaps',tapsTile,'errors',errs.length);if(errs.length)bad+=errs.length;if(minPct<60)prob('board <60%');await ctx.close()}
console.log(bad?'FAIL '+bad:'PASS');await b.close();process.exit(bad?1:0)})()
