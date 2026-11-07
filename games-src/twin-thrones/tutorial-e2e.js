// Coached-game driver: node tutorial-e2e.js p|d  (p = 390x763 touch, d = 1440x860 mouse).
// Starts the tutorial from the title, takes the one forced step by tapping the spotlit element, then plays the coached game with ANY legal moves through the UI
// (random choice among glowing cards, build when possible else sell) to the result screen, clicks through the scoring walk and the "later" card,
// and asserts: every coverage rule was explained during play or listed on the later card, never more than one coach bubble, 0 console errors. Prints one PASS/FAIL line.
const path = require('path'); const PW = path.resolve(__dirname, '..', 'node_modules', 'playwright'); const HTML = 'file://' + path.resolve(__dirname, 'twin-thrones.html');
const fs=require('fs');
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

const sizes = { p:[{width:390,height:763},true], d:[{width:1440,height:860},false] };
const which = process.argv[2]||'p';
(async()=>{
  const { chromium } = require(PW); const [vp,touch]=sizes[which];
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
  const c = await b.newContext({viewport:vp,hasTouch:touch,isMobile:touch}); const pg = await c.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await pg.goto(HTML); await pg.evaluate(()=>{window.AIDELAY=90}); await pg.waitForTimeout(500);
  const log=[]; let forced=0, maxBubbles=0;
  await LIB.T(pg,touch,pg.locator('[data-gxt-open]').first());
  const t0=Date.now(); let phase='scene', turns=0, over=false;
  while(Date.now()-t0<420000){
    maxBubbles=Math.max(maxBubbles, await pg.locator('#coach:not([hidden])').count());
    const sc=pg.locator('.gxc-scene .gxc-btn.go:visible');
    if (await sc.count() && !(await pg.evaluate(()=>GXT.state().shown))) { await LIB.T(pg,touch,sc.first()); continue; }
    const st = await pg.evaluate(()=>{const s=GXT.state(); return {a:s.active,shown:s.shown,hole:s.hole,wait:s.wait,id:s.id};});
    const endBtn = pg.locator('.gxt-end [data-gxt-end]');
    if (await endBtn.count()) { log.push('endcard'); await LIB.T(pg,touch,endBtn.first()); await pg.waitForTimeout(300); continue; }
    if (st.a && st.shown) { if (st.wait) { forced++; if(touch) await pg.touchscreen.tap(st.hole.cx,st.hole.cy); else await pg.mouse.click(st.hole.cx,st.hole.cy); } await pg.waitForTimeout(250); continue; }
    if (st.a) { await pg.waitForTimeout(150); continue; }
    if (await pg.locator('#laterCard').count()) { log.push('later'); over=true; break; }
    if (await pg.locator('#coach [data-cn]').count()) { log.push('walk'); await LIB.T(pg,touch,pg.locator('#coach [data-cn]').first()); await pg.waitForTimeout(200); continue; }
    if (await pg.locator('#res:not([hidden])').count()) { await pg.waitForTimeout(300); continue; }
    if ((await LIB.dt(pg)) !== 'Your move') { await pg.waitForTimeout(120); continue; }
    if (await pg.locator('.wcard.go').count()) { await LIB.T(pg,touch,pg.locator('.wcard.go').nth(Math.floor(Math.random()*await pg.locator('.wcard.go').count()))).catch(()=>{}); continue; }
    if (await pg.locator('[data-first]').count()) { await LIB.T(pg,touch,pg.locator('[data-first]').first()); continue; }
    if (await pg.locator('.picker .tk').count()) { await LIB.T(pg,touch,pg.locator('.picker .tk').first()); continue; }
    const av = pg.locator('#pyr .card.av:not(.dim)');
    if (await av.count()) {
      if (!(await pg.locator('#zoom:not([hidden])').count())) { await LIB.T(pg,touch,av.nth(Math.floor(Math.random()*await av.count()))); await pg.waitForTimeout(150); }
      const bb = pg.locator('#zoom [data-a="build"]:not([disabled])');
      const r = Math.random();
      if (await bb.count() && r < 0.8) await LIB.T(pg,touch,bb.first()); else await LIB.T(pg,touch,pg.locator('#zoom [data-a="discard"]').first());
      turns++; continue;
    }
    await pg.waitForTimeout(120);
  }
  const cov = await pg.evaluate(()=>TT_TUTOR.coverage());
  const missing = cov.all.filter(x=>!cov.seen.includes(x) && !cov.later.includes(x));
  const okAll = over && !missing.length && !errs.length && forced<=2 && maxBubbles<=1 && turns>10;
  console.log((okAll?'PASS ':'FAIL ')+'tutorial-to-end', which, 'forced', forced, 'turns', turns, 'seen', cov.seen.length, 'later', cov.later.length, 'missing', JSON.stringify(missing), 'maxBubbles', maxBubbles, 'errors', JSON.stringify(errs.slice(0,3)), log.join('>'));
  await b.close();
})();
