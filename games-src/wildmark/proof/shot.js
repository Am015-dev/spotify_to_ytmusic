// usage: node proof/shot.js <out-prefix> [w h touch]  -> turn 1 + mid-game (8+ tiles) shots
const { chromium } = require('playwright');
(async () => {
  const pre = process.argv[2], w = +process.argv[3] || 402, h = +process.argv[4] || 874, touch = process.argv[5] !== '0';
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + __dirname + '/../wildmark.html'); await p.waitForTimeout(600);
  const tap = s => touch ? p.locator(s).first().tap() : p.locator(s).first().click();
  await tap('#quickB'); await tap('#goB'); await p.waitForTimeout(1500);
  await p.screenshot({ path: pre + '-turn1.png' });
  await tap('#mk .mt[data-i="0"]'); await p.waitForTimeout(600); await p.screenshot({ path: pre + '-spots.png' });
  console.log('errs', errs);
  await b.close();
})();
