// Regression: after Learn to play (finished, or left half way through the menu), "Quick game" from the title must start a REAL game
// (no coached game, no "Skip tutorial"). Touch taps on a 390x844 phone.   node learn-play-test.js
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/thornbound.html');
(async()=>{const b=await PW.chromium.launch();let bad=0;
for(const path of ['finished','left']){const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();await p.goto('https://gns.test/?phone=1');await p.waitForTimeout(1000);
  const tap=async sel=>{const e=await p.$(sel);if(!e)return false;await e.scrollIntoViewIfNeeded().catch(()=>{});const r=await e.boundingBox();if(!r)return false;await p.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);await p.waitForTimeout(400);return true};
  await tap('[data-gxt-open]');await tap('#tbgoal button');await p.evaluate(()=>{ANIM=0;AIDELAY=0});
  if(path==='finished'){for(let i=0;i<3000;i++){const o=await p.evaluate(()=>{if(document.getElementById('tbcend'))return 1;if(UI.card){try{evDone()}catch(e){}try{newsOk()}catch(e){}return 0}const s=viewSeatForQ();if(s!=null)humanMove(legal(s)[0].k);else try{pump()}catch(e){}return 0});if(o)break}
    await tap('#tbcend [data-e=menu]')}
  else{for(let i=0;i<12;i++)await p.evaluate(()=>{if(UI.card){try{evDone()}catch(e){}}const s=viewSeatForQ();if(s!=null)humanMove(legal(s)[0].k)});
    await tap('[data-gx=setd]');await p.waitForTimeout(300);await p.evaluate(()=>{[...document.querySelectorAll('[data-a=newgame],[data-a=menu]')].filter(e=>e.offsetWidth).forEach((e,i)=>{if(!i)e.setAttribute('data-lpt','1')})});await tap('[data-lpt]')}
  const covered=await p.evaluate(()=>[...document.querySelectorAll('#start button')].filter(b=>b.offsetWidth).filter(b=>{const r=b.getBoundingClientRect();const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !(e&&e.closest('#start'))}).map(b=>b.innerText.split(String.fromCharCode(10))[0]));
  const okPlay=await tap('#start [data-a=play]'),okStart=await tap('#start [data-a=start]');await p.waitForTimeout(600);
  const st=await p.evaluate(()=>({started:UI.started,tut:!!(UI.cfg&&UI.cfg.tutorial),skip:!!document.querySelector('#tbturn:not([hidden]) [data-gxt-skip]'),start:!document.getElementById('start').hidden}));
  const pass=!covered.length&&okPlay&&okStart&&st.started&&!st.tut&&!st.skip&&!st.start;if(!pass)bad++;
  console.log((pass?'PASS':'FAIL')+' Learn '+path+' -> Quick game -> Start: '+JSON.stringify(Object.assign(st,{okPlay,okStart,covered})));await ctx.close()}
await b.close();process.exit(bad?1:0)})();
