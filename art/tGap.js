// art/tGap.js <base url> [off]: checklist GO art1/road-gap through the test start (?test=fra&go=…), like tChkGo. off = load ?rs=0 first (fix off for the tab)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [B,off]=process.argv.slice(2);const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.addInitScript(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;for(const f of q.splice(0))try{f(t)}catch(e){}}};setInterval(()=>window.__tick(1),16)});
 if(off){await p.goto(B+'?rs=0');await p.waitForTimeout(1500)}
 await p.goto(B+'?test=fra&go='+encodeURIComponent('art1/road-gap'));
 await p.waitForFunction(()=>window.__chk&&__chk.roadgap,null,{timeout:900000});const r=await p.evaluate(()=>__chk.roadgap);
 console.log('GO art1/road-gap',off?'(fix off)':'(fix on)',r.ok?'PASS':'FAIL',JSON.stringify(r),'errors',errs.length);await b.close()})();
