// Quick look: title, starting hand, board (and a few real taps) at phone and PC sizes. Screens go to shots/ (git-ignored).
//   node shot.js [url]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL = process.argv[2] || 'file://' + path.join(__dirname, 'perch-and-plume.html');
(async () => {
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
  const b = await chromium.launch();
  for (const [nm, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
    await p.goto(URL); await p.waitForTimeout(800);
    await p.screenshot({ path: `shots/${nm}-1-title.png` });
    await p.click('[data-t="quick"]'); await p.waitForTimeout(300);
    await p.screenshot({ path: `shots/${nm}-2-config.png` });
    await p.click('[data-go]'); await p.waitForTimeout(500);
    await p.screenshot({ path: `shots/${nm}-3-keep.png` });
    await p.click('#keepgo'); await p.waitForTimeout(2500);
    await p.screenshot({ path: `shots/${nm}-4-board.png` });
    await p.click('.ract[data-h="0"]'); await p.waitForTimeout(600);
    await p.screenshot({ path: `shots/${nm}-5-food.png` });
    console.log(nm, errs.length ? 'ERRORS ' + errs.slice(0, 5).join(' | ') : 'no errors');
    await ctx.close();
  }
  await b.close();
})();
