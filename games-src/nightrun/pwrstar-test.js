#!/usr/bin/env node
// PWRSTAR gate (parts/abup.js power-up slot star button): real CDP touch tap on a 390x763 phone works, has a label + ready/cooldown state, zone hint. PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/pwrstar-test.js
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (n, p, i) => { if (!p) fails++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + JSON.stringify(i))); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800); const base = 'http://127.0.0.1:' + port;
  const browser = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(() => PW.chromium.launch());
  const errs = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(base + '/index.html?story=2'); await p.waitForFunction(() => window.__hub && window.__mnr && window.__abup && document.getElementById('playBtn')); await sleep(900);
    const c = await ctx.newCDPSession(p);
    const tap = async (x, y) => { await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await sleep(60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    await p.evaluate(() => { const m = window.__mnr; m.startStory(3); m.simOn(true); m.god = true; m.G.en = []; m.G.eb = []; m.G.pk = []; m.G.waveT = 99; m.G.waveWait = 1; for (let i = 0; i < 20; i++) m.step(1 / 60); });
    const give = () => p.evaluate(() => { const m = window.__mnr; m.PW.give('bubble'); for (let i = 0; i < 3; i++) m.step(1 / 60); });
    ok('slot hidden with nothing held', await p.evaluate(() => document.getElementById('bPwr').hidden || getComputedStyle(document.getElementById('bPwr')).display === 'none'));
    await give();
    const st = await p.evaluate(() => { const b = document.getElementById('bPwr'), r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, t = document.elementFromPoint(x, y); return { hid: b.hidden, x, y, w: r.width, h: r.height, top: t && (t.id || t.tagName), label: b.getAttribute('data-lbl'), ready: b.classList.contains('rdy'), tr: window.__abup.stat.trade, touchUI: document.documentElement.classList.contains('touch') }; });
    ok('slot visible, 44px+, nothing covers it', !st.hid && st.w >= 44 && /bPwr|svg|path/.test(st.top), st);
    ok('has a text label and ready state', st.label === 'TRADE' && st.ready, st);
    await tap(st.x, st.y); await sleep(150);
    const a = await p.evaluate(() => { const b = document.getElementById('bPwr'); return { tr: window.__abup.stat.trade, lbl: b.getAttribute('data-lbl'), cd: b.classList.contains('cd'), ready: b.classList.contains('rdy') }; });
    ok('CDP touch tap trades the power-up', a.tr === st.tr + 1, a);
    await give(); await p.evaluate(() => { for (let i = 0; i < 3; i++) window.__mnr.step(1 / 60); });
    const b = await p.evaluate(() => { const b = document.getElementById('bPwr'); return { lbl: b.getAttribute('data-lbl'), cd: b.classList.contains('cd'), ready: b.classList.contains('rdy') }; });
    ok('cooldown state shows seconds, not ready', b.cd && !b.ready && /^\d+s$/.test(b.lbl || ''), b);
    // zone hint: force a gravity well rule, the caption starts once and only once per stage
    const z = await p.evaluate(() => { const m = window.__mnr, ZH = window.ZH; if (!ZH) return { has: false }; ZH.reset(); m.G.boss = null; RU.st = { i: 1, list: [{ id: 'well', tw: 0, age: 0, o: {}, on: 0 }], card: 0 };
      for (let i = 0; i < 60 * 3; i++) m.step(1 / 60); const c1 = ZH.cap && ZH.cap.k, d1 = ZH.done.rule; for (let i = 0; i < 60 * 6; i++) m.step(1 / 60); const gone = !ZH.cap; ZH.reset(); ZH.done.rule = 0;
      for (let i = 0; i < 20; i++) m.step(1 / 60); m.render(1); return { has: true, on: ZH.on, c1, d1, gone, again: !!ZH.cap }; });
    ok('zone hint ON, shows on first purple ring, then goes', z.has && z.on && z.c1 === 'rule' && z.d1 === 1 && z.gone, z);
    const off = await browser.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }), q = await off.newPage();
    await q.goto(base + '/index.html?zonehint=0'); await q.waitForFunction(() => window.__mnr); ok('?zonehint=0 turns it off', await q.evaluate(() => !window.ZH || !ZH.on));
    ok('no page errors', errs.length === 0, errs.slice(0, 3));
  } catch (e) { fails++; console.log('FAIL crash :: ' + e.message); }
  await browser.close(); srv.kill(); process.exit(fails ? 1 : 0);
})();
