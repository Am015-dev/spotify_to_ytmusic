/* Hint agreement gate: for 12 rounds the Hint bubble names a gear, the gear button it rings has that same number, and Suggest then selects that gear.  Usage: node hint-test.js */
const path = require('path'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html') }), b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await (await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true })).newPage(); const bad = [];
  await p.goto(url + (url.includes('?') ? '&' : '?') + 'seed=3'); await p.evaluate(() => { localStorage.setItem('gxt-redline-rally', JSON.stringify({ done: 1 })); localStorage.setItem('rr_seen', '1'); }); await p.reload(); await p.waitForTimeout(600);
  await p.tap('#playB'); await p.waitForTimeout(800); if (await p.$('#goalB')) await p.tap('#goalB');
  for (let r = 0; r < 12; r++) {
    await p.waitForFunction(() => window.G && G.phase === 'plan' && !UI.busy && document.querySelector('#goB') && !document.querySelector('#modal:not([hidden])'), null, { timeout: 60000 }).catch(() => {});
    if (await p.evaluate(() => G.over)) break;
    await p.tap('#bulbbtn'); await p.waitForTimeout(500);
    const r1 = await p.evaluate(() => { const t = (document.querySelector('.gxh-bub .gxh-tx') || {}).textContent || '', m = /gear (\d)/.exec(t); return { t, g: m && +m[1] }; });
    const ringG = await p.evaluate(() => { const rg = document.querySelector('.gxh-ring'); if (!rg) return null; const q = rg.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, e = [...document.querySelectorAll('.gb')].find(g => { const w = g.getBoundingClientRect(); return x >= w.left && x <= w.right && y >= w.top && y <= w.bottom; }); return e ? +e.dataset.g : 0; });
    const planG = await p.evaluate(() => planOnce().gear);
    await p.evaluate(() => { const x = document.querySelector('.gxh-bub .gxh-x'); if (x) x.click(); });
    await p.tap('#sugB'); await p.waitForTimeout(150); const ui = await p.evaluate(() => UI.gear);
    if (r1.g !== planG || ui !== planG || ringG !== planG) bad.push(`round ${r}: text ${r1.g} ring ${ringG} plan ${planG} suggest ${ui} :: ${r1.t.slice(0, 60)}`);
    if (r1.g == null) bad.push(`round ${r}: no gear in hint text`);
    await p.tap('#goB'); await p.waitForTimeout(300);
    for (let k = 0; k < 200 && !(await p.evaluate(() => G.over || (G.phase === 'plan' && !UI.busy && !!document.querySelector('#goB')))); k++) { await p.evaluate(() => { const q = document.querySelector('#boostN,#slipY,#discN'); if (q) q.click(); }); await p.waitForTimeout(200); }
  }
  console.log(bad.length ? 'FAIL\n' + bad.join('\n') : 'PASS hint text, ring and Suggest agree'); await b.close(); process.exit(bad.length ? 1 : 0);
})();
