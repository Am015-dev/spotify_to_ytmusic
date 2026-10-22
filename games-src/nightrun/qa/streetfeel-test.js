#!/usr/bin/env node
// STREETFEEL (parts/street/streetfeel.js, flag RET.feel): stepped time (FOOT.sim + streetlook draw per step), no screenshots.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/streetfeel-test.js     env: Q='&feel=0' (old numbers)  GATE=0 (numbers only)  VP=390x763
// Gates: (a) foot slip while running < 1 device px per frame  (b) bullets leave the drawn gun: muzzle error < 4 world units  (c) Kai, rusher, gunner same body height (+-3%), heavy 1.2-1.3 x
//        (d) taxi 150-170 units long (4.5 m at 35.6 units per metre)  (e) 0 page errors
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), Q = process.env.Q || '&street3=0', GATE = process.env.GATE !== '0' && !/feel=0/.test(Q);
const [VW, VH] = (process.env.VP || '390x763').split('x').map(Number);
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (p, n) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n); };
const RUN = async () => { const M = __mnr, ART = M.ART, RET = M.RET, F = FOOT, IN = F._in; RET.tale = false; F.start('zeil');
  const need = ['kai/run', 'kai/shoot', 'kai/runshoot', 'knife/run', 'gunman/idle', 'bruiser/idle', 'prop-car/loop'];
  for (let i = 0; i < 150 && !need.every(k => ART.anim(k)); i++) await new Promise(r => setTimeout(r, 100));
  F.on = false; await new Promise(r => setTimeout(r, 50)); const S = F.S, P = S.P, L = IN.L(), c = L.ctx;
  let ctl = null; F.ctl = (S_, I) => { I.l = I.r = I.u = I.d = 0; I.fire = 0; I.jump = 0; if (ctl) ctl(S_, I); };
  const rec = []; const od = ART.drawAnim; let bul = [];
  ART.drawAnim = function (cc, key, t, x, y, sc, flip) { const m = ART.ANIM.s[key]; if (m && /^(kai|knife|gunman|bruiser|prop-car)/.test(key)) { const T = cc.getTransform(); rec.push({ key, i: ART.aframe(key, t), sc, flip, T: [T.a, T.b, T.c, T.d, T.e, T.f], x, y, h: m[3] * sc, w: m[2] * sc, who: ART.fE }); } return od.apply(this, arguments); };
  const ob = window.AH && AH.ftBul; if (ob) AH.ftBul = function (cc, b) { if (b.t <= 1 / 59) { const T = cc.getTransform(); bul.push({ b, T: [T.a, T.b, T.c, T.d, T.e, T.f], bx: b.x, by: b.y, vx: b.vx, vy: b.vy, t: b.t }); } return ob.apply(this, arguments); };
  const step = n => { for (let i = 0; i < n; i++) { rec.length = 0; bul = []; F.sim(1 / 60, 1 / 60); F.look.draw(c); if (step.cb) step.cb(); } };
  const ap = (T, x, y) => [T[0] * x + T[2] * y + T[4], T[1] * x + T[3] * y + T[5]];
  const out = {};
  // 1) running: frames advanced vs ground covered
  S.E.length = 0; S.eb.length = 0; const wv = S.st.waves; S.st.waves = []; P.x = 200; S.camX = 0; ctl = (S_, I) => { I.r = 1; }; step(20);
  let adv = 0, prev = null, x0 = P.x, t0 = S.time, n = 0, dpu = 0, dust0 = F.FEEL ? F.FEEL.log.dust : 0;
  step.cb = () => { const r = rec.find(q => q.who === P && /\/run$|\/runshoot$/.test(q.key)); if (!r) return; const m = ART.ANIM.s[r.key]; dpu = Math.hypot(r.T[0], r.T[1]) ;
    if (prev && prev.key === r.key) adv += (r.i - prev.i + m[0]) % m[0]; prev = r; n = m[0]; out.runKey = r.key; out.runH = r.h; };
  step(120); step.cb = null; const dist = P.x - x0, el = S.time - t0;
  const st = F.FEEL.ST[out.runKey] || F.FEEL.ST['kai/run'], cyc = 2 * st * (out.runH / 256); const vAnim = adv / n * cyc / el, v = dist / el;
  out.v = +v.toFixed(1); out.vAnim = +vAnim.toFixed(1); out.slipPx = +(Math.abs(v - vAnim) / 60 * dpu).toFixed(2); out.dust = F.FEEL ? F.FEEL.log.dust - dust0 : 0;
  // 2) shooting with each weapon: bullet spawn vs the drawn gun muzzle (screen px -> world units)
  const errs = []; const MZ = F.FEEL.MZ;
  for (const [wid, mv] of [['pistol', 0], ['pistol', 1], ['hmg', 1], ['shot', 0], ['rocket', 0]]) { if (!F.WEAPONS[wid]) continue; P.w = wid; P.ammo = 99; P.lv = 1; P.cd = 0;
    ctl = (S_, I) => { I.fire = 1; if (mv) I.r = 1; }; let got = 0;
    step.cb = () => { if (got > 3 || !bul.length) return; const r = rec.find(q => q.who === P); if (!r) return; const kk = r.key.replace(/^kai-[a-z]+/, 'kai'), mz = MZ[kk]; if (!mz) return;
      const d = mz[Math.min(mz.length - 1, r.i)], g = ap(r.T, d[0] * r.sc * (r.flip ? -1 : 1), d[1] * r.sc), k = Math.hypot(r.T[0], r.T[1]) / r.sc * (r.h / 256) / (out.runH / 256) ;
      const q = bul[0], K = F.look.k || 1, s0 = ap(q.T, q.bx, q.by), lin = [(q.T[0] * q.vx * q.t + q.T[2] * q.vy * q.t) / K, (q.T[1] * q.vx * q.t + q.T[3] * q.vy * q.t) / K], sp = [s0[0] - lin[0], s0[1] - lin[1]];
      errs.push(+(Math.hypot(sp[0] - g[0], sp[1] - g[1]) / ((dpu || 1) / K)).toFixed(1) + ''); got++; };
    step(40); step.cb = null; }
  out.mzErr = errs.map(Number); out.mzMean = +(out.mzErr.reduce((a, b) => a + b, 0) / Math.max(1, out.mzErr.length)).toFixed(1);
  // 3) body heights and the taxi
  ctl = null; P.x = 1700; S.camX = 1500; for (const id of ['rusher', 'gunner', 'heavy']) { const e = F.env.spawn(id, P.x + (id === 'rusher' ? 120 : id === 'gunner' ? 200 : 260), null); if (e) e.grace = 9; }
  const hh = {}; step.cb = () => { for (const r of rec) { const k = r.key.split('/')[0]; if (r.who && r.who.id) hh[r.who.id] = +r.h.toFixed(1); else if (r.who === P) hh.kai = +(P.h).toFixed(1); if (k === 'prop-car') hh.taxiLen = +(r.w * 380 / 392).toFixed(1); } };
  P.x = 1950; step(10); step.cb = null; hh.heavy = hh.heavy || (window.FOOT_ENEMIES.heavy || {}).h; out.h = hh; S.st.waves = wv; return out; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(600);
  const b = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }), errors = [];
  const p = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 }); p.on('pageerror', e => errors.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${Q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 20000 }); await sleep(600);
  const r = await p.evaluate(`(${RUN})()`); console.log(JSON.stringify(r));
  if (GATE) {
    ok(r.slipPx < 1, `foot slip ${r.slipPx} device px per frame (body ${r.v} u/s, frames imply ${r.vAnim} u/s), ${r.dust} dust puffs`);
    ok(r.mzErr.length >= 4 && r.mzMean < 4, `bullets leave the drawn muzzle: mean error ${r.mzMean} units over ${r.mzErr.length} shots`);
    const H = r.h, kai = H.kai || 64; ok(['rusher', 'gunner'].every(k => H[k] && Math.abs(H[k] / kai - 1) <= .03) && H.heavy / kai >= 1.2 && H.heavy / kai <= 1.3, `body heights kai ${kai} rusher ${H.rusher} gunner ${H.gunner} heavy ${H.heavy}`);
    ok(H.taxiLen >= 150 && H.taxiLen <= 170, `taxi ${H.taxiLen} units long`);
  }
  ok(!errors.length, `0 page errors ${errors.slice(0, 2).join(' | ')}`);
  await b.close(); srv.kill(); process.exit(res.every(Boolean) ? 0 : 1);
})();
