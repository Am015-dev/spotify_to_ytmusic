// glow-probe.js: counts lit glows (visible .glow buttons on your turn) whose centre is covered by chrome
// (top bar, status banner, hand dock, "N more" pills, pops...), i.e. a dead tap. Gate: 0 at every size.
//   node tools/glow-probe.js [375x553,375x667,910x512,1366x768] [shotDir]
const PW = require(process.env.PW || 'playwright'), path = require('path');
const gx = require('../../../scripts/gx-serve.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SIZES = (process.argv[2] || '375x553,375x667,910x512,1366x768').split(',').map(s => s.split('x').map(Number)), SHOT = process.argv[3];
const SEEDS = (process.env.SEEDS || '7,3,11').split(',').map(Number), STOPS = [4, 9, 14, 20, 27, 34];
let bad = 0, total = 0, covered = 0, lit = 0;
(async () => {
  const URL = process.env.URL || await gx.url('rampart-and-vine', { file: path.join(__dirname, '..', 'rampart.html') });
  const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  for (const [W, H] of SIZES) {
    let sl = 0, sc = 0; const why = {};
    for (const seed of SEEDS) {
      const phone = W < 700, ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: phone, hasTouch: phone }), p = await ctx.newPage();
      await p.goto(URL); await sleep(1200);
      await p.evaluate(s => { try { localStorage.clear(); } catch (e) { } AIDELAY = 30; UI.speed = 30; UI.offered = true; setSeed(s); beginGame({ np: 2, seats: ['human', 'ai'], lv: ['normal', 'easy'], ex: {} }); }, seed);
      // in-page sampler: every 60 ms, every visible glow on your turn whose centre is not itself (covered) or is off screen
      await p.evaluate(() => { window.__gp = { lit: 0, cov: 0, by: {}, shot: null }; setInterval(() => {
        if (!G || G.over || !myTurn('place')) return; const R = window.__gp;
        for (const g of document.querySelectorAll('#world .glow')) {
          if (g.style.visibility === 'hidden') continue; const r = g.getBoundingClientRect(); if (r.width < 2) continue; R.lit++;
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2, off = cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight, e = document.elementFromPoint(cx, cy);
          if (off || !e || !(g === e || g.contains(e))) { R.cov++; const w = (off ? 'offscreen' : (e ? '#' + (e.id || '') + '.' + String(e.className && e.className.baseVal != null ? e.className.baseVal : e.className).split(' ')[0] + ' ' + e.tagName : 'none')).slice(0, 40); R.by[w] = (R.by[w] || 0) + 1; if (!R.shot) R.shot = 1; }
        } }, 60); });
      const hint = seed % 2 === 1; if (hint) await p.evaluate(() => setHints(true));
      if (seed === SEEDS[0]) await sleep(300); else { await sleep(500); await p.evaluate(() => { const g = document.querySelector('#goalok'); if (g) g.click(); }); }   // first seed keeps the "How you win" card up
      let shot = false;
      for (let i = 0; i < 900; i++) {
        const st = await p.evaluate(() => ({ my: !!G && !G.over && myTurn('place'), fig: !!G && !G.over && myTurn('fig'), over: !!(G && G.over), cov: window.__gp.cov }));
        if (st.over) break; if (st.cov && SHOT && !shot) { shot = true; await p.screenshot({ path: path.join(SHOT, `glowprobe-${W}x${H}-s${seed}.png`) }); }
        if (st.my) { await sleep(450); if (!(await p.evaluate(() => !!G && !G.over && myTurn('place')))) continue; await p.evaluate(() => { const m = aiMove(sideToAct()); if (m) performMove(m, sideToAct()); }); }
        else if (st.fig) { await sleep(150); await p.evaluate(() => { if (G && !G.over && myTurn('fig')) { const m = aiMove(sideToAct()); if (m) performMove(m, sideToAct()); } }); }
        await sleep(120);
      }
      { const R = await p.evaluate(() => window.__gp); sl += R.lit; sc += R.cov; for (const w in R.by) why[w] = (why[w] || 0) + R.by[w]; }
      await ctx.close();
    }
    total += 1; lit += sl; covered += sc; if (sc) bad++;
    console.log(`${W}x${H}: lit glow samples ${sl}, covered ${sc}`, sc ? JSON.stringify(why) : '');
  }
  await b.close(); console.log(`covered lit glows: ${covered} of ${lit}`); console.log(bad ? 'GLOW PROBE FAIL' : 'GLOW PROBE PASS'); process.exit(bad ? 1 : 0);
})();
