const PW=require('playwright');const fs=require('fs');const html=fs.readFileSync('final-approach.html');
(async()=>{const b=await PW.chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:763},isMobile:true,hasTouch:true});await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('https://gns.test/');await p.waitForTimeout(1500);
await p.evaluate(()=>{UI.seed=5;AIDELAY=60;});await p.tap('[data-a=play]');await p.waitForTimeout(300);await p.tap('[data-start=guided]');await p.waitForTimeout(1500);
const o=await p.$('#pc:not([hidden]) [data-a=tipoff]');if(o)await o.tap();await p.waitForTimeout(300);
await p.evaluate(()=>{document.querySelector('#acts [data-a=ready]').click()});await p.waitForTimeout(2500);
for(let k=0;k<14;k++){const st=await p.evaluate(()=>({over:!!G.result,why:G.result&&G.result.why,round:G.round,phase:G.phase,pend:FA.pending(G),rs:!document.querySelector('#rs').hidden,hint:document.querySelector('#barprompt').textContent}));console.log(k,JSON.stringify(st));if(st.over)break;
const d=await p.$('#pz .die:not([disabled]):not(.used)');if(!d){await p.waitForTimeout(400);continue;}await d.tap();await p.waitForTimeout(200);const sl=await p.$('#pz .slot.legal');if(!sl){console.log('no legal');break;}await sl.tap();await p.waitForTimeout(700);}
await b.close();})();
