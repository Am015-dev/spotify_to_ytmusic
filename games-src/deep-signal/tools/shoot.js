// First-minute screenshots: title, tutorial steps 1-3, first turn, crewmate turn, result. Usage: node tools/shoot.js <url> <outdir> <tag>
const { chromium } = require('playwright');
const [url, out, tag] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  for (const [nm, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    const sh = n => p.screenshot({ path: `${out}/${tag}-${nm}-${n}.png` });
    await p.goto(url); await p.waitForTimeout(900); await sh('1title');
    await p.locator('[data-gxt-open]').first().click().catch(() => { }); await p.waitForTimeout(1200); await sh('2tut1');
    for (let i = 2; i <= 3; i++) { const n = p.locator('.gxt-next'); if (await n.count() && await n.first().isVisible()) await n.first().click(); else { const t = p.locator('#pool .tcard').first(); if (await t.count()) await t.click(); } await p.waitForTimeout(1200); await sh('2tut' + i); }
    try { await p.evaluate(() => GXT.stop()); } catch (e) { }
    await p.evaluate(() => startGame({ players: 4, mission: 3, seed: 11 })); await p.waitForTimeout(500);
    for (let i = 0; i < 60; i++) { if (await p.locator('#pool .tcard.legal').count() || await p.locator('#hand .cd.legal').count()) break; await p.waitForTimeout(250); }
    await sh('3first');
    for (let i = 0; i < 40; i++) { if (await p.locator('#pool .tcard.legal').count()) { await p.locator('#pool .tcard.legal').first().click(); await p.waitForTimeout(300); continue; } if (await p.locator('#diveB').count() && await p.locator('#diveB').isVisible()) { await p.locator('#diveB').click(); await p.waitForTimeout(300); continue; } if (await p.locator('#hand .cd.legal').count()) break; await p.waitForTimeout(250); }
    await p.locator('#hand .cd.legal').first().click().catch(() => { }); await p.waitForTimeout(450); await sh('4rival'); await p.waitForTimeout(700); await sh('4rival2');
    await p.evaluate(() => { G.result = { ok: true, why: 'forced' }; G.phase = 'over'; step(); }); await p.waitForTimeout(3000); await sh('5result');
    console.log(nm, 'errors', errs.length, errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  await b.close();
})();
