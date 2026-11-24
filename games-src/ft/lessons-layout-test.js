// W749 owner rule: at EVERY lesson step (start, after each scripted move, win), phone 402x874 and pc 1366x768, exactly ONE lesson card,
// it starts with "Your goal:", stays on screen and never intersects the board (#grid), the HUD rows or any help bubble.
// Run: node lessons-layout-test.js  (needs ft/sands.html built; turbo speed, budget 60 s)
const fs = require('fs'), path = require('path');
const { turbo, budget } = require('../scripts/turbo');
const t0 = Date.now(), stop = budget(60000, 'sands lessons layout');
(async () => {
  const { chromium } = require('playwright'); const b = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  const url = 'file://' + path.join(__dirname, 'sands.html'); let fails = 0, checks = 0;
  for (const [w, h, mob] of [[402, 874, true], [1366, 768, false]]) {
    const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob }); await turbo(c);
    const pg = await c.newPage(); await pg.addInitScript(() => { try { localStorage.setItem('soq_lessons', '{}'); } catch (e) { } });
    await pg.goto(url); await pg.waitForFunction(() => window.GXST && typeof lsOpen === 'function' && typeof LESSONS !== 'undefined', null, { timeout: 15000 });
    const res = await pg.evaluate(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms)), out = [];
      const R = e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(e).visibility !== 'hidden' ? r : null; };
      const hit = (a, b) => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
      const HUD = ['.gx-bar', '#seats', '#line', '#cleg', '#mkt', '#mine', '#acts', '#feed'];
      const BUB = '.gxh-bub,.commb,.tourw,.coachb,.gd-bub,.coach-b,#tip';
      const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));   // what the player sees = after one painted frame (observers have run)
      async function check(id, step) {
        await frame();
        const cards = [...document.querySelectorAll('.gxst-card')].filter(R), bad = [];
        if (cards.length !== 1) bad.push('cards=' + cards.length);
        const card = cards[0], cr = card && R(card);
        if (cr) {
          const first = card.querySelector('p'); if (!first || !/^Your goal: /.test(first.textContent)) bad.push('first line: ' + (first ? first.textContent.slice(0, 30) : 'none'));
          if (cr.left < 0 || cr.top < 0 || cr.right > innerWidth + 1 || cr.bottom > innerHeight + 1) bad.push('offscreen');
          const g = document.querySelector('#grid'); if (g && R(g) && hit(cr, R(g))) bad.push('board');
          HUD.forEach(s => document.querySelectorAll(s).forEach(e => { const r = R(e); if (r && hit(cr, r)) bad.push(s); }));
          document.querySelectorAll(BUB).forEach(e => { const r = R(e); if (r && hit(cr, r)) bad.push('bubble ' + (e.id || e.className)); });
        }
        if (bad.length && cr) { const s = lsSlot(); bad.push('card=' + [cr.left, cr.top, cr.right, cr.bottom].map(Math.round) + ' slot=' + (s ? [s.left, s.top, s.right, s.bottom].map(Math.round) : 'none') + ' ph=' + GXST.state().phase + (card.classList.contains('gxst-inslot') ? ' in' : '')); }
        out.push({ id, step, bad });
      }
      lsOpen();
      for (let i = 0; i < LESSONS.length; i++) {
        const L = LESSONS[i]; GXST.start(L.id); await wait(3000); await check(L.id, 0);
        for (let k = 0; k < L.solve.length; k++) {
          const m = L.solve[k] === 'dj' ? validMoves(0).find(x => x.act === 'tile' && x.dj) : L.solve[k]; go(m); await wait(300);
          let s = GXST.state(); for (let n = 0; n < 20 && k === L.solve.length - 1 && s.phase !== 'win'; n++) { await wait(150); s = GXST.state(); }
          if (k === L.solve.length - 1 && s.phase !== 'win') out.push({ id: L.id, step: 'win', bad: ['no win: ' + s.phase] });
          await wait(3000); await check(L.id, k === L.solve.length - 1 ? 'win' : k + 1);
        }
      }
      return out;
    });
    res.forEach(r => { checks++; if (r.bad.length) { fails++; console.log(`FAIL ${w}x${h} ${r.id} step ${r.step}: ${r.bad.join(', ')}`); } });
    await c.close();
  }
  await b.close(); stop();
  console.log(`${fails ? 'FAIL' : 'PASS'} lessons layout: ${checks - fails}/${checks} steps clear, ${((Date.now() - t0) / 1000).toFixed(1)} s`); process.exit(fails ? 1 : 0);
})();
