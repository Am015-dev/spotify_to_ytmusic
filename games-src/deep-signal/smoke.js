// Real-input smoke: title tap (Quick game -> Start dive), 3 of your turns by tapping (task + glowing cards), forced end to the result screen. Phone portrait and PC.
// Usage: node smoke.js <page url, e.g. http://127.0.0.1:PORT/deep-signal/?fast=1>
const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2], b = await chromium.launch({ args: ['--no-sandbox'] }); let fails = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(600);
    const tap = async loc => { const l = typeof loc === 'string' ? page.locator(loc).first() : loc; return touch ? l.tap() : l.click(); };
    if (await page.locator('#zoom.on').count()) await tap('#zoom.on .btn:last-child');
    await tap('#quickB'); await tap('#startB');
    let turns = 0;
    let natural = false;
    for (let i = 0; i < 300 && turns < 3; i++) {
      if (await page.evaluate(() => !!G.result)) { natural = true; break; }
      await page.waitForTimeout(150);
      if (await page.locator('.gxh-bubble button, .gxh-bub button').count()) { await tap(page.locator('.gxh-bubble button, .gxh-bub button').first()).catch(() => { }); continue; }
      if (await page.locator('#pool .tcard.legal').count()) { await tap('#pool .tcard.legal'); turns++; console.log(name, 'took a task'); continue; }
      if (await page.locator('#askp.on .btn').count()) { await tap('#askp.on .btn'); continue; }
      const leg = page.locator('#hand .cd.legal'); if (await leg.count()) { const c = await page.evaluate(() => AIX.choosePlay(G, G.turn, 'easy')); await tap(`#hand .cd.legal[data-c="${c}"]`); turns++; console.log(name, 'played', c, 'trick', await page.evaluate(() => G.tricks.length + 1)); }
    }
    if (!natural) await page.evaluate(() => { G.result = { ok: true, why: 'forced' }; G.phase = 'over'; step(); });
    await page.waitForSelector('#again', { timeout: 15000 }).catch(() => { });
    const done = await page.locator('#again').count(); await page.screenshot({ path: `shots/smoke-result-${name}.png` });
    const okTurns = turns >= 3 || natural && turns >= 1;
    console.log(name, okTurns && done ? 'PASS' : 'FAIL', 'turns', turns, 'result', done, 'errors:', errs.length, errs.slice(0, 2).join(' | ')); if (!done || !okTurns || errs.length) fails++;
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
