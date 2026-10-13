const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [port,city,off]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--ignore-gpu-blocklist']});
const c=await b.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true});
await c.addInitScript(([city])=>{try{localStorage.setItem('mho_city@1',city);if(city==='ath')localStorage.setItem('mho_athpre','1')}catch(e){}},[city]);
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
await p.goto(`http://localhost:${port}/mainhattan-overdrive/index.html`,{waitUntil:"domcontentloaded",timeout:90000});await p.waitForTimeout(4000);
await p.evaluate(()=>{const b=document.getElementById('roamBtn')||document.getElementById('careerBtn');b&&b.click()});await p.waitForTimeout(8000);
if(off==='1')console.error(await p.evaluate(()=>{try{if(typeof LDS_ab==='function'){LDS_ab(1);return 'ab'}window.__ld.lds.off=1;return 'off'}catch(e){try{window.__ld.lds.off=1;return 'off2'}catch(e2){return 'fail '+e}}}));
await p.keyboard.down('ArrowUp');await p.keyboard.down('KeyW');const R=[];
for(let s=0;s<6;s++){await p.waitForTimeout(2000);R.push(await p.evaluate(()=>window.__perf?window.__perf():null))}
const f=R.filter(Boolean),med=k=>{const v=f.map(x=>x[k]).sort((a,b)=>a-b);return v[v.length>>1]};
console.log(JSON.stringify({port,city,off,calls:med('calls'),tris:med('triangles'),geo:med('geo'),errs:errs.slice(0,2),raw:JSON.stringify(f.slice(-2))}));await b.close()})();
