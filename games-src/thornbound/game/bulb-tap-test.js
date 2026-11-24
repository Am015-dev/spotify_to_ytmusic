// Bulb one-tap test (F15): with a coach bubble open, ONE finger tap on the bulb must show the bulb's tip (not just close the coach bubble).
// A second tap on the bulb while its tip is open closes it.   node bulb-tap-test.js [375x667]   Exit code 1 on failure.
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
  await p.evaluate(()=>{const g=document.getElementById('tbgoal');if(g)g.remove()});await sleep(500);
  const bulbAt=()=>p.evaluate(()=>{const e=document.getElementById('bulbbtn');const q=e.getBoundingClientRect();return [q.left+q.width/2,q.top+q.height/2]});
  const st=()=>p.evaluate(()=>({coach:!!document.querySelector('.gxh-bub.on:not(.gxh-bulbb)'),tip:!!document.querySelector('.gxh-bulbb')}));
  for(let k=0;k<3;k++){
    await p.evaluate(()=>{try{GXH.reset&&GXH.reset()}catch(e){}try{GXH.phase(null);GXH.phase(hlpPhase())}catch(e){}});await sleep(1600);
    const s0=await st();if(!s0.coach){say(false,'run '+k+': no coach bubble opened to test with');continue}
    await p.touchscreen.tap(...await bulbAt());await sleep(400);const s1=await st();
    say(s1.tip&&!s1.coach,'run '+k+': one bulb tap with a coach bubble open shows the tip (tip '+s1.tip+', coach '+s1.coach+')');
    await sleep(600);await p.touchscreen.tap(...await bulbAt());await sleep(400);const s2=await st();
    say(!s2.tip,'run '+k+': a second bulb tap closes the tip ('+s2.tip+')');await sleep(600)}
  // with nothing open, one tap shows the tip
  await p.evaluate(()=>{try{GXH.hide()}catch(e){}});await sleep(600);await p.touchscreen.tap(...await bulbAt());await sleep(400);
  say((await st()).tip,'one bulb tap with nothing open shows the tip');
  say(errs.length===0,'no page errors '+errs.slice(0,2).join('|'));
  await b.close();console.log(bad?'BULB-TAP FAIL '+bad:'BULB-TAP PASS');process.exit(bad?1:0)})();
