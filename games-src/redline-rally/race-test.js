/* A full race by real touch (W496): title -> Play -> Goal -> every round: tap the gear, tap glowing cards, Go; answer slipstream; until the result.
   Phone 390x844 and 375x667, page.touchscreen.tap only. Asserts: result screen reached, every taps hits its button, 0 page/console errors.
   SHOTS=dir saves first-turn.png, corner.png and result.png at 390x844.   Usage: PW=playwright node race-test.js */
const path = require('path'), fs = require('fs'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html') }), b = await chromium.launch({ args: ['--no-sandbox'] }); let fail = 0;
  for (const [n, vp] of [['390x844', { width: 390, height: 844 }], ['375x667', { width: 375, height: 667 }]]) {
    const shots = n === '390x844' && process.env.SHOTS; if (shots) fs.mkdirSync(shots, { recursive: true });
    const c = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: shots ? 2 : 1 }), p = await c.newPage(), errs = []; let blocked = 0, rounds = 0, cornerShot = false;
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.addInitScript(() => { localStorage.setItem('gxt-redline-rally', JSON.stringify({ done: 1 })); localStorage.setItem('rr_seen', '1'); window.AIDELAY = 0.12; });
    await p.goto(url, { waitUntil: 'load' });
    const tap = async sel => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length || e.disabled) return null; const q = e.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, h = document.elementFromPoint(x, y); return { x, y, hit: !!h && (h === e || e.contains(h)) }; }, sel); if (!r) return false; if (!r.hit) { blocked++; return false; } await p.touchscreen.tap(r.x, r.y); return true; };
    await tap('#playB'); await p.waitForTimeout(400); await tap('#goalB');
    const t0 = Date.now(); let done = false;
    while (Date.now() - t0 < 280000) {
      if (await p.evaluate(() => !!G && G.over && !document.querySelector('#modal').hidden)) { done = true; break; }
      if (await p.locator('#slipY').count()) { await tap('#slipY'); await p.waitForTimeout(100); continue; }
      const plan = await p.evaluate(() => !!document.querySelector('#goB') && !UI.busy && G.phase === 'plan' && !G.over);
      if (plan) {
        if (!rounds && shots) { await p.waitForTimeout(500); await p.screenshot({ path: path.join(shots, 'first-turn.png') }); }
        const gear = await p.evaluate(() => { const c = you(), nc = nextCorner(c.pos); return nc && nc.d <= 6 ? Math.max(1, c.gear - 1) : Math.min(4, c.gear + 1); });
        await tap('.gb[data-g="' + gear + '"]:not([disabled])');
        for (let i = 0; i < 6 && await p.evaluate(() => document.querySelector('#goB').disabled); i++) if (!(await tap('#hand .cd.glow'))) await tap('#hand .cd:not(.dead):not(.sel)');
        if (shots && !cornerShot && await p.evaluate(() => { const c = you(), nc = nextCorner(c.pos); return !!nc && nc.d <= 5; })) { cornerShot = true; await p.waitForTimeout(400); await p.screenshot({ path: path.join(shots, 'corner.png') }); }
        if (await tap('#goB')) rounds++;
        await p.waitForTimeout(150); continue;
      }
      if (await p.evaluate(() => UI.busy)) await p.touchscreen.tap(vp.width / 2, 120);
      await p.waitForTimeout(120);
    }
    if (done && shots) { await p.waitForTimeout(600); await p.screenshot({ path: path.join(shots, 'result.png') }); }
    const info = await p.evaluate(() => ({ fin: G.cars.filter(c => c.fin).length, n: G.cars.length, inv: checkInvariants(G) }));
    const ok = done && blocked === 0 && !errs.length && info.fin === info.n && !info.inv.length;
    console.log(n, ok ? 'PASS' : 'FAIL', 'rounds', rounds, 'result', done, 'finished', info.fin + '/' + info.n, 'blocked', blocked, 'errs', errs.slice(0, 2).join('|'), info.inv.join(','));
    if (!ok) fail = 1; await c.close();
  }
  await b.close(); process.exit(fail);
})();
