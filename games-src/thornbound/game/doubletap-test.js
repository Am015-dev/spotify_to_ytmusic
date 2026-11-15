// Double-tap test (R64, R71): a second fast tap on the Goal card's "Got it", the coach bubble's "Got it" or the bulb bubble must not reach what is underneath; legit taps 550 ms apart are never eaten.
// A probe button is put exactly under "Got it"; double-taps by touch and by mouse must leave it untouched, a tap 450 ms later must reach it.
// node doubletap-test.js [size=375x667]
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/thornbound.html');
const [W,H]=(process.argv[2]||'375x667').split('x').map(Number);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await PW.chromium.launch();let bad=0;const say=(ok,t)=>{if(!ok)bad++;console.log((ok?'ok   ':'FAIL ')+t)};
  const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('https://gns.test/?phone=1');await sleep(800);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(900);
  await p.evaluate(()=>{showStart();document.querySelector('#start [data-a=play]').click()});await sleep(400);
  await p.evaluate(()=>document.querySelector('#start [data-a=start]').click());await sleep(1500);
  const open=async()=>{await p.evaluate(()=>{const g=document.getElementById('tbgoal');if(g)g.remove()});await sleep(450);
    return p.evaluate(()=>{tbShowGoal(false,true);const bt=document.querySelector('#tbgoal button'),q=bt.getBoundingClientRect();
      let pr=document.getElementById('dtprobe');if(!pr){pr=document.createElement('button');pr.id='dtprobe';document.body.appendChild(pr);pr.addEventListener('click',()=>window.__probe++)}
      window.__probe=0;Object.assign(pr.style,{position:'fixed',left:q.left+'px',top:q.top+'px',width:q.width+'px',height:q.height+'px',zIndex:1,opacity:.01});
      window.__log=(G.log||[]).length;return [q.left+q.width/2,q.top+q.height/2]})};
  const state=()=>p.evaluate(()=>({goal:!!document.getElementById('tbgoal'),probe:window.__probe,log:(G.log||[]).length-window.__log}));
  // 1. touch double-tap, 120 ms apart
  let at=await open();await p.touchscreen.tap(...at);await sleep(120);await p.touchscreen.tap(...at);await sleep(150);let s=await state();
  say(!s.goal&&s.probe===0,'touch double-tap on "Got it": goal closed '+!s.goal+', taps reaching the panel below '+s.probe);
  // 2. a later tap still works
  await sleep(450);await p.touchscreen.tap(...at);await sleep(150);s=await state();say(s.probe===1,'a tap 450 ms later reaches the panel ('+s.probe+')');
  // 3. mouse double-click
  at=await open();await p.mouse.click(at[0],at[1],{clickCount:1});await sleep(90);await p.mouse.click(at[0],at[1]);await sleep(150);s=await state();
  say(!s.goal&&s.probe===0,'mouse double-click on "Got it": taps reaching the panel below '+s.probe);
  // 4. the real panel: a decision button under "Got it" is not chosen by the second tap
  at=await open();const under=await p.evaluate(([x,y])=>{const pr=document.getElementById('dtprobe');pr.style.display='none';const g=document.getElementById('tbgoal');g.style.visibility='hidden';const e=document.elementFromPoint(x,y);g.style.visibility='';return e?(e.id||e.className||e.tagName)+'':'none'},at);
  await p.touchscreen.tap(...at);await sleep(100);await p.touchscreen.tap(...at);await sleep(200);s=await state();
  say(s.log===0,'second tap on whatever sits under "Got it" ('+String(under).slice(0,40)+') changed the game log by '+s.log);
  // 5. map Location tap areas are at least 44x44 px and really answer at their edges
  {const r=await p.evaluate(()=>{const g0=document.getElementById('tbgoal');if(g0)g0.remove();return [...document.querySelectorAll('.tb-loc:not(.tb-throne)')].map(g=>{const R=g.querySelector('.tb-hit').getBoundingClientRect();
    const on=(x,y)=>{const e=document.elementFromPoint(x,y);return !!(e&&e.closest('.tb-loc')===g)};return {id:g.dataset.id,w:Math.round(R.width),h:Math.round(R.height),edges:[on(R.left+R.width/2,R.top+R.height/2-20),on(R.left+R.width/2,R.top+R.height/2+20),on(R.left+R.width/2-20,R.top+R.height/2),on(R.left+R.width/2+20,R.top+R.height/2)].every(Boolean)}})});
    const small=r.filter(x=>x.w<44||x.h<44||!x.edges);say(r.length>=6&&!small.length,'map Locations >= 44x44 px: '+r.map(x=>x.id+' '+x.w+'x'+x.h+(x.edges?'':' (covered)')).join(', '))}
  // 6. hint bubbles (R71): a double-tap on the coach bubble's "Got it" and on the bulb bubble must not reach the Goal button (or anything) below
  {const reset=async()=>{await p.evaluate(()=>{const g=document.getElementById('tbgoal');if(g)g.remove();try{GXH.hide()}catch(e){}});await sleep(400)};
    const bubAt=sel=>p.evaluate(sel=>{const e=[...document.querySelectorAll(sel)].find(x=>x.offsetWidth&&x.getBoundingClientRect().height);if(!e)return null;const q=e.getBoundingClientRect();return [q.left+q.width/2,q.top+q.height/2]},sel);
    const goalOpen=()=>p.evaluate(()=>!!document.getElementById('tbgoal'));
    const dtap=async(at,gap)=>{const e0=await p.evaluate(()=>TBTAPGUARD.eaten);await p.evaluate(()=>{window.__clk=0;window.__cl=e=>{if(!(e.target.closest&&e.target.closest('.gxh-bub')))window.__clk++};document.body.addEventListener('click',window.__cl,false)});
      const open0=await p.evaluate(()=>!!document.querySelector('.gxh-bub.on'));await p.touchscreen.tap(...at);await sleep(gap);await p.evaluate(()=>{window.__clk=0});await p.touchscreen.tap(...at);await sleep(250);
      const r=await p.evaluate(()=>{document.body.removeEventListener('click',window.__cl,false);return {clk:window.__clk,bub:!!document.querySelector('.gxh-bub.on')}});r.open0=open0;r.goal=await goalOpen();r.eaten=(await p.evaluate(()=>TBTAPGUARD.eaten))-e0;return r};
    let coach=0,bulb=0;
    for(const gap of [110,180,250]){await reset();
      // coach bubble: force the free-play coach to show its bubble for the current phase
      await p.evaluate(()=>{try{GXH.reset&&GXH.reset()}catch(e){}try{GXH.phase(null);GXH.phase(hlpPhase())}catch(e){}});await sleep(1600);
      let at=await bubAt('.gxh-bub.on:not(.gxh-bulbb) .gxh-ok');
      if(at&&await p.evaluate(()=>!!document.querySelector('.gxh-bub.on'))){coach++;const r=await dtap(at,gap);if(r.open0)say(!r.goal&&r.clk===0,'coach bubble "Got it" double-tap '+gap+' ms: Goal card open '+r.goal+', clicks reaching the board '+r.clk+', guard ate '+r.eaten)}
      await reset();
      // bulb bubble
      const bb=await bubAt('#bulbbtn');if(bb){await p.touchscreen.tap(...bb);await sleep(700);at=await bubAt('.gxh-bulbb .gxh-ok')||await bubAt('.gxh-bulbb .gxh-tx')||await bubAt('.gxh-bulbb');
        if(at&&await p.evaluate(()=>!!document.querySelector('.gxh-bub.on'))){bulb++;const r=await dtap(at,gap);if(r.open0)say(!r.goal&&r.clk===0,'bulb bubble double-tap '+gap+' ms: Goal card open '+r.goal+', clicks reaching the board '+r.clk+', guard ate '+r.eaten)}}}
    say(coach>=2,'coach bubble double-tap cases run: '+coach);say(bulb>=2,'bulb bubble double-tap cases run: '+bulb);
    // legit taps: single taps 500+ ms apart on the Goal button are never eaten
    await reset();const e0=await p.evaluate(()=>TBTAPGUARD.eaten);let opened=0;
    for(let i=0;i<4;i++){const g=await bubAt('#tbturn .tbt-goal');if(!g)break;await p.touchscreen.tap(...g);await sleep(550);if(await goalOpen())opened++;const ok=await bubAt('#tbgoal button');if(ok){await p.touchscreen.tap(...ok);await sleep(600)}}
    const eat=(await p.evaluate(()=>TBTAPGUARD.eaten))-e0;say(eat===0&&opened>=1,'legit taps (550 ms apart): Goal card opened '+opened+' times, legit taps eaten '+eat)}
  say(errs.length===0,'page errors '+errs.length+(errs[0]?' '+errs[0]:''));
  await b.close();console.log(bad?'doubletap-test FAIL '+bad:'doubletap-test PASS ('+W+'x'+H+')');process.exit(bad?1:0)})();
