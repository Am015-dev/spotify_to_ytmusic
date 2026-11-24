// Full game by touch: node proof/full-game-touch.js  (W=402 H=874 default). Machine speed, real taps for take/buy/refill/prompts.
const { chromium } = require('playwright'); const path = require('path');
const W = +process.env.W || 402, H = +process.env.H || 874, PR = path.join(__dirname);
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 700 });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(__dirname, '..', 'onyx-atelier.html')); await p.waitForTimeout(500);
  await p.evaluate(() => { window.AIDELAY = 0; OA_TEST.newGame('normal', 11, 0); });
  const tap = async sel => { const e = await p.$(sel); if (!e) return false; await e.scrollIntoViewIfNeeded().catch(() => { }); await e.tap({ timeout: 2000 }).catch(() => { }); return true; };
  let k = 0, taps = 0, shots = 0;
  while (k++ < 900) {
    const st = await p.evaluate(() => { const g = OA_TEST.U.G; return { over: !!g.over, mine: g.turn === 0 && !OA_TEST.U.busy, pend: g.pend && g.pend.h, sheet: !!document.querySelector('#sheet,.modal') }; });
    if (st.over) break;
    if (!st.mine) { await p.waitForTimeout(30); continue; }
    if (st.sheet) { const pr = await p.$('.modal [data-pick]'); if (pr) { await pr.tap(); continue; } await tap('[data-close]'); continue; }
    const m = await p.evaluate(() => { const g = OA_TEST.U.G; const q = g.pend; const v = OA_TEST.E.validMoves(g); if (q) return { pend: q.h, mv: v[Math.floor(Math.random() * v.length)] };
      const seq = OA_TEST.AI.pick(g, 'hard'); return { mv: seq[0] }; });
    const mv = m.mv; if (!mv) { await p.waitForTimeout(50); continue; }
    if (m.pend) {
      if (mv.t === 'disc' || mv.t === 'wild' || mv.t === 'steal') await tap('.col.glow[data-c="' + mv.c + '"]' + (mv.t === 'steal' ? '[data-p="1"]' : '[data-p="0"]'));
      else if (mv.t === 'tok') await p.evaluate(m => OA_TEST.act(m), mv); else await p.evaluate(m => OA_TEST.act(m), mv);
      taps++; await p.waitForTimeout(20); continue;
    }
    if (mv.t === 'take') { for (const i of mv.cells) await tap('.cell[data-cell="' + i + '"]'); await tap('#takebtn'); taps += mv.cells.length + 1; }
    else if (mv.t === 'refill') { await tap('#refillbtn'); taps++; }
    else if (mv.t === 'buy') { if (mv.res !== undefined) { await tap('#resbtn'); await tap('[data-r="' + mv.res + '"]'); } else await tap('.card[data-l="' + mv.l + '"][data-i="' + mv.i + '"]'); await tap('[data-buy]'); taps += 2; }
    else await p.evaluate(m => OA_TEST.act(m), mv);
    if (shots === 0 && k > 12) { await p.screenshot({ path: path.join(PR, 'mid-' + W + 'x' + H + '.png') }); shots++; }
    await p.waitForTimeout(20);
  }
  const r = await p.evaluate(() => { const g = OA_TEST.U.G; return { over: g.over, n: g.n, pts: [OA_TEST.pts[0], OA_TEST.pts[1]] }; });
  await p.waitForTimeout(400); await p.screenshot({ path: path.join(PR, 'end-' + W + 'x' + H + '.png') });
  console.log(W + 'x' + H, JSON.stringify(r), 'loops', k, 'errors', errs.length ? errs : 'none'); await b.close(); process.exit(r.over && !errs.length ? 0 : 1);
})();
