#!/usr/bin/env node
// POLISH (parts/polish.js, RET.polish): a calm, readable playfield. MACHINE gates only (no screenshots are opened):
//   big translucent markers cover <= 15% of the playfield on average over a 60 s run, <= 3 big markers at once, the player ship
//   drawn last at alpha 1, enemy bullets >= 3:1 against their local backdrop, no page errors, ?polish=0 = the build without the part.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/polish-test.js      PROBE=1 prints who draws the big markers; CASES=s2:60,e20 picks the runs
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), PROBE = !!process.env.PROBE;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let bad = 0; const ok = (n, p, i) => { if (!p) bad++; console.log((p ? 'PASS ' : 'FAIL ') + n + (i ? ' :: ' + i : '')); };
// in the page, before any game code: count what the world layer draws while __pol.on (portrait: the world has its own off-screen canvas)
const INSTR = () => {
  const Q = window.__pol = { on: false, probe: false, fr: null, who: {} };
  const P = CanvasRenderingContext2D.prototype, world = c => c && !c.isConnected && c.width >= 300 && c.height >= 200;
  const aOf = s => { if (typeof s !== 'string') return .5; let m = s.match(/rgba?\(([^)]*)\)|hsla?\(([^)]*)\)/); if (m) { const v = (m[1] || m[2]).split(/[ ,/]+/).filter(Boolean); return v.length > 3 ? parseFloat(v[3]) * (/%/.test(v[3]) ? .01 : 1) : 1; }
    m = s.match(/^#([0-9a-f]{8})$/i); if (m) return parseInt(m[1].slice(6), 16) / 255; m = s.match(/^#([0-9a-f]{4})$/i); if (m) return parseInt(m[1][3] + m[1][3], 16) / 255; return 1; };
  const caller = () => { const s = (new Error().stack || '').split('\n').slice(1).filter(l => !/P\.<computed>|CanvasRenderingContext2D|caller|add \(|at add|rec|INSTR/.test(l)).slice(0, 3).map(l => (l.match(/at ([\w.$<>]+)/) || [])[1] || '?'); return s.join('<'); };
  const add = (c, x, y, r, kind, a, lw) => { const F = Q.fr; if (!F) return; const big = r >= 40 * c.width / 960; if (!big || a < .02 || r > 260 * c.width / 960) return;
    const k = c.width / 960; F.mk.push({ x: x / k, y: y / k, r: r / k, kind, a, lw: lw / k, w: 960, h: 540 }); if (Q.probe) { const k = kind + ' ' + caller(); const o = Q.who[k] || (Q.who[k] = { n: 0, r: 0, a: 0 }); o.n++; o.r += r / (c.width / 960); o.a += a; } };
  const wrap = (n, f) => { const o = P[n]; P[n] = function (...a) { if (Q.on && world(this.canvas)) f.call(this, a); return o.apply(this, a); }; };
  wrap('beginPath', function () { this.__arcs = []; });
  const pt = (t, x, y) => [t.a * x + t.c * y + t.e, t.b * x + t.d * y + t.f];
  wrap('arc', function (a) { const t = this.getTransform(), [x, y] = pt(t, a[0], a[1]); (this.__arcs || (this.__arcs = [])).push([x, y, a[2] * Math.hypot(t.a, t.b)]); });
  wrap('ellipse', function (a) { const t = this.getTransform(), [x, y] = pt(t, a[0], a[1]); (this.__arcs || (this.__arcs = [])).push([x, y, Math.max(a[2], a[3]) * Math.hypot(t.a, t.b)]); });
  const rec = (kind) => function () { const t = this.getTransform(), s = Math.hypot(t.a, t.b); for (const [x, y, r] of this.__arcs || []) add(this.canvas, x, y, r, kind, this.globalAlpha * aOf(kind === 'f' ? this.fillStyle : this.strokeStyle), this.lineWidth * s); };
  wrap('fill', rec('f')); wrap('stroke', function () { rec('s').call(this); const d = this.getLineDash(); if (d.length && Q.fr) { Q.fr.dash = (Q.fr.dash || 0) + 1; if (Q.probe) { const k = 'dash ' + caller(); const o = Q.who[k] || (Q.who[k] = { n: 0, r: 0, a: 0 }); o.n++; o.a += this.globalAlpha; } } });
  wrap('fillRect', function (a) { const F = Q.fr, c = this.canvas; if (!F) return; const t = this.getTransform(), s = Math.hypot(t.a, t.b) / (c.width / 960), ar = Math.abs(a[2] * a[3]) * s * s, al = this.globalAlpha * aOf(this.fillStyle);
    if (ar >= 960 * 540 * .03 && al < .95 && al > .02) { F.rect = (F.rect || 0) + ar / (960 * 540) * al; if (Q.probe) { const k = 'rect ' + caller(); const o = Q.who[k] || (Q.who[k] = { n: 0, r: 0, a: 0 }); o.n++; o.r += ar / (960 * 540) * 100; o.a += al; } } });
  wrap('drawImage', function (a) { const im = a[0]; if (!(im instanceof HTMLCanvasElement) || im.width !== 64 || im.height !== 64 || a.length !== 5) return;   // the cached radial glows (a.js glow / G_)
    const t = this.getTransform(), s = Math.hypot(t.a, t.b), [x, y] = pt(t, a[1] + a[3] / 2, a[2] + a[4] / 2); add(this.canvas, x, y, a[3] / 2 * s * .55, 'g', this.globalAlpha, 0); });
  // the ship: polish.js calls __pol.ship(alpha) when it draws it; every world draw after that is counted (it must sit on top)
  Q.ship = a => { if (Q.fr) { Q.fr.ship = a; Q.fr.after = 0; } };
  for (const n of ['fill', 'stroke', 'drawImage', 'fillRect', 'fillText']) wrap(n, function () { const F = Q.fr; if (F && F.ship != null && !F.inShip) F.after++; });
};
// coverage of one frame's big markers on a coarse grid (fills = discs, strong rings = their disc, faint hairline rings (alpha <= .35, <= 2.5 units) = their band, glows = their core);
// big markers = distinct centres (concentric = one)
const FRAME = (mk) => {
  if (!mk.length) return { cov: 0, n: 0 };
  const w = mk[0].w, h = mk[0].h, GX = 96, GY = 54, cell = new Uint8Array(GX * GY); let n = 0; const cs = [];
  for (const m of mk) { const strong = m.kind === 's' ? (m.a > .35 || m.lw > 2.5) : m.kind === 'g' ? m.a > .1 : m.kind === 'p' ? m.a > .2 : m.a >= .05;
    if (strong && !cs.some(c => Math.hypot(c.x - m.x, c.y - m.y) < Math.max(12, m.r * .15))) cs.push(m);
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) { const cx = (i + .5) * w / GX, cy = (j + .5) * h / GY, d = Math.hypot(cx - m.x, cy - m.y);
      if (m.kind === 's' && !(m.a > .35 || m.lw > 2.5) ? Math.abs(d - m.r) <= Math.max(m.lw / 2, w / GX / 2) : d <= m.r) cell[j * GX + i] = 1; } }
  for (const v of cell) n += v; return { cov: n / (GX * GY), n: cs.length };
};
// enemy bullets against their local backdrop (as readable-test.js): the frame drawn with and without G.eb; changed pixels = bullets, the other frame = backdrop
const CONTRAST = () => {
  const m = __mnr, G = m.G, cv = document.querySelector('canvas'), g = cv.getContext('2d', { willReadFrequently: true }), w = cv.width, h = cv.height, grab = () => g.getImageData(0, 0, w, h).data;
  const lum = (d, i) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(d[i]) + .7152 * f(d[i + 1]) + .0722 * f(d[i + 2]); };
  let sd = 1; const rr = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }, mr = Math.random, R0 = () => { sd = 12345; Math.random = rr; };
  const sh = G.shake, eb = G.eb; G.shake = 0; R0(); m.render(G.t, 0); const A = grab(); G.eb = []; R0(); m.render(G.t, 0); const B = grab(); G.eb = eb; G.shake = sh; Math.random = mr;
  const mask = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) { const k = i * 4; if (Math.abs(A[k] - B[k]) + Math.abs(A[k + 1] - B[k + 1]) + Math.abs(A[k + 2] - B[k + 2]) > 60) mask[i] = 1; }
  const out = [], st = [], dpr = w / (cv.clientWidth || w);
  for (let s = 0; s < w * h; s++) { if (mask[s] !== 1) continue; const px = []; st.push(s); mask[s] = 2;
    while (st.length) { const i = st.pop(); px.push(i); const x = i % w, y = (i / w) | 0; for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) if (j >= 0 && mask[j] === 1) { mask[j] = 2; st.push(j); } }
    if (px.length < 6 || px.length > 4000) continue; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; const L = [];
    for (const i of px) { const x = i % w, y = (i / w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; L.push(lum(A, i * 4)); }
    const pad = Math.round(6 * dpr); let bl = 0, bn = 0; for (let y = Math.max(0, y0 - pad); y <= Math.min(h - 1, y1 + pad); y++) for (let x = Math.max(0, x0 - pad); x <= Math.min(w - 1, x1 + pad); x++) { bl += lum(B, (y * w + x) * 4); bn++; }
    L.sort((a, b) => a - b); const Lb = L[Math.floor(L.length * .9)], Lg = bl / bn; out.push((Math.max(Lb, Lg) + .05) / (Math.min(Lb, Lg) + .05)); }
  return out;
};
const RUN = (o) => {
  const m = window.__mnr, Q = window.__pol; let sd = o.seed >>> 0; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }; Math.random = rnd;
  if (!m.ART.__polw) { const pic = m.ART.pic; m.ART.__polw = 1; m.ART.pic = function (id, w, x, y, rot, al) { const r = pic.apply(this, arguments); const F = Q.fr;
    if (r && F && Q.on && /^(fx-|rule-|nv-ev-)/.test(id) && w >= 80) { F.mk.push({ x: x, y: y, r: w * .35, kind: 'p', a: al == null ? 1 : al, lw: 0, w: 960, h: 540, world: 1 }); if (Q.probe) { const k = 'pic ' + id; const o = Q.who[k] || (Q.who[k] = { n: 0, r: 0, a: 0 }); o.n++; o.r += w / 2; o.a += al == null ? 1 : al; } } return r; }; }
  m.god = true; if (o.story) m.startStory(o.story); else document.getElementById('startBtn').click(); m.simOn(true);
  const dt = 1 / 60, out = [], con = [], CONTRAST = eval('(' + o.con + ')'); let i = 0;
  if (o.wave) { while (m.running && window.ENDR && ENDR.w < o.wave && m.G.t < 4000) { if (m.SH.active) m.SH.close(); if (i % 3 === 0) m.touchTo(300 + 200 * Math.sin(i / 50), 270 + 200 * Math.sin(i / 37)); m.step(dt); i++; } }
  const t0 = m.G.t;
  while (m.running && m.G.t - t0 < o.t) {
    if (m.SH.active) m.SH.close(); if (i % 20 === 0) m.press('Fire'); if (i % 3 === 0) m.touchTo(300 + 200 * Math.sin(i / 50), 270 + 200 * Math.sin(i / 37));
    m.step(dt); i++;
    if (o.con && i % 300 === 150 && m.G.eb.length >= 3) con.push(...CONTRAST());
    if (i % 30 === 0) { Q.fr = { mk: [], ship: null, after: 0 }; Q.on = true; try { m.render(m.G.t, dt); } finally { Q.on = false; } out.push(Q.fr); Q.fr = null; }
  }
  return { fr: out, con, t: m.G.t - t0, who: Q.who, pol: !!(m.RET && m.RET.polish), st: window.POL ? POL.st : null };
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (q, vw = 390, vh = 763, file = 'index.html') => { const ctx = await br.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push(q + ': ' + e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.addInitScript(INSTR);
    await p.goto(`http://127.0.0.1:${port}/${file}?sim=1&nomusic=1${q}`); await p.waitForFunction(() => window.__mnr && __mnr.ART); await sleep(600); if (PROBE) await p.evaluate(() => __pol.probe = true); return { p, ctx }; };
  const run = async (q, o, vw, vh) => { const { p, ctx } = await open(q, vw, vh); const r = await p.evaluate(`(${RUN})(${JSON.stringify(o)})`); await ctx.close(); return r; };
  const sum = (r) => { const fs_ = r.fr.map(f => FRAME(f.mk)), rect = r.fr.reduce((a, f) => a + (f.rect || 0), 0) / Math.max(1, r.fr.length), dash = r.fr.reduce((a, f) => a + (f.dash || 0), 0) / Math.max(1, r.fr.length); const cov = fs_.reduce((a, f) => a + f.cov, 0) / Math.max(1, fs_.length), mx = Math.max(0, ...fs_.map(f => f.n)), avgN = fs_.reduce((a, f) => a + f.n, 0) / Math.max(1, fs_.length);
    const sh = r.fr.filter(f => f.ship != null); return { cov, mx, avgN, rect, dash, frames: fs_.length, shipA: sh.length ? Math.min(...sh.map(f => f.ship)) : null, after: sh.length ? Math.max(...sh.map(f => f.after)) : null, shipN: sh.length }; };
  const CASES = (process.env.CASES || 's2:60,s6,s10,s14,s20,s4,e20').split(',');
  const caseOf = c => { const [k, t] = c.split(':'); return k[0] === 'e' ? { wave: +k.slice(1), t: +(t || 15) } : { story: +k.slice(1), t: +(t || 15) }; };
  const R = {}, med = a => { const x = [...a].sort((p, q) => p - q); return x.length ? x[Math.floor(x.length / 2)] : 0; }, pct = (a, q) => { const x = [...a].sort((p, r) => p - r); return x.length ? x[Math.floor(x.length * q)] : 0; };
  for (const [vw, vh] of [[390, 763], [375, 553]]) for (const q of ['&polish=0', '&polish=1']) for (const c of CASES) {
    if (vw === 375 && q === '&polish=0') continue;
    const o = Object.assign(caseOf(c), { seed: 7, con: CONTRAST.toString() }), r = await run(q, o, vw, vh), s = sum(r), k = vw + q; (R[k] = R[k] || []).push(Object.assign(s, { c, con: r.con, pol: r.pol }));
    if (PROBE) console.log('   st ' + JSON.stringify(r.st));
    console.log(`  ${vw}x${vh} ${q.slice(1)} ${c}: cover ${(100 * s.cov).toFixed(1)}%  big markers max ${s.mx} avg ${s.avgN.toFixed(1)}  bands ${(100 * s.rect).toFixed(1)}%  dashed ${s.dash.toFixed(1)}/frame  ship a ${s.shipA} after ${s.after}  bullet contrast med ${med(r.con).toFixed(1)} p10 ${pct(r.con, .1).toFixed(1)} (n ${r.con.length})`);
    if (PROBE) { const top = Object.entries(r.who).sort((a, b) => b[1].n - a[1].n).slice(0, 14); for (const [k, v] of top) console.log(`      ${v.n}x r~${(v.r / v.n).toFixed(0)} a~${(v.a / v.n).toFixed(2)} ${k}`); } }
  for (const k of Object.keys(R)) { const L = R[k], con = L.flatMap(x => x.con), s60 = L.find(x => /:60$/.test(x.c));
    const line = `cover avg ${(100 * L.reduce((a, x) => a + x.cov, 0) / L.length).toFixed(1)}% (60 s run ${s60 ? (100 * s60.cov).toFixed(1) : '-'}%), big markers max ${Math.max(...L.map(x => x.mx))}, bullet contrast median ${med(con).toFixed(2)} p10 ${pct(con, .1).toFixed(2)}`;
    if (/polish=0/.test(k)) { console.log(`  BEFORE ${k}: ${line}`); ok(`?polish=0: the part is off (RET.polish false)`, L.every(x => !x.pol)); continue; }
    console.log(`  AFTER  ${k}: ${line}`);
    ok(`${k}: big markers cover <= 15% of the playfield on average (60 s run)`, s60 && s60.cov <= .15 && L.every(x => x.cov <= .15), (100 * (s60 ? s60.cov : 1)).toFixed(1) + '%');
    ok(`${k}: <= 3 big markers at once`, L.every(x => x.mx <= 3), 'max ' + Math.max(...L.map(x => x.mx)));
    ok(`${k}: the ship is drawn last at alpha 1 in every frame it shows`, L.every(x => x.shipN > 0 && x.shipA === 1 && x.after === 0), L.map(x => x.shipN + '/' + x.frames).join(' '));
    ok(`${k}: enemy bullets >= 3:1 against their local backdrop (median)`, con.length >= 20 && med(con) >= 3, `median ${med(con).toFixed(2)}, p10 ${pct(con, .1).toFixed(2)}, n ${con.length}`); }
  // ?polish=0 = the build without the part: nothing is installed (no wrapper on render / drawPlayer / drawEnemy / FXV, no context wrappers)
  { const { p, ctx } = await open('&polish=0'); const r = await p.evaluate(() => { const m = __mnr, c = document.querySelector('canvas').getContext('2d');
      return { on: !!(window.POL && POL.on), render: /POL\./.test(m.render.toString()), ctx: Object.prototype.hasOwnProperty.call(c, 'fill'), pic: /POL\./.test(m.ART.pic.toString() + m.ART.put.toString()) }; });
    await ctx.close(); ok('?polish=0 installs nothing (the game exactly as before)', !r.on && !r.render && !r.ctx && !r.pic, JSON.stringify(r)); }
  ok('no page errors', !errs.length, errs.slice(0, 3).join(' | '));
  await br.close(); srv.kill();
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
