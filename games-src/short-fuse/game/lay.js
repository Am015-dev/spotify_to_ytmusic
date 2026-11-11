// Board-first layout check with real WebGL (SwiftShader) at 4 sizes: no page scroll, board uncovered (5x5 elementFromPoint grid),
// every popup opens and closes (x and Esc), the dock is visible on decisions, no console errors. Screenshots in shots/.
// PW=$(npm root -g)/playwright node lay.js [WxH,...]
const PW=require((process.env.PW||require('child_process').execSync('npm root -g').toString().trim()+'/playwright'));
const fs=require('fs'),path=require('path');const HERE=__dirname,OUT=path.join(HERE,'shots');fs.mkdirSync(OUT,{recursive:true});
const html=fs.readFileSync(path.join(HERE,'shortfuse.html'));const FC=path.join(HERE,'..','kit','fontcache');const fcss=fs.readFileSync(path.join(FC,'fonts.css'));
const SIZES=(process.argv[2]||'1366x768,1920x1080,768x1024,390x844').split(',').map(s=>s.split('x').map(Number));
const DRAWERS=['missiond','geard','knowd','logd','rulesd','refd','setd','credd'];
async function route(ctx){await ctx.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.host==='gns.test')return r.fulfill({status:200,contentType:'text/html',body:html});
  if(u.host==='fonts.googleapis.com')return r.fulfill({status:200,contentType:'text/css',body:fcss});
  if(u.host==='fonts.gstatic.com'){const f=path.join(FC,path.basename(u.pathname));if(fs.existsSync(f))return r.fulfill({status:200,contentType:'font/woff2',body:fs.readFileSync(f)})}
  return r.abort()})}
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;const report=[];
for(const [W,H] of SIZES){const t=W+'x'+H;const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});await route(ctx);const p=await ctx.newPage();p.setDefaultTimeout(150000);
  const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load resource/.test(m.text()))errs.push(m.text())});
  const log=(...a)=>console.log(t,...a);const T0=Date.now();
  await p.goto('https://gns.test/');await p.waitForTimeout(1200);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(5);setAiSeed(5);AIDELAY=60});
  const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth,bh:document.body.scrollHeight}));const ok=r.h<=r.vh+1&&r.w<=r.vw+1;if(!ok){bad++;log(tag,'SCROLL',JSON.stringify(r))}return ok};
  const cover=async tag=>{const r=await p.evaluate(()=>{const cv=document.querySelector('#c3:not([hidden])')||document.querySelector('#fb');const R=cv.getBoundingClientRect();let hit=0,tot=0,what={};
      for(let i=1;i<=5;i++)for(let j=1;j<=5;j++){const x=R.left+R.width*i/6,y=R.top+R.height*j/6;const e=document.elementFromPoint(x,y);tot++;if(e===cv||e&&(cv.contains(e)||e.closest('#chip,.sfk-ov')))hit++;else{const k=e?(e.id||String(e.className)||e.tagName):'none';what[k]=(what[k]||0)+1}}
      return {hit,tot,what,inside:R.top>=0&&R.left>=0&&R.bottom<=innerHeight+1&&R.right<=innerWidth+1,area:Math.round(R.width*R.height/(innerWidth*innerHeight)*100),w:Math.round(R.width),h:Math.round(R.height)}});
    if(r.hit<r.tot||!r.inside){bad++;log(tag,'COVERED',JSON.stringify(r))}return r};
  const dockOn=async tag=>{const r=await p.evaluate(()=>{const d=document.querySelector('.gx-dock');const R=d.getBoundingClientRect();const m=document.querySelector('#main');const M=m.getBoundingClientRect();return {vis:getComputedStyle(d).visibility,in:R.top<innerHeight-30&&R.bottom>30&&R.left<innerWidth-30&&R.width>100,main:M.height>20}});if(r.vis!=='visible'||!r.in){bad++;log(tag,'DOCK HIDDEN',JSON.stringify(r))}};
  const shot=async n=>{await p.screenshot({path:path.join(OUT,`L_${t}_${n}.png`)});const lost=await p.evaluate(()=>window.SF_LOST||0);if(lost&&!shot.lost){shot.lost=lost;log('WebGL context lost before',n,'(the page switched to the 2D board)')}};
  // 1. start screen
  await scroll('start');await shot('0start');
  // start screen panes scroll inside themselves only
  await p.click('[data-a=job][data-n="9"]');await p.waitForTimeout(200);await p.click('[data-a=np][data-v="3"]');await p.click('[data-a=preset][data-v=solo]');await p.waitForTimeout(150);await shot('0start_job9');
  await p.click('[data-a=start]');await p.evaluate(()=>{const b=document.querySelector('[data-a=briefok]');if(b)b.click()});await p.waitForTimeout(2500);await scroll('setup q');const c1=await cover('setup q');await dockOn('setup q');await shot('1q');
  // 2. answer the opening token by button
  for(let k=0;k<6;k++){const q=await p.$('#main [data-a=q]');if(!q)break;await q.click();await p.waitForTimeout(500)}
  // wait for the human turn
  for(let k=0;k<60;k++){const s=await p.evaluate(()=>!!(UI.V&&UI.V.legal&&decider()===UI.V.seat)||!!G.over);if(s)break;await p.waitForTimeout(400)}
  await p.waitForTimeout(800);await scroll('turn');await cover('turn');await dockOn('turn');await shot('2turn');
  // 3. build a dual cut: the suggestion, then a value, then snip
  const sg=await p.$('[data-a=sugg]');if(sg){await sg.click();await p.waitForTimeout(600)}else{await p.evaluate(()=>{const m=UI.V.legal.plain[0];onTile(m.st,m.ks[0])});await p.waitForTimeout(300);const v=await p.$('#main .vb');if(v)await v.click()}
  await p.waitForTimeout(500);await scroll('dual ready');await cover('dual ready');await shot('3dual');
  const go=await p.$('#main [data-a=dual]:not([disabled])');if(go){await go.click();await p.waitForTimeout(450);await shot('4result');await p.waitForTimeout(1500)}
  // 4. every popup opens and closes (x and Esc)
  for(const id of DRAWERS){const btn=await p.$(`.gx-bar .gx-ibtn[data-gx="${id}"]`);if(btn){await btn.click()}else{await p.evaluate(i=>GX.show(i),id)}await p.waitForTimeout(900);
    const on=await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id);await scroll('popup '+id);if(['missiond','geard','knowd','refd','setd'].includes(id))await shot('5pop_'+id);
    if(id==='logd'||id==='refd')await p.keyboard.press('Escape');else await p.click(`#${id} .gx-x`);await p.waitForTimeout(380);
    const off=await p.evaluate(i=>!document.getElementById(i).classList.contains('on'),id);if(!on||!off){bad++;log('popup',id,'open',on,'closed',off)}}
  // 5. collapse the dock, then bring it back
  await p.evaluate(()=>GX.toggleDock(false));await p.waitForTimeout(600);await cover('dock min');await shot('6dockmin');await p.evaluate(()=>GX.toggleDock(true));await p.waitForTimeout(400);
  // 6. play on: turns through the real buttons (the suggestion + snip), checking the dock at each decision
  let turns=0;for(let k=0;k<40&&turns<3;k++){const st=await p.evaluate(()=>({over:!!G.over,me:!!(UI.V&&UI.V.seat>=0&&decider()===UI.V.seat),legal:!!(UI.V&&UI.V.legal),q:!!(UI.V&&UI.V.q&&UI.V.q.opts)}));if(st.over)break;
    if(st.me){await dockOn('decision '+k);if(st.q){const q=await p.$('#main [data-a=q]');if(q)await q.click()}else if(st.legal){const s2=await p.$('[data-a=sugg]');if(s2){await s2.click();await p.waitForTimeout(300)}const g2=await p.$('#main [data-a=dual]:not([disabled])');if(g2){await g2.click();turns++}else{const so=await p.$('#main [data-a=solo]');if(so){await so.click();turns++}else{const any=await p.$('#main [data-a=grp],#main [data-a=off]');if(any)await any.click()}}}await p.waitForTimeout(700)}
    else await p.waitForTimeout(500)}
  await scroll('later');await cover('later');await shot('7later');
  // 7. a hot-seat pass screen
  await p.evaluate(()=>{showStart();UI.setup.job=4;UI.setup.np=2;UI.setup.seats=['human','human'];renderStart()});await p.waitForTimeout(300);await p.click('[data-a=start]');await p.evaluate(()=>{const b=document.querySelector('[data-a=briefok]');if(b)b.click()});await p.waitForTimeout(1800);
  await scroll('pass');await cover('pass');await dockOn('pass');await shot('8pass');
  await p.click('#main [data-a=take]');await p.waitForTimeout(1200);await shot('8pass_taken');
  // 8. a timed job (countdown in the dock), paused and resumed
  await p.evaluate(()=>{showStart();UI.setup.job=19;UI.setup.np=3;UI.setup.seats=['human','ai','ai'];renderStart()});await p.waitForTimeout(300);await p.click('[data-a=start]');await p.evaluate(()=>{const b=document.querySelector('[data-a=briefok]');if(b)b.click()});await p.waitForTimeout(1500);
  for(let k=0;k<6;k++){const q=await p.$('#main [data-a=q]');if(!q)break;await q.click();await p.waitForTimeout(500)}
  await p.waitForTimeout(3500);const tp=await p.evaluate(()=>{const e=document.getElementById('timerpill');return e?e.textContent:null});if(!tp){bad++;log('NO TIMER in a timed job')}
  await p.click('#pausebtn');await p.waitForTimeout(300);const c0=await p.evaluate(()=>G.clock);await p.waitForTimeout(2200);const c1b=await p.evaluate(()=>G.clock);if(c1b!==c0){bad++;log('PAUSE did not stop the clock',c0,c1b)}
  await shot('9timed_paused');await p.click('#pausebtn');await p.waitForTimeout(2500);const c2=await p.evaluate(()=>G.clock);if(!(c2>c1b)){bad++;log('RESUME did not restart the clock',c1b,c2)}
  // 9. game over card (finish the job quickly with the computer playing every seat)
  await p.evaluate(()=>{AIDELAY=0;ANIM=0;let n=0;while(!G.over&&n++<4000){const s=sideToAct();if(s<0){const st=aiStep();if(!st){tick(5);continue}performMove(st.m,st.seat);continue}performMove(aiMove(s),s)}ANIM=1;refresh()});await p.waitForTimeout(1500);
  await scroll('over');await cover('over');await shot('10over');
  const r={size:t,board:c1.area+'%',boardPx:c1.w+'x'+c1.h,errors:errs.slice(0,4),secs:Math.round((Date.now()-T0)/1000),timer:tp,stats:await p.evaluate(()=>SFKit.stats())};report.push(r);
  log('board',c1.area+'% of screen',c1.w+'x'+c1.h,'timer',tp,'errors',JSON.stringify(errs.slice(0,4)),'quality',r.stats.quality,'secs',r.secs);if(errs.length)bad+=errs.length;await ctx.close()}
fs.writeFileSync(path.join(HERE,'out','lay.json'),JSON.stringify(report,null,1));console.log('PROBLEMS',bad);await b.close()})().catch(e=>{console.error('FATAL',e);process.exit(1)});
