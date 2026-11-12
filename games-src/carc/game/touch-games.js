// touch-games.js: full games vs the default rival (Easy) by touch only, played like a sensible new player.
// Each turn the player takes the normal computer's spot with chance GOOD (default .35), else a random glow at the shown angle;
// claims a road, town or priory about 60% of the time while 3+ followers are left, never a farmer. Taps only (no engine moves).
//   URL=http://localhost:8765/index.html SIZE=390x844 N=4 GOOD=.35 node touch-games.js
const PW = require('playwright'), path = require('path'), fs = require('fs');
const URL = process.env.URL || 'http://localhost:8765/index.html', [W, H] = (process.env.SIZE || '390x844').split('x').map(Number);
const N = +process.env.N || 4, GOOD = +(process.env.GOOD || .35), OUT = process.env.SHOTS || path.join(__dirname, 'sweep-shots');
const sleep = ms => new Promise(r => setTimeout(r, ms)); const errs = [];
async function tapSel(p, sel) {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); if (b.width < 6) return null;
    const x = b.left + b.width / 2, y = b.top + b.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return null; const t = document.elementFromPoint(x, y); return (t === e || e.contains(t)) ? { x, y } : null; }, sel);
  if (!r) return false; await p.touchscreen.tap(r.x, r.y); return true;
}
const mark = (p, q) => p.evaluate(q => { document.querySelectorAll('[data-tg]').forEach(x => x.removeAttribute('data-tg'));
  const e = [...document.querySelectorAll('.glow')].find(e => +e.dataset.x === q.x && +e.dataset.y === q.y); if (!e) return false; e.setAttribute('data-tg', '1'); return true; }, q);
(async () => {
  fs.mkdirSync(OUT, { recursive: true }); const b = await PW.chromium.launch({ executablePath: process.env.CHROME || undefined }); const res = [];
  for (let g = 0; g < N; g++) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(() => { try { localStorage.setItem('rv_seen', '1'); localStorage.setItem('gxt-rampart-and-vine', JSON.stringify({ done: true })); } catch (e) { } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('page ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/net::|favicon|Failed to load/.test(m.text())) errs.push('console ' + m.text().slice(0, 120)); });
    await p.goto(URL); await sleep(1200);
    await tapSel(p, '#modal [data-a=play]'); await sleep(500); await tapSel(p, '#modal [data-a=go]'); await sleep(600); await tapSel(p, '#goalok'); await sleep(300);
    const lv = await p.evaluate(() => G.pl[1].lv); const t0 = Date.now(); let overAt = 0, idle = 0, shotCap = false; const caps = new Set();
    while (Date.now() - t0 < 420000) {
      const s = await p.evaluate(() => ({ over: !!G.over, res: !!document.querySelector('.card[aria-label=Result]'), me: myTurn(), step: G.step, ins: (document.querySelector('#status .ins') || {}).textContent || '' }));
      if (/ placed a /.test(s.ins)) { caps.add(s.ins); if (!shotCap && /: \+/.test(s.ins)) { shotCap = true; await p.screenshot({ path: path.join(OUT, 'tg-' + W + '-caption.png') }); } }
      if (s.res) break;
      if (s.over) { if (!overAt) { overAt = Date.now(); await sleep(900); await p.screenshot({ path: path.join(OUT, 'tg-' + W + '-count.png') }); } await sleep(120); continue; }
      if (!s.me) { await sleep(150); continue; }
      if (s.step === 'place') {
        const pick = await p.evaluate(good => { const L = UI.legal; if (Math.random() < good) return aiPlan(G.cur.p, 'normal').place;
          const at = L.filter(q => q.r === UI.rot); return at[Math.floor(Math.random() * at.length)] || L[0]; }, GOOD);
        for (let k = 0; k < 4 && await p.evaluate(r => UI.rot !== r, pick.r); k++) { await tapSel(p, '#htile'); await sleep(220); }
        let ok = await mark(p, pick) && await tapSel(p, '[data-tg]');
        if (!ok) { await p.evaluate(() => refit(false)); await sleep(350); ok = await mark(p, pick) && await tapSel(p, '[data-tg]'); }
        if (!ok) { idle++; await sleep(200); continue; }
        await sleep(320); if (await tapSel(p, '#hplace')) await sleep(320); continue;
      }
      if (s.step === 'fig') {
        const sel = await p.evaluate(good => { document.querySelectorAll('[data-tg]').forEach(x => x.removeAttribute('data-tg')); const T = G.tiles[G.cur.k];
          const spots = (UI.figs || []).filter(b => b.isConnected && b._m.k === 'f' && TSEG[T.t][b._m.l].ty !== 'F');
          if (P(G.cur.p).sup.f < 3 || !spots.length || Math.random() > .6) return '#hskip';
          let b = null; if (Math.random() < good) { const m = bestFigNow(G.cur.p, 'normal'); b = spots.find(x => m.act === 'fig' && x._m.l === m.l); }
          b = b || spots[Math.floor(Math.random() * spots.length)]; b.setAttribute('data-tg', '1'); return '[data-tg]'; }, GOOD);
        if (!(await tapSel(p, sel)) && !(await tapSel(p, '#hskip'))) idle++;
        await sleep(320); continue;
      }
      await sleep(150); if (idle > 60) { errs.push('stuck'); break; }
    }
    const r = await p.evaluate(() => ({ sc: G.pl.map(p => p.score) }));
    const countMs = overAt ? Date.now() - overAt : -1; await sleep(600); await p.screenshot({ path: path.join(OUT, 'tg-' + W + '-result-' + g + '.png') });
    res.push({ g, lv, you: r.sc[0], rival: r.sc[1], secs: Math.round((Date.now() - t0) / 1000), countMs, caps: [...caps].slice(0, 3) }); console.log(JSON.stringify(res[res.length - 1]));
    await ctx.close();
  }
  await b.close(); const w = res.filter(r => r.you > r.rival).length + res.filter(r => r.you === r.rival).length / 2;
  console.log(W + 'x' + H + ' GOOD=' + GOOD + ': you won ' + w + '/' + res.length + '; errors ' + errs.length + (errs.length ? ' ' + errs.slice(0, 5).join(' | ') : ''));
  process.exit(errs.length ? 1 : 0);
})();
