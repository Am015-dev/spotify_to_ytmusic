// Real-touch test (owner verdict 8 Nov): 390x844 phone, page.touchscreen.tap at element centres only (no el.click()).
// Title -> Play -> Goal card -> 4 of my turns (tap a glowing thing, then its action button) -> Pass until result. Fails on a blocked tap or a page error.
// node touch-test.js   (python3 build.py first)
const { chromium } = require('playwright'), serve = require('./serve.js');
(async () => {
  const S = await serve(), b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('vinegrave-prefs', JSON.stringify({ played: true })); localStorage.setItem('gxt-vinegrave', JSON.stringify({ done: true })); } catch (e) { } });
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e)));
  const tapSel = async (sel, nth) => {   // tap the centre; the element under that point must be the target (or inside it)
    const r = await p.evaluate(([s, n]) => { const e = [...document.querySelectorAll(s)].filter(x => { const q = x.getBoundingClientRect(); return q.width > 0 && q.height > 0; })[n || 0]; if (!e) return null; const q = e.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, top = document.elementFromPoint(x, y); return { x, y, ok: !!top && (top === e || e.contains(top)) }; }, [sel, nth]);
    if (!r) return 'missing ' + sel; if (!r.ok) return 'covered ' + sel; await p.touchscreen.tap(r.x, r.y); await p.waitForTimeout(450); return '';
  };
  let fail = '';
  await p.goto(S.url); await p.waitForSelector('#start .tbtn');
  fail = fail || await tapSel('#start .tbtn'); fail = fail || await tapSel('#goal .tbtn');
  let turns = 0;
  for (let k = 0; k < 60 && !fail && turns < 4; k++) {
    await p.waitForFunction(() => (window.G && myTurn()) || G.phase === 'over', null, { timeout: 30000 });
    const t0 = await p.evaluate(() => G.turns || 0);
    if (await p.locator('#qbox:not([hidden]) .btn').count()) { fail = await tapSel('#qbox .btn'); continue; }
    const tab = await p.evaluate(() => { const t = [...document.querySelectorAll('#vtabs .has')][0]; return t && !t.classList.contains('on') ? t.dataset.t : ''; });
    if (tab) { fail = await tapSel(`#vtabs [data-t="${tab}"]`); if (fail) break; }
    fail = await tapSel('.glow'); if (fail) break;
    fail = await tapSel('#insp .btn.go'); if (fail) break;
    if (await p.locator('#qbox:not([hidden]) .btn').count()) fail = await tapSel('#qbox .btn');
    await p.waitForTimeout(600); if ((await p.evaluate(() => G.turns || 0)) > t0) turns++;
  }
  console.log((fail || errs.length || turns < 4 ? 'FAIL' : 'PASS') + ' touch 390x844: ' + turns + ' turns by touchscreen.tap' + (fail ? ', ' + fail : '') + (errs.length ? ', error ' + errs[0] : ''));
  await b.close(); S.close();
})();
