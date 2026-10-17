const PW=require(process.env.PW);const fs=require('fs'),path=require('path');const html=fs.readFileSync(path.join(__dirname,'shortfuse.html'));const FC=path.join(__dirname,'..','kit','fontcache');const fcss=fs.readFileSync(path.join(FC,'fonts.css'));
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:1366,height:768}});
await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host==='gns.test')return r.fulfill({status:200,contentType:'text/html',body:html});if(u.host==='fonts.googleapis.com')return r.fulfill({status:200,contentType:'text/css',body:fcss});return r.abort()});
const p=await ctx.newPage();await p.goto('https://gns.test/');await p.waitForTimeout(1200);await p.evaluate(()=>localStorage.clear());
await p.click('[data-a=job][data-n="10"]');await p.click('[data-a=start]');
for(let i=0;i<8;i++){console.log(await p.evaluate(()=>JSON.stringify({ph:G.phase,step:G.step,q:G.q&&G.q.kind,brief:!!UI.brief,clock:G.ms.timer&&G.ms.timer.left,t:G.turn})));await p.waitForTimeout(1500);if(i==1)await p.click('[data-a=briefok]')}
await p.screenshot({path:'shots/nc/job10.png'});await b.close()})()
