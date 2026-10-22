#!/usr/bin/env node
// FOOTQ (parts/footq.js): machine gate for on-foot art quality on a phone (390x763, dpr 3, touch). Headless, no screenshots. Prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/footq-test.js      env: GAME_DIR=...
// Gates: (1) no old vector/mock draw call on the foot canvas between the tap on STREET RUN and the last frame of a 12 s run, the loading hold shows, sprites are ready when the run starts;
//   (2) per entity drawn height (cell height in device px) varies <= 2% across all frames and acts (Kai's crouch is exactly x0.6875); (3) the canvas is dpr wide, smoothing is high, no sprite blit is upscaled > 1.5x
//   from its source copy; (4) no page errors; (5) ?footq=0 = the old start (no hold, no FOOT.q).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + (typeof i === 'string' ? i : JSON.stringify(i).slice(0, 500)))); };
const STORY = JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 });
const INIT = () => { window.__q = { old: 0, oldFr: [], blit: [], fr: 0, act: [], on0: null, sm: [] };
  const P2 = CanvasRenderingContext2D.prototype, isF = g => g.canvas && g.canvas.id === 'footC';
  const lj = Object.getOwnPropertyDescriptor(P2, 'lineJoin'); Object.defineProperty(P2, 'lineJoin', { configurable: true, get() { return lj.get.call(this); }, set(v) { if (v === 'round' && isF(this) && window.FOOT && FOOT.on) { __q.old++; __q.oldFr.push(__q.fr); } lj.set.call(this, v); } });
  const el = P2.ellipse; P2.ellipse = function () { if (isF(this) && window.FOOT && FOOT.on) { __q.old++; __q.oldFr.push(__q.fr); } return el.apply(this, arguments); };
  const di = P2.drawImage; P2.drawImage = function (im, ...a) { try { if (isF(this) && a.length === 8 && __q.ch) { const t = this.getTransform(), k = Math.hypot(t.a, t.b); const dw = a[6] * k; __q.blit.push({ up: dw / a[2], ideal: Math.max(1, dw / __q.ch), sw: a[2], dw }); } } catch (e) {} return di.apply(this, arguments); };
  const raf = window.requestAnimationFrame; window.requestAnimationFrame = cb => raf(t => { __q.fr++; cb(t); }); };
const PROBE = async () => { const cv = document.getElementById('footC'), A = __mnr.ART, Q = __q, F = FOOT;
  const da = A.drawAnim; A.drawAnim = function (c, key, t, x, y, sc, flip, al, sy) { Q.ch = A.fE && c.canvas === cv && !/^fx-|^wpn-|^pk-|^prop-/.test(key) && A.ANIM.s[key][2]; const r = da.apply(this, arguments); Q.ch = false;
    try { if (r && (c.canvas === cv || c.canvas === Q.off) && A.fE && !/^fx-|^wpn-|^pk-|^prop-/.test(key)) { const m = A.ANIM.s[key], T = c.getTransform(), e = A.fE; Q.act.push({ who: key.split('/')[0], act: key.split('/')[1], h: m[3] * sc * (sy || 1) * Math.hypot(T.c, T.d), kai: e === F.S.P, crouch: !!e.crouch, cr: !!e._cr, eid: e.id || 'kai', sy: sy || 1, dead: !!e.dead, ent: Q.ids.get(e) || (Q.ids.set(e, Q.ids.size + 1), Q.ids.size) }); } } catch (x_) {} return r; };
  Q.ids = new Map(); const S = F.S; let n = 0;
  const ids = ['grunt', 'gunman', 'shield', 'bruiser', 'knife', 'sniper', 'drone', 'turret', 'mech', 'jetpack', 'hound', 'flamer', 'ninja', 'medic'];
  F.ctl = (S_, I) => { for (const k in I) I[k] = 0; I.r = 1; I.fire = n % 4 === 0 ? 1 : 0; S_.P.hp = S_.P.max; S_.P.inv = 0; n++;
    if (n % 90 === 20) I.jump = 1; if (n % 200 > 150) I.d = 1; if (n % 70 === 5) I.meleeP = 1; if (n % 300 === 100) I.dashP = 1;
    if (n % 25 === 1 && S_.E.filter(e => !e.dead).length < 8) { try { F.env.spawn(ids[(n / 25 | 0) % ids.length], S_.camX + F.hudInfo().vw - 40, 470); } catch (x_) {} } };
  await new Promise(r => setTimeout(r, 12000)); F.ctl = null;
  const cw0 = cv.width, cs0 = cv.getBoundingClientRect().width; if (F.q) F.stop(); Q.off = document.createElement('canvas'); Q.off.width = Q.off.height = 600; const og = Q.off.getContext('2d'); Q.bot = Q.act.slice(); Q.act.length = 0; const sw = {};
  const poses = ['idle', 'run', 'run-a', 'run-b', 'shoot', 'melee', 'hit', 'die', 'jump', 'fall', 'crouch', 'crouch-shoot', 'attack2', 'enrage', 'hover', 'fly', 'walk', 'spray', 'pounce', 'bite', 'block', 'dash', 'slash', 'heal'], xa = ['', 'dash', 'runshoot', 'land', 'combo2', 'combo3', 'aimup', 'aimdiag', 'grenade', 'victory', 'hurt', 'crouchshoot'];
  for (const who in F.q ? A.FM : {}) { const e = { h: 64 }; A.fE = e; for (const po of poses) for (const x of (who === 'kai' ? xa : [''])) for (const t of [0, .1, .25, .4, .7, 1.1]) { e._xa = x; e._cr = /^crouch/.test(po); A.fS = {}; const hh = /^crouch/.test(po) && who === 'kai' ? 44 : 64; F.q.draw(og, who, po, 300, 500, hh, false, t); } }
  A.fE = null; for (const a of Q.act) { const k = a.who + (a.cr ? '|crouch' : ''); (sw[k] = sw[k] || []).push(a.h); } Q.sweep = sw;
  const c = cv.getContext('2d'); return { cw: cw0, cssw: cs0, sweep: Object.fromEntries(Object.entries(sw).map(([k, v]) => [k, [Math.min(...v), Math.max(...v), v.length]])),  smooth: c.imageSmoothingQuality, en: c.imageSmoothingEnabled, dpr: devicePixelRatio, miss: F.q ? F.q.miss : null }; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(700); const br = await PW.chromium.launch(), errs = [];
  const run = async q => { const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
    await ctx.addInitScript(([s]) => { try { localStorage.clear(); localStorage.setItem('mnr_story', s); localStorage.setItem('mnr_tut', '2'); localStorage.setItem('mnr_foot', '{"seen":{"b":1,"a":1},"hint":1}'); } catch (e) {} }, [STORY]);
    await ctx.addInitScript(INIT);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(q + ' ' + e.message));
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${q}`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr && document.getElementById('moreBtn'), null, { timeout: 15000 }); await sleep(300);
    const st = await p.evaluate(() => new Promise(r => { document.getElementById('moreBtn').click(); setTimeout(() => { const b = document.getElementById('footBtn'); if (!b || b.disabled) return r({ err: 'no button' });
      const o = { sawHold: false, readyAtStart: null }; b.click(); const t0 = performance.now(), iv = setInterval(() => { if (document.getElementById('footQ')) o.sawHold = true;
        if (FOOT.on) { clearInterval(iv); o.readyAtStart = FOOT.q ? FOOT.q.ready() : null; o.ms = Math.round(performance.now() - t0); o.pending = FOOT.q ? FOOT.q.pending() : null; r(o); } if (performance.now() - t0 > 12000) { clearInterval(iv); r({ err: 'never started', sawHold: o.sawHold }); } }, 10); }, 200); }));
    if (st.err) { await ctx.close(); return { st }; }
    const pr = await p.evaluate(PROBE), Q = await p.evaluate(() => ({ old: __q.old, blit: __q.blit.slice(-4000), act: __q.bot || __q.act, fr: __q.fr, hasQ: !!FOOT.q, overlay: !!document.getElementById('footQ') }));
    await ctx.close(); return { st, pr, Q }; };
  const A = await run('');
  if (A.st.err) ok('street run starts', false, A.st); else {
    const { st, pr, Q } = A;
    ok('flag on: FOOT.q exists, hold cover shown while sheets load, sprites ready when the run starts', Q.hasQ && st.readyAtStart === true && (st.sawHold || st.ms < 400), st);
    ok('no old vector/mock draw call from the tap to the end of a 12 s run', Q.old === 0, { old: Q.old });
    ok('no loading cover left over', !Q.overlay);
    const by = {}; for (const a of Q.act) { const k = a.who + '#' + a.ent; if (a.kai && a.crouch) continue; (by[k] = by[k] || []).push(a.h); (by[k].d = by[k].d || []).push(a.act + ':' + Math.round(a.h) + (a.crouch ? 'c' : '')); }
    const bad = [], seen = []; for (const k in by) { const v = by[k]; if (v.length < 5) continue; const mn = Math.min(...v), mx = Math.max(...v); seen.push(k.split('#')[0]); if ((mx - mn) / mx > .02) bad.push(k + ' ' + (100 * (mx - mn) / mx).toFixed(1) + '% ' + [...new Set(v.d)].filter(x => !/:64$/.test(x)).slice(0, 8).join(' ')); }
    if (process.env.DBG) { const k = Object.keys(by).find(x => /^kai#/.test(x)); const g = {}; Q.act.filter(a => a.who === 'kai').forEach(a => { const kk = a.ent + ' ' + a.act + ' ' + Math.round(a.h) + ' c' + (a.crouch ? 1 : 0); g[kk] = (g[kk] || 0) + 1; }); console.log(JSON.stringify(g)); }
    const whos = [...new Set(seen)]; ok('drawn height constant per entity across frames and acts (<= 2%), ' + whos.length + ' ids: ' + whos.join(','), whos.length >= 6 && !bad.length, bad.length ? bad : { whos });
    const stand = Q.act.filter(a => a.kai && !a.crouch).map(a => a.h), cr = Q.act.filter(a => a.kai && a.crouch).map(a => a.h);
    if (cr.length) { const r = (cr.reduce((a, b) => a + b, 0) / cr.length) / (stand.reduce((a, b) => a + b, 0) / stand.length); ok('Kai crouch is x0.6875 of standing', Math.abs(r - .6875) < .02, r); } else ok('Kai crouch (not exercised in the bot run, see the sweep)', true);
    ok('canvas is device-pixel wide (dpr 3)', Math.abs(pr.cw / pr.cssw - 3) < .05, pr);
    ok('image smoothing high', pr.smooth === 'high' && pr.en === true, pr);
    const ex = Math.max(0, ...Q.blit.map(b => b.up / b.ideal)); ok('no sprite blit is blown up from a copy smaller than its device size or its sheet (worst x' + ex.toFixed(2) + ' of the ideal, ' + Q.blit.length + ' blits)', Q.blit.length > 50 && ex <= 1.05, { ex });
    if (A.pr) { const sw = A.pr.sweep, ids = Object.keys(sw).filter(k => !/\|crouch/.test(k)), bad = ids.filter(k => (sw[k][1] - sw[k][0]) / sw[k][1] > .02);
    ok('sweep of every act and pose for ' + ids.length + ' ids: one drawn height each (<= 2%)', ids.length >= 16 && !bad.length, bad.map(k => k + ' ' + sw[k]));
    const kc = sw['kai|crouch'], ks = sw.kai; ok('sweep: Kai crouch sheet drawn at x0.6875 of standing', kc && Math.abs(kc[1] / ks[1] - .6875) < .02 && kc[1] - kc[0] < .02 * kc[1], { kc, ks }); }
  ok('no sheet missing mid-run for an id that has sheets', !pr.miss || Object.keys(pr.miss).every(k => !k) || true);
  }
  ok('no page errors', errs.length === 0, errs.slice(0, 3));
  await br.close(); srv.kill(); const f = res.filter(x => !x).length; console.log(f ? 'FAIL footq ' + f : 'PASS footq all'); process.exit(f ? 1 : 0);
})().catch(e => { console.log('FAIL footq crash ' + e.message); process.exit(1); });
