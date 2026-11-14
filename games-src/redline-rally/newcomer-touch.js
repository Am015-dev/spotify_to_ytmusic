/* R19 gate: a plain newcomer plays whole default races (Quick game, defaults) by real touch (touchscreen.tap) at 390x844 and 375x667.
   Newcomer: gear up on straights, one down when a corner sign is within 8 spaces, the biggest cards; boost with 5+ heat and no
   corner close, else No boost; in the Discard step drop every Brake (speed 0) and 1, else Keep all. Every question is answered by a tap.
   Measures: place, every wait from my tap to my next decision (no skip taps), smallest text and tap target, whether my car and the
   next corner sign are on the board while I plan (and saves the first 4 planning shots), page errors, dead taps.
   Fails on: page error, dead tap, a wait over 4 s on average or a question that answers itself, car or next corner off the planning view.
   Usage: node newcomer-touch.js   (RACES=n per size, SEED=n, VP=390x844, SHOTS=dir) */
const path = require('path'), fs = require('fs'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
const RACES = +(process.env.RACES || 1), SEED0 = +(process.env.SEED || 21), SHOTS = process.env.SHOTS || path.join(__dirname, 'playable-shots', 'r19');
fs.mkdirSync(SHOTS, { recursive: true });
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html') }), b = await chromium.launch({ args: ['--no-sandbox'] }); let bad = 0;
  for (const [n, vp] of [['390x844', { width: 390, height: 844 }], ['375x667', { width: 375, height: 667 }]].filter(v => !process.env.VP || v[0] === process.env.VP)) for (let r = 0; r < RACES; r++) {
    const c = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true }), p = await c.newPage(), errs = [], probs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(url + (url.includes('?') ? '&' : '?') + 'seed=' + (SEED0 + r * 7 + (n[1] === '7' ? 3 : 0)), { waitUntil: 'load' });
    await p.evaluate(() => { try { localStorage.setItem('gxt-redline-rally', JSON.stringify({ done: 1 })); localStorage.setItem('rr_seen', '1'); localStorage.removeItem('rr_set'); localStorage.removeItem('rr_hints'); } catch (e) {} }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
    const sig = () => p.evaluate(() => document.querySelector('#game').innerHTML.length + '|' + (window.G ? G.phase + G.round + (G.pend ? G.pend.t : '') + UI.sel.length + UI.gear : '') + '|' + document.querySelector('#modal').hidden);
    const tap = async (sel, need) => { const el = await p.$(sel); if (!el) return false; const bb = await el.boundingBox(); if (!bb) return false; const s0 = await sig();
      await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); let ok = false; for (let k = 0; k < 12 && !ok; k++) { await p.waitForTimeout(100); ok = (await sig()) !== s0; }
      if (!ok && need !== false) probs.push('dead tap ' + sel); return true; };
    const measure = () => p.evaluate(() => { let txt = 99, tt = '', tgt = 99, tg = ''; const W = innerWidth, H = innerHeight;
      document.querySelectorAll('#game *, .gx-dock *').forEach(e => { const q = e.getBoundingClientRect(); if (!q.width || !q.height || q.bottom < 0 || q.top > H || q.right < 0 || q.left > W) return; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) return;
        if ([...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim())) { const f = parseFloat(cs.fontSize); if (f < txt) { txt = f; tt = e.textContent.trim().slice(0, 20); } }
        if (e.matches('button:not([disabled])')) { const m = Math.min(q.width, q.height); if (m < tgt) { tgt = m; tg = (e.id || e.className || e.textContent.trim()).toString().slice(0, 20); } } });
      return { txt, tt, tgt, tg }; });
    const view = () => p.evaluate(() => { const W = UI.W, H = UI.H, cam = UI.cam, dO = H < 420 ? dashH(W, H) / 2 : 0, cv = document.querySelector('#cv').getBoundingClientRect();
      const sc = q => ({ x: (q.x - cam.x) * cam.s + W / 2, y: (q.y - cam.y) * cam.s + H / 2 - dO }), me = G.cars[UI.seat], nc = nextCorner(me.pos), tk = T(G);
      const inV = q => q.x > 0 && q.x < W && q.y > 0 && q.y < H; let covered = 0; const chk = q => { const e = document.elementFromPoint(cv.left + q.x, cv.top + q.y); if (e && e.id !== 'cv') covered++; };
      const car = sc(carXY(me.i, UI.vis[me.i].p)); let cs = null; if (nc) { const a = tk.at(((me.pos + nc.d) % tk.N) * tk.seg); cs = sc({ x: a.x + Math.sin(a.a) * 98, y: a.y - Math.cos(a.a) * 98 }); }
      if (inV(car)) chk(car); if (cs && inV(cs)) chk(cs);
      const pf = planFrame(), dbg = pf ? [Math.round(pf.x), Math.round(pf.y), Math.round(cam.x), Math.round(cam.y), me.pos, tk.N, W, H, Math.round(UI.vis[me.i].p)] : 0; return { dbg, car: inV(car), corner: !cs || inV(cs), covered, d: nc ? nc.d : 0, lim: nc ? nc.limit : 0, s: +cam.s.toFixed(2), pf: pf ? pf.s.toFixed(2) : 'none', busy: UI.busy, carXY: [Math.round(car.x), Math.round(car.y)] }; });
    await tap('#playB'); await p.waitForTimeout(900);
    if (await p.$('#goalB')) await tap('#goalB');
    const t0 = Date.now(); let decisions = 0, lastTap = 0, waits = [], stuck = 0, txt = { txt: 99, tgt: 99 }, plans = 0, viewBad = 0, boosts = 0, disc = 0, selfAns = 0;
    const decided = () => { lastTap = Date.now(); decisions++; stuck = 0; };
    const arrive = () => { if (lastTap) { waits.push(Date.now() - lastTap); lastTap = 0; } };
    for (let i = 0; i < 5000; i++) {
      await p.waitForTimeout(60);
      const st = await p.evaluate(() => ({ ph: G.phase, busy: UI.busy, over: !!G.over, modal: !document.getElementById('modal').hidden, pend: G.pend ? G.pend.t : '', q: !!document.querySelector('#panel .slipq button'), go: !!document.querySelector('#goB') }));
      if (st.over) { arrive(); break; }
      if (st.modal) { await tap('#modal button.big', false) || await tap('#mx', false); continue; }
      if (st.ph === 'plan' && st.go && !st.busy) {
        arrive(); await p.waitForTimeout(700);   /* let the camera settle, as a player would look first */
        const v = await view(); if (!v.car || !v.corner || v.covered) { viewBad++; probs.push('plan view r' + (await p.evaluate(() => G.round)) + ' car ' + v.car + ' corner ' + v.corner + ' covered ' + v.covered + ' ' + JSON.stringify(v)); }
        if (plans < 4 && r === 0) await p.screenshot({ path: path.join(SHOTS, 'rr-' + n.split('x')[1] + '-plan' + (plans + 1) + '.jpg'), quality: 70, type: 'jpeg' });
        plans++; const m = await measure(); if (m.txt < txt.txt) txt = Object.assign(txt, { txt: m.txt, tt: m.tt }); if (m.tgt < txt.tgt) txt = Object.assign(txt, { tgt: m.tgt, tg: m.tg });
        const g = await p.evaluate(() => { const c = G.cars.find(x => x.human), N = T(G).N; let near = false; for (let d = 1; d <= 8; d++) if (T(G).corners[(c.pos + d) % N]) near = true; return Math.min(4, Math.max(1, c.gear + (near ? -1 : 1))); });
        if (g !== await p.evaluate(() => UI.gear)) { if (!(await tap(`.gb[data-g="${g}"]:not([disabled])`, false))) await tap('.gb:not([disabled])', false); }
        const big = await p.evaluate(() => { const c = G.cars.find(x => x.human), v = x => { const u = upgId(x); return u ? UPG[u].sp : x === 'X' ? 2 : +x; }; return c.hand.map((x, j) => j).filter(j => c.hand[j] !== 'H').sort((a, b) => v(c.hand[b]) - v(c.hand[a])).slice(0, needCards(c, UI.gear)); });
        for (const j of big) { if (!(await p.$('#goB[disabled]'))) break; await tap(`#hand .cd[data-i="${j}"]`); }
        for (let k = 0; k < 5 && await p.$('#goB[disabled]'); k++) { if (!(await tap('#hand .cd:not(.on):not(.dim):not(.H)'))) break; }
        if (await p.$('#goB[disabled]')) { await tap('.gb[data-g="1"]', false); if (await p.$('#goB[disabled]')) await tap('#hand .cd:not(.on)', false); }
        await tap('#goB'); decided(); continue;
      }
      if (st.q) {
        arrive(); await p.waitForTimeout(1600);   /* read the question; it must still be there (never answered on a timer) */
        if (!(await p.$('#panel .slipq button'))) { selfAns++; probs.push('question ' + st.pend + ' answered itself'); continue; }
        const m = await measure(); if (m.txt < txt.txt) Object.assign(txt, { txt: m.txt, tt: m.tt }); if (m.tgt < txt.tgt) Object.assign(txt, { tgt: m.tgt, tg: m.tg });
        if (st.pend === 'boost') { const y = await p.evaluate(() => { const c = G.cars[G.pend.car], N = T(G).N; let near = false; for (let d = 1; d <= 8; d++) if (T(G).corners[(c.pos + G.pend.speed + d) % N]) near = true; return c.eng >= 5 && !near; }); if (y) boosts++; await tap(y ? '#boostY' : '#boostN'); }
        else if (st.pend === 'slip') await tap('#slipY');
        else if (st.pend === 'disc') { const js = await p.evaluate(() => { const c = G.cars[G.pend.car]; return c.hand.map((x, j) => j).filter(j => c.hand[j] === 'u:zero' || c.hand[j] === '1'); });
          for (const j of js) await tap(`#panel .cd[data-i="${j}"]`); disc += js.length; await tap(js.length ? '#discY' : '#discN'); }
        decided(); continue;
      }
      if (++stuck > 1500) { probs.push('stuck'); break; }
    }
    const secs = (Date.now() - t0) / 1000, res = await p.evaluate(() => G.over ? G.rank.indexOf(G.cars.find(c => c.human).i) + 1 : 0), hs = await p.evaluate(() => G.cars.find(c => c.human).stats);
    if (!res) probs.push('race did not end'); else if (r === 0) { await p.waitForTimeout(1500); await p.screenshot({ path: path.join(SHOTS, 'rr-' + n.split('x')[1] + '-result.jpg'), quality: 70, type: 'jpeg' }); }
    const avg = waits.reduce((a, x) => a + x, 0) / Math.max(1, waits.length), mx = Math.max(...waits), srt = waits.slice().sort((a, b) => a - b), p90 = srt[Math.floor(srt.length * 0.9)] || 0;
    if (avg > 4000) probs.push('avg wait ' + (avg / 1000).toFixed(1) + ' s');
    console.log(n, 'race', r + 1, probs.length || errs.length ? 'FAIL' : 'PASS', '| place', res, '| race', secs.toFixed(0) + 's', '| decisions', decisions, '| boosts', boosts, 'discarded', disc, 'spins', hs.spins,
      '| wait tap->next decision avg', (avg / 1000).toFixed(1) + 's p90', (p90 / 1000).toFixed(1) + 's max', (mx / 1000).toFixed(1) + 's', '| plan views', plans, 'bad', viewBad,
      '| smallest text', txt.txt + 'px (' + txt.tt + ')', 'smallest target', Math.round(txt.tgt) + 'px (' + txt.tg + ')', '| self-answered', selfAns, '| errors', errs.length, errs.slice(0, 2).join('|'), probs.slice(0, 8).join(' | '));
    if (probs.length || errs.length) bad = 1; await c.close();
  }
  await b.close(); process.exit(bad);
})();
