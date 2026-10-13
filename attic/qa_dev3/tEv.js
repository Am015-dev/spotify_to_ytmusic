// dev3: ?test= start, eval code file (module scope, async ok), full result to <out>. node qa_dev3/tEv.js <url> <city> <code.js> <out>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [,,url,c,f,o]=process.argv;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
 await p.goto(url+(url.includes('?')?'&':'?')+'test='+c+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{timeout:240000,polling:1000});
 const r=await p.evaluate(async s=>{try{return JSON.stringify(await __oc.ev(s))}catch(e){return 'ERR '+e+' '+e.stack}},fs.readFileSync(f,'utf8'));fs.writeFileSync(o,r);console.log('wrote',o,r.length,'errs',errs.length,errs.slice(0,2).join('|'));await b.close()})();
