// tW13m.js: team select shot. usage: node tools/tW13m.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const URL=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',OUT=process.argv[3]||'docs/shots/w13';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(600000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});await p.waitForTimeout(3000);
 await p.screenshot({path:path.join(OUT,(process.env.TAG||'')+'menu0.jpg'),type:'jpeg',quality:80});
 const vis=await p.evaluate(()=>{const t=document.querySelector('#teams');const r=t.getBoundingClientRect();let h=null;for(let a=t;a;a=a.parentElement)if(a.hidden){h=a.id||a.className;break}return{r:[r.x,r.y,r.width,r.height],hidden:h,n:t.children.length,menuHidden:document.querySelector('#menu').hidden}});console.log('TEAMS',JSON.stringify(vis));
 await p.tap('.hc[data-a="quick"]');await p.waitForTimeout(2500);await p.screenshot({path:path.join(OUT,(process.env.TAG||'')+'race0.jpg'),type:'jpeg',quality:80});
 console.log('TEAMS2',JSON.stringify(await p.evaluate(()=>{const r=document.querySelector('#teams').getBoundingClientRect();return[r.x,r.y,r.width,r.height]})));
 await p.evaluate(()=>document.querySelector('#teams').scrollIntoView({block:'center'}));await p.waitForTimeout(1500);
 await p.screenshot({path:path.join(OUT,(process.env.TAG||'')+'teams.jpg'),type:'jpeg',quality:80});
 await p.tap('#gbMenuBtn');await p.waitForTimeout(4000);await p.screenshot({path:path.join(OUT,(process.env.TAG||'')+'garage.jpg'),type:'jpeg',quality:80});
 console.log('ERRS',JSON.stringify(errs));await b.close()})();
