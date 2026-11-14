// Double-tap test (R64): a second fast tap on the Goal card's "Got it" (or any overlay's close) must not reach the panel underneath.
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
  say(errs.length===0,'page errors '+errs.length+(errs[0]?' '+errs[0]:''));
  await b.close();console.log(bad?'doubletap-test FAIL '+bad:'doubletap-test PASS ('+W+'x'+H+')');process.exit(bad?1:0)})();
