#!/usr/bin/env node
// RETENTION tests B1 (first-clear/star pay), B3 (mercy) and a flag-off check. Headless, no screenshots. Prints PASS/FAIL, exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), p = await br.newPage({ viewport: { width: 960, height: 540 } }), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1`); await p.waitForFunction(() => window.__mnr && window.RET, null, { timeout: 8000 });
  // force a clear of stage n with the given star sum; returns the bank change
  const clear = (n, flag) => p.evaluate(({ n, flag }) => { const m = window.__mnr; RET.clearPay = flag; m.startStory(n); m.simOn(true);
    const b0 = m.GA.bank; m.ST.stars = [1, 1, 1]; m.ST.finish(); m.abort(); return m.GA.bank - b0; }, { n, flag });
  const base = 40 + 12 * 1;
  const a = await clear(1, true); ok('B1 first clear of stage 1 pays base + 3 new stars', a === base + 75, a);
  const b = await clear(1, true); ok('B1 second clear pays 10% of base', b === Math.round(base * .1), b);
  const c = await clear(2, false); ok('B1 flag off: bank does not change', c === 0, c);
  await p.evaluate(() => { RET.clearPay = true; window.__mnr.sSave.stars[3] = 1; });
  const d = await clear(3, true); ok('B1 star upgrade on a cleared stage pays 10% + 25 per new star', d === Math.round((40 + 36) * .1) + 50, d);
  // B3 mercy
  const mer = await p.evaluate(() => { const m = window.__mnr, o = {}; RET.mercy = true; RET.fails = {};
    const hp = n => { m.startStory(n); m.simOn(true); const r = { hp: m.P.hp, lvl: m.ST.lvl }; m.abort(); return r; };
    const fail = n => { m.startStory(n); m.simOn(true); m.ST.fail(); m.abort(); };
    o.f0 = hp(18); fail(18); o.f1 = hp(18); fail(18); o.f2 = hp(18); fail(18); fail(18); o.f4 = hp(18);
    RET.mercy = false; o.off = hp(18); RET.mercy = true; m.startStory(18); m.simOn(true); m.ST.stars = [1, 0, 0]; m.ST.finish(); m.abort(); o.cleared = hp(18); o.fails = JSON.stringify(RET.fails); return o; });
  ok('B3 no mercy before 2 fails', mer.f1.hp === mer.f0.hp && mer.f1.lvl === mer.f0.lvl, JSON.stringify(mer));
  ok('B3 +1 hull after 2 fails, level unchanged', mer.f2.hp === mer.f0.hp + 1 && mer.f2.lvl === mer.f0.lvl, JSON.stringify(mer));
  ok('B3 level -0.3 after 4 fails', Math.abs(mer.f4.lvl - (mer.f0.lvl - .3)) < 1e-9 && mer.f4.hp === mer.f0.hp + 1, JSON.stringify(mer));
  ok('B3 flag off: no mercy', mer.off.hp === mer.f0.hp && mer.off.lvl === mer.f0.lvl, JSON.stringify(mer));
  ok('B3 a clear resets the offer', mer.cleared.hp === mer.f0.hp && mer.cleared.lvl === mer.f0.lvl, JSON.stringify(mer));
  // B2 flag off = old prices
  const pr = await p.evaluate(() => { RET.econ = false; const t0 = RET.totalCost(), w = RET.probe().w; RET.econ = true; return { t0, w, t1: RET.totalCost(), w1: RET.probe().w }; });
  ok("B2 flag off: original prices (40 Neon level 1, full garage > 141,780)", pr.w === 40 && pr.t0 >= 141780, JSON.stringify(pr));
  ok('B2 flag on: cheaper', pr.t1 < pr.t0 / 2 && pr.w1 < 40, JSON.stringify(pr));
  ok('no page errors', errs.length === 0, errs[0]);
  await br.close(); srv.kill(); process.exit(res.every(Boolean) ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
