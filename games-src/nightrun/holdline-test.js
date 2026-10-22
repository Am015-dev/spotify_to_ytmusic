#!/usr/bin/env node
// Hold the line (parts/difficulty/holdline.js, flag RET.holdline) through the real page (prints pass/fail only):
//   NODE_PATH=$(npm root -g) node games-src/nightrun/holdline-test.js      env: GAME_DIR=<dir with index.html>
//  (a) a leak drains the line (LEAK.M up by the weight), counts, costs score and multiplier; an elite costs one weight more in score only
//  (b) an empty line costs one hull and refills to the warning level (no hull on the last hull, Normal)
//  (c) a kill inside the last 140 px refunds half a weight, at most once per bar; a kill far from the line refunds nothing
//  (d) ?holdline=0: the same leaks change only the old BREACH meter (no count, no score or multiplier cost, no refund)
//  (e) no page errors; the line draws without throwing
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const T = () => {
  const m = window.__mnr, L = window.LEAK, H = window.HOLD, out = [], ok = (c, s) => out.push((c ? 'PASS ' : 'FAIL ') + s);
  m.SET.diff = 'normal'; m.applySet && m.applySet(); m.startStory(3); m.simOn(true); L.reset(); if (H) H.reset(); L.lab = 'LINE';
  for (let i = 0; i < 30; i++) m.step(1 / 30);
  const on = !!m.RET.holdline, fe = (type, x, el) => ({ type, x, y: 240, r: 14, hp: 1, el: el ? 1 : 0 });
  m.P.hp = 6; m.P.max = 6; m.P.inv = 0; m.P.dashT = 0; m.P.dq = 0;
  // (a) one drone leak
  m.G.score = 1000; m.G.mult = 2; const M0 = L.M; L.leak(1, fe('drone', -30));
  ok(Math.abs(L.M - (M0 + 1)) < 1e-9, 'a leak drains the line by its weight');
  const n1 = H ? H.n : 0, sc1 = m.G.score, mu1 = m.G.mult;
  if (on) { ok(n1 === 1, 'leak counted'); ok(sc1 === 880, 'score penalty 120 x weight (got ' + sc1 + ')'); ok(Math.abs(mu1 - 1.8) < 1e-6, 'multiplier loses .2 (got ' + mu1 + ')'); }
  else { ok(n1 === 0 && sc1 === 1000 && mu1 === 2, 'holdline=0: no count, no score or multiplier cost'); }
  // elite
  m.G.score = 1000; m.G.mult = 2; L.M = 0; L.leak(3, fe('gunship', -30, 1));
  if (on) { ok(L.M === 3, 'elite drains its own weight (3), no extra hull risk'); ok(m.G.score === 1000 - 120 * 4, 'elite costs one weight more in score (got ' + m.G.score + ')'); }
  else ok(L.M === 3 && m.G.score === 1000, 'holdline=0: elite leaks like before');
  // (b) empty line
  L.M = 0; L.sCost = 0; m.P.hp = 6; m.P.inv = 0; const cap = L.cap(); let hp0 = m.P.hp;
  for (let i = 0; i < cap; i++) L.leak(1, fe('drone', -30));
  ok(m.P.hp === hp0 - 1, 'empty line costs exactly one hull (' + hp0 + ' -> ' + m.P.hp + ')');
  ok(L.M === L.free, 'line refills to the warning level');
  m.P.hp = 1; m.P.inv = 0; L.sCost = 0; L.M = 0; for (let i = 0; i < cap; i++) L.leak(1, fe('drone', -30)); ok(m.P.hp === 1, 'never takes the last hull on Normal');
  // (c) refund
  L.M = 3; if (H) H.barRef = 0; const r0 = H ? H.back : 0;
  m.NR.emit('kill', { e: fe('drone', 90), boss: false });
  const m1 = L.M; m.NR.emit('kill', { e: fe('drone', 80), boss: false }); const m2 = L.M;
  m.NR.emit('kill', { e: fe('drone', 700), boss: false });
  if (on) { ok(Math.abs(m1 - 2.5) < 1e-9, 'kill inside the last 140 px refunds half a weight'); ok(m2 === m1, 'second refund in the same bar is refused'); ok(L.M === m1, 'a kill far from the line refunds nothing'); m.NR.emit('bar'); m.NR.emit('kill', { e: fe('drone', 60), boss: false }); ok(Math.abs(L.M - 2) < 1e-9, 'refund works again next bar'); ok(H.back === r0 + 2, 'refunds counted'); }
  else ok(m1 === 3 && m2 === 3, 'holdline=0: no refund');
  // (e) the line draws
  let drew = true; try { for (let i = 0; i < 5; i++) { L.M = i; m.step(1 / 30); if (H) H.draw(); } } catch (e) { drew = false; }
  ok(drew, 'the line draws and the game steps without throwing');
  m.abort(); return out;
};
(async () => {
  const port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); let fails = 0, errs = 0;
  for (const q of ['', '&holdline=0']) {
    const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => { errs++; console.log('FAIL page error ' + e.message.slice(0, 160)); });
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1${q}`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { });
    console.log(q ? '-- ?holdline=0' : '-- default'); const o = await p.evaluate(T); for (const l of o) { console.log(l); if (l.startsWith('FAIL')) fails++; } await p.close();
  }
  await br.close(); srv.kill(); fails += errs;
  console.log(fails ? `FAIL holdline-test: ${fails} check(s)` : 'PASS holdline-test'); process.exit(fails ? 1 : 0);
})();
