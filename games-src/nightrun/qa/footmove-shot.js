#!/usr/bin/env node
// FOOTMOVE (W223): the purefoot one-shot moment, then a motion strip: STRIP=n frames, STEP=sim steps between frames, drawn and screenshotted each.
//   node games-src/nightrun/qa/footmove-shot.js   env: VP=390x763|1440x860  Q='&footmove=0'  SHOT=<png prefix>  STRIP=3 STEP=4 WHO=kai|foe
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), Q = process.env.Q || '';
const [VW, VH] = (process.env.VP || '1440x860').split('x').map(Number), PHONE = VW < 800, STRIP = +(process.env.STRIP || 0), STEP = +(process.env.STEP || 4);
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SETUP = async (process_EB) => { const rs = () => { let sd = 7; Math.random = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }; }; rs(); const M = __mnr, ART = M.ART, RET = M.RET, F = FOOT; RET.tale = false; F.start('zeil');
  for (let i = 0; i < 150 && !ART.anim('kai/run'); i++) await new Promise(r => setTimeout(r, 100));
  for (let i = 0; i < 100 && !(F.q && F.q.picsReady()); i++) await new Promise(r => setTimeout(r, 100));
  F.on = false; await new Promise(r => setTimeout(r, 50)); rs(); F.start('zeil'); F.on = false; await new Promise(r => setTimeout(r, 50));
  const S = F.S, P = S.P, c = F._in.L().ctx; window.__fm = { S, P, c, F };
  const vis = () => S.E.filter(e => !e.dead && e.hp > 0 && Math.abs(e.x - P.x) < 420);
  let i = 0; F.ctl = (S_, I) => { I.l = I.u = I.d = 0; const v = vis(), vw = F._in.L().vw; I.r = v.length ? 0 : 1; I.l = v.some(e => e.x < P.x) && P.x - S.camX > vw * .45 ? 1 : 0; I.fire = 1; I.jump = 0; I.meleeP = v.some(e => Math.abs(e.x - P.x) < 70) && (i % 30 === 0); };
  for (; i < 60 * 120; i++) { P.hp = P.max; P.inv = 1; F.sim(1 / 60, 1 / 60); if (i > 600 && vis().length >= (process_EB ? 2 : 3) && (!process_EB || S.eb.some(b => Math.abs(b.x - P.x) > 60 && Math.abs(b.x - P.x) < 200))) break; }
  for (let k = 0; k < (process_EB ? 2 : 50); k++) { i++; P.hp = P.max; F.sim(1 / 60, 1 / 60); }
  { const sv = S.sim; S.sim = false; try { F.post && F.post(S, 0); } finally { S.sim = sv; } }
  for (let k = 0; k < 10; k++) { F.look.draw(c); await new Promise(r => setTimeout(r, 120)); }
  P.inv = 0; F.look.draw(c); return { pr: S.pr.filter(p => Math.abs(p.x - P.x) < 600).map(p => (p.k || p.id || p.kind || "?") + "@" + Math.round(p.x - S.camX) + "," + Math.round(p.y) + " w" + p.w + " h" + p.h + " z" + (p.z == null ? "-" : p.z.toFixed(2))), band: F.look.band, steps: i, foes: vis().map(e => e.id + (e.wind > 0 ? ':wind' : e.tele > 0 ? ':tele' : '')), eb: S.eb.length, pb: S.pb.length, fm: RET.footmove };
};
const STEPF = n => { const { S, P, c, F } = window.__fm; for (let k = 0; k < n; k++) { P.hp = P.max; P.inv = 0; F.sim(1 / 60, 1 / 60); } { const sv = S.sim; S.sim = false; try { F.post && F.post(S, 0); } finally { S.sim = sv; } } F.look.draw(c); return S.E.filter(e => !e.dead).map(e => e.id + (e.wind > 0 ? ':w' : '')).join(' '); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(600);
  const b = await PW.chromium.launch(), errors = [];
  const p = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: PHONE ? 3 : 1, hasTouch: PHONE, isMobile: PHONE }); p.on('pageerror', e => errors.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${Q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 20000 }); await sleep(600);
  console.log(JSON.stringify(await p.evaluate(`(${SETUP})(${!!process.env.EB})`)));
  if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT + '.png' });
  if (process.env.ATK) { const ATKF = async (ph) => { const { S, P, c, F } = window.__fm; const st = n => { for (let k = 0; k < n; k++) { P.hp = P.max; P.inv = 1; F.sim(1 / 60, 1 / 60); if (window.__fe) F.look.draw(c); } };   // drawn every step once the foe is picked (the draw-side clocks advance per frame, as in play)
      if (ph === 0) { F.ctl = (S_, I) => { I.l = I.r = I.u = I.d = 0; I.fire = 0; I.jump = 0; I.meleeP = 0; }; for (let i = 0; i < 6000; i++) { st(1); const e = S.E.find(e => !e.dead && (e.wind > .3 || e.state === 'crouch' && e.tele > .3 && e.sT < .05)); if (e) { window.__fe = e; break; } } st(12); }   // anticipation: ~0.2 s into the wind-up
      else if (ph === 1) { const e = window.__fe; for (let i = 0; i < 60 && (e.wind > 0 || e.state === 'crouch'); i++) st(1); st(3); }   // strike: 0.05 s after the hit lands
      else st(14);   // recovery
      { const sv = S.sim; S.sim = false; try { F.post && F.post(S, 0); } finally { S.sim = sv; } } P.inv = 0; F.look.draw(c); const e = window.__fe; return e ? [e.id, e.wind > 0 || e.state === 'crouch' ? 'wind' : e.state + ' rc' + (e._rc || 0).toFixed(2), Math.round(e.x - S.camX), Math.round(e.y)] : 'none'; };
    for (let k = 0; k < 3; k++) { const r = await p.evaluate(`(${ATKF})(${k})`); await sleep(80); if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT + '-a' + k + '.png' }); console.log('atk', k, JSON.stringify(r)); } }
  if (process.env.KB) { const KBF = async (ph) => { const { S, P, c, F } = window.__fm; const st = n => { for (let k = 0; k < n; k++) { P.hp = P.max; P.inv = 1; F.sim(1 / 60, 1 / 60); F.look.draw(c); } };   // W225 KB=1: a knockback strip (rise / apex / landing) of the nearest foe killed by Kai's knife
      if (ph === 0) { F.ctl = (S_, I) => { I.l = I.r = I.u = I.d = 0; I.fire = 0; I.jump = 0; I.meleeP = 0; }; const e = S.E.filter(e => !e.dead && !e.boss && !e.fly).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; window.__fe = e; F._in.dmgE(e, 99, { melee: 1, x: P.x }); st(5); }
      else st(ph === 1 ? 5 : 9);
      { const sv = S.sim; S.sim = false; try { F.post && F.post(S, 0); } finally { S.sim = sv; } } P.inv = 0; F.look.draw(c); const e = window.__fe; return e ? [e.id, (S.time - (e._ka ? e._ka.t : 0)).toFixed(2), Math.round(e.x - S.camX)] : 'none'; };
    for (let k = 0; k < 3; k++) { const r = await p.evaluate(`(${KBF})(${k})`); await sleep(80); if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT + '-k' + k + '.png' }); console.log('kb', k, JSON.stringify(r)); } }
  if (process.env.SX) console.log('sx', JSON.stringify(await p.evaluate(() => { const { S, P } = window.__fm; return [Math.round(P.x), P.z, S.E.filter(e => !e.dead).map(e => [e.id, Math.round(e.x), e._sx && Math.round(e._sx), e._tx && Math.round(e._tx), e.z && +e.z.toFixed(2), e.state, e.w])]; })));
  if (process.env.HS) console.log('hitstop', JSON.stringify(await p.evaluate(() => { const { S, P, F } = window.__fm; S.sim = 0; const L = S.E.filter(e => !e.dead && !e.boss).sort((a, b) => b.hp - a.hp); if (L.length < 2) return 'need 2 foes'; const [a, b] = L, t0 = [a.t, b.t, S.time]; F._in.dmgE(a, .5, { melee: 1, x: P.x }); const hs = [a.hs, P.hs, S.hs]; for (let i = 0; i < 2; i++) F.step(1 / 60); return { hs, targetT: +(a.t - t0[0]).toFixed(3), otherT: +(b.t - t0[1]).toFixed(3), world: +(S.time - t0[2]).toFixed(3) }; })));   // W225 HS=1: a light knife hit freezes the target (and Kai), the other foe keeps its clock
  for (let k = 0; k < STRIP; k++) { const r = await p.evaluate(`(${STEPF})(${STEP})`); await sleep(60); await p.evaluate(`(${STEPF})(0)`); if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT + '-s' + k + '.png' }); console.log('strip', k, r); }
  console.log((errors.length ? 'FAIL' : 'PASS') + ' 0 page errors ' + (errors[0] || ''));
  await b.close(); srv.kill();
})().catch(e => { console.log('FAIL ' + e.stack); process.exit(2); });
