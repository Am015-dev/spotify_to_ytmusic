// Touch + drag test (phone 390x844 touch, PC 1440x900 mouse): Learn to play finished by taps on the tutor's target only (no Skip),
// then a quick game: drag an explorer onto a glowing site, drag a hand card up to play it, drag a market card down to buy it,
// tap-select + tap-again, and play on by taps to the result. node drag-test.js   (python3 build.py first)
const { chromium } = require('playwright'), serve = require('./serve.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const S = await serve(), b = await chromium.launch(); let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  for (const [name, vp, touch] of (process.env.ONLY === 'pc' ? [['pc', { width: 1440, height: 900 }, false]] : process.env.ONLY === 'phone' ? [['phone', { width: 390, height: 844 }, true]] : [['phone', { width: 390, height: 844 }, true], ['pc', { width: 1440, height: 900 }, false]])) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }); const p = await ctx.newPage(); let errs = 0; p.on('pageerror', e => { errs++; console.log('  err', String(e).slice(0, 160)); });
    const cdp = touch ? await ctx.newCDPSession(p) : null;
    const tap = async (x, y) => touch ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
    const tapEl = async sel => { const r = await p.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel); if (!r) return false; await tap(r.x, r.y); return true; };
    const drag = async (a, z) => { const steps = 12;
      if (touch) { const pt = (x, y) => [{ x, y, id: 1 }]; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(a.x, a.y) }); for (let k = 1; k <= steps; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(a.x + (z.x - a.x) * k / steps, a.y + (z.y - a.y) * k / steps) }); await sleep(16); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
      else { await p.mouse.move(a.x, a.y); await p.mouse.down(); for (let k = 1; k <= steps; k++) { await p.mouse.move(a.x + (z.x - a.x) * k / steps, a.y + (z.y - a.y) * k / steps); await sleep(16); } await p.mouse.up(); } };
    const ctr = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel);
    // ---- Learn to play by touch: tap only what the tutor highlights
    await p.goto(S.url + '?fast=0'); await p.waitForSelector('#start [data-a=tut]'); await sleep(600);
    await tapEl('#start [data-a=tut]'); await sleep(1500);
    let steps = 0, t0 = Date.now(), ended = false;
    while (Date.now() - t0 < 150000) {
      const g0 = await p.evaluate(() => typeof GXT !== 'undefined' && GXT.running() ? GXT.state() : null);
      if (g0 && g0.phase === 'end') { ended = true; break; }
      if (!g0 && !(await p.evaluate(() => !!(window.GXCOACH && GXCOACH.running) || (G && G.phase === 'over')))) { await sleep(400); if (!(await p.evaluate(() => (typeof GXT !== 'undefined' && GXT.running()) || !!(window.GXCOACH && GXCOACH.running)))) break; }
      const g = g0 || { shown: false };
      if (g.shown && g.wait === null) { if (await tapEl('.gxt-next')) steps++; }
      else if (g.shown && g.wait === 'tap' && g.hole) { await tap(g.hole.cx, g.hole.cy); steps++; }
      else if (!g.shown) {   // coached free play: tap a glowing thing twice, or Pass
        const did = await p.evaluate(() => { if (!myTurn()) return 'wait'; const g = document.querySelector('#hand .cd.glow, .site.glow, #row .cd.glow, #track.glow'); return g ? 'go' : 'pass'; });
        if (did === 'go') { const c = await ctr('.site.glow') || await ctr('#hand .cd.glow') || await ctr('#row .cd.glow') || await ctr('#track.glow'); if (c) { await tap(c.x, c.y); await sleep(250); if (await p.evaluate(() => !!document.querySelector('#gobtn'))) await tapEl('#gobtn'); else if (!(await tapEl('#qbox .btn.go'))) await tapEl('#passbtn'); } }
        else if (did === 'pass') { const c = await ctr('#passbtn'); if (c) await tap(c.x, c.y); else { const q = await ctr('#qbox .btn'); if (q) await tap(q.x, q.y); } }
        else { const f = await ctr('#fx .fxcard'); if (f) await tap(f.x, f.y); }
      }
      if (process.env.DBG && Date.now() % 5000 < 800) console.log('  dbg', JSON.stringify(await p.evaluate(() => ({ g: typeof GXT !== 'undefined' && GXT.running() ? GXT.state().phase + ':' + GXT.state().i : null, ph: G && G.phase, r: G && G.round, mine: typeof myTurn === 'function' && myTurn(), busy: UI.busy, coach: !!(window.GXCOACH && GXCOACH.running), fx: !document.querySelector('#fx').hidden, q: G && G.q && G.q.h, prompt: (document.querySelector('#prompt') || {}).textContent }))));
      await sleep(700);
    }
    ok(ended, `${name}: Learn to play reaches its end card by touch (${steps} tutor taps, ${Math.round((Date.now() - t0) / 1000)} s, no Skip)`);
    // ---- quick game: drags
    await p.evaluate(() => { try { localStorage.setItem('vinegrave-prefs', JSON.stringify({ played: true })); } catch (e) { } });
    await p.goto(S.url); await p.waitForSelector('#start [data-a=start]'); await tapEl('#start [data-a=start]'); await sleep(500); await tapEl('#goal .tbtn');
    await p.waitForFunction(() => myTurn() && !UI.busy, null, { timeout: 20000 }); await sleep(400);
    let pw = await ctr('#pawns .pawn.mine'), site = await p.evaluate(() => { const m = movesFor('pawn')[0]; if (!m) return null; const e = document.querySelector(`.site[data-i="${m.s}"]`), q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, s: m.s }; });
    const ex0 = await p.evaluate(() => G.p[0].ex);
    if (pw && site) { await drag(pw, site); await sleep(300); }
    ok(await p.evaluate(s => G.sites[s].occ === 0, site && site.s), `${name}: drag explorer onto a glowing site -> explorer there (ex ${ex0} -> ${await p.evaluate(() => G.p[0].ex)})`);
    await p.waitForFunction(() => myTurn() && !UI.busy, null, { timeout: 30000 }); await sleep(300);
    const h0 = await p.evaluate(() => G.p[0].hand.length), hc = await p.evaluate(() => { const m = movesFor('hand', 0).length ? 0 : G.p[0].hand.findIndex((_, i) => movesFor('hand', i).length); if (m < 0) return null; const e = document.querySelector(`#hand .cd[data-i="${m}"]`), q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
    if (hc) { const bd = await ctr('#map'); await drag(hc, bd); await sleep(300); }
    ok(!hc || await p.evaluate(h => G.p[0].hand.length < h || G.p[0].play.length > 0, h0), `${name}: drag a hand card up onto the island -> it is played`);
    await p.waitForFunction(() => myTurn() && !UI.busy, null, { timeout: 30000 }); await sleep(300);
    await p.evaluate(() => { G.p[0].res.coin = 9; G.p[0].res.compass = 9; render(); });
    const rc = await ctr('#row .cd.glow'), coin0 = await p.evaluate(() => G.p[0].res.coin + G.p[0].res.compass);
    if (rc) { const tray = await ctr('#hand'); await drag(rc, tray); await sleep(300); }
    ok(await p.evaluate(c => G.p[0].res.coin + G.p[0].res.compass < c, coin0), `${name}: drag a market card down to the tray -> bought`);
    // ---- tap, tap again on a site; then play on by taps to the result
    await p.waitForFunction(() => myTurn() && !UI.busy, null, { timeout: 30000 });
    let n = 0, t1 = Date.now();
    await p.evaluate(() => { UI.fast = true; });
    while (Date.now() - t1 < 90000) {
      if (await p.evaluate(() => G.phase === 'over')) break;
      const st = await p.evaluate(() => myTurn() ? (G.q ? 'pass' : document.querySelector('.site.glow,#row .cd.glow,#hand .cd.glow') ? 'go' : document.querySelector('#track.glow') ? 'track' : 'pass') : 'wait');
      if (st === 'go') { const c = await ctr('.site.glow') || await ctr('#row .cd.glow') || await ctr('#hand .cd.glow'); await tap(c.x, c.y); await sleep(60); await tap(c.x, c.y); n++; }
      else if (st === 'track') { await tapEl('#track'); await sleep(60); if (!(await tapEl('#gobtn'))) await tapEl('#qbox .btn.go'); n++; }
      else if (st === 'pass') { if (!(await tapEl('#passbtn'))) await tapEl('#qbox .btn'); }
      await sleep(60);
    }
    await sleep(800);
    ok(await p.evaluate(() => G.phase === 'over' && !document.querySelector('#rs').hidden), `${name}: a full game by taps reaches the result (${n} tap-again moves)`);
    ok(errs === 0, `${name}: no page errors (${errs})`);
    await ctx.close();
  }
  console.log(fails ? 'FAIL drag-test ' + fails : 'PASS drag-test'); await b.close(); S.close(); process.exit(fails ? 1 : 0);
})();
