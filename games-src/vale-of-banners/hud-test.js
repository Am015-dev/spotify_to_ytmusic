// HUD gate (W677): at phone 402x874 and PC 1366x768, machine speed (turbo.js): every window opens by tap and closes by its X / Close and by a
// tap outside, never two at once; then a Quick game is played to the result by tapping visible UI. 0 JS errors, < 60 s each.
// usage: node hud-test.js [url]   (default http://localhost:8779/vale-of-banners/)
const { chromium } = require('playwright'); const { turbo, budget, tick } = require('../scripts/turbo');
const URL0 = process.argv[2] || 'http://localhost:8779/vale-of-banners/';
(async () => {
  const b = await chromium.launch({ executablePath: require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }); let fail = 0;
  for (const [W, H, mob] of [[402, 874, true], [1366, 768, false]]) {
    const t0 = Date.now(), stop = budget(60000, 'hud ' + W);
    const c = await b.newContext({ viewport: { width: W, height: H }, isMobile: mob, hasTouch: mob, serviceWorkers: 'block' }); await turbo(c);
    const p = await c.newPage(), errs = [], bad = []; p.on('pageerror', e => errs.push(e.message));
    const at = async (x, y) => { if (mob) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); await tick(p, 300); };
    const find = sel => p.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const hit = document.elementFromPoint(x, y); if (hit && (hit === e || e.contains(hit))) return { x, y }; } return null; }, sel);
    const T = async sel => { const q = await find(sel); if (!q) return false; await at(q.x, q.y); return true; };
    await p.goto(URL0); await p.evaluate(() => { localStorage.clear(); try { GXT.markDone('vale-of-banners'); } catch (e) { } }); await p.reload(); await tick(p, 500);
    await T('#quickB'); await T('#goB'); await tick(p, 600); for (let i = 0; i < 4; i++) { if (!(await T('#goalB, .gxh-bubble button, .gxh-x'))) break; }
    await p.evaluate(() => { UI.fast = true; });
    const bar = await p.evaluate(() => [...document.querySelectorAll('header.gx-bar button')].filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(); return [e.getAttribute('aria-label'), Math.round(r.width), Math.round(r.height), r.right <= innerWidth + 1]; }));
    bar.forEach(x => { if (x[1] < 44 || x[2] < 44 || !x[3]) bad.push('bar button ' + x.join(' ')); }); if (bar.length > 7) bad.push('bar has ' + bar.length + ' buttons');
    const openN = () => p.evaluate(() => document.querySelectorAll('.gx-drawer.on').length + (document.getElementById('tv') && !document.getElementById('tv').hidden ? 1 : 0));
    const wins = [['#barchips', 'x'], ['header [data-gx="rulesd"]', 'out'], ['header [data-gx="setd"]', 'x'], ['#barchips', 'out'], ['#barchips', 'chain'], ['#mk .stall:not(.lane) .tilebtn', 'close'], ['#mk .stall:not(.lane) .tilebtn', 'tvout']];
    let nw = 0;
    for (const [sel, how] of wins) {
      if (sel.startsWith('#mk') && !(await find(sel))) { await T('#tabs .tab:nth-child(2), #tab-market'); await tick(p, 200); }
      if (!(await T(sel))) { bad.push('cannot tap ' + sel); continue; } await p.waitForTimeout(80); const n = await openN(); if (n !== 1) bad.push(sel + ' open count ' + n); nw++;
      if (how === 'x') { const xb = await p.evaluate(() => { const x = document.querySelector('.gx-drawer.on .gx-x'), r = x && x.getBoundingClientRect(); return r ? [r.width, r.height] : null; }); if (!xb || xb[0] < 44 || xb[1] < 44) bad.push(sel + ' X ' + JSON.stringify(xb)); if (xb) await T('.gx-drawer.on .gx-x'); }
      else if (how === 'close') { const cb = await p.evaluate(() => { const r = document.getElementById('tvClose').getBoundingClientRect(); return [r.width, r.height]; }); if (cb[1] < 44) bad.push('tile Close ' + cb); await T('#tvClose'); }
      else if (how === 'chain') { if (!(await T('#scorebody [data-seat="1"]'))) bad.push('no See estate button'); await p.waitForTimeout(80); const nn = await openN(); if (nn !== 1) bad.push('estate from scores: open count ' + nn); nw++; const xb = await p.evaluate(() => { const x = document.querySelector('.gx-drawer.on .gx-x'), r = x && x.getBoundingClientRect(); return r ? [r.width, r.height] : null; }); if (!xb || xb[1] < 44) bad.push('estate X ' + JSON.stringify(xb)); if (xb) await T('.gx-drawer.on .gx-x'); }
      else if (how === 'tvout') await at(6, 6);
      else { const r = await p.evaluate(() => { const e = document.querySelector('.gx-drawer.on'); if (!e) return [8, innerHeight - 8]; const d = e.getBoundingClientRect(); return d.left > 60 ? [20, innerHeight / 2] : [innerWidth / 2, Math.max(10, d.top - 20)]; }); await at(r[0], r[1]); }
      await p.waitForTimeout(80); const n2 = await openN(); if (n2 !== 0) bad.push(sel + ' still open after ' + how);
    }
    let taps = 0; const TT = async sel => { if (await T(sel)) { taps++; return true; } return false; }, last = { k: '', n: 0 };
    for (let i = 0; i < 3000; i++) {
      const st = await p.evaluate(() => ({ rs: !document.getElementById('rs').hidden, over: !!G.over, tv: !document.getElementById('tv').hidden, mine: !G.over && G.seats[VB.actor(G)].human, busy: UI.busy, k: G.turn + '/' + G.phase + '/' + G.round + '/' + G.P[0].used + '/' + G.P[0].store.length + '/' + G.pend.length }));
      if (st.rs) break; if (st.over) { await TT('#resB'); await tick(p, 600); continue; }
      if (st.tv) { if (!(await TT('#tv .acts .btn:not(.alt)'))) await TT('#tv .acts .btn'); continue; }
      if (await TT('.gxh-bubble button, .gxh-coach button, .gxh-x')) continue;
      if (!st.mine || st.busy) { await tick(p, 250); continue; }
      if (st.k === last.k) last.n++; else { last.k = st.k; last.n = 0; } if (last.n > 25) { bad.push('stuck at ' + st.k); break; }
      if (await TT('#es .cell.glow') || await TT('#endB') || await TT('#store .tilebtn.glow') || await TT('#mk .stall:not(.lane) .tilebtn.glow') || await TT('#mk .stgoods.glow, #goods .gbtn.glow') || await TT('#tabs .tab.has') || await TT('#acts .btn')) { await tick(p, 150); continue; }
      await tick(p, 200);
    }
    const res = await p.evaluate(() => !document.getElementById('rs').hidden); if (!res) bad.push('result screen not shown');
    const secs = ((Date.now() - t0) / 1000).toFixed(1); stop();
    const ok = !bad.length && !errs.length; if (!ok) fail = 1;
    console.log((ok ? 'ok  ' : 'FAIL') + ` hud ${W}x${H} ${secs}s taps=${taps} windows=${nw} errors=${errs.length} ${bad.concat(errs).join('; ').slice(0, 500)}`);
    await c.close();
  }
  await b.close(); process.exit(fail);
})();
