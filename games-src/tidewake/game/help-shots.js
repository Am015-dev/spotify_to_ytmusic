// Screenshots of the help kit at 390x763: a coach bubble (lay a current), the bulb suggestion (finger + why) and a rules card -> ../playtest/help-*.png
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/tidewake.html');const OUT=__dirname+'/../playtest/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await PW.chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:763},deviceScaleFactor:2,isMobile:true,hasTouch:true});
await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('https://gns.test/?phone=1',{timeout:90000});await sleep(1500);
await p.evaluate(()=>{try{localStorage.clear()}catch(e){}const s=defaultSetup();s.mode='me';s.np=3;s.exp={rift:0,wave:0,maelstrom:0,cannon:0};s.seats.forEach((x,i)=>{x.h=i===0;x.lv='normal'});AIDELAY=0;ANIM=0;UI.anim=false;setSeed(41);setAiSeed(41);startGame(JSON.parse(JSON.stringify(s)))});
const tap=async(sel)=>{const c=await p.evaluate(sel=>{const e=hq(sel)();if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]},sel);if(c)await p.touchscreen.tap(...c);return !!c};
const done={};
for(let i=0;i<300&&Object.keys(done).length<3;i++){await sleep(250);
  const st=await p.evaluate(()=>({ph:hlpPhase(),cur:GXH.state().cur,over:!!G.over}));if(st.over)break;
  if(st.ph==='start'){ // pick the advised mark through the bulb's finger, like a new player
    await p.evaluate(()=>GXH.hide());const pl=await p.evaluate(()=>{const x=hlpPlan();return x&&x.to()});
    if(pl){await p.touchscreen.tap(pl.x,pl.y);await sleep(300);await tap('#ppop [data-a=startmark]')}continue}
  if(st.ph==='lay'&&!done.coach&&st.cur&&st.cur.kind==='coach'){await sleep(350);await p.screenshot({path:OUT+'help-coach-bubble-390x763.png'});done.coach=1;console.log('coach');await p.touchscreen.tap(60,16);await sleep(200);continue}
  if(st.ph==='lay'&&done.coach&&!done.bulb){await p.evaluate(()=>GXH.hide());const bb=await p.evaluate(()=>{const r=document.querySelector('#bulbbtn').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
    await p.touchscreen.tap(...bb);await sleep(600);done.bulb=1;await p.screenshot({path:OUT+'help-bulb-suggestion-390x763.png'});console.log('bulb');
    await p.evaluate(()=>document.querySelector('.gxh-link').click());await sleep(350);
    await p.evaluate(()=>document.querySelector('.gxh-next').click());await sleep(250);
    done.rules=1;await p.screenshot({path:OUT+'help-rules-card-390x763.png'});console.log('rules');break}
  if(st.ph==='lay'){await tap('#ps [data-a=place]:not([disabled])')}
}
await b.close()})();
