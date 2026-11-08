/* R9 point 5: a card is played by dragging it up out of the hand (touch on a 390x844 phone, mouse on 1440x900), and a tap still works.
   Usage: node drag-test.js */
const path = require('path'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html') }), b = await chromium.launch(); let bad = 0;
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) bad++; };
  for (const [n, vp, t] of [['phone', { width: 390, height: 844 }, true], ['pc', { width: 1440, height: 900 }, false]]) {
    const c = await b.newContext({ viewport: vp, hasTouch: t, isMobile: t }), p = await c.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    await p.goto(url + (url.includes('?') ? '&' : '?') + 'scn=rr-play', { waitUntil: 'load' }); await p.waitForTimeout(1500);
    await p.evaluate(() => { const g = document.querySelector('.gb[data-g="2"]:not([disabled])'); if (g) g.click(); });
    await p.waitForTimeout(200);
    const box = async () => { const el = await p.$('#hand .cd.glow'); return el && el.boundingBox(); };
    // drag the first glowing card up 160 px
    let bb = await box(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    if (t) {   // touch drag through CDP (Playwright has no touchscreen.drag)
      const s = await c.newCDPSession(p), pt = (yy) => [{ x, y: yy }];
      await s.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(y) });
      for (let k = 1; k <= 8; k++) { await s.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(y - k * 20) }); if (k === 4) { const z = await p.evaluate(() => [document.querySelector('#hand').classList.contains('dropz'), !!document.querySelector('.cd.lift')]); ok(z[0] && z[1], n + ' card lifts and the drop zone glows while dragging'); } }
      await s.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await p.mouse.move(x, y); await p.mouse.down(); for (let k = 1; k <= 8; k++) { await p.mouse.move(x, y - k * 20); if (k === 4) { const z = await p.evaluate(() => [document.querySelector('#hand').classList.contains('dropz'), !!document.querySelector('.cd.lift')]); ok(z[0] && z[1], n + ' card lifts and the drop zone glows while dragging'); } } await p.mouse.up();
    }
    await p.waitForTimeout(300);
    ok(await p.evaluate(() => UI.sel.length === 1 && !!document.querySelector('#hand .cd.sel')), n + ' drag up plays the card (snaps into the played row)');
    // a tap on another card still works
    bb = await box(); if (t) await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await p.waitForTimeout(300);
    ok(await p.evaluate(() => UI.sel.length === 2), n + ' tap still plays a card');
    // a short drag that ends in the hand does not play
    await p.evaluate(() => { UI.sel = []; drawPlan(); }); await p.waitForTimeout(150); bb = await box();
    if (!t) { await p.mouse.move(bb.x + 20, bb.y + 20); await p.mouse.down(); await p.mouse.move(bb.x + 60, bb.y + 24, { steps: 4 }); await p.mouse.up(); await p.waitForTimeout(200); ok(await p.evaluate(() => UI.sel.length === 0), n + ' sideways drag inside the hand plays nothing'); }
    ok(!errs.length, n + ' 0 page errors ' + (errs[0] || '')); await c.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
