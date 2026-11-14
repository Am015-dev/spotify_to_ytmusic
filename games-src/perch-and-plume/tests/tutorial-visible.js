// Every tutorial step's target must be fully visible and tappable WITHOUT this test scrolling anything (elementFromPoint at the target
// centre is the target), then is tapped by real touch (no drags). Reports ignored taps. node tests/tutorial-visible.js [w] [h] [url]
const { chromium } = require('playwright');
const W = +process.argv[2] || 390, H = +process.argv[3] || 844, URL = process.argv[4] || 'http://127.0.0.1:8765/perch-and-plume/';
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(900); await (await p.$('[data-gxt-open]')).tap();
  let bad = [], ignored = [], taps = 0, steps = [], idle = Date.now(), last = null;
  while (Date.now() - idle < 25000) {
    const st = await p.evaluate(() => { if (typeof UI === 'undefined' || !G) return { w: 1 }; if (UI.mode !== 'tutfree') return { mode: UI.mode }; const b = document.querySelector('.coachb'); return { step: GXCOACH.step, bub: b && b.dataset.rule, n: document.querySelectorAll('.tutpoint').length }; }).catch(() => ({ w: 1 }));
    if (st.mode) break;
    if (st.w || !st.bub || st.bub !== st.step || !st.n) { await p.waitForTimeout(200); continue; }
    await p.waitForTimeout(500);
    const g = await p.evaluate(() => { const e = document.querySelector('.tutpoint'); if (!e) return null; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + Math.min(r.height / 2, 30); const t = document.elementFromPoint(x, y); const d = document.querySelector('.gx-dock-body,#dockbody'); const dr = e.closest('#dockbody') ? e.closest('#dockbody').getBoundingClientRect() : null; return { step: GXCOACH.step, x, y, top: t && (t === e || e.contains(t)), full: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, inpanel: !dr || (r.top >= dr.top - 1 && r.bottom <= dr.bottom + 1), sig: GXCOACH.step + JSON.stringify([G.q, G.pl.map(z => [z.food, z.hand, z.cubes])]) + UI.sel + UI.pend + UI.pickBird, b: Math.round(r.height) }; }).catch(() => null);
    if (!g) continue;
    if (g.step !== last) { last = g.step; steps.push(g.step); if (!(g.top && g.full && g.inpanel)) bad.push(g.step + ' ' + JSON.stringify(g)); }
    if (!g.top) { await p.waitForTimeout(300); continue; }
    await p.touchscreen.tap(g.x, g.y); taps++; idle = Date.now(); await p.waitForTimeout(450);
    const s2 = await p.evaluate(() => GXCOACH.step + JSON.stringify([G.q, G.pl.map(z => [z.food, z.hand, z.cubes])]) + UI.sel + UI.pend + UI.pickBird).catch(() => 'nav');
    if (s2 === g.sig) { await p.waitForTimeout(700); const s3 = await p.evaluate(() => GXCOACH.step + JSON.stringify([G.q, G.pl.map(z => [z.food, z.hand, z.cubes])]) + UI.sel + UI.pend + UI.pickBird).catch(() => 'nav'); if (s3 === g.sig) ignored.push(g.step); }
  }
  const mode = await p.evaluate(() => UI.mode);
  console.log(`${W}x${H}: steps ${steps.length}, taps ${taps}, ignored ${ignored.length} ${ignored}, not-visible/tappable [${bad.join(' | ')}], end mode ${mode}, errors ${errs.length}`);
  process.exitCode = bad.length || ignored.length || errs.length || steps.length < 19 || mode === 'tutfree' ? 1 : 0; await b.close();
})();
