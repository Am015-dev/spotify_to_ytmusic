// dev1: tap 📍 GO on checklist items in one city (one browser), read window.__chk.<key>, one shot each. node qa_dev1/tGo.js <url> <outdir> <city> <id>[=key] ...
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('../tools/d24lib.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const [,,url,o,c,...ids]=process.argv;const {p,errs,shot}=await boot(b,{city:c,url});
 for(const s of ids){const [id,key,wait]=s.split('=');const m=await p.evaluate(id=>__chk.go(id),id);await p.evaluate(n=>__tick(n),+(wait||60));const r=key?await p.evaluate(k=>__chk[k],key):null;
  const f=`${o}/go_${id.replace(/\W/g,'_')}.jpg`;await shot(f);console.log(id,m,JSON.stringify(r))}
 console.log('errs',JSON.stringify(errs.slice(0,5)));await b.close()})();
