// Dock fit (F11): with 0-4 dock buttons (boon, idol, assistants) on phones (375x553, 360x640, 375x667) the island map stays
// at least 150 px tall, the research track shows, and every site's centre hits that site (elementFromPoint), never the dock.
// node dock-fit-test.js   (python3 build.py first)   SHOTS=dir writes a screenshot per case
const { chromium } = require('playwright'), serve = require('./serve.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const S = await serve(), b = await chromium.launch(); let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  for (const [w, h] of [[375, 553], [360, 640], [375, 667]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); let errs = 0;
    p.on('pageerror', e => { errs++; console.log('  err', String(e).slice(0, 160)); });
    await p.goto(S.url); await p.waitForSelector('#start [data-a=tut]'); await sleep(400);
    await p.evaluate(() => { UI.fast = true; try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } startGame('vs', { np: 2, lvl: 'normal', seed: 5 }); });
    await sleep(600);
    for (let n = 0; n <= 4; n++) {
      const r = await p.evaluate(n => {
        const me = G.p[UI.view], gid = Object.keys(V.GUARD)[0], did = V.IDOLS[0];
        me.guards = []; me.idols = []; me.asst = [];
        const add = [() => me.guards.push({ id: gid, used: false }), () => me.idols.push({ id: did, used: false }), () => me.asst.push({ id: 'a-broker', ex: false }), () => me.asst.push({ id: 'a-purse', ex: false, gold: true })];
        for (let k = 0; k < n; k++) add[k]();
        render(); return new Promise(res => requestAnimationFrame(() => setTimeout(() => {
          const mp = document.querySelector('#map').getBoundingClientRect(), tr = document.querySelector('#track').getBoundingClientRect(), dk = document.querySelector('#dock').getBoundingClientRect();
          const hidden = getComputedStyle(document.querySelector('#map')).visibility === 'hidden' || getComputedStyle(document.querySelector('#track')).visibility === 'hidden';
          const bad = [];
          document.querySelectorAll('#map .site').forEach(s => { const q = s.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2, e = document.elementFromPoint(cx, cy); if (!e || !(e === s || s.contains(e))) bad.push((s.dataset.i || '?') + '@' + Math.round(cx) + ',' + Math.round(cy) + '->' + (e ? (e.id || e.className || e.tagName) : 'none')); });
          const tc = tr.left + tr.width / 2, ty = tr.top + tr.height / 2, te = document.elementFromPoint(tc, ty), tok = !!te && (te.id === 'track' || !!te.closest('#track'));
          const ex = [...document.querySelectorAll('#extra .tag')].map(e => { const q = e.getBoundingClientRect(); const c = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return { h: Math.round(q.height), w: Math.round(q.width), in: q.left >= -1 && q.right <= innerWidth + 1, hit: !!c && (c === e || e.contains(c)) }; });
          const sc = document.scrollingElement.scrollHeight > innerHeight + 1;
          res({ mapH: Math.round(mp.height), mapB: Math.round(mp.bottom), trH: Math.round(tr.height), trB: Math.round(tr.bottom), dockT: Math.round(dk.top), hidden, bad, tok, ex, sc, squeeze: document.body.classList.contains('vg-squeeze') });
        }, 120)));
      }, n);
      if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/dock-${w}x${h}-${n}.png` });
      const tag = `${w}x${h} ${n} dock button${n === 1 ? '' : 's'}:`;
      ok(!r.hidden && !r.squeeze, `${tag} map and track not hidden`);
      ok(r.mapH >= 150, `${tag} map ${r.mapH} px tall (>= 150)`);
      ok(r.mapB <= r.dockT + 1 && r.trB <= r.dockT + 1, `${tag} map (bottom ${r.mapB}) and track (bottom ${r.trB}) end above the dock (top ${r.dockT})`);
      ok(!r.bad.length, `${tag} every site centre hits its site${r.bad.length ? ' (' + r.bad.slice(0, 4).join(' ') + ')' : ''}`);
      ok(r.tok && r.trH >= 120, `${tag} research track tappable (${r.trH} px tall)`);
      ok(r.ex.length === n && r.ex.every(e => e.h >= 44 && e.w >= 44 && e.hit), `${tag} dock buttons >= 44 px and tappable (${r.ex.map(e => e.w + 'x' + e.h + (e.in ? '' : ' off-screen')).join(', ')})`);
      ok(!r.sc, `${tag} page does not scroll`);
    }
    ok(errs === 0, `${w}x${h}: no page errors (${errs})`);
    await ctx.close();
  }
  // by touch at 375x553: a rich explorer follows the glow until holding a boon, an idol and an assistant; every turn the glowing sites must take the tap
  { const ctx = await b.newContext({ viewport: { width: 375, height: 553 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); let errs = 0, dead = 0, hid = 0, turns = 0, held = null, full = 0;
    p.on('pageerror', e => { errs++; console.log('  err', String(e).slice(0, 160)); });
    await p.goto(S.url); await p.waitForSelector('#start [data-a=tut]'); await sleep(400);
    await p.evaluate(() => { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } startGame('vs', { np: 2, lvl: 'easy', seed: 11 }); const me = G.p[0]; me.res = { coin: 6, compass: 8, tablet: 3, arrow: 4, jewel: 4 }; render(); });
    const tapAt = async sel => { const r = await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => { const q = e.getBoundingClientRect(); return q.width > 2 && q.bottom > 0 && q.top < innerHeight; }); if (!e) return null; const q = e.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, h = document.elementFromPoint(x, y); return { x, y, hit: !!h && (h === e || e.contains(h)) }; }, sel); if (!r) return 0; if (!r.hit) return -1; await p.touchscreen.tap(r.x, r.y); return 1; };
    const t0 = Date.now();
    while (Date.now() - t0 < 240000) {
      const st = await p.evaluate(() => ({ mine: !!(window.G && G.phase === 'play' && myTurn() && !UI.busy), over: G.phase !== 'play', fx: !document.querySelector('#fx').hidden, q: !document.querySelector('#qbox').hidden, insp: !document.querySelector('#insp').hidden,
        ex: { b: G.p[0].guards.length, i: G.p[0].idols.length, a: (G.p[0].asst || []).length } }));
      if (st.over) break;
      if (await p.evaluate(() => !!document.querySelector('#goal') && !document.querySelector('#goal').hidden)) { await tapAt('#goal [data-a=goalgo]'); await sleep(400); continue; }
      if (st.fx) { await tapAt('#fx .fxcard, #fx'); await sleep(200); continue; }
      if (st.insp) { await tapAt('#insp .ix, #insp [data-a=close]'); await sleep(200); continue; }
      if (!st.mine) { await sleep(300); continue; }
      if (st.q) { if (await tapAt('#qbox .cd.glow, #qbox .btn.go') !== 1) await tapAt('#qbox .btn'); await sleep(350); continue; }
      const chk = await p.evaluate(() => { const sq = document.body.classList.contains('vg-squeeze'), out = []; document.querySelectorAll('#map .site.glow').forEach(s => { const q = s.getBoundingClientRect(), e = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); if (!e || !(e === s || s.contains(e))) out.push(s.dataset.i); }); return { sq, out, n: document.querySelectorAll('#extra .tag').length }; });
      if (chk.sq) hid++; dead += chk.out.length; turns++;
      if (st.ex.b && st.ex.i && st.ex.a) { if (!held) held = { ...st.ex, turn: turns }; full++; if (process.env.SHOTS && full === 1) await p.screenshot({ path: `${process.env.SHOTS}/dock-touch-held.png` }); if (full >= 3) break; }
      await p.evaluate(() => { const me = G.p[0]; me.res.compass = Math.max(me.res.compass, 6); me.res.coin = Math.max(me.res.coin, 4); });   /* stays rich so the boon, idol and assistant come quickly */
      // pick the move like a player aiming for an idol (explore a ruin), a boon (overcome its guardian) and an assistant (research), else the glow; then do it by touch
      const want = await p.evaluate(() => { const me = G.p[0], L = VG.moves(G); const f = t => L.find(m => m.t === t);
        const m = (!me.idols.length && f('disc')) || (!me.guards.length && f('beat')) || (!(me.asst || []).length && L.find(m => m.t === 'res')) || (typeof evalMoves === 'function' && (evalMoves()[0] || {}).m) || L[0];
        const el = m && moveTarget(m); if (el) el.setAttribute('data-want', '1'); return m ? { t: m.t, k: m.k, idx: mvIndex(m) } : null; });
      let done = false;
      if (want && want.t !== 'pass') { const r = await tapAt('[data-want]'); await p.evaluate(() => document.querySelectorAll('[data-want]').forEach(e => e.removeAttribute('data-want')));
        if (r === 1) { await sleep(350); if (await tapAt(`#qbox .qchoices [data-m="${want.idx}"]`) === 1 || await tapAt('#gobtn') === 1) done = true; else if (want.t === 'boon' || want.t === 'idol' || want.t === 'asst' || want.t === 'play') done = true; } }
      if (!done) await tapAt('#passbtn');
      await sleep(500);
    }
    ok(!!held, `375x553 by touch: held a boon, an idol and an assistant${held ? ' together from my turn ' + held.turn + ' (' + held.b + '/' + held.i + '/' + held.a + ')' : ''} (${turns} turns)`);
    ok(!hid, `375x553 by touch: the map was never squeezed away outside a chooser (${hid} turns)`);
    ok(!dead, `375x553 by touch: every glowing site took the tap (${dead} covered)`);
    ok(errs === 0, `375x553 by touch: no page errors (${errs})`);
    await ctx.close(); }
  await b.close(); S.close(); console.log(fails ? `dock-fit: FAIL (${fails})` : 'dock-fit: PASS'); process.exit(fails ? 1 : 0);
})();
