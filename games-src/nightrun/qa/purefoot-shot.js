#!/usr/bin/env node
// PUREFOOT one-shot (W217): one busy street moment, stepped with FOOT.sim (x200+), drawn once, screenshotted. Same seed + same steps for ?purefoot=0 and on.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/purefoot-shot.js   env: VP=390x763|1440x860  Q='&purefoot=0'  SHOT=<png>
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), Q = process.env.Q || '';
const [VW, VH] = (process.env.VP || '1440x860').split('x').map(Number), PHONE = VW < 800;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const RUN = async () => { { let sd = 7; Math.random = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }; } const M = __mnr, ART = M.ART, RET = M.RET, F = FOOT; RET.tale = false; F.start('zeil');
  for (let i = 0; i < 150 && !ART.anim('kai/run'); i++) await new Promise(r => setTimeout(r, 100));
  for (let i = 0; i < 100 && !(F.q && F.q.picsReady()); i++) await new Promise(r => setTimeout(r, 100));
  F.on = false; await new Promise(r => setTimeout(r, 50)); { let sd = 7; Math.random = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }; } F.start('zeil'); F.on = false; await new Promise(r => setTimeout(r, 50));   // pictures loaded: restart from the seed, nothing runs in real time
  const S = F.S, P = S.P, c = F._in.L().ctx;
  const vis = () => S.E.filter(e => !e.dead && e.hp > 0 && Math.abs(e.x - P.x) < 420);
  let i = 0, t0 = performance.now(); F.ctl = (S_, I) => { I.l = I.u = I.d = 0; const v = vis(), vw = F._in.L().vw; I.r = v.length ? 0 : 1; I.l = v.some(e => e.x < P.x) && P.x - S.camX > vw * .45 ? 1 : 0; I.fire = 1; /* a player: stops to fight, steps back towards foes behind */ I.jump = 0; };
  for (; i < 60 * 120; i++) { P.hp = P.max; P.inv = 1; F.sim(1 / 60, 1 / 60); if (i > 600 && vis().length >= 3) break; }
  for (let k = 0; k < 50; k++) { P.hp = P.max; F.sim(1 / 60, 1 / 60); }
  const steps = i + 50, ms = performance.now() - t0;
  { const sv = S.sim; S.sim = false; try { F.post && F.post(S, 0); } finally { S.sim = sv; } }   // the phone buttons settle as in a live frame (the sim skips that)
  for (let k = 0; k < 10; k++) { F.look.draw(c); await new Promise(r => setTimeout(r, 120)); }   // pictures decoded; the sim does not move here
  P.inv = 0; F.look.draw(c);   // not on a blink frame
  return { steps, x: Math.round(steps / 60 / (ms / 1000)), foes: vis().map(e => e.id + (e.wind > 0 ? ':wind' : e.tele > 0 ? ':tele' : '')), eb: S.eb.length, pb: S.pb.length, fx: S.fx.length, pop: S.pop.length, pure: !!RET.purefoot, kai: +((P.x - S.camX) / F._in.L().vw).toFixed(2), face: P.facing };
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(600);
  const b = await PW.chromium.launch(), errors = [];
  const p = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: PHONE ? 3 : 1, hasTouch: PHONE, isMobile: PHONE }); p.on('pageerror', e => errors.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${Q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 20000 }); await sleep(600);
  const r = await p.evaluate(`(${RUN})()`); console.log(JSON.stringify(r));
  if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT });
  console.log((errors.length ? 'FAIL' : 'PASS') + ' 0 page errors ' + (errors[0] || ''));
  await b.close(); srv.kill();
})().catch(e => { console.log('FAIL ' + e.stack); process.exit(2); });
