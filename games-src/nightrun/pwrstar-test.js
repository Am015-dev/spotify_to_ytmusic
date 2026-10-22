#!/usr/bin/env node
// PWRSTAR gate (parts/powers/abup.js power-up button, flag pwrclear): on a 390x763 phone a real CDP touch tap USES the held power-up (icon + name shown, caption first 3 times), a 0.6 s hold swaps it for dash, ?pwrclear=0 = old trade; zone hint. PASS/FAIL lines only.
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
    const S0 = () => p.evaluate(() => { for (let i = 0; i < 3; i++) window.__mnr.step(1 / 60); const b = document.getElementById('bPwr'), cp = b.querySelector('.cp'); return { hid: b.hidden, lbl: b.getAttribute('data-lbl'), cap: cp ? cp.textContent : '', capOn: b.classList.contains('cap'), use: window.__abup.stat.use, tr: window.__abup.stat.trade, bub: !!window.__mnr.G.px.chg, inv: window.__mnr.P.inv, icon: !!b.querySelector('canvas') && b.querySelector('canvas').getContext('2d').getImageData(0, 0, 96, 96).data.some((v, i) => i % 4 === 3 && v > 0), f: b.style.getPropertyValue('--f') }; });
    const s1 = await S0();
    ok('shows the held power-up name, its icon and the TAP caption (1st time)', s1.lbl === 'SHIELD' && s1.icon && s1.capOn && s1.cap === 'TAP: use SHIELD now' && +s1.f > .9, s1);
    await tap(st.x, st.y); await sleep(150);
    const a = await S0();
    ok('CDP touch tap ACTIVATES it (no trade)', a.use === s1.use + 1 && a.tr === s1.tr && !a.bub && a.hid, a);
    // caption appears the first 3 times only
    const caps = [s1.capOn];
    for (let i = 0; i < 3; i++) { await give(); await sleep(100); const q = await S0(); caps.push(q.capOn); await tap(st.x, st.y); await sleep(100); await S0(); }
    ok('caption only the first 3 times', caps.join() === 'true,true,true,false', caps);
    // long-press: swap for dash
    await give(); await p.evaluate(() => { window.ABIL.st().n = 0; });
    const l0 = await S0(); await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: st.x, y: st.y }] }); await sleep(300);
    const mid = await p.evaluate(() => { for (let i = 0; i < 3; i++) window.__mnr.step(1 / 60); const b = document.getElementById('bPwr'); return { hold: b.classList.contains('hold'), cap: b.querySelector('.cp').textContent, hf: +b.style.getPropertyValue('--hf') }; });
    await sleep(500); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(150);
    const l1 = await S0(), dash = await p.evaluate(() => window.ABIL.st().n);
    ok('hold shows a ring + HOLD caption', mid.hold && mid.hf > 0 && mid.cap === 'HOLD: swap for dash', mid);
    ok('long-press swaps for dash (not a use)', l1.tr === l0.tr + 1 && l1.use === l0.use && dash > 0 && l1.hid, { l0, l1, dash });
    // old behaviour: ?pwrclear=0 tap trades, label TRADE
    const oc = await browser.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }), o = await oc.newPage(); o.on('pageerror', e => errs.push(e.message));
    await o.goto(base + '/index.html?story=2&pwrclear=0'); await o.waitForFunction(() => window.__hub && window.__mnr && window.__abup); await sleep(900);
    const oc2 = await oc.newCDPSession(o);
    await o.evaluate(() => { const m = window.__mnr; m.startStory(3); m.simOn(true); m.god = true; m.G.en = []; m.G.eb = []; m.G.pk = []; m.G.waveT = 99; m.G.waveWait = 1; for (let i = 0; i < 20; i++) m.step(1 / 60); m.PW.give('bubble'); for (let i = 0; i < 3; i++) m.step(1 / 60); });
    const os = await o.evaluate(() => { const b = document.getElementById('bPwr'), r = b.getBoundingClientRect(); return { lbl: b.getAttribute('data-lbl'), x: r.left + r.width / 2, y: r.top + r.height / 2, tr: window.__abup.stat.trade }; });
    await oc2.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: os.x, y: os.y }] }); await sleep(60); await oc2.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(150);
    ok('?pwrclear=0 keeps the old tap = TRADE', os.lbl === 'TRADE' && await o.evaluate(() => window.__abup.stat.trade) === os.tr + 1 && await o.evaluate(() => window.__abup.stat.use) === 0, os);
    // zone hint: force a gravity well rule, the caption starts once and only once per stage
    const z = await p.evaluate(() => { const m = window.__mnr, ZH = window.ZH; if (!ZH) return { has: false }; ZH.reset(); m.G.boss = null; RU.st = { i: 1, list: [{ id: 'well', tw: 0, age: 0, o: {}, on: 0 }], card: 0 };
      for (let i = 0; i < 60 * 3; i++) m.step(1 / 60); const c1 = ZH.cap && ZH.cap.k, d1 = ZH.done.rule; for (let i = 0; i < 60 * 6; i++) m.step(1 / 60); const gone = !ZH.cap; ZH.reset(); ZH.done.rule = 0;
      for (let i = 0; i < 20; i++) m.step(1 / 60); m.render(1); return { has: true, on: ZH.on, c1, d1, gone, again: !!ZH.cap }; });
    ok('zone hint ON, shows on first purple ring, then goes', z.has && z.on && z.c1 === 'rule' && z.d1 === 1 && z.gone, z);
    ok('no page errors', errs.length === 0, errs.slice(0, 3));
  } catch (e) { fails++; console.log('FAIL crash :: ' + e.message); }
  await browser.close(); srv.kill(); process.exit(fails ? 1 : 0);
})();
