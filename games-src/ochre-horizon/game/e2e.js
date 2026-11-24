// End-to-end: the real page plays whole games with the computer picking the human's moves through the UI's own doMove.
// Usage: node e2e.js [games=2]   asserts: no page errors, game reaches the end, invariants hold, screen numbers = engine.
const { chromium } = require('playwright');
const F = 'file://' + __dirname + '/ochre-horizon.html?fast=1';
(async () => {
  const N = +process.argv[2] || 2, b = await chromium.launch(); let fail = 0;
  for (let g = 0; g < N; g++) {
    const pg = await b.newPage({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
    const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(F + '&play=1&seed=' + (100 + g)); await pg.waitForTimeout(300);
    const t0 = Date.now(); let last = '';
    while (Date.now() - t0 < 240000) {
      const st = await pg.evaluate(() => {
        if (OH.G.over) return 'over';
        const inv = OH.checkInvariants(); if (inv.length) return 'INV ' + inv.join(';');
        if (+document.getElementById('trYou').textContent !== OH.score(0).total && !UI.busy) return 'SCOREDIFF';
        if (OH.sideToAct() === 0 && !UI.busy) { const m = OHAI.decide('normal'); document.getElementById('modal').classList.remove('on'); if (m.t === 'setup') UI.setup = null; doMove(m); }
        return OH.G.phase + OH.G.gen;
      });
      if (st === 'over' || /^INV|SCOREDIFF/.test(st)) { last = st; break; }
      await pg.waitForTimeout(40);
    }
    const res = await pg.evaluate(() => OH.G.over ? OH.G.final.map(s => s.total).join('-') + ' gen ' + OH.G.gen : 'not over ' + OH.G.phase);
    await pg.waitForTimeout(1500);
    const endShown = await pg.evaluate(() => /win/i.test(document.getElementById('mb').textContent));
    console.log('game', g, last, res, 'end screen', endShown, 'errors', errs.length ? errs.slice(0, 3).join(' | ') : 0);
    if (last !== 'over' || errs.length || !endShown) fail++;
    await pg.close();
  }
  await b.close(); console.log(fail ? 'E2E FAIL ' + fail : 'E2E OK'); process.exit(fail ? 1 : 0);
})();
