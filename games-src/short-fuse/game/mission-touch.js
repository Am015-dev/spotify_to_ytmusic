// mission-touch.js: a new player plays one full job by touch on a phone (only taps on what glows or on overlay buttons). MODE=new (default): it reads only the screen (the odds badges that are on by default in jobs 1-3); MODE=advisor follows the hint advisor, from the start menu
// to the result card. Fails on page errors, a status line over 8 words, or a job that never ends.  node mission-touch.js [WxH=390x844] [job=1] [shotsDir]
const { chromium } = require('playwright');
const path = require('path');
const gx = require('../../scripts/gx-serve.js');
const MODE = process.env.MODE || 'new';   // new = reads the screen (odds badges); advisor = follows the hint advisor
const [W, H] = (process.argv[2] || '390x844').split('x').map(Number), JOB = +(process.argv[3] || 1), SHOTS = process.argv[4] || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const URL = await gx.url('short-fuse', { file: path.resolve(__dirname, 'shortfuse.html') });
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: SHOTS ? 2 : 1, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  const p = await ctx.newPage(); const bad = new Set(), errs = [];
  p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await p.goto(URL); await sleep(900);
  await p.evaluate(m => { window.__mode = m }, MODE);
  await p.evaluate(j => { localStorage.clear(); try { GXT.markDone('short-fuse') } catch (e) { } UI.setup = UI.setup || defaultSetup(); startJob({ job: j, np: 3, seats: ['human', 'ai', 'ai'], lv: 'normal', names: DEFNAMES.slice(), chars: [], captain: 0, seed: 21 }); }, JOB);
  await sleep(800);
  const pick = () => p.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 3 && r.height > 3 && !e.closest('[hidden]') && r.top >= 0 && r.bottom <= innerHeight; };
    const c = e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    const ov = [...document.querySelectorAll('#over .big,#cover .big,#over button,#cover button')].find(vis); if (ov && !G.over) return { ...c(ov), k: 'overlay' };
    if (G.over) return { k: 'over' };
    const me = UI.V ? UI.V.seat : -1; if (decider() !== me) return { k: 'wait' };
    if (window.__mode === 'advisor') { try { const pl = hlpPlan(), e = pl && hlpEl(pl.to); if (e && vis(e)) return { ...c(e), k: 'tile' }; } catch (x) { } }
    else {   // a new player who only reads what is on screen: the starred odds badge (hints default on in jobs 1-3), then the number that badge is for
      const star = [...document.querySelectorAll('#crew .tile.glow .pvb.best,#crew .tile.glow .pvb')].map(b => b.closest('.tile')).find(vis);
      if (!UI.sel && star) return { ...c(star), k: 'tile' };
      if (UI.sel && UI.sel.mode === 'dual' && UI.sel.tg.length === 1 && UI.sel.v == null) { try { const V = UI.V, W = wwk(V), t = UI.sel.tg[0]; let best = null;
        for (const e of document.querySelectorAll('#mine .tile.glow')) { if (!vis(e)) continue; const sl = G.st[+e.dataset.s].w[+e.dataset.k]; const v = cv(sl.id); const pr = scOdds(V, W, t.st, t.k, v); if (pr != null && (!best || pr > best.p)) best = { p: pr, e }; }
        if (best) return { ...c(best.e), k: 'tile' }; } catch (x) { } }
    }
    const g = [...document.querySelectorAll('#tb .tile.glow,#tb .plate.glow,#tb .chip.glow')].filter(vis);
    if (!g.length) return { k: 'none' };
    const crew = g.filter(e => e.classList.contains('crew')), known = crew.filter(e => e.querySelector('.tok,.tk,i.t'));
    const e = (UI.sel ? g.find(e => e.classList.contains('mine')) : (known[0] || g.find(e => e.classList.contains('mine') && !crew.length) || crew[Math.floor(Math.random() * crew.length)])) || g[0];
    return { ...c(e), k: 'tile' };
  });
  let taps = 0, mid = false, first = false; const t0 = Date.now();
  while (Date.now() - t0 < 240000) {
    const say = await p.evaluate(() => document.getElementById('say').textContent);
    if (say.replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(Boolean).length > 8) bad.add('status over 8 words: ' + say);
    const t = await pick();
    if (t.k === 'over') break;
    if (t.k === 'tile' && SHOTS && !first && await p.evaluate(() => G.phase === 'turn' && !UI.sel)) { first = true; await p.screenshot({ path: path.join(SHOTS, 'first-turn.png') }); }
    if (t.k === 'tile' && SHOTS && !mid && await p.evaluate(() => { const c = G.st.reduce((a, s) => a + s.w.filter(x => x.cut).length, 0), n = G.st.reduce((a, s) => a + s.w.length, 0); return c >= n * .4 && !UI.sel; })) { mid = true; await p.screenshot({ path: path.join(SHOTS, 'mid-game.png') }); }
    if (t.x != null) { await p.touchscreen.tap(t.x, t.y); taps++; await sleep(450); } else await sleep(300);
  }
  await sleep(2500);
  const r = await p.evaluate(() => ({ over: !!G.over, win: !!(G.over && G.over.win), why: G.winText || '', card: !!document.querySelector('#over:not([hidden])') }));
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'result.png') });
  if (!r.over) bad.add('job never ended'); if (!r.card) bad.add('no result card');
  for (const e of errs) bad.add('page error ' + e);
  await b.close();
  console.log(W + 'x' + H + ' job ' + JOB + ' by touch (' + MODE + '): ' + taps + ' taps, ' + (r.win ? 'WON' : 'lost: ' + r.why));
  console.log(bad.size ? 'MISSION FAIL\n  ' + [...bad].join('\n  ') : 'MISSION PASS: 0 errors');
  process.exit(bad.size ? 1 : 0);
})();
