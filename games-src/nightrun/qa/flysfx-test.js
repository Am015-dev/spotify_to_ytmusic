#!/usr/bin/env node
// FLYSFX (parts/audio/flysfx.js, flag RET.flysfx): the flight sound set. PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/flysfx-test.js     env: GAME_DIR=<dir with index.html>
// Gates: (a) 17 Lab rows (group fly, default on, PLAY works), ?flysfx=0 has none and plays nothing; the old AU.sfx names are replaced while the set owns them
//        (b) shots (pulse at level 1 and 10), enemy shot, small / big explosion have 3 variants whose band spectra differ >= 2 dB on average; same variant twice is identical; live pick never repeats back to back
//        (c) 60 s of game time, 300+ sounds (min gaps + 10-voice cap), offline render: the sfx peak at the master is >= 6 dB under the song peak
//        (d) live: 300 sounds over a playing song: zero calls to the song's gain / filter params, their values unchanged, never more than 10 voices
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
    const ids = await p.evaluate(() => Object.keys(FYS.T));
    const rows = await p.evaluate(() => SND.T.filter(r => /^y_/.test(r[0]) && FYS.has(r[0].slice(2))).map(r => [r[0], r[1], r[3]]));
    ok('Lab: one FLIGHT row per sound (17), group fly, default on', rows.length === 17 && rows.every(r => r[1] === 'fly' && r[2] === 1) && ids.length === 17 && (await p.evaluate(() => !!SND.G.fly)), JSON.stringify(rows.length));
    const play = await p.evaluate(() => Object.keys(FYS.T).every(id => { const pl = FYS.stat.played; FYS.play(id, { force: 1 }); return FYS.stat.played === pl + 1; }));
    ok('PLAY works for every row (17)', play);
    const lab = await p.evaluate(() => { const r = SND.T.find(x => x[0] === 'y_xbig'); const n = FYS.stat.played; SND.play('y_xbig'); return FYS.stat.played === n + 1; });
    ok('Lab SND.play of a fly row plays it', lab);
    await p.evaluate(() => { SND.set('y_xbig', false); }); const off = await p.evaluate(() => { const n = FYS.stat.played; FYS.play('xbig'); const a = FYS.stat.played === n; SND.set('y_xbig', true); return a; });
    ok('a row switched off in the Lab plays nothing', off);
    const own = await p.evaluate(() => { const o = FYS.owns; FYS.owns = n => !!FYS.MAP[n]; const AU = SND.AU, r = {}; for (const n of ['shot', 'hit', 'boom', 'big', 'graze', 'hurt', 'emp', 'pick', 'up']) { const pl = FYS.stat.played, g = FYS.stat.gap; FYS.stat.gap = 0; AU.sfx(n); r[n] = (FYS.stat.played - pl) + FYS.stat.gap; } FYS.owns = o; return r; });
    ok('old AU.sfx names (shot hit boom big graze hurt emp pick up) are taken over by the set', Object.values(own).every(v => v >= 1), JSON.stringify(own));
    const sz = await p.evaluate(async () => { const w = () => new Promise(r => setTimeout(r, 220)); await w(); const o = FYS.owns; FYS.owns = n => !!FYS.MAP[n]; const AU = SND.AU, r = []; FYS.ev('kill', { type: 'gunship' }); AU.sfx('boom'); r.push(FYS.last.id); await w(); FYS.ev('kill', { type: 'drone', r: 10 }); AU.sfx('boom'); r.push(FYS.last.id); await w(); FYS.ev('bossdown'); AU.sfx('big'); r.push(FYS.last.id); await w(); FYS.ev('bosshit'); AU.sfx('hit'); r.push(FYS.last.id); FYS.owns = o; return r.join(); });
    ok('explosion sizes and boss hit / death are chosen by the game events', sz === 'xmed,xsmall,bossdeath,bosshit', sz);
    // (b) variants, rendered offline (fixed noise, so the same variant is the same every time)
    const render = (id, v, lv) => p.evaluate(async ([id, v, lv]) => { const c = new OfflineAudioContext(1, 44100 * 1.2, 44100); FYS.synth(c, c.destination, id, v, 0, 1, lv); const r = await c.startRendering(); return Array.from(r.getChannelData(0)); }, [id, v, lv]);
    for (const [w, lv] of [['pshot_pulse', 1], ['pshot_pulse', 10], ['pshot_beam', 1], ['pshot_swarm', 1], ['pshot_mine', 1], ['eshot', 1], ['xsmall', 1], ['xmed', 1], ['xbig', 1]]) {
      const sp = []; for (let v = 0; v < 3; v++) sp.push(bands(await render(w, v, lv))); const again = bands(await render(w, 0, lv));
      const d = [dist(sp[0], sp[1]), dist(sp[0], sp[2]), dist(sp[1], sp[2])];
      ok(`${w} lv${lv}: 3 variants, min spectral difference ${Math.min(...d).toFixed(1)} dB >= 2, same variant twice = ${dist(sp[0], again).toFixed(2)} dB`, Math.min(...d) >= 2 && dist(sp[0], again) < .01, d.join());
    }
    const lvd = dist(bands(await render('pshot_pulse', 0, 1)), bands(await render('pshot_pulse', 0, 10)));
    ok(`weapon level changes the pulse shot (${lvd.toFixed(1)} dB >= 1)`, lvd >= 1);
    const rr = await p.evaluate(async () => { let rep = 0, prev = -1; const seen = new Set(); for (let i = 0; i < 60; i++) { FYS.play('xbig', { force: 1 }); const v = FYS.last.v; if (v === prev) rep++; prev = v; seen.add(v); await new Promise(r => setTimeout(r, 5)); } return { rep, n: seen.size }; });
    ok('live variant pick never repeats back to back, all 3 used', rr.rep === 0 && rr.n === 3, JSON.stringify(rr));
    const gap = await p.evaluate(async () => { await new Promise(r => setTimeout(r, 200)); const n = FYS.stat.played; for (let i = 0; i < 20; i++) FYS.play('pshot_pulse'); return FYS.stat.played - n; });
    ok(`the constantly firing player shot is rate-limited (20 calls in one instant -> ${gap} played, <= 1)`, gap <= 1, gap);
    // (c) loudness: offline 60 s with 300+ sounds vs the playing song
    await p.evaluate(() => { const AU = SND.AU; AU.startStage('stage1'); }); await sleep(2500);
    const song = await p.evaluate(async () => { const AU = SND.AU, an = AU.a.createAnalyser(); an.fftSize = 2048; AU.musv.connect(an); const d = new Float32Array(2048); let pk = 0; const t0 = performance.now(); while (performance.now() - t0 < 9000) { an.getFloatTimeDomainData(d); for (const v of d) pk = Math.max(pk, Math.abs(v)); await new Promise(r => setTimeout(r, 20)); } AU.musv.disconnect(an); return { pk, sfxv: AU.sfxv.gain.value, musv: AU.musv.gain.value }; });
    const sfx = await p.evaluate(async (sfxv) => { const T = FYS.T, ids = Object.keys(T), c = new OfflineAudioContext(1, 44100 * 61, 44100), top = c.createGain(); top.gain.value = sfxv; top.connect(c.destination); const bus = FYS.chain(c, top);
      let s = 7; const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; const last = {}, live = []; let n = 0, steals = 0, maxv = 0;
      for (let t = 0.2; t < 60; t += 0.02 + rnd() * 0.15) { const id = ids[rnd() * ids.length | 0]; if (t - (last[id] || -9) < T[id][1]) continue; for (let i = live.length - 1; i >= 0; i--) if (live[i] < t) live.splice(i, 1); if (live.length >= FYS.CAP) { live.shift(); steals++; } last[id] = t; live.push(t + .7); maxv = Math.max(maxv, live.length); FYS.synth(c, bus, id, rnd() * 3 | 0, t, T[id][2], 1 + (rnd() * 10 | 0)); n++; }
      const r = await c.startRendering(), d = r.getChannelData(0); let pk = 0; for (const v of d) pk = Math.max(pk, Math.abs(v)); return { pk, n, steals, maxv }; }, song.sfxv);
    const dB = 20 * Math.log10(sfx.pk / song.pk);
    ok(`60 s offline, ${sfx.n} sounds (${sfx.steals} stolen): sfx peak ${sfx.pk.toFixed(3)} vs song peak ${song.pk.toFixed(3)} = ${dB.toFixed(1)} dB (<= -6)`, sfx.n >= 300 && song.pk > .02 && dB <= -6, JSON.stringify([song, sfx]));
    // (d) the song path is untouched
    const live = await p.evaluate(async () => { const AU = SND.AU, nodes = { musv: AU.musv.gain, duck: AU.duck.gain, m: AU.m.gain, lp: AU.lp && AU.lp.frequency }, calls = {}, before = {};
      for (const k in nodes) { const P = nodes[k]; if (!P) continue; before[k] = P.value; calls[k] = 0; for (const f of ['setValueAtTime', 'setTargetAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'cancelScheduledValues', 'setValueCurveAtTime']) { const o = P[f].bind(P); P[f] = function () { calls[k]++; return o.apply(null, arguments); }; } }
      const ids = Object.keys(FYS.T); let maxv = 0, n = 0; const t0 = performance.now(); while (n < 300 && performance.now() - t0 < 20000) { FYS.play(ids[Math.random() * ids.length | 0], { force: 1 }); n++; maxv = Math.max(maxv, FYS.vox.length); await new Promise(r => setTimeout(r, 25)); }
      const after = {}; for (const k in nodes) if (nodes[k]) after[k] = nodes[k].value; return { calls, before, after, n, maxv, stat: FYS.stat }; });
    const same = Object.keys(live.before).every(k => live.before[k] === live.after[k]), noCalls = Object.values(live.calls).every(v => v === 0);
    ok(`live: ${live.n} sound calls (${live.stat.played} played) over a playing song: 0 calls to the song's params, values unchanged, max ${live.maxv} voices (<= 10)`, live.n >= 300 && noCalls && same && live.maxv <= 10, JSON.stringify(live));
        ok('no page errors', p.errs.length === 0, p.errs.join('|'));
    const q = await open(b.br, b.base, 390, 763, '?lab=1&flysfx=0', 0, true); await q.evaluate(() => { SND.AU.init(); SND.AU.a.resume(); }); await sleep(300);
    const offr = await q.evaluate(() => ({ rows: SND.T.filter(r => /^y_/.test(r[0]) && FYS.has(r[0].slice(2))).length, played: FYS.play('pistol', { force: 1 }), owns: FYS.owns('pick') }));
    ok('?flysfx=0: no rows, nothing plays, old sounds not replaced', offr.rows === 0 && !offr.played && !offr.owns, JSON.stringify(offr));
  } catch (e) { ok('test ran', false, e.stack || e.message); }
  await b.close(); done('flysfx-test');
})();
