// Plays Quick game / Story stage 1 to the result by tapping visible UI only: node playtest-ui.js quick|story p|d
const path = require('path'); const PW = require('path').resolve(__dirname, '..', 'node_modules', 'playwright'); const HTML = 'file://' + path.resolve(__dirname, 'twin-thrones.html');
const fs=require('fs'); fs.mkdirSync(process.env.SHOTS||'/tmp/ttshots',{recursive:true});
const LIB=(function(){// shared driver: taps only visible UI. exports play(pg, touch, opts)
const T = async (pg, touch, loc) => { await loc.scrollIntoViewIfNeeded().catch(()=>{}); return touch ? loc.tap({timeout:4000}) : loc.click({timeout:4000}); };
async function dt(pg){ return (await pg.locator('#dt').textContent().catch(()=>'')||'').trim(); }
async function playToResult(pg, touch, o={}) {
  const t0 = Date.now(); let turns = 0, shots = o.shots||{};
  while (Date.now()-t0 < (o.max||240000)) {
    if (o.stopAt && await o.stopAt(pg)) return {turns, ok:true};
    if (await pg.locator('#res:not([hidden])').count()) return {turns, ok:true, result:true};
    if (o.story && await pg.locator('.gxc-result, .gxc-res, [data-gxc-result]').count()) return {turns, ok:true, result:true};
    if ((await dt(pg)) !== 'Your move') { await pg.waitForTimeout(120); continue; }
    if (await pg.locator('.wcard.go').count()) { await T(pg,touch,pg.locator('.wcard.go').first()); continue; }
    if (await pg.locator('[data-first]').count()) { await T(pg,touch,pg.locator('[data-first]').first()); continue; }
    if (await pg.locator('.picker .tk').count()) { await T(pg,touch,pg.locator('.picker .tk').first()); continue; }
    const av = pg.locator('#pyr .card.av:not(.dim)');
    if (await av.count()) {
      if (!(await pg.locator('#zoom:not([hidden])').count())) { await T(pg,touch,av.nth(Math.floor(Math.random()*Math.min(3,await av.count())))); await pg.waitForTimeout(150); }
      const b = pg.locator('#zoom [data-a="build"]:not([disabled])');
      if (await b.count()) await T(pg,touch,b.first()); else await T(pg,touch,pg.locator('#zoom [data-a="discard"]').first());
      turns++; continue;
    }
    await pg.waitForTimeout(120);
  }
  return {turns, ok:false};
}


return { T, dt, playToResult };})();
const { T, dt, playToResult } = LIB;
const MODE=process.argv[2]||'quick';
if(MODE==='story'){
const { chromium } = require(PW);
const sizes = { p:[{width:390,height:763},true], d:[{width:1440,height:860},false] };
const which = process.argv[3]||'p'; const out=(process.env.SHOTS||'/tmp/ttshots');
(async()=>{
  const [vp,touch]=sizes[which];
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
  const c = await b.newContext({viewport:vp,hasTouch:touch,isMobile:touch}); const pg = await c.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await pg.goto(HTML);
  await pg.evaluate(()=>{window.AIDELAY=90}); await pg.waitForTimeout(400);
  await T(pg,touch,pg.locator('[data-story]').first()); await pg.waitForTimeout(500);
  await pg.screenshot({path:`${out}/${which}-s-map.png`});
  await T(pg,touch,pg.locator('.gxc-node').first()); await pg.waitForTimeout(300);
  await pg.screenshot({path:`${out}/${which}-s-sheet.png`});
  await T(pg,touch,pg.locator('.gxc-sheet .gxc-btn.go').first()); 
  const t0=Date.now(); let scenes=0, played=0, res=false, shot=0;
  while(Date.now()-t0<300000){
    if (await pg.locator('.gxc-res:visible').count()) { res=true; await pg.screenshot({path:`${out}/${which}-s-result.png`}); break; }
    const sc = pg.locator('.gxc-scene .gxc-btn.go:visible, .gxc-boss .gxc-btn.go:visible');
    if (await sc.count()) { if(shot++<2) await pg.screenshot({path:`${out}/${which}-s-scene${shot}.png`}); scenes++; await T(pg,touch,sc.first()); await pg.waitForTimeout(150); continue; }
    if ((await dt(pg))==='Your move') {
      played++;
      if (await pg.locator('.wcard.go').count()) { await T(pg,touch,pg.locator('.wcard.go').first()); continue; }
      if (await pg.locator('[data-first]').count()) { await T(pg,touch,pg.locator('[data-first]').first()); continue; }
      if (await pg.locator('.picker .tk').count()) { await T(pg,touch,pg.locator('.picker .tk').first()); continue; }
      const av = pg.locator('#pyr .card.av:not(.dim)');
      if (await av.count()) { if (!(await pg.locator('#zoom:not([hidden])').count())) { await T(pg,touch,av.first()); await pg.waitForTimeout(150);} const bb=pg.locator('#zoom [data-a="build"]:not([disabled])'); if(await bb.count()) await T(pg,touch,bb.first()); else await T(pg,touch,pg.locator('#zoom [data-a="discard"]').first()); continue; }
    }
    await pg.waitForTimeout(150);
  }
  console.log(which,'story result',res,'scenes',scenes,'errors',JSON.stringify(errs.slice(0,3)));
  await b.close();
})();

}else{
const { chromium } = require(PW);

const out = (process.env.SHOTS||'/tmp/ttshots');
(async()=>{
 for (const [n,vp,t] of (process.argv[3]==='d'?[['d',{width:1440,height:860},false]]:[['p',{width:390,height:763},true]])) {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
  const c = await b.newContext({viewport:vp,hasTouch:t,isMobile:t}); const pg = await c.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await pg.goto(HTML + '?seed=11');
  await pg.evaluate(()=>{window.AIDELAY=90});
  await T(pg,t,pg.locator('[data-start="1"]').first());
  let shot=0;
  const r = await playToResult(pg,t,{max:200000, stopAt: async (pg)=>{ if(!shot && await pg.locator('#pyr .card.av:not(.dim)').count()){ shot=1; await pg.waitForTimeout(300); await pg.screenshot({path:out+'/'+n+'-5firstturn.png'}); await T(pg,t,pg.locator('#pyr .card.av:not(.dim)').first()); await pg.waitForTimeout(400); await pg.screenshot({path:out+'/'+n+'-6zoom.png'}); await T(pg,t,pg.locator('#zoom [data-zclose]').first()); } return false; }});
  await pg.waitForTimeout(1200); await pg.screenshot({path:out+'/'+n+'-9result.png'});
  console.log(n, JSON.stringify(r), errs.slice(0,3));
  await b.close();
 }
})();

}
