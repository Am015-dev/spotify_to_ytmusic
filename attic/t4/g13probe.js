// t4/g13probe.js <url> <outdir>: open the builder; run a list of steps from G13STEPS (JSON [[name, js|null, tapSelector|null, waitMs]]), shot each
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'||/G13/.test(m.text()))errs.push(m.type()+':'+m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 await p.click('#gbMenuBtn');await p.waitForTimeout(1500);await p.click('#r2R [data-r2m="build"]');await p.waitForTimeout(2000);
 const S=JSON.parse(process.env.G13STEPS||'[]'),out=process.argv[3];
 for(const[n,js,tap,w]of S){if(tap&&tap[0]==='@'){const[x,y]=tap.slice(1).split(',').map(Number);await p.touchscreen.tap(x,y)}else if(tap&&tap[0]==='!'){await p.keyboard.press(tap.slice(1))}else if(tap){const e=await p.$(tap);if(e){const r=await e.boundingBox();await p.touchscreen.tap(r.x+r.width/2,r.y+r.height/2)}else console.log('NOTAP',tap)}
  if(js)console.log(n,JSON.stringify(await p.evaluate(s=>{try{return eval(s)}catch(e){return 'EXC '+e}},js)));await p.waitForTimeout(w||600);if(n[0]!=='_')await p.screenshot({path:out+'/'+n+'.png'})}
 console.log('ERR',JSON.stringify(errs.filter(e=>!/GPU stall|GL Driver/.test(e)).slice(0,8)));await b.close()})();
