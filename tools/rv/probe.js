// probe.js <url> <city> <w> <h> <jsfile> [shot.jpg]: boot ?test=city&draw=0, run __hot(js) (may return a promise), print JSON; optional shot
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [U,C,W,H,J,S]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:+W,height:+H},isMobile:true,hasTouch:true,deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(300000);const E=[];p.on('pageerror',e=>E.push(String(e).slice(0,200)));
 await p.goto(U+'?test='+C+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__chk,null,{polling:250,timeout:300000});
 const out=await p.evaluate(async s=>{try{const v=await window.__hot(s);return JSON.stringify(v)}catch(e){return'ERR '+(e.stack||e).toString().slice(0,400)}},fs.readFileSync(J,'utf8'));console.log(out);
 if(S){await p.evaluate(()=>{__tq.o.draw=1});await p.waitForTimeout(1500);await p.screenshot({path:S,type:'jpeg',quality:70})}
 if(E.length)console.log('ERRORS '+E.slice(0,3).join(' | '));await b.close()})();
