// Brief shots: title, learn-to-play first screen, goal card, first turn, mid-game, rival turn, result. Usage: node feel-shots.js 390x844 [outdir]
const PW=require('playwright');const fs=require('fs');
const html=fs.readFileSync(__dirname+'/thornbound.html');const [W,H]=(process.argv[2]||'390x844').split('x').map(Number);
const out=process.argv[3]||(__dirname+'/../playable-shots/feel');const ph=W<700;fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await PW.chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:ph,hasTouch:ph,deviceScaleFactor:1});
await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));
const shot=async n=>{await p.waitForTimeout(500);await p.screenshot({path:`${out}/${n}-${W}.png`});console.log('shot',n)};
await p.goto('https://gns.test/'+(ph?'?phone=1':''));await p.waitForTimeout(1500);
await shot('1-title');
// Learn to play first screen
const learn=await p.evaluate(()=>{const b=[...document.querySelectorAll('#start button')].find(x=>/learn/i.test(x.textContent));if(b){b.click();return 1}return 0});
await p.waitForTimeout(1200);await shot('2-learn');
await p.waitForTimeout(400);
const tap=async sel=>{const e=await p.$(sel);if(!e)return console.log('missing',sel);const r=await e.boundingBox();if(ph)await p.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);else await p.mouse.click(r.x+r.width/2,r.y+r.height/2)};
await tap('#tbgoal button');await p.waitForTimeout(1500);await shot('2b-learn-coach');
// quick game: the Goal card opens at the start
await p.evaluate(()=>{AIDELAY=1000;ANIM=1;try{tutLeave()}catch(e){}newGame("me",{np:3,seed:5})});await p.waitForTimeout(1000);
await shot('3-goal');await tap('#tbgoal button');await p.waitForTimeout(800);
await shot('4-first-turn');
await p.evaluate(()=>{AIDELAY=0;ANIM=0});

let mid=0,rival=0;
for(let i=0;i<3000;i++){if(rival===1&&await p.evaluate(()=>UI._tbHold>Date.now()&&viewSeatForQ()==null)){rival=2;await p.waitForTimeout(700);await shot('6-rival');await p.evaluate(()=>{AIDELAY=0;ANIM=0;UI._tbHold=0;try{pump()}catch(e){}})}
 const st=await p.evaluate(()=>({card:UI.card&&UI.card.kind,over:!!G.over,s:viewSeatForQ(),r:G.round}));
 if(st.over)break;
 if(st.card){await p.evaluate(()=>{const b=document.querySelector('#pc [data-a=evok],#pc [data-a=tipok],#pc [data-a=take]');b&&b.click()})}
 else if(st.s!=null){if(!mid&&st.r>=3){mid=1;await shot('5-mid')}
   if(!rival&&st.r>=2){rival=1;await p.evaluate(()=>{AIDELAY=1000;ANIM=1})}await p.evaluate(()=>{const r=suggest(viewSeatForQ());const mv=legal(viewSeatForQ());const m=(r&&mv.find(x=>x.k===r.k))||mv[0];humanMove(m.k)})}
 else if(!rival&&st.r>=2&&st.s==null){}
 await p.waitForTimeout(rival===1?300:30)}
await p.waitForTimeout(1500);await shot('7-result');
console.log(errs.slice(0,10).join('\n')||'no errors');await b.close()})();
