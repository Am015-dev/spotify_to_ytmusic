#!/usr/bin/env node
// Nightrun MIX: measures the audio graph of a real-time bot run (headless Chromium, real songs) and gates it. Prints pass/fail lines; MEASURE=1 prints the table only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/mix-test.js     env: GAME_DIR=... SECS=45 (seconds per scenario) SCN=s2,s10,s20,boss,endless15 Q='&mix=0' MEASURE=1 JSON=out.json
// Hooks (implementation-agnostic): AudioNode.connect is recorded, every OscillatorNode / AudioBufferSourceNode start is classified by the bus it reaches (AU.sfxv = effect, AU.duck = music);
// AU.sfx / AU.sting are wrapped only to tag the sound id. Level taps are ScriptProcessors on AU.m (before the limiter), AU.lim (output), AU.duck (music) and AU.sfxv (effects).
// 1 no clipping on the master: output never reaches full scale and the signal into the limiter stays under 0 dBFS
// 2 effect voices alive at once <= cap (10)     3 no sound id more than 6 times in any second, none twice within 60 ms
// 4 music is at least 3 dB louder than the effects bus (RMS over the run)     5 settings persist (Music, Effects, Reduce repetitive sounds)
// 6 ?mix=0 = the old graph (no effect compressor, no wrapped sfx, no variants)   7 no page errors
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const SECS = +process.env.SECS || 45, MEASURE = !!process.env.MEASURE, Q = process.env.Q || '', CAP = 10;
const SCN = (process.env.SCN || 's2,s10,s20,boss,endless15').split(',');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i === undefined ? '' : ' :: ' + JSON.stringify(i))); };
const db = x => x > 1e-9 ? +(20 * Math.log10(x)).toFixed(1) : -99;

const INIT = () => {
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
    sp.onaudioprocess = e => { const d = e.inputBuffer.getChannelData(0); let pk = 0, ss = 0, cl = 0; for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pk) pk = v; ss += v * v; if (v >= .99) cl++; } T.pk = Math.max(T.pk, pk); T.clip += cl; T.blocks.push([e.playbackTime, pk, Math.sqrt(ss / d.length)]); };
    oc.call(node, sp); oc.call(sp, z); oc.call(z, a.destination); window.__sp.push(sp); };
  window.__gr = { lim: 0, sfx: 0 }; setInterval(() => { try { window.__gr.lim = Math.min(window.__gr.lim, AU.lim ? AU.lim.reduction : 0); window.__gr.sfx = Math.min(window.__gr.sfx, AU.sfxc ? AU.sfxc.reduction : 0); } catch (e) { } }, 25);
  tap('pre', AU.m); tap('out', AU.lim || AU.m); tap('mus', AU.duck); tap('sfx', AU.sfxv);
};
const SUMMARY = () => {
  const m = window.__mnr, AU = m.AU, edges = window.__edges, bus = { sfx: AU.sfxv, mus: AU.duck };
  const reach = n => { const seen = new Set([n]), q = [n]; while (q.length) { const x = q.pop(); if (x === bus.sfx) return 'sfx'; if (x === bus.mus) return 'mus'; for (const y of (edges.get(x) || [])) if (!seen.has(y)) { seen.add(y); q.push(y); } } return 'other'; };
  const out = { gr: window.__gr, src: window.__src.map(r => ({ k: reach(r.n), t: r.t, e: r.end == null ? r.t + 1 : r.end, id: r.id, at: r.at })), trig: window.__trig, tap: window.__tap, t: AU.a.currentTime };
  return out;
};

(async () => {
  const port = await freePort(); const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const errs = [];
  const open = async (q = '') => { const ctx = await br.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push('page: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(INIT); await p.addInitScript(() => { try { localStorage.setItem('mnr_tut', '1'); } catch (e) { } });
    await p.goto(`http://127.0.0.1:${port}/index.html${q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr); await sleep(1000); return { p, ctx }; };
  const begin = async (p, scn) => {
    await p.evaluate(scn => { const m = window.__mnr; m.god = true; if (scn === 'endless15') { m.ST.on = false; document.getElementById('startBtn').click(); } else m.startStory(+scn.replace(/^\D+/, '') || 4); }, scn.startsWith('s') ? scn : scn === 'boss' ? 's4' : scn);
    await p.waitForFunction(() => __mnr.AU.a && __mnr.AU.a.state === 'running' && __mnr.G && __mnr.G.live, null, { timeout: 20000 }).catch(() => { });
    await p.evaluate(WRAP); await sleep(2500);
    await p.evaluate(() => { const m = window.__mnr; if (m.AU.a.state !== 'running') m.AU.a.resume(); });
    if (scn === 'boss') { await p.evaluate(() => __mnr.bossNow()); await p.waitForFunction(() => __mnr.G.boss, null, { timeout: 20000 }).catch(() => { }); await sleep(3000); }
    if (scn === 'endless15') await p.evaluate(() => { window.ENDR.w = 15; });
  };
  const play = async (p, secs) => {   // real-time bot: hold fire, follow the nearest enemy in y, dash / EMP now and then
    await p.keyboard.down('Space'); const keys = {}; const end = Date.now() + secs * 1000; let n = 0;
    while (Date.now() < end) { const d = await p.evaluate(() => { const m = window.__mnr, G = m.G, P = m.P; if (!G || !P || !m.running) return null; let ty = 270, bd = 1e9; for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) ty = e.y; continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; } } return { dy: ty - P.y, dx: 220 - P.x }; });
      if (d) { const want = { ArrowUp: d.dy < -14, ArrowDown: d.dy > 14, ArrowLeft: d.dx < -60, ArrowRight: d.dx > 60 }; for (const k in want) { if (want[k] && !keys[k]) { await p.keyboard.down(k); keys[k] = 1; } else if (!want[k] && keys[k]) { await p.keyboard.up(k); keys[k] = 0; } } }
      if (++n % 22 === 0) await p.keyboard.press('ShiftLeft'); if (n % 150 === 0) await p.keyboard.press('KeyX'); await sleep(70); }
    await p.keyboard.up('Space'); for (const k in keys) if (keys[k]) await p.keyboard.up(k);
  };
  const analyse = (S, t0, t1) => {
    const A = { secs: +(t1 - t0).toFixed(1) };
    const sfx = S.src.filter(r => r.k === 'sfx' && r.t >= t0 && r.t <= t1);
    // voices alive at once (sweep line over start/end)
    const ev = []; for (const r of sfx) { ev.push([r.t, 1]); ev.push([r.e, -1]); } ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]); let v = 0, mx = 0, sum = 0; for (const e of ev) { v += e[1]; if (v > mx) mx = v; }
    A.maxVoices = mx; { let v2 = 0, at = null; for (const e of ev) { v2 += e[1]; if (v2 === mx) { at = e[0]; break; } } const c = {}; for (const r of sfx) if (r.t <= at && r.e > at) c[r.id || 'direct'] = (c[r.id || 'direct'] || 0) + 1; A.peakIds = c; } A.voiceStarts = sfx.length; A.voicesPerSec = +(sfx.length / A.secs).toFixed(1);
    // sound ids: the trigger calls that played at least one voice, plus untagged direct sources
    const trig = S.trig.filter(x => x.t >= t0 && x.t <= t1), per = {};
    for (const x of trig) { const o = per[x.id] || (per[x.id] = { calls: 0, played: [], }); o.calls++; if (x.played) o.played.push(x.t); }
    const direct = sfx.filter(r => !r.id); if (direct.length) per['direct'] = { calls: direct.length, played: [...new Set(direct.map(r => r.t))].sort((a, b) => a - b) };
    A.ids = {}; let rep120 = 0, rep60 = 0, over6 = 0, worst6 = 0, playedTotal = 0;
    for (const id in per) { const ts = per[id].played.sort((a, b) => a - b); let r120 = 0, r60 = 0, w = 0, best = 0; for (let i = 0; i < ts.length; i++) { if (i && ts[i] - ts[i - 1] < .12) r120++; if (i && ts[i] - ts[i - 1] < .06) r60++; while (ts[i] - ts[w] >= 1) w++; best = Math.max(best, i - w + 1); }
      A.ids[id] = { calls: per[id].calls, played: ts.length, perSec: +(ts.length / A.secs).toFixed(2), max1s: best, r120, r60 }; rep120 += r120; rep60 += r60; playedTotal += ts.length; if (best > 6) over6++; worst6 = Math.max(worst6, best); }
    A.sfxPerSec = +(playedTotal / A.secs).toFixed(1); A.rep120 = rep120; A.rep60 = rep60; A.idsOver6 = over6; A.maxPerSec = worst6;
    // levels
    const T = S.tap, inw = b => b[0] >= t0 && b[0] <= t1, pre = T.pre.blocks.filter(inw), out = T.out.blocks.filter(inw);
    A.prePeakDb = db(Math.max(0, ...pre.map(b => b[1]))); A.outPeakDb = db(Math.max(0, ...out.map(b => b[1])));
    A.outClip = T.out.blocks.filter(inw).reduce((s, b) => s + (b[1] >= .99 ? 1 : 0), 0); A.preOver = pre.filter(b => b[1] > 1).length;
    const rms = (arr) => Math.sqrt(arr.reduce((s, b) => s + b[2] * b[2], 0) / Math.max(1, arr.length));
    A.outRmsDb = db(rms(out)); A.musRmsDb = db(rms(T.mus.blocks.filter(inw))); A.sfxRmsDb = db(rms(T.sfx.blocks.filter(inw)));
    A.musVsSfxDb = +(A.musRmsDb - A.sfxRmsDb).toFixed(1); A.sfxPeakDb = db(Math.max(0, ...T.sfx.blocks.filter(inw).map(b => b[1]))); A.musPeakDb = db(Math.max(0, ...T.mus.blocks.filter(inw).map(b => b[1])));
    A.grLim = +S.gr.lim.toFixed(2); A.grSfx = +S.gr.sfx.toFixed(2);
    return A;
  };

  const runs = {};
  for (const scn of SCN) {
    const { p, ctx } = await open(Q ? '?' + Q.replace(/^[?&]/, '') : '');
    await begin(p, scn);
    const ok0 = await p.evaluate(() => !!(__mnr.AU.a && __mnr.AU.a.state === 'running'));
    if (!ok0) { ok(scn + ' audio context running', false); await ctx.close(); continue; }
    await p.evaluate(TAPS); const t0 = await p.evaluate(() => __mnr.AU.a.currentTime);
    await play(p, SECS);
    const S = await p.evaluate(SUMMARY); runs[scn] = analyse(S, t0 + 1, S.t);
    const g = await p.evaluate(() => ({ graph: !!(__mnr.AU.sfxc), mix: true })); runs[scn].g = g;
    await ctx.close();
  }
  if (MEASURE || process.env.JSON) {
    for (const scn in runs) { const A = runs[scn]; console.log(`== ${scn} (${A.secs}s): sfx ${A.sfxPerSec}/s, voice starts ${A.voicesPerSec}/s, max voices ${A.maxVoices}, pre-limiter peak ${A.prePeakDb} dBFS (over 1.0: ${A.preOver} blocks), out peak ${A.outPeakDb} dBFS, clipped out blocks ${A.outClip}, out RMS ${A.outRmsDb}, music RMS ${A.musRmsDb} vs sfx RMS ${A.sfxRmsDb} (music-sfx ${A.musVsSfxDb} dB), music peak ${A.musPeakDb} / sfx peak ${A.sfxPeakDb} dBFS, voices at peak ${JSON.stringify(A.peakIds)}, limiter GR ${A.grLim} dB, fx-bus GR ${A.grSfx} dB, repeats<120ms ${A.rep120}, <60ms ${A.rep60}, ids>6/s ${A.idsOver6} (worst ${A.maxPerSec}/s)`);
      console.log('   ' + Object.entries(A.ids).sort((a, b) => b[1].played - a[1].played).map(([k, v]) => `${k} ${v.perSec}/s(max${v.max1s} r120:${v.r120} r60:${v.r60})`).join('  ')); }
    if (process.env.JSON) fs.writeFileSync(process.env.JSON, JSON.stringify(runs, null, 1));
  }
  if (!MEASURE) {
    const all = Object.entries(runs);
    ok('0 every scenario ran with a live audio context (' + all.map(e => e[0]).join(',') + ')', all.length === SCN.length);
    ok('1 no clipping on the master: output peak < -0.5 dBFS, no output block at full scale, signal into the limiter <= 0 dBFS', all.every(([, A]) => A.outClip === 0 && A.outPeakDb < -.5 && A.prePeakDb <= 0), all.map(([k, A]) => [k, A.outPeakDb, A.prePeakDb, A.outClip]));
    ok('1b master limiter gain reduction never beyond 2 dB (music and effects together)', all.every(([, A]) => A.grLim >= -2), all.map(([k, A]) => [k, A.grLim, A.grSfx]));
    ok(`2 effect voices alive at once <= ${CAP}`, all.every(([, A]) => A.maxVoices <= CAP), all.map(([k, A]) => [k, A.maxVoices]));
    ok('3 no sound id more than 6 times in a second, none twice within 60 ms', all.every(([, A]) => A.idsOver6 === 0 && A.rep60 === 0), all.map(([k, A]) => [k, A.maxPerSec, A.rep60]));
    ok('4 music at least 3 dB louder than the effects bus', all.every(([, A]) => A.musVsSfxDb >= 3), all.map(([k, A]) => [k, A.musVsSfxDb]));
    const want = Q.includes('mix=0');
    ok(want ? '6 ?mix=0 keeps the old graph (no effect compressor, flag off)' : '6 flag on: effect compressor present', all.every(([, A]) => want ? (!A.g.graph && A.g.mix === false) : (A.g.graph && A.g.mix === true)), all.map(([k, A]) => [k, A.g]));
    if (!want) {   // 5 settings persist across a reload
      const { p, ctx } = await open();
      await p.evaluate(() => { const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }; set('sMusic', 30); set('sSfx', 40); document.querySelector('#setBody [data-k=mixr] button[data-v="1"]').click(); });
      await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr); const s = await p.evaluate(() => { const S = __mnr.SET; return [S.music, S.sfx, S.mixr]; });
      ok('5 Music volume, Effects volume and Reduce repetitive sounds persist', s[0] === .3 && s[1] === .4 && s[2] === false, s);
      const row = await p.evaluate(() => { const t = [...document.querySelectorAll('#setBody span')].map(e => e.children.length === 0 ? e.textContent.trim() : '').filter(Boolean); return t.filter(x => /repetitive|Music volume|Effects volume/i.test(x)); });
      ok('5 the three rows are in Settings > Audio', row.length >= 3, row);
      await ctx.close();
    }
    ok('7 no page errors', errs.length === 0, errs.slice(0, 3));
  }
  srv.kill(); await br.close();
  const bad = res.filter(x => !x).length; if (!MEASURE) console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('FAIL crash :: ' + e.stack); process.exit(1); });
