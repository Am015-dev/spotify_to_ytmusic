// Real-input smoke: from the title tap Play, play 3 rounds by tapping (Suggest + Go), force the finish, reach the result screen. Phone portrait and PC.
// Usage: node smoke.js <page url, e.g. http://127.0.0.1:PORT/redline-rally/?fast=1>   (served with scripts/gx-serve.js)
const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2], b = await chromium.launch({ args: ['--no-sandbox'] }); let fails = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(url, { waitUntil: 'load' });
    const tap = sel => touch ? page.locator(sel).first().tap() : page.locator(sel).first().click();
    await tap('#playB');
    for (let r = 0; r < 3; r++) {
      await page.waitForSelector('#goB', { timeout: 20000 }); await tap('#sugB'); await page.waitForTimeout(150);
      if (await page.locator('#goB').isDisabled()) { const n = await page.locator('#hand .cd:not(.dead)').count(); for (let i = 0; i < n; i++) if (await page.locator('#goB').isDisabled()) await page.locator('#hand .cd:not(.dead)').nth(i).click(); }
      if (r === 0) await page.screenshot({ path: `shots/plan-${name}.png` });
      await tap('#goB');
      for (let t = 0; t < 120; t++) { const slip = await page.locator('#slipY').count(); if (slip) { await tap('#slipY'); } if (await page.locator('#goB').count() && !(await page.locator('#goB').isDisabled().catch(() => true)) || await page.locator('#goB').count()) break; await page.waitForTimeout(150); }
      console.log(name, 'round', r + 1, 'ok; round now', await page.evaluate(() => G.round));
    }
    await page.screenshot({ path: `shots/mid-${name}.png` });
    await page.evaluate(() => { UI.forceEnd(); G.cars[0].plan = null; });
    // finish: submit this round then the forced finish ends the race
    await page.waitForSelector('#goB'); await tap('#sugB'); await tap('#goB');
    await page.waitForSelector('#again', { timeout: 30000 }).catch(() => { });
    const done = await page.locator('#again').count(); await page.screenshot({ path: `shots/result-${name}.png` });
    console.log(name, done ? 'PASS reached result' : 'FAIL no result', 'errors:', errs.length, errs.slice(0, 2).join(' | ')); if (!done || errs.length) fails++;
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
