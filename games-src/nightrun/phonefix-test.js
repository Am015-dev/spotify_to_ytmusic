#!/usr/bin/env node
// PHONE FIX gates (22 Oct owner on a real phone: "where is the parallax background? I can not see the bullets, why no auto shoot?").
//   1 autofire  the ship fires with no input within 1 s: fresh profile, old save with auto:false, after a drill, after the lab; an explicit visible-toggle OFF is kept
//   2 parallax  the backdrop alone (grabbed after the dim and the play band), 2 s of game time apart: best vertical shift over the play band > 20 css px; band darkening <= .3
//   3 bullets   enemy bullets on stages 1 and 10: blob >= 10 css px across, white core, dark halo (pixels measured, phone 390x763 DPR 2, game time stepped by hand)
//   NODE_PATH=$(npm root -g) node games-src/nightrun/phonefix-test.js [built.html]     env: ONLY=autofire|parallax|bullets
const PW = require(process.env.PW || 'playwright'), path = require('path');
const gx = require('../scripts/gx-serve.js');
const FILE = path.resolve(process.argv[2] || path.resolve(__dirname, '../../games/mainhattan-nightrun/index.html')), ONLY = process.env.ONLY || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const ok = (n, p, i) => { if (!p) bad++; console.log((p ? 'PASS ' : 'FAIL ') + n + (i ? ' :: ' + i : '')); };
const want = k => !ONLY || ONLY === k;

const OLD = () => { try { if (!localStorage.getItem('__seeded')) { localStorage.setItem('__seeded', '1'); localStorage.setItem('mnr_set', JSON.stringify({ auto: false, v3: 1, music: .3 })); } } catch (e) { } };
const FIRES = new Function('o', `
  const m = window.__mnr; let n = 0; m.NR.on('fire', () => { n++; });
  if (o.kind === 'drill') { window.__tut.start(); for (let k = 0; k < 30; k++) m.step(1 / 60); window.__tut.skip(); }
  if (o.kind === 'drillOff') { m.setVal('auto', false); window.__tut.start(); for (let k = 0; k < 30; k++) m.step(1 / 60); window.__tut.skip(); return { auto: m.SET.auto }; }
  if (o.kind === 'lab') { m.abort(); }
  m.simOn(true); m.god = true; m.startStory(1);
  for (let k = 0; k < 90; k++) m.step(1 / 60);
  n = 0; for (let k = 0; k < 60; k++) m.step(1 / 60);
  return { fires: n, auto: m.SET.auto, saved: JSON.parse(localStorage.getItem('mnr_set') || '{}').auto };
`);

const SCENE = new Function('o', `
  const m = window.__mnr, cv = document.getElementById('cv') || document.querySelector('canvas');
  if (!window.__pf) {
    window.__pfSD = 7; Math.random = () => { window.__pfSD = (window.__pfSD * 16807) % 2147483647; return window.__pfSD / 2147483647; };
    m.SET.diff = 'normal'; m.applySet(); m.startStory(o.n); m.simOn(true); m.god = true;
    for (let k = 0; k < 60; k++) m.step(1 / 60);
    window.__pf = { it: 0 }; return null;
  }
  const g = cv.getContext('2d', { willReadFrequently: true }), w = cv.width, h = cv.height, dpr = w / (cv.clientWidth || w);
  let bk = null; LGB.grab = c => { if (bk === 'want') bk = { w: c.canvas.width, h: c.canvas.height, d: c.getImageData(0, 0, c.canvas.width, c.canvas.height).data }; };
  const out = { dpr, w, h, port: m.rotMode, band: LGB.BAND, dim: READ.DIM };
  const calm = () => { const G = m.G; G.shake = 0; G.flash = 0; G.glitch = 0; if (G.banner) G.banner.t = 0; if (G.hint) G.hint.t = 0; };
  const go = n => { for (let k = 0; k < n; k++) { if (m.SH && m.SH.active) m.SH.close(); if (k % 3 === 0) m.touchTo(300 + 200 * Math.sin(k / 50), 270 + 200 * Math.sin(k / 37)); m.step(1 / 60); } };
  if (o.what === 'parallax') {
    const cap = () => { calm(); bk = 'want'; m.render(m.G.t, 0); const r = bk; bk = null; return r && r.d ? r : null; };
    const A = cap(); go(120); const B = cap(); if (!A || !B) return { err: 'no backdrop grab', ...out };
    const W = A.w, H = A.h, lum = (d, i) => .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2];
    // play band = middle 76% of the short side; the layers scroll along the long side in portrait (y) and the short... in landscape along x
    const port = H > W, x0 = port ? Math.round(W * .12) : 0, x1 = port ? Math.round(W * .88) : W, y0 = port ? 0 : Math.round(H * .12), y1 = port ? H : Math.round(H * .88);
    const maxS = Math.round(dpr * 220), step = 2, S = [];
    const px = (d, x, y) => lum(d, (y * W + x) * 4);
    let best = 0, bs = 0;
    for (let s = 0; s <= maxS; s += 1) {
      // compare A shifted by s along the scroll axis with B (scroll toward the ship: the picture moves to larger y, or to smaller x)
      let sa = 0, sb = 0, sab = 0, saa = 0, sbb = 0, n = 0;
      for (let y = y0 + (port ? s : 0); y < y1; y += step) for (let x = x0; x < x1 - (port ? 0 : s); x += step) {
        const a = port ? px(A.d, x, y - s) : px(A.d, x + s, y), b = px(B.d, x, y); sa += a; sb += b; sab += a * b; saa += a * a; sbb += b * b; n++; }
      const cov = sab / n - (sa / n) * (sb / n), va = saa / n - (sa / n) ** 2, vb = sbb / n - (sb / n) ** 2, c = va > 1e-6 && vb > 1e-6 ? cov / Math.sqrt(va * vb) : 0;
      if (c > best) { best = c; bs = s; }
    }
    // also the opposite direction (a layer scrolling the other way)
    let best2 = 0, bs2 = 0;
    for (let s = 1; s <= maxS; s += 1) {
      let sa = 0, sb = 0, sab = 0, saa = 0, sbb = 0, n = 0;
      for (let y = y0; y < y1 - (port ? s : 0); y += step) for (let x = x0 + (port ? 0 : s); x < x1; x += step) {
        const a = port ? px(A.d, x, y + s) : px(A.d, x - s, y), b = px(B.d, x, y); sa += a; sb += b; sab += a * b; saa += a * a; sbb += b * b; n++; }
      const cov = sab / n - (sa / n) * (sb / n), va = saa / n - (sa / n) ** 2, vb = sbb / n - (sb / n) ** 2, c = va > 1e-6 && vb > 1e-6 ? cov / Math.sqrt(va * vb) : 0;
      if (c > best2) { best2 = c; bs2 = s; }
    }
    // mean luminance of the band against the static ship-less backdrop (visibility)
    let sum = 0, n2 = 0; for (let y = y0; y < y1; y += 4) for (let x = x0; x < x1; x += 4) { sum += px(B.d, x, y); n2++; }
    return { ...out, shift: Math.max(best >= best2 ? bs : bs2, 0) / dpr, ncc: Math.max(best, best2), dir: best >= best2 ? 'fwd' : 'back', lum: sum / n2 / 255 };
  }
  // bullets
  for (let it = 0; it < 40; it++) {
    go(70); const G = m.G; if (!m.running) break; if (G.eb.length < 3) continue; calm();
    const eb = G.eb.map(b => ({ x: b.x, y: b.y, r: b.r, k: b.k || '' })), R0 = () => { window.__pfSD = 99; };
    R0(); m.render(G.t, 0); const A = g.getImageData(0, 0, w, h).data;
    const save = G.eb; G.eb = []; R0(); m.render(G.t, 0); const B = g.getImageData(0, 0, w, h).data; G.eb = save; R0(); m.render(G.t, 0);
    const port = m.rotMode, scr = (x, y) => port ? [y / 540 * w, (960 - x) / 960 * h] : [x / 960 * w, y / 540 * h];
    const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }, L = (d, i) => .2126 * lin(d[i]) + .7152 * lin(d[i + 1]) + .0722 * lin(d[i + 2]);
    const res = [];
    for (const b of eb) {
      const [cx, cy] = scr(b.x, b.y); if (cx < 30 || cy < 30 || cx > w - 30 || cy > h - 30) continue;
      // isolated: no other bullet within 26 css px
      if (eb.some(o => o !== b && Math.hypot(scr(o.x, o.y)[0] - cx, scr(o.x, o.y)[1] - cy) < 26 * dpr)) continue;
      const R = Math.round(24 * dpr); let area = 0, maxL = 0, core = 0, rs = 0, rn = 0, bsum = 0, bn = 0, dark = 0, rr = 0;
      for (let y = Math.max(0, Math.round(cy) - R); y <= Math.min(h - 1, Math.round(cy) + R); y++) for (let x = Math.max(0, Math.round(cx) - R); x <= Math.min(w - 1, Math.round(cx) + R); x++) {
        const i = (y * w + x) * 4, d = Math.hypot(x - cx, y - cy); if (d > R) continue;
        const ch = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
        if (ch > 60) { area++; if (d > rr) rr = d; const l = L(A, i); if (l > maxL) maxL = l; if (l >= .6) core++; if (L(A, i) < L(B, i) * .6) dark++; } }
      res.push({ diam: 2 * Math.sqrt(area / Math.PI) / dpr, ext: 2 * rr / dpr, core: core / (dpr * dpr), dark: dark / (dpr * dpr), maxL, k: b.k, r: b.r });
    }
    return { ...out, res, n: eb.length, haloRun: LGB.stat.halo, haloK: Math.min(...Object.values(LGB.HK)) };
  }
  return { ...out, res: [], n: 0 };
`);

(async () => {
  const U = q => gx.url('mainhattan-nightrun', { file: FILE, query: '?nomusic=1&sim=1' + q });
  const br = await PW.chromium.launch();
  const open = async (q, init) => { q = (process.env.XQ || '') + q;
    const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); if (init) await p.addInitScript(init);
    await p.goto(await U(q), { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && __mnr.ART, null, { timeout: 30000 }); await sleep(1200);
    return { ctx, p, errs };
  };
  if (want('autofire')) {
    for (const [name, q, init, kind] of [['fresh profile', '', null, 'story'], ['old save (auto:false)', '', OLD, 'story'], ['after a drill (old save)', '', OLD, 'drill'], ['after the lab (old save)', '&lab=1', OLD, 'lab']]) {
      const { ctx, p, errs } = await open(q, init); let r;
      try { if (kind === 'lab') { await p.waitForFunction(() => __mnr.running, null, { timeout: 8000 }).catch(() => { }); } r = await p.evaluate(FIRES, { kind }); } catch (e) { errs.push(e.message); }
      ok(`autofire: ${name}: ship fires with no input within 1 s`, r && r.fires >= 1 && r.auto === true, r ? `fires ${r.fires} auto ${r.auto}` : errs[0]);
      ok(`autofire: ${name}: no page errors`, !errs.length, errs[0] || ''); await ctx.close();
    }
    { const { ctx, p, errs } = await open('', null); const r = await p.evaluate(FIRES, { kind: 'drillOff' });
      ok('autofire: a visible-toggle OFF is kept after a drill', r && r.auto === false, JSON.stringify(r)); ok('autofire: no page errors', !errs.length, errs[0] || ''); await ctx.close(); }
  }
  if (want('parallax')) for (const n of [1, 10]) {
    const { ctx, p, errs } = await open(''); let r = null;
    try { for (let k = 0; k < 8 && !r; k++) { r = await p.evaluate(SCENE, { what: 'parallax', n }); await sleep(300); } } catch (e) { errs.push(e.message); }
    console.log(`  stage ${n}: ` + JSON.stringify(r));
    ok(`parallax: stage ${n}: backdrop moves > 20 css px in 2 s over the play band`, r && !r.err && r.shift > 20, r ? `shift ${r.shift && r.shift.toFixed(1)} css px (ncc ${r.ncc && r.ncc.toFixed(2)} ${r.dir})` : errs[0]);
    ok(`parallax: stage ${n}: play-band darkening <= .3`, r && r.band <= .3, r ? `LGB.BAND ${r.band}` : '');
    ok(`parallax: stage ${n}: no page errors`, !errs.length, errs[0] || ''); await ctx.close();
  }
  if (want('bullets')) for (const n of [1, 10]) {
    const { ctx, p, errs } = await open(''); let r = null;
    try { for (let k = 0; k < 8 && !r; k++) { r = await p.evaluate(SCENE, { what: 'bullets', n }); await sleep(300); } } catch (e) { errs.push(e.message); }
    const res = r && r.res || [], f = x => x.toFixed(1), min = a => a.length ? Math.min(...a) : 0;
    console.log(`  stage ${n}: bullets measured ${res.length}/${r && r.n} :: ` + JSON.stringify(res.map(b => [b.k || 'o', f(b.diam), f(b.ext), f(b.core), f(b.dark)])));
    ok(`bullets: stage ${n}: measured >= 1 isolated enemy bullet`, res.length >= 1, String(res.length));
    ok(`bullets: stage ${n}: every enemy bullet >= 10 css px across (area-equivalent diameter of the changed pixels, picture + halo)`, res.length && min(res.map(b => b.diam)) >= 10, 'min ' + f(min(res.map(b => b.diam))));
    ok(`bullets: stage ${n}: bright core (>= 2 css px^2 of luminance >= .6)`, res.length && min(res.map(b => b.core)) >= 2, 'min ' + f(min(res.map(b => b.core))));
    ok(`bullets: stage ${n}: dark halo drawn under every bullet (LGB.halo ran, radius >= 1.5 x the drawn radius; contrast over lit scenes: legible-test)`, r && r.haloRun > 0 && r.haloK >= 1.5, r ? 'halo draws ' + r.haloRun + ' k ' + r.haloK : '');
    ok(`bullets: stage ${n}: no page errors`, !errs.length, errs[0] || ''); await ctx.close();
  }
  await br.close(); console.log(bad ? 'FAILURES' : 'ALL PASS'); process.exit(bad ? 1 : 0);
})();
