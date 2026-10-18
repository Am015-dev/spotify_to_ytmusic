#!/usr/bin/env node
// phone full screen: first tap enters, works in portrait and landscape, re-enters after a rotation, MENU button toggles and is remembered, ?fs=0 = off. PASS/FAIL lines.
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let bad = 0; const ok = (n, p, i) => { if (!p) bad++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || !i ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', port, '--bind', '127.0.0.1'], { cwd: GAME_DIR, stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch();
  const fsOn = p => p.evaluate(() => !!(document.fullscreenElement || document.webkitFullscreenElement));
  for (const [name, vp] of [['portrait', { width: 390, height: 763 }], ['landscape', { width: 763, height: 390 }]]) {
    const ctx = await br.newContext({ viewport: vp, hasTouch: true, isMobile: true }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FSX); await sleep(600);
    ok(`${name}: not full screen before the first tap`, !(await fsOn(p)));
    await p.touchscreen.tap(vp.width / 2, vp.height / 2); await sleep(500);
    ok(`${name}: first tap enters full screen`, await fsOn(p));
    await p.evaluate(() => document.exitFullscreen()); await sleep(300);
    ok(`${name}: left by the system`, !(await fsOn(p)));
    await p.touchscreen.tap(vp.width / 2, vp.height / 2); await sleep(700);
    ok(`${name}: next tap re-enters`, await fsOn(p));
    await p.evaluate(() => { const b = document.getElementById('moreBtn'); b && b.click(); }); await sleep(400);
    const bt = await p.evaluate(() => { const b = document.getElementById('fsBtn'); return b ? b.textContent : null; });
    ok(`${name}: MENU has the full screen button`, !!bt && /FULL SCREEN/.test(bt), bt);
    await p.evaluate(() => document.getElementById('fsBtn').click()); await sleep(500);
    ok(`${name}: button turns full screen off and remembers`, !(await fsOn(p)) && (await p.evaluate(() => localStorage.getItem('mnr_fs'))) === '0');
    await p.touchscreen.tap(vp.width / 2, 40); await sleep(500);
    ok(`${name}: a tap does not re-enter after the player turned it off`, !(await fsOn(p)));
    ok(`${name}: no page errors`, errs.length === 0, errs[0]); await ctx.close();
  }
  const c2 = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }), p2 = await c2.newPage();
  await p2.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p2.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&fs=0`, { waitUntil: 'domcontentloaded' }); await sleep(900); await p2.touchscreen.tap(200, 300); await sleep(500);
  ok('?fs=0: no full screen, no button', !(await fsOn(p2)) && !(await p2.evaluate(() => !!window.FSX)));
  // iPhone (no Fullscreen API for pages): a card explains Add to Home Screen once, never again after DON'T SHOW AGAIN, and never on Android
  const ci = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1' }), pi = await ci.newPage();
  await pi.addInitScript(() => { try { delete Document.prototype.exitFullscreen; Object.defineProperty(Element.prototype, 'requestFullscreen', { value: undefined, configurable: true }); Object.defineProperty(Element.prototype, 'webkitRequestFullscreen', { value: undefined, configurable: true }); } catch (e) { } });
  await pi.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await pi.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`, { waitUntil: 'domcontentloaded' }); await sleep(3800);
  ok('iPhone: the Add to Home Screen card shows on the title', await pi.evaluate(() => !!document.getElementById('fsCard')));
  ok('iPhone: card buttons are at least 44 px', await pi.evaluate(() => [...document.querySelectorAll('#fsCard button')].every(b => b.getBoundingClientRect().height >= 44)));
  await pi.evaluate(() => document.getElementById('fsNo').click()); await sleep(200);
  await pi.reload({ waitUntil: 'domcontentloaded' }); await sleep(3800);
  ok("iPhone: DON'T SHOW AGAIN is remembered", !(await pi.evaluate(() => !!document.getElementById('fsCard'))));
  ok('Android phone: no card', !(await p2.evaluate(() => !!document.getElementById('fsCard'))));
  const c3 = await br.newContext({ viewport: { width: 1280, height: 720 } }), p3 = await c3.newPage();
  await p3.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p3.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`, { waitUntil: 'domcontentloaded' }); await sleep(900); await p3.mouse.click(300, 300); await sleep(500);
  ok('desktop mouse: no automatic full screen', !(await fsOn(p3)));
  await br.close(); srv.kill(); console.log(bad ? 'FAILURES' : 'ALL PASS'); process.exit(bad ? 1 : 0);
})();
