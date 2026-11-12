// Win-rate bench by TOUCH as a new player against the default rival (Quick game -> Start, Hints tapped on).
// node touch-bench.js WxH games mode [seed0]   mode best = tap the ★ every decision; mix = ★ about half the time, else own pick
// (any glowing tile, space, goods or dock button at random). Prints one line per game: result, score, ★ taps vs own taps.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.join(__dirname, 'vale-of-banners.html');
const [W, H] = (process.argv[2] || '375x667').split('x').map(Number), N = +(process.argv[3] || 5), MODE = process.argv[4] || 'best', S0 = +(process.argv[5] || 1);
let rs = S0 * 7919; const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
  for (let g = 0; g < N; g++) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true }), page = await ctx.newPage(), errs = [], fails = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });   // picture slots without a local file are expected
    await page.goto(URL); await page.evaluate(() => { localStorage.clear(); try { GXT.markDone('vale-of-banners'); } catch (e) { } }); await page.reload(); await page.waitForTimeout(500);
    const find = sel => page.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const hit = document.elementFromPoint(x, y); if (hit && (hit === e || e.contains(hit))) return { x, y }; } return null; }, sel);
    /* every displayed needed control: centre on screen, uncovered, and at least 44x44 touch box (or a 44 px wide cell) */
    const audit = () => page.evaluate(() => { const out = [], tb = document.getElementById('tbanner'), tr = tb && +getComputedStyle(tb).opacity > 0.05 ? tb.getBoundingClientRect() : null;
      document.querySelectorAll('#acts .btn, #es .cell.glow, #store .tilebtn.glow, #goods .gbtn.glow, #mk .stgoods.glow').forEach(e => {
        const r = e.getBoundingClientRect(); if (!r.width || !r.height) return; let p = e; while (p) { if (getComputedStyle(p).display === 'none') return; p = p.parentElement; }
        const x = r.left + r.width / 2, y = r.top + r.height / 2, id = e.id || e.className.split(' ')[0];
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight || r.bottom > innerHeight + 1) { out.push(id + ' off-screen @' + Math.round(r.top) + '-' + Math.round(r.bottom)); return; }
        const hit = document.elementFromPoint(x, y); if (!hit || !(hit === e || e.contains(hit))) out.push(id + ' covered by ' + (hit ? hit.id || hit.className : 'nothing'));
        if (tr && r.left < tr.right && r.right > tr.left && r.top < tr.bottom && r.bottom > tr.top) out.push(id + ' under the turn banner');
        if (r.height < 43.5 || r.width < 43.5) out.push(id + ' small ' + Math.round(r.width) + 'x' + Math.round(r.height));
      }); return out; });
    let taps = 0; const T = async (sel, ms) => { const p = await find(sel); if (!p) return false; await page.touchscreen.tap(p.x, p.y); taps++; await page.waitForTimeout(ms || 300); return true; };
    await T('#quickB'); await T('#goB', 600); await T('#hintT', 400); let best = 0, own = 0;
    let started = await page.evaluate(() => !!window.G); if (!started) fails.push('game did not start by taps');
    let stuck = 0, last = '', audits = 0;
    for (let i = 0; started && i < 5000; i++) {
      const st = await page.evaluate(() => ({ over: !!G.over, rs: !document.getElementById('rs').hidden, tv: !document.getElementById('tv').hidden, mine: !G.over && G.seats[VB.actor(G)].human, busy: UI.busy, k: G.turn + '/' + G.phase + '/' + G.round + '/' + G.P[0].used + '/' + G.P[0].store.length + '/' + G.pend.length + '/' + UI.sel + '/' + UI.tab }));
      if (st.rs) break;
      if (!st.over && !st.tv && !(await page.evaluate(() => UI.hintsOn)) && await T('#hintT', 300)) continue;
      if (st.over) { await T('#resB', 600); await page.waitForTimeout(600); continue; }
      if (st.tv) { if (MODE === 'mix' && rnd() < 0.25 && await T('#tv .acts .btn.alt', 400)) continue; if (!(await T('#tv .acts .btn:not(.alt)', 400))) await T('#tv .acts .btn', 400); continue; }
      if (await T('.gxh-bubble button, .gxh-coach button, .gxh-x', 250)) continue;
      if (!st.mine || st.busy) { await page.touchscreen.tap(100, 28); await page.waitForTimeout(200); continue; }
      if (await T('#beat.on', 250)) continue;
      await page.waitForTimeout(120); const bads = await audit(); audits++;
      if (bads.length) { fails.push('turn ' + st.k + ': ' + bads.slice(0, 3).join(', ')); await page.screenshot({ path: path.join(__dirname, `shots/phone-${W}-g${g}-bad.png`) }); break; }
      if (st.k === last) stuck++; else { stuck = 0; last = st.k; } if (stuck > 25) { fails.push('stuck at ' + st.k + ' "' + await page.evaluate(() => document.getElementById('prompt').textContent) + '"'); await page.screenshot({ path: path.join(__dirname, `shots/phone-${W}-g${g}-stuck.png`) }); break; }
      /* the ★ (market badge, best space, or the ★ on a stored tile, goods, dock button or tab) */
      const STAR = '#mk .tilebtn.bestt.glow, #lane .tilebtn.bestt.glow, #es .cell.best.glow, .bestx';
      if ((MODE === 'best' || rnd() < 0.5) && await T(STAR, 380)) { best++; continue; }
      /* own pick: any glowing thing or dock button, at random */
      const own1 = await page.evaluate(() => { const L = []; document.querySelectorAll('#mk .tilebtn.glow, #es .cell.glow, #store .tilebtn.glow, #goods .gbtn.glow, #mk .stgoods.glow, #acts .btn, #tabs .tab.has').forEach(e => { const r = e.getBoundingClientRect(); if (!r.width) return; const x = r.left + r.width / 2, y = r.top + r.height / 2; const hit = document.elementFromPoint(x, y); if (hit && (hit === e || e.contains(hit))) L.push({ x, y, end: e.id === 'endB' }); }); return L; });
      const pool = own1.filter(o => !o.end).length ? own1.filter(o => !o.end) : own1;
      if (pool.length) { const o = pool[Math.floor(rnd() * pool.length)]; await page.touchscreen.tap(o.x, o.y); taps++; own++; await page.waitForTimeout(380); continue; }
      if (await T(STAR, 380)) { best++; continue; }
      await page.waitForTimeout(150);
    }
    const res = await page.evaluate(() => ({ rs: !document.getElementById('rs').hidden, txt: (document.querySelector('#rs h2') || {}).textContent, vp: G && G.P.map(p => p.vp).join('-') }));
    if (!res.rs && !fails.length) fails.push('result not reached');
    if (errs.length) fails.push('errors: ' + errs.slice(0, 2).join(' | '));
    console.log(`${fails.length ? 'FAIL' : 'PASS'} ${MODE} game ${g + 1} touch ${W}x${H}: ${taps} taps (★ ${best}, own ${own}), "${res.txt}" (${res.vp})${fails.length ? ' :: ' + fails.join('; ') : ''}`);
    bad += fails.length ? 1 : 0; await ctx.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
