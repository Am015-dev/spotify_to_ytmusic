// Real touch at 390x844 (owner verdict 8 Nov): tap card -> Sell, then a touch DRAG onto the drop tray. node touch-test.js [html in games/twin-thrones/] [shotdir]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + require('path').resolve(process.argv[2] || require('path').join(__dirname, '..', '..', 'games', 'twin-thrones', 'index.html')) + '?seed=11'); await pg.waitForTimeout(600);
  const tapSel = async s => { const r = await pg.locator(s).first().boundingBox(); await pg.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); };
  await tapSel('[data-start="1"]'); await pg.waitForTimeout(400);
  const goal = await pg.locator('#peek:not([hidden]) [data-goalgo]').count(); await tapSel('[data-goalgo]'); await pg.waitForTimeout(400);
  await pg.evaluate(() => { window.AIDELAY = 0; TT_TEST.toPlay(0); });
  await pg.waitForTimeout(500);
  const ready = () => pg.evaluate(() => !TT_TEST.U.busy && TT_TEST.E.sideToAct(TT_TEST.U.G) === 0 && !TT_TEST.U.G.pend.length);
  for (let k = 0; k < 60 && !(await pg.evaluate(() => !TT_TEST.U.narr && !TT_TEST.U.busy)); k++) await pg.waitForTimeout(150);
  // tap path
  const n0 = await pg.evaluate(() => TT_TEST.U.G.log.length);
  const av = await pg.locator('#pyr .card.av').first().boundingBox();
  await pg.touchscreen.tap(av.x + av.width / 2, av.y + av.height / 2); await pg.waitForTimeout(300);
  const zoom = await pg.locator('#zoom:not([hidden])').count();
  await tapSel('#zoom [data-a="discard"]'); await pg.waitForTimeout(1500);
  const n1 = await pg.evaluate(() => TT_TEST.U.G.log.length);
  for (let k = 0; k < 40 && !(await ready()); k++) await pg.waitForTimeout(150);
  // touch drag via CDP
  const cdp = await ctx.newCDPSession(pg); const c = await pg.locator('#pyr .card.av').first().boundingBox();
  const sx = c.x + c.width / 2, sy = c.y + c.height / 2;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy }] });
  for (let k = 1; k <= 6; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx, y: sy + k * 15 }] }); await pg.waitForTimeout(30); }
  await pg.waitForTimeout(200); const tray = await pg.locator('#tray').count();
  const sell = await pg.locator('#tray .dz').nth(1).boundingBox();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sell.x + sell.width / 2, y: sell.y + sell.height / 2 }] }); await pg.waitForTimeout(150);
  await pg.screenshot({ path: (process.argv[3] || '/tmp') + '/drag.png' });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await pg.waitForTimeout(1500);
  const n2 = await pg.evaluate(() => TT_TEST.U.G.log.length);
  const ok = goal === 1 && zoom === 1 && n1 > n0 && tray === 1 && n2 > n1 && !errs.length;
  console.log((ok ? 'PASS' : 'FAIL') + ' touch 390x844 goalCard=' + goal + ' tapZoom=' + zoom + ' tapMove=' + (n1 > n0) + ' dragTray=' + tray + ' dragMove=' + (n2 > n1) + ' errors=' + errs.length + ' ' + errs.slice(0, 2).join('|'));
  await b.close();
})();
