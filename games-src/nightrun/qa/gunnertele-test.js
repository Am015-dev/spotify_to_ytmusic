#!/usr/bin/env node
// W189 E1/E3: gunner charge-shot telegraph gap = e.tele start (glow on) -> bullet spawn (S.eb grows with src gunner), stepped, 50 runs at different beat phases.
//   NODE_PATH=$(npm root -g) GAME_DIR=<dir> node games-src/nightrun/qa/gunnertele-test.js     Gate: min gap >= 0.4 s over the runs.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), RUNS = +process.env.RUNS || 50, Q = process.env.Q || '';
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const RUN = async runs => { const M = __mnr, RET = M.RET, F = FOOT; RET.tale = false; F.start('zeil');
  for (let i = 0; i < 100 && !(F.q && F.q.picsReady()); i++) await new Promise(r => setTimeout(r, 100));
  F.on = false; await new Promise(r => setTimeout(r, 50)); const S = F.S, P = S.P, gaps = [], FL = 470;
  F.ctl = (S_, I) => { for (const k in I) if (typeof I[k] === 'number') I[k] = 0; };
  for (let r = 0; r < runs; r++) { P.hp = P.max = 99; S.E.length = 0; S.eb.length = 0; S.q && (S.q.length = 0); S.time += 0.037 * (r + 1);
    const e = F.env.spawn('gunner', P.x + 260, FL); e.grace = 0; e.cov = null; e.state = 'charge'; e.cd = 0; e.sT = 0; let prev = 0, t0 = null, tt = 0, got = null;
    for (let i = 0; i < 600 && got == null; i++) { P.hp = P.max; const n0 = S.eb.length; F.sim(1 / 60, 1 / 60); tt += 1 / 60; if (e.tele > 0 && prev <= 0 && t0 == null) t0 = tt; prev = e.tele;
      if (S.eb.some(b => b.src === 'gunner' && b.t === undefined ? true : false) && S.eb.length > n0) got = tt; else if (S.eb.length > n0) got = tt; }
    if (got != null) gaps.push(t0 == null ? 0 : +(got - t0).toFixed(3)); else gaps.push(-1); }
  return gaps; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(600);
  const b = await PW.chromium.launch(), p = await b.newPage(), errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${Q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 20000 }); await sleep(600);
  const g = await p.evaluate(`(${RUN})(${RUNS})`), ok = g.filter(x => x >= 0), mn = Math.min(...ok), md = ok.slice().sort((a, b) => a - b)[ok.length >> 1];
  console.log(`gaps n=${ok.length}/${g.length} min=${mn} median=${md} max=${Math.max(...ok)}`); console.log((ok.length >= RUNS * 0.8 && mn >= 0.4 ? 'PASS' : 'FAIL') + ' gunner charge-shot telegraph gap >= 0.4 s'); console.log((errors.length ? 'FAIL ' + errors[0] : 'PASS 0 page errors'));
  await b.close(); srv.kill(); process.exit(0);
})().catch(e => { console.log('FAIL crashed: ' + e.stack); process.exit(2); });
