// Screenshots of the help kit at 390x763: a coach bubble (roll), the bulb suggestion (a die to keep) and a rules card -> playtest/help-*.png
const PW=require('/opt/node22/lib/node_modules/playwright'),path=require('path');const OUT=path.join(__dirname,'playtest')+'/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:763},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+path.join(__dirname,'kot2.html')+'?phone=1');await p.waitForSelector('[data-start]');await sleep(1500);
await p.evaluate(()=>{AIDELAY=120;localStorage.clear();setSeed(531)});await p.tap('[data-start]');await sleep(1800);
const done={};
for(let i=0;i<400&&Object.keys(done).length<3;i++){await sleep(200);
 const st=await p.evaluate(()=>({ph:hlpPhase(),cur:GXH.state().cur,busy:hlpBusy(),sug:!!hlpSuggest()}));
 if(st.ph==='intro'){await p.tap('#choice [data-a="story"]');continue}
 if(st.ph==='roll'&&!done.coach&&st.cur&&st.cur.kind==='coach'){await sleep(350);await p.screenshot({path:OUT+'help-coach-bubble-390x763.png'});done.coach=1;console.log('coach');await p.evaluate(()=>GXH.hide());continue}
 if(st.ph==='roll'&&done.coach&&!done.bulb&&!st.busy&&st.sug){await p.evaluate(()=>GXH.hide());const bb=await p.evaluate(()=>{const r=document.querySelector('#bulbbtn').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
  await p.touchscreen.tap(...bb);await sleep(500);await p.screenshot({path:OUT+'help-bulb-suggestion-390x763.png'});done.bulb=1;console.log('bulb');
  await p.evaluate(()=>document.querySelector('.gxh-link').click());await sleep(300);await p.evaluate(()=>document.querySelector('.gxh-next').click());await sleep(250);
  await p.screenshot({path:OUT+'help-rules-card-390x763.png'});done.rules=1;console.log('rules');continue}
 if(st.ph==='watch'||st.ph==='buy'||st.ph==='done'||st.ph==='reroll'){await p.evaluate(()=>{GXH.hide();if(humanTurn()&&G.phase==='roll')uiAct({act:'resolve'});else if(humanTurn()&&G.phase==='buy')uiAct({act:'end'})})}}
await b.close()})();
