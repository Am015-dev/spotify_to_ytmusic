// tCarFitShots: portrait/landscape chase-camera shots with the car fit off (before) and on (after). node tools/tCarFitShots.js <url index.html> <outdir> [fra,ath]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const BASE=process.argv[2],OUT=process.argv[3]||'.',CS=(process.argv[4]||'fra,ath').split(',');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const c of CS){const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:1,isMobile:true,hasTouch:true}),p=await ctx.newPage();
  await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+c+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:90000});
  for(const [w,h] of [[393,852],[852,393]])for(const on of [0,1]){await p.setViewportSize({width:w,height:h});await p.waitForTimeout(900);
   const m=await p.evaluate(on=>{window.__carFitSet(on);return JSON.stringify([window.__hudClear().car,window.__carFit()])},on);
   await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.screenshot({path:`${OUT}/${c}_${w}x${h}_${on?'after':'before'}.png`});console.log(c,w+'x'+h,on?'after':'before',m)}
  await ctx.close()}
 await b.close()})();
