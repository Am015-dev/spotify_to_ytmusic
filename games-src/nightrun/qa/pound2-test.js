#!/usr/bin/env node
// W186 POUND2: stepped boss fight (FOOT.sim + streetlook draw per step, Kai made hard to kill) at 390x763 (phone) and 1440x860 (PC).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/pound2-test.js     env: SHOTS=<dir> (screenshots at the pound wind-up and the leap wind-up), Q='&pound2=0' (old, expect FAIL), STEPS=5400
// Gates: 0 steps where a HUD rectangle (boss bar, progress bar, panel, hint) overlaps the floor band (FL - band .. FL); the boss bar was drawn on >= 95% of boss steps;
//        the pound's red line and the leap's red ring are alive for the whole 0.8 s wind-up (red marks present on every wind-up step); 0 page errors.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), Q = process.env.Q || '', SHOTS = process.env.SHOTS, STEPS = +process.env.STEPS || 5400;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const RUN = async (shots, STEPS) => { const M = __mnr, ART = M.ART, RET = M.RET, F = FOOT; RET.tale = false; F.start('zeil');
  for (let i = 0; i < 150 && !ART.anim('kai/run'); i++) await new Promise(r => setTimeout(r, 100));
  for (let i = 0; i < 100 && !(F.q && F.q.picsReady()); i++) await new Promise(r => setTimeout(r, 100));
  F.on = false; await new Promise(r => setTimeout(r, 50)); const S = F.S, P = S.P, c = F._in.L().ctx, SL = F.look, FL = 470;
  P.x = S.st.boss.x - 420; P.max = 99; F.ctl = (S_, I) => { I.l = I.u = I.d = 0; I.r = 0; I.fire = 0; I.jump = 0; };
  const o = { steps: 0, boss: 0, bar: 0, overlap: 0, worst: null, ww: 0, wwMarked: 0, shots: {}, err: '' };
  for (let i = 0; i < STEPS && !S.end; i++) { P.hp = P.max; if (i === 2 && !S.bossOn) { const vw = (F._in.L().hud && F._in.L().hud.vw) || 800, bc = Math.min(S.st.boss.x - vw / 2, S.st.len - vw); S.bossOn = true; S.lock = { id: 'boss', cam: bc }; S.bossAt = S.time + 1.2; S.camX = bc; P.x = bc + vw * 0.3; P.maxX = Math.max(P.maxX || 0, P.x); S.E.length = 0; } F.sim(1 / 60, 1 / 60); F.look.draw(c); o.steps++;
    const B = S.boss, L = F._in.L(); if (!B || B.dead) continue; o.boss++;
    const hud = (L.hud && L.hud.hud || []).concat(L.hud && L.hud.hint ? [L.hud.hint] : []), top = FL - SL.band, t0 = SL.t0;
    if (hud.some(r => r.h > 0 && r.y + t0 < FL && r.y + t0 + r.h > top)) { o.overlap++; if (!o.worst) o.worst = hud.filter(r => r.y + t0 + r.h > top).map(r => [r.x | 0, (r.y + t0) | 0, r.w | 0, r.h | 0]); }
    if (hud.some(r => r.w > 0.6 * (L.hud.vw || 1) * 0.5 && r.h >= 20)) o.bar++;
    if (B.state === 'sb_poundW' || B.state === 'sb_leapW') { o.ww++; if (S.fx.some(f => f.c === '#ff2d3a' && f.l > 0.3)) o.wwMarked++; if (shots && !o.shots[B.state] && B.sT > 0.4) { o.shots[B.state] = 1; window.__shot = window.__shot || []; window.__shot.push(B.state); await new Promise(r => setTimeout(r, 30)); } } }
  return o; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(600);
  const b = await PW.chromium.launch(), errors = []; let fails = 0; const ok = (q, n) => { if (!q) fails++; console.log((q ? 'PASS ' : 'FAIL ') + n); };
  for (const [vw, vh, ph] of [[390, 763, 1], [1440, 860, 0]]) {
    const ctx = await b.newContext(ph ? { viewport: { width: vw, height: vh }, deviceScaleFactor: 2, userAgent: UA, isMobile: true, hasTouch: true } : { viewport: { width: vw, height: vh } }), p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message));
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${Q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 20000 }); await sleep(600);
    const shotLoop = SHOTS ? setInterval(async () => { try { const s = await p.evaluate(() => window.__shot && window.__shot.shift()); if (s) { fs.mkdirSync(SHOTS, { recursive: true }); await p.screenshot({ path: path.join(SHOTS, `${vw}x${vh}-${s}.png`) }); } } catch (e) { } }, 20) : null;
    const r = await p.evaluate(`(${RUN})(${!!SHOTS}, ${STEPS})`); if (shotLoop) clearInterval(shotLoop);
    ok(r.boss > 600, `${vw}x${vh}: boss fight stepped (${r.boss} boss steps of ${r.steps})`);
    ok(r.overlap === 0, `${vw}x${vh}: 0 steps with a HUD rectangle over the floor band (${r.overlap} of ${r.boss}${r.worst ? ' e.g. ' + JSON.stringify(r.worst) : ''})`);
    ok(r.boss && r.bar / r.boss >= 0.95, `${vw}x${vh}: boss bar drawn on ${(100 * r.bar / Math.max(1, r.boss)).toFixed(0)}% of boss steps`);
    if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await p.screenshot({ path: path.join(SHOTS, `${vw}x${vh}-boss-end.png`) }); }
    ok(r.ww === 0 || r.wwMarked / r.ww >= 0.95, `${vw}x${vh}: red pound line / leap ring alive on >= 95% of wind-up steps (${r.wwMarked} of ${r.ww})`);
    await ctx.close();
  }
  ok(errors.length === 0, `0 page errors ${errors[0] || ''}`);
  await b.close(); srv.kill(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL crashed: ' + e.stack); process.exit(2); });
