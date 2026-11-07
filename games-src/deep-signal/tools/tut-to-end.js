// Tutorial to the end from fresh storage, by tapping the centre of each spotlit element (or Next on read steps).
// Checks elementFromPoint at each tap target's centre is the target (not covered). Usage: node tools/tut-to-end.js <url>
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const b = await chromium.launch(); let fails = 0;
  for (const [nm, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
    const tapAt = async (x, y) => touch ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
    const tapEl = async sel => { const bx = await p.locator(sel).first().boundingBox(); await tapAt(bx.x + bx.width / 2, bx.y + bx.height / 2); };
    await tapEl('[data-gxt-open]'); await p.waitForTimeout(600);
    let end = false, covered = [], seen = [], done = new Set();
    for (let i = 0; i < 400 && !end; i++) {
      await p.waitForTimeout(150);
      const st = await p.evaluate(() => { const s = GXT.state && GXT.state(); if (!s || !GXT.running()) return { off: 1 }; if (s.phase === 'end') return { end: 1 }; return { id: s.id, shown: s.shown, wait: s.wait, i: s.i }; });
      if (st.end) { end = true; break; } if (st.off) break; if (!st.shown) continue;
      const key = st.id + st.i; if (!seen.includes(st.id)) seen.push(st.id);
      if (st.wait === 'event') continue;
      if (!st.wait) { if (await p.locator('.gxt-next').count()) await tapEl('.gxt-next'); await p.waitForTimeout(300); continue; }
      if (done.has(key)) continue;
      const hit = await p.evaluate(() => { const t = GXT.current().target(); if (!t) return null; const r = t.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y); return { x, y, ok: !!e && (e === t || t.contains(e)), top: e ? (e.id || e.className) : '' }; });
      if (!hit) continue; if (!hit.ok) covered.push(st.id + ' covered by ' + hit.top);
      await tapAt(hit.x, hit.y); done.add(key); await p.waitForTimeout(400);
    }
    await p.waitForTimeout(500); await p.screenshot({ path: (process.env.SHOTS || '.') + `/tut-end-${nm}.png` });
    const ok = end && !covered.length && !errs.length && seen.length >= 5;
    console.log(nm, ok ? 'TUTORIAL PASS' : 'TUTORIAL FAIL', 'steps seen', seen.join(','), covered.length ? 'covered: ' + covered.join('; ') : '', errs.length ? 'errors: ' + errs[0] : '');
    if (!ok) fails++;
    // the end card leads into a real game
    if (end) { const btn = p.locator('.gxt-endc button, .gxt-end button, .gxt-dlg button').first(); if (await btn.count()) { await btn.click(); await p.waitForTimeout(600); const into = await p.evaluate(() => document.querySelector('#setup.on') ? 'setup' : document.querySelector('.gxc-map, .gxc') ? 'story' : 'other'); console.log(nm, 'end card ->', into); } }
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
