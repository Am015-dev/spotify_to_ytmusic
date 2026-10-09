// tFit.js (v88z): ramp validator log + traffic mix right after boot. usage: node tools/tFit.js <city>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('./d24lib.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const {p,errs}=await boot(b,{city:process.argv[2],url:process.argv[3]||'http://127.0.0.1:8766/local_dbg.html?fast=1',phone:false});
const L=await p.evaluate(()=>__qs.ramps());for(const o of L)console.log(JSON.stringify(o));
console.log(JSON.stringify(await p.evaluate(()=>({mix:__qs.mix(),shut:__qs.shut(),n:__mho.RO.ramps.length}))));console.log('errs',errs);await b.close()})();
