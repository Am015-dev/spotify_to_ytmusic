#!/usr/bin/env node
// STAR chip gate (parts/powers/abup.js, #bPwr): (old behaviour, ?pwrclear=0; the new one is pwrstar-test.js) a tap on the star power-up chip trades the held power-up on touch and mouse, the hit box is >= 44 px, no page errors.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/star-test.js
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const SETUP = () => {
  const m = window.__mnr; m.startStory(3); m.simOn(true); m.god = true; m.G.en = []; m.G.eb = []; m.G.pk = []; m.G.waveT = 99; m.G.waveWait = 1;
  for (let i = 0; i < 5; i++) m.step(1 / 60);
  window.ABIL.st().n = 0; window.__abup.r().cd = 0; m.PW.give('stasis'); m.step(1 / 60); m.step(1 / 60);
  const b = document.getElementById('bPwr'), r = b.getBoundingClientRect(); return { hidden: b.hidden, w: r.width, h: r.height, x: r.x + r.width / 2, y: r.y + r.height / 2, top: (() => { const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return e && (e.id === 'bPwr' || !!e.closest('#bPwr')); })() };
};
const READ = () => ({ n: window.ABIL.st().n, trades: window.__abup.stat.trade, held: !!window.__abup.held(true) });
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800)); const br = await PW.chromium.launch(); let errs = 0;
  for (const [vw, vh, touch] of [[390, 763, 'touch'], [375, 553, 'touch'], [390, 763, 'mouse']]) {
    const ctx = await br.newContext({ viewport: { width: vw, height: vh }, hasTouch: true, isMobile: true }), p = await ctx.newPage(), tag = `${vw}x${vh} ${touch}`;
    p.on('pageerror', e => { if (errs++ < 3) console.log('PAGE ERROR', e.message); });
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&lessons=0&pwrclear=0`); await p.waitForFunction(() => window.__mnr && window.ABIL, null, { timeout: 10000 }).catch(() => { });
    const s = await p.evaluate(SETUP);
    line(!s.hidden && s.w >= 44 && s.h >= 44, `${tag}: star chip visible, ${Math.round(s.w)}x${Math.round(s.h)} px`);
    line(s.top, `${tag}: nothing covers the chip centre`);
    const a = await p.evaluate(READ);
    if (touch === 'touch') await p.touchscreen.tap(s.x, s.y); else await p.mouse.click(s.x, s.y);
    await p.waitForTimeout(150); const b = await p.evaluate(READ);
    line(b.trades === a.trades + 1 && b.n > a.n && !b.held, `${tag}: a tap trades the power-up (dash ${a.n} -> ${b.n}, trades ${b.trades})`);
    await ctx.close();
  }
  await br.close(); srv.kill(); line(errs === 0, `no page errors (${errs})`); process.exit(fails ? 1 : 0);
})();
