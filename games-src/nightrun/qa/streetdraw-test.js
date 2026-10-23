#!/usr/bin/env node
// STREETDRAW (RET.fairstreet): stepped play (FOOT.sim + streetlook draw per step, 60 s of game time, no screenshots) with the 2D context methods wrapped while FOOT draws props and pickups.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/streetdraw-test.js     env: Q='&fairstreet=0' (old look)  GATE=0 (numbers only)  VP=390x763
// Gate: 0 fillRect / strokeRect / arc / ellipse / stroke calls drawn over a prop (its draw callback or the shape fallback, tag bprop) or a pickup (tag pk) per frame; pickups and props were really drawn (> 0 draws).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), Q = process.env.Q || '', GATE = process.env.GATE !== '0' && !/fairstreet=0/.test(Q);
const [VW, VH] = (process.env.VP || '390x763').split('x').map(Number);
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const RUN = async () => { const M = __mnr, ART = M.ART, RET = M.RET, F = FOOT; RET.tale = false; F.start('zeil');
  for (let i = 0; i < 150 && !ART.anim('kai/run'); i++) await new Promise(r => setTimeout(r, 100));
  F.on = false; await new Promise(r => setTimeout(r, 50)); const S = F.S, P = S.P, c = F._in.L().ctx, SL = F.look;
  let tag = '', inProp = 0; Object.defineProperty(SL, 'tag', { get: () => tag, set: v => { tag = v; }, configurable: true });
  const bad = {}, frame = { n: 0 }; let propDraws = 0, pkDraws = 0, cur = 0;
  const tr = k => { const o = c[k]; c[k] = function () { if (inProp || tag === 'pk' || tag === 'bprop') { bad[k] = (bad[k] || 0) + 1; cur++; } return o.apply(this, arguments); }; };
  for (const k of ['fillRect', 'strokeRect', 'arc', 'ellipse', 'stroke']) tr(k);
  const od = c.drawImage; c.drawImage = function () { if (tag === 'pk') pkDraws++; if (inProp) propDraws++; return od.apply(this, arguments); };
  const wrapProps = () => { for (const p of S.pr) if (p.draw && !p._w) { p._w = 1; const d = p.draw; p.draw = function () { inProp++; try { return d.apply(this, arguments); } finally { inProp--; } }; } };
  F.ctl = (S_, I) => { I.l = I.u = I.d = 0; I.r = 1; I.fire = 1; I.jump = 0; };
  let worst = 0, framesBad = 0; const kinds = {};
  for (let i = 0; i < 3600; i++) { wrapProps(); if (P.hp > P.max - 2) P.hp = P.max - 2; if (P.hp < 2) P.hp = 2; S.pr.forEach(p => { if (i % 200 === 0 && p.hp > 0) p.fl = .1; }); cur = 0; F.sim(1 / 60, 1 / 60); F.look.draw(c); if (cur) { framesBad++; worst = Math.max(worst, cur); } for (const q of S.pk) kinds[q.k] = 1; if (S.end) break; }
  return { t: +S.time.toFixed(1), frames: S.time * 60 | 0, bad, framesBad, worst, propDraws, pkDraws, pickups: Object.keys(kinds), props: S.pr.length };
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(600);
  const b = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }), errors = [];
  const p = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 }); p.on('pageerror', e => errors.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${Q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 20000 }); await sleep(600);
  const r = await p.evaluate(`(${RUN})()`); console.log(JSON.stringify(r));
  let fails = 0; const ok = (q, n) => { if (!q) fails++; console.log((q ? 'PASS ' : 'FAIL ') + n); };
  if (GATE) {
    ok(r.framesBad === 0, `0 fillRect/arc/ellipse/stroke calls over props or pickups in ${r.t} s (${r.frames} frames; offending frames ${r.framesBad}, calls ${JSON.stringify(r.bad)})`);
    ok(r.propDraws + r.pkDraws > 0, `props and pickups were drawn as pictures (${r.propDraws} prop images, ${r.pkDraws} pickup images; pickup kinds seen ${r.pickups.join(',') || 'none'})`);
    ok(errors.length === 0, `0 page errors ${errors[0] || ''}`);
  }
  await b.close(); srv.kill(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL crashed: ' + e.stack); process.exit(2); });
