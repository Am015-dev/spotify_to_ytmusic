#!/usr/bin/env node
// Legibility gates (parts/render/legible.js, flag RET.legible, default ON; ?legible=0 = the old look). INDUSTRY-PLAYBOOK.md fixes 1-3: PB02, PB01, PB06, PB04.
//   NR_OUT=/tmp/nr.html python3 games-src/nightrun/parts/build.py && NODE_PATH=$(npm root -g) node games-src/nightrun/legible-test.js [/tmp/nr.html]
//   env: ONLY=<scene substring>  SHOTS=<dir> saves one phone frame per scene (keep them out of git)
// Phone 390x763 DPR 2, Normal, god mode, hand-stepped sim; stages 2 6 10 14 20, a boss, endless wave 10; each scene measured on 3 frozen frames, both ?legible=0 and default.
// The same frozen frame is rendered three times (all / no enemy bullets / no enemies); pixels that change are that layer, the other render is its local backdrop.
//   1 enemies   per enemy: median luminance of its changed pixels vs median backdrop within 1.6 r; gate: median per scene >= 4.5:1, p25 >= 3:1 (review 9 E21)
//   2 bullets   per bullet (changed pixels within 2 radii): the better of (bright p95 vs ring backdrop) and (dark outline p10 vs ring backdrop), 6 css px ring; gate: worst 10% per scene >= 3:1
//   3 backdrop  backdrop-only canvas (captured right after the backdrop dim): gamma luma gradient over 1 css px, per 24 css px cell over the play band
//               (middle 76% of the short side); busyness = p90 of the cells (the busy parts under the action); gate <= 0.015 (BUSY)
//   4 colour    saturated pixels within 2 radii of each enemy bullet: >= 90% warm (270-60 deg); pickup / coin palette hues >= 30 deg from every bullet hue bucket; player shots 160-285 deg
const PW = require(process.env.PW || 'playwright'), path = require('path'), fs = require('fs');
const gx = require('../scripts/gx-serve.js');
const FILE = path.resolve(process.argv[2] || path.resolve(__dirname, '../../games/mainhattan-nightrun/index.html')), ONLY = process.env.ONLY || '', SHOTS = process.env.SHOTS;
const BUSY = .015;   // was .010 (22 Oct owner on a real phone: the city was invisible under a 75 % veil; the lighter veil, DIM .35 + BAND .3, needs the busy cells up to ~.014)
const sleep = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const ok = (n, p, i) => { if (!p) bad++; console.log((p ? 'PASS ' : 'FAIL ') + n + (i ? ' :: ' + i : '')); };
const SCN = [['stage2', 'story', 2], ['stage6', 'story', 6], ['stage10', 'story', 10], ['stage14', 'story', 14], ['stage20', 'story', 20], ['boss', 'boss', 4], ['endless10', 'endless', 10]].filter(s => !ONLY || s[0].includes(ONLY));
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : 0; };

const RUN = new Function('o', `
  const m = window.__mnr, cv = document.getElementById('cv') || document.querySelector('canvas'); let G = m.G;
  if (!window.__lgO) {
  window.__lgSD = 7; window.__lgRR = Math.random; Math.random = () => { window.__lgSD = (window.__lgSD * 16807) % 2147483647; return window.__lgSD / 2147483647; };
  m.SET.diff = 'normal'; m.applySet();
  if (o.kind === 'endless') document.getElementById('startBtn').click(); else m.startStory(o.n);
  m.simOn(true); m.god = true;
  for (let k = 0; k < 30; k++) m.step(1 / 60);
  if (o.kind === 'endless' && window.ENDR) window.ENDR.w = o.n - 1;
  if (o.kind === 'boss') m.bossNow();
  G = m.G;
  window.__lgO = { out: { en: [], eb: [], hue: [], busy: [], fr: 0, eN: 0, bN: 0 }, frames: 0, it: 0 }; return null; }
  G = m.G;
  const g = cv.getContext('2d', { willReadFrequently: true }), w = cv.width, h = cv.height, dpr = w / (cv.clientWidth || w);
  const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }, L = (d, i) => .2126 * lin(d[i]) + .7152 * lin(d[i + 1]) + .0722 * lin(d[i + 2]);
  const cr = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  const hue = (r, gg, b) => { r /= 255; gg /= 255; b /= 255; const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), d = mx - mn; if (!d) return [0, 0]; let hh = mx === r ? ((gg - b) / d) % 6 : mx === gg ? (b - r) / d + 2 : (r - gg) / d + 4; return [(hh * 60 + 360) % 360, d / mx]; };
  // backdrop capture: right after READ.dim (+ legible band) the backdrop canvas holds the backdrop alone
  let bk = null; const R = window.READ; LGB.grab = c => { if (bk === 'want') bk = { w: c.canvas.width, h: c.canvas.height, d: c.getImageData(0, 0, c.canvas.width, c.canvas.height).data }; };
  const S_ = window.__lgO, out = S_.out; let frames = S_.frames;
  for (let it = S_.it; it < S_.it + 1 && it < 14 && frames < 3; it++) {
    G = m.G; for (let k = 0; k < 90; k++) { if (m.SH && m.SH.active) m.SH.close(); if (k % 3 === 0) m.touchTo(300 + 200 * Math.sin((it * 90 + k) / 50), 270 + 200 * Math.sin((it * 90 + k) / 37)); if (k % 20 === 0) m.press('Fire'); m.P.hp = m.P.max; m.step(1 / 60); }
    G = m.G; out.dbg = (out.dbg || '') + [m.running ? 1 : 0, G.en.length, G.eb.length].join(',') + ' ';
    if (!m.running) break;
    const en = G.en.filter(e => e.type !== 'boss' && e.x > 20 && e.x < 900), eb = G.eb; if (en.length < 1 && eb.length < 4) continue; frames++;
    const sh = G.shake; G.shake = 0; const fl = G.flash, gl = G.glitch; G.flash = 0; G.glitch = 0; const bnt = G.banner && G.banner.t, hnt = G.hint && G.hint.t; if (G.banner) G.banner.t = 0; if (G.hint) G.hint.t = 0; /* banners and hints (other workers) are not measured here */
    const R0 = () => { window.__lgSD = 99; };
    bk = 'want'; R0(); m.render(G.t, 0); const A = g.getImageData(0, 0, w, h).data; const B = bk && bk.d ? bk : null; bk = null;
    G.eb = []; R0(); m.render(G.t, 0); const Bb = g.getImageData(0, 0, w, h).data; G.eb = eb; const en0 = G.en; G.en = en0.filter(e => e.type === 'boss'); R0(); m.render(G.t, 0); const Be = g.getImageData(0, 0, w, h).data; G.en = en0;
    R0(); m.render(G.t, 0); /* leave the full frame on screen for SHOTS */
    G.shake = sh; G.flash = fl; G.glitch = gl; if (G.banner) G.banner.t = bnt; if (G.hint) G.hint.t = hnt;
    const port = m.rotMode, scr = (x, y) => port ? [y / 540 * w, (960 - x) / 960 * h] : [x / 960 * w, y / 540 * h], kk = port ? w / 540 : w / 960;
    // 1 enemies
    for (const e of en) { const [cx, cy] = scr(e.x, e.y); if (cx < 8 || cy < 8 || cx > w - 8 || cy > h - 8) continue; const r = Math.max(6, (e.r || 14) * kk * 1.4), ls = [], bs = [];
      for (let y = Math.max(0, Math.round(cy - r * 1.6)); y <= Math.min(h - 1, Math.round(cy + r * 1.6)); y++) for (let x = Math.max(0, Math.round(cx - r * 1.6)); x <= Math.min(w - 1, Math.round(cx + r * 1.6)); x++) { const i = (y * w + x) * 4, dd = (x - cx) ** 2 + (y - cy) ** 2;
        if (dd <= r * r && Math.abs(A[i] - Be[i]) + Math.abs(A[i + 1] - Be[i + 1]) + Math.abs(A[i + 2] - Be[i + 2]) > 40) ls.push(L(A, i)); bs.push(L(Be, i)); }
      if (ls.length < 12) continue; ls.sort((a, b) => a - b); bs.sort((a, b) => a - b); const ec = cr(ls[Math.floor(ls.length * .5)], bs[Math.floor(bs.length * .5)]); out.en.push(ec); out.eN++; if (ec < 3) (out.elo = out.elo || []).push([+ec.toFixed(2), e.type + (e.fk ? ':' + e.fk : ''), Math.round(e.x), Math.round(e.y), ls.length, +ls[Math.floor(ls.length * .5)].toFixed(3), +bs[Math.floor(bs.length * .5)].toFixed(3), e.vz ? 1 : 0, e._lg || 0, Math.round(cx), Math.round(cy), Math.round(r), [0, .5, .9, 1.2].map(q => { const i = (Math.round(cy) * w + Math.round(cx + q * r)) * 4; return [A[i], A[i + 1], A[i + 2], Be[i], Be[i + 1], Be[i + 2]].join('/'); }).join(' '), e.r, e.hp, e.st || e.mode || '']); }
    // 2 bullets: connected blobs of changed pixels (A vs Bb)
    const mask = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) { const k = i * 4; if (Math.abs(A[k] - Bb[k]) + Math.abs(A[k + 1] - Bb[k + 1]) + Math.abs(A[k + 2] - Bb[k + 2]) > 60) mask[i] = 1; }
    const st = [];
    for (let s = 0; s < w * h; s++) { if (mask[s] !== 1) continue; const px = []; st.push(s); mask[s] = 2;
      while (st.length) { const i = st.pop(); px.push(i); const x = i % w, y = (i / w) | 0; for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) if (j >= 0 && mask[j] === 1) { mask[j] = 2; st.push(j); } }
      if (px.length < 6 || px.length > 6000) continue;
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, sr = 0, sg = 0, sb = 0, sn = 0; const Ls = [];
      for (const i of px) { const x = i % w, y = (i / w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; Ls.push(L(A, i * 4)); const [hh, ss] = hue(A[i * 4], A[i * 4 + 1], A[i * 4 + 2]); if (ss > .45 && Math.max(A[i * 4], A[i * 4 + 1], A[i * 4 + 2]) > 90) { sr += A[i * 4]; sg += A[i * 4 + 1]; sb += A[i * 4 + 2]; sn++; } }
      const pad = Math.round(6 * dpr); let bl = 0, bn = 0;
      for (let y = Math.max(0, y0 - pad); y <= Math.min(h - 1, y1 + pad); y++) for (let x = Math.max(0, x0 - pad); x <= Math.min(w - 1, x1 + pad); x++) { bl += L(Bb, (y * w + x) * 4); bn++; }
      if (sn >= 4) out.hue.push(Math.round(hue(sr / sn, sg / sn, sb / sn)[0])); }
    // per bullet: changed pixels inside 2 radii vs the ring just outside (6 css px)
    for (const bu of eb) { const [cx, cy] = scr(bu.x, bu.y); if (cx < 8 || cy < 75 * dpr || cx > w - 8 || cy > h - 8) continue; /* not under the top HUD bar */ const rr = Math.max(4, Math.max(bu.r * kk, m.RET.legible ? LGB.MINR * dpr : 0) * 2)   /* the drawn radius (legible.js size floor), not the hit radius */, ro = rr + 6 * dpr, Ls = []; let bl = 0, bn = 0;
      for (let y = Math.max(0, Math.round(cy - ro)); y <= Math.min(h - 1, Math.round(cy + ro)); y++) for (let x = Math.max(0, Math.round(cx - ro)); x <= Math.min(w - 1, Math.round(cx + ro)); x++) { const i = (y * w + x) * 4, dd = Math.hypot(x - cx, y - cy);
        if (dd <= rr) { if (Math.abs(A[i] - Bb[i]) + Math.abs(A[i + 1] - Bb[i + 1]) + Math.abs(A[i + 2] - Bb[i + 2]) > 60) { Ls.push(L(A, i)); const [hh, ss] = hue(A[i], A[i + 1], A[i + 2]); if (ss > .45 && Math.max(A[i], A[i + 1], A[i + 2]) > 90) { const kk2 = (bu.k || (bu.hm > 0 ? 'h' : 'o')) + Math.floor(hh / 30) * 30; out.kh = out.kh || {}; out.kh[kk2] = (out.kh[kk2] || 0) + 1; } } } else if (dd <= ro) { bl += L(Bb, i); bn++; } }
      if (Ls.length < 4 || !bn) continue; Ls.sort((a, b) => a - b); const bgL = bl / bn, bc = Math.max(cr(Ls[Math.floor(Ls.length * .95)], bgL), cr(Ls[Math.floor(Ls.length * .1)], bgL)); out.eb.push(bc); out.bN++;
      if (bc < 3 && o.dbg && !out.crop) { const cw = 120, c2 = document.createElement('canvas'); c2.width = cw * 3; c2.height = cw; const g2 = c2.getContext('2d'); [A, Bb, Be].forEach((D, j) => { const id = g2.createImageData(cw, cw); for (let y = 0; y < cw; y++) for (let x = 0; x < cw; x++) { const sx = Math.round(cx) - cw / 2 + x, sy = Math.round(cy) - cw / 2 + y; if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue; for (let q = 0; q < 4; q++) id.data[(y * cw + x) * 4 + q] = D[(sy * w + sx) * 4 + q]; } g2.putImageData(id, j * cw, 0); }); out.crop = c2.toDataURL(); }
      if (bc < 3) (out.lo = out.lo || []).push([+bc.toFixed(2), Ls.length, Math.round(cx), Math.round(cy), +bgL.toFixed(3), +Ls[Math.floor(Ls.length * .9)].toFixed(3), +Ls[Math.floor(Ls.length * .1)].toFixed(3), bu.k || 'o']); }
    // 3 backdrop busyness over the play band
    if (B) { const bw = B.w, bh = B.h, P = bw < bh, s = P ? bw : bh, a0 = Math.round(s * .12), a1 = Math.round(s * .88); let sum = 0, n = 0;
      const Lb = (x, y) => { const i = (y * bw + x) * 4; return (.2126 * B.d[i] + .7152 * B.d[i + 1] + .0722 * B.d[i + 2]) / 255; };   // gamma-space luma (W118's busyness scale)
      const cs = Math.max(8, Math.round(24 * bw / (P ? 390 : 763))), st2 = Math.max(1, Math.round(cs / 24)), cells = [];   // 24 css px cells, gradient over 1 css px
      for (let y0 = 0; y0 + cs < bh - st2; y0 += cs) for (let x0 = 0; x0 + cs < bw - st2; x0 += cs) { const q = P ? x0 + cs / 2 : y0 + cs / 2; if (q < a0 || q > a1) continue; let cs_ = 0, cn = 0;
        for (let y = y0; y < y0 + cs; y += 2) for (let x = x0; x < x0 + cs; x += 2) { const c = Lb(x, y); cs_ += (Math.abs(Lb(x + st2, y) - c) + Math.abs(Lb(x, y + st2) - c)) / 2; cn++; } cells.push(cs_ / cn); sum += cs_; n += cn; }
      cells.sort((a, b) => a - b); out.busy.push(cells[Math.floor(cells.length * .9)] || 0); out.busyM = (out.busyM || []).concat([sum / n]); }
  }
  S_.frames = frames; S_.it++; LGB.grab = null; if (m.running && S_.it < 14 && frames < 3) return null;
  out.fr = frames; Math.random = window.__lgRR;
  out.pal = window.LGB && m.RET.legible ? { pk: Object.values(LGB.PK).concat([LGB.COIN]), shot: [R.SHOT, R.SHOT2] } : null; out.leg = !!m.RET.legible; out.stat = window.LGB ? Object.assign({}, LGB.stat) : {};
  return out;
`);
const hx = c => { const v = parseInt(c.slice(1, 7), 16), r = (v >> 16) / 255, g = (v >> 8 & 255) / 255, b = (v & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return -1; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };
const hd = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };

(async () => {
  const U = q => gx.url('mainhattan-nightrun', { file: FILE, query: '?nomusic=1&sim=1' + q });
  const br = await PW.chromium.launch(), res = {};
  for (const [name, kind, n] of SCN) for (const q of ['legible=0', '']) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(await U(q ? '&' + q : ''), { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && __mnr.ART, null, { timeout: 30000 }); await sleep(1500);
    let r = null; try { for (let k = 0; k < 16 && !r; k++) { r = await p.evaluate(RUN, { kind, n, dbg: !!process.env.DBG }); await sleep(k ? 250 : 3000); } } catch (e) { errs.push(e.message); }
    if (SHOTS && q === '' || SHOTS && process.env.BOTH) { fs.mkdirSync(SHOTS, { recursive: true }); await p.screenshot({ path: path.join(SHOTS, `leg-${name}${q ? '-old' : ''}.png`) }); }
    if (r && r.crop && SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); fs.writeFileSync(path.join(SHOTS, `crop-${name}${q ? '-old' : ''}.png`), Buffer.from(r.crop.split(',')[1], 'base64')); }
    res[name + (q ? ' old' : '')] = { r, errs }; await ctx.close();
  }
  const f = x => x.toFixed(2), f3 = x => x.toFixed(4), med = a => pct(a, .5);
  const hues = [];
  for (const [name] of SCN) {
    const o = res[name + ' old'], nw = res[name]; if (!nw.r || !o.r) { ok(`${name}: scene ran`, false, (nw.errs[0] || o.errs[0] || 'no result')); continue; }
    const a = o.r, b = nw.r; hues.push(...b.hue);
    console.log(`${name}: ${process.env.DBG ? a.dbg + ' | ' + b.dbg : ''} frames ${a.fr}/${b.fr} enemies ${a.eN}/${b.eN} bullets ${a.bN}/${b.bN}`);
    console.log(`  enemy contrast median ${f(med(a.en))} -> ${f(med(b.en))}  p25 ${f(pct(a.en, .25))} -> ${f(pct(b.en, .25))}`);
    console.log(`  bullet contrast worst10% ${f(pct(a.eb, .1))} -> ${f(pct(b.eb, .1))}  median ${f(med(a.eb))} -> ${f(med(b.eb))}`);
    if (process.env.DBG) console.log('  low', JSON.stringify((b.elo || []).slice(0, 10)), JSON.stringify((b.lo || []).slice(0, 8)), JSON.stringify(b.stat), JSON.stringify(b.kh));
    console.log(`  backdrop busyness (p90 of 24 px cells) ${f3(Math.max(...a.busy, 0))} -> ${f3(Math.max(...b.busy, 0))}  mean ${f3(Math.max(...a.busyM, 0))} -> ${f3(Math.max(...b.busyM, 0))}`);
    ok(`${name}: measured (>= 2 frames with enemies or bullets, both looks)`, a.fr >= 2 && b.fr >= 2, a.fr + '/' + b.fr);
    ok(`${name}: enemies median >= 4.5:1`, !b.en.length || med(b.en) >= 4.5, f(med(b.en)) + ' (n ' + b.en.length + ')');
    ok(`${name}: enemies p25 >= 3:1`, !b.en.length || pct(b.en, .25) >= 3, f(pct(b.en, .25)) + ' (n ' + b.en.length + ')');
    ok(`${name}: enemy bullets worst 10% >= 3:1`, b.eb.length < 5 || pct(b.eb, .1) >= 3, f(pct(b.eb, .1)) + ' (n ' + b.eb.length + ')');
    ok(`${name}: backdrop busyness under the play band <= ${BUSY}`, b.busy.length && Math.max(...b.busy) <= BUSY, f3(Math.max(...b.busy, 0)));
    ok(`${name}: ?legible=0 draws nothing new`, !a.leg && !a.stat.en && !a.stat.halo && !a.stat.band, JSON.stringify(a.stat));
    ok(`${name}: no page errors`, !o.errs.length && !nw.errs.length, o.errs[0] || nw.errs[0] || '');
  }
  const pal = Object.values(res).map(x => x.r && x.r.pal).find(Boolean), kh = {};
  for (const [name] of SCN) { const x = res[name] && res[name].r; if (x && x.kh) for (const k in x.kh) { const hb = +k.replace(/^[a-z]+/, ''); kh[hb] = (kh[hb] || 0) + x.kh[k]; } }
  if (pal) {
    const tot = Object.values(kh).reduce((a, b) => a + b, 0) || 1, warm = Object.entries(kh).filter(([h]) => +h >= 270 || +h < 60).reduce((a, [, v]) => a + v, 0) / tot;
    ok('colour: enemy bullets are warm (pink / red / orange), >= 90% of their saturated pixels', warm >= .9, (warm * 100).toFixed(0) + '% :: hue buckets ' + JSON.stringify(kh));
    const main = Object.entries(kh).filter(([, v]) => v / tot >= .05).map(([h]) => +h + 15), clash = pal.pk.map(hx).filter(h => h >= 0 && main.some(e => hd(e, h) < 30 + 15));
    ok('colour: pickup and coin hues >= 30 deg from every enemy-bullet hue bucket (>= 5% of pixels)', !clash.length, 'pickups ' + pal.pk.map(hx).map(Math.round).join(',') + ' bullet bucket centres ' + main.join(','));
    const sh = pal.shot.map(hx).filter(h => h >= 0); ok('colour: player shots cool (160-285 deg)', sh.every(h => h >= 160 && h <= 285), sh.map(Math.round).join(','));
  } else ok('colour: palette read', false);
  await br.close(); console.log(bad ? 'FAILURES' : 'ALL PASS'); process.exit(bad ? 1 : 0);
})();
