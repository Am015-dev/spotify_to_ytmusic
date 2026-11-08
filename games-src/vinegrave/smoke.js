// Real-input smoke: title tap Play, 3 of my turns by tapping a glowing thing + its action button, force the end, reach the result screen. Phone portrait and PC.
// node smoke.js   (builds nothing: run python3 build.py first)
const { chromium } = require('playwright'), serve = require('./serve.js');
(async () => {
  const S = await serve(), b = await chromium.launch({ args: ['--no-sandbox'], executablePath: require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }); let fails = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), page = await ctx.newPage(), errs = [];
    await ctx.addInitScript(() => { try { localStorage.setItem('vinegrave-prefs', JSON.stringify({ played: true })); localStorage.setItem('gxt-vinegrave', JSON.stringify({ done: true })); } catch (e) { } });
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(S.url + '?fast=1', { waitUntil: 'load' });
    const tap = async loc => touch ? loc.tap() : loc.click();
    await page.waitForSelector('#start .tbtn'); await page.screenshot({ path: `shots/title-${name}.png` });
    await tap(page.locator('#start .tbtn').first());
    try { await page.evaluate(() => { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } }); } catch (e) { }
    for (let t = 0; t < 3; t++) {
      await page.waitForFunction(() => window.G && typeof myTurn === 'function' && myTurn(), null, { timeout: 20000 });
      if (!(await page.locator('.glow').filter({ visible: true }).count())) { const tb = page.locator('#vtabs button.has').filter({ visible: true }); if (await tb.count()) await tap(tb.first()); }   // phone: the target may sit behind a tab
      const g = page.locator('.glow').filter({ visible: true }).first(); await tap(g); await page.waitForSelector('#insp:not([hidden]) .btn.go', { timeout: 5000 });
      if (t === 0) await page.screenshot({ path: `shots/insp-${name}.png` });
      const before = await page.evaluate(() => G.turns); await tap(page.locator('#insp .btn.go').first());
      if (await page.locator('#qbox:not([hidden])').count()) await tap(page.locator('#qbox .btn').last());
      await page.waitForFunction(b => G.turns > b, before, { timeout: 5000 });
      console.log(name, 'turn', t + 1, 'ok; round', await page.evaluate(() => G.round));
    }
    await page.screenshot({ path: `shots/mid-${name}.png` });
    await page.evaluate(() => { G.rounds = G.round; G.p.forEach(p => p.passed = p !== G.p[VG.actor(G)] ? true : p.passed); render(); });
    await page.waitForFunction(() => myTurn(), null, { timeout: 20000 });
    if (await page.locator('#qbox:not([hidden])').count()) await tap(page.locator('#qbox .btn').last());
    await tap(page.locator('#acts .btn').first());
    await page.waitForSelector('#rs:not([hidden]) table', { timeout: 30000 }).catch(() => { });
    const done = await page.locator('#rs:not([hidden]) table').count(); await page.screenshot({ path: `shots/result-${name}.png` });
    console.log(name, done ? 'PASS reached result' : 'FAIL no result', 'errors:', errs.length, errs.slice(0, 3).join(' | ')); if (!done || errs.length) fails++;
    await ctx.close();
  }
  await b.close(); S.close(); process.exit(fails ? 1 : 0);
})();
