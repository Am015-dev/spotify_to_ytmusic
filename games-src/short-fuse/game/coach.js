const PW=require(process.env.PW);const fs=require('fs'),path=require('path');const html=fs.readFileSync(path.join(__dirname,'shortfuse.html'));const FC=path.join(__dirname,'..','kit','fontcache');const fcss=fs.readFileSync(path.join(FC,'fonts.css'));
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:1366,height:768}});
await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host==='gns.test')return r.fulfill({status:200,contentType:'text/html',body:html});if(u.host==='fonts.googleapis.com')return r.fulfill({status:200,contentType:'text/css',body:fcss});return r.abort()});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('https://gns.test/');await p.waitForTimeout(1200);await p.evaluate(()=>localStorage.clear());
const sh=n=>p.screenshot({path:'shots/nc/coach_'+n+'.png'});const txt=()=>p.evaluate(()=>document.querySelector('#coach').innerText.replace(/\s+/g,' ').slice(0,200));
await p.click('[data-a=tutorial]');await p.waitForTimeout(800);await p.click('[data-a=briefok]');await p.waitForTimeout(500);
console.log('1',await txt());await sh('1');
await p.click('[data-a=coachask]');await p.waitForTimeout(300);console.log('2 ask',await txt());await sh('2');
await p.click('[data-a=coachoff]');await p.waitForTimeout(300);console.log('3 off',await txt());await sh('3');
await p.click('[data-a=coachon]');await p.waitForTimeout(300);console.log('4 resumed',await txt());
console.log('gear in job1:',await p.evaluate(()=>{GX.show('geard');return document.querySelector('#gearbody').innerText.slice(0,160)}));
await p.keyboard.press('Escape');await p.evaluate(()=>{for(let i=0;i<6;i++)document.querySelector('#coach [data-a=coach]')&&document.querySelector('#coach [data-a=coach]').click()});
await p.waitForTimeout(600);console.log('main has probe:',await p.evaluate(()=>/Probe|Gear you can/.test(document.querySelector('#main').innerText)),errs);
await p.evaluate(()=>GX.show('rulesd'));await p.waitForTimeout(400);await p.screenshot({path:'shots/nc/rules.png'});await b.close()})()
