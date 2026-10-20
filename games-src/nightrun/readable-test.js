#!/usr/bin/env node
// F5 readability (parts/readable.js, RET.read): enemy bullets against the backdrop, before (?read=0) vs after, at 390x763 (touch) and 1280x720. PASS/FAIL lines + numbers.
// The same frozen frame is drawn twice (with and without the enemy bullets); pixels that change are the bullets, the other frame is their local backdrop.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/readable-test.js        SHOTS=<dir> also saves the measured frames (keep them out of git)
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), SHOTS = process.env.SHOTS;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let bad = 0; const ok = (n, p, i) => { if (!p) bad++; console.log((p ? 'PASS ' : 'FAIL ') + n + (i ? ' :: ' + i : '')); };
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; }, pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length * q)] : 0; };
// in the page: draw the frame with / without bullets (and with / without the hitbox dot), return per-bullet numbers
const MEASURE = () => {
  const m = __mnr, G = m.G, cv = document.querySelector('canvas'), g = cv.getContext('2d', { willReadFrequently: true }), w = cv.width, h = cv.height;
  const grab = () => g.getImageData(0, 0, w, h).data;
  // every draw seeds Math.random the same way (Park-Miller) so particles/flicker match between the bullets and no-bullets frames
  const R0 = Math.random, rd = (t, s = 12345) => { Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; m.render(t, 0); Math.random = R0; };
  const lum = (d, i) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(d[i]) + .7152 * f(d[i + 1]) + .0722 * f(d[i + 2]); };
  const sh = G.shake, t = G.t, eb = G.eb, cnt = eb.length, rs = eb.map(b => b.r).join(); G.shake = 0;
  rd(t); const A = grab(); G.eb = []; rd(t); const B = grab(); G.eb = eb;
  const hb = m.SET.hbox; m.SET.hbox = false; rd(t); const C = grab(); m.SET.hbox = hb; rd(t); const A2 = grab(); G.shake = sh;
  const same = G.eb === eb && eb.length === cnt && eb.map(b => b.r).join() === rs;
  // the dot: pixels that differ between hitbox on / off
  let dn = 0, dx0 = 1e9, dx1 = -1; for (let i = 0; i < w * h; i++) { const k = i * 4; if (Math.abs(A2[k] - C[k]) + Math.abs(A2[k + 1] - C[k + 1]) + Math.abs(A2[k + 2] - C[k + 2]) > 60) { dn++; const x = i % w; if (x < dx0) dx0 = x; if (x > dx1) dx1 = x; } }
  const dpr = w / (cv.clientWidth || w);
  // bullets: connected blobs of changed pixels
  const mask = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) { const k = i * 4; if (Math.abs(A[k] - B[k]) + Math.abs(A[k + 1] - B[k + 1]) + Math.abs(A[k + 2] - B[k + 2]) > 60) mask[i] = 1; }
  const blobs = [], st = [];
  for (let s = 0; s < w * h; s++) { if (mask[s] !== 1) continue; const px = []; st.push(s); mask[s] = 2;
    while (st.length) { const i = st.pop(); px.push(i); const x = i % w, y = (i / w) | 0; for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) if (j >= 0 && mask[j] === 1) { mask[j] = 2; st.push(j); } }
    if (px.length < 6 || px.length > 4000) continue;
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; const L = [];let cr = 0, cg = 0, cb = 0;
    for (const i of px) { const x = i % w, y = (i / w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; L.push(lum(A, i * 4)); cr += A[i * 4]; cg += A[i * 4 + 1]; cb += A[i * 4 + 2]; }
    const pad = Math.round(6 * dpr); let bl = 0, bn = 0, br = 0, bgc = 0, bb = 0;
    for (let y = Math.max(0, y0 - pad); y <= Math.min(h - 1, y1 + pad); y++) for (let x = Math.max(0, x0 - pad); x <= Math.min(w - 1, x1 + pad); x++) { const k = (y * w + x) * 4; bl += lum(B, k); br += B[k]; bgc += B[k + 1]; bb += B[k + 2]; bn++; }
    L.sort((a, b) => a - b); const Lb = L[Math.floor(L.length * .9)], Lg = bl / bn, n = px.length;
    blobs.push({ n, x: x0, y: y0, c: (Math.max(Lb, Lg) + .05) / (Math.min(Lb, Lg) + .05), d: Math.hypot(cr / n - br / bn, cg / n - bgc / bn, cb / n - bb / bn), col: [cr / n, cg / n, cb / n].map(Math.round) }); }
  // the backdrop as a whole (no bullets frame): mean luminance and saturation
  let bl = 0, bs = 0, n = 0; for (let i = 0; i < w * h; i += 37) { const k = i * 4, mx = Math.max(B[k], B[k + 1], B[k + 2]), mn = Math.min(B[k], B[k + 1], B[k + 2]); bl += lum(B, k); bs += mx ? (mx - mn) / mx : 0; n++; }
  return { cnt, same, blobs, dot: { n: dn, wCss: dx1 >= dx0 ? (dx1 - dx0 + 1) / dpr : 0 }, bgL: bl / n, bgS: bs / n, stat: Object.assign({}, window.READ ? READ.stat : {}), read: !!m.RET.read };
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: GAME_DIR, stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch(), R = {};
  for (const [size, vw, vh, touch] of [['390x763', 390, 763, true], ['1280x720', 1280, 720, false]]) for (const q of ['read=0', 'read=1']) for (const di of [2, 3]) {
    const ctx = await br.newContext({ viewport: { width: vw, height: vh }, hasTouch: touch, isMobile: touch }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&${q}`); await p.waitForFunction(() => window.__mnr && __mnr.ART); await sleep(1200);
    await p.evaluate(() => { __mnr.SET.auto = true; __mnr.applySet(); }); await p.click('#startBtn'); await p.waitForFunction(() => __mnr.running);
    await p.evaluate(di => { const m = __mnr; m.god = true; m.skipTo(di); setInterval(() => { if (m.G.live) { m.P.y = 270 + 160 * Math.sin(m.G.t * .7); m.P.x = 200; } }, 30); }, di);
    const k = size + ' ' + q, t0 = Date.now(); let shots = 0;
    while (Date.now() - t0 < 20000) { await sleep(1500); if (Date.now() - t0 < 5000) continue; const n = await p.evaluate(() => __mnr.G.eb.length); if (n < 4) continue;
      const best = await p.evaluate(MEASURE); if (SHOTS && !shots++) { fs.mkdirSync(SHOTS, { recursive: true }); await p.screenshot({ path: path.join(SHOTS, `read-${size}-${q}-d${di}.png`) }); }
      (R[k] = R[k] || { c: [], d: [], w: [], bgL: [], bgS: [], cnt: 0, same: true, dot: [], stat: best.stat, errs: [], read: best.read, worst: [] });
      R[k].c.push(...best.blobs.map(b => b.c)); R[k].d.push(...best.blobs.map(b => b.d)); R[k].worst.push(...best.blobs.map(b => ({ c: +b.c.toFixed(2), n: b.n, x: b.x, y: b.y, col: b.col, di })));
      if (best.blobs.length) R[k].w.push(pct(best.blobs.map(b => b.c), .1));
      R[k].bgL.push(best.bgL); R[k].bgS.push(best.bgS); R[k].cnt += best.cnt; R[k].same = R[k].same && best.same; R[k].dot.push(best.dot); R[k].stat = best.stat; }
    if (R[k]) R[k].errs.push(...errs);
    await ctx.close();
  }
  for (const size of ['390x763', '1280x720']) {
    const o = R[size + ' read=0'], n = R[size + ' read=1'], f = x => x.toFixed(2), f3 = x => x.toFixed(4);
    console.log(`${size}  bullets measured ${o.c.length} / ${n.c.length}`);
    console.log(`  contrast ratio bullet:backdrop  median ${f(med(o.c))} -> ${f(med(n.c))}   worst 10% ${f(pct(o.c, .1))} -> ${f(pct(n.c, .1))}`);
    console.log(`  colour distance (RGB)           median ${med(o.d).toFixed(0)} -> ${med(n.d).toFixed(0)}   worst 10% ${pct(o.d, .1).toFixed(0)} -> ${pct(n.d, .1).toFixed(0)}`);
    console.log(`  backdrop luminance ${f3(med(o.bgL))} -> ${f3(med(n.bgL))}   saturation ${f(med(o.bgS))} -> ${f(med(n.bgS))}`);
    if (process.env.WORST) console.log('  worst', JSON.stringify(o.worst.sort((a, b) => a.c - b.c).slice(0, 4)), '\n  worst', JSON.stringify(n.worst.sort((a, b) => a.c - b.c).slice(0, 6)));
    ok(`${size}: flag off draws nothing new (no dim, no dot, no halo)`, !o.read && !o.stat.dim && !o.stat.dot && !o.stat.halo && o.dot.every(d => d.n === 0), JSON.stringify(o.stat));
    ok(`${size}: drawing never changes the bullets (same list, count, radii)`, o.same && n.same);
    ok(`${size}: flag on dims the backdrop`, n.stat.dim > 0 && med(n.bgL) < med(o.bgL) * .8, f3(med(o.bgL)) + ' -> ' + f3(med(n.bgL)));
    ok(`${size}: hitbox dot visible, >= 4 css px wide`, n.dot.every(d => d.n > 0 && d.wCss >= 4), JSON.stringify(n.dot));
    const w3 = med(n.w.slice(0, 3));
    ok(`${size}: median bullet contrast improved`, med(n.c) > med(o.c), f(med(o.c)) + ' -> ' + f(med(n.c)));
    ok(`${size}: worst-10% bullet contrast >= 1.5:1 (flag on, median of 3 frames)`, w3 >= 1.5, f(w3) + ' :: frames ' + n.w.slice(0, 3).map(f).join(' '));
    ok(`${size}: no page errors`, !o.errs.length && !n.errs.length, (o.errs[0] || n.errs[0] || ''));
  }
  await br.close(); srv.kill(); console.log(bad ? 'FAILURES' : 'ALL PASS'); process.exit(bad ? 1 : 0);
})();
