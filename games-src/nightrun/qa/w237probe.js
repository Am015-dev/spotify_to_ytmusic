#!/usr/bin/env node
// W237 = W234 + edge contrast (outline/rim band vs the backdrop ring), sheet saturation kept (ART.olS), rim-aware shot contrast (max of core vs bg, rim vs bg). W234 = W228 + bullets: foe-shot / player-shot contrast vs the shot-free frame, shot hue (deg), fighters with feet off screen not measured. W228 gates (street, ?footmove=1): a bot plays zeil in stepped FOOT.sim (x200+); at 8 seeded random moments (20-75 s) it draws one frame three ways (full / no actors / actors without shadows) and measures
//   depth spread = max - min belt depth z of the on-screen fighters (Kai + ground foes), 1 = the whole belt; shadow darkness = 1 - L(full)/L(no actors) in the box under each fighter's drawn feet
//   (relative luminance, sprite pixels excluded); actor contrast = WCAG ratio of the mean luminance of each fighter's pixels vs a 6 px ring around them. SHOT=<png> also saves the t = 45 s frame. W232: a fighter already killed (knocked into the air, fading) is not measured.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/w228probe.js   env: VP=390x763|1440x860  Q='&footmove=1'  SEED=11  GAME_DIR=<built game>
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), Q = process.env.Q || '&footmove=1', SEED = +process.env.SEED || 11;
const [VW, VH] = (process.env.VP || '1440x860').split('x').map(Number), PHONE = VW < 800;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const RUN = async (SEED) => { const process_t = window.__ts == null ? -1 : window.__ts; const rnd = sd => () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  Math.random = rnd(SEED); const M = __mnr, ART = M.ART, RET = M.RET, F = FOOT, IN = F._in; RET.tale = false; ART.olS = []; F.start('zeil');
  for (let i = 0; i < 150 && !ART.anim('kai/run'); i++) await new Promise(r => setTimeout(r, 100));
  for (let i = 0; i < 100 && !(F.q && F.q.picsReady()); i++) await new Promise(r => setTimeout(r, 100));
  F.on = false; await new Promise(r => setTimeout(r, 50)); Math.random = rnd(SEED); F.start('zeil'); F.on = false; await new Promise(r => setTimeout(r, 50));
  const S = F.S, P = S.P, L = F._in.L(), c = L.ctx, cv = L.cv, W = cv.width, H = cv.height;
  for (const w in ART.FM) for (const a of ART.FM[w]._all) ART.anim(w + '/' + a);
  for (let i = 0; i < 100 && F.q.pending().length; i++) await new Promise(r => setTimeout(r, 100));
  const vis = () => S.E.filter(e => !e.dead && e.hp > 0 && Math.abs(e.x - P.x) < 420);
  // the bot: runs right, stops to fight, steps back to foes behind, and walks the belt depth (dodges toward the free side when a foe winds up or a shot is in the air)
  let dz = 0, dzT = 0; F.ctl = (S_, I) => { I.l = I.u = I.d = 0; const v = vis(), vw = L.vw; I.r = v.length ? 0 : 1; I.l = v.some(e => e.x < P.x) && P.x - S.camX > vw * .45 ? 1 : 0; I.fire = 1; I.jump = 0;
    const thr = S.eb.length || v.some(e => e.wind > 0 || e.tele > 0); if (S.time > dzT) { dz = thr ? (P.z > .5 ? -1 : 1) : (Math.random() < .5 ? 0 : P.z > .5 ? -1 : 1); dzT = S.time + .4 + Math.random() * .8; }
    if (dz < 0) I.u = 1; else if (dz > 0) I.d = 1; };
  const R = rnd(SEED * 31 + 5), T = []; for (let k = 0; k < 8; k++) T.push(20 + R() * 55); T.push(45); T.sort((a, b) => a - b);
  const rec = []; const odw = IN.drawWho, osh = window.FA && FA.shadow, oda = ART.drawAnim; let mode = 'full';
  IN.drawWho = function (cc, who, pose, x, y, h) { const e = ART.fE; if (mode === 'none') return; const m = cc.getTransform(), p = m.transformPoint({ x, y }); if (e && !e.fly && !e.dead && !(e.hp <= 0)) rec.push({ e, x: p.x, y: p.y, h: h * Math.hypot(m.b, m.d) * (e._qh && e._qh !== h ? e._qh / h : 1) }); return odw.apply(this, arguments); };
  const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }, LUT = new Float32Array(256).map((_, i) => lin(i));
  const lum = (d, i) => .2126 * LUT[d[i]] + .7152 * LUT[d[i + 1]] + .0722 * LUT[d[i + 2]];
  const shots = [], orot = c.rotate.bind(c); c.rotate = function (a) { const st = new Error().stack; if (/eShot|pShot/.test(st)) { const m = c.getTransform(), p = m.transformPoint({ x: 0, y: 0 }); shots.push({ k: /eShot/.test(st) ? 'e' : 'p', x: p.x, y: p.y, s: Math.hypot(m.a, m.b) }); } return orot(a); };
  const draw = md => { mode = md; rec.length = 0; shots.length = 0; const sE = S.eb, sP = S.pb; if (md === 'noshot') { S.eb = []; S.pb = []; } if (md === 'nosh') { FA.shadow = () => {}; ART.drawAnim = function (cc) { if (cc.filter && cc.filter.indexOf('brightness(0)') >= 0) return; return oda.apply(this, arguments); }; }
    try { F.look.draw(c); } finally { FA.shadow = osh; ART.drawAnim = oda; mode = 'full'; S.eb = sE; S.pb = sP; } return { d: c.getImageData(0, 0, W, H).data, r: rec.slice(), s: shots.slice() }; };
  const out = []; let i = 0, shot = null, ms = 0;
  for (const t of T) { let n = 0;
    const w0 = performance.now(); const onS = () => S.E.filter(e => !e.dead && e.hp > 0 && !e.fly && e.x > S.camX && e.x < S.camX + L.vw).length;   // a moment = the first step at or after t with a ground foe on screen (up to 20 s later)
    for (; S.time < t || (n < 1200 && onS() < 1); i++) { if (S.time >= t) n++; P.hp = P.max; P.inv = 1; F.sim(1 / 60, 1 / 60); if (S.done || S.over) break; }
    ms += performance.now() - w0; P.inv = 0; const st = {}; for (const e of S.E.concat([P])) st[e.id + ':' + e.x] = [e._at, e._ac, e._rc, e._mt, e._an, e._fc, e._tt, e._fa, e._f0];
    if (!S.eb.length) S.eb.push({ x: P.x + ((L.dpr || 1) > 1 ? 90 : 300) + R() * ((L.dpr || 1) > 1 ? 60 : 150), y: P.y - 40 - R() * 30, vx: -300, vy: 0, r: 6, dmg: 1, life: 4, src: 'syn', c: R() < .7 ? '#ff4a6a' : '#e8ff40', z: R() });
    if (!S.pb.length) S.pb.push({ x: P.x + ((L.dpr || 1) > 1 ? 80 : 260) + R() * ((L.dpr || 1) > 1 ? 50 : 100), y: P.y - 20, vx: 900, vy: 0, r: 4, dmg: 1, life: 1, kind: 'bul', wid: P.w, t: 0, z: P.z, c: '#fff', pierce: 0, hit: [] });
    const A = draw('full'), N = draw('noshot'), B = draw('none'), D = draw('nosh'); draw('full');   // the drawn-only accumulators move a little per draw; the 4th draw leaves the visible frame
    const lo = S.camX, hi = S.camX + L.vw, fi = A.r.filter(o => o.e === P || (o.e.x > lo && o.e.x < hi)), seen = new Set(), fs = [];
    for (const o of fi) { if (seen.has(o.e)) continue; seen.add(o.e); fs.push(o); }
    const zs = fs.map(o => o.e.z).filter(z => z != null), spread = zs.length >= 2 ? Math.max(...zs) - Math.min(...zs) : null;
    const msk = (x0, y0, x1, y1) => { const m = new Uint8Array((x1 - x0) * (y1 - y0)); for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const j = (y * W + x) * 4; if (Math.abs(D.d[j] - B.d[j]) + Math.abs(D.d[j + 1] - B.d[j + 1]) + Math.abs(D.d[j + 2] - B.d[j + 2]) > 24) m[(y - y0) * (x1 - x0) + x - x0] = 1; } return m; };
    const row = [];
    for (const o of fs) { const h = o.h, cl = (v, a, b) => Math.max(a, Math.min(b, Math.round(v)));
      // shadow box under the drawn feet: x feet +- .25 h, y feet - .02 h .. feet + .05 h, sprite pixels left out
      const sx0 = cl(o.x - .25 * h, 0, W), sx1 = cl(o.x + .25 * h, 0, W), sy0 = cl(o.y - .02 * h, 0, H), sy1 = cl(o.y + .05 * h, 0, H); let la = 0, lb = 0, ns = 0;
      if (sx1 > sx0 && sy1 > sy0) { const m = msk(sx0, sy0, sx1, sy1); for (let y = sy0; y < sy1; y++) for (let x = sx0; x < sx1; x++) { if (m[(y - sy0) * (sx1 - sx0) + x - sx0]) continue; const j = (y * W + x) * 4; la += lum(A.d, j); lb += lum(B.d, j); ns++; } }
      const dark = ns && lb > 0 ? 1 - la / lb : null;
      // actor pixels vs a 6 px (CSS) ring
      const rg = Math.round(6 * (L.dpr || 1)), bx0 = cl(o.x - .6 * h - rg, 0, W), bx1 = cl(o.x + .6 * h + rg, 0, W), by0 = cl(o.y - 1.05 * h - rg, 0, H), by1 = cl(o.y + rg, 0, H), bw = bx1 - bx0;
      let ca = 0, na = 0, cr = 0, nr = 0; const eb = [];
      if (bw > 0 && by1 > by0) { const m = msk(bx0, by0, bx1, by1), bh = by1 - by0, dil = new Uint8Array(m.length);
        for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) if (m[y * bw + x]) for (let yy = Math.max(0, y - rg); yy <= Math.min(bh - 1, y + rg); yy += 2) for (let xx = Math.max(0, x - rg); xx <= Math.min(bw - 1, x + rg); xx += 2) dil[yy * bw + xx] = 1;
        for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { const j = ((y + by0) * W + x + bx0) * 4; if (m[y * bw + x]) { ca += lum(A.d, j); na++; const e3 = Math.round(5 * (L.dpr || 1)); if (x < e3 || y < e3 || x >= bw - e3 || y >= bh - e3 || !m[y * bw + x - e3] || !m[y * bw + x + e3] || !m[(y - e3) * bw + x] || !m[(y + e3) * bw + x]) eb.push(lum(A.d, j)); } else if (dil[y * bw + x]) { cr += lum(A.d, j); nr++; } } }
      const a = na ? ca / na : 0, r = nr ? cr / nr : 0, con = na > 20 && nr ? (Math.max(a, r) + .05) / (Math.min(a, r) + .05) : null;
      eb.sort((x, y) => x - y); const ewc = (v) => (Math.max(v, r) + .05) / (Math.min(v, r) + .05), mean = q => q.length ? q.reduce((x, y) => x + y, 0) / q.length : 0, ol = eb.length > 20 ? ewc(mean(eb.slice(0, eb.length >> 1))) : null, rl = eb.length > 20 ? ewc(mean(eb.slice(-Math.max(3, Math.round(eb.length * .2))))) : null, edge = ol == null ? null : Math.max(ol, rl);
      row.push({ edge: edge == null ? null : +edge.toFixed(2), ol: ol == null ? null : +ol.toFixed(2), rl: rl == null ? null : +rl.toFixed(2), st: o.e.state + (o.e._ka ? '/ka' : ''), who: o.e === P ? 'kai' : o.e.id, z: o.e.z == null ? null : +o.e.z.toFixed(2), dark: dark == null ? null : +dark.toFixed(2), con: con == null ? null : +con.toFixed(2), a: +a.toFixed(3), r: +r.toFixed(3) }); }
    const sh = A.s.map(o => { const rb = Math.round(18 * o.s), x0 = Math.max(0, Math.round(o.x - rb)), x1 = Math.min(W, Math.round(o.x + rb)), y0 = Math.max(0, Math.round(o.y - rb)), y1 = Math.min(H, Math.round(o.y + rb)); const ls = []; let a = 0, n = 0, bx0 = 1e9, bx1 = -1, by0 = 1e9, by1 = -1, hx = 0, hy = 0; const mm = [];
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const j = (y * W + x) * 4; if (Math.abs(A.d[j] - N.d[j]) + Math.abs(A.d[j + 1] - N.d[j + 1]) + Math.abs(A.d[j + 2] - N.d[j + 2]) > 24) { mm.push(j); ls.push(lum(A.d, j)); n++; bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); const r = A.d[j], g = A.d[j + 1], b = A.d[j + 2], mx = Math.max(r, g, b), mi = Math.min(r, g, b); if (mx - mi > .7 * mx && mx > 150) { const h = (mx === r ? ((g - b) / (mx - mi) + 6) % 6 : mx === g ? (b - r) / (mx - mi) + 2 : (r - g) / (mx - mi) + 4) * 60 * Math.PI / 180; hx += Math.cos(h); hy += Math.sin(h); } } }
      if (n < 6) return null; const p = Math.round(6 * (L.dpr || 1)); let rs = 0, nr = 0; for (let y = Math.max(0, by0 - p); y < Math.min(H, by1 + p); y += 1) for (let x = Math.max(0, bx0 - p); x < Math.min(W, bx1 + p); x += 1) { if (x >= bx0 - 2 && x <= bx1 + 2 && y >= by0 - 2 && y <= by1 + 2) continue; rs += lum(N.d, (y * W + x) * 4); nr++; }
      ls.sort((x, y) => y - x); const q4 = Math.max(3, ls.length >> 2), av = q => q.reduce((x, y) => x + y, 0) / q.length, mc = av(ls.slice(0, q4)), mk = av(ls.slice(-q4)), mr = nr ? rs / nr : 0, wc = v => (Math.max(v, mr) + .05) / (Math.min(v, mr) + .05), con = Math.max(wc(mc), wc(mk)); return { k: o.k, con: +con.toFixed(2), hue: Math.round(((Math.atan2(hy, hx) * 180 / Math.PI) + 360) % 360) }; }).filter(Boolean);
    const fsOn = row.length; out.push({ t: +S.time.toFixed(1), spread: spread == null ? null : +spread.toFixed(2), f: row.filter((_, k) => { const o = fs[k]; return o && o.x > .3 * o.h && o.x < W - .3 * o.h; }), sh });
    if ((process_t >= 0 ? Math.abs(S.time - process_t) < .15 : Math.abs(t - 45) < 1e-6)) { shot = out.length - 1; if (window.__snap) await window.__snap(); } }
  const steps = i; return { steps, out, shot, ms, olS: ART.olS };
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(600);
  const b = await PW.chromium.launch(), errors = [];
  const p = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: PHONE ? 3 : 1, hasTouch: PHONE, isMobile: PHONE }); p.on('pageerror', e => errors.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${Q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 20000 }); await sleep(600);
  if (process.env.TS) await p.addInitScript('window.__ts=' + process.env.TS); if (process.env.SHOT) await p.exposeFunction('__snap', () => p.screenshot({ path: process.env.SHOT }).then(() => 1));
  const t0 = Date.now(), r = await p.evaluate(`(${RUN})(${SEED})`), wall = (Date.now() - t0) / 1000;
  const med = a => { const s = a.filter(v => v != null).sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; }, mn = a => { const s = a.filter(v => v != null); return s.length ? Math.min(...s) : null; };
  const M = r.out.filter((o, k) => k !== r.shot || r.out.length <= 8).slice(0, 8);   // the 8 random moments (the t = 45 s frame is the shot)
  for (const o of r.out) console.log('t ' + o.t + ' spread ' + o.spread + ' | ' + o.f.map(f => f.who + ' z' + f.z + ' sh' + f.dark + ' c' + f.con + ' e' + f.edge + '(o' + f.ol + ' r' + f.rl + ')' + (process.env.DBG ? ' a' + f.a + ' r' + f.r + ' ' + f.st : '')).join(', '));
  const SH = M.flatMap(o => o.sh), eC = SH.filter(o => o.k === 'e').map(o => o.con), pC = SH.filter(o => o.k === 'p').map(o => o.con), pH = med(SH.filter(o => o.k === 'p').map(o => o.hue)), cd = h => Math.min(Math.abs(h - pH), 360 - Math.abs(h - pH)), eH = SH.filter(o => o.k === 'e').map(o => o.hue).join('/'), hd = pH == null || !eH ? null : Math.min(...SH.filter(o => o.k === 'e').map(o => cd(o.hue)));
  console.log('SHOTS foe n' + eC.length + ' min con ' + mn(eC) + ' hues ' + eH + ' | player n' + pC.length + ' min con ' + mn(pC) + ' hue ' + pH + ' | hue diff ' + hd);
  const sp = med(M.map(o => o.spread)), dk = mn(M.flatMap(o => o.f.map(f => f.dark))), cn = mn(M.flatMap(o => o.f.map(f => f.con))), cmed = med(M.flatMap(o => o.f.map(f => f.con)));
  const sat = (r.olS || []).filter(z => z.out != null).map(z => ({ md: z.md, k: +(z.out / z.raw).toFixed(2) })), smin = sat.length ? Math.min(...sat.map(z => z.k)) : null; console.log(`${smin >= .8 ? 'PASS' : 'FAIL'} min strip saturation ${smin} of the raw sheet (>= .80), n${sat.length}`);
  const ed = mn(M.flatMap(o => o.f.map(f => f.edge))); console.log(`${ed >= 3 ? 'PASS' : 'FAIL'} min edge contrast ${ed} (outline or rim band vs backdrop ring, >= 3)`);
  console.log(`${mn(eC) >= 3 && mn(pC) >= 3 ? 'PASS' : 'FAIL'} shot contrast foe ${mn(eC)} player ${mn(pC)} (rim-aware, >= 3)`);
  console.log(`${sp >= .4 ? 'PASS' : 'FAIL'} median depth spread ${sp} (>= .40 of the belt)`);
  console.log(`${dk >= .25 ? 'PASS' : 'FAIL'} min shadow darkness ${dk} (>= .25)`);
  console.log(`${cn >= 3 ? 'PASS' : 'FAIL'} min actor contrast ${cn} (>= 3:1), median ${cmed}`);
  console.log(`${r.steps / 60 / (r.ms / 1000) >= 200 ? 'PASS' : 'FAIL'} bot speed x${Math.round(r.steps / 60 / (r.ms / 1000))} (stepped sim, draws not counted; x${Math.round(r.steps / 60 / wall)} with the 4 measuring draws per moment and the picture wait)`);
  console.log((errors.length ? 'FAIL' : 'PASS') + ' 0 page errors ' + (errors[0] || ''));
  await b.close(); srv.kill();
})().catch(e => { console.log('FAIL ' + e.stack); process.exit(2); });
