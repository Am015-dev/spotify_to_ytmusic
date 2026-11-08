// Real-touch test (owner verdict 8 Nov): 390x844 phone, page.touchscreen.tap at element centres only (no el.click()).
// Title -> Play -> Goal card -> 4 of my turns (tap a glowing thing, then its action button) -> Pass until result. Fails on a blocked tap or a page error.
// node touch-test.js   (python3 build.py first; W=375 H=667 for a small phone; FULL=1 plays every turn to the result)
const { chromium } = require('playwright'), serve = require('./serve.js');
(async () => {
  const S = await serve(), b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: +(process.env.W||390), height: +(process.env.H||844) }, hasTouch: true, isMobile: true });
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
  const want = process.env.FULL ? 999 : 4;
  for (let k = 0; k < 400 && !fail && turns < want; k++) {
    await p.waitForFunction(() => (window.G && myTurn()) || G.phase === 'over' || (document.querySelector('#fx') && !document.querySelector('#fx').hidden), null, { timeout: 60000 });
    if (await p.evaluate(() => G.phase === 'over')) break;
    if (await p.evaluate(() => !document.querySelector('#fx').hidden)) { const f = await p.evaluate(() => { const q = document.querySelector('#fx').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); await p.touchscreen.tap(f.x, f.y); await p.waitForTimeout(500); continue; }
    const t0 = await p.evaluate(() => G.turns || 0);
    if (await p.locator('#qbox:not([hidden]) .btn').count()) { fail = await tapSel('#qbox .btn:not([disabled])'); continue; }
    const tab = await p.evaluate(() => { const t = [...document.querySelectorAll('#vtabs .has')][0]; return t && !t.classList.contains('on') ? t.dataset.t : ''; });
    if (tab) { fail = await tapSel(`#vtabs [data-t="${tab}"]`); if (fail) break; }
    /* W477 flow: tap a glowing site / card / the track (it lifts), then the one Go button; nothing glows = Pass */
    const pick = await p.evaluate(() => ['.site.glow', '#hand .cd.glow', '#row .cd.glow', '#track.glow'].find(s => document.querySelector(s)) || '');
    if (!pick) { fail = await tapSel('#passbtn'); await p.waitForTimeout(600); if ((await p.evaluate(() => G.turns || 0)) > t0) turns++; continue; }
    fail = await tapSel(pick); if (fail) break;
    if (await p.locator('#gobtn').count()) fail = await tapSel('#gobtn'); else if (await p.locator('#qbox:not([hidden]) .btn.go').count()) fail = await tapSel('#qbox .btn.go'); else fail = await tapSel('#passbtn');
    if (fail) break;
    if (await p.locator('#qbox:not([hidden]) .btn').count()) fail = await tapSel('#qbox .btn:not([disabled])');
    await p.waitForTimeout(600); if ((await p.evaluate(() => G.turns || 0)) > t0) turns++;
  }
  console.log((fail || errs.length || turns < Math.min(want, 4) ? 'FAIL' : 'PASS') + ' touch ' + (process.env.W || 390) + 'x' + (process.env.H || 844) + (process.env.FULL ? ' full game to ' + (await p.evaluate(() => G.phase)) : '') + ': ' + turns + ' turns by touchscreen.tap' + (fail ? ', ' + fail : '') + (errs.length ? ', error ' + errs[0] : ''));
  await b.close(); S.close();
})();
