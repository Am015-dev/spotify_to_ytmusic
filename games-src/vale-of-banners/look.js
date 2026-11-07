// quick look: node look.js -> shots/<size>-<step>.png, prints errors
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const url = 'file://' + path.join(__dirname, 'vale-of-banners.html') + (process.argv[2] || '');
  for (const [nm, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }); const pg = await ctx.newPage(); const errs = [];
    pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(url); await pg.waitForTimeout(600); await pg.screenshot({ path: `shots/${nm}-title.png` });
    await pg.click('#playB'); await pg.waitForTimeout(200); await pg.click('#goB'); await pg.waitForTimeout(1200);
    await pg.screenshot({ path: `shots/${nm}-game.png` });
    console.log(nm, 'errors', errs.length, errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close();
})();
