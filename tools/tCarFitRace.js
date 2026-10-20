// tCarFitRace: roam + race chase-camera shots at 393x852 and 852x393 (fit on) for the widest ride. node tools/tCarFitRace.js <url index.html> <outdir> [fra,ath] [ride id]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const BASE=process.argv[2],OUT=process.argv[3]||'.',CS=(process.argv[4]||'fra,ath').split(','),CAR=process.argv[5]||'t_su_v8';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const c of CS){const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:1,isMobile:true,hasTouch:true}),p=await ctx.newPage();
  await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+c+'&draw=0&car='+CAR);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});
  const shot=async(tag,w,h)=>{await p.setViewportSize({width:w,height:h});await p.waitForTimeout(900);const m=await p.evaluate(()=>{for(let n=0;n<30;n++)window.__carFitSet(1);return JSON.stringify([window.__carW(),window.__carFit()])});await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.screenshot({path:`${OUT}/${c}_${tag}_${w}x${h}.png`});console.log(c,tag,w+'x'+h,m)};
  await shot('roam',393,852);await shot('roam',852,393);
  await p.setViewportSize({width:393,height:852});await p.evaluate(()=>window.__raceGo());await p.waitForFunction(()=>{try{return window.__raceFit&&window.__raceFit().asp>0}catch(e){return false}},null,{timeout:20000});await p.waitForTimeout(9000);
  for(const [w,h] of [[393,852],[852,393]]){await p.setViewportSize({width:w,height:h});await p.waitForTimeout(1500);const m=await p.evaluate(()=>JSON.stringify([window.__carW(),window.__raceFit()]));await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.screenshot({path:`${OUT}/${c}_race_${w}x${h}.png`});console.log(c,'race',w+'x'+h,m)}
  await ctx.close()}
 await b.close()})();
