const{chromium,boot}=require('../tools/d24lib');const fs=require('fs');const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'fra',url:process.argv[2],phone:true});
const rects=()=>p.evaluate(()=>{const f=s=>{const e=document.querySelector(s);if(!e||e.hidden)return null;const cs=getComputedStyle(e);if(cs.display==='none')return null;const q=e.getBoundingClientRect();return q.width?[q.left|0,q.top|0,q.right|0,q.bottom|0]:null};return{pin:f('#odPin'),yield:document.body.classList.contains('odYield'),gbx:f('#gbx')}});
console.log('boot',JSON.stringify(await rects()));
await p.evaluate(()=>document.querySelector('#gbMenuBtn').click());await p.waitForTimeout(1500);
for(let i=0;i<10;i++)await p.evaluate(()=>__tick(10));
console.log('garage',JSON.stringify(await rects()));await shot(out+'/g0.jpg');
const tabs=await p.evaluate(()=>[...document.querySelectorAll('#gbx .gbTabs [data-t]')].map(e=>e.dataset.t));console.log(tabs);
await p.evaluate(()=>{const e=document.querySelector('#gbx .gbTabs [data-t="build"]');e&&e.click()});await p.waitForTimeout(1500);console.log('build',JSON.stringify(await rects()));await shot(out+'/g1.jpg');
const btn=await p.evaluate(()=>[...document.querySelectorAll('#gbx button')].filter(e=>/BRICKS/.test(e.textContent)).map(e=>e.id+'|'+e.className+'|'+e.textContent.trim()));console.log(btn);
await p.evaluate(()=>{const e=[...document.querySelectorAll('#gbx button')].find(e=>/BRICKS/.test(e.textContent)&&e.getBoundingClientRect().width>0);e&&e.click()});await p.waitForTimeout(800);console.log('drop',JSON.stringify(await rects()));await shot(out+'/g2.jpg');
console.log(errs);await b.close()})()
