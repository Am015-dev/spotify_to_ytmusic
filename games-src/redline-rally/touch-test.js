/* Real touch on a 390x844 phone: page.touchscreen.tap only (no el.click). Title -> Play -> Goal card -> pick cards -> Go, 3 rounds, then a Hints toggle check.
   Usage: PW=../node_modules/playwright node touch-test.js */
const path = require('path'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html') }), b = await chromium.launch({ args: ['--no-sandbox'] });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }), p = await c.newPage(), errs = []; let fails = 0, blocked = 0;
  p.on('pageerror', e => errs.push(String(e)));
  await p.addInitScript(() => { localStorage.setItem('gxt-redline-rally', JSON.stringify({ done: 1 })); localStorage.setItem('rr_seen', '1'); localStorage.setItem('rr_hints', '0'); });
  await p.goto(url, { waitUntil: 'load' }); await p.evaluate(() => { window.AIDELAY = 0.15; });
  const ok = (v, m) => { console.log((v ? 'PASS ' : 'FAIL ') + m); if (!v) fails++; };
  const tap = async sel => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length || e.disabled) return null; const q = e.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, h = document.elementFromPoint(x, y); return { x, y, hit: !!h && (h === e || e.contains(h)) }; }, sel); if (!r) return false; if (!r.hit) { blocked++; return false; } await p.touchscreen.tap(r.x, r.y); await p.waitForTimeout(120); return true; };
  ok(await tap('#playB'), 'touch Play on the title'); await p.waitForTimeout(400);
  ok(await tap('#goalB'), 'touch Start on the Goal card'); await p.waitForSelector('#goB');
  for (let r = 0; r < 3; r++) {
    await p.waitForFunction(() => document.querySelector('#goB') && !UI.busy, null, { timeout: 60000 });
    for (let i = 0; i < 4 && await p.evaluate(() => document.querySelector('#goB').disabled); i++) await tap('#hand .cd.glow');
    const round = await p.evaluate(() => G.round); ok(await tap('#goB'), 'round ' + round + ': cards and Go by touch');
    for (let t = 0; t < 400; t++) { if (await p.locator('#slipN').count()) await tap('#slipN'); if (await p.locator('#boostN').count()) await tap('#boostN'); if (await p.locator('#discN').count()) await tap('#discN'); if (await p.evaluate(r0 => G.round > r0 && !UI.busy && !!document.querySelector('#goB'), round)) break; await p.waitForTimeout(100); }
  }
  ok(await tap('#hintT'), 'touch the Hints toggle'); ok(await p.evaluate(() => !!document.querySelector('#sugB') && !document.getElementById('bulbbtn').hidden), 'Hints on shows Suggest and the bulb');
  ok(blocked === 0, 'no touch landed on a covering element (' + blocked + ')'); ok(errs.length === 0, '0 page errors ' + errs.slice(0, 1).join(''));
  await b.close(); process.exit(fails ? 1 : 0);
})();
