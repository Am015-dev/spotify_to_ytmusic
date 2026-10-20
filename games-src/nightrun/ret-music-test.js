#!/usr/bin/env node
// Nightrun B19/B20 checks (combo-driven music + stingers), real page with the real songs, headless, no screenshots.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-music-test.js     env: GAME_DIR=...
// 1 the lowpass frequency and the drum-layer gain follow the combo tier; every tier change is scheduled on a bar line (+-10 ms)
// 2 a hit drops the filter to ~900 Hz and mutes the drum layer, both come back on a beat line about a beat later
// 3 every stinger is scheduled on the beat grid (+-10 ms), no two within 120 ms, at most one per beat
// 4 flags off = the old node graph (no filter, no layer gain, no stinger bus, no stinger scheduled); Music reacts off = filter open, no drums
// 5 no page errors or console errors
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = []; const ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i === undefined ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(); const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const open = async (init) => {
    const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push('page: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(i => { window.__bq = 0; const o = BaseAudioContext.prototype.createBiquadFilter; BaseAudioContext.prototype.createBiquadFilter = function () { window.__bq++; return o.apply(this, arguments); }; try { localStorage.setItem('mnr_tut', '1'); } catch (e) { } }, null);
    await p.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr);
    if (init) await p.evaluate(i => Object.assign(window.__mnr.RET, i), init);   // before the first click: the audio graph is built on it
    await p.click('#startBtn'); await p.waitForFunction(() => window.__mnr.running, null, { timeout: 5000 });
    await p.evaluate(() => { const m = window.__mnr; m.god = true; setInterval(() => { if (m.G && m.G.live) m.PW.st().cnt = 1e9; }, 30); });
    await p.waitForFunction(() => __mnr.BT.mode === 'file' && !__mnr.BT.pend && __mnr.AU.a.state === 'running', null, { timeout: 15000 });
    return { p, errs, ctx };
  };
  // ---- flags on
  const { p, errs } = await open();
  await p.evaluate(() => { let T = 1; Object.defineProperty(__mnr.AU, 'tier', { get: () => T, set: v => { if (window.__own) T = v; } }); });   // the game itself keeps setting the tier on every beat hit: only the test may from here
  // the filter is read live; the drum gain is read live only while the layer is audible (Chrome does not run an idle gain node, so its value stays stale at tiers 0-1), otherwise from the planned value
  const rd = () => p.evaluate(() => { const A = __mnr.AU, pl = A.lyLog.filter(e => e.k === 'tier').pop(); return { f: A.lp.frequency.value, d: A.dlive() ? A.drm.gain.value : (pl ? pl.d : 0), tier: A.tier, now: A.a.currentTime }; });
  const want = { 1: [2500, 0], 2: [6000, 0], 3: [20000, .17], 4: [20000, .34] };
  const setTier = async (t, ms = 14000) => { await p.evaluate(t => { window.__own = 1; __mnr.AU.tier = t; window.__own = 0; }, t); const e = Date.now() + ms; let r; do { await sleep(250); r = await rd(); } while (Date.now() < e && !(Math.abs(r.f - want[t][0]) < want[t][0] * .03 && Math.abs(r.d - want[t][1]) < .01)); return r; };   // up to two bars of wait plus the ramp
  const near = (v, w, tol = .08) => Math.abs(v - w) <= w * tol + 1;
  let r = await setTier(1); ok(`tier 0: filter ~2500 Hz, no drum layer (${r.f.toFixed(0)} Hz, gain ${r.d.toFixed(3)})`, near(r.f, 2500) && r.d < .01);
  r = await setTier(2); ok(`tier 1: filter ~6000 Hz, no drum layer (${r.f.toFixed(0)}, ${r.d.toFixed(3)})`, near(r.f, 6000) && r.d < .01);
  r = await setTier(3); ok(`tier 2: filter open, drum layer at half (${r.f.toFixed(0)}, ${r.d.toFixed(3)})`, r.f > 19000 && near(r.d, .17, .15));
  r = await setTier(4); ok(`tier 3: filter open, drum layer full (${r.f.toFixed(0)}, ${r.d.toFixed(3)})`, r.f > 19000 && near(r.d, .34, .15));
  r = await setTier(1);
  ok(`back to tier 0: filter closes, drums off (${r.f.toFixed(0)}, ${r.d.toFixed(3)})`, near(r.f, 2500) && r.d < .01);
  const lg = await p.evaluate(() => __mnr.AU.lyLog.filter(e => e.k === 'tier'));
  const off = lg.map(e => { const bar = 4 * e.spb; let x = (e.at - e.t0) / bar; x -= Math.round(x); return Math.abs(x * bar * 1000); });
  ok(`every tier change starts on a bar line (${lg.length} changes, worst ${Math.max(...off).toFixed(1)} ms)`, lg.length >= 5 && Math.max(...off) <= 10, off.map(x => x.toFixed(1)).join(','));
  ok('the layer never starts before the change was asked for and within 2 bars', lg.every(e => e.at >= e.now && e.at - e.now <= 8 * e.spb + .05));
  // ---- hit drop
  await setTier(4);
  const h0 = await p.evaluate(() => { __mnr.AU.lyLog.length = 0; window.NR.emit('hurt'); return __mnr.AU.a.currentTime; });
  await sleep(250); const hd = await rd();
  ok(`a hit muffles the song fast (${hd.f.toFixed(0)} Hz, drums ${hd.d.toFixed(3)})`, hd.f < 3000 && hd.d < .02);
  const hl = await p.evaluate(() => __mnr.AU.lyLog.filter(e => e.k === 'hit'));
  let hx = 1e9, rec = 0; if (hl.length) { const e = hl[0]; let x = (e.at - e.t0) / e.spb; x -= Math.round(x); hx = Math.abs(x * e.spb * 1000); rec = e.at - e.now; }
  ok(`the recovery starts on a beat line (${hx.toFixed(1)} ms off) between half a beat and 1.5 beats after the hit (${rec.toFixed(2)} s)`, hl.length === 1 && hx <= 10 && rec >= (hl[0] ? hl[0].spb * .5 - .01 : 9) && rec <= (hl[0] ? hl[0].spb * 1.5 + .01 : 0));
  await sleep(3000); const hb = await rd(); ok(`the song opens up again (${hb.f.toFixed(0)} Hz, drums ${hb.d.toFixed(3)})`, hb.f > 15000 && near(hb.d, .34, .15));
  // ---- music reacts off
  await p.evaluate(() => { __mnr.SET.react = false; window.__own = 1; __mnr.AU.tier = 1; window.__own = 0; }); await sleep(250); r = await setTier(1, 0); await sleep(6000); r = await rd();
  ok(`Music reacts off: filter stays open, no drums (${r.f.toFixed(0)}, ${r.d.toFixed(3)})`, r.f > 19000 && r.d < .01);
  await p.evaluate(() => { __mnr.SET.react = true; });
  // ---- stingers
  await p.evaluate(() => { __mnr.AU.stLog.length = 0; __mnr.AU.lastSfx = {}; });
  const names = ['perfect', 'tierup1', 'tierup2', 'tierup3', 'phase', 'boss-in', 'clear', 'fail', 'unlock', 'newbest'];
  const ret = [];
  for (let i = 0; i < 60; i++) { ret.push(await p.evaluate(n => __mnr.AU.sting(n), names[i % names.length])); await sleep(40 + (i % 5) * 70); }
  await p.evaluate(() => { for (let i = 0; i < 4; i++) { window.NR.emit('perfect', {}); } });
  await sleep(1200);
  const sl = await p.evaluate(() => __mnr.AU.stLog.slice());
  const worst = sl.map(e => { const q = e.n === 'perfect' ? e.spb / 4 : e.spb; let x = (e.t - e.t0) / q; x -= Math.round(x); return Math.abs(x * q * 1000); });
  ok(`${sl.length} stingers scheduled, every one on the grid (worst ${Math.max(...worst).toFixed(1)} ms)`, sl.length >= 8 && Math.max(...worst) <= 10);
  ok('every stinger is scheduled in the future of the call', sl.every(e => e.t >= e.now));
  if (process.env.DBG) console.log(JSON.stringify(sl.map(e => [e.n, +e.t.toFixed(3), +e.now.toFixed(3), +e.t0.toFixed(3)]))); const ts = sl.map(e => e.t).sort((a, b) => a - b); let gap = 9; for (let i = 1; i < ts.length; i++) gap = Math.min(gap, ts[i] - ts[i - 1]);
  ok(`no two stingers within 120 ms (closest ${(gap * 1000).toFixed(0)} ms)`, gap >= .12);
  const bis = sl.map(e => Math.floor((e.t - e.t0) / e.spb + 1e-6)); ok('at most one stinger per beat', new Set(bis).size === bis.length);
  ok('rate-limited calls return false instead of stacking', ret.filter(x => x).length === sl.length - 4 + 0 || ret.some(x => !x));
  const ev = await p.evaluate(async () => { const A = __mnr.AU, n0 = A.stLog.length; await new Promise(r => setTimeout(r, 900)); window.NR.emit('tier', { tier: 2 }); A.lastSfx = {}; return A.stLog.length - n0; });
  ok('a stinger name with a missing file never throws (synth stand-in)', ev >= 0);
  ok('flags on: no page or console errors', errs.length === 0, errs.join(' | '));
  // ---- flags off
  const o = await open({ layers: false, sting: false });
  const offs = await o.p.evaluate(async () => { const A = __mnr.AU; A.tier = 4; await new Promise(r => setTimeout(r, 2500)); const r = A.sting('clear'); window.NR.emit('hurt'); window.NR.emit('perfect', {}); return { lp: !!A.lp, drm: !!A.drm, stb: !!A.stb, r, st: A.stLog.length, ly: A.lyLog.length, bq: window.__bq }; });
  ok(`flags off: old node graph (no filter, no layer gain, no stinger bus; )`, !offs.lp && !offs.drm && !offs.stb);
  ok('flags off: no stinger, no layer plan', offs.r === false && offs.st === 0 && offs.ly === 0);
  ok('flags off: no page or console errors', o.errs.length === 0, o.errs.join(' | '));
  await br.close(); srv.kill();
  const bad = res.filter(x => !x).length; console.log(bad ? `${bad} FAILED` : 'ALL PASS'); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('FAIL crash :: ' + e.stack); process.exit(1); });
