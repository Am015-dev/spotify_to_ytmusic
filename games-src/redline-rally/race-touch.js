/* W496 gate (R9 fix: boost and discard are asked every legal round; their 3 s defaults skip them, so the gate counts skip taps; boostYes = boosts chosen): a whole default race (Quick game, defaults) by real touch at 390x844 and 375x667, real speed (no AIDELAY).
   Asserts: the race ends; 0 page errors; every tap gets a response within 1.2 s (no dead taps); at every decision each visible enabled button
   in the game screen is on screen and takes the tap (not covered); rival turns are brisk (< 1.5 s per rival car on
   average, timed in the page); the race takes under 5 min. Prints the finishing place.  Usage: node race-touch.js   (SUGGEST=1: tap Suggest every round and take its boost/slip advice; SEED=n) */
const SUG = process.env.SUGGEST === '1', TAPALL = process.env.TAPALL === '1', SEED = process.env.SEED || '11', path = require('path'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html') }), b = await chromium.launch({ args: ['--no-sandbox'] }); let bad = 0;
  for (const [n, vp] of [['390x844', { width: 390, height: 844 }], ['375x667', { width: 375, height: 667 }]]) {
    const c = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true }), p = await c.newPage(), errs = [], probs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(url + (url.includes('?') ? '&' : '?') + 'seed=' + SEED, { waitUntil: 'load' });
    await p.evaluate(() => { try { localStorage.setItem('gxt-redline-rally', JSON.stringify({ done: 1 })); localStorage.setItem('rr_seen', '1'); localStorage.removeItem('rr_set'); } catch (e) {} }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
    const sig = () => p.evaluate(() => document.querySelector('#game').innerHTML.length + '|' + (window.G ? G.phase + G.round + (G.pend ? G.pend.t : '') + UI.sel.length + UI.gear : '') + '|' + document.querySelector('#modal').hidden);
    const tap = async (sel, need) => { const el = await p.$(sel); if (!el) return false; const bb = await el.boundingBox(); if (!bb) return false; const s0 = await sig();
      await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); let ok = false; for (let k = 0; k < 12 && !ok; k++) { await p.waitForTimeout(100); ok = (await sig()) !== s0; }
      if (!ok && need !== false) probs.push('dead tap ' + sel); return true; };
    const scan = async where => { const r = await p.evaluate(() => { const out = [], W = innerWidth, H = innerHeight;
      document.querySelectorAll('#game button, #modal:not([hidden]) button').forEach(b => { const q = b.getBoundingClientRect(); if (!q.width || !q.height || b.disabled || b.closest('[hidden]') || getComputedStyle(b).visibility === 'hidden') return;
        if (q.right > W + 0.5 || q.left < -0.5 || q.bottom > H + 0.5) { out.push((b.id || b.textContent.trim().slice(0, 12)) + ' off screen'); return; }
        const e = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); if (!(e && (e === b || b.contains(e)))) out.push((b.id || b.textContent.trim().slice(0, 12)) + ' covered by ' + (e ? e.tagName + '.' + e.className : 'none')); }); return out; });
      r.forEach(x => { const m = where + ': ' + x; if (!probs.includes(m)) probs.push(m); }); };
    await tap('#playB'); await p.waitForTimeout(900);
    if (await p.$('#goalB')) await tap('#goalB');
    /* rival timing in the page: from the moment a rival car takes the focus until the next car (or your decision) does */
    await p.evaluate(() => { window.__rt = []; let cur = -1, t = 0; setInterval(() => { if (!window.G) return; const f = UI.busy ? UI.lastCar : -1; if (f === cur) return; const now = performance.now();
      if (cur >= 0 && G.cars[cur] && !G.cars[cur].human) window.__rt.push(now - t); cur = f; t = now; }, 30); });
    const diff = await p.evaluate(() => G.diff), t0 = Date.now(); let turns = 0, qtaps = 0, qk = {}, goAt = 0, waits = [], stuck = 0;
    for (let i = 0; i < 4000; i++) {
      await p.waitForTimeout(120);
      const st = await p.evaluate(() => ({ ph: G.phase, busy: UI.busy, over: !!G.over, modal: !document.getElementById('modal').hidden, pend: G.pend ? G.pend.t : '', q: !!document.querySelector('#panel .slipq button'), go: !!document.querySelector('#goB') }));
      if (st.over) break;
      if (st.modal) { await tap('#modal button.big', false) || await tap('#mx', false); continue; }
      if (st.ph === 'plan' && st.go && !st.busy) {
        if (goAt) { const r = await p.evaluate(() => ({ cars: G.cars.filter(c => !c.human && !c.fin).length })); waits.push({ ms: Date.now() - goAt, cars: r.cars }); goAt = 0; }
        await scan('plan');
        if (SUG && await p.$('#sugB')) { await tap('#sugB', false); await tap('#goB'); goAt = Date.now(); turns++; stuck = 0; continue; }
        /* plain newcomer (as in sim-levels D): gear up, one down when a corner sign is within 8 spaces, the biggest cards */
        const g = await p.evaluate(() => { const c = G.cars.find(x => x.human), N = T(G).N; let near = false; for (let d = 1; d <= 8; d++) if (T(G).corners[(c.pos + d) % N]) near = true; return Math.min(4, Math.max(1, c.gear + (near ? -1 : 1))); });
        if (g !== await p.evaluate(() => UI.gear)) { if (!(await tap(`.gb[data-g="${g}"]:not([disabled])`, false))) await tap('.gb:not([disabled])', false); }
        const big = await p.evaluate(() => { const c = G.cars.find(x => x.human), v = x => { const u = upgId(x); return u ? UPG[u].sp : x === 'X' ? 2 : +x; }; return c.hand.map((x, j) => j).filter(j => c.hand[j] !== 'H').sort((a, b) => v(c.hand[b]) - v(c.hand[a])).slice(0, needCards(c, UI.gear)); });
        for (const j of big) { if (!(await p.$('#goB[disabled]'))) break; await tap(`#hand .cd[data-i="${j}"]`); }
        for (let k = 0; k < 5 && await p.$('#goB[disabled]'); k++) { if (!(await tap('#hand .cd:not(.on):not(.dim):not(.H)'))) break; }
        if (await p.$('#goB[disabled]')) { await tap('.gb[data-g="1"]', false); if (await p.$('#goB[disabled]')) await tap('#hand .cd:not(.on)', false); }
        await tap('#goB'); goAt = Date.now(); turns++; stuck = 0; continue;
      }
      if (st.q) {
        await scan('question ' + st.pend); qtaps++; qk[st.pend] = (qk[st.pend] || 0) + 1;
        if (SUG && st.pend !== 'disc') { const y = await p.evaluate(t => t === 'boost' ? suggestBoost(G, G.cars[G.pend.car]) : suggestSlip(G, G.cars[G.pend.car]), st.pend); await tap(st.pend === 'boost' ? (y ? '#boostY' : '#boostN') : (y ? '#slipY' : '#slipN')); }
        else if (st.pend === 'boost') { /* plain newcomer: boost with 5+ heat and no corner close, else let the No-boost countdown run (0 taps) */
          const y = await p.evaluate(() => { const c = G.cars[G.pend.car], N = T(G).N; let near = false; for (let d = 1; d <= 8; d++) if (T(G).corners[(c.pos + G.pend.speed + d) % N]) near = true; return c.eng >= 5 && !near; });
          const timed = await p.$('#boostN.qt'); if (y) { qtaps--; qk.boost--; qk.boostYes = (qk.boostYes || 0) + 1; await tap('#boostY'); } else if (TAPALL || !timed) await tap('#boostN'); else { qtaps--; qk.boost--; qk.boostAuto = (qk.boostAuto || 0) + 1; await p.waitForFunction(() => !document.querySelector('#bq'), null, { timeout: 6000 }).catch(() => probs.push('boost countdown stuck')); } }
        else if (st.pend === 'slip') await tap('#slipY');
        else if (st.pend === 'disc') { if (TAPALL) await tap('#discN'); else { qtaps--; qk.disc--; qk.discAuto = (qk.discAuto || 0) + 1; await p.waitForFunction(() => !document.querySelector('#discN'), null, { timeout: 6000 }).catch(() => probs.push('discard countdown stuck')); } }
        continue;
      }
      if (++stuck > 900) { probs.push('stuck'); break; }
    }
    const hs = await p.evaluate(() => JSON.stringify(G.cars.find(c => c.human).stats)); const secs = (Date.now() - t0) / 1000, res = await p.evaluate(() => G.over ? G.rank.indexOf(G.cars.find(c => c.human).i) + 1 : 0);
    const rt = await p.evaluate(() => window.__rt), avg = rt.reduce((a, x) => a + x, 0) / Math.max(1, rt.length), mx = Math.max(...rt);
    if (!res) probs.push('race did not end'); if (secs > 300) probs.push('race took ' + secs.toFixed(0) + ' s');
    if (qtaps > (TAPALL ? 60 : 15)) probs.push('skip taps ' + qtaps + ' > 15'); if (avg > 1500) probs.push('rival turn avg ' + avg.toFixed(0) + ' ms');
    console.log(n, probs.length || errs.length ? 'FAIL' : 'PASS', 'diff', diff, 'place', res, 'decisions', turns, 'skip taps (No boost/Keep all/slip)', qtaps, JSON.stringify(qk), 'race', secs.toFixed(0) + 's', 'you', hs, 'Go->next decision avg', (waits.reduce((a, w) => a + w.ms, 0) / Math.max(1, waits.length) / 1000).toFixed(1) + 's', 'rival turn avg ' + avg.toFixed(0) + 'ms max ' + mx.toFixed(0) + 'ms (' + rt.length + ' turns)', errs.slice(0, 2).join('|'), probs.slice(0, 12).join(' | '));
    if (probs.length || errs.length) bad = 1; await c.close();
  }
  await b.close(); process.exit(bad);
})();
