// Addendum 5 screenshots: node a5-shots.js  -> playable-shots/a5-<size>-<n>.png (convert to webp afterwards)
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.join(__dirname, 'vale-of-banners.html'); const OUT = path.join(__dirname, 'playable-shots');
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  for (const [name, vp, touch] of [['390', { width: 390, height: 763 }, true], ['1440', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    const shot = n => page.screenshot({ path: `${OUT}/a5-${name}-${n}.png` });
    const tap = async loc => { if (touch) await loc.tap(); else await loc.click(); };
    await page.goto(URL); await page.waitForTimeout(600);
    await tap(page.locator('#quickB')); await page.waitForTimeout(300); await tap(page.locator('#goB')); await page.waitForTimeout(2800);
    for (let i = 0; i < 30 && !(await page.evaluate(() => myTurn())); i++) await page.waitForTimeout(300);
    const mtab = async () => { const t = page.locator('#tab-market'); if (await t.count() && await t.isVisible()) { await tap(t); await page.waitForTimeout(350); } };
    await mtab(); await shot('1-market-badges');
    const g = page.locator('#mk .tilebtn:has(.gain.best)').first(); await tap(g); await page.waitForTimeout(400); await shot('2-take-preview');
    const act = page.locator('#tv .acts .btn').first(); await tap(act); await page.waitForTimeout(1800); await shot('3-after-take-rating');
    // build if possible
    for (let k = 0; k < 4; k++) {
      const sg = page.locator('#store .tilebtn.glow').first();
      if (await sg.count()) { await tap(sg); await page.waitForTimeout(400); await shot('4-build-preview'); const cg = page.locator('#es .cell.glow').first(); if (name === '1440') await cg.hover(); await page.waitForTimeout(300); await shot('5-hover-region'); await tap(cg); await page.waitForTimeout(1800); await shot('6-after-build-pop'); break; }
      const g2 = page.locator('#mk .tilebtn:has(.gain.best), #mk .glow').first(); await mtab(); if (await g2.count()) { await tap(g2); await page.waitForTimeout(300); const a = page.locator('#tv .acts .btn').first(); await tap(a); await page.waitForTimeout(1500); }
    }
    await page.evaluate(() => { document.querySelector('#tabs') && 0; });
    const e = page.locator('#endB'); if (await e.count() && await e.isVisible()) await tap(e);
    await page.waitForTimeout(3500); await shot('7-score-breakdown');
    console.log(name, 'errors', errs.length, errs.slice(0, 3).join(' | ')); await ctx.close();
  }
  await b.close();
})();
