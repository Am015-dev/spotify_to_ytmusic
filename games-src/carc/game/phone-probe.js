// phone-probe.js: a 375-wide phone mid-game: glow size, header seats vs tile count, glows under the status card, action line on your turn.
//   node phone-probe.js [375x667,375x553] [shotDir]
const PW = require(process.env.PW || 'playwright'), path = require('path');
const gx = require('../../scripts/gx-serve.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SIZES = (process.argv[2] || '375x667,375x553').split(',').map(s => s.split('x').map(Number)), SHOT = process.argv[3];
let bad = 0; const fail = (...a) => { bad++; console.log('FAIL', ...a); };
(async () => {
  const URL = process.env.URL || await gx.url('rampart-and-vine', { file: path.join(__dirname, 'rampart.html') });
  const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  for (const [W, H] of SIZES) for (const seed of [3, 9]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message)); await p.goto(URL); await sleep(1200);
    await p.evaluate(s => { try { localStorage.clear(); } catch (e) { } AIDELAY = 30; UI.speed = 30; UI.offered = true; setSeed(s); beginGame({ np: 2, seats: ['human', 'ai'], lv: ['normal', 'easy'], ex: {} }); if (s === 9) setHints(true); }, seed);
    await sleep(600); await p.evaluate(() => { const g = document.querySelector('#goalok'); if (g) g.click(); });
    await sleep(800); const tag = W + 'x' + H + ' seed ' + seed + (seed === 9 ? ' hints' : '');
    for (const stop of [8, 22]) {
      for (let i = 0; i < 400; i++) { const st = await p.evaluate(() => ({ my: !!G && !G.over && myTurn('place'), turn: G && G.turn, over: !!(G && G.over) })); if (st.over) break; if (st.my && st.turn >= stop) break;
        if (st.my || await p.evaluate(() => !!G && myTurn('fig'))) await p.evaluate(() => { const m = aiMove(sideToAct()); if (m) performMove(m, sideToAct()); }); await sleep(120); }
      await p.evaluate(() => { try { refit(false) } catch (e) { } }); await sleep(900);
      const r = await p.evaluate(() => { const R = e => e && e.getBoundingClientRect();
        const gl = [...document.querySelectorAll('#world .glow')].filter(g => g.style.visibility !== 'hidden').map(R);
        const st = R(document.querySelector('#status')), seats = document.querySelector('#seats'), left = R(document.querySelector('#left'));
        const sr = [...document.querySelectorAll('#seats .seat')].map(R); const lastSeat = sr[sr.length - 1];
        const fg = [...document.querySelectorAll('#ov .fglow')].map(R);
        return { glowMin: gl.length ? Math.min(...gl.map(q => Math.min(q.width, q.height))) : null, glowsVis: gl.length, legal: UI.legal.filter(q => q.r === UI.rot).length,
          underStatus: st ? gl.filter(q => q.top < st.bottom - 2 && q.right > st.left && q.left < st.right).length : 0,
          seatOverflow: seats ? seats.scrollWidth - seats.clientWidth : 0, seatHitsLeft: lastSeat && left ? Math.max(0, lastSeat.right - left.left) : 0,
          status: (document.querySelector('#status') || {}).innerText || '', fglowMin: fg.length ? Math.min(...fg.map(q => q.width)) : null }; });
      console.log(tag, 'turn~' + stop, JSON.stringify(r));
      if (r.glowMin != null && r.glowMin < 44) fail(tag, 'glow', r.glowMin, 'px');
      if (r.underStatus) fail(tag, r.underStatus, 'glows under the status card');
      if (r.seatOverflow > 0 || r.seatHitsLeft > 0) fail(tag, 'seats overflow', r.seatOverflow, 'overlap', r.seatHitsLeft);
      if (!/glow|place|turn it|tap/i.test(r.status)) fail(tag, 'no action line on your turn:', r.status.replace(/\n/g, ' / '));
      if (SHOT) await p.screenshot({ path: path.join(SHOT, `probe-${W}x${H}-s${seed}-t${stop}.png`) });
    }
    if (errs.length) fail(tag, 'page errors', errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  await b.close(); console.log(bad ? 'PHONE PROBE FAIL ' + bad : 'PHONE PROBE PASS'); process.exit(bad ? 1 : 0);
})();
