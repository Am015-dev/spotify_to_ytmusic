// screenshots of a guided game on a phone, for eyeballing: setup, my turn, a roll card mid-replay, a later turn with the feed, the end
const {chromium}=require('playwright');const out=process.argv[3]||'shots';require('fs').mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const [W,H]=(process.argv[4]||'390x763').split('x').map(Number);
 const p=await (await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true})).newPage();p.on('pageerror',e=>console.log('PAGE ERROR',e.message));
 await p.goto(process.argv[2]||'http://127.0.0.1:8812/tidewake.html');await p.waitForTimeout(1500);await p.screenshot({path:out+'/0-title.png'});
 await p.evaluate(()=>{localStorage.clear();setSeed(104);setAiSeed(104);AIDELAY=300;startGuided()});await p.waitForTimeout(1500);await p.screenshot({path:out+'/1-setup.png'});
 let n=2,mph=0;for(let i=0;i<500;i++){const st=await p.evaluate(()=>{if(!G||G.over)return UI.busy?'busy':'over';if(UI.busy)return (UI.mph&&!UI.mph.roll?'mph':'busy');const d=sideToAct();
   if(d>=0&&G.seats[d].human){if(document.querySelector('#pc:not([hidden]) [data-a=coachok],#pc:not([hidden]) [data-ph=dismiss]'))return 'card';return 'mine'}return 'wait'});
  if(st==='over'){await p.waitForTimeout(1200);await p.screenshot({path:out+`/${n++}-over.png`});const c=await p.$('#pc:not([hidden]) [data-a=sunkok]');if(c){await c.click();await p.waitForTimeout(600);await p.screenshot({path:out+`/${n++}-over2.png`})}break}
  if(st==='mph'&&mph<3){mph++;await p.screenshot({path:out+`/${n++}-roll.png`})}
  if(st==='card'){await p.screenshot({path:out+`/${n++}-card.png`});await p.click('#pc:not([hidden]) [data-a=coachok],#pc:not([hidden]) [data-ph=dismiss]');continue}
  if(st==='mine'){await p.screenshot({path:out+`/${n++}-mine.png`});await p.evaluate(()=>{const s=aiStep(true);act(s.m,s.seat)})}
  await p.waitForTimeout(st==='busy'||st==='mph'?400:200)}
 await b.close()})();
