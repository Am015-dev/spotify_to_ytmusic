const PW=require('playwright');const fs=require('fs');const html=fs.readFileSync('/home/user/spotify_to_ytmusic/games-src/final-approach/game/final-approach.html');
(async()=>{const b=await PW.chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1366,height:768}});await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('https://gns.test/');await p.waitForTimeout(1500);
await p.click('[data-a=play]');await p.waitForTimeout(300);await p.click('[data-start=vs]');await p.waitForTimeout(1000);
await p.evaluate(()=>{const b=document.querySelector('#acts [data-a=ready]');if(b)b.click();});await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(()=>({dice:PX.state().dice,html:[...document.querySelectorAll('.tray .die')].map(d=>d.className+'|'+d.innerHTML)}))));
await b.close();})();
