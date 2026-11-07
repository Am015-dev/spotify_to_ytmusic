// Real-input smoke: title -> Quick game -> keep the starting hand -> 3 turns by tapping (a row, its dice/eggs/cards, any trade answered),
// then force the end of the year and reach the result screen. Phone portrait 390x763 (touch) and PC 1440x860 (mouse).
//   node smoke.js [url]   (default: the local build; or a gx-serve.js URL like http://127.0.0.1:PORT/perch-and-plume/)
const { chromium } = require('playwright');
const path = require('path');
const url = process.argv[2] || 'file://' + path.join(__dirname, 'perch-and-plume.html');
(async () => {
  const b = await chromium.launch(); let fails = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(url, { waitUntil: 'load' });
    const tap = sel => touch ? page.locator(sel).first().tap() : page.locator(sel).first().click();
    await tap('[data-t="quick"]'); await tap('[data-n="2"]'); await tap('[data-go]'); await tap('#keepgo');
    let turns = 0;
    for (let k = 0; k < 400 && turns < 3; k++) {
      const s = await page.evaluate(() => ({ mine: myTurn(), q: G.q && G.q.h, gs: UI.gsDie != null }));
      if (!s.mine) { await page.waitForTimeout(150); continue; }
      if (s.gs) await tap('#acts [data-a="mv"]');
      else if (!s.q) { await tap(['.ract[data-h="0"]', '.ract[data-h="1"]', '.ract[data-h="2"]'][turns % 3]); turns++; }
      else if (s.q === 'die') await tap('.die.glow');
      else if (s.q === 'egg') await tap('.bc[data-a="bird"].glow');
      else if (s.q === 'draw') await tap('#deckb');
      else await tap('#acts .btn');
      await page.waitForTimeout(120);
    }
    for (let k = 0; k < 100; k++) { if (await page.evaluate(() => myTurn() && !G.q)) break; const q = await page.evaluate(() => myTurn() && G.q && G.q.h); if (q === 'die') await tap('.die.glow'); else if (q === 'draw') await tap('#deckb'); else if (q === 'egg') await tap('.bc[data-a="bird"].glow'); else if (q) await tap('#acts .btn'); await page.waitForTimeout(150); }
    const t3 = await page.evaluate(() => G.pl[0].cubes);
    console.log((t3 === 5 ? 'PASS ' : 'FAIL ') + name + ' three turns played by tapping (cubes left ' + t3 + ')'); if (t3 !== 5) fails++;
    // force the end of the year: every player out of cubes, last round
    await page.evaluate(() => { G.round = G.rounds - 1; G.pl.forEach(p => { p.cubes = 1; }); render(); });
    await tap('.ract[data-h="2"]');
    for (let k = 0; k < 40; k++) { const q = await page.evaluate(() => myTurn() && G.q && G.q.h); if (q === 'draw') await tap('#deckb'); else if (q) await tap('#acts .btn'); if (await page.locator('#again').isVisible().catch(() => false)) break; await page.waitForTimeout(250); }
    await page.waitForSelector('#again', { state: 'visible', timeout: 30000 }).catch(() => { });
    const done = await page.locator('#again').isVisible().catch(() => false);
    console.log((done && !errs.length ? 'PASS ' : 'FAIL ') + name + ' reached the result screen; errors: ' + errs.length + ' ' + errs.slice(0, 2).join(' | ')); if (!done || errs.length) fails++;
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
