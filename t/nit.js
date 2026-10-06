// SMASH! popup vs tutorial card on the phone: node t/nit.js <page> <out>
const {chromium,devices}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const page=process.argv[2]||'dev2/local_dbg.html',out=process.argv[3]||'qa_n/smash';const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await (await b.newContext((process.env.DESK?{viewport:{width:1280,height:720}}:{...devices['iPhone 13'],viewport:{width:852,height:393},deviceScaleFactor:1}))).newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
 await p.goto('http://127.0.0.1:8766/'+page);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
 await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam');await p.waitForTimeout(4000);await p.evaluate(()=>{const t=document.querySelector('#roamTut');t.querySelector('small').textContent='TUTORIAL · 2/5';t.querySelector('p').textContent='Double-tap ◀ or ▶ to SMASH sideways into a rival.';t.hidden=false});await p.waitForTimeout(800);
 const R=()=>p.evaluate(()=>{const r=e=>{const x=document.querySelector(e);if(!x||x.hidden||!x.getClientRects().length)return null;const q=x.getBoundingClientRect();return[q.left|0,q.top|0,q.right|0,q.bottom|0]};return{tut:r('#roamTut'),pop:r('#hitPop'),ju:r('#juPop'),cls:document.querySelector('#hitPop').className}});
 console.log('before',JSON.stringify(await R()));
 for(const au of [0,1,2]){await p.evaluate(au=>{let el=document.querySelector(au===2?'#juPop':'#hitPop');if(!el){el=document.createElement('div');el.id='juPop';document.body.appendChild(el)}el.innerHTML=au===2?'SMASH!<small>RIVAL HIT</small>':'💥 SMASH!';el.hidden=false;if(au<2)el.classList.toggle('au2k',!!au);el.classList.remove('on');void el.offsetWidth;el.classList.add('on')},au);
  await p.waitForTimeout(160);console.log('au'+au,JSON.stringify(await R()));await p.screenshot({path:out+au+'.png'});await p.waitForTimeout(1300)}
 console.log('errs',JSON.stringify(errs));await b.close()})();
