const PW=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const html=fs.readFileSync(__dirname+'/thornbound.html');const [W,H]=(process.argv[2]||'390x844').split('x').map(Number);const ph=process.argv[3]||'';
(async()=>{const b=await PW.chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:W<700,hasTouch:W<700});
await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.type()+' '+m.text())});
await p.goto('https://gns.test/'+ph);await p.waitForTimeout(1500);await p.screenshot({path:'/tmp/s0.png'});
await p.evaluate(()=>{AIDELAY=0;ANIM=0;newGame("me",{np:3})});await p.waitForTimeout(1500);await p.screenshot({path:'/tmp/s1.png'});
console.log(await p.evaluate(()=>JSON.stringify({q:G.q&&G.q.kind,step:G.step,round:G.round})));console.log(errs.slice(0,10).join('\n'));await b.close()})();
