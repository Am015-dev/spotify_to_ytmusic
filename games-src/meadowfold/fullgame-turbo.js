// Full game at machine speed (turbo.js), 402x874 and 1366x768: Play now, the human seat plays greedy legal moves by tapping the real UI
// (pockets, card strip + Take, tokens, hexes, End turn); the computer plays itself. Gate: game over, < 60 s each, 0 JS errors. node fullgame-turbo.js
const { chromium } = require('playwright'); const path = require('path'); const { turbo, budget, tick } = require('../scripts/turbo');
async function run(W, H) {
  const t0 = Date.now(), stop = budget(60000, 'meadowfold full game ' + W), touch = W < 600, b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch }); await turbo(c);
  const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  const tap = async s => { const e = await p.$(s); if (!e) return false; touch ? await e.tap() : await e.click(); return true; };
  await p.goto('file://' + path.join(__dirname, 'meadowfold.html')); await tick(p, 300);
  await p.evaluate(() => { const b = [...document.querySelectorAll('#start button')].find(x => /Play now/.test(x.textContent)); b.click(); }); await tick(p, 300);
  let taps = 0, cardsTaken = 0;
  for (let n = 0; n < 900; n++) {
    const s = await p.evaluate(() => ({ over: G.over, mine: myTurn(), took: G.turn.took, hand: G.turn.hand.length, tookCard: G.turn.tookCard, ms: E.moves().map(m => m.t) }));
    if (s.over) break;
    if (!s.mine) { await tick(p, 500); continue; }
    if (s.took < 0) { await tap('.pocket.glow'); taps++; continue; }
    if (!s.tookCard && s.ms.includes('card') && cardsTaken < 6 && await p.$('#strip .acard.playable')) { await tap('#strip .acard.playable'); await tick(p, 50); if (await tap('#takeB')) cardsTaken++; else await p.evaluate(() => GX.close()); taps++; continue; }
    if (s.hand) { await tap('.htok'); await tap('#map .hx.glow'); taps++; continue; }
    if (s.ms.includes('cube') && await p.$('#strip .acard.ready')) { await tap('#strip .acard.ready'); await tap('#map .hx.glow'); taps++; continue; }
    await tap('#endB'); taps++; await tick(p, 50);
  }
  const r = await p.evaluate(() => ({ over: G.over, sc: G.seats.map(s => E.score(s).total) }));
  await b.close(); stop(); const sec = ((Date.now() - t0) / 1000).toFixed(1);
  const ok = r.over && !errs.length && sec < 60;
  console.log((ok ? 'PASS ' : 'FAIL ') + W + 'x' + H + ': over=' + r.over + ' scores=' + r.sc.join('/') + ' taps=' + taps + ' cards=' + cardsTaken + ' ' + sec + ' s, js errors ' + errs.length + (errs.length ? ' ' + errs.slice(0, 2).join(' | ') : ''));
  return ok;
}
(async () => { const a = await run(402, 874), b = await run(1366, 768); process.exit(a && b ? 0 : 1); })();
