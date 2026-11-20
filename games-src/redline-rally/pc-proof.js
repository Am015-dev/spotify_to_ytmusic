/* F4 PC gate: one race by mouse at 1366x768 and 1920x1080 (keyboard 1-4 / Enter used on some turns). Saves plan, rival-turn and result shots to proof/,
   fails on: page error, any visible text under 12 px, a visible enabled button whose centre is covered, the board narrower than half the screen.
   Usage: node pc-proof.js */
const path = require('path'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html') }), b = await chromium.launch({ args: ['--no-sandbox'] }); let bad = 0;
  for (const [W, H] of [[1366, 768], [1920, 1080]]) {
    const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage(), errs = [], probs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.goto(url + (url.includes('?') ? '&' : '?') + 'seed=9'); await p.evaluate(() => { localStorage.setItem('gxt-redline-rally', JSON.stringify({ done: 1 })); localStorage.setItem('rr_seen', '1'); localStorage.removeItem('rr_set'); }); await p.reload(); await p.waitForTimeout(700);
    await p.click('#playB'); await p.waitForTimeout(900); if (await p.$('#goalB')) await p.click('#goalB');
    const check = () => p.evaluate(() => { const o = { small: [], covered: [], board: document.querySelector('.gx-board').getBoundingClientRect().width / innerWidth };
      document.querySelectorAll('#game *, #modal *').forEach(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight || cs.visibility === 'hidden' || +cs.opacity === 0) return;
        if ([...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim()) && parseFloat(cs.fontSize) < 12) o.small.push(e.textContent.trim().slice(0, 18) + ' ' + cs.fontSize);
        if (e.matches('button:not([disabled])') && r.top >= 0 && r.bottom <= innerHeight) { const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (h && h !== e && !e.contains(h)) o.covered.push((e.id || e.textContent.trim()).slice(0, 14)); } });
      return o; });
    let shotPlan = 0, shotRiv = 0, turn = 0;
    for (let i = 0; i < 3000; i++) {
      await p.waitForTimeout(70);
      const st = await p.evaluate(() => ({ over: !!G.over, ph: G.phase, busy: UI.busy, go: !!document.querySelector('#goB'), q: [...document.querySelectorAll('#panel .slipq button')].map(x => x.id), modal: !document.getElementById('modal').hidden, riv: UI.rival > 0, r: G.round }));
      if (st.modal && st.over) break; if (st.modal) { await p.click('#modal button.big'); continue; }
      if (st.busy && st.riv && !shotRiv && st.r >= 3) { shotRiv = 1; await p.screenshot({ path: path.join(__dirname, 'proof', `pc-rivals-${W}x${H}.png`) }); }
      if (st.ph === 'plan' && !st.busy && st.go) {
        turn++; if (turn === 3 && !shotPlan) { shotPlan = 1; await p.waitForTimeout(400); const o = await check(); probs.push(...o.small.map(x => 'small ' + x), ...o.covered.map(x => 'covered ' + x)); if (o.board < 0.45) probs.push('board ' + o.board.toFixed(2)); await p.screenshot({ path: path.join(__dirname, 'proof', `pc-plan-${W}x${H}.png`) }); }
        const g = await p.evaluate(() => planOnce().gear);
        if (turn % 2) { await p.keyboard.press(String(g)); await p.waitForTimeout(150); await p.keyboard.press('Enter'); } else { const e = await p.$(`.gb[data-g="${g}"]:not(.on)`); if (e) await e.click(); await p.waitForTimeout(150); await p.click('#goB'); }
        continue; }
      if (st.q.length) await p.click('#' + (st.q.includes('discN') ? 'discN' : st.q[st.q.length - 1]));
    }
    await p.waitForTimeout(600); const o = await check(); probs.push(...o.small.map(x => 'result small ' + x)); await p.screenshot({ path: path.join(__dirname, 'proof', `pc-result-${W}x${H}.png`) });
    const pl = await p.evaluate(() => G.over ? G.rank.indexOf(0) + 1 : 0);
    console.log(W + 'x' + H, errs.length || probs.length || !pl ? 'FAIL' : 'PASS', 'turns', turn, 'place', pl, errs.slice(0, 2).join('|'), [...new Set(probs)].slice(0, 8).join(' | ')); if (errs.length || probs.length || !pl) bad = 1;
  }
  await b.close(); process.exit(bad);
})();
