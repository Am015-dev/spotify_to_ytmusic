// first-time-player walkthrough: a full 2-player game vs the normal computer with the guide on, screenshots at each new kind of moment
const {chromium}=require(process.env.PW);const [W,H]=(process.argv[2]||'1366x768').split('x').map(Number);const EX=JSON.parse(process.argv[3]||'{}');const TAG=process.argv[4]||'r';
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:W,height:H}});p.setDefaultTimeout(150000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message));let n=0;const shot=async(nm)=>{await p.waitForTimeout(1200);await p.screenshot({path:`shots/${TAG}_${String(n++).padStart(2,'0')}_${nm}.png`})};
 await p.goto('file://'+__dirname+'/sunglaze.html');await p.waitForTimeout(800);await p.evaluate(ex=>{try{localStorage.clear()}catch(e){}setSeed(21);AIDELAY=150;UI.coach=true;Object.assign(UI.setup.ex,ex)},EX);
 await shot('start');await p.click('[data-ui=start]');await shot('story');await p.click('[data-ui=story-ok]');
 let turn=0,seenWall=0,lastRound=1;const dockText=async()=>p.evaluate(()=>document.querySelector('#dockbody').innerText.replace(/\s+/g,' ').slice(0,400));
 for(let k=0;k<3000;k++){const s=await p.evaluate(()=>({hp:!!me(),over:!!G.over,phase:G.phase,round:G.round}));if(s.over)break;
   if(s.round!==lastRound){lastRound=s.round;if(s.round<=3){await p.waitForTimeout(1500);await shot('round'+s.round)}}
   if(!s.hp){await p.waitForTimeout(250);continue}
   if(s.phase==='wall'){await shot('wallchoice');const bs=await p.$$('#dockbody button[data-mv]');await bs[0].click();continue}
   turn++;const log=turn<=2||turn%9===0;
   if(log)await shot('t'+turn+'_step1');
   if(turn%4===2){await p.click('#dockbody [data-ui=advise]');if(log)await shot('t'+turn+'_advice');await p.click('#dockbody .adv [data-mv]');await p.waitForTimeout(300);continue}
   const picks=await p.$$('#dockbody [data-pick]');await picks[Math.floor(Math.random()*picks.length)].click();await p.waitForTimeout(250);if(log)await shot('t'+turn+'_step2');
   const tg=await p.evaluate(()=>UI.tgt);if(tg==null){const ls=await p.$$('#dockbody [data-line]');await ls[Math.floor(Math.random()*Math.min(ls.length,5))].click();await p.waitForTimeout(250)}
   if(log)await shot('t'+turn+'_step3');await p.click('#dockbody .btn.go[data-mv]');await p.waitForTimeout(300)}
 await shot('end');await p.click('.gx-bar [data-gx=plrd]');await shot('end_boards');console.log('turns',turn,'errors',errs.slice(0,3),await p.evaluate(()=>G.winText));await b.close()})()
