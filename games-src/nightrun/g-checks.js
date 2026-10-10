#!/usr/bin/env node
// Nightrun G checks (light): first-tap buttons + weapons / levels / checklist smoke test.
//   NODE_PATH=$(npm root -g) GAME_DIR=<folder with index.html and music/> node games-src/nightrun/g-checks.js
//   TAPS=10 per size. Taps the start button (ENDLESS) the moment it appears (and 250 ms later) at 390x763 (touch) and 1280x800 (mouse).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), TAPS = +process.env.TAPS || 10;
const sleep = ms => new Promise(r => setTimeout(r, ms)), fails = [];
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL', m); } };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const url = `http://127.0.0.1:${port}/index.html`, br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mobile/15E148 Safari/604.1';
  for (const cfg of [{ n: '390x763', w: 390, h: 763, touch: true }, { n: '1280x800', w: 1280, h: 800, touch: false }]) {
    let good = 0, double = 0;
    for (let i = 0; i < TAPS; i++) {
      const ctx = await br.newContext({ viewport: { width: cfg.w, height: cfg.h }, hasTouch: cfg.touch, isMobile: cfg.touch, userAgent: cfg.touch ? UA : undefined, deviceScaleFactor: cfg.touch ? 3 : 1 });
      const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.addInitScript(() => { window.__starts = 0; document.addEventListener('DOMContentLoaded', () => { const b = document.getElementById('startBtn'); b && b.addEventListener('click', () => window.__starts++, true); }); });
      await p.goto(url, { waitUntil: 'commit' });
      await p.waitForFunction(() => document.documentElement.classList.contains('rdy') && document.getElementById('startBtn').getClientRects().length, null, { timeout: 15000 });   // the buttons appear when the page is ready
      const bb = await p.locator('#startBtn').boundingBox(); await sleep(i % 2 ? 0 : 250);                                                                                              // tap at once, or 250 ms later
      const bb2 = await p.locator('#startBtn').boundingBox(); ok(Math.abs(bb.x - bb2.x) < 1.5 && Math.abs(bb.y - bb2.y) < 1.5, cfg.n + ' start button moved after it appeared: ' + JSON.stringify([bb, bb2]));
      if (cfg.touch) await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
      await sleep(700);
      const r = await p.evaluate(() => ({ run: window.__mnr && window.__mnr.running, hid: document.getElementById('title').hidden, starts: window.__starts }));
      if (r.run && r.hid) good++; if (r.starts > 1) double++;
      ok(!errs.length, cfg.n + ' page error ' + errs[0]); await ctx.close();
    }
    console.log(`${cfg.n}: start worked ${good}/${TAPS}, double fires ${double}`); ok(good === TAPS, `${cfg.n} start worked only ${good}/${TAPS}`); ok(!double, cfg.n + ' double fire');
  }
  // ---- weapons / levels / checklist smoke (390x763) ----
  const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, userAgent: UA }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url); await p.waitForSelector('#startBtn', { state: 'visible' }); await sleep(400);
  const clk = await p.evaluate(() => ({ n: window.__chk.items.length, left: window.__chk.left(), txt: window.__chk.text().split('\n')[0] }));
  ok(clk.n >= 15 && clk.txt === 'Mainhattan Nightrun checklist G1', 'checklist items/text ' + JSON.stringify(clk));
  const bt = await p.locator('#title .ckB').boundingBox(); await p.touchscreen.tap(bt.x + bt.width / 2, bt.y + bt.height / 2); await sleep(200);
  ok(await p.evaluate(() => !document.getElementById('nrChk').hidden), 'CHECKLIST opens from the title');
  const pb = await p.locator('#nrChk .pa').first().boundingBox(); await p.touchscreen.tap(pb.x + pb.width / 2, pb.y + pb.height / 2); await sleep(150);
  const cp1 = await p.evaluate(() => window.__chk.text().split('\n')[1]); ok(/PASS/.test(cp1), 'PASS saved: ' + cp1);
  const xb = await p.locator('#nrChk [data-c=x]').boundingBox(); await p.touchscreen.tap(xb.x + xb.width / 2, xb.y + xb.height / 2); await sleep(150);
  const wb = await p.locator('#wpBtn').boundingBox(); await p.touchscreen.tap(wb.x + wb.width / 2, wb.y + wb.height / 2); await sleep(300);
  ok(await p.evaluate(() => !document.getElementById('wpm').hidden && document.querySelectorAll('#wpL .card').length === 4), 'WEAPONS sheet from the title shows 4 cards');
  const c2 = await p.locator('#wpL .card[data-id=laser]').boundingBox(); await p.touchscreen.tap(c2.x + c2.width / 2, c2.y + c2.height / 2); await sleep(200);
  ok(await p.evaluate(() => window.__mnr && JSON.stringify(window.__wp.eq) === '["pulse","laser"]'), 'laser equipped into slot 2');
  const gb = await p.locator('#wpGo').boundingBox(); await p.touchscreen.tap(gb.x + gb.width / 2, gb.y + gb.height / 2); await sleep(200);
  const sb = await p.locator('#startBtn').boundingBox(); await p.touchscreen.tap(sb.x + sb.width / 2, sb.y + sb.height / 2); await sleep(500);
  const g = await p.evaluate(async () => {
    const m = window.__mnr; m.simOn(true); const out = {}; m.touchTo(m.P.x, m.P.y); m.step(.1);
    const kinds = new Set(); for (let i = 0; i < 90; i++) { m.step(.05); for (const b of m.G.pb) kinds.add(b.col || 'base'); }   // the ship fires itself
    out.kinds = [...kinds];
    window.__wp.lvl('laser', 3); for (let i = 0; i < 4; i++) window.__wp.gain();
    out.lv = [window.__wp.lv.pulse || 1, window.__wp.lv.laser || 1, m.P.wl];
    // power-up levels
    m.PW.give('tempo', false); m.PW.give('tempo', false); out.pwlv = m.G.pw.act.find(a => a.k === 'tempo').lv;
    // fair: a body that is still off the right edge does not hurt
    m.P.inv = 0; const hp = m.P.hp; m.G.en.push({ type: 'turret', x: 960 + 5, y: m.P.y, r: 30, hp: 99, max: 99, t: 0, flash: 0, bf: 99, bn: 0, by: m.P.y, stop: 9999 }); m.P.x = 940; m.step(.016); out.hurtOff = m.P.hp < hp;
    // hit -> 1.5 s of invulnerability
    m.G.en = []; m.P.inv = 0; const h0 = m.P.hp; m.hurt(); out.hit = [h0 - m.P.hp, m.P.inv]; m.hurt(); out.second = h0 - m.P.hp;
    return out;
  });
  console.log('smoke', JSON.stringify(g));
  ok(g.kinds.includes('#ff8ad8') && g.kinds.includes('#7dffd8'), 'pulse and lance bullets exist: ' + g.kinds);
  ok(g.lv[0] === 2 && g.lv[1] === 3 && g.lv[2] === 3, 'weapon XP levels the weaker one: ' + g.lv);
  ok(g.pwlv === 2, 'second tempo pickup is LV2: ' + g.pwlv);
  ok(!g.hurtOff, 'off-screen body hurt the ship'); ok(g.hit[0] === 1 && g.hit[1] >= 1.4 && g.second === 1, 'hit gives >=1.4 s invulnerability: ' + g.hit + ' ' + g.second);
  ok(!errs.length, 'page error ' + errs[0]);
  await br.close(); srv.kill(); console.log(fails.length ? 'G CHECKS FAILED: ' + fails.length : 'G CHECKS OK'); process.exit(fails.length ? 1 : 0);
})();
