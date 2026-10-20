const PW = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs=require('fs'),html=fs.readFileSync(__dirname+'/demo.html');
(async()=>{const br=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await br.newContext({viewport:{width:+(process.argv[3]||1366),height:+(process.argv[4]||768)}});await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host==='gns.test')return r.fulfill({status:200,contentType:'text/html',body:html});return r.abort()});
const pg=await ctx.newPage();pg.on('console',m=>{const t=m.text();if(!/willReadFrequently|ERR_FAILED/.test(t))console.log('CON',m.type(),t.slice(0,300))});pg.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,300)));
await pg.goto('https://gns.test/?static&noqbar&gfx='+(process.argv[5]||'low'));await pg.waitForFunction(()=>window.DEMO_READY===true);await pg.waitForTimeout(500);
const code=process.argv[2]||'';const r=await pg.evaluate(c=>{try{return String(eval(c))}catch(e){return 'ERR '+e.stack}},code);console.log('RESULT',r);
await pg.screenshot({path:__dirname+'/shots/'+(process.argv[6]||'dbg')+'.png'});await br.close()})();
