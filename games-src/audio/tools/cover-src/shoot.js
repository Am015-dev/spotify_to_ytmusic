const PW=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const [,,f,out,wait]=process.argv;const b=await PW.chromium.launch();const c=await b.newContext({viewport:{width:960,height:540},deviceScaleFactor:2});
const p=await c.newPage();const e=[];p.on('pageerror',x=>e.push(String(x)));p.on('console',m=>{if(m.type()=='error')e.push(m.text())});
await p.goto('file://'+process.cwd()+'/'+f);await p.waitForFunction(()=>window.READY,null,{timeout:30000});await p.waitForTimeout(+wait||800);
await p.screenshot({path:out});console.log('errs',e);await b.close()})();
