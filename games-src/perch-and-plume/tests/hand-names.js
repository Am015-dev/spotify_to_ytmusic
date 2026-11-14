// Hand names (R12 row 5): every bird's name in the compact phone hand strip is shown whole: no clipped or ellipsed word,
// no line past the card. Renders all birds through the real hand at 390x844 and 375x667.   node tests/hand-names.js [url]
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://127.0.0.1:8765/perch-and-plume/';
(async () => {
  const b = await chromium.launch(); let fails = 0; const errs = [];
  const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
  for (const [w, h] of [[390, 844], [375, 667]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(() => { try { localStorage.setItem('gns-prefs', JSON.stringify({ ai: 'fast' })); localStorage.setItem('pp-played', '1'); } catch (e) { } });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL); await p.waitForTimeout(800);
    for (const s of ['[data-t="quick"]', '[data-go]', '#keepgo']) { await p.locator(s).first().waitFor({ timeout: 10000 }); await p.locator(s).first().tap(); await p.waitForTimeout(500); }
    await p.waitForFunction(() => typeof myTurn === 'function' && myTurn(), null, { timeout: 20000 });
    const bad = await p.evaluate(() => {
      const ids = Object.keys(B), out = [], keep = G.pl[UI.view].hand.slice();
      for (let k = 0; k < ids.length; k += 8) {
        G.pl[UI.view].hand = ids.slice(k, k + 8); UI.sel = null; render();
        document.querySelectorAll('#hand .bc.big').forEach(c => {
          const n = c.querySelector('.bk-nm'), r = n.getBoundingClientRect(), cr = c.getBoundingClientRect(), v = c.querySelector('.vpb').getBoundingClientRect();
          const overlap = !(v.right <= r.left || v.left >= r.right || v.bottom <= r.top || v.top >= r.bottom);
          if (n.scrollWidth > n.clientWidth + 1 || n.scrollHeight > n.clientHeight + 1 || r.bottom > cr.bottom || r.right > cr.right + 1 || overlap || n.getClientRects().length && Math.round(r.height / parseFloat(getComputedStyle(n).lineHeight)) > 2)
            out.push(n.textContent + ' (' + Math.round(r.width) + 'x' + Math.round(r.height) + (overlap ? ', under points' : '') + ')');
        });
      }
      G.pl[UI.view].hand = keep; render(); return out;
    });
    ok(bad.length === 0, `${w}x${h} every hand name whole, at most 2 lines (${bad.length} cut${bad.length ? ': ' + bad.slice(0, 4).join(', ') : ''})`);
    await ctx.close();
  }
  ok(errs.length === 0, 'page errors ' + errs.length + ' ' + errs.slice(0, 2).join(' | '));
  await b.close(); process.exit(fails ? 1 : 0);
})();
