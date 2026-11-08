// v4 review shots: title, map, market, hand, a card inspected, turn-over, result at 390x763 and 1440x860.
// node v4-shots.js <outDir> <prefix>   (build first; pictures come from games/vinegrave/media)
const { chromium } = require('playwright'), serve = require('./serve.js'), fs = require('fs');
const OUT = process.argv[2] || 'shots', PRE = process.argv[3] || 'v4';
(async () => {
  const S = await serve(), b = await chromium.launch({ args: ['--no-sandbox'] });
  for (const [name, vp, touch] of [['390', { width: 390, height: 763 }, true], ['1440', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await ctx.addInitScript(() => { try { localStorage.setItem('vinegrave-prefs', JSON.stringify({ played: true })); localStorage.setItem('gxt-vinegrave', JSON.stringify({ done: true })); } catch (e) { } });
    const shot = async k => { await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/${PRE}-${k}-${name}.png` }); };
    const tap = async loc => touch ? loc.tap() : loc.click();
    await page.goto(S.url, { waitUntil: 'load' }); await page.waitForSelector('#start .tbtn'); await page.waitForTimeout(800); await shot('title');
    await tap(page.locator('#start .tbtn').first());
    await page.waitForFunction(() => window.G && myTurn() && !UI.busy, null, { timeout: 20000 }); await page.waitForTimeout(900);
    await page.evaluate(() => { try { showTab('map'); render(); } catch (e) { } }); await shot('map');
    await page.evaluate(() => { try { showTab('row'); render(); } catch (e) { } }); await shot('market');
    await shot('hand');
    const c = page.locator('#hand .cd').first(); if (await c.count()) { await tap(c); await shot('inspect'); await page.evaluate(() => { try { closeInsp(); } catch (e) { } }); }
    await page.evaluate(() => { try { showTab('map'); render(); } catch (e) { } });
    await page.evaluate(() => { const ms = VG.moves(G); const m = ms.find(x => x.t !== 'end') || ms[0]; try { doMove(m); } catch (e) { } });
    await page.waitForTimeout(700); await shot('turnover');
    await page.goto(S.url + '?scn=vg-result', { waitUntil: 'load' }); await page.waitForSelector('#rs:not([hidden]) table', { timeout: 30000 }); await page.waitForTimeout(1500); await shot('result');
    if (errs.length) console.log('FAIL errors', name, errs.slice(0, 2)); else console.log('PASS shots', name);
    await ctx.close();
  }
  await b.close(); S.close();
})();
