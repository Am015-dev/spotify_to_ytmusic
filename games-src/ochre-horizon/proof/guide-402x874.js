// Plays Ochre Horizon's guided first game ONLY by tapping the glowing target (position read from the DOM).
// At every step: the instruction bubble must be within 120 px of the target and must not overlap it.
// Usage: node guide-402x874.js [mode: touch|pc] [outDir] [gens]
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const mode = process.argv[2] || 'touch', out = process.argv[3] || __dirname, GENS = +process.argv[4] || 3;
(async () => {
  const b = await chromium.launch(); const touch = mode === 'touch';
  const vp = touch ? { width: 402, height: 874 } : { width: 1366, height: 768 };
  const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1, recordVideo: { dir: out + '/vid', size: vp } });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '../game/ochre-horizon.html') + '?fast=1'); await pg.waitForTimeout(500);
  await pg.evaluate(() => startGame({ level: 'easy', tut: true })); await pg.waitForTimeout(800);
  const fails = [], steps = []; let n = 0, stuck = 0;
  const geom = () => pg.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; };
    const els = [...document.querySelectorAll('.gd-glow')].filter(vis); const bub = document.getElementById('gdB');
    if (!els.length || !bub.classList.contains('on')) return null;
    const bb = bub.getBoundingClientRect(), box = r => ({ l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height });
    const e = els[0], r = e.getBoundingClientRect(), B = box(bb);
    const gap = (A, C) => Math.max(C.l - A.r, A.l - C.r, C.t - A.b, A.t - C.b, 0);
    const over = (A, C) => Math.min(A.r, C.r) > Math.max(A.l, C.l) && Math.min(A.b, C.b) > Math.max(A.t, C.t);
    const tb = els.map(x => box(x.getBoundingClientRect()));
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, text: document.getElementById('gdT').textContent, side: bub.dataset.side,
      gap: Math.round(Math.min(...tb.map(t => gap(B, t)))), overlap: tb.some(t => over(B, t)), onscreen: B.l >= 0 && B.t >= 0 && B.r <= innerWidth && B.b <= innerHeight,
      banner: document.getElementById('guide').getBoundingClientRect().height, hit: (() => { const h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return !!h && (e === h || e.contains(h) || h.contains(e)); })() };
  });
  for (let i = 0; i < 500; i++) {
    const st = await pg.evaluate(() => ({ gen: OH.G.gen, over: OH.G.over, side: OH.sideToAct(), busy: UI.busy }));
    if (st.over || st.gen >= GENS) break;
    if (st.side === 1 || st.busy) { await pg.waitForTimeout(150); continue; }
    await pg.waitForTimeout(220);   // let the bubble settle
    const g = await geom();
    if (!g) { if (++stuck > 25) { fails.push('STUCK: no glowing target + bubble'); break; } await pg.waitForTimeout(200); continue; }
    stuck = 0; n++;
    const why = [];
    if (g.gap > 120) why.push('gap ' + g.gap); if (g.overlap) why.push('overlaps target'); if (!g.onscreen) why.push('bubble off screen');
    if (!g.hit) why.push('target covered'); if (g.w < 44 || g.h < 44) why.push(`target small ${Math.round(g.w)}x${Math.round(g.h)}`);
    if (why.length) fails.push(`step ${n} "${g.text}": ${why.join(', ')}`);
    steps.push(`${n}. ${g.text} [${g.side}, gap ${g.gap}px]`);
    if (process.env.SHOTS && [1, 2, 3, 9, 14].includes(n)) await pg.screenshot({ path: `${out}/${mode}-step${n}.png` });
    if (touch) await pg.touchscreen.tap(g.x, g.y); else await pg.mouse.click(g.x, g.y);
    await pg.waitForTimeout(300);
  }
  const fin = await pg.evaluate(() => ({ gen: OH.G.gen, over: OH.G.over }));
  await pg.waitForTimeout(600); const vid = pg.video(); await ctx.close();
  if (vid) { fs.copyFileSync(await vid.path(), `${out}/guide-${mode === 'touch' ? '402x874' : '1366x768'}.webm`); fs.rmSync(out + '/vid', { recursive: true, force: true }); }
  console.log(steps.join('\n')); console.log(mode, 'steps', n, 'final', JSON.stringify(fin), 'pageerrors', errs.length, 'FAILS', fails.length); fails.forEach(f => console.log('  ' + f));
  await b.close(); process.exit(fails.length || errs.length || n < 10 ? 1 : 0);
})();
