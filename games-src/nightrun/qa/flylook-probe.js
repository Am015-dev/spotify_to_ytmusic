// FLYLOOK probe (W201, RET.flylook): flight stage 1 on PC 1440x860, ?flylook toggled at run time on the same frame.
//   seam: backdrop only, row-mean brightness in 6-px bins (two scan-line periods) from 40 px above the near strip down; the layer edge is where the near strip's solid deck
//         starts (the first bin-to-bin drop > 8 below its top, old picture); its step = |mean of the 6 bins above - mean of the 6 bins below|, old vs new picture;
//   colour: mean RGB distance between each loaded ship sheet's opaque pixels and the backdrop's mean colour (sheet as painted vs graded);
//   frame: median ms per render() with the stage's first waves on screen (12 s real time to get them, then frozen; 9 x 40 frames each way, alternating).
// Gates: seam step after <= half of before; colour distance after <= half of before; frame time after <= 1.1 x before; 0 page errors.
// Usage: NODE_PATH=$(npm root -g) node games-src/nightrun/qa/flylook-probe.js
const { boot, open, sleep, ok, done } = require('./lib.js');
(async () => { const b = await boot(); try { const q = await open(b.br, b.base, 1440, 860, '?x=1', { mnr_tut: '2' }, false);
  await q.evaluate(async () => { const m = __mnr; m.RET.tale = false; for (let i = 0; i < 150 && (!m.ART.paintReady(0) || m.ART.pend > 0); i++) await new Promise(r => setTimeout(r, 100));
    if (m.running) m.abort(); m.startStory(1); for (let i = 0; i < 100 && !m.running; i++) await new Promise(r => setTimeout(r, 100)); m.god = true; });
  await q.waitForFunction(() => __mnr.G.t >= 12 || !__mnr.running, null, { timeout: 40000, polling: 100 }).catch(() => { }); if (q.errs.length) console.log('errs', q.errs.slice(0, 3)); console.log('t', await q.evaluate(() => [__mnr.G.t, __mnr.running]));
  const r = await q.evaluate((process_PROF) => { const m = __mnr, G = m.G, ART = m.ART; m.simOn(true); const cv = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0], g = cv.getContext('2d');
    const nr = ART.strip('ly-near-' + m.DIST[G.di].near, 130), u = cv.height / 540, y0 = Math.round((540 - nr.h) * u);
    const seam = () => { const keep = [G.en, G.eb, G.pb, G.pk, G.fl, m.P.x]; G.en = []; G.eb = []; G.pb = []; G.pk = []; G.fl = []; m.P.x = -900; m.render(); [G.en, G.eb, G.pb, G.pk, G.fl, m.P.x] = keep;
      const N = cv.height - (y0 - 40), d = g.getImageData(0, y0 - 40, cv.width, N).data, L = []; for (let y = 0; y < N; y++) { let s = 0; for (let x = 0; x < cv.width; x++) { const i = (y * cv.width + x) * 4; s += .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]; } L.push(s / cv.width); }
      const B = []; for (let y = 0; y + 6 <= N; y += 6)B.push(L.slice(y, y + 6).reduce((a, v) => a + v, 0) / 6); let mx = 0; for (let y = 1; y < B.length; y++)mx = Math.max(mx, Math.abs(B[y] - B[y - 1])); L.length = 0; L.push(...B); seam.L = (seam.L || []).concat([L.slice()]); return mx; };
    const ms = () => { const t0 = performance.now(); for (let i = 0; i < 40; i++)m.render(); return (performance.now() - t0) / 40; }, med = a => a.sort((x, y) => x - y)[a.length >> 1];
    m.RET.flylook = false; const s0 = seam(); m.RET.flylook = true; const s1 = seam();
    const F = window.FLY, pal = F.palOf(G.di), keys = Object.keys(ART.bm).filter(k => /^anim\/ship-.*-strip$/.test(k) && ART.bm[k]).map(k => k.slice(5, -6)), dist = c => { const x = document.createElement('canvas'); x.width = c.width; x.height = c.height; const h = x.getContext('2d'); h.drawImage(c, 0, 0);
      const d = h.getImageData(0, 0, c.width, c.height).data, mm = [0, 0, 0]; let n = 0; for (let i = 0; i < d.length; i += 16) if (d[i + 3] > 128) { mm[0] += d[i]; mm[1] += d[i + 1]; mm[2] += d[i + 2]; n++; } return n ? Math.hypot(mm[0] / n - pal[0], mm[1] / n - pal[1], mm[2] / n - pal[2]) : null; };
    let c0 = 0, c1 = 0, nk = 0; m.RET.flylook = false; const src = keys.map(k => [k, ART.anim(k)]).filter(v => v[1]); for (const [k, s] of src) { const a = dist(s), bb = dist(F.grade(s, G.di)); if (a == null || bb == null) continue; c0 += a; c1 += bb; nk++; }
    const T = { off: [], on: [] }; ms(); for (let i = 0; i < 9; i++) { m.RET.flylook = false; T.off.push(ms()); m.RET.flylook = true; T.on.push(ms()); }
    return { s0, s1, c0: c0 / nk, c1: c1 / nk, nk, en: G.en.length, off: med(T.off), on: med(T.on), yd: F.yd, pal: pal.map(Math.round), y0, prof: seam.L }; }, !!process.env.PROF);
  console.log('probe', JSON.stringify({ ...r, prof: undefined }));
  const [B0, B1] = r.prof; let e = 8; while (e < B0.length - 1 && B0[e - 1] - B0[e] <= 8) e++;   // the first sharp drop under the strip's top
  const av = (B, a, z) => B.slice(Math.max(0, a), z).reduce((s, v) => s + v, 0) / (Math.min(z, B.length) - Math.max(0, a)), st = B => Math.abs(av(B, e - 6, e) - av(B, e, e + 6));
  if (process.env.PROF) console.log('bins', B0.map(Math.round).join(' '), '|', B1.map(Math.round).join(' '), 'edge bin', e);
  ok('layer seam step halved', st(B1) <= st(B0) / 2, `brightness step at the near strip's deck edge ${st(B0).toFixed(1)} -> ${st(B1).toFixed(1)} (largest bin step ${r.s0.toFixed(1)} -> ${r.s1.toFixed(1)})`);
  ok('ship-to-backdrop colour distance halved', r.c1 <= r.c0 / 2, `${r.c0.toFixed(1)} -> ${r.c1.toFixed(1)} over ${r.nk} sheets`);
  ok('frame time within +10%', r.on <= r.off * 1.1, `${r.off.toFixed(2)} -> ${r.on.toFixed(2)} ms/frame with ${r.en} foes`);
  ok('no page errors', !q.errs.length, q.errs[0]);
} finally { await b.close(); } done('flylook-probe'); })();
