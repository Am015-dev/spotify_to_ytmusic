// Plays whole games through the page with real touch taps (the human seat follows the Easy computer's pick).
// node tap-play.js [games=1] [--video dir] [--fast] [--secs N]
const { chromium } = require('playwright'); const path = require('path');
const args = process.argv.slice(2), N = +(args.find(a => /^\d+$/.test(a)) || 1), fast = args.includes('--fast');
const vi = args.indexOf('--video'), vdir = vi >= 0 ? args[vi + 1] : null; const si = args.indexOf('--secs'), secs = si >= 0 ? +args[si + 1] : 1e9;
const URL = process.env.VS_URL || 'file://' + path.resolve(__dirname, 'vellum-shire.html');
(async () => {
  const b = await chromium.launch(); let fails = 0;
  for (let g = 0; g < N; g++) {
    const ctx = await b.newContext({ viewport: { width: 375, height: +process.env.VS_H || 667 }, hasTouch: true, isMobile: true, deviceScaleFactor: vdir ? 2 : 1, recordVideo: vdir ? { dir: vdir, size: { width: 375, height: 667 } } : undefined });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(URL); await p.waitForTimeout(800);
    if (fast) await p.evaluate(() => { window.ANIM = false; window.AIDELAY = 30; });
    await p.tap('[data-s="vs"]'); await p.waitForTimeout(800);
    if (fast) await p.evaluate(() => { window.ANIM = false; window.AIDELAY = 30; });
    await p.evaluate(() => { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } });
    const t0 = Date.now(); let taps = 0, stuck = 0, last = '';
    while (Date.now() - t0 < secs * 1000) {
      const st = await p.evaluate(() => ({ over: G.over, me: VSE.side(G) === 0 && !UI.busy, key: JSON.stringify([G.ph, G.rd, G.ti, G.p[0].used, G.p[1].used, G.pend.length, G.p[0].vp, G.p[1].vp, UI.busy, !!UI.sel, !!UI.disc]) }));
      if (st.over) break;
      if (st.key === last) { if (++stuck > (fast ? 400 : 120)) { errs.push('stuck ' + st.key); break; } } else stuck = 0; last = st.key;
      if (!st.me) { await p.waitForTimeout(fast ? 20 : 150); continue; }
      const plan = await p.evaluate(() => {
        if (UI.disc) { return { sel: '[data-sto="' + UI.disc[0].disc + '"]' }; }
        if (UI.sel) { return { sel: '[data-a="opt"][data-i="0"]' }; }
        if (G.pick) { const mm = VSAI.pick(G, 'easy'); return { sel: '[data-h="' + mm.h + '"]' }; }
        const m = VSAI.pick(G, 'easy'); window.__m = m;
        if (m.t === 'end' || m.t === 'skip') return { sel: '[data-a="' + m.t + '"]' };
        const e = moveTarget(m); if (!e) return { err: 'no target ' + JSON.stringify(m) };
        if (m.t === 'place') return { sel: '[data-h="' + m.h + '"]' };
        if (m.t === 'take' || m.t === 'buy' || m.t === 'grab') return { sel: '[data-tile="' + m.tile + '"]' };
        if (m.t === 'sell') return { sel: '[data-goods="' + m.v + '"]' };
        if (m.t === 'work') return { sel: '[data-work]' };
        if (m.t === 'ship') return { sel: '[data-ship="' + m.st + '"]' };
        return { err: 'unknown ' + m.t };
      });
      if (plan.err) { errs.push(plan.err); break; }
      const el = await p.$(plan.sel);
      if (!el) { await p.waitForTimeout(100); continue; }
      const bx = await el.boundingBox(); if (!bx) { await p.waitForTimeout(100); continue; }
      await p.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); taps++;
      await p.waitForTimeout(fast ? 15 : 420);
    }
    if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT });
    const r = await p.evaluate(() => ({ over: G.over, f: G.final && G.final.map(f => f.total), inv: VSE.checkInvariants(G), ph: G.ph, rd: G.rd }));
    console.log('game', g, JSON.stringify(r), 'taps', taps, 'secs', ((Date.now() - t0) / 1000).toFixed(0), errs.length ? 'ERR ' + errs.slice(0, 4).join(' | ') : 'ok');
    if (errs.length || r.inv.length || (!r.over && secs > 1e8)) fails++;
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
