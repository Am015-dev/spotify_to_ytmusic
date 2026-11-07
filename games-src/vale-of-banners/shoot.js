// First-minute screenshots: node shoot.js <tag>  -> shots/<tag>-<size>-<n>.png
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.join(__dirname, 'vale-of-banners.html'); const TAG = process.argv[2] || 'before';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    const shot = n => page.screenshot({ path: `shots/${TAG}-${name}-${n}.png` });
    const tap = async loc => { if (touch) await loc.tap(); else await loc.click(); };
    await page.goto(URL); await page.waitForTimeout(600); await shot('1title');
    await tap(page.locator('#tutB')); await page.waitForTimeout(900); await shot('2tut1');
    for (let i = 2; i <= 3; i++) { const t = page.locator('.gxt-spot-target, .gxt-target, .gxt-next').first(); if (await t.count()) await tap(t).catch(() => { }); await page.waitForTimeout(900); await shot('2tut' + i); }
    await page.evaluate(() => { try { GXT.stop(); } catch (e) { } localStorage.clear(); }); await page.goto(URL); await page.waitForTimeout(500);
    await tap(page.locator('#quickB')); await page.waitForTimeout(300); await tap(page.locator('#goB')); await page.waitForTimeout(1500); await shot('3turn');
    // play first human turn: take first glowing tile, then end
    for (let k = 0; k < 2; k++) { const g = page.locator('#mk .glow').first(); if (await g.count()) { await tap(g); await page.waitForTimeout(400); const a = page.locator('#tv .acts .btn').first(); if (await a.count()) await tap(a); await page.waitForTimeout(1200); } }
    const e = page.locator('#endB'); if (await e.count() && await e.isVisible()) await tap(e);
    await page.waitForTimeout(700); await shot('4rival'); await page.waitForTimeout(900); await shot('4rival2');
    await page.goto(URL + '?scn=vb-result'); await page.waitForTimeout(2500); await shot('5result');
    console.log(name, 'errors', errs.length, errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  await b.close();
})();
