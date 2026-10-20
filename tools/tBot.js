// tBot: run the headless playtest bot (src/99c8_bot.js, GO tags bot/nav + bot/race) in Frankfurt and Athens (two pages in parallel) and write docs/BOT_REPORT.md.
//   node tools/tBot.js <base url of the build, e.g. http://localhost:8813/index.html> [report.md]
//   SEEDS=1,2,3  one nav run per seed (default 1 = BOT.seed; waypoints and Math.random are seeded, so a run repeats)   WP=6  waypoints per run (default 4)
//   NORACE=1  skip the races (nav only)   Exit code 1 when any scenario fails.   Wall time per scenario is printed; the budget is 60 s.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs'),cp=require('child_process');
const BASE=process.argv[2],OUT=process.argv[3]||'docs/BOT_REPORT.md',SEEDS=(process.env.SEEDS||'0').split(',').map(Number),WP=+process.env.WP||4;
const city=async(b,c)=>{const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true}),p=await ctx.newPage(),errs=[];p.setDefaultTimeout(120000);
 p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+c+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__chk&&window.__bot,null,{polling:250,timeout:120000});
 const R=[],reset=async()=>{await p.evaluate(()=>__tq.reset()).catch(()=>{})};
 for(const sd of SEEDS){const t=Date.now();await p.evaluate(([s,w,c])=>{__bot.seed=20261020+s;__bot.wp=w;if(__chk.bot)delete __chk.bot[c+'/nav'];__bot.said=window.BOT_go('nav',t=>{__bot.said=t})},[sd,WP,c]);
  await p.waitForFunction(c=>__chk.bot&&__chk.bot[c+'/nav'],c,{timeout:120000,polling:200});const line=await p.evaluate(()=>__bot.said),w=(Date.now()-t)/1000,o=await p.evaluate(c=>JSON.parse(JSON.stringify(__chk.bot[c+'/nav']||null)),c);R.push({scenario:'nav seed+'+sd,city:c,wall:w,line,o});await reset()}
 if(!process.env.NORACE){const t=Date.now();await p.evaluate(c=>{if(__chk.bot)delete __chk.bot[c+'/race'];window.BOT_go('race',t=>{__bot.said=t})},c);await p.waitForFunction(c=>__chk.bot&&__chk.bot[c+'/race'],c,{timeout:120000,polling:250}).catch(()=>{});await p.waitForTimeout(300);
  const line=await p.evaluate(()=>__bot.said),o=await p.evaluate(c=>JSON.parse(JSON.stringify(__chk.bot[c+'/race']||null)),c);R.push({scenario:'race',city:c,wall:(Date.now()-t)/1000,line,o});await reset()}
 await ctx.close();return{R,errs}};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const T0=Date.now();
 const [F,A]=await Promise.all([city(b,'fra'),city(b,'ath')]);await b.close();const all=[...F.R,...A.R],bad=all.filter(r=>!r.o||!r.o.ok),errs=[...F.errs,...A.errs];
 const cells={};for(const r of all)if(r.o&&r.o.cells)for(const[k,v]of Object.entries(r.o.cells)){const key=r.city+' '+k,o=cells[key]=cells[key]||{};for(const[f,n]of Object.entries(v))o[f]=(o[f]||0)+n}
 const sc=o=>(o.err||0)*50+(o.nan||0)*50+(o.fall||0)*50+(o.lost||0)*30+(o.reset||0)*10+(o.stuck||0)+(o.long||0),worst=Object.entries(cells).sort((x,y)=>sc(y[1])-sc(x[1])).slice(0,12);
 let sha='?';try{sha=cp.execSync('git rev-parse --short HEAD').toString().trim()}catch(e){}
 const md=['# Playtest bot report','',`Run ${new Date().toISOString().slice(0,16)}Z · base ${sha} · build ${BASE.replace(/index\.html.*/,'')} · seeds ${SEEDS.map(s=>20261020+s).join(',')} · ${WP} waypoints/run · wall ${((Date.now()-T0)/1000).toFixed(0)} s total (budget 60 s per scenario)`,'',
  'Bot: `src/99c8_bot.js` (GO `bot/nav`, `bot/race`), runner `tools/tBot.js`. It drives with the game\'s own keys through `roamStep(1/30)` (no teleport between waypoints, no real-time play). Cells are 100 m map cells (`x,z` = south-west corner).','',
  '## Scenarios','','| result | city | scenario | wall s | detail |','|---|---|---|---|---|',...all.map(r=>`| ${r.o&&r.o.ok?'PASS':'**FAIL**'} | ${r.city} | ${r.scenario} | ${r.wall.toFixed(0)}${r.wall>60?' (over budget)':''} | ${String(r.line).replace(/\|/g,'/').replace(/^📍 /,'').replace(/ [✅❌]$/,'')} |`),'',
  '## Worst cells (all runs, both cities)','',worst.length?'| cell (city x,z) | counts |\n|---|---|\n'+worst.map(([k,v])=>`| ${k} | ${Object.entries(v).filter(([f,n])=>n).map(([f,n])=>f+' '+(f==='stuck'?n.toFixed(1)+' s':n)).join(', ')} |`).join('\n'):'none: no stuck seconds, resets, long steps or errors in any cell.','',
  '## JS errors during the run','',errs.length?errs.slice(0,10).map(e=>'- '+e).join('\n'):'none.','',(()=>{try{return fs.readFileSync(require('path').join(__dirname,'../docs/BOT_NOTES.md'),'utf8')}catch(e){return''}})()].join('\n');
 fs.writeFileSync(OUT,md);console.log(all.map(r=>(r.o&&r.o.ok?'PASS ':'FAIL ')+r.city+' '+r.scenario+' '+r.wall.toFixed(0)+'s · '+String(r.line).slice(0,230)).join('\n'));console.log('worst:',worst.slice(0,5).map(([k,v])=>k+' '+JSON.stringify(v)).join(' | ')||'none');console.log(JSON.stringify({pass:all.length-bad.length,total:all.length,jsErrors:errs.length,wall_s:Math.round((Date.now()-T0)/1000)}));process.exit(bad.length?1:0)})();
