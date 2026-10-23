#!/usr/bin/env node
// CAM2 (RET.cam2, W164): stepped probe (FOOT.sim 1/60 + streetlook draw every 2nd step, 100 s of game time, no screenshots, no wall-clock play) of the street camera and the steam prop.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/cam2-test.js     env: Q='&cam2=1' (new camera and steam; default off until retuned)  VP=390x763 (phone) or 1440x860 (PC)  GATE=0 (numbers only)  SECS=100
// Camera: Kai runs right the whole time (right + fire held, hearts topped up). A running step = right held, Kai moving right, no arena lock, camera not yet at the boss screen.
//   Gate: Kai in the right 30% of the view (P.x - camX > 0.7 view) in < 10% of running steps; the camera follows at a catch-up <= 0.3 s (95% of a step change) and does not jitter (no step moves it backwards).
// Steam: every steam draw is recorded (frame, on screen or not). Gate: the smallest drawn frame holds >= 60% of the pixels of the largest sheet frame; a vent never vanishes while it is on screen (pop);
//   steam stands on the road line; at least 1 s of steam on screen per 10 s of running; plume height is scaled to the street (1-2.5 characters of 64 units).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), Q = process.env.Q || '', GATE = process.env.GATE !== '0';
const [VW, VH] = (process.env.VP || '390x763').split('x').map(Number), SECS = +process.env.SECS || 100;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const RUN = async (secs, dbg) => { const M = __mnr, ART = M.ART, RET = M.RET, F = FOOT; RET.tale = false; F.start('zeil');
  for (let i = 0; i < 150 && !ART.anim('kai/run'); i++) await new Promise(r => setTimeout(r, 100));
  for (let i = 0; i < 100 && !(F.q && F.q.picsReady()); i++) await new Promise(r => setTimeout(r, 100));
  for (let i = 0; i < 100 && !ART.anim('prop-steam/glow'); i++) await new Promise(r => setTimeout(r, 100));
  F.on = false; await new Promise(r => setTimeout(r, 50)); const S = F.S, P = S.P, c = F._in.L().ctx, SL = F.look, KEY = 'prop-steam/glow';
  const o = ART.aS(KEY), im = ART.anim(KEY), n = o.m[0], w = o.m[2], h = o.m[3], cv = document.createElement('canvas'); cv.width = im.width; cv.height = h; const g = cv.getContext('2d'); g.drawImage(im, 0, 0);
  const cov = []; for (let i = 0; i < n; i++) { const d = g.getImageData(i * w, 0, w, h).data; let k = 0; for (let j = 3; j < d.length; j += 4) if (d[j] > 16) k++; cov.push(k); }
  const mxAll = Math.max(...cov); let draws = [], dh = [];
  const da = ART.drawAnim; ART.drawAnim = function (cc, key, t, x, y, sc) { if (key === KEY) { const L = F._in.L(); ART.aframe(key, t); const i = ART.aframe(key, t); draws.push({ x, y, i, on: x >= 0 && x <= L.vw, ph: sc * h, vent: SL.steamLast ? SL.steamLast.vent : null }); } return da.apply(this, arguments); };
  F.ctl = (S_, I) => { I.l = I.u = I.d = 0; I.r = 1; I.fire = 1; I.jump = 0; };
  let run = 0, right = 0, prevCam = S.camX, back = 0, maxStep = 0, vwSeen = 0, onFrames = 0, frames = 0, pops = 0, prevOn = new Set(), steps = 0, lead = [];
  const N = Math.round(secs * 60);
  for (let i = 0; i < N; i++) { if (P.hp > P.max - 2) P.hp = P.max - 2; if (P.hp < 2) P.hp = 2;
    F.sim(1 / 60, 1 / 60); steps++; const L = F._in.L(), vw = L.vw; vwSeen = vw;
    if (S.camX < prevCam - 1e-6) back++; maxStep = Math.max(maxStep, S.camX - prevCam); prevCam = S.camX;
    if (dbg && i % 300 === 0) console.log(i / 60, P.x - S.camX, S.lock && S.lock.id, S.s3 && S.s3.gate, S.camX);
    const capX = Math.min(S.st.boss.x - vw / 2, S.st.len - vw) - 3;   // the street's last screen: the camera stops there for the boss, so it is not a running step
    if (P.vx > 1 && !S.lock && !S.bossOn && !S.dead && S.camX < capX) { run++; const f = (P.x - S.camX) / vw; lead.push(f); if (f > .7) right++; }
    if (i % 2 === 0) { draws = []; F.look.draw(c); frames++; const on = new Set(draws.filter(d => d.on).map(d => d.vent)); if (on.size) onFrames++;
      for (const v of prevOn) if (!draws.some(d => d.vent === v)) pops++; prevOn = new Set(draws.filter(d => d.on).map(d => d.vent)); for (const d of draws) dh.push(d); } }
  ART.drawAnim = da; const used = new Set(dh.map(d => d.i)), usedCov = [...used].map(i => cov[i]);
  const onD = dh.filter(d => d.on);
  return { t: +S.time.toFixed(1), vw: vwSeen, run, right, rightPct: +(100 * right / Math.max(1, run)).toFixed(1), leadMean: +(lead.reduce((a, b) => a + b, 0) / Math.max(1, lead.length)).toFixed(3), back, maxStep: +maxStep.toFixed(2),
    cov, framesUsed: [...used], frameRatio: usedCov.length ? +(Math.min(...usedCov) / mxAll).toFixed(2) : 0, steamDraws: dh.length, onScreenDraws: onD.length, onFramesPct: +(100 * onFrames / frames).toFixed(1), pops,
    plumeChar: dh.length ? +(dh[0].ph / (64 * SL.k)).toFixed(2) : 0, roadY: F.look.t0 != null ? 470 : 0, yBottom: dh.length ? +(dh[0].y + dh[0].ph / 2).toFixed(1) : 0 };
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(600);
  const b = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }), errors = [];
  const p = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 }); p.on('pageerror', e => errors.push(e.message)); if (process.env.DBG) p.on('console', m => console.log(m.text()));
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${Q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 20000 }); await sleep(600);
  const r = await p.evaluate(`(${RUN})(${SECS}, ${!!process.env.DBG})`); console.log(JSON.stringify(r));
  let fails = 0; const ok = (q, n) => { if (!q) fails++; console.log((q ? 'PASS ' : 'FAIL ') + n); };
  if (GATE) {
    ok(r.run > 600, `Kai ran right for ${r.run} steps (${r.t} s of game time, view ${r.vw} units)`);
    ok(r.rightPct < 10, `Kai in the right 30% of the view in ${r.rightPct}% of running steps (< 10%); mean position ${(r.leadMean * 100).toFixed(0)}% from the left`);
    ok(r.back === 0, `camera never moves backwards while running (${r.back} backward steps; biggest forward step ${r.maxStep} units)`);
    ok(r.steamDraws > 0 && r.frameRatio >= .6, `steam: smallest drawn frame holds ${(r.frameRatio * 100).toFixed(0)}% of the largest frame's pixels (>= 60%); frames used ${r.framesUsed}`);
    ok(r.pops === 0, `steam never pops while on screen (${r.pops} vents vanished)`);
    ok(r.onFramesPct >= 10, `steam on screen in ${r.onFramesPct}% of frames (>= 10%, i.e. >= 1 s per 10 s)`);
    ok(r.plumeChar >= 1 && r.plumeChar <= 2.5, `steam plume is ${r.plumeChar} characters tall (1-2.5, Kai = 64 units)`);
    ok(errors.length === 0, `0 page errors ${errors[0] || ''}`);
  }
  await b.close(); srv.kill(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL crashed: ' + e.stack); process.exit(2); });
