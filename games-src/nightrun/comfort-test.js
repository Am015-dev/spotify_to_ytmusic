#!/usr/bin/env node
// Comfort / eye-strain gates (parts/comfort.js, flag RET.comfort, default ON; ?comfort=0 = the old look and feel).
//   NR_OUT=/tmp/nr.html python3 games-src/nightrun/parts/build.py && NODE_PATH=$(npm root -g) node games-src/nightrun/comfort-test.js [/tmp/nr.html]
//   env: MEASURE=1 only prints the numbers (no gates, with ?comfort=0 as well as default: the before / after table)   SECS=60   ONLY=<scenario substring>
// Bot runs (390x763 phone, 60 s of simulated game each, stages 2 6 10 14, boss, endless wave 20, + a 20 s stress run that asks for a flash 10 times a second) record every frame: mean luminance, a 16x32 luminance grid, red area,
// the screen-flash / glitch triggers, shake amplitude and the area of additive ('lighter') drawing. Then:
//   flash   flashes per second (WCAG 2.3.1 style: an opposing pair of luminance changes > 10% over >= 25% of the screen) <= 3 in every 1 s window, game flash triggers <= 3 / s
//   contrast sampled HUD text / bullets vs their backdrop; shake caps; min text size; settings persist and apply live; ?comfort=0 identical; no page error
const PW = require(process.env.PW || 'playwright'), path = require('path');
const gx = require('../scripts/gx-serve.js');
const FILE = path.resolve(process.argv[2] || path.resolve(__dirname, '../../games/mainhattan-nightrun/index.html'));
const SECS = +process.env.SECS || 60, MEASURE = !!process.env.MEASURE, ONLY = process.env.ONLY || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const ok = (n, p, i) => { if (!p) bad++; console.log((p ? 'PASS ' : 'FAIL ') + n + (i ? ' :: ' + i : '')); };
const SCN = [['stage2', 'story', 2], ['stage6', 'story', 6], ['stage10', 'story', 10], ['stage14', 'story', 14], ['boss', 'boss', 4], ['endless20', 'endless', 20], ['stress', 'stress', 2]].filter(s => !ONLY || s[0].includes(ONLY));

// ---- in the page: play one scenario by hand-stepping and record every frame ----
const RUN = new Function('o', `
  const m = window.__mnr, cv = document.getElementById('cv') || document.querySelector('canvas'), G = () => m.G;
  const GW = 16, GH = 32, sm = document.createElement('canvas'); sm.width = GW; sm.height = GH; const sg = sm.getContext('2d', { willReadFrequently: true });
  let sd = 7; const rr = Math.random; Math.random = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
  // additive area: every fillRect / arc / drawImage drawn with 'lighter'
  let add = 0; const P = CanvasRenderingContext2D.prototype, o_fr = P.fillRect, o_di = P.drawImage, o_ar = P.arc;
  const sc = c => { const t = c.getTransform(), d = c.canvas.width * c.canvas.height; return d ? Math.abs(t.a * t.d - t.b * t.c) / d : 0; };
  P.fillRect = function (x, y, w, h) { if (this.globalCompositeOperation === 'lighter') { const v = Math.abs(w * h) * this.globalAlpha * sc(this); if (isFinite(v)) add += v; } return o_fr.apply(this, arguments); };
  P.drawImage = function (im, a, b, c, d, e, f, g, h) { if (this.globalCompositeOperation === 'lighter') { const w = arguments.length > 5 ? g : arguments.length > 3 ? c : im.width, hh = arguments.length > 5 ? h : arguments.length > 3 ? d : im.height; { const v = Math.abs(w * hh) * this.globalAlpha * sc(this); if (isFinite(v)) add += v; } } return o_di.apply(this, arguments); };
  P.arc = function (x, y, r) { if (this.globalCompositeOperation === "lighter") { const v = Math.PI * r * r * this.globalAlpha * sc(this); if (isFinite(v)) add += v; } return o_ar.apply(this, arguments); };
  m.SET.diff = 'normal'; m.applySet();
  if (o.kind === 'endless') { document.getElementById('startBtn').click(); } else m.startStory(o.n);
  m.simOn(true); m.god = false; let i = 0;
  for (let k = 0; k < 30; k++) m.step(1 / 60);
  if (o.kind === 'endless' && window.ENDR) window.ENDR.w = o.n - 1;
  if (o.kind === 'boss') { m.bossNow(); }
  const N = o.secs * 60, Lm = new Float32Array(N), Lg = new Float32Array(N * GW * GH), red = new Float32Array(N), fl = new Float32Array(N), gl = new Float32Array(N), shk = new Float32Array(N), ad = new Float32Array(N), t = new Float32Array(N);
  let pf = 0, died = 0;
  for (i = 0; i < N; i++) {
    if (!m.running) { died++; break; }
    if (m.SH && m.SH.active) m.SH.close();
    if (i % 20 === 0) m.press('Fire'); if (i % 3 === 0) m.touchTo(300 + 200 * Math.sin(i / 50), 270 + 200 * Math.sin(i / 37));
    if (m.P.hp < 2) m.P.hp = m.P.max; if (o.kind === 'boss' && i % 600 === 599) m.bossNow();
    if (o.kind === 'stress' && i % 6 === 0) { m.G.flash = Math.max(m.G.flash, .9); m.G.glitch = Math.max(m.G.glitch, .6); }   // worst case: every effect asks for a full-screen flash 10 times a second
    m.step(1 / 60); const g = G(); add = 0; m.render(g.t, 1 / 60); ad[i] = add;
    sg.drawImage(cv, 0, 0, GW, GH); const d = sg.getImageData(0, 0, GW, GH).data; let sum = 0, rd = 0;
    for (let c = 0; c < GW * GH; c++) { const L = .2126 * lin(d[c * 4]) + .7152 * lin(d[c * 4 + 1]) + .0722 * lin(d[c * 4 + 2]); Lg[i * GW * GH + c] = L; sum += L;
      const s = d[c * 4] + d[c * 4 + 1] + d[c * 4 + 2]; if (s > 60 && d[c * 4] / s > .75) rd++; }
    Lm[i] = sum / (GW * GH); red[i] = rd / (GW * GH); fl[i] = g.flash || 0; gl[i] = g.glitch || 0; shk[i] = g.shake || 0; t[i] = g.t;
  }
  Math.random = rr; P.fillRect = o_fr; P.drawImage = o_di; P.arc = o_ar;
  return { N: i, GW, GH, Lm: Array.from(Lm.slice(0, i)), Lg: Array.from(Lg.slice(0, i * GW * GH)), red: Array.from(red.slice(0, i)), fl: Array.from(fl.slice(0, i)), gl: Array.from(gl.slice(0, i)), shk: Array.from(shk.slice(0, i)), ad: Array.from(ad.slice(0, i)), died };
`);

// ---- node side: WCAG-style flash analysis ----
function analyse(r) {
  const n = r.N, C = r.GW * r.GH, secs = n / 60, ev = [];   // large-area luminance events: [frame, sign, kind]
  for (let f = 1; f < n; f++) {
    let pos = 0, neg = 0; for (let c = 0; c < C; c++) { const d = r.Lg[f * C + c] - r.Lg[(f - 1) * C + c], dark = Math.min(r.Lg[f * C + c], r.Lg[(f - 1) * C + c]) < .8; if (dark && d > .1) pos++; else if (dark && d < -.1) neg++; }
    if (pos / C >= .25 || neg / C >= .25) ev.push([f, pos > neg ? 1 : -1, 'lum']);
    const dr = r.red[f] - r.red[f - 1]; if (Math.abs(dr) >= .25) ev.push([f, dr > 0 ? 1 : -1, 'red']);
  }
  const flashesIn = (kind) => { const e = ev.filter(x => x[2] === kind), fls = []; let last = 0; for (const x of e) { if (x[1] !== last) { fls.push(x[0]); last = x[1]; } else if (x[0] - fls[fls.length - 1] > 30) { fls.push(x[0]); } }   // an opposing change closes a flash; a lone change older than 0.5 s is its own flash
    let worst = 0; for (let a = 0; a < fls.length; a++) { let k = 0; for (let b = a; b < fls.length && fls[b] - fls[a] < 60; b++) k++; worst = Math.max(worst, k); }
    return { n: fls.length, worst }; };
  // the 'general flash' counts pairs of opposing changes: a flash = one rise + one fall
  const pairs = (kind) => { const e = ev.filter(x => x[2] === kind); let k = 0, w = 0; const tt = []; for (let a = 1; a < e.length; a++) if (e[a][1] !== e[a - 1][1]) tt.push(e[a][0]); for (let a = 0; a < tt.length; a++) { let c = 0; for (let b = a; b < tt.length && tt[b] - tt[a] < 60; b++) c++; w = Math.max(w, c); } return { n: tt.length, worst: Math.ceil(w / 2) }; };
  const L = pairs('lum'), R = pairs('red');
  let trig = 0; const trigT = []; for (let f = 1; f < n; f++) if ((r.fl[f] > r.fl[f - 1] + .02) || (r.gl[f] > r.gl[f - 1] + .02)) { trig++; trigT.push(f); }
  let tw = 0; for (let a = 0; a < trigT.length; a++) { let c = 0; for (let b = a; b < trigT.length && trigT[b] - trigT[a] < 60; b++) c++; tw = Math.max(tw, c); }
  let mx = 0, dLm = 0, big = 0; for (let f = 1; f < n; f++) { dLm = Math.abs(r.Lm[f] - r.Lm[f - 1]); if (dLm > .1) big++; mx = Math.max(mx, r.fl[f]); }
  const sorted = a => [...a].sort((x, y) => x - y), ad = sorted(r.ad), shk = r.shk;
  let shDur = 0, run = 0, shMax = 0, shLong = 0; for (const v of shk) { shMax = Math.max(shMax, v); if (v > .5) { run++; shLong = Math.max(shLong, run); } else run = 0; }
  return { secs: +secs.toFixed(1), died: r.died, lumFlashPerSec: +(L.n / 2 / secs).toFixed(2), lumFlashWorst1s: L.worst, redFlashWorst1s: R.worst, trigPerSec: +(trig / secs).toFixed(2), trigWorst1s: tw, bigMeanJumps: big, flashMax: +mx.toFixed(2),
    meanL: +(r.Lm.reduce((a, b) => a + b, 0) / n).toFixed(3), addMean: +(r.ad.reduce((a, b) => a + b, 0) / n).toFixed(2), addP95: +ad[Math.floor(n * .95)].toFixed(2), shakeMax: +shMax.toFixed(1), shakeLongest: +(shLong / 60).toFixed(2) };
}

async function page(br, url, w, h, touch) {
  const ctx = await br.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch }), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.goto(url, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && __mnr.ART, null, { timeout: 30000 }); await sleep(800);
  return { ctx, p, errs };
}


// ---- HUD text: size and contrast against the pixels behind it (?scn=nr-hud-busy = the worst-case phone moment) ----
const HUDTXT = () => {
  const m = window.__mnr, cv = document.getElementById('cv') || document.querySelector('canvas'); m.simOn(true); m.G.banner.t = 0; m.G.hint.t = 0; m.G.shake = 0; m.G.glitch = 0; m.G.flash = 0;
  const g = cv.getContext('2d', { willReadFrequently: true }), k = cv.getBoundingClientRect().width / cv.width, proto = CanvasRenderingContext2D.prototype, ft = proto.fillText, rec = [];
  const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }, L = (r, gg, b) => .2126 * lin(r) + .7152 * lin(gg) + .0722 * lin(b);
  const col = s => { s = String(s); let mm = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i.exec(s); if (mm) return [parseInt(mm[1], 16), parseInt(mm[2], 16), parseInt(mm[3], 16), mm[4] ? parseInt(mm[4], 16) / 255 : 1]; mm = /rgba?\(([^)]+)\)/.exec(s); if (mm) { const a = mm[1].split(',').map(Number); return [a[0], a[1], a[2], a.length > 3 ? a[3] : 1]; } return null; };
  proto.fillText = function (txt, x, y) { try { const t = this.getTransform(), sc = Math.hypot(t.a, t.b), px = parseFloat(/(\d+(?:\.\d+)?)px/.exec(this.font)[1]) * sc * k, tw = this.measureText(String(txt)).width * sc;
    const cx = t.a * x + t.c * y + t.e, cy = t.b * x + t.d * y + t.f, al = this.textAlign, x0 = al === 'right' || al === 'end' ? cx - tw : al === 'center' ? cx - tw / 2 : cx;
    if (this.canvas === cv && /\S/.test(String(txt))) rec.push({ t: String(txt), px, c: col(this.fillStyle), ga: this.globalAlpha, x0, x1: x0 + tw, cy, h: parseFloat(/(\d+(?:\.\d+)?)px/.exec(this.font)[1]) * sc }); } catch (e) { } return ft.apply(this, arguments); };
  m.render(m.G.t, 0); proto.fillText = ft;
  const w = cv.width, h = cv.height, out = [];
  for (const r of rec) { const x0 = Math.max(0, Math.floor(r.x0)), x1 = Math.min(w, Math.ceil(r.x1)), y0 = Math.max(0, Math.floor(r.cy - r.h * .9)), y1 = Math.min(h, Math.ceil(r.cy + r.h * .2)); if (x1 <= x0 || y1 <= y0 || !r.c) continue;
    const d = g.getImageData(x0, y0, x1 - x0, y1 - y0).data, ls = []; for (let i = 0; i < d.length; i += 4) ls.push(L(d[i], d[i + 1], d[i + 2])); ls.sort((a, b) => a - b);
    const bgL = ls[Math.floor(ls.length * (L(r.c[0], r.c[1], r.c[2]) > .3 ? .35 : .65))], a = r.c[3] * r.ga, tl = L(r.c[0], r.c[1], r.c[2]) * a + bgL * (1 - a);   // text colour blended with the backdrop, backdrop = a typical (not extreme) pixel
    out.push({ t: r.t.slice(0, 12), px: +r.px.toFixed(1), cr: +((Math.max(tl, bgL) + .05) / (Math.min(tl, bgL) + .05)).toFixed(2) }); }
  return out;
};
// ---- bullets and enemies against the backdrop: the same frame with and without them ----
const OBJ = () => {
  const m = window.__mnr, G = m.G, cv = document.getElementById('cv') || document.querySelector('canvas'), g = cv.getContext('2d', { willReadFrequently: true }), w = cv.width, h = cv.height;
  const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }, L = (d, i) => .2126 * lin(d[i]) + .7152 * lin(d[i + 1]) + .0722 * lin(d[i + 2]);
  let sd = 5; const rr = Math.random, R0 = () => { sd = 5; Math.random = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }; };
  const port = m.rotMode, scr = (x, y) => port ? [y / 540 * w, (960 - x) / 960 * h] : [x / 960 * w, y / 540 * h], sh = G.shake; G.shake = 0;
  const eb = G.eb, en = G.en; R0(); m.render(G.t, 0); const A = g.getImageData(0, 0, w, h).data;
  G.eb = []; R0(); m.render(G.t, 0); const Bb = g.getImageData(0, 0, w, h).data; G.eb = eb; G.en = []; R0(); m.render(G.t, 0); const Be = g.getImageData(0, 0, w, h).data; G.en = en; G.shake = sh; Math.random = rr;
  const patch = (D, cx, cy, r, f) => { const ls = []; for (let y = Math.max(0, Math.round(cy - r)); y <= Math.min(h - 1, Math.round(cy + r)); y++) for (let x = Math.max(0, Math.round(cx - r)); x <= Math.min(w - 1, Math.round(cx + r)); x++) ls.push(L(D, (y * w + x) * 4)); ls.sort((a, b) => a - b); return ls[Math.floor(ls.length * f)]; };
  const res = { b: [], e: [] };
  for (const b of eb) { const [cx, cy] = scr(b.x, b.y); if (cx < 8 || cy < 60 || cx > w - 8 || cy > h - 8) continue; const lb = patch(A, cx, cy, 3, .9), lg = patch(Bb, cx, cy, 10, .5); res.b.push((Math.max(lb, lg) + .05) / (Math.min(lb, lg) + .05)); }
  for (const e of en) { if (e.x > 900 || e.x < 20) continue; const [cx, cy] = scr(e.x, e.y); if (cx < 8 || cy < 60 || cx > w - 8 || cy > h - 8) continue; const r = Math.max(5, (e.r || 14) * (port ? w / 540 : w / 960)); const le = patch(A, cx, cy, r, .95), lg = patch(Be, cx, cy, r * 1.6, .5); res.e.push((Math.max(le, lg) + .05) / (Math.min(le, lg) + .05)); }
  return res;
};


// ---- DOM text: size and contrast (background = the opaque layers behind it; painted buttons by their alpha-weighted mean colour) ----
const DOMSCAN = async () => {
  const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
  const parse = s => { const m = s.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const imgc = {}, urls = [...new Set([...document.querySelectorAll('body *')].map(e => getComputedStyle(e).backgroundImage).filter(b => /url\(/.test(b)).map(b => b.match(/url\("?([^")]*)"?\)/)[1]))];
  for (const u of urls) { try { const im = new Image(); im.src = u; await im.decode(); const c = document.createElement('canvas'); c.width = c.height = 8; const g = c.getContext('2d'); g.drawImage(im, im.width * .3, im.height * .3, im.width * .4, im.height * .4, 0, 0, 8, 8); const d = g.getImageData(0, 0, 8, 8).data;   // the face of a painted button, not its dark rim let R = 0, G = 0, B = 0, A = 0;
    for (let i = 0; i < 256; i += 4) { R += d[i] * d[i + 3]; G += d[i + 1] * d[i + 3]; B += d[i + 2] * d[i + 3]; A += d[i + 3]; } imgc[u] = A ? { r: R / A, g: G / A, b: B / A, a: A / 64 / 255 } : null; } catch (e) { } }
  const bgOf = el => { const layers = []; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); let c = parse(cs.backgroundColor); const um = cs.backgroundImage.match(/url\("?([^")]*)"?\)/);
      if (um && imgc[um[1]]) c = imgc[um[1]]; else if (cs.backgroundImage !== 'none') { const ms = cs.backgroundImage.match(/rgba?\([^)]*\)/g); if (ms && ms.length) { const ps = ms.map(parse); c = { r: ps.reduce((a, b) => a + b.r, 0) / ps.length, g: ps.reduce((a, b) => a + b.g, 0) / ps.length, b: ps.reduce((a, b) => a + b.b, 0) / ps.length, a: Math.max(...ps.map(q => q.a)) }; } }
      if (c.a > 0) layers.push(c); if (c.a >= 1) break; }
    let base = [5, 3, 12]; for (const c of layers.reverse()) base = [0, 1, 2].map(i => base[i] * (1 - c.a) + [c.r, c.g, c.b][i] * c.a); return base; };
  const out = [];
  for (const el of document.querySelectorAll('body *')) { if (['SCRIPT', 'STYLE'].includes(el.tagName)) continue; let t = ''; for (const n of el.childNodes) if (n.nodeType === 3) t += n.textContent; t = t.trim(); if (!t) continue;
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize); if (!fs) continue; const c = parse(cs.color), bg = bgOf(el), fg = [0, 1, 2].map(i => bg[i] * (1 - c.a) + [c.r, c.g, c.b][i] * c.a), L1 = lum(fg), L2 = lum(bg);
    out.push({ t: t.slice(0, 20), id: (el.id || el.className || el.tagName).toString().slice(0, 20), fs, w: +cs.fontWeight, cr: +((Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05)).toFixed(2) }); }
  return out;
};
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length * q)] : 0; };
const crNeed = x => x.fs >= 24 || (x.fs >= 18.66 && x.w >= 700) ? 3 : 4.5;

async function phoneRun(br, url, w, h, fn, wait) {
  const { ctx, p, errs } = await page(br, url, w, h, true);
  try { return { r: await p.evaluate(fn), errs, p, ctx }; } catch (e) { errs.push(e.message); return { r: null, errs, p, ctx }; }
}

module.exports = { RUN, analyse, SCN, page, HUDTXT, OBJ, DOMSCAN };
if (require.main === module) (async () => {
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const U = async q => gx.url('mainhattan-nightrun', { file: FILE, query: '?nomusic=1' + q });
  // 1. flashes, caps, additive area in the bot runs
  const modes = MEASURE ? ['comfort=0', ''] : [''];
  for (const q of modes) {
    const url = await U('&sim=1' + (q ? '&' + q : ''));
    for (const [name, kind, n] of SCN) {
      const { ctx, p, errs } = await page(br, url, 390, 763, true);
      const r = await p.evaluate(RUN, { kind, n, secs: kind === 'stress' ? Math.min(SECS, 20) : SECS }), a = analyse(r);
      console.log((q || 'default').padEnd(10), name.padEnd(10), JSON.stringify(a), errs.length ? 'ERR ' + errs[0] : '');
      if (!MEASURE) { ok(name + ' flashes <= 3/s (luminance pairs, red) in every 1 s window', a.lumFlashWorst1s <= 3 && a.redFlashWorst1s <= 3, 'lum ' + a.lumFlashWorst1s + ' red ' + a.redFlashWorst1s + ' (' + a.lumFlashPerSec + '/s)');
        ok(name + ' full-screen flash triggers <= 3/s', a.trigWorst1s <= 3, a.trigWorst1s + ' (' + a.trigPerSec + '/s)'); ok(name + ' shake amplitude <= 8 and no shake longer than 0.3 s', a.shakeMax <= 8 && a.shakeLongest <= .3, a.shakeMax + ' / ' + a.shakeLongest + ' s'); ok(name + ' no page error', !errs.length, errs[0]); }
      await ctx.close();
    }
  }
  if (MEASURE) { await br.close(); return; }
  // 2. HUD text on phones: size and contrast
  for (const [w, h] of [[390, 763], [375, 553]]) {
    const url = await U('&scn=nr-hud-busy'), { ctx, p, errs } = await page(br, url, w, h, true);
    await p.waitForFunction(() => __mnr.running, null, { timeout: 30000 }); await sleep(1200);
    const t = await p.evaluate(HUDTXT), small = t.filter(x => x.px < 13.95), low = t.filter(x => x.cr < (x.px >= 24 ? 3 : 4.5));
    ok(`${w}x${h} HUD text >= 14 css px (${t.length} texts)`, !small.length, small.map(x => x.t + ' ' + x.px).join(', '));
    ok(`${w}x${h} HUD text contrast >= 4.5:1 (3:1 large)`, !low.length, low.map(x => x.t + ' ' + x.cr).join(', ') || 'min ' + Math.min(...t.map(x => x.cr)));
    ok(`${w}x${h} no page error`, !errs.length, errs[0]); await ctx.close();
  }
  // 3. bullets and enemies against the backdrop
  {
    const url = await U('&sim=1'), res = { b: [], e: [] };
    for (const [kind, n] of [['story', 6], ['story', 10], ['endless', 12]]) {
      const { ctx, p, errs } = await page(br, url, 390, 763, true);
      const o = await p.evaluate(`(()=>{const m=__mnr;m.SET.diff='normal';m.applySet();if(${kind === 'endless' ? 'true' : 'false'})document.getElementById('startBtn').click();else m.startStory(${n});m.simOn(true);m.god=true;if(window.ENDR&&${kind === 'endless'})ENDR.w=${n};
        const T=()=>(${OBJ.toString()})(), res={b:[],e:[]};for(let i=0;i<5400;i++){if(m.SH&&m.SH.active)m.SH.close();if(i%20===0)m.press('Fire');if(i%3===0)m.touchTo(300+200*Math.sin(i/50),270+200*Math.sin(i/37));m.step(1/60);
        if(i%450===449&&m.G.eb.length>=4){const r=T();res.b.push(...r.b);res.e.push(...r.e);}}return res;})()`);
      res.b.push(...o.b); res.e.push(...o.e); await ctx.close();
    }
    ok(`enemy bullets vs backdrop: median >= 3:1 (${res.b.length} bullets)`, res.b.length >= 10 && pct(res.b, .5) >= 3, `median ${pct(res.b, .5).toFixed(2)} p10 ${pct(res.b, .1).toFixed(2)} p5 ${pct(res.b, .05).toFixed(2)}`);
    ok(`enemy bullets vs backdrop: p10 >= 3:1`, pct(res.b, .1) >= 3, pct(res.b, .1).toFixed(2));
    ok(`enemies vs backdrop: median >= 3:1, p10 >= 1.5 (${res.e.length} samples)`, res.e.length >= 10 && pct(res.e, .5) >= 3 && pct(res.e, .1) >= 1.5, `median ${pct(res.e, .5).toFixed(2)} p10 ${pct(res.e, .1).toFixed(2)}`);
  }
  // 4. DOM text
  {
    const url = await U(''), { ctx, p, errs } = await page(br, url, 390, 763, true), t = await p.evaluate(DOMSCAN);
    const CREAM = ['gaBack', 'shGo', 'wpGo', 'stBack'], small = t.filter(x => x.fs < 11.95), low = t.filter(x => x.cr < crNeed(x) && !CREAM.includes(x.id));   // these four are cream buttons with dark text once their panel is open (class pg is added then): checked by eye
    ok(`DOM text >= 12 px (${t.length} texts)`, !small.length, [...new Set(small.map(x => x.id + '@' + x.fs))].join(' '));
    ok('DOM text contrast >= 4.5:1 (3:1 large)', !low.length, [...new Set(low.map(x => x.id + ' ' + x.cr))].join(' '));
    ok('DOM no page error', !errs.length, errs[0]); await ctx.close();
  }
  // 5. settings: defaults, persistence, live apply, calm mode, reduced motion
  {
    const url = await U('&sim=1'), { ctx, p, errs } = await page(br, url, 390, 763, true);
    const d = await p.evaluate(() => { const m = __mnr; return { flash: m.SET.flash, shake: m.SET.shake, glow: m.SET.glow, scan: m.SET.scan, txt: m.SET.txt, cbp: m.SET.cbp, hc: m.SET.hc, on: m.RET.comfort, h3: [...document.querySelectorAll('#setBody h3')].map(e => e.textContent), grp: [...document.querySelectorAll('#setBody [data-k]')].map(e => e.dataset.k) }; });
    ok('default: comfort on, flash Reduced, shake Low, glow Low, scan on, text normal, palette off', d.on && d.flash === 1 && d.shake === 1 && d.glow === 1 && d.scan === true && d.txt === 'normal' && d.cbp === 'off', JSON.stringify(d));
    ok('Settings has the Comfort group with all 8 rows + Calm mode', d.h3.includes('Comfort') && ['flash', 'shake', 'glow', 'scan', 'txt', 'hc', 'cbp', 'rm', 'calmm'].every(k => d.grp.includes(k)), d.h3.join(','));
    const live = await p.evaluate(() => {
      const m = __mnr, o = {}; m.startStory(2); m.simOn(true); for (let i = 0; i < 40; i++) m.step(1 / 60); const C = window.COM;
      const meanL = () => { const cv = document.getElementById('cv') || document.querySelector('canvas'), s = document.createElement('canvas'); s.width = 16; s.height = 32; const g = s.getContext('2d', { willReadFrequently: true }); m.render(m.G.t, 0); g.drawImage(cv, 0, 0, 16, 32); const x = g.getImageData(0, 0, 16, 32).data; let t = 0; for (let i = 0; i < x.length; i += 4) t += x[i] + x[i + 1] + x[i + 2]; return t / (x.length / 4); };
      m.G.shake = 0; m.G.dead = false; m.SET.shake = 2; m.SET.rm = false; m.G.flash = 1; o.fa2 = (m.setVal('flash', 2), C.fa()); o.fa1 = (m.setVal('flash', 1), C.fa()); o.fa0 = (m.setVal('flash', 0), C.fa()); m.G.flash = 0;
      m.setVal('shake', 2); o.sk2 = C.sk(40); m.setVal('shake', 1); o.sk1 = C.sk(40); m.setVal('shake', 0); o.sk0 = C.sk(40); m.setVal('shake', 2); m.setVal('rm', true); o.skrm = C.sk(40); o.pgrm = C.pg_(); m.setVal('rm', false);
      m.P.inv = 0; m.P.dashT = 0; m.P.dq = 0; m.god = false; m.G.shake = 0; m.P.hp = m.P.max; try { m.hurt(2); } catch (e) { } o.hurtShake = m.G.shake; m.P.inv = 0;
      m.setVal('glow', 2); o.g2 = C.g(); m.setVal('glow', 1); o.g1 = C.g();
      m.setVal('scan', true); const on = meanL(); m.setVal('scan', false); const off = meanL(); o.scanOn = on; o.scanOff = off; m.setVal('scan', true);
      m.setVal('txt', 'large'); o.minH = C.minH(); o.minC = C.minC(); o.minD = C.minD(); o.domSpan = parseFloat(getComputedStyle(document.querySelector('#setm .seg>span')).fontSize); m.setVal('txt', 'normal'); o.domSpan0 = parseFloat(getComputedStyle(document.querySelector('#setm .seg>span')).fontSize); o.minH0 = C.minH();
      const cvx = document.createElement('canvas').getContext('2d'); const fill = () => { cvx.fillStyle = '#3dffb0'; return cvx.fillStyle; }; o.cb0 = fill(); m.setVal('cbp', 'deut'); o.cbd = fill(); cvx.fillStyle = '#ff3040'; o.cbr = cvx.fillStyle; m.setVal('cbp', 'prot'); o.cbp = fill(); m.setVal('cbp', 'off'); o.cb1 = fill();
      m.setVal('hc', true); o.hc = m.SET.hc && document.documentElement.classList.contains('hc'); m.setVal('hc', false);
      m.setVal('flash', 2); m.setVal('shake', 2); m.setVal('glow', 2); m.setVal('scan', true); m.setVal('rm', false);
      m.setVal('calmm', true); o.calm = { f: m.SET.flash, s: m.SET.shake, g: m.SET.glow, sc: m.SET.scan, rm: m.SET.rm }; m.setVal('calmm', false); o.calmBack = { f: m.SET.flash, s: m.SET.shake, g: m.SET.glow, sc: m.SET.scan, rm: m.SET.rm };
      m.setVal('flash', 0); m.setVal('shake', 0); m.setVal('glow', 2); m.setVal('scan', false); m.setVal('txt', 'large'); m.setVal('cbp', 'prot'); m.setVal('hc', true); m.setVal('rm', true);
      o.saved = JSON.parse(localStorage.getItem('mnr_set')); return o; });
    ok('flash intensity applies live: Full alpha <= .10, Reduced <= .05, Off 0', live.fa2 <= .1001 && live.fa1 <= .0501 && live.fa0 === 0 && live.fa2 > live.fa1, `${live.fa2} ${live.fa1} ${live.fa0}`);
    ok('shake caps: Full 8, Low 4, Off 0, reduced motion 0 (also no pulse)', live.sk2 === 8 && live.sk1 === 4 && live.sk0 === 0 && live.skrm === 0 && live.pgrm === 0, `${live.sk2} ${live.sk1} ${live.sk0} ${live.skrm} ${live.pgrm}`);
    ok('a real hit shakes by <= 8 (the cap is wired into shake())', live.hurtShake <= 8, live.hurtShake);
    ok('glow Full 1.0 / Low 0.6 live', live.g2 === 1 && live.g1 === .6, `${live.g2} ${live.g1}`);
    ok('scan lines Off lifts the picture live', live.scanOff > live.scanOn, `${live.scanOn.toFixed(2)} -> ${live.scanOff.toFixed(2)}`);
    ok('text size Large: canvas floor 14 / HUD 16 / DOM 14 and back (settings text 12 -> 14 -> 12)', live.minH === 16 && live.minC === 14 && live.minD === 14 && live.domSpan >= 13.95 && live.domSpan0 >= 11.95 && live.minH0 === 14, `${live.minH} ${live.minC} ${live.minD} ${live.domSpan} ${live.domSpan0}`);
    ok('colour-blind palette remaps the greens and reds live and back', live.cb0 === '#3dffb0' && live.cbd !== live.cb0 && live.cbp !== live.cb0 && live.cb1 === live.cb0 && live.cbr !== '#ff3040', `${live.cb0} ${live.cbd} ${live.cbp} ${live.cbr}`);
    ok('high-contrast bullets switch', live.hc);
    ok('Calm mode: flash Off, shake Off, glow Low, scan Off, reduced motion On, and Off restores', live.calm.f === 0 && live.calm.s === 0 && live.calm.g === 1 && live.calm.sc === false && live.calm.rm === true && live.calmBack.f === 2 && live.calmBack.s === 2 && live.calmBack.g === 2 && live.calmBack.sc === true && live.calmBack.rm === false, JSON.stringify(live.calm) + JSON.stringify(live.calmBack));
    ok('settings are saved in mnr_set', live.saved && live.saved.flash === 0 && live.saved.shake === 0 && live.saved.glow === 2 && live.saved.scan === false && live.saved.txt === 'large' && live.saved.cbp === 'prot' && live.saved.hc === true && live.saved.rm === true, JSON.stringify(live.saved && [live.saved.flash, live.saved.shake, live.saved.glow, live.saved.scan, live.saved.txt, live.saved.cbp]));
    const st = await p.evaluate(() => localStorage.getItem('mnr_set')); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && __mnr.ART, null, { timeout: 30000 }); await sleep(800);
    const re = await p.evaluate(() => { const m = __mnr; return { flash: m.SET.flash, shake: m.SET.shake, glow: m.SET.glow, scan: m.SET.scan, txt: m.SET.txt, cbp: m.SET.cbp, hc: m.SET.hc, rm: m.SET.rm, minD: COM.minD(), cls: document.documentElement.classList.contains('cmf-tl') }; });
    ok('settings persist over a reload and apply on start', re.flash === 0 && re.shake === 0 && re.glow === 2 && re.scan === false && re.txt === 'large' && re.cbp === 'prot' && re.hc && re.rm && re.minD === 14 && re.cls, JSON.stringify(re));
    ok('settings no page error', !errs.length, errs[0]); await ctx.close();
  }
  // reduced motion from the OS, and the old look with ?comfort=0
  {
    const url = await U('&sim=1'), ctx = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(url, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && __mnr.ART, null, { timeout: 30000 }); await sleep(600);
    const r = await p.evaluate(() => ({ rm: __mnr.SET.rm, fl: __mnr.SET.flash, sk: COM.sk(30), pg: COM.pg_() }));
    ok('prefers-reduced-motion: reduced motion on, shake 0, no pulse, flash Reduced or Off', r.rm === true && r.sk === 0 && r.pg === 0 && r.fl <= 1, JSON.stringify(r)); ok('reduced motion no page error', !errs.length, errs[0]); await ctx.close();
  }
  {
    const url = await U('&sim=1&comfort=0'), { ctx, p, errs } = await page(br, url, 390, 763, true);
    const o = await p.evaluate(() => { const m = __mnr, C = window.COM; m.startStory(2); m.simOn(true); for (let i = 0; i < 30; i++) m.step(1 / 60); m.G.flash = .4; m.G.glitch = .8; const cs = parseFloat(getComputedStyle(document.querySelector('#setm .seg>span')).fontSize);
      return { on: m.RET.comfort, flash: m.SET.flash, shake: m.SET.shake, fa: C.fa(), ga: C.ga(), sk: C.sk(20), g: C.g(), scan: C.scanP(), minD: C.minD(), cs, cls: document.documentElement.classList.contains('cmf'), h3: [...document.querySelectorAll('#setBody h3')].map(e => e.textContent), bk: BK(1.9, 20) }; });
    ok('?comfort=0: flag off, old defaults (flash Full, shake Full), no Comfort group, no caps', o.on === false && o.flash === 2 && o.shake === 2 && Math.abs(o.fa - .2) < 1e-9 && Math.abs(o.ga - .2) < 1e-9 && o.sk === 20 && o.g === 1 && o.scan === null && o.minD === 0 && o.cs === 11 && !o.cls && !o.h3.includes('Comfort') && o.bk === Math.floor(1.9 * 20) % 2, JSON.stringify(o));
    ok('?comfort=0 no page error', !errs.length, errs[0]); await ctx.close();
  }
  if (process.env.OLD) {   // optional (OLD=<build before comfort.js>): the mean picture of the old build vs this build with ?comfort=0; printed, not gated (the game is not frame-deterministic)
    const FR = () => { const m = __mnr; m.SET.diff = 'normal'; m.applySet(); m.startStory(2); m.simOn(true); m.god = true; for (let i = 0; i < 300; i++) { if (i % 20 === 0) m.press('Fire'); if (i % 3 === 0) m.touchTo(300 + 200 * Math.sin(i / 50), 270 + 200 * Math.sin(i / 37)); m.step(1 / 60); }
      const cv = document.getElementById('cv') || document.querySelector('canvas'), s = document.createElement('canvas'); s.width = 16; s.height = 32; const g = s.getContext('2d', { willReadFrequently: true }); let t = 0;
      for (let k = 0; k < 20; k++) { m.step(1 / 60); m.render(m.G.t, 1 / 60); g.drawImage(cv, 0, 0, 16, 32); const x = g.getImageData(0, 0, 16, 32).data; for (let i = 0; i < x.length; i += 4) t += x[i] + x[i + 1] + x[i + 2]; } return t / 20 / 512; };
    const res = [];   // (one server holds one file per slug: serve and run the old build first, then this one)
    for (const f of [path.resolve(process.env.OLD), path.resolve(process.env.OLD), null]) { const u = f ? await gx.url('mainhattan-nightrun', { file: f, query: '?nomusic=1&sim=1' }) : await U('&sim=1&comfort=0'); const { ctx, p } = await page(br, u, 390, 763, true); res.push(await p.evaluate(FR)); await ctx.close(); }
    const noise = Math.abs(res[0] - res[1]) / res[0], d = Math.abs(res[2] - res[0]) / res[0];
    console.log(`INFO ?comfort=0 vs the build before comfort.js, mean brightness (the game is not frame-deterministic, so no gate): old ${res[0].toFixed(2)} / ${res[1].toFixed(2)}, comfort=0 ${res[2].toFixed(2)}, diff ${(d * 100).toFixed(1)}% (old run-to-run ${(noise * 100).toFixed(1)}%)`);
  } else console.log('SKIP ?comfort=0 picture check against the old build (set OLD=<html of the build before comfort.js>)');
  await br.close(); console.log(bad ? 'COMFORT FAIL (' + bad + ')' : 'COMFORT PASS'); process.exit(bad ? 1 : 0);
})();
