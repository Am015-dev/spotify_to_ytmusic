// athAudit.js (athroads): walk every drivable road segment (city streets CITY_S incl. fill roads FILL_R, not ped) of ONE city on the BUILT page and list every
// collider (building, wall, stall, set piece in HUB.grid), LIFE solid prop and terrain step whose footprint reaches the drivable width minus a 0.5 m kerb margin.
//   node tools/athAudit.js <page url> [fra|ath|both=both] [--all]     prints counts + the worst offenders (--all: every one); exit 1 if blockers>0
// Visual pass (athroads2): window.__athVis = wall triangles of every visible mesh vs the road corridors; window.__athDead = street ends with nothing behind them and a wall/collider within 15 m.
// In-page entry: window.__athAudit() (returns {n,list}); the GO ath/roads-clear (src/99c5_athroads.js, lazy chunk) calls the same function.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const A=process.argv.slice(2),URL0=A[0],W=(A[1]&&!A[1].startsWith('--'))?A[1]:'both',ALL=A.includes('--all');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
 for(const city of W==='both'?['fra','ath']:[W]){const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();p.setDefaultTimeout(240000);
  await p.goto(URL0+(URL0.includes('?')?'&':'?')+'test='+city+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:240000});
  const r=await p.evaluate(()=>window.__athAudit?window.__athAudit():null);if(!r){console.log(city+': no __athAudit (lazy chunk not loaded)');bad++;continue}
  const v=await p.evaluate(()=>window.__athVis?window.__athVis():null),d=await p.evaluate(()=>window.__athDead?window.__athDead():null);
  if(v&&d){console.log(`${city}: visual — ${v.n} visible-mesh overlaps, ${d.n} blocked dead ends (of ${d.all} dead ends)`);bad+=v.n+d.n;
   for(const o of v.list.slice(0,ALL?1e9:15))console.log(`  mesh @(${o.x},${o.z}) ${o.road} w=${o.w} intrudes ${o.dep} m  ${o.note}`);
   for(const o of d.list.slice(0,ALL?1e9:15))console.log(`  deadend @(${o.x},${o.z}) ${o.road} w=${o.w} blocked by ${o.note}`)}
  const by={};for(const o of r.list)by[o.type]=(by[o.type]||0)+1;
  console.log(`${city}: ${r.n} blockers on ${r.km.toFixed(1)} km of road · by type ${JSON.stringify(by)}`);bad+=r.n;
  for(const o of r.list.slice(0,ALL?1e9:15))console.log(`  ${o.type} @(${o.x},${o.z}) ${o.road} w=${o.w} intrudes ${o.dep} m  ${o.note||''}`)}
 await b.close();process.exit(bad?1:0)})();
