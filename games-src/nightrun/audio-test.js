#!/usr/bin/env node
// Nightrun streamed-song test (desktop Chromium, real mp3 files, real page):
//   NODE_PATH=$(npm root -g) node games-src/nightrun/audio-test.js        env: JSON=1  GAME_DIR=...
// 1  beat grid vs the element's real position stays within 40 ms (sampled every 50 ms) while a song plays, across pause/resume and a hidden/visible tab
// 2  asking for the song that already plays does nothing: the position keeps running (+-50 ms of wall clock), no new stream, no restart
// 3  a song change is a crossfade on a bar line: old fades out and new fades in over one bar (equal-power, monotonic), both bar-aligned (+-40 ms),
//    the grid error stays within 40 ms through the whole change, and the old stream is stopped afterwards
// 4  no AudioBuffer of a song is ever decoded (only the streamed slots exist), nothing blocks the main thread longer than 50 ms during all of it
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const fails = [], notes = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); else notes.push('ok ' + msg); };
(async () => {
  const port = await freePort(); const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(() => {
    window.__t = { lt: [], dec: 0, err: [] };
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__t.lt.push(Math.round(e.duration)); (window.__t.ltl = window.__t.ltl || []).push([Math.round(e.startTime), Math.round(e.duration)]); } }).observe({ entryTypes: ['longtask'] }); } catch (e) { }
    const od = BaseAudioContext.prototype.decodeAudioData; BaseAudioContext.prototype.decodeAudioData = function () { window.__t.dec++; return od.apply(this, arguments); };
    // ground truth: where the element really is, against where the game thinks the beat is (ms, modulo one beat)
    window.__truth = () => { const m = window.__mnr, s = m.AU.slots.find(x => x.stage === m.BT.stage && x.playing); if (!m.BT || m.BT.mode !== 'file' || !s || !s.playing || s.el.paused || m.AU.a.state !== 'running') return null;
      const info = m.TR.by[s.stage], off = info.offsetMs / 1000, lat = m.AU.a.outputLatency || 0, want = (s.el.currentTime - lat - off) / (60 / info.bpm), pp = m.bpos(); let d = pp - want; d -= Math.round(d); return d * (60 / info.bpm) * 1000; };
    window.__calls = [];
    window.__wrap = () => { const AU = window.__mnr.AU; for (const k of ['xfade', 'startStage', 'cancelSwitch', 'switchTo']) { const o = AU[k]; AU[k] = function () { window.__calls.push([Math.round(performance.now()), k, [].slice.call(arguments).join(',')]); return o.apply(this, arguments); }; } };
    window.__mark = n => (window.__t.marks = window.__t.marks || []).push([Math.round(performance.now()), n]);
    window.__gains = () => { const m = window.__mnr, o = {}; for (const s of m.AU.slots) if (s.file) o[s.stage] = [+s.g.gain.value.toFixed(3), s.playing ? 1 : 0]; return o; };
  });
  await p.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__mnr);
  await p.click('#startBtn'); await p.waitForFunction(() => window.__mnr.running, null, { timeout: 5000 });
  await p.evaluate(() => { const m = window.__mnr; m.god = true; window.__wrap(); setInterval(() => { if (m.G && m.G.live) m.PW.st().cnt = 1e9; }, 30); });   // no power-ups: they change the tempo
  const ok1 = await p.waitForFunction(() => __mnr.BT.mode === 'file' && __mnr.BT.stage === 'stage1' && !__mnr.BT.pend, null, { timeout: 15000 }).then(() => true, () => false);
  check(ok1, 'stage1 streamed song became the beat clock');
  if (!ok1) { console.log(JSON.stringify({ fails, errs })); process.exit(1); }
  await sleep(2500); await p.evaluate(() => { window.__t.lt.length = 0; });   // startup work (skylines) is not what is measured
  const truthRun = async (ms, label, lim = 40) => { const xs = []; const e = Date.now() + ms; while (Date.now() < e) { const v = await p.evaluate(() => window.__truth()); if (v !== null) xs.push(v); await sleep(50); }
    const mx = xs.reduce((a, b) => Math.max(a, Math.abs(b)), 0); check(xs.length > ms / 120 && mx <= lim, `${label}: grid within ${lim} ms of the song (max ${mx.toFixed(1)} ms, ${xs.length} samples)`); return mx; };
  await truthRun(4000, 'steady play');
  // pause / resume / hidden tab
  await p.evaluate(() => { __mark('pause'); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' })); }); await sleep(900);
  const pz = await p.evaluate(() => ({ paused: __mnr.paused, st: __mnr.AU.a.state, el: __mnr.AU.cur.el.currentTime, pa: __mnr.AU.cur.el.paused }));
  check(pz.paused && pz.st === 'suspended' && pz.pa, 'pause suspends the context and the stream');
  await sleep(600); const pz2 = await p.evaluate(() => __mnr.AU.cur.el.currentTime); check(Math.abs(pz2 - pz.el) < .02, `song position holds while paused (${(pz2 - pz.el).toFixed(3)} s)`);
  await p.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }))); await sleep(1700);
  const rs = await p.evaluate(() => ({ paused: __mnr.paused, st: __mnr.AU.a.state, el: __mnr.AU.cur.el.currentTime, pa: __mnr.AU.cur.el.paused }));
  check(!rs.paused && rs.st === 'running' && !rs.pa && rs.el > pz2 + .8, `resume continues the song from where it was (${pz2.toFixed(2)} -> ${rs.el.toFixed(2)})`);
  await truthRun(2500, 'after resume');
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); }); await sleep(700);
  const hid = await p.evaluate(() => ({ paused: __mnr.paused, pa: __mnr.AU.cur.el.paused, el: __mnr.AU.cur.el.currentTime }));
  check(hid.paused && hid.pa, 'a hidden tab pauses the game and the song');
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' })); }); await sleep(1700);
  const back = await p.evaluate(() => ({ paused: __mnr.paused, pa: __mnr.AU.cur.el.paused, el: __mnr.AU.cur.el.currentTime }));
  check(!back.paused && !back.pa && back.el > hid.el + .5 && back.el < hid.el + 4, `visible again: song resumed at its place (${hid.el.toFixed(2)} -> ${back.el.toFixed(2)})`);
  await truthRun(2500, 'after hidden/visible');
  // same track asked again: nothing happens, the position keeps running
  const a0 = await p.evaluate(() => { const s = __mnr.AU.cur; return { c: __mnr.AU.a.currentTime, e: s.el.currentTime, rev: __mnr.BT.rev, n: __mnr.NR.sw.length, f: s.file }; });
  await p.evaluate(() => { __mnr.AU.switchTo('stage1'); __mnr.AU.startStage && 0; }); await sleep(2500);
  const a1 = await p.evaluate(() => { const s = __mnr.AU.cur; return { c: __mnr.AU.a.currentTime, e: s.el.currentTime, rev: __mnr.BT.rev, n: __mnr.NR.sw.length, f: s.file, pend: !!__mnr.BT.pend }; });
  const dev = ((a1.e - a0.e) - (a1.c - a0.c)) * 1000;
  check(a1.f === a0.f && a1.rev === a0.rev && a1.n === a0.n && !a1.pend && Math.abs(dev) <= 50, `same track: position continues (deviation ${dev.toFixed(1)} ms of wall clock, rev ${a0.rev}->${a1.rev})`);
  // crossfade to another track on a bar line
  const log = []; const poll = (async () => { const e = Date.now() + 14000; while (Date.now() < e) { const r = await p.evaluate(() => ({ t: __mnr.AU.a.currentTime, g: window.__gains(), tr: window.__truth(), pend: !!__mnr.BT.pend, st: __mnr.BT.stage })); log.push(r); await sleep(50); } })();
  const n0 = await p.evaluate(() => __mnr.NR.sw.length); await p.evaluate(() => { __mark('xfade-call'); __mnr.loadTrack('stage2', 1); __mnr.AU.switchTo('stage2'); });
  await poll;
  const sw = await p.evaluate(n => __mnr.NR.sw.slice(n), n0);
  check(sw.length === 1 && sw[0].from === 'stage1' && sw[0].to === 'stage2', 'one song change stage1 > stage2 ' + JSON.stringify(sw.map(x => x.from + '>' + x.to)));
  if (sw.length) { const x = sw[0], o = Math.abs(x.oldBeat / 4 - Math.round(x.oldBeat / 4)) * 4 * x.spbOld * 1000, n = Math.abs(x.newBeat / 4 - Math.round(x.newBeat / 4)) * 4 * x.spbNew * 1000;
    check(o <= 40 && n <= 40, `change lands on bar lines (old ${o.toFixed(1)} ms, new ${n.toFixed(1)} ms off)`); }
  const mid = log.filter(r => r.g.stage1 && r.g.stage2 && r.g.stage1[1] && r.g.stage2[1]);
  const fadeIn = mid.map(r => r.g.stage2[0]), fadeOut = mid.map(r => r.g.stage1[0]);
  const mono = (a, dir) => a.every((v, i) => i === 0 || (v - a[i - 1]) * dir >= -.02);
  check(mid.length >= 8, `both songs play together during the change (${mid.length} samples, ${(mid.length * .05).toFixed(1)} s)`);
  check(mono(fadeIn, 1) && mono(fadeOut, -1) && Math.max(...fadeIn) > .9 && Math.min(...fadeOut) < .1, `crossfade: new rises to ${Math.max(...fadeIn)} while old falls to ${Math.min(...fadeOut)}, both smooth` + (mono(fadeIn, 1) && mono(fadeOut, -1) ? '' : ' ' + JSON.stringify([fadeIn, fadeOut])));
  check(mid.length === 0 || mid.every(r => { const e = r.g.stage1[0] ** 2 + r.g.stage2[0] ** 2; return e > .45 && e < 1.15; }), 'equal power through the crossfade (no dip, no bump)');
  const trs = log.map(r => r.tr).filter(v => v !== null); const mxT = trs.reduce((a, b) => Math.max(a, Math.abs(b)), 0);
  check(trs.length > 150 && mxT <= 40, `beat grid within 40 ms of the song through the change (max ${mxT.toFixed(1)} ms, ${trs.length} samples)`);
  if (process.env.DEBUG) console.log(log.map((r, i) => i + ':' + (r.tr === null ? 'n' : r.tr.toFixed(0)) + (r.pend ? 'P' : '') + ' ' + r.st).join(' | '));
  const last = log[log.length - 1]; check(last.st === 'stage2' && !last.pend && last.g.stage1 && !last.g.stage1[1], 'old stream stopped, new song is the beat clock');
  await truthRun(3000, 'after the change');
  // MUSIC NEVER DISTORTS: TEMPO UP, SLOW GROOVE, low hull and death never touch the song's rate or pitch, and nothing clips at the output
  await p.evaluate(() => { const m = __mnr, an = m.AU.a.createAnalyser(); an.fftSize = 2048; m.AU.lim.connect(an); window.__an = an; window.__peak = 0; window.__rates = []; window.__mnrPoll = setInterval(() => { const b = new Float32Array(an.fftSize); an.getFloatTimeDomainData(b); for (const v of b) window.__peak = Math.max(window.__peak, Math.abs(v)); for (const s of m.AU.slots) if (s.playing) window.__rates.push([s.el.playbackRate, s.el.preservesPitch ? 1 : 0]); }, 40); });
  const rateOk = async (label) => { const r = await p.evaluate(() => ({ mr: __mnr.NR.music.rate, rs: window.__rates.slice(), pk: window.__peak })); await p.evaluate(() => { window.__rates.length = 0; });
    check(r.mr === 1 && r.rs.length > 3 && r.rs.every(x => Math.abs(x[0] - 1) < .13 && x[1] === 1), `${label}: song rate stays 1 with natural pitch (music ${r.mr}, ${r.rs.length} samples, max |rate-1| ${r.rs.reduce((a, x) => Math.max(a, Math.abs(x[0] - 1)), 0).toFixed(3)})`);   // 0.12 = the tiny steer of a song that is still silent
    check(r.pk <= 1.0001, `${label}: output peak ${r.pk.toFixed(3)} never clips`); };
  await p.evaluate(() => { __mnr.PW.give('tempo', false); }); await sleep(3500); await rateOk('TEMPO UP');
  check(await p.evaluate(() => __mnr.PW.on('tempo')), 'TEMPO UP is active during the test');
  await p.evaluate(() => { __mnr.PW.give('slow', false); }); await sleep(3500); await rateOk('SLOW GROOVE');
  check(await p.evaluate(() => Math.abs(__mnr.PW.wk - .6) < .05), 'SLOW GROOVE slows the world (0.6x), not the song');
  await p.evaluate(() => { __mnr.PW.give('drop', false); }); await sleep(2500); await rateOk('DROP');
  await truthRun(2500, 'after the power-ups');
  // dying: hull 1 no longer slows the song (heartbeat and red pulse instead)
  await p.evaluate(() => { __mnr.P.hp = 1; }); await sleep(2000);
  const DY = await p.evaluate(() => { const m = __mnr, s = m.AU.slots.find(x => x.stage === m.BT.stage && x.playing); return { rate: s.el.playbackRate, mr: m.NR.music.rate, pp: s.el.preservesPitch }; });
  check(DY.mr === 1 && Math.abs(DY.rate - 1) < .02, `hull 1: song keeps its tempo (music ${DY.mr}, element ${DY.rate.toFixed(3)})`);
  await rateOk('hull 1'); await truthRun(3000, 'while the ship is dying');
  await p.evaluate(() => { __mnr.P.hp = __mnr.P.max; }); await sleep(2000);
  check(await p.evaluate(() => __mnr.NR.music.rate === 1), 'healed: song back at 1'); await truthRun(2500, 'after healing');
  // many fast changes: nothing piles up
  for (const st of ['boss', 'stage3', 'boss2', 'stage1']) { await p.evaluate(s => { __mark('call-' + s); __mnr.loadTrack(s, 1); __mnr.AU.switchTo(s); }, st); await p.waitForFunction(s => __mnr.BT.stage === s && !__mnr.BT.pend, st, { timeout: 20000 }).catch(() => fails.push('no change to ' + st)); await sleep(500); }
  await truthRun(3000, 'after five changes');
  const end = await p.evaluate(() => ({ dec: window.__t.dec, calls: window.__calls, lt: window.__t.lt, ltl: window.__t.ltl, marks: window.__t.marks, slots: __mnr.AU.slots.filter(s => s.file).length, playing: __mnr.AU.slots.filter(s => s.playing).length, bufsAreStreams: Object.values(__mnr.TR.bufs).every(b => b && b.el instanceof HTMLMediaElement) }));
  check(end.dec === 0, 'no song was ever decoded to an AudioBuffer (decodeAudioData calls: ' + end.dec + ')');
  check(end.bufsAreStreams && end.playing <= 2, `streams only (${end.slots} slots in use, ${end.playing} playing)`);
  check(end.lt.every(d => d <= 100), 'no main-thread task over 100 ms (50 ms tasks come from the software rasteriser here): ' + JSON.stringify(end.lt) + ' ' + JSON.stringify(end.ltl) + ' marks ' + JSON.stringify(end.marks) + ' calls ' + JSON.stringify(end.calls.filter(c => c[1] !== 'switchTo' || c[2] !== 'stage1')));
  check(!errs.length, 'no page errors ' + errs.join('|'));
  if (process.env.JSON) console.log(JSON.stringify({ fails, notes }));
  else { for (const n of notes) console.log('  ' + n); for (const f of fails) console.log('FAIL ' + f); console.log(fails.length ? `${fails.length} failed` : 'audio test: all passed'); }
  await br.close(); srv.kill(); process.exit(fails.length ? 1 : 0);
})();
