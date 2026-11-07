// Drives the tutorial from fresh storage by tapping the centre of each spotlit element; asserts nothing covers it and it reaches
// the end card, then the end button starts a real game.  node tests/tutorial-end.js [phone|pc] [url]
const { chromium } = require('playwright');
const SIZE = process.argv[2] || 'phone', URL = process.argv[3] || 'http://127.0.0.1:8765/perch-and-plume/';
const VP = SIZE === 'pc' ? { width: 1440, height: 860 } : { width: 390, height: 763 }, TOUCH = SIZE !== 'pc';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: VP, hasTouch: TOUCH, isMobile: TOUCH });
  const p = await ctx.newPage(); const errs = []; let fails = 0;
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + SIZE + ' ' + m); };
  const tapXY = async (x, y) => TOUCH ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
  await p.goto(URL); await p.waitForTimeout(1000);
  const open = await p.$('[data-gxt-open]'); ok(!!open, 'tutorial button on the title (fresh storage)');
  const r0 = await open.boundingBox(); await tapXY(r0.x + r0.width / 2, r0.y + r0.height / 2);
  const done = new Set(); let n = 0, t0 = Date.now(), lastKey = '', taps = 0;
  while (Date.now() - t0 < 120000) {
    await p.waitForTimeout(250);
    const end = await p.$('.gxt-end .gxt-b.pri'); if (end && await end.isVisible()) break;
    const st = await p.evaluate(() => typeof GXT !== 'undefined' ? GXT.state() : { active: false });
    if (!st.active) continue; n = st.n;
    if (st.phase !== 'show' || !st.shown || !st.hole) continue;
    if (!st.wait) { ok(false, 'step ' + st.id + ' has no action (Next-only)'); const nx = await p.$('.gxt-next'); if (nx) await nx.click(); continue; }
    const key = st.id + ':' + st.count; if (key === lastKey) { if (++taps > 6) { ok(false, 'stuck at ' + key); break; } } else { lastKey = key; taps = 0; }
    const cx = st.hole.cx != null ? st.hole.cx : st.hole.left + st.hole.width / 2, cy = st.hole.cy != null ? st.hole.cy : st.hole.top + st.hole.height / 2;
    const hit = await p.evaluate(([x, y, h]) => { const e = document.elementFromPoint(x, y); if (!e) return 'nothing';
      if (e.closest('.gxt-bub,.gxt-top,.gxt-cell,.turnban,.reveal,#toast,.gxh-bub')) return 'covered by ' + (e.className || e.tagName);
      const r = e.getBoundingClientRect(); return (r.left >= h.left - 6 && r.top >= h.top - 6 && r.right <= h.left + h.width + 6 && r.bottom <= h.top + h.height + 6) ? 'ok' : 'outside ' + e.className; }, [cx, cy, st.hole]);
    if (!done.has(key)) { ok(hit === 'ok', `step ${st.i + 1}/${st.n} ${st.id} (${st.count + 1}/${st.times}) target uncovered: ${hit}`); done.add(key); }
    await tapXY(cx, cy); await p.waitForTimeout(400);
  }
  const end = await p.$('.gxt-end .gxt-b.pri'); ok(!!end && await end.isVisible(), `reached the end card (${n} steps, ${n >= 5 && n <= 8 ? '5-8' : 'NOT 5-8'})`);
  if (end) { await end.click(); await p.waitForTimeout(1200);
    const real = await p.evaluate(() => !!(G && UI.mode !== 'tutorial' && (G.phase === 'setup' || G.phase === 'play'))); ok(real, 'end button starts a real game'); }
  ok(errs.length === 0, 'console errors ' + errs.length + ' ' + errs.slice(0, 2).join(' | '));
  await b.close(); process.exit(fails ? 1 : 0);
})();
