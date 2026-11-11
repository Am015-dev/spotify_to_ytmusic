// PerfHUD check (SP/BRIEF-perf-audio.md part 1): ?fps=1 and F9 overlay, Settings > Show speed / Test speed, Apply saves the level,
// Auto steps down on SwiftShader, the idle saver drops to ~10 fps and wakes on input, no console errors.  node perf.js [WxH]
const PW=require((process.env.PW||require('child_process').execSync('npm root -g').toString().trim()+'/playwright'));
const fs=require('fs'),path=require('path');const HERE=__dirname,OUT=path.join(HERE,'shots');fs.mkdirSync(OUT,{recursive:true});
const html=fs.readFileSync(path.join(HERE,'shortfuse.html'));const FC=path.join(HERE,'..','kit','fontcache');const fcss=fs.readFileSync(path.join(FC,'fonts.css'));
const [W,H]=(process.argv[2]||'1366x768').split('x').map(Number);const tag=W+'x'+H;
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;const log=(...a)=>console.log(tag,...a);
 const ctx=await b.newContext({viewport:{width:W,height:H}});await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host==='gns.test')return r.fulfill({status:200,contentType:'text/html',body:html});
  if(u.host==='fonts.googleapis.com')return r.fulfill({status:200,contentType:'text/css',body:fcss});if(u.host==='fonts.gstatic.com'){const f=path.join(FC,path.basename(u.pathname));if(fs.existsSync(f))return r.fulfill({status:200,contentType:'font/woff2',body:fs.readFileSync(f)})}return r.abort()});
 const p=await ctx.newPage();p.setDefaultTimeout(150000);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/net::|Failed to load/.test(m.text())&&errs.push(m.text()));
 // ?fps=1 shows the overlay at once
 await p.goto('https://gns.test/?fps=1');await p.waitForTimeout(2500);const fps1=await p.evaluate(()=>!!(window.PerfHUD&&PerfHUD.shown));log('?fps=1 overlay',fps1);if(!fps1)bad++;
 await p.goto('https://gns.test/');await p.waitForTimeout(1500);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(7);AIDELAY=400});
 const soft=await p.evaluate(()=>window.SF_SOFTGPU);log('software GPU detected',soft,'auto level',await p.evaluate(()=>JSON.stringify(SFKit.getQuality())));if(soft&&await p.evaluate(()=>SFKit.getQuality().active)!=='low'){bad++;log('AUTO did not pick Low on a software GPU')}
 await p.click('[data-a=job][data-n="4"]');await p.click('[data-a=start]');await p.waitForTimeout(2000);
 for(let k=0;k<6;k++){const q=await p.$('#main [data-a=q]');if(!q)break;await q.click();await p.waitForTimeout(400)}
 // auto step-down: force High while auto, watch PerfHUD step it down
 await p.evaluate(()=>SFKit._applyQ('high'));const t0=Date.now();let seen=[];for(let i=0;i<40;i++){await p.waitForTimeout(1000);const s=await p.evaluate(()=>({q:SFKit.getQuality().active,pr:SFKit._K.r.getPixelRatio()}));const k=s.q+'@'+s.pr;if(seen[seen.length-1]!==k)seen.push(k);if(s.q==='low'&&i>4)break}
 log('auto steps',seen.join(' -> '),'in',((Date.now()-t0)/1000).toFixed(0)+'s',JSON.stringify(await p.evaluate(()=>PerfHUD.log.slice(-4))));if(!seen.some(x=>x.startsWith('low'))&&!seen.some(x=>x.startsWith('medium'))){bad++;log('NO STEP-DOWN')}
 // Settings popup: Show speed
 await p.click('.gx-bar [data-gx=setd]');await p.waitForTimeout(900);await p.screenshot({path:`${OUT}/P_${tag}_1settings.png`});
 if(await p.evaluate(()=>PerfHUD.shown)){await p.keyboard.press('Escape');await p.keyboard.press('F9');await p.click('.gx-bar [data-gx=setd]');await p.waitForTimeout(800)}await p.click('#setd [data-perfhud=show]');await p.waitForTimeout(1500);const hud=await p.evaluate(()=>{const h=document.getElementById('perfhud');if(!h)return null;const r=h.getBoundingClientRect();return {text:h.innerText.slice(0,120),pe:getComputedStyle(h).pointerEvents,rect:[r.left,r.top,r.width,r.height].map(Math.round)}});
 log('hud',JSON.stringify(hud));if(!hud||!hud.rect[2]){bad++;log('HUD NOT VISIBLE')}await p.keyboard.press('Escape');await p.waitForTimeout(1500);await p.screenshot({path:`${OUT}/P_${tag}_2hud.png`});
 // Test speed, then Apply
 await p.click('.gx-bar [data-gx=setd]');await p.waitForTimeout(800);const tt=Date.now();await p.click('#setd [data-perfhud=test]');
 await p.waitForSelector('.phud-card',{timeout:150000});log('test took',((Date.now()-tt)/1000).toFixed(1)+'s',JSON.stringify(await p.evaluate(()=>PerfHUD.lastTest)).slice(0,300));await p.screenshot({path:`${OUT}/P_${tag}_3card.png`});
 await p.click('.phud-card [data-ph=apply]');await p.waitForTimeout(800);const ap=await p.evaluate(()=>({q:SFKit.getQuality(),saved:localStorage.getItem('sf_gfx'),auto:PerfHUD.stats().auto}));log('after apply',JSON.stringify(ap));if(ap.saved!==ap.q.active||ap.q.pref==='auto'){bad++;log('APPLY did not save the level')}
 // idle saver: no input and nothing moving -> ~10 fps; a pointer move wakes it
 await p.evaluate(()=>{UI.pause=true});await p.waitForTimeout(5000);const id1=await p.evaluate(()=>new Promise(r=>{const d0=PerfHUD.stats().drawn;setTimeout(()=>r({idle:PerfHUD.idling,anim:SFKit.isAnimating(),drawnPerSec:PerfHUD.stats().drawn-d0}),1000)}));
 await p.mouse.move(W/3,H/3);await p.mouse.move(W/3+20,H/3+10);await p.waitForTimeout(150);const id2=await p.evaluate(()=>PerfHUD.idling);log('idle',JSON.stringify(id1),'after pointer move idle=',id2);if(!id1.idle||id1.drawnPerSec>14||id2){bad++;log('IDLE SAVER problem')}
 await p.keyboard.press('F9');await p.waitForTimeout(200);const f9=await p.evaluate(()=>PerfHUD.shown);await p.keyboard.press('F9');await p.waitForTimeout(200);const f9b=await p.evaluate(()=>PerfHUD.shown);log('F9 toggles',f9,f9b);if(f9===f9b)bad++;
 // hover-lift check: no element under the pointer changes its box on :hover
 const lift=await p.evaluate(()=>{const out=[];for(const el of document.querySelectorAll('button,.btn,.gbtn,.vb,.jt')){const cs=getComputedStyle(el);if(/translate|scale|rotate/.test(cs.transform)&&cs.transform!=='none')out.push(el.className)}return out.slice(0,5)});log('transformed buttons at rest',JSON.stringify(lift));
 log('errors',JSON.stringify(errs.slice(0,5)));bad+=errs.length;console.log('PERF PROBLEMS',bad);await b.close()})().catch(e=>{console.error('FATAL',e);process.exit(1)});
