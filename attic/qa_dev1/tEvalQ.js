// dev1: ?test= fast start, eval code files in module scope, print results. node qa_dev1/tEvalQ.js <base url> <city> <code.js,...>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [,,url,c,f]=process.argv;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
 await p.goto(url+(url.includes('?')?'&':'?')+'test='+c+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{timeout:240000,polling:1000});
 for(const file of f.split(',')){const r=await p.evaluate(s=>{try{return JSON.stringify(__oc.ev(s))}catch(e){return 'ERR '+e+' '+e.stack}},fs.readFileSync(file,'utf8'));console.log(file,r.slice(0,1500))}
 console.log('errs',errs.length,errs.slice(0,2).join(' | '));await b.close()})();
