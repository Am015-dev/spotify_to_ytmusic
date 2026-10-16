// persistent probe: boot city once, then eval q/<n>.js files in module scope (__tk.q), write <n>.out
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const [URL,DIR]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(900000);
 p.on('pageerror',e=>fs.appendFileSync(DIR+'/err.log',String(e).slice(0,300)+'\n'));
 await p.goto(URL);await p.waitForFunction(()=>window.__tk&&window.__tq&&__tq.ready,null,{timeout:600000});
 await p.evaluate(()=>XC_need('X5')).catch(e=>fs.appendFileSync(DIR+'/err.log','xc '+e+'\n'));fs.writeFileSync(DIR+'/READY','1');
 for(;;){const fl=fs.readdirSync(DIR).filter(f=>/^\d+\.js$/.test(f)&&!fs.existsSync(DIR+'/'+f.replace('.js','.out')));
  for(const f of fl){const src=fs.readFileSync(DIR+'/'+f,'utf8');let out;if(src.startsWith('//SHOT ')){const n=src.split('\n')[0].slice(7).trim();try{await p.evaluate(s=>__tk.q(s),src);await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.waitForTimeout(1500);await p.screenshot({path:n});out='shot '+n}catch(e){out='ERR '+e}}
   else{try{out=JSON.stringify(await p.evaluate(s=>__tk.q(s),src))}catch(e){out='ERR '+String(e).slice(0,500)}}fs.writeFileSync(DIR+'/'+f.replace('.js','.out'),out)}
  await new Promise(r=>setTimeout(r,300))}})();
