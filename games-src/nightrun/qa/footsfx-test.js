#!/usr/bin/env node
// FOOTSFX (parts/audio/footsfx.js, flag RET.footsfx): the on-foot sound set. PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/footsfx-test.js     env: GAME_DIR=<dir with index.html>
// Gates: (a) 13 Lab rows (group ft, default on, PLAY works), ?footsfx=0 has none and plays nothing
//        (b) every weapon (pistol, smg, shotgun, rocket) has 3 variants whose band spectra differ >= 2 dB on average; the same variant twice is identical; the live pick never repeats back to back
//        (c) 60 s of game time, 200+ sounds (min gaps + 8-voice cap), offline render: the sfx peak at the master is >= 6 dB under the song peak (analyser on the playing stage song)
//        (d) live: 220 sounds in ~10 s while a song plays: zero calls to the song's gain / filter params, their values unchanged, never more than 8 voices
const { boot, open, sleep, ok, done } = require('./lib.js');
const FFT = (re, im) => { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len; for (let i = 0; i < n; i += len) for (let k = 0; k < len / 2; k++) { const wr = Math.cos(a * k), wi = Math.sin(a * k), u = i + k, v = i + k + len / 2, xr = re[v] * wr - im[v] * wi, xi = re[v] * wi + im[v] * wr; re[v] = re[u] - xr; im[v] = im[u] - xi; re[u] += xr; im[u] += xi; } } };
const bands = (x) => { const N = 8192, re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < Math.min(N, x.length); i++) re[i] = x[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1))); FFT(re, im);
  const out = []; for (let b = 0; b < 24; b++) { const f0 = 100 * Math.pow(2, b / 3), f1 = 100 * Math.pow(2, (b + 1) / 3); let e = 1e-12; for (let k = Math.floor(f0 / 44100 * N); k < Math.min(N / 2, Math.floor(f1 / 44100 * N) + 1); k++) e += re[k] * re[k] + im[k] * im[k]; out.push(10 * Math.log10(e)); } return out; };
const dist = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;
(async () => {
  const b = await boot();
  try {
    const p = await open(b.br, b.base, 390, 763, '?lab=1', 0, true);
    await p.evaluate(() => { SND.AU.init(); SND.AU.a.resume(); }); await sleep(500);
    const ids = await p.evaluate(() => Object.keys(FTX.T));
    const rows = await p.evaluate(() => SND.T.filter(r => /^f_/.test(r[0]) && FTX.has(r[0].slice(2))).map(r => [r[0], r[1], r[3]]));
    ok('Lab: one ON FOOT row per sound (13), default on', rows.length === 13 && rows.every(r => r[1] === 'ft' && r[2] === 1) && ids.length === 13, JSON.stringify(rows.length));
    const play = await p.evaluate(() => Object.keys(FTX.T).every(id => { const pl = FTX.stat.played; FTX.play(id, { force: 1 }); return FTX.stat.played === pl + 1; }));
    ok('PLAY works for every row (13)', play);
    await p.evaluate(() => { SND.set('f_pistol', false); }); const off = await p.evaluate(() => { const n = FTX.stat.played; FTX.play('pistol'); const a = FTX.stat.played === n; SND.set('f_pistol', true); return a; });
    ok('a row switched off in the Lab plays nothing', off);
    // (b) variants, rendered offline (fixed noise, so the same variant is the same every time)
    const render = (id, v) => p.evaluate(async ([id, v]) => { const c = new OfflineAudioContext(1, 44100 * .8, 44100); FTX.synth(c, c.destination, id, v, 0, 1); const r = await c.startRendering(); return Array.from(r.getChannelData(0)); }, [id, v]);
    for (const w of ['pistol', 'smg', 'shotgun', 'rocket']) {
      const sp = []; for (let v = 0; v < 3; v++) sp.push(bands(await render(w, v))); const again = bands(await render(w, 0));
      const d = [dist(sp[0], sp[1]), dist(sp[0], sp[2]), dist(sp[1], sp[2])];
      ok(`${w}: 3 variants, min spectral difference ${Math.min(...d).toFixed(1)} dB >= 2, same variant twice = ${dist(sp[0], again).toFixed(2)} dB`, Math.min(...d) >= 2 && dist(sp[0], again) < .01, d.join());
    }
    const rr = await p.evaluate(async () => { let rep = 0, prev = -1; const seen = new Set(); for (let i = 0; i < 60; i++) { FTX.play('shotgun', { force: 1 }); const v = FTX.last.v; if (v === prev) rep++; prev = v; seen.add(v); await new Promise(r => setTimeout(r, 5)); } return { rep, n: seen.size }; });
    ok('live variant pick never repeats back to back, all 3 used', rr.rep === 0 && rr.n === 3, JSON.stringify(rr));
    // (c) loudness: offline 60 s with 200+ sounds vs the playing song
    await p.evaluate(() => { const AU = SND.AU; AU.startStage('stage1'); }); await sleep(2500);
    const song = await p.evaluate(async () => { const AU = SND.AU, an = AU.a.createAnalyser(); an.fftSize = 2048; AU.musv.connect(an); const d = new Float32Array(2048); let pk = 0; const t0 = performance.now(); while (performance.now() - t0 < 9000) { an.getFloatTimeDomainData(d); for (const v of d) pk = Math.max(pk, Math.abs(v)); await new Promise(r => setTimeout(r, 20)); } AU.musv.disconnect(an); return { pk, sfxv: AU.sfxv.gain.value, musv: AU.musv.gain.value }; });
    const sfx = await p.evaluate(async (sfxv) => { const T = FTX.T, ids = Object.keys(T), c = new OfflineAudioContext(1, 44100 * 61, 44100), top = c.createGain(); top.gain.value = sfxv; top.connect(c.destination); const bus = FTX.chain(c, top);
      let s = 7; const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; const last = {}, live = []; let n = 0, steals = 0, maxv = 0;
      for (let t = 0.2; t < 60; t += 0.02 + rnd() * 0.25) { const id = ids[rnd() * ids.length | 0]; if (t - (last[id] || -9) < T[id][1]) continue; for (let i = live.length - 1; i >= 0; i--) if (live[i] < t) live.splice(i, 1); if (live.length >= FTX.CAP) { live.shift(); steals++; } last[id] = t; live.push(t + .7); maxv = Math.max(maxv, live.length); FTX.synth(c, bus, id, rnd() * 3 | 0, t, T[id][2]); n++; }
      const r = await c.startRendering(), d = r.getChannelData(0); let pk = 0; for (const v of d) pk = Math.max(pk, Math.abs(v)); return { pk, n, steals, maxv }; }, song.sfxv);
    const dB = 20 * Math.log10(sfx.pk / song.pk);
    ok(`60 s offline, ${sfx.n} sounds (${sfx.steals} stolen): sfx peak ${sfx.pk.toFixed(3)} vs song peak ${song.pk.toFixed(3)} = ${dB.toFixed(1)} dB (<= -6)`, sfx.n >= 200 && song.pk > .02 && dB <= -6, JSON.stringify([song, sfx]));
    // (d) the song path is untouched
    const live = await p.evaluate(async () => { const AU = SND.AU, nodes = { musv: AU.musv.gain, duck: AU.duck.gain, m: AU.m.gain, lp: AU.lp && AU.lp.frequency }, calls = {}, before = {};
      for (const k in nodes) { const P = nodes[k]; if (!P) continue; before[k] = P.value; calls[k] = 0; for (const f of ['setValueAtTime', 'setTargetAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'cancelScheduledValues', 'setValueCurveAtTime']) { const o = P[f].bind(P); P[f] = function () { calls[k]++; return o.apply(null, arguments); }; } }
      const ids = Object.keys(FTX.T); let maxv = 0, n = 0; const t0 = performance.now(); while (n < 220 && performance.now() - t0 < 20000) { FTX.play(ids[Math.random() * ids.length | 0], { force: 1 }); n++; maxv = Math.max(maxv, FTX.vox.length); await new Promise(r => setTimeout(r, 25)); }
      const after = {}; for (const k in nodes) if (nodes[k]) after[k] = nodes[k].value; return { calls, before, after, n, maxv, stat: FTX.stat }; });
    const same = Object.keys(live.before).every(k => live.before[k] === live.after[k]), noCalls = Object.values(live.calls).every(v => v === 0);
    ok(`live: ${live.n} sound calls (${live.stat.played} played) over a playing song: 0 calls to the song's params, values unchanged, max ${live.maxv} voices (<= 8)`, live.n >= 200 && noCalls && same && live.maxv <= 8, JSON.stringify(live));
    ok('named hooks exist: guard, kick, punch', await p.evaluate(() => ['guard', 'kick', 'punch'].every(f => { const n = FTX.stat.played; FTX[f](); return FTX.stat.played >= n; })));
    ok('no page errors', p.errs.length === 0, p.errs.join('|'));
    const q = await open(b.br, b.base, 390, 763, '?lab=1&footsfx=0', 0, true); await q.evaluate(() => { SND.AU.init(); SND.AU.a.resume(); }); await sleep(300);
    const offr = await q.evaluate(() => ({ rows: SND.T.filter(r => /^f_/.test(r[0]) && FTX.has(r[0].slice(2))).length, played: FTX.play('pistol', { force: 1 }), owns: FTX.owns('pick') }));
    ok('?footsfx=0: no rows, nothing plays, old sounds not replaced', offr.rows === 0 && !offr.played && !offr.owns, JSON.stringify(offr));
  } catch (e) { ok('test ran', false, e.stack || e.message); }
  await b.close(); done('footsfx-test');
})();
