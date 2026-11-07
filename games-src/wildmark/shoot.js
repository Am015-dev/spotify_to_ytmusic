// Dev screenshots: title, setup, a human turn (take, place, settle) at phone and PC. node shoot.js [url]
const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2] || 'file://' + __dirname + '/wildmark.html', b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(url); await p.waitForTimeout(500);
    const tap = s => touch ? p.locator(s).first().tap() : p.locator(s).first().click();
    await p.screenshot({ path: `shots/title-${name}.png` });
    await tap('#quickB'); await p.screenshot({ path: `shots/setup-${name}.png` });
    await tap('#goB'); await p.waitForTimeout(600); await p.screenshot({ path: `shots/turn-${name}.png` });
    await tap('#mk .mt[data-i="0"]'); await p.waitForTimeout(500); await p.screenshot({ path: `shots/spots-${name}.png` });
    await tap('#map .spot'); await p.waitForTimeout(200); await tap('#okB'); await p.waitForTimeout(500);
    const t = await p.locator('#map .tgt').count(); if (t) await tap('#map .tgt'); else await tap('#backB');
    await p.waitForTimeout(300); await p.screenshot({ path: `shots/after-${name}.png` });
    console.log(name, 'errors', errs.length, errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close();
})();
