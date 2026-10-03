// board-first checks for Shipwreck Isle at 4 sizes: no page scroll, board uncovered, popups open/close, dock shows decisions
const {chromium}=require(process.env.PW);(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
for(const [w,h] of [[1366,768],[1920,1080],[768,1024],[390,844]].filter(s=>!process.env.SIZES||process.env.SIZES.split(',').includes(s.join('x')))){const t=w+'x'+h;const p=await b.newPage({viewport:{width:w,height:h}});p.setDefaultTimeout(150000);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/CERT/.test(m.text())&&errs.push(m.text()));
  await p.goto('file://'+process.cwd()+'/shipwreck.html');await p.waitForTimeout(700);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(5)});
  const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth}));const ok=r.h<=r.vh+1&&r.w<=r.vw+1;if(!ok){bad++;console.log(t,tag,'SCROLL',JSON.stringify(r))}return ok};
  const cover=async tag=>{const r=await p.evaluate(()=>{const cv=document.querySelector('#c3');const R=cv.getBoundingClientRect();let hit=0,tot=0,what={};for(let i=1;i<=5;i++)for(let j=1;j<=5;j++){const x=R.left+R.width*i/6,y=R.top+R.height*j/6;const e=document.elementFromPoint(x,y);tot++;if(e===cv||e&&e.closest('.tl,#labels,#chip'))hit++;else{const k=e?(e.id||e.className||e.tagName):'none';what[k]=(what[k]||0)+1}}
      return {hit,tot,what,inside:R.top>=0&&R.left>=0&&R.bottom<=innerHeight+1&&R.right<=innerWidth+1,area:Math.round(R.width*R.height/(innerWidth*innerHeight)*100)}});
    if(r.hit<r.tot||!r.inside){bad++;console.log(t,tag,'COVERED',JSON.stringify(r))}return r};
  const T0=Date.now();const mark=x=>process.env.DBG&&console.log(t,x,Date.now()-T0);
  await scroll('start');await p.screenshot({path:`L_${t}_0start.png`});
  await p.click('[data-a=start]');await p.waitForTimeout(1500);await scroll('intro');await p.screenshot({path:`L_${t}_1intro.png`});const c1=await cover('intro');
  for(let k=0;k<10;k++){if(!await p.$('#story:not([hidden]) [data-a=next]'))break;await p.click('#story [data-a=next]');await p.waitForTimeout(200)}
  await p.waitForTimeout(900);await scroll('plan');const c2=await cover('plan');await p.screenshot({path:`L_${t}_2plan.png`});
  for(const id of ['campd','logd','cardsd','rulesd']){await p.click(`[data-gx="${id}"]`);await p.waitForTimeout(350);const on=await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id);if(id==='cardsd')await p.screenshot({path:`L_${t}_3cards.png`});if(id==='campd')await p.screenshot({path:`L_${t}_3camp.png`});await scroll('popup '+id);
    if(id==='logd'){await p.keyboard.press('Escape')}else await p.click(`#${id} .gx-x`);await p.waitForTimeout(300);const off=await p.evaluate(i=>!document.getElementById(i).classList.contains('on'),id);if(!on||!off){bad++;console.log(t,'popup',id,on,off)}}
  // collapse and restore the dock
  await p.evaluate(()=>GX.toggleDock(false));await p.waitForTimeout(500);const c3=await cover('dockmin');await p.screenshot({path:`L_${t}_4min.png`});await p.evaluate(()=>GX.toggleDock(true));await p.waitForTimeout(300);
  // the day roadmap is on screen, marks the current step and explains a step when tapped
  const rmChk=async tag=>{const r=await p.evaluate(()=>{const el=document.querySelector('#roadmap');const n=document.querySelectorAll('#roadmap .rm-p.now').length;if(!el||el.hidden)return {ok:false,why:'hidden'};const R=el.getBoundingClientRect();return {ok:n===1&&R.top>=0&&R.bottom<=innerHeight&&R.width>100,n,top:R.top,bottom:R.bottom}});if(!r.ok){bad++;console.log(t,tag,'ROADMAP',JSON.stringify(r))}};
  mark('plan');await rmChk('plan');await p.click('#roadmap [data-phx=weather]');await p.waitForTimeout(200);const tipOn=await p.evaluate(()=>!!document.querySelector('#roadmap .rm-tip'));await p.click('#roadmap .rm-tip [data-phx]');await p.waitForTimeout(200);const tipOff=await p.evaluate(()=>!document.querySelector('#roadmap .rm-tip'));if(!tipOn||!tipOff){bad++;console.log(t,'roadmap tip',tipOn,tipOff)}
  // the plan steps: Suggest, then Next until Start the day
  await p.click('#step [data-a=suggest]');await p.waitForTimeout(200);for(let k=0;k<4&&!await p.$('#step [data-a=go]');k++){await scroll('plan step');await p.click('#step [data-a=pnext]');await p.waitForTimeout(200)}await p.click('#step [data-a=go]');await p.waitForTimeout(1200);await scroll('story');await cover('story');await rmChk('story');await p.screenshot({path:`L_${t}_5story.png`});
  mark('story');
  // play to the first decision or the next plan
  for(let k=0;k<40;k++){const s=await p.evaluate(()=>({q:humanQ()&&storyIdx()===UI.beats.length-1,st:storyActive(),dock:getComputedStyle(document.querySelector('.gx-dock')).visibility}));if(s.q){await scroll('question');await p.screenshot({path:`L_${t}_6q.png`});if(s.dock!=='visible'){bad++;console.log(t,'dock hidden on question')}await p.click('#story [data-ans="0"]');await p.waitForTimeout(250);continue}if(!s.st)break;await p.click('#story [data-a=next]');await p.waitForTimeout(150)}
  await p.waitForTimeout(600);await scroll('day2');
  console.log(t,'board',c2.area+'% of screen','errors',errs.slice(0,3));if(errs.length)bad++;await p.close()}
console.log('PROBLEMS',bad);await b.close()})()
