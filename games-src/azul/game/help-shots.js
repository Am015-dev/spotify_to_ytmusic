// Help kit screenshots at 390x763 (fresh profile): the first-time coach bubble, the lightbulb's ghost finger + why, a rules card, the start menu and the in-game menu.
//   NODE_PATH=/opt/node-tools/node_modules node help-shots.js     -> ../playtest/help-coach-bubble.png, help-bulb.png, help-rules-card.png, start-menu.png, game-menu.png
const PW=require('playwright');const fs=require('fs'),path=require('path');const html=fs.readFileSync(__dirname+'/sunglaze.html');
const OUT=path.join(__dirname,'..','playtest');fs.mkdirSync(OUT,{recursive:true});const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await PW.chromium.launch({args:['--no-sandbox']});
  const ctx=await b.newContext({viewport:{width:390,height:763},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>console.log('PAGE ERROR',e.message));
  await p.goto('https://gns.test/?phone=1');await sleep(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(1200);
  await p.screenshot({path:path.join(OUT,'start-menu.png')});
  await p.evaluate(()=>{localStorage.setItem('sgz_offer','1');bfD=ms=>ms*.2;UI.speed=3;document.querySelector('[data-ui=start]').click()});await sleep(500);
  await p.evaluate(()=>{const o=document.querySelector('[data-ui=story-ok]');if(o)o.click()});
  await p.waitForSelector('.gxh-bub.on[data-phase]',{timeout:8000});await sleep(600);
  await p.screenshot({path:path.join(OUT,'help-coach-bubble.png')});
  await p.click('.gxh-bub .gxh-ok');await sleep(300);
  await p.touchscreen.tap(...await p.evaluate(()=>{const r=document.getElementById('bulbbtn').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}));await sleep(700);
  await p.screenshot({path:path.join(OUT,'help-bulb.png')});
  await p.click('.gxh-bub .gxh-link');await sleep(500);
  await p.screenshot({path:path.join(OUT,'help-rules-card.png')});
  await p.click('.gxh-rules .gxh-x');await sleep(200);
  await p.touchscreen.tap(20,22);await sleep(400);
  await p.screenshot({path:path.join(OUT,'game-menu.png')});
  await b.close();console.log('saved to',OUT)})();
