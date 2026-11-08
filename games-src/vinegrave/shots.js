// Newcomer shots of a Quick game at normal speed: first turn, inspector, mid-animation, rival turn (several frames), result (?scn=vg-result).
// node shots.js outDir   (run python3 build.py first)
const { chromium } = require('playwright'), serve = require('./serve.js'), fs = require('fs');
const OUT = process.argv[2] || 'shots';
(async () => {
  const S = await serve(), b = await chromium.launch({ args: ['--no-sandbox'], executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), page = await ctx.newPage();
    await ctx.addInitScript(() => { try { localStorage.setItem('vinegrave-prefs', JSON.stringify({ played: true })); localStorage.setItem('gxt-vinegrave', JSON.stringify({ done: true })); } catch (e) { } });
    const tap = async loc => touch ? loc.tap() : loc.click();
    await page.goto(S.url, { waitUntil: 'load' }); await page.waitForSelector('#start .tbtn');
    await tap(page.locator('#start .tbtn').first());
    await page.waitForTimeout(300); if (await page.locator('#goal:not([hidden]) .tbtn').count()) await tap(page.locator('#goal .tbtn'));
    await page.waitForFunction(() => window.G && myTurn() && !UI.busy, null, { timeout: 20000 }); await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/d-turn1-${name}.png` });
    await tap(page.locator('.glow').first()); await page.waitForTimeout(500); await page.screenshot({ path: `${OUT}/e-insp-${name}.png` });
    await tap(page.locator('#insp .btn.go').first());
    if (await page.locator('#qbox:not([hidden])').count()) await tap(page.locator('#qbox .btn').last());
    await page.waitForTimeout(250); await page.screenshot({ path: `${OUT}/f-anim-${name}.png` });
    for (let i = 0; i < 4; i++) { await page.waitForTimeout(700); await page.screenshot({ path: `${OUT}/g-rival${i}-${name}.png` }); }
    await page.goto(S.url + '?scn=vg-result', { waitUntil: 'load' }); await page.waitForSelector('#rs:not([hidden]) table', { timeout: 30000 }); await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/h-result-${name}.png` });
    await ctx.close();
  }
  await b.close(); S.close();
})();
