// Proof video + screenshots: the first 3 minutes at 375x667 (title -> tutorial -> real game), real touch taps.
// node proof.js [outdir=proof]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const OUT = path.resolve(process.argv[2] || path.join(__dirname, 'proof')); fs.mkdirSync(OUT, { recursive: true });
const URL = process.env.VS_URL || 'file://' + path.resolve(__dirname, 'vellum-shire.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, recordVideo: { dir: OUT, size: { width: 375, height: 667 } } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const T0 = Date.now(); const shot = n => p.screenshot({ path: path.join(OUT, n) });
  const tapSel = async sel => { const e = await p.$(sel); if (!e) return false; const bx = await e.boundingBox(); if (!bx) return false; await p.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); return true; };
  await p.goto(URL); await sleep(2500); await shot('1-title.png');
  await tapSel('[data-gxt-open]'); await sleep(1800);
  let last = '', n = 0;
  while (Date.now() - T0 < 120000) {
    const st = await p.evaluate(() => { const c = GXT.current(); const end = document.querySelector('[data-gxt-end]'); if (end && end.getBoundingClientRect().width) return { end: true };
      if (!c) return { none: true }; const t = typeof c.target === 'function' ? c.target() : null; const r = t && t.getBoundingClientRect ? t.getBoundingClientRect() : null;
      const nx = document.querySelector('.gxt-next'); const nr = nx && nx.getBoundingClientRect();
      return { id: c.id, wait: !!c.wait, r: r && { x: r.left + r.width / 2, y: r.top + r.height / 2 }, next: nr && nr.width ? { x: nr.left + nr.width / 2, y: nr.top + nr.height / 2 } : null }; });
    if (st.end) break; if (st.none) { await sleep(300); continue; }
    if (st.id !== last) { last = st.id; n++; await sleep(1700); if (st.id === 'place') await shot('2-tutorial.png'); }
    if (!st.wait && st.next) await p.touchscreen.tap(st.next.x, st.next.y); else if (st.wait && st.r) await p.touchscreen.tap(st.r.x, st.r.y);
    await sleep(600);
  }
  await sleep(1500);
  await tapSel('[data-gxt-end="play"]') || await tapSel('[data-gxt-end]'); await sleep(1500);
  await p.evaluate(() => { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } });
  let shots = 0, lastKey = '';
  while (Date.now() - T0 < 182000) {
    const st = await p.evaluate(() => ({ over: G.over, me: VSE.side(G) === 0 && !UI.busy, sel: !!UI.sel }));
    if (st.over) break;
    if (!st.me) { await sleep(200); continue; }
    const plan = await p.evaluate(() => {
      if (UI.disc) return { sel: '[data-sto="' + UI.disc[0].disc + '"]' };
      if (UI.sel) return { sel: '[data-a="opt"][data-i="0"]', confirm: true };
      const m = VSAI.pick(G, 'normal');
      if (m.t === 'end' || m.t === 'skip') return { sel: '[data-a="' + m.t + '"]' };
      if (m.t === 'place') return { sel: '[data-h="' + m.h + '"]' };
      if (m.t === 'take' || m.t === 'buy' || m.t === 'grab') return { sel: '[data-tile="' + m.tile + '"]' };
      if (m.t === 'sell') return { sel: '[data-goods="' + m.v + '"]' };
      if (m.t === 'work') return { sel: '[data-work]' };
      if (m.t === 'ship') return { sel: '[data-ship="' + m.st + '"]' };
      return { sel: '[data-a="end"]' };
    });
    if (plan.confirm && shots < 1 && Date.now() - T0 > 135000) { await shot('3-choice.png'); shots++; }
    await sleep(plan.confirm ? 900 : 1100);
    await tapSel(plan.sel);
    await sleep(500);
  }
  await shot('4-later.png');
  const vid = await p.video().path(); await ctx.close(); await b.close();
  fs.renameSync(vid, path.join(OUT, 'first-3-minutes-375x667.webm'));
  console.log('proof done', ((Date.now() - T0) / 1000).toFixed(0) + 's', 'tutorial steps', n, errs.length ? 'ERR ' + errs.join(' | ') : 'no page errors');
})();
