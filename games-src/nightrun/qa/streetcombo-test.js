#!/usr/bin/env node
// STREETCOMBO (parts/street/streetcombo.js, ?combocount=1): stepped, no wall-clock waits. Prints PASS/FAIL only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/streetcombo-test.js     env: GAME_DIR  VP=390x763  SHOT=<png prefix> (also save screenshots, never commit them)
// Gates: the "N HITS" text is drawn on 100% of steps where the streak is > 1; its box overlaps no other HUD box and sits above the floor band;
//        a hurt resets the streak; 2 s without a hit resets it; a third-swing / blast kill sets up a bounce; 0 page errors.
// (median best streak for the dodge bot >= 12 is measured by qa/streetsim.js with Q='&combocount=1')
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun');
const [VW, VH] = (process.env.VP || '390x763').split('x').map(Number);
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (p, n) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n); };
const RUN = async () => { const M = __mnr, ART = M.ART, RET = M.RET, F = FOOT, IN = F._in; RET.tale = false; F.start('zeil');
  for (let i = 0; i < 150 && !ART.anim('kai/run'); i++) await new Promise(r => setTimeout(r, 100));
  F.on = false; await new Promise(r => setTimeout(r, 50)); const S = F.S, P = S.P, L = IN.L(), c = L.ctx, C = F.COMBO, out = { flag: !!RET.combocount, has: !!C };
  if (!C) return out;
  let s = 99; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647;
  F.ctl = (S_, I) => { I.l = 0; I.r = 1; I.u = I.d = 0; I.fire = 1; I.jump = 0; I.meleeP = S_.time % 3 < .6 ? 1 : 0; I.bombP = (S_.time % 7 < .02 && P.bombs > 0) ? 1 : 0; P.bombs = Math.max(P.bombs, 2); P.inv = 9; P.hp = P.max; };   // walk right shooting, cannot die
  let txt = 0, hits = 0, steps = 0, ovl = 0, floorHit = 0, maxN = 0; const P2 = CanvasRenderingContext2D.prototype, ft = P2.fillText; P2.fillText = function (t) { if (/ HITS$/.test(t)) txt++; return ft.apply(this, arguments); };
  let nHud = 0;
  for (let i = 0; i < 1500; i++) { F.sim(1 / 60, 1 / 60); const want = C.n > 1 && S.time - C.last <= 2 && S.hurts === C.hurts; txt = 0; F.look.draw(c); steps += want ? 1 : 0; hits += want && txt > 0 ? 1 : 0;
    maxN = Math.max(maxN, C.n); const hb = L.hud && L.hud.hud || [];
    if (want && hb.length) { const b = hb[hb.length - 1], r = (a, d) => a.x < d.x + d.w && d.x < a.x + a.w && a.y < d.y + d.h && d.y < a.y + a.h; nHud++;
      for (const o of hb.slice(0, -1)) if (r(b, o)) ovl++;
      const floorTop = (F.look.road - F.look.band * L.sc - L.box.y) / L.sc + F.look.t0;   // floor band top in view units (road line minus 27% of the view)
      if (F.look.band && b.y + F.look.t0 + b.h > floorTop) floorHit++; } }
  out.steps = steps; out.drawn = hits; out.ovl = ovl; out.floorHit = floorHit; out.maxN = maxN; out.bounces = C.bounces; out.cd = C.drawn; out.cw = C.want; out.txt = txt; out.nHud = nHud;
  // a hurt resets, 2 s resets
  C.n = 5; C.last = S.time; C.hurts = S.hurts; S.hurts++; out.afterHurt = (F.look.draw(c), C.n);
  C.n = 5; C.last = S.time; C.hurts = S.hurts; S.time += 2.5; F.look.draw(c); out.afterIdle = C.n;
  // bounce draw: a dead foe with the mark rises for 0.4 s (peak at 0.2 s), is tilted, and is drawn normally after
  const ty = []; const tr = P2.translate; P2.translate = function (x, y) { ty.push(y); return tr.apply(this, arguments); }; const lift = dt => { ty.length = 0; ART.fE = { dead: true, _bnc: 1, dt_: dt, id: 'rusher' }; try { ART.footDraw(c, 'knife', 'die', 100, 400, 64, false, dt); } catch (e) {} ART.fE = null; return ty.length ? 400 - ty[0] : -1; };
  out.lift0 = lift(0.2); out.liftEnd = lift(0.45); out.liftNone = (ART.fE = null, -1); P2.translate = tr;
  return out; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(600);
  const b = await PW.chromium.launch(), errors = [];
  const p = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 }); p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 })); localStorage.setItem('mnr_tut', '2'); localStorage.setItem('mnr_foot', '{"seen":{"b":1,"a":1},"hint":1}'); } catch (e) {} });
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&combocount=1${process.env.Q || ''}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 20000 }); await sleep(800);
  const r = await p.evaluate(`(${RUN})()`); console.log(JSON.stringify(r));
  ok(r.flag && r.has, 'flag on builds F.COMBO');
  if (r.has) {
    ok(r.steps > 40 && r.drawn === r.steps, `counter drawn on ${r.drawn} of ${r.steps} steps with streak > 1 (best ${r.maxN})`);
    ok(r.ovl === 0 && r.nHud > 0, `0 HUD box overlaps (${r.ovl} in ${r.nHud} steps)`);
    ok(r.floorHit === 0, `counter above the floor band (${r.floorHit} steps inside)`);
    ok(r.afterHurt === 0, `a hurt breaks the streak (${r.afterHurt})`); ok(r.afterIdle === 0, `2.5 s without a hit breaks it (${r.afterIdle})`);
    ok(r.lift0 > 15 && r.liftEnd <= 0, `a marked dead foe rises ${r.lift0} units at 0.2 s and is drawn flat after 0.4 s (${r.liftEnd})`);
    if (process.env.SHOT) { await p.evaluate(`(()=>{const F=FOOT,S=F.S,C=F.COMBO;C.n=14;C.last=S.time-.4;C.pop=S.time-.3;C.hurts=S.hurts;F.look.draw(F._in.L().ctx);})()`); await p.screenshot({ path: process.env.SHOT + '.png' }); }
  }
  ok(!errors.length, `0 page errors ${errors.slice(0, 2).join(' | ')}`);
  await b.close(); srv.kill(); process.exit(res.every(Boolean) ? 0 : 1);
})();
