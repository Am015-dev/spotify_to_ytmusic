// Screenshots of key moments (attack flip, monster turn, door) at phone size: node moment-shots.js [w] [h] [outdir]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const W = +process.argv[2] || 375, H = +process.argv[3] || 667, OUT = process.argv[4] || '/tmp/claude-0/moments';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, 'wickdeep.html')); await p.waitForTimeout(500);
  // a new campaign, scenario 2 (bigger map), helper plays until a hero must pick a target
  await p.evaluate(() => { CAMP = WDC.newCamp(['warden', 'ringer'], 0); WDUI.startScenario(2, { seed: 21 }); });
  await p.waitForTimeout(400);
  const until = async (fn, max) => { for (let i = 0; i < (max || 400); i++) { const ok = await p.evaluate(fn); if (ok) return true; await p.evaluate(() => { const m = WDAI.choose(G); WD.apply(G, m); G.ev = []; UI.view = null; }); } return false; };
  await until(() => G.ask && G.ask.h === 'target');
  await p.evaluate(() => { CAM.fit = true; fitCam(true); WDUI.refresh(); }); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '/a-target.png' });
  const t = p.locator('#hot .glow.atk').first(); if (await t.count()) { await t.tap(); await p.waitForTimeout(380); await p.screenshot({ path: OUT + '/b-flip.png' }); }
  await p.waitForFunction(() => !UI.busy, null, { timeout: 20000 }).catch(() => {});
  // a monster turn: finish this hero's turn by helper moves through doMove so events animate
  for (let i = 0; i < 30; i++) {
    const h = await p.evaluate(() => G.ask && G.ask.h); if (!h || h === 'sel') break;
    await p.evaluate(() => { WDUI.doMove(WDAI.choose(G)); });
    for (let k = 0; k < 40; k++) { await p.waitForTimeout(120); const s = await p.evaluate(() => ({ busy: UI.busy, m: !!document.querySelector('.mcardv') })); if (s.m) { await p.screenshot({ path: OUT + '/c-monster.png' }); break; } if (!s.busy) break; }
    if (fs.existsSync(OUT + '/c-monster.png')) break;
  }
  await p.waitForFunction(() => !UI.busy, null, { timeout: 30000 }).catch(() => {});
  await p.screenshot({ path: OUT + '/d-after.png' });
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
