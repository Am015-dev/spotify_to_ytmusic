// Walks the tutorial with real taps at a phone size: node tut-walk.js [w h] [shotdir]
const { chromium } = require('playwright'); const path = require('path');
const W = +process.argv[2] || 375, H = +process.argv[3] || 667, SH = process.argv[4];
const URL = process.env.VS_URL || 'file://' + path.resolve(__dirname, 'vellum-shire.html');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(700);
  await p.tap('[data-gxt-open]'); await p.waitForTimeout(1500);
  const seen = []; let last = '', same = 0, ended = false;
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => { const c = GXT.current(); const end = document.querySelector('[data-gxt-end]');
      if (end && end.getBoundingClientRect().width) return { end: true };
      if (!c) return { none: true };
      const t = typeof c.target === 'function' ? c.target() : null; const r = t && t.getBoundingClientRect ? t.getBoundingClientRect() : null;
      const nx = document.querySelector('.gxt-next'); const nr = nx && nx.getBoundingClientRect();
      return { id: c.id, wait: !!c.wait, ph: GXT.state && GXT.state() && GXT.state().phase, r: r && { x: r.left + r.width / 2, y: r.top + r.height / 2 }, next: nr && nr.width ? { x: nr.left + nr.width / 2, y: nr.top + nr.height / 2 } : null }; });
    if (st.end) { ended = true; break; }
    if (st.none) { await p.waitForTimeout(200); continue; }
    if (st.id !== last) { seen.push(st.id); last = st.id; same = 0; if (SH) await p.screenshot({ path: `${SH}/tut-${seen.length}-${st.id}.png` }); } else if (++same > 40) { errs.push('stuck at ' + st.id + ' ' + JSON.stringify(st)); break; }
    await p.waitForTimeout(500);
    if (!st.wait && st.next) await p.touchscreen.tap(st.next.x, st.next.y);
    else if (st.wait && st.r) await p.touchscreen.tap(st.r.x, st.r.y);
    await p.waitForTimeout(300);
  }
  console.log(W + 'x' + H, 'steps', seen.length, seen.join(' '), ended ? 'END CARD' : 'NO END', errs.length ? 'ERR ' + errs.join(' | ') : 'ok');
  await b.close(); process.exit(ended && !errs.length ? 0 : 1);
})();
