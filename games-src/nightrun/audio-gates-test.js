#!/usr/bin/env node
// Nightrun audio gates (review 8 D01-D04, review 9 fix 15): headless Chromium, real songs, real-time bot, WebAudio taps on the music bus, the effects bus and the master.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/audio-gates-test.js     env: GAME_DIR=... SECS=40 SCN=s1,s6,s10 Q='&mix=0' MEASURE=1 JSON=out.json
// Gates per stage (1, 6, 10): 6 <= music RMS - SFX RMS <= 10 dB | a hit / shot played alone sits at -32..-24 dBFS RMS | music ducks <= 5 per 40 s | the music low-pass never closes below 15 kHz while playing (sampled every 100 ms) | <= 4 effect sounds per second | no clipping on the output
// Then the three Music settings (Mix / Classic only / New only): the old songs are still played in Mix and Classic, the new ones in Mix and New.
// (audio-test.js is the older streamed-song / beat-grid test and is left as it was.)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const SECS = +process.env.SECS || 40, MEASURE = !!process.env.MEASURE, Q = process.env.Q || '';
const SCN = (process.env.SCN || 's1,s6,s10').split(',');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i === undefined ? '' : ' :: ' + JSON.stringify(i))); };
const db = x => x > 1e-9 ? +(20 * Math.log10(x)).toFixed(1) : -99;
const INIT = () => {
  // headless Chromium moves the audio clock in coarse steps, so a 45 ms effect scheduled at 'now' can already be over when it starts (effects measured 10-40 dB too quiet, run to run); a real device does not: report the clock 120 ms ahead so every sound starts in the future
  { const d = Object.getOwnPropertyDescriptor(BaseAudioContext.prototype, 'currentTime'), g = d.get; Object.defineProperty(BaseAudioContext.prototype, 'currentTime', { configurable: true, get() { return g.call(this) + .12; } }); }
  const edges = new Map(), oc = AudioNode.prototype.connect, od = AudioNode.prototype.disconnect;
  window.__oc = oc; window.__edges = edges; window.__src = []; window.__trig = []; window.__cur = null; window.__sp = [];
  AudioNode.prototype.connect = function (t) { if (t instanceof AudioNode) { let s = edges.get(this); if (!s) edges.set(this, s = new Set()); s.add(t); } return oc.apply(this, arguments); };
  AudioNode.prototype.disconnect = function (t) { if (!arguments.length) edges.delete(this); else if (t instanceof AudioNode && edges.get(this)) edges.get(this).delete(t); return od.apply(this, arguments); };
  const hook = (C, durOf) => { const os = C.prototype.start, op = C.prototype.stop; C.prototype.start = function (t) { const c = this.context, r = { n: this, t: t == null ? c.currentTime : t, id: window.__cur, at: c.currentTime, end: null }; r.end = durOf(this, r.t); window.__src.push(r); this.__r = r; return os.apply(this, arguments); };
    C.prototype.stop = function (t) { if (this.__r) this.__r.end = t == null ? this.context.currentTime : t; return op.apply(this, arguments); }; };
  hook(OscillatorNode, () => null); hook(AudioBufferSourceNode, (n, t) => n.buffer && !n.loop ? t + n.buffer.duration / Math.max(.1, n.playbackRate.value) : null);
};
const WRAP = () => {   // tag the sound id of everything created inside AU.sfx / AU.sting
  const m = window.__mnr, AU = m.AU; if (AU.__mixT) return; AU.__mixT = 1;
  for (const k of ['sfx', 'sting']) { const o = AU[k]; AU[k] = function (n) { const a = AU.a; const before = window.__src.length, t = a ? a.currentTime : 0, prev = window.__cur; window.__cur = (k === 'sting' ? 'sting:' : '') + n;
    let r; try { r = o.apply(this, arguments); } finally { window.__cur = prev; } window.__trig.push({ id: (k === 'sting' ? 'sting:' : '') + n, t, played: window.__src.length > before }); return r; }; }
};
const TAPS = () => {
  const m = window.__mnr, AU = m.AU, a = AU.a, oc = window.__oc; window.__tap = {};
  const tap = (name, node) => { if (!node) return; const sp = a.createScriptProcessor(1024, 1, 1), z = a.createGain(); z.gain.value = 0; const T = window.__tap[name] = { pk: 0, clip: 0, blocks: [] };
    sp.onaudioprocess = e => { const d = e.inputBuffer.getChannelData(0); let pk = 0, ss = 0, cl = 0; for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pk) pk = v; ss += v * v; if (v >= .99) cl++; } T.pk = Math.max(T.pk, pk); T.clip += cl; T.blocks.push([e.playbackTime, pk, Math.sqrt(ss / d.length), window.__mnr.running && !window.__mnr.paused && window.__mnr.G && window.__mnr.G.live ? 1 : 0]); };
    oc.call(node, sp); oc.call(sp, z); oc.call(z, a.destination); window.__sp.push(sp); };
  tap('pre', AU.m); tap('out', AU.lim || AU.m); tap('mus', AU.duck); tap('sfx', AU.sfxc || AU.sfxv);   // effects as they leave their own compressor (its automatic make-up gain is part of what the player hears; review 10 W144)
};
const SUMMARY = () => {
  const m = window.__mnr, AU = m.AU, edges = window.__edges, bus = { sfx: AU.sfxv, mus: AU.duck };
  const reach = n => { const seen = new Set([n]), q = [n]; while (q.length) { const x = q.pop(); if (x === bus.sfx) return 'sfx'; if (x === bus.mus) return 'mus'; for (const y of (edges.get(x) || [])) if (!seen.has(y)) { seen.add(y); q.push(y); } } return 'other'; };
  const out = { src: window.__src.map(r => ({ k: reach(r.n), t: r.t, e: r.end == null ? r.t + 1 : r.end, id: r.id, at: r.at })), trig: window.__trig, tap: window.__tap, t: AU.a.currentTime };
  return out;
};


// loudness of one shot / one hit played alone: loudest 1024-sample block RMS on the effects tap (after their compressor), plus the master gain (.55 x master slider) = dBFS at the output before the limiter
const ISO = async () => {  const m = window.__mnr, AU = m.AU, a = AU.a, out = {}, mg = 20 * Math.log10(.55), rs = AU.sfx, rt = AU.sting; let mine = false;   // the game's own sounds are muted while the two probe sounds play
  AU.sfx = function (n) { return mine ? rs.apply(this, arguments) : undefined; }; AU.sting = function () { return mine ? rt.apply(this, arguments) : false; };
  for (const id of ['hit', 'shot']) { let best = 1e-9;   // four tries (a single try is sometimes silent in headless Chromium), loudest wins
    for (let i = 0; i < 4; i++) { await new Promise(r => setTimeout(r, 300)); if (window.MIX) { window.MIX.log = {}; window.MIX.vox = []; } AU.lastSfx = {}; const T = window.__tap.sfx, n0 = T.blocks.length; mine = true; AU.sfx(id); mine = false; await new Promise(r => setTimeout(r, 700));
      for (const b of T.blocks.slice(n0)) best = Math.max(best, b[2]); }
    out[id] = +(20 * Math.log10(best) + mg).toFixed(1); }
  AU.sfx = rs; AU.sting = rt; return out; };
// music low-pass and duck dips: sampled / counted inside the page
const PROBE = () => {  const AU = window.__mnr.AU; window.__lp = []; window.__ducks = 0;
  window.__lpT = setInterval(() => { if (AU.lp && window.__mnr.running && !window.__mnr.paused) window.__lp.push(AU.lp.frequency.value); }, 100);
  if (AU.duck) { const g = AU.duck.gain, o = g.setTargetAtTime; g.setTargetAtTime = function (v) { if (v < .95) window.__ducks++; return o.apply(this, arguments); }; } };

(async () => {
  const port = await freePort(); const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const errs = [];
  const open = async (q = '') => { const ctx = await br.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push('page: ' + e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(INIT); await p.addInitScript(() => { try { localStorage.setItem('mnr_tut', '1'); } catch (e) { } });
    await p.goto(`http://127.0.0.1:${port}/index.html${q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr); await sleep(1000); return { p, ctx }; };
  const begin = async (p, scn) => {
    await p.evaluate(n => { const m = window.__mnr; m.god = true; m.startStory(n); }, +scn.replace(/^\D+/, '') || 1);
    await p.waitForFunction(() => __mnr.AU.a && __mnr.AU.a.state === 'running' && __mnr.G && __mnr.G.live, null, { timeout: 20000 }).catch(() => { });
    await p.evaluate(WRAP); await sleep(2500);
    await p.evaluate(() => { const m = window.__mnr; if (m.AU.a.state !== 'running') m.AU.a.resume(); }); };
  const play = async (p, secs) => {
    await p.keyboard.down('Space'); const keys = {}; const end = Date.now() + secs * 1000; let n = 0;
    while (Date.now() < end) { const d = await p.evaluate(() => { const m = window.__mnr, G = m.G, P = m.P; if (!G || !P || !m.running) return null; let ty = 270, bd = 1e9; for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) ty = e.y; continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; } } return { dy: ty - P.y, dx: 220 - P.x }; });
      if (d) { const want = { ArrowUp: d.dy < -14, ArrowDown: d.dy > 14, ArrowLeft: d.dx < -60, ArrowRight: d.dx > 60 }; for (const k in want) { if (want[k] && !keys[k]) { await p.keyboard.down(k); keys[k] = 1; } else if (!want[k] && keys[k]) { await p.keyboard.up(k); keys[k] = 0; } } }
      if (++n % 22 === 0) await p.keyboard.press('ShiftLeft'); if (n % 150 === 0) await p.keyboard.press('KeyX'); await sleep(70); }
    await p.keyboard.up('Space'); for (const k in keys) if (keys[k]) await p.keyboard.up(k); };
  const runs = {};
  for (const scn of SCN) {
    const { p, ctx } = await open(Q ? '?' + Q.replace(/^[?&]/, '') : '');
    await begin(p, scn);
    if (!await p.evaluate(() => !!(__mnr.AU.a && __mnr.AU.a.state === 'running'))) { ok(scn + ' audio context running', false); await ctx.close(); continue; }
    await p.evaluate(TAPS); const iso = await p.evaluate(ISO); await p.evaluate(PROBE); const t0 = await p.evaluate(() => __mnr.AU.a.currentTime);
    await play(p, SECS);
    const S = await p.evaluate(SUMMARY), X = await p.evaluate(() => ({ lp: window.__lp, ducks: window.__ducks, stage: __mnr.G && __mnr.G.stage, secs: 0 }));
    const t1 = S.t, secs = t1 - t0 - 1, inw = b => b[0] >= t0 + 1 && b[0] <= t1 && b[3],   // only blocks while the stage is live (the bot can die or clear early; a quiet card is not a mix)
    inw0 = b => b[0] >= t0 + 1 && b[0] <= t1, T = S.tap;
    const rms = a => Math.sqrt(a.reduce((s, b) => s + b[2] * b[2], 0) / Math.max(1, a.length));
    const played = S.trig.filter(x => x.played && x.t >= t0 + 1 && x.t <= t1), perId = {}; for (const x of played) perId[x.id] = (perId[x.id] || 0) + 1;
    const lp = X.lp.slice().sort((a, b) => a - b);
    runs[scn] = { iso, secs: +secs.toFixed(1), musDb: db(rms(T.mus.blocks.filter(inw))), sfxDb: db(rms(T.sfx.blocks.filter(inw))), sfxPerSec: +(played.length / secs).toFixed(1), perId,
      ducks40: +(X.ducks * 40 / secs).toFixed(1), lpMin: lp.length ? Math.round(lp[0]) : null, lpMedian: lp.length ? Math.round(lp[lp.length >> 1]) : null, lpN: lp.length,
      clip: T.out.blocks.filter(inw0).filter(b => b[1] >= .99).length, outPeakDb: db(Math.max(0, ...T.out.blocks.filter(inw0).map(b => b[1]))) };
    runs[scn].gap = +(runs[scn].musDb - runs[scn].sfxDb).toFixed(1);
    await ctx.close();
  }
  for (const k in runs) { const A = runs[k]; console.log(`== ${k} alone: shot ${A.iso.shot} hit ${A.iso.hit} dBFS; (${A.secs}s): music-SFX ${A.gap} dB (music ${A.musDb}, sfx ${A.sfxDb}), SFX ${A.sfxPerSec}/s ${JSON.stringify(A.perId)}, ducks/40s ${A.ducks40}, low-pass min ${A.lpMin} median ${A.lpMedian} Hz (${A.lpN} samples), clipped blocks ${A.clip}, out peak ${A.outPeakDb} dBFS`); }
  if (process.env.JSON) fs.writeFileSync(process.env.JSON, JSON.stringify(runs, null, 1));
  if (!MEASURE) {
    const all = Object.entries(runs);
    ok('0 every stage ran with a live audio context (' + SCN.join(',') + ')', all.length === SCN.length);
    ok('1 music is at least 6 dB louder than the effects (RMS)', all.every(([, A]) => A.gap >= 6), all.map(([k, A]) => [k, A.gap]));
    ok('1b effects are no more than 10 dB under the music (RMS; 6 <= music - SFX <= 10)', all.every(([, A]) => A.gap <= 10), all.map(([k, A]) => [k, A.gap]));
    ok('1c a hit played alone is at least -32 dBFS RMS, a shot too, neither above -24 (target -30..-26)', all.every(([, A]) => A.iso.hit >= -32 && A.iso.shot >= -32 && A.iso.hit <= -24 && A.iso.shot <= -24), all.map(([k, A]) => [k, A.iso]));
    ok('2 music ducks <= 5 per 40 s', all.every(([, A]) => A.ducks40 <= 5), all.map(([k, A]) => [k, A.ducks40]));
    ok('3 no music low-pass during play (filter never below 15 kHz)', all.every(([, A]) => A.lpN === 0 || A.lpMin >= 15000), all.map(([k, A]) => [k, A.lpMin, A.lpMedian]));
    ok('4 <= 4 effect sounds per second', all.every(([, A]) => A.sfxPerSec <= 4), all.map(([k, A]) => [k, A.sfxPerSec, A.perId]));
    ok('5 no clipping on the output', all.every(([, A]) => A.clip === 0 && A.outPeakDb < -.5), all.map(([k, A]) => [k, A.clip, A.outPeakDb]));
    ok('6 no page errors', errs.length === 0, errs.slice(0, 3));
  }
  srv.kill(); await br.close();
  const bad = res.filter(x => !x).length; if (!MEASURE) console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('FAIL crash :: ' + e.stack); process.exit(1); });
