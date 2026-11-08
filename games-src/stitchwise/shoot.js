// Quick look: node shoot.js [WxH] [out-prefix]  (loads stitchwise.html, starts a quick game, shots in shots/)
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
(async () => {
  const [w, h] = (process.argv[2] || '390x763').split('x').map(Number), pre = process.argv[3] || 'p'; fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 900, isMobile: w < 900, deviceScaleFactor: 1 }); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto('file://' + path.join(__dirname, 'stitchwise.html')); await pg.waitForTimeout(600); await pg.screenshot({ path: path.join(__dirname, 'shots', pre + '-title.png') });
  await pg.click('[data-a=start]'); await pg.waitForTimeout(200); await pg.screenshot({ path: path.join(__dirname, 'shots', pre + '-setup.png') });
  await pg.click('text=Start the game'); await pg.waitForTimeout(1200); await pg.screenshot({ path: path.join(__dirname, 'shots', pre + '-game.png') });
  await pg.waitForFunction(() => !UI.busy && isHuman(swWho(G)), null, { timeout: 15000 }); await pg.evaluate(() => { G.btn[0] = 30; render(); }); await pg.click('#offers .offer >> nth=1'); await pg.waitForTimeout(300); await pg.screenshot({ path: path.join(__dirname, 'shots', pre + '-place.png') });
  console.log('errors', JSON.stringify(errs)); await b.close();
})();
