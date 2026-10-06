// credits shots (loading screen + settings credits) at 852x393: node t/cred.js <base-url-dir> <prefix>
const {chromium,devices}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const dir=process.argv[2]||'',pre=process.argv[3]||'shots/CR';const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:852,height:393},deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8766/'+dir+'local.html');await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});await p.evaluate(()=>{const e=document.querySelector('#ld2');e.hidden=false;e.classList.remove('out');e.style.opacity=1});await p.waitForTimeout(500);await p.screenshot({path:pre+'_loading.png'});
 const ld=await p.evaluate(()=>[...document.querySelectorAll('.ldby')].map(e=>e.textContent));
 await p.evaluate(()=>{document.querySelector('#ld2').hidden=true});await p.waitForTimeout(500);
 const c=await p.evaluate(()=>{const e=document.querySelector('#setBtn');const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,vis:r.width>0}});if(c.vis)await p.touchscreen.tap(c.x,c.y);else await p.evaluate(()=>document.querySelector('#setBtn').click());await p.waitForTimeout(600);
 await p.evaluate(()=>{const e=document.querySelector('#setCred');e.scrollIntoView({block:'center'})});const d=await p.evaluate(()=>{const r=document.querySelector('#setCred').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});await p.touchscreen.tap(d.x,d.y);await p.waitForTimeout(600);
 await p.evaluate(()=>document.querySelector('#credBox').scrollIntoView({block:'start'}));await p.waitForTimeout(300);await p.screenshot({path:pre+'_credits.png'});
 const cr=await p.evaluate(()=>[...document.querySelectorAll('#credBox .credby')].map(e=>e.textContent+' vis='+(e.getBoundingClientRect().height>0)));
 console.log(JSON.stringify({ld,cr,setBtnVisible:c.vis}),'errs',JSON.stringify(errs));await b.close()})();
