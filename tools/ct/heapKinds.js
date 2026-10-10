// tools/ct/heapKinds.js <url> <fra|ath> : JS heap (after GC) added by building each LEGO traffic kind (city-1 memory check)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [URL,CITY]=process.argv.slice(2);const b=await chromium.launch({args:['--js-flags=--expose-gc','--enable-precise-memory-info','--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(c==='ath')localStorage.setItem('mho_city@1','ath')},CITY);await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});await p.waitForTimeout(5000);
 const r=await p.evaluate(async()=>{const H=()=>{gc();return performance.memory.usedJSHeapSize/1048576};const out=[];let h0=H();out.push(['start',+h0.toFixed(1)]);
  for(const nm of __ct.hcar()){if(!nm.startsWith('ld:'))continue;__ct.geo(nm);await new Promise(r=>setTimeout(r,50));const h=H();out.push([nm,+(h-h0).toFixed(1)]);h0=h}return out});
 console.log(CITY,JSON.stringify(r));await b.close()})();
