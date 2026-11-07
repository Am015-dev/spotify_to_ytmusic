// real shots of the built game: title, wonder pick, pyramid mid-game, result.  node review-shots.js p|d  (SHOTS=outdir)
const path = require('path'), fs = require('fs'); const { chromium } = require(path.resolve(__dirname, '../../../node_modules/playwright'));
const HTML = 'file://' + path.resolve(__dirname, '../../twin-thrones.html'); const out = process.env.SHOTS || '/tmp/ttshots'; fs.mkdirSync(out, { recursive: true });
const n = process.argv[2] || 'p', vp = n === 'd' ? { width: 1440, height: 860 } : { width: 390, height: 763 }, touch = n !== 'd';
const T = async (pg, loc) => { await loc.scrollIntoViewIfNeeded().catch(() => {}); return touch ? loc.tap({ timeout: 4000 }) : loc.click({ timeout: 4000 }); };
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const c = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }); const pg = await c.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(HTML + '?seed=11'); await pg.evaluate(() => { window.AIDELAY = 90 }); await pg.waitForTimeout(1200);
  await pg.screenshot({ path: `${out}/${n}-1title.png` });
  await T(pg, pg.locator('[data-start="1"]').first()); const t0 = Date.now(); let turns = 0, got = {};
  const dt = async () => ((await pg.locator('#dt').textContent().catch(() => '')) || '').trim();
  while (Date.now() - t0 < 200000) {
    if (await pg.locator('#res:not([hidden])').count()) { await pg.waitForTimeout(1500); await pg.screenshot({ path: `${out}/${n}-4result.png` }); break; }
    if ((await dt()) !== 'Your move') { await pg.waitForTimeout(120); continue; }
    if (await pg.locator('.wcard.go').count()) { if (!got.w) { got.w = 1; await pg.waitForTimeout(500); await pg.screenshot({ path: `${out}/${n}-2wonderpick.png` }); } await T(pg, pg.locator('.wcard.go').first()); continue; }
    if (await pg.locator('[data-first]').count()) { await T(pg, pg.locator('[data-first]').first()); continue; }
    if (await pg.locator('.picker .tk').count()) { await T(pg, pg.locator('.picker .tk').first()); continue; }
    const av = pg.locator('#pyr .card.av:not(.dim)');
    if (await av.count()) {
      if (turns >= 6 && !got.p && !(await pg.locator('#zoom:not([hidden])').count())) { got.p = 1; await pg.waitForTimeout(400); await pg.screenshot({ path: `${out}/${n}-3pyramid.png` }); }
      if (!(await pg.locator('#zoom:not([hidden])').count())) { await T(pg, av.first()); await pg.waitForTimeout(150); }
      const bb = pg.locator('#zoom [data-a="build"]:not([disabled])'); if (await bb.count()) await T(pg, bb.first()); else { const sl = pg.locator('#zoom [data-a="sell"]'); if (await sl.count()) await T(pg, sl.first()); }
      turns++;
    }
    await pg.waitForTimeout(150);
  }
  console.log(n, 'turns', turns, 'shots', Object.keys(got).join(','), 'errors', JSON.stringify(errs.slice(0, 3))); await b.close();
})();
