const { chromium } = require('playwright');
const F='file://'+__dirname+'/ochre-horizon.html?fast=1&play=1&seed=7';
const S=[[375,553],[375,667],[910,512],[1366,768],[1920,1080]];
(async()=>{const b=await chromium.launch();
for(const [w,h] of S){const mob=w<700;const pg=await b.newPage({viewport:{width:w,height:h},hasTouch:mob,isMobile:mob});
 await pg.goto(F);await pg.waitForTimeout(700);
 await pg.screenshot({path:`../proof/shots-f2/${w}x${h}-1-company.png`});
 await pg.evaluate(()=>{const b=document.querySelector('[data-corp]');b.click()});await pg.waitForTimeout(300);
 await pg.screenshot({path:`../proof/shots-f2/${w}x${h}-2-keep.png`});
 await pg.evaluate(()=>{document.getElementById('mKeep').click()});await pg.waitForTimeout(500);
 // research modal then to action
 for(let i=0;i<6;i++){const r=await pg.evaluate(()=>{const m=document.getElementById('mBuy');if(m){m.click();return 1}return 0});await pg.waitForTimeout(300);if(r)break}
 await pg.waitForTimeout(800);
 await pg.screenshot({path:`../proof/shots-f2/${w}x${h}-3-board.png`});
 // try box
 await pg.evaluate(()=>document.getElementById('hintbtn').click());await pg.waitForTimeout(400);
 await pg.screenshot({path:`../proof/shots-f2/${w}x${h}-4-try.png`});
 // force a placement
 await pg.evaluate(()=>{closeSheet&&0;OH.G.pl[0].mc=60;doMove({t:'std',k:'greenery'})});await pg.waitForTimeout(600);
 await pg.screenshot({path:`../proof/shots-f2/${w}x${h}-5-place.png`});
 await pg.close()}
await b.close()})()
