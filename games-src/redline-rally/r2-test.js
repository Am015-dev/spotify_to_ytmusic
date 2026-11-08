// Round-2 checks on real taps: (1) the first-game guide does exactly what each step asks, (2) Upgrades mode drafts 3 cards and plays, (3) HUD art slots + sound toggle exist.
// Usage: node r2-test.js     (builds nothing; serves redline-rally/redline-rally.html with scripts/gx-serve.js)
const path = require('path'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html'), query: '?fast=1' }); const b = await chromium.launch({ args: ['--no-sandbox'] }); let fails = 0;
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), page = await ctx.newPage(), errs = [];
    page.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()); }); page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error' || /gxt lint/.test(m.text())) errs.push(m.text()); });
    await page.goto(url, { waitUntil: 'load' });
    const tap = sel => touch ? page.locator(sel).first().tap() : page.locator(sel).first().click();
    // ---- HUD slots + sound toggle
    ok(await page.locator('#title [data-snd]').count() === 1, name + ' sound toggle on title');
    ok(await page.locator('#tutSlot .gxt-menu').count() === 1, name + ' guide offered on first launch: ' + (await page.locator('#tutSlot .gxt-menu b').first().textContent()));
    await tap('#sndT'); ok((await page.locator('#sndT').textContent()).includes('Off'), name + ' mute toggle off'); await tap('#sndT');
    // ---- guide
    await tap('#tutSlot .gxt-menu');
    const seen = []; let stuck = 0;
    for (let n = 0; n < 40; n++) {
      const st = await page.evaluate(() => { const c = GXT.current && GXT.current(); return { act: GXT.active(), id: c && c.id, phase: GXT.state && GXT.state().phase }; });
      if (!st.act) break;
      if (!st.id || (st.phase && st.phase !== 'show')) { await page.waitForTimeout(250); if (++stuck > 40) break; continue; } stuck = 0;
      if (!seen.includes(st.id)) seen.push(st.id); else { await page.waitForTimeout(150); }
      const act = async s => { await page.locator(s).first()[touch ? 'tap' : 'click'](); };
      if (st.id === 'goal' || st.id === 'burn' || st.id === 'heat') { const nb = page.locator('[data-gxt-next], .gxt-next, button:has-text("Next")').first(); await nb.click({ timeout: 4000 }).catch(() => { }); }
      else if (st.id === 'gear') await act('.gb[data-g="2"]');
      else if (st.id === 'push') { await act('#hand .cd[data-i="4"]'); await act('#hand .cd[data-i="3"]'); }
      else if (st.id === 'brake') { await act('#hand .cd[data-i="1"]'); await act('#hand .cd[data-i="2"]'); }
      else if (st.id === 'go') await act('#goB');
      await page.waitForTimeout(350);
    }
    ok(seen.join(',') === 'goal,gear,push,burn,brake,go,heat', name + ' guide steps seen: ' + seen.join(','));
    await page.waitForSelector('.gxt-endc', { timeout: 8000 }).catch(() => { });
    ok(await page.locator('.gxt-endc').count() === 1, name + ' guide end card');
    if (name === 'phone') await page.screenshot({ path: 'shots/r2-guide-end-phone.png' });
    await page.locator('[data-gxt-end="play"]').first().click().catch(() => { });
    await page.waitForTimeout(400);
    ok(await page.evaluate(() => GXT.isDone('redline-rally')), name + ' guide marked done');
    // ---- upgrades
    await page.evaluate(() => { UI.set.upg = true; showTitle(); });
    await tap('#playB'); await page.waitForSelector('.upc', { timeout: 5000 });
    const picks = ['rocket', 'grip', 'coolant']; for (const u of picks) { await page.locator('.upc[data-u="' + u + '"]').first().click(); await page.waitForTimeout(60); }
    await page.waitForSelector('#goB', { timeout: 8000 });
    ok(await page.evaluate(() => G.cars[0].upg.join() === 'rocket,grip,coolant' && G.cars.every(c => c.upg.length === 3)), name + ' draft: 3 upgrades each');
    ok(await page.evaluate(() => { const c = G.cars[0]; return c.deck.concat(c.hand, c.disc).filter(x => x.charAt(1) === ':').length === 3; }), name + ' upgrades are in the deck');
    await page.evaluate(() => { const c = G.cars[0], rest = c.deck.concat(c.hand), want = ['u:rocket', 'u:grip', '3', '2', '1', '1', '4']; want.forEach(w => { const k = rest.indexOf(w); if (k >= 0) rest.splice(k, 1); }); c.hand = want.filter((w, i) => true).slice(); c.deck = rest; UI.sel = []; drawPlan(); });
    ok(await page.locator('#hand .cd.U').count() >= 1, name + ' upgrade card shown in hand');
    for (let r = 0; r < 3; r++) { await page.waitForSelector('#goB', { timeout: 20000 }); await tap('#sugB'); await page.waitForTimeout(100); await tap('#goB'); for (let t = 0; t < 100; t++) { if (await page.locator('#slipY').count()) await tap('#slipY'); if (await page.locator('#goB').count()) break; await page.waitForTimeout(100); } }
    ok(await page.evaluate(() => checkInvariants(G).length === 0), name + ' invariants hold after 3 upgrade rounds');
    ok(await page.locator('#tray').count() === 1 && await page.locator('#gears .ic[data-art="icon-gear"]').count() === 1 && await page.locator('#tPos').count() === 1 && await page.locator('[data-art="icon-lap"]').count() === 1 && await page.locator('[data-art="icon-place"]').count() === 1 && await page.locator('[data-art="icon-stress"]').count() === 1, name + ' HUD slots present');
    await page.screenshot({ path: `shots/r2-main-${name}.png` });
    ok(errs.length === 0, name + ' no console/page errors ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAIL r2-test' : 'PASS r2-test'); process.exit(fails ? 1 : 0);
})();
