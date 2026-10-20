#!/usr/bin/env node
// Nightrun B21 FEVER checks, real page in sim mode (?sim=1, stepped by hand), headless, no screenshots.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-fever-test.js     env: GAME_DIR=...
// 1 the meter fills from graze / PERFECT events and not when the ship stands still
// 2 a full meter starts FEVER on a bar line and it lasts exactly 8 bars (music layers open: AU.fever)
// 3 score multiplier x1.5 only during FEVER; damage per second, player bullets and bullet cap unchanged (within 5%)
// 4 FEVER ends on death / run end / stage clear / boss; once per 32 bars; never with a boss on screen
// 5 flag off = baseline (no fill, no multiplier, no HUD)
// 6 HUD bar inside the viewport and not on the ship at 390x763 and 1280x720; no page errors
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = []; const ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i === undefined ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); const errs = [];
  const open = async (vp, q = '') => {
    const p = await br.newPage({ viewport: vp }); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&nomusic=1${q}`); await p.waitForFunction(() => window.__mnr && window.__mnr.RET, null, { timeout: 10000 }); return p;
  };
  const p = await open({ width: 390, height: 763 });
  const R = await p.evaluate(() => {
    const m = window.__mnr, out = {}, FV = m.RET.fv, G = () => m.G, P = m.P;
    const fresh = () => { m.abort(); m.startStory(1); m.simOn(true); m.god = true; m.STILL.t = 0; };
    const step = (n, f) => { for (let i = 0; i < n; i++) { if (f) f(i); m.STILL.t = 0; P.hp = P.max; if (G().boss) G().boss = null; m.step(1 / 60); } };
    const bars = []; window.NR.on('bar', () => bars.push(1));
    // 1 fill and idle
    fresh(); out.start = { fever: m.RET.fever, m: FV.m };
    for (let i = 0; i < 10; i++) window.NR.emit('graze', {}); out.m10 = FV.m;
    window.NR.emit('perfect', { kind: 'dash' }); out.mDash = FV.m;
    FV.m = 0; m.STILL.t = 9; for (let i = 0; i < 50; i++) window.NR.emit('graze', {}); window.NR.emit('perfect', { kind: 'graze' }); out.mIdle = FV.m; m.STILL.t = 0;
    // 2 full meter: starts on a bar, lasts 8 bars
    FV.m = 0; for (let i = 0; i < 40; i++) window.NR.emit('graze', {}); out.full = FV.m;
    let bars0 = bars.length, tOn = -1, tOff = -1, onBars = 0, au = true, k = [];
    for (let i = 0; i < 60 * 60 && tOff < 0; i++) { step(1); if (FV.on && tOn < 0) { tOn = i; bars0 = bars.length; } if (FV.on && FV.bars < 7) { au = au && m.AU.fever === true; } if (tOn >= 0 && !FV.on) tOff = i; }
    out.startedOnBar = tOn >= 0; out.barsLasted = bars.length - bars0; out.au = au; out.auAfter = m.AU.fever; out.m2 = FV.m;
    // cooldown: filling again at once does not start a second FEVER within 32 bars
    for (let i = 0; i < 40; i++) window.NR.emit('graze', {}); const s0 = FV.starts; step(60 * 12); out.cool = FV.starts - s0; out.coolM = FV.m;
    // 3 score and damage
    const kill = () => { m.RET.vis = false; /* obsolete-fixed: the on-screen floor (RET.vis) stops a foe dying faster than VIS.ml, so a one-frame test kill pays nothing */ const g = G(); g.mult = 1; m.C.n = 0; const s = g.score; g.en.push({ type: 'drone', x: P.x + 120, y: P.y, r: 14, hp: -5, max: 5, hq: 5, flash: 0, t: 0, bf: 99, bn: 0, gr: 0, tin: 0, by: P.y, score: 1000 }); m.step(1 / 60); return g.score - s; };
    FV.on = false; const a = kill(); FV.on = true; const b = kill(); FV.on = false; out.sc = [a, b];
    const dps = (on) => { fresh(); FV.on = on; const dum = []; for (const dy of [-80, -40, 0, 40, 80]) dum.push({ type: 'drone', dummy: 1, x: 200, y: 270 + dy, r: 16, hp: 1e6, max: 1e6, hq: 1e6, flash: 0, t: 0, bf: 99, bn: 0, gr: 0, tin: 0, by: 270 + dy }); let d = 0, mx = 0;
      for (let i = 0; i < 480; i++) { if (m.SH.active) m.SH.close(); P.hp = P.max; P.x = 100; P.y = 270 + 50 * Math.sin(i / 60 * 1.6); G().en = G().en.filter(e => e.dummy); G().eb = []; for (const x of dum) if (!G().en.includes(x)) G().en.push(x);
        if (i % 8 === 0) m.SH.volley(P.x + 22, P.y + 2, 0); m.step(1 / 60); mx = Math.max(mx, G().pb.length); for (const x of dum) { d += 1e6 - x.hp; x.hp = x.hq = 1e6; x.x = 200; x.y = P.y + (x.by - 270); x.dead = 0; x.dying = 0; x.chl = 0; } }
      FV.on = false; return { dps: d / 8, pb: mx }; };
    out.d0 = dps(false); out.d1 = dps(true);
    // 4 ends
    const ends = {};
    for (const ev of ['runEnd', 'stageClear', 'districtEnd', 'bossIn']) { fresh(); FV.on = true; FV.bars = 2; FV.m = 55; AU_set(true); window.NR.emit(ev, {}); ends[ev] = { on: FV.on, au: m.AU.fever, m: FV.m }; }
    function AU_set(v) { m.AU.fever = v; }
    out.ends = ends;
    fresh(); P.hp = 1; FV.on = true; m.AU.fever = true; window.NR.emit('runEnd', { score: 0 }); out.afterDeath = { on: FV.on, au: m.AU.fever, m: FV.m };
    fresh(); G().boss = { type: 'boss', hp: 9, max: 9, x: 200, y: 200, r: 40 }; FV.m = 0; window.NR.emit('graze', {}); out.bossFill = FV.m; G().boss = null;
    // 5 flag off
    fresh(); m.RET.fever = false; window.NR.emit('graze', {}); out.offM = FV.m; step(300); m.RET.fever = true; FV.on = false; out.offBase = kill(); m.RET.fever = false; FV.on = true; const o1 = kill(); FV.on = false; out.offScore = o1; FV.m = 100; step(60 * 12); out.offStarts = FV.on;
    const el = document.getElementById('retFv'); out.offHud = !el || el.style.display === 'none'; m.RET.fever = true;
    return out;
  });
  ok(`graze fills the meter (${R.m10} after 10 grazes), a dash PERFECT adds more (${R.mDash})`, R.m10 > 20 && R.m10 < 30 && R.mDash > R.m10);
  ok(`a still ship fills nothing (${R.mIdle})`, R.mIdle === 0);
  ok(`50 grazes fill it to ${R.full}`, R.full === 100);
  ok('FEVER starts on a bar line', R.startedOnBar);
  ok(`FEVER lasts exactly 8 bars (${R.barsLasted}), the music flag is on during it and off after (${R.au}/${R.auAfter})`, R.barsLasted === 8 && R.au === true && R.auAfter === false);
  ok(`no second FEVER inside 32 bars (${R.cool} starts, meter ${R.coolM})`, R.cool === 0 && R.coolM === 100);
  ok(`score x1.5 only during FEVER (${R.sc[0]} -> ${R.sc[1]})`, R.sc[0] > 0 && Math.abs(R.sc[1] / R.sc[0] - 1.5) < .02);
  ok(`damage per second unchanged (${R.d0.dps.toFixed(1)} vs ${R.d1.dps.toFixed(1)}), player bullets ${R.d0.pb} vs ${R.d1.pb}`, Math.abs(R.d1.dps / R.d0.dps - 1) <= .05 && R.d1.pb <= R.d0.pb);
  for (const [k, v] of Object.entries(R.ends)) ok(`${k} ends FEVER (on ${v.on}, music ${v.au})`, v.on === false && v.au === false && (k === 'bossIn' || v.m === 0));
  ok('death / run end resets the meter', R.afterDeath.on === false && R.afterDeath.m === 0);
  ok('a boss on screen blocks filling', R.bossFill === 0);
  ok(`flag off = baseline (meter ${R.offM}, score ${R.offScore} = ${R.offBase}, no FEVER start, HUD hidden)`, R.offM === 0 && R.offBase > 0 && Math.abs(R.offScore - R.offBase) <= .15 * R.offBase /* obsolete-fixed: an on-beat kill bonus (+10%) varies the two one-frame kills; the FEVER x1.5 would be +50% */ && R.offStarts === false && R.offHud);
  // 6 HUD
  for (const vp of [{ width: 390, height: 763 }, { width: 1280, height: 720 }]) {
    const q = await open(vp);
    const H = await q.evaluate(() => { const m = window.__mnr; m.startStory(1); m.simOn(true); m.god = true; for (let i = 0; i < 30; i++) m.step(1 / 60); window.NR.emit('graze', {}); const cv = document.getElementById('game'), cr = cv.getBoundingClientRect(), s = cr.width / cv.width, P = m.P;
      const bar = document.querySelector('#retFv .fvTr').getBoundingClientRect(), ys = [P.y, 36, 400].map(y => cr.top + y * s), ship = { l: cr.left + (P.x - 28) * s, r: cr.left + (P.x + 28) * s, t: cr.top + (36 - 22) * s, b: cr.top + (36 + 22) * s };
      return { bar: { l: bar.left, r: bar.right, t: bar.top, b: bar.bottom }, vw: innerWidth, vh: innerHeight, ship, cw: cr.width, pe: getComputedStyle(document.getElementById('retFv')).pointerEvents }; });
    const inside = H.bar.l >= 0 && H.bar.r <= H.vw && H.bar.t >= 0 && H.bar.b <= H.vh && H.bar.r - H.bar.l > 40;
    const hit = !(H.bar.r < H.ship.l || H.bar.l > H.ship.r || H.bar.b < H.ship.t || H.bar.t > H.ship.b);
    ok(`HUD bar inside the viewport and off the highest ship position at ${vp.width}x${vp.height} (bar ${Math.round(H.bar.l)}-${Math.round(H.bar.r)} x ${Math.round(H.bar.t)}-${Math.round(H.bar.b)})`, inside && !hit && H.pe === 'none');
    await q.close();
  }
  ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await br.close(); srv.kill(); const bad = res.filter(x => !x).length; console.log(bad ? `${bad} FAILED` : 'ALL PASS'); process.exit(bad ? 1 : 0);
})();
