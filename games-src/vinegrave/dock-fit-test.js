// Dock fit (F11): with 0-4 dock buttons (boon, idol, assistants) on phones (375x553, 360x640, 375x667) the island map stays
// at least 150 px tall, the research track shows, and every site's centre hits that site (elementFromPoint), never the dock.
// F12 (R69 stopper): 5-8 chips from real holdings (2 guardians, 3 idols, 2 assistants, a travel token, some spent): every chip is swiped into
// view on the strip by a real touch drag, then tapped; its sheet must open, and a ready boon / idol / assistant must fire from that sheet.
// ONLY=touch360 node dock-fit-test.js runs just the 360x640 touch game.
// node dock-fit-test.js   (python3 build.py first)   SHOTS=dir writes a screenshot per case
const { chromium } = require('playwright'), serve = require('./serve.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const S = await serve(), b = await chromium.launch(); let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  if (!process.env.ONLY) for (const [w, h] of [[375, 553], [360, 640], [375, 667]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); let errs = 0;
    p.on('pageerror', e => { errs++; console.log('  err', String(e.stack || e).slice(0, 300)); });
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
  // F12: 5-8 chips at each phone size: swipe the strip by touch until the chip is in view, tap it, its sheet opens and its action fires
  if (!process.env.ONLY) for (const [w, h] of [[375, 553], [360, 640], [375, 667]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); let errs = 0;
    p.on('pageerror', e => { errs++; console.log('  err', String(e.stack || e).slice(0, 300)); });
    const cdp = await ctx.newCDPSession(p);
    const swipe = async (x0, y, dx) => { const steps = 8; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
      for (let k = 1; k <= steps; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + dx * k / steps, y }] }); await sleep(16); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(250); };
    await p.goto(S.url); await p.waitForSelector('#start [data-a=tut]'); await sleep(400);
    await p.evaluate(() => { UI.fast = true; try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } startGame('vs', { np: 2, lvl: 'normal', seed: 5 }); });
    await sleep(600);
    // holdings as a long game leaves them (real ids, spent and ready mixed); n = chips expected after merging spent ones
    const CASES = [
      { name: '2 boons, 2 idols, 1 assistant', g: [0, 0], i: [0, 0], a: [0], tv: 0, n: 5 },
      { name: '2 boons, 3 idols, 1 assistant', g: [0, 0], i: [0, 0, 0], a: [0], tv: 0, n: 6 },
      { name: '2 boons, 3 idols, 2 assistants', g: [0, 0], i: [0, 0, 0], a: [0, 0], tv: 0, n: 7 },
      { name: '2 boons, 3 idols, 2 assistants, travel token', g: [0, 0], i: [0, 0, 0], a: [0, 0], tv: 1, n: 8 },
      { name: '2 boons (1 used), 3 idols (2 set), 2 assistants (1 resting)', g: [1, 0], i: [1, 1, 0], a: [0, 1], tv: 0, n: 6 },
      { name: '3 boons (2 used), 4 idols (3 set), 2 assistants, travel token', g: [1, 1, 0], i: [1, 1, 1, 0], a: [0, 0], tv: 1, n: 7 }];
    for (const C of CASES) {
      const setup = () => p.evaluate(C => { const me = G.p[UI.view]; G.turn = UI.view; G.q = null; me.passed = false;
        const gs = V.GUARDS.filter(g => !V.GUARD[g].tv); me.guards = C.g.map((u, k) => ({ id: gs[k % gs.length], used: !!u })); me.idols = C.i.map((u, k) => ({ id: V.IDOLS[k % V.IDOLS.length], used: !!u }));
        const fr = V.ASST.filter(a => !a.main); me.asst = C.a.map((r, k) => ({ id: fr[k % fr.length].id, ex: !!r })); me.tv = C.tv ? [Object.keys(V.TNAME)[0]] : [];
        me.res = { coin: 9, compass: 9, tablet: 9, arrow: 9, jewel: 9 }; UI.sel = null; closeInsp && closeInsp(); render(); }, C);
      await setup(); await sleep(250);
      const info = await p.evaluate(() => { const e = document.querySelector('#extra'), er = e.getBoundingClientRect(), mp = document.querySelector('#map').getBoundingClientRect();
        return { n: e.querySelectorAll('.tag').length, btns: [...e.querySelectorAll('button.tag')].map(b => ({ a: b.dataset.a, k: b.dataset.k, used: b.classList.contains('used') })), range: e.scrollWidth - e.clientWidth, sl: e.scrollLeft, x0: er.left, x1: er.right, y: er.top + er.height / 2, mapH: Math.round(mp.height), hand: G.p[UI.view].hand.length, prompt: document.querySelector('#prompt').textContent, squeeze: document.body.classList.contains('vg-squeeze'), fr: e.classList.contains('fr') }; });
      const tag = `${w}x${h} ${C.name}:`;
      ok(info.n === C.n, `${tag} ${info.n} chips (expect ${C.n} after merging spent ones)`);
      ok(info.mapH >= 150 && !info.squeeze, `${tag} map ${info.mapH} px, not squeezed (hand ${info.hand}, prompt "${info.prompt}")`);
      ok(info.range === 0 || info.fr, `${tag} strip ${info.range ? 'scrolls ' + info.range + ' px and fades its right edge' : 'fits without scrolling'}`);
      const firstReady = info.btns.findIndex(x => !x.used);
      if (firstReady >= 0) { const v = await p.evaluate(() => { const e = document.querySelector('#extra'), er = e.getBoundingClientRect(), c = e.querySelector('button.tag:not(.used)'), q = c.getBoundingClientRect(); return q.left >= er.left - 1 && q.right <= er.right + 1; }); ok(v, `${tag} the first ready chip is in view when the strip changes`); }
      let reach = 0, fired = 0;
      for (let j = 0; j < info.btns.length; j++) {
        const B = info.btns[j], sel = `#extra button.tag[data-a="${B.a}"][data-k="${B.k}"]`;
        let pos = null;
        for (let tries = 0; tries < 12; tries++) {
          pos = await p.evaluate(sel => { const e = document.querySelector('#extra'), er = e.getBoundingClientRect(), c = document.querySelector(sel); if (!c) return null; const q = c.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, hit = document.elementFromPoint(x, y);
            return { full: q.left >= er.left - 1 && q.right <= er.right + 1 && q.left >= 0 && q.right <= innerWidth, x, y, hit: !!hit && (hit === c || c.contains(hit)), dir: q.left < er.left ? 1 : -1 }; }, sel);
          if (!pos || (pos.full && pos.hit)) break;
          await swipe(info.x0 + (info.x1 - info.x0) / 2, info.y, pos.dir * 70);
        }
        if (!pos || !pos.full || !pos.hit) { console.log(`  chip ${B.a}#${B.k} unreachable`, JSON.stringify(pos)); continue; }
        reach++;
        await p.touchscreen.tap(pos.x, pos.y); await sleep(300);
        const r = await p.evaluate(B => { const ins = document.querySelector('#insp'), open = !!ins && !ins.hidden, me = G.p[UI.view];
          const use = open ? [...ins.querySelectorAll('.ibtns [data-a=mv]')] : []; return { open, h: open ? (ins.querySelector('h3') || {}).textContent : '', use: use.length, before: B.a === 'guard' ? me.guards[B.k].used : B.a === 'idol' ? me.idols[B.k].used : me.asst[B.k].ex }; }, B);
        let ok1 = r.open;
        if (r.open && !B.used) {   /* a ready chip's action fires from its sheet */
          if (r.use) { const u = await p.evaluate(() => { const b = document.querySelector('#insp .ibtns [data-a=mv]'), q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); await p.touchscreen.tap(u.x, u.y); await sleep(400);
            await p.evaluate(() => { for (let k = 0; k < 4 && G.q && G.q.seat === UI.view; k++) { const m = VG.moves(G)[0]; VG.apply(G, m); } render(); });
            const after = await p.evaluate(B => { const me = G.p[UI.view]; return B.a === 'guard' ? me.guards[B.k].used : B.a === 'idol' ? me.idols[B.k].used : me.asst[B.k].ex; }, B);
            ok1 = after && !r.before;
          } else ok1 = false;
          await setup(); await sleep(200);
        } else await p.evaluate(() => { closeInsp(); });
        if (ok1) fired++; else console.log(`  chip ${B.a}#${B.k}${B.used ? ' (spent)' : ''}: sheet ${r.open ? 'open "' + r.h + '"' : 'did not open'}, use buttons ${r.use}`);
        await sleep(150);
      }
      ok(reach === info.btns.length, `${tag} every chip reachable by swipe (${reach}/${info.btns.length})`);
      ok(fired === info.btns.length, `${tag} every chip's tap fires (sheet opens; ready ones used from it) (${fired}/${info.btns.length})`);
      if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/dock-${w}x${h}-many-${C.n}.png` });
    }
    ok(errs === 0, `${w}x${h} 5-8 chips: no page errors (${errs})`);
    await ctx.close();
  }
  // by touch at 375x553: a rich explorer follows the glow until holding a boon, an idol and an assistant; every turn the glowing sites must take the tap
  if (!process.env.ONLY) { const ctx = await b.newContext({ viewport: { width: 375, height: 553 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); let errs = 0, dead = 0, hid = 0, turns = 0, held = null, full = 0;
    p.on('pageerror', e => { errs++; console.log('  err', String(e.stack || e).slice(0, 300)); });
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
  // F12: a real touch game at 360x640 to 2 guardians, 3 idols and 2 assistants; every boon is used by tapping its chip (swiped into view if needed), then
  // the sheet's button. Each turn every chip must be reachable on the strip, and the glowing sites must take the tap.
  { const W = 360, H = 640, ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); let errs = 0, dead = 0, turns = 0, unreach = 0, maxChips = 0, boonsUsed = 0, chipUses = 0, best = { b: 0, i: 0, a: 0 }, sq = 0;
    p.on('pageerror', e => { errs++; console.log('  err', String(e.stack || e).slice(0, 300)); });
    const cdp = await ctx.newCDPSession(p);
    const swipe = async (x0, y, dx) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] }); for (let k = 1; k <= 8; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + dx * k / 8, y }] }); await sleep(16); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(250); };
    await p.goto(S.url); await p.waitForSelector('#start [data-a=tut]'); await sleep(400);
    await p.evaluate(() => { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } startGame('vs', { np: 2, lvl: 'easy', seed: 23 }); render(); });
    const tapAt = async sel => { const r = await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => { const q = e.getBoundingClientRect(); return q.width > 2 && q.bottom > 0 && q.top < innerHeight; }); if (!e) return null; const q = e.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, h = document.elementFromPoint(x, y); return { x, y, hit: !!h && (h === e || e.contains(h)) }; }, sel); if (!r) return 0; if (!r.hit) return -1; await p.touchscreen.tap(r.x, r.y); return 1; };
    const chipTap = async sel => {   /* swipe the strip until the chip is fully in view, then tap it */
      for (let k = 0; k < 12; k++) { const r = await p.evaluate(sel => { const e = document.querySelector('#extra'), c = document.querySelector(sel); if (!e || !c) return null; const er = e.getBoundingClientRect(), q = c.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, h = document.elementFromPoint(x, y);
          return { full: q.left >= er.left - 1 && q.right <= er.right + 1, hit: !!h && (h === c || c.contains(h)), x, y, mx: er.left + er.width / 2, dir: q.left < er.left ? 1 : -1 }; }, sel);
        if (!r) return 0; if (r.full && r.hit) { await p.touchscreen.tap(r.x, r.y); return 1; } await swipe(r.mx, r.y, r.dir * 70); }
      return -1; };
    const t0 = Date.now();
    while (Date.now() - t0 < 420000) {
      const st = await p.evaluate(() => ({ mine: !!(window.G && G.phase === 'play' && myTurn() && !UI.busy), over: G.phase !== 'play', fx: !document.querySelector('#fx').hidden, q: !document.querySelector('#qbox').hidden || (!!G.q && G.q.seat === UI.view), insp: !document.querySelector('#insp').hidden,
        ex: { b: G.p[0].guards.length, i: G.p[0].idols.length, a: (G.p[0].asst || []).length } }));
      if (st.over) break;
      ['b', 'i', 'a'].forEach(k => best[k] = Math.max(best[k], st.ex[k]));
      if (await p.evaluate(() => !!document.querySelector('#goal') && !document.querySelector('#goal').hidden)) { await tapAt('#goal [data-a=goalgo]'); await sleep(400); continue; }
      if (st.fx) { await tapAt('#fx .fxcard, #fx'); await sleep(200); continue; }
      if (st.insp) { await tapAt('#insp .ix'); await sleep(200); continue; }
      if (!st.mine) { await sleep(300); continue; }
      if (st.q) { if (await tapAt('#qbox .cd.glow, #qbox .btn.go, #pacts #gobtn') !== 1) await tapAt('#qbox .btn, #pacts .btn'); await sleep(350); continue; }
      // every chip on the strip must be reachable this turn
      const chips = await p.evaluate(() => [...document.querySelectorAll('#extra button.tag')].map(c => `#extra button.tag[data-a="${c.dataset.a}"][data-k="${c.dataset.k}"]`));
      maxChips = Math.max(maxChips, chips.length);
      if (chips.length >= 5 && turns % 3 === 0) { for (const c of chips) { const r = await chipTap(c); if (r !== 1) { unreach++; console.log('  unreachable chip', c); } else { await sleep(250); await tapAt('#insp .ix'); await sleep(150); } } }
      const chk = await p.evaluate(() => { const out = []; document.querySelectorAll('#map .site.glow').forEach(s => { const q = s.getBoundingClientRect(), e = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); if (!e || !(e === s || s.contains(e))) out.push(s.dataset.i); }); return { out, sq: document.body.classList.contains('vg-squeeze') }; });
      dead += chk.out.length; if (chk.sq) sq++; turns++;
      await p.evaluate(() => { const me = G.p[0]; me.res.compass = Math.max(me.res.compass, 9); me.res.coin = Math.max(me.res.coin, 6); ['tablet', 'arrow', 'jewel'].forEach(k => me.res[k] = Math.max(me.res[k], 3)); });   /* rich enough to fight and climb each round */
      const want = await p.evaluate(() => { const me = G.p[0], L = VG.moves(G), f = t => L.find(m => m.t === t);
        const res = L.filter(m => m.t === 'res'), rn = res.find(m => m.k === 'n' && me.note < me.glass), rg = res.find(m => m.k === 'g');
        const m = (me.idols.length < 3 && f('disc')) || (me.guards.length < 2 && f('beat')) || f('boon') || ((me.asst || []).length < 2 && (rn || rg)) || f('beat') || (typeof evalMoves === 'function' && L.find(x => evalMoves().some(e => VG.same(e.m, x) && VG.same(x, e.m)) && x.t !== 'pass')) || L[0];
        return m ? { t: m.t, k: m.k, idx: mvIndex(m), r: G.round, ex: me.ex, discs: L.filter(x => x.t === 'disc').length, hid: G.sites.filter(x => !x.tile).length } : null; });
      if (process.env.DBG) console.log('  dbg', JSON.stringify(want), JSON.stringify(st.ex));
      let done = false;
      if (want && (want.t === 'boon' || want.t === 'idol' || want.t === 'asst')) {
        const sel = `#extra button.tag[data-a="${want.t === 'boon' ? 'guard' : want.t}"][data-k="${want.k}"]`, r = await chipTap(sel);
        if (r === 1) { await sleep(300); if (await tapAt(`#insp .ibtns [data-m="${want.idx}"], #insp .ibtns [data-a=mv]`) === 1) { done = true; chipUses++; if (want.t === 'boon') boonsUsed++; } } else unreach++;
      } else if (want && want.t !== 'pass') {
        await p.evaluate(i => { const el = moveTarget(UI.mv[i]); if (el) el.setAttribute('data-want', '1'); }, want.idx);
        const r = await tapAt('[data-want]'); await p.evaluate(() => document.querySelectorAll('[data-want]').forEach(e => e.removeAttribute('data-want')));
        if (r === 1) { await sleep(350); if (await tapAt(`#qbox .qchoices [data-m="${want.idx}"]`) === 1 || await tapAt('#gobtn') === 1 || want.t === 'play') done = true; }
      }
      if (!done) await tapAt('#passbtn');
      await sleep(450);
    }
    const left = await p.evaluate(() => G.p[0].guards.filter(g => !g.used && !V.GUARD[g.id].tv).length);
    ok(best.b >= 2 && best.i >= 3 && best.a >= 2, `${W}x${H} by touch: reached ${best.b} guardians, ${best.i} idols, ${best.a} assistants (want 2/3/2) in ${turns} turns`);
    ok(maxChips >= 5, `${W}x${H} by touch: held up to ${maxChips} chips`);
    ok(!unreach, `${W}x${H} by touch: every chip reachable and tapped every check (${unreach} misses, ${chipUses} uses from chips)`);
    ok(boonsUsed >= 1 && left === 0, `${W}x${H} by touch: every boon used from its chip (${boonsUsed} used, ${left} left unused)`);
    ok(!dead, `${W}x${H} by touch: every glowing site took the tap (${dead} covered)`);
    ok(!sq, `${W}x${H} by touch: the board was never squeezed away outside a chooser (${sq})`);
    ok(errs === 0, `${W}x${H} by touch: no page errors (${errs})`);
    if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/dock-touch-360.png` });
    await ctx.close(); }
  await b.close(); S.close(); console.log(fails ? `dock-fit: FAIL (${fails})` : 'dock-fit: PASS'); process.exit(fails ? 1 : 0);
})();
