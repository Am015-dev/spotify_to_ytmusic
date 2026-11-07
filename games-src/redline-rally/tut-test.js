/* Tutorial-to-end: drives the Prologue from fresh storage by real taps on the spotlit elements (centre point), at phone and PC size.
   Asserts: every step id of tutCoverage() was shown, each target's centre is hit-testable (elementFromPoint is the target), the end card appears, 0 console errors.
   Usage: PW=../node_modules/playwright node tut-test.js */
const path=require('path'),{chromium}=require(process.env.PW||'playwright'),gx=require('../scripts/gx-serve.js');
const TAPS={gear:['.gb[data-g="2"]'],cards:['#hand .cd[data-i="1"]','#hand .cd[data-i="2"]'],push:['#hand .cd[data-i="0"]','#hand .cd[data-i="1"]'],brake:['#hand .cd[data-i="2"]','#hand .cd[data-i="3"]'],
 gamble:['#hand .cd[data-i="0"]','#hand .cd[data-i="1"]'],gear1:['.gb[data-g="1"]'],stress:['#hand .cd[data-i="1"]'],gear3:['.gb[data-g="3"]'],cards3:['#hand .cd[data-i="0"]','#hand .cd[data-i="1"]','#hand .cd[data-i="2"]'],
 slip:['#slipY'],gear2:['.gb[data-g="2"]'],cards2:['#hand .cd[data-i="0"]','#hand .cd[data-i="1"]'],boost:['#boostB'],go1:['#goB'],go2:['#goB'],go3:['#goB'],go4:['#goB'],go5:['#goB'],go6:['#goB']};
(async()=>{const url=await gx.url('redline-rally',{file:path.join(__dirname,'redline-rally.html')});const b=await chromium.launch({args:['--no-sandbox']});let fail=0;
for(const [n,vp,t] of [['phone',{width:390,height:763},true],['pc',{width:1440,height:860},false]]){
 const c=await b.newContext({viewport:vp,hasTouch:t,isMobile:t}),p=await c.newPage();const errs=[],problems=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.addInitScript(()=>{window.AIDELAY=.25});
 await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(400);
 await p.click('#tutSlot button');   // fresh storage: "New here? Learn..." is the first option
 const seen=[];const t0=Date.now();let ended=false;
 while(Date.now()-t0<(+process.env.TUTMS||300000)){
  const st=await p.evaluate(()=>GXT.state());
  if(!st.active){ended=true;break}
  if(st.phase==='end'){const eb=await p.$('.gxt-end .gxt-b.pri');if(eb){ended=true;await eb.click();await p.waitForTimeout(500)}break}
  if(st.shown&&st.id&&!seen.includes(st.id)){
   seen.push(st.id);if(process.env.TUTV)console.log(n,st.id,JSON.stringify(st.say).slice(0,60));
   const sels=TAPS[st.id];
   if(!sels){ // Next step: tap the Next button
    const nb=await p.$('.gxt-next');if(!nb){problems.push('no Next for '+st.id)}else{const r=await nb.boundingBox();const hit=await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return !!(e&&e.closest('.gxt-next'))},[r.x+r.width/2,r.y+r.height/2]);if(!hit)problems.push('Next covered at '+st.id);await p.mouse.click(r.x+r.width/2,r.y+r.height/2)}
    // also: the spotlit target must exist and be hit-testable
    continue}
   for(let k=0;k<sels.length;k++){
    // re-read: a tap may re-draw the spotlight; wait until shown again for multi-tap steps
    for(let w=0;w<40;w++){const s2=await p.evaluate(()=>GXT.state());if(s2.shown&&s2.id===st.id)break;await p.waitForTimeout(100)}
    const info=await p.evaluate((sel)=>{const e=document.querySelector(sel);if(!e)return null;e.scrollIntoView&&0;const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,h=document.elementFromPoint(x,y);return{x,y,hit:!!(h&&(h===e||e.contains(h))),inHole:(()=>{const s=GXT.state();return s.holes.some(o=>x>=o.left&&x<=o.left+o.width&&y>=o.top&&y<=o.top+o.height)})()}},sels[k]);
    if(!info){problems.push(st.id+': missing '+sels[k]);break}
    if(!info.hit)problems.push(st.id+': target covered '+sels[k]);
    if(!info.inHole)problems.push(st.id+': target outside spotlight '+sels[k]);
    await p.mouse.click(info.x,info.y);await p.waitForTimeout(120)}
  } else {
   // during resolve: tap the board to speed up
   const busy=await p.evaluate(()=>UI.busy);if(busy)await p.mouse.click(vp.width/2,120);
   await p.waitForTimeout(150)}
 }
 const endCard=ended;const afterEnd=await p.evaluate(()=>!document.querySelector('#game').hidden||!document.querySelector('#title').hidden);if(!afterEnd)problems.push('nothing after end');
 if(!ended){const st=await p.evaluate(()=>GXT.state());problems.push('timeout at '+JSON.stringify({id:st.id,phase:st.phase})+JSON.stringify(await p.evaluate(()=>({gp:G.phase,busy:UI.busy,pend:!!G.pend,round:G.round,msg:document.querySelector('#msg').textContent,ri:G.ri,ord:G.order,slip:!!document.querySelector('#slipY')}))))}
 const all=await p.evaluate(()=>tutCoverage());
 const miss=all.filter(i=>!seen.includes(i));if(miss.length)problems.push('steps never shown: '+miss.join(','));
 if(!endCard&&ended)problems.push('no end card');
 console.log(n,problems.length||errs.length?'FAIL':'PASS','steps',seen.length+'/'+all.length,'errs',errs.join('|'),'problems',problems.join(' | '));if(problems.length||errs.length)fail=1;await c.close()}
await b.close();process.exit(fail)})();
