#!/usr/bin/env node
// Nightrun FLOW checks (parts/music/flow.js): the song never stops or stutters. Real page, real songs, headless, no screenshots. PASS/FAIL lines.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-flow-test.js     env: GAME_DIR=...
// per viewport (390x763 phone, 1280x720 desktop):
// 1 pit stop / chest / stage result / story card: the song keeps playing (context running, stream playing, grid within 40 ms of the song), it is ducked + low-passed with the drum gate shut,
//   and returns to full on a bar line (scheduled within 40 ms of one) when the screen closes
// 2 the pit-stop clock is a whole number of bars on a bar line and runs 10 -> 0 on the beat clock
// 3 PAUSE with "Keep music playing when paused" (default on): song plays on, ducked; RESUME counts 3-2-1 and unpauses on a bar line; grid stays within 40 ms; one song only
// 4 setting off = the old pause (context suspended, song held); a hidden tab suspends, visible again resumes with one song
// 5 ?flow=0 = old behaviour (no nodes, old pause, plain pit clock); no page errors
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let bad = 0; const ok = (n, p, i) => { if (!p) bad++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i === undefined ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(); const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const open = async (w, h, q) => {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: w < 600, isMobile: w < 600 }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push('page: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(() => {
      window.__truth = () => { const m = window.__mnr, s = m.AU.slots.find(x => x.stage === m.BT.stage && x.playing); if (!m.BT || m.BT.mode !== 'file' || !s || !s.playing || s.el.paused || m.AU.a.state !== 'running') return null;
        const info = m.TR.by[s.stage], off = info.offsetMs / 1000, lat = m.AU.a.outputLatency || 0, want = (s.el.currentTime - lat - off) / (60 / info.bpm), pp = m.bpos(); let d = pp - want; d -= Math.round(d); return d * (60 / info.bpm) * 1000; };
      window.__song = () => { const m = window.__mnr; return { st: m.AU.a.state, n: m.AU.slots.filter(s => s.playing && !s.el.paused).length, ctx: m.AU.a.currentTime }; };
    });
    await p.goto(`http://127.0.0.1:${port}/index.html${q || ''}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr);
    await p.evaluate(() => document.getElementById('startBtn').click()); await p.waitForFunction(() => window.__mnr.running, null, { timeout: 8000 });
    await p.evaluate(() => { const m = window.__mnr; m.god = true; setInterval(() => { if (m.G && m.G.live) m.PW.st().cnt = 1e9; }, 30); });
    await p.waitForFunction(() => __mnr.BT.mode === 'file' && !__mnr.BT.pend && __mnr.AU.a.state === 'running', null, { timeout: 20000 });
    await sleep(2500); return { p, errs, ctx };
  };
  // samples the grid/ctx/stream for ms; returns {minN, maxErr, runningAll, n}
  const watch = async (p, ms) => { let mx = 0, n = 0, all = true, one = true; const e = Date.now() + ms; while (Date.now() < e) { const [t, s] = await p.evaluate(() => [window.__truth(), window.__song()]); if (s.st !== 'running' || s.n < 1) all = false; if (s.n > 1) one = false; if (t !== null) { n++; mx = Math.max(mx, Math.abs(t)); } await sleep(50); } return { mx, n, all, one }; };
  const barErr = (p, t) => p.evaluate(t => { const B = __mnr.BT, x = (t - B.t0 - B.off) / B.spb / 4; return Math.abs(x - Math.round(x)) * 4 * B.spb * 1000; }, t);   // ms from the nearest bar line
  const nodes = p => p.evaluate(() => { const f = NRF.f; return f ? { hz: f.f.frequency.value, g: f.g.gain.value, d: f.dg ? f.dg.gain.value : -1 } : null; });
  for (const [w, h] of [[390, 763], [1280, 720]]) {
    const tag = `${w}x${h} `, { p, errs } = await open(w, h);
    ok(tag + 'flag on, setting default on', await p.evaluate(() => RET.flow === true && __mnr.SET.keepmus === true));
    let base = await watch(p, 2500); ok(tag + `steady play grid within 40 ms (${base.mx.toFixed(1)} ms, ${base.n} samples)`, base.n > 10 && base.mx <= 40 && base.all);
    // --- screens
    const screen = async (name, open, close) => {
      await p.evaluate(open); await sleep(900); const r = await watch(p, 1800), nd = await nodes(p), dk = await p.evaluate(() => NRF.ducked);
      ok(tag + `${name}: song keeps playing, one stream, grid ${r.mx.toFixed(1)} ms`, r.all && r.one && r.n > 10 && r.mx <= 40, JSON.stringify(r));
      ok(tag + `${name}: ducked ~40%, low-passed, drums gated (${nd && nd.hz.toFixed(0)} Hz, gain ${nd && nd.g.toFixed(2)}, drum ${nd && nd.d.toFixed(2)})`, dk && nd && nd.hz < 3500 && nd.g < .7 && nd.g > .5 && nd.d < .1, JSON.stringify(nd));
      await p.evaluate(close); await sleep(200); const lg = await p.evaluate(() => NRF.log[NRF.log.length - 1]);
      const be = lg && !lg.duck ? await barErr(p, lg.at) : 999; ok(tag + `${name}: back to full scheduled on a bar line (${be.toFixed(1)} ms off)`, be <= 40, JSON.stringify(lg));
      await sleep(3200); const nd2 = await nodes(p); ok(tag + `${name}: full again (${nd2 && nd2.hz.toFixed(0)} Hz, gain ${nd2 && nd2.g.toFixed(2)}, drum ${nd2 && nd2.d.toFixed(2)})`, nd2 && nd2.hz > 19000 && nd2.g > .97 && nd2.d > .97, JSON.stringify(nd2));
      const r2 = await watch(p, 1200); ok(tag + `${name}: grid after the screen ${r2.mx.toFixed(1)} ms`, r2.n > 8 && r2.mx <= 40 && r2.one, JSON.stringify(r2)); };
    await screen('chest', () => { document.getElementById('chest').hidden = false; }, () => { document.getElementById('chest').hidden = true; });
    await screen('stage result', () => { document.getElementById('stres').hidden = false; }, () => { document.getElementById('stres').hidden = true; });
    await screen('story card', () => { let c = document.getElementById('taleCard'); if (!c) { c = document.createElement('div'); c.id = 'taleCard'; document.body.appendChild(c); } c.hidden = false; }, () => { document.getElementById('taleCard').hidden = true; });
    // --- pit stop on the beat clock
    const tPit = Date.now();
    await p.evaluate(() => { __mnr.SH.pit(() => { }); }).catch(() => { });
    const pit = await p.evaluate(() => NRF.pit && { bar: NRF.pit.bar, tot: NRF.pit.tot, end: NRF.pit.end, spb: __mnr.BT.spb });
    ok(tag + 'pit stop: clock is whole bars on a bar line', !!pit && Math.abs(pit.tot / pit.bar - Math.round(pit.tot / pit.bar)) < 1e-6 && (await barErr(p, pit.end)) <= 5, JSON.stringify(pit));
    const L0 = await p.evaluate(() => __mnr.SH.left); await sleep(900); const r = await watch(p, 1500), nd = await nodes(p);
    ok(tag + `pit stop: song plays on, ducked, grid ${r.mx.toFixed(1)} ms`, r.all && r.one && r.mx <= 40 && nd && nd.hz < 3500, JSON.stringify([r, nd]));
    await p.waitForFunction(() => !__mnr.SH.active, null, { timeout: 20000 }).catch(() => { }); const dur = (Date.now() - tPit) / 1000;
    ok(tag + `pit stop: closes by itself after ~${pit ? (pit.tot).toFixed(1) : '?'} s (took ~${dur.toFixed(1)} s, started ${L0 && L0.toFixed(1)})`, !(await p.evaluate(() => __mnr.SH.active)) && dur <= pit.tot + .8 && dur >= pit.tot - pit.bar - .8, '');
    await sleep(3500); const nd3 = await nodes(p); ok(tag + 'pit stop: full again after it', nd3 && nd3.hz > 19000 && nd3.g > .97, JSON.stringify(nd3));
    // --- pause with the song
    await p.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }))); await sleep(900);
    const a1 = await p.evaluate(() => ({ paused: __mnr.paused, s: window.__song(), d: NRF.ducked })); await sleep(900); const a2 = await p.evaluate(() => window.__song());
    ok(tag + 'pause keeps the song playing, ducked', a1.paused && a1.s.st === 'running' && a1.s.n === 1 && a1.d && a2.ctx > a1.s.ctx + .7, JSON.stringify([a1, a2]));
    const rp = await watch(p, 1200); ok(tag + `pause: grid ${rp.mx.toFixed(1)} ms`, rp.n > 8 && rp.mx <= 40 && rp.one, JSON.stringify(rp));
    await p.evaluate(() => document.getElementById('resumeBtn').click()); await sleep(250);
    const c1 = await p.evaluate(() => ({ paused: __mnr.paused, cnt: !!NRF.cnt, hid: document.getElementById('pausem').hidden })); const seen = new Set(); let tOn = 0; const e = Date.now() + 12000;
    while (Date.now() < e) { const s = await p.evaluate(() => ({ p: __mnr.paused, t: document.getElementById('flowCnt').hidden ? '' : document.getElementById('flowCnt').textContent, now: __mnr.AU.a.currentTime })); if (s.t) seen.add(s.t); if (!s.p) { tOn = s.now; break; } await sleep(15); }
    ok(tag + 'resume: pause card closes, 3-2-1 shown, then play (' + [...seen].join(' ') + ')', c1.paused && c1.cnt && c1.hid && seen.has('3') && seen.has('2') && seen.has('1') && tOn > 0, JSON.stringify(c1));
    const be = await barErr(p, tOn); ok(tag + `resume: play starts on a bar line (${be.toFixed(0)} ms off)`, be <= 60, '');
    await sleep(3000); const nd4 = await nodes(p), r4 = await watch(p, 1500); ok(tag + `resume: full level again, grid ${r4.mx.toFixed(1)} ms, one song`, nd4.hz > 19000 && nd4.g > .97 && r4.mx <= 40 && r4.one && r4.all, JSON.stringify([nd4, r4]));
    // --- setting off = the old pause
    await p.evaluate(() => { __mnr.SET.keepmus = false; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' })); }); await sleep(900);
    const o1 = await p.evaluate(() => ({ paused: __mnr.paused, st: __mnr.AU.a.state, pa: __mnr.AU.cur.el.paused })); ok(tag + 'setting off: pause suspends context and song', o1.paused && o1.st === 'suspended' && o1.pa, JSON.stringify(o1));
    await p.evaluate(() => document.getElementById('resumeBtn').click()); await sleep(1200); const o2 = await p.evaluate(() => ({ paused: __mnr.paused, s: window.__song() }));
    ok(tag + 'setting off: resume is immediate, song plays', !o2.paused && o2.s.st === 'running' && o2.s.n === 1, JSON.stringify(o2));
    // --- hidden tab while paused with the setting on
    await p.evaluate(() => { __mnr.SET.keepmus = true; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' })); }); await sleep(600);
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); }); await sleep(700);
    const h1 = await p.evaluate(() => ({ st: __mnr.AU.a.state, pa: __mnr.AU.cur.el.paused })); ok(tag + 'hidden tab stops the song', h1.st === 'suspended' && h1.pa, JSON.stringify(h1));
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); }); await sleep(1500);
    const h2 = await p.evaluate(() => ({ paused: __mnr.paused, s: window.__song(), d: NRF.ducked })); ok(tag + 'visible again: paused game, song back (ducked), one song', h2.paused && h2.s.st === 'running' && h2.s.n === 1 && h2.d, JSON.stringify(h2));
    await p.evaluate(() => document.getElementById('resumeBtn').click()); await p.waitForFunction(() => !__mnr.paused, null, { timeout: 12000 }).catch(() => { }); await sleep(3000);
    const h3 = await watch(p, 1500); ok(tag + `after all that: one song, grid ${h3.mx.toFixed(1)} ms`, h3.one && h3.all && h3.mx <= 40 && h3.n > 8, JSON.stringify(h3));
    ok(tag + 'no page errors', errs.length === 0, errs.join(' | ')); await p.context().close();
  }
  // --- flag off
  for (const [w, h] of [[390, 763], [1280, 720]]) {
    const tag = `${w}x${h} flow=0 `, { p, errs } = await open(w, h, '?flow=0');
    ok(tag + 'flag off', await p.evaluate(() => RET.flow === false && !NRF.f));
    await p.evaluate(() => { __mnr.SH.pit(() => { }); }); await sleep(1000);
    const q = await p.evaluate(() => ({ f: !!NRF.f, pit: !!NRF.pit, left: __mnr.SH.left, d: NRF.ducked })); ok(tag + 'pit stop: no nodes, no bar clock, plain 10 s clock', !q.f && !q.pit && q.left > 7.5 && q.left < 9.5 && !q.d, JSON.stringify(q));
    await p.evaluate(() => { __mnr.SH.close(); }); await sleep(300);
    await p.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }))); await sleep(900);
    const o1 = await p.evaluate(() => ({ paused: __mnr.paused, st: __mnr.AU.a.state, pa: __mnr.AU.cur.el.paused })); ok(tag + 'pause suspends context and song (old behaviour)', o1.paused && o1.st === 'suspended' && o1.pa, JSON.stringify(o1));
    await p.evaluate(() => document.getElementById('resumeBtn').click()); await sleep(900); const o2 = await p.evaluate(() => ({ paused: __mnr.paused, st: __mnr.AU.a.state }));
    ok(tag + 'resume is immediate', !o2.paused && o2.st === 'running', JSON.stringify(o2)); ok(tag + 'no page errors', errs.length === 0, errs.join(' | ')); await p.context().close();
  }
  await br.close(); srv.kill(); console.log(bad ? `${bad} FAILED` : 'ALL PASS'); process.exit(bad ? 1 : 0);
})();
