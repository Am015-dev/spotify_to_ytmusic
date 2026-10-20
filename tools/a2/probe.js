// assets-r21p probe: node tools/a2/probe.js <base url of build, e.g. http://localhost:8811/index.html> <city fra|ath> <mode> [outdir]
//   table : print window.__a2.table() as JSON      calls : roam draw calls with / without the flag      sheet : contact-sheet jpg of the city's props (852x393)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [,,BASE,CITY,MODE,OUT='.']=process.argv;fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const open=async(flag)=>{const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true}),p=await ctx.newPage();p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
  await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+CITY+'&draw=0'+(flag?'&assets2=1':'')+(process.env.Q||''));await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});return p};
 if(MODE==='table'){const p=await open(1);console.log(JSON.stringify(await p.evaluate(()=>__a2.table())));}
 if(MODE==='calls'){const r={};for(const flag of[0,1]){const p=await open(flag);await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.waitForTimeout(1500);
   // park at a few street spots; take the max draw calls of one render each
   const o=[];for(let i=0;i<3;i++){await p.waitForTimeout(1500);await p.evaluate(()=>__tq.draw());o.push(await p.evaluate(()=>__a2.info()))}r[flag]=o;}
  console.log(JSON.stringify(r))}
 if(MODE==='sheet'){const p=await open(1);const ids=(process.env.IDS||'').split(',').filter(Boolean);
  const url=await p.evaluate(ids=>__a2.sheet(ids),ids);
  fs.writeFileSync(OUT+'/sheet_'+CITY+(process.env.NAME?'_'+process.env.NAME:'')+'.jpg',Buffer.from(url.split(',')[1],'base64'));console.log('SHEET ok')}
 if(MODE==='street'){const p=await open(1);await p.waitForTimeout(4000);await p.evaluate(()=>__tq.draw());await p.waitForTimeout(300);await p.evaluate(()=>__tq.draw());await p.screenshot({path:OUT+'/street_'+CITY+'.jpg',type:'jpeg',quality:80});console.log('STREET ok',JSON.stringify(await p.evaluate(()=>__a2.info())))}
 if(MODE==='race'){const p=await open(1);await p.evaluate(t=>__ld.lds.race(t),process.env.TRACK||'main');await p.waitForTimeout(5000);await p.evaluate(()=>__tq.draw());await p.waitForTimeout(300);await p.evaluate(()=>__tq.draw());await p.screenshot({path:OUT+'/race_'+(process.env.TRACK||'main')+'.jpg',type:'jpeg',quality:80});console.log('RACE ok',await p.evaluate(()=>__a2.state.n.race))}
 await b.close()})().catch(e=>{console.log('ERR',e);process.exit(1)});
