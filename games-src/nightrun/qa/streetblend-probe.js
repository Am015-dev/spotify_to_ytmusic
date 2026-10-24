#!/usr/bin/env node
// STREETBLEND probe (W194, RET.blend): do the street actors sit IN the street? Kai + 3 foes, stepped (FOOT.sim), each frame drawn 3 times with a seeded Math.random:
//   actors with ?blend off (A0), actors with blend on (A1), no actors (B). Actor pixels = A0 differs from B by > 15 (sum RGB). Per actor: mean colour of those pixels in A0 and A1
//   vs the mean of B in the box around it (1.4 x wider, 1.3 x taller). 3 scenes, 45 frames apart.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/streetblend-probe.js   env: VP=1440x860  Q='&blend=1'  SHOT=<png>  PERF=1 (ms per sim+draw step, 600 steps)  GATE=0
//   Before measuring, 600 steps are played and drawn (10 s of game time): the blend reads the finished frame and settles over time, as it does in play.
// Gate (with Q containing blend=1): mean distance after <= half of before; 0 page errors.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), Q = process.env.Q || '';
const [VW, VH] = (process.env.VP || '1440x860').split('x').map(Number);
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const RUN = async (PERF, process_THR) => { { let sd = 7; Math.random = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }; } const M = __mnr, ART = M.ART, RET = M.RET, F = FOOT; RET.tale = false; F.start('zeil');
  for (let i = 0; i < 150 && !ART.anim('kai/run'); i++) await new Promise(r => setTimeout(r, 100));
  for (let i = 0; i < 100 && !(F.q && F.q.picsReady()); i++) await new Promise(r => setTimeout(r, 100));
  F.on = false; await new Promise(r => setTimeout(r, 50)); const S = F.S, P = S.P, L = F._in.L(), c = L.ctx, IN = F._in;
  const vis = () => S.E.filter(e => !e.dead && e.hp > 0 && Math.abs(e.x - P.x) < 420 && Math.abs(e.x - P.x) > 60);
  const out0 = {}; let i = 0; F.ctl = (S_, I) => { I.l = I.u = I.d = 0; I.r = vis().length >= 3 ? 0 : 1; I.fire = 0; I.jump = 0; };
  for (; i < 60 * 90; i++) { P.hp = P.max; P.inv = 1; F.sim(1 / 60, 1 / 60); if (i > 300 && vis().length >= 3) break; }
  F.ctl = (S_, I) => { I.l = I.u = I.d = I.r = 0; I.fire = 0; I.jump = 0; };
  const al = S.E.filter(e => !e.dead && e.hp > 0 && !e.boss).slice(0, 4); al.forEach((e, k) => { e.x = P.x + [170, 300, -190, 420][k]; if (e.z != null) e.z = [.2, .7, .5, .9][k]; });
  for (let k = 0; k < 40; k++) { P.hp = P.max; P.inv = 1; F.sim(1 / 60, 1 / 60); al.forEach((e, j) => { e.x = P.x + [170, 300, -190, 420][j]; }); }
  out0.ids = al.map(e => e.id);
  for (let k = 0; k < 40; k++) { F.look.draw(c); await new Promise(r => setTimeout(r, 100)); }
  P.inv = 0; P.shotT = 0;
  let perf = null;
  { const t0 = performance.now(); for (let k = 0; k < 600; k++) { P.hp = P.max; F.sim(1 / 60, 1 / 60); F.look.draw(c); } perf = (performance.now() - t0) / 600; }
  // deterministic redraws
  const rnd = Math.random; let seed = 1; const srand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const W = c.canvas.width, H = c.canvas.height;
  const frame = () => { seed = 1; Math.random = srand; try { F.look.draw(c); } finally { Math.random = rnd; } return c.getImageData(0, 0, W, H).data; };
  const od = IN.drawWho, boxes = [];
  let rec = false; IN.drawWho = function (cc, who, pose, x, y, h) { if (rec && cc === c) { const m = c.getTransform(); const pts = [[x - .7 * h, y - 1.25 * h], [x + .7 * h, y + .05 * h]].map(([X, Y]) => [m.a * X + m.c * Y + m.e, m.b * X + m.d * Y + m.f]); boxes.push({ who, x0: Math.max(0, Math.floor(Math.min(pts[0][0], pts[1][0]))), x1: Math.min(W, Math.ceil(Math.max(pts[0][0], pts[1][0]))), y0: Math.max(0, Math.floor(Math.min(pts[0][1], pts[1][1]))), y1: Math.min(H, Math.ceil(Math.max(pts[0][1], pts[1][1]))) }); } return od.apply(this, arguments); };
  const out = out0, per = [];
  for (let sc = 0; sc < 3; sc++) { if (sc) { for (let k = 0; k < 45; k++) { P.hp = P.max; P.inv = 1; F.sim(1 / 60, 1 / 60); } P.inv = 0; boxes.length = 0; }
  const blend0 = RET.blend;
  RET.blend = false; rec = true; const A0 = frame(); rec = false;
  RET.blend = blend0; const A1 = frame();
  const hide = IN.drawWho; IN.drawWho = () => {}; const B = frame(); IN.drawWho = od;
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  const seen = new Set();
  for (const b of boxes) { const key = b.x0 + "," + b.y0; if (seen.has(key)) continue; seen.add(key); if (b.x1 - b.x0 < 4 || b.y1 - b.y0 < 4) continue; const mA0 = [0, 0, 0], mA1 = [0, 0, 0], mB = [0, 0, 0]; let n = 0, nb = 0; const ex = (b.x1 - b.x0) * .4, ey = (b.y1 - b.y0) * .15;
    for (let y = Math.max(0, b.y0 - ey | 0); y < Math.min(H, b.y1 + ey); y++) for (let x = Math.max(0, b.x0 - ex | 0); x < Math.min(W, b.x1 + ex); x++) { const k = (y * W + x) * 4, inB = x >= b.x0 && x < b.x1 && y >= b.y0 && y < b.y1;
      const m = inB && (Math.abs(A0[k] - B[k]) + Math.abs(A0[k + 1] - B[k + 1]) + Math.abs(A0[k + 2] - B[k + 2]) > (+process_THR || 15));
      if (m) { n++; for (let j = 0; j < 3; j++) { mA0[j] += A0[k + j]; mA1[j] += A1[k + j]; } } else if (!inB || true) { nb++; for (let j = 0; j < 3; j++) mB[j] += B[k + j]; } }
    if (n < 200) continue; for (let j = 0; j < 3; j++) { mA0[j] /= n; mA1[j] /= n; mB[j] /= nb; }
    per.push({ who: b.who, n, act0: mA0.map(Math.round), act1: mA1.map(Math.round), bg: mB.map(Math.round), d0: +dist(mA0, mB).toFixed(1), d1: +dist(mA1, mB).toFixed(1) }); }
  }
  out.per = per; out.d0 = +(per.reduce((a, p) => a + p.d0, 0) / per.length).toFixed(1); out.d1 = +(per.reduce((a, p) => a + p.d1, 0) / per.length).toFixed(1); out.perf = perf; out.reads = F.blend && F.blend.reads; out.floor = F.blend && F.blend.pal && F.blend.pal.floor.map(Math.round); out.foes = vis().length; out.t = S.time.toFixed(1);
  F.look.draw(c); return out;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(600);
  const b = await PW.chromium.launch(), errors = [];
  const p = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: VW < 800 ? 2 : 1 }); p.on('pageerror', e => errors.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${Q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 20000 }); await sleep(600);
  const r = await p.evaluate(`(${RUN})(${process.env.PERF ? 1 : 0}, ${process.env.THR || 15})`); console.log(JSON.stringify(r));
  if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT });
  let fails = 0; const ok = (q, n) => { if (!q) fails++; console.log((q ? 'PASS ' : 'FAIL ') + n); };
  if (process.env.GATE !== '0' && /blend=1/.test(Q)) ok(r.d1 <= r.d0 / 2, `mean colour distance actors vs street ${r.d0} -> ${r.d1} (target <= ${(r.d0 / 2).toFixed(1)})`);
  ok(errors.length === 0, `0 page errors ${errors[0] || ''}`); process.exitCode = fails ? 1 : 0;
  await b.close(); srv.kill();
})().catch(e => { console.log('FAIL ' + e.stack); process.exit(2); });
