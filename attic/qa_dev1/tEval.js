// dev1: boot a city, eval a code file in module scope (window.__oc.ev), print the result. node qa_dev1/tEval.js <url> <city> <code.js>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('../tools/d24lib.js');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const [,,url,c,f]=process.argv;const {p,errs}=await boot(b,{city:c,url});
 for(const file of f.split(',')){const r=await p.evaluate(s=>{try{return JSON.stringify(__oc.ev(s))}catch(e){return 'ERR '+e+' '+e.stack}},fs.readFileSync(file,'utf8'));console.log(file,r)}
 console.log('errs',JSON.stringify(errs.slice(0,3)));await b.close()})();
