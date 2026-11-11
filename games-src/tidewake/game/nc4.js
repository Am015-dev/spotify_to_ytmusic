const PW=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'tidewake.html'));const OUT=path.join(__dirname,'shots','nc');
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [W,H] of [[390,844],[1366,768]]){const ctx=await b.newContext({viewport:{width:W,height:H}});await ctx.route('**/*',r=>{const u=new URL(r.request().url());return u.host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort()});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('https://gns.test/');await p.waitForTimeout(1000);await p.evaluate(()=>localStorage.clear());
await p.click('[data-a=var][data-v=teams]');await p.evaluate(()=>{document.querySelector('.stin').scrollTop=500});await p.waitForTimeout(300);await p.screenshot({path:path.join(OUT,`${W}x${H}_start_teams.png`)});
await p.evaluate(()=>{document.querySelector('.stin').scrollTop=0;document.getElementById('start').scrollTop=0});await p.click('#start [data-gx=rulesd]');await p.waitForTimeout(700);await p.screenshot({path:path.join(OUT,`${W}x${H}_rules_from_start.png`)});await p.keyboard.press('Escape');
if(W>1000){await p.evaluate(()=>{setSeed(21);AIDELAY=40});await p.click('[data-a=guided]');await p.waitForTimeout(1500);await p.click('#dockbody [data-a=startmark]:not([disabled])');
 for(let k=0;k<60;k++){const ok=await p.evaluate(()=>{const d=sideToAct();return d>=0&&G.seats[d].human&&!UI.busy&&G.phase==='play'});if(ok)break;await p.waitForTimeout(250)}await p.waitForTimeout(400);
 for(let i=0;i<4;i++){if(await p.$('#dockbody [data-a=place][disabled]'))break;await p.click('#dockbody [data-a=rot][data-d="1"]');await p.waitForTimeout(250)}await p.waitForTimeout(500);await p.screenshot({path:path.join(OUT,`${W}x${H}_badroute.png`)});}
console.log(W,errs)}await b.close()})();
