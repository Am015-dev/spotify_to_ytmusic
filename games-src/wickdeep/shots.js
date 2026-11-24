// Dev screenshots at phone size: node shots.js [outdir]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const OUT = process.argv[2] || '/tmp/claude-0/shots';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + path.resolve(__dirname, 'wickdeep.html'));
  await p.waitForTimeout(600); await p.screenshot({ path: OUT + '/1-title.png' });
  await p.tap('#playbtn0'); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/2-brief.png' });
  await p.tap('#enterbtn'); await p.waitForTimeout(800); await p.screenshot({ path: OUT + '/3-select.png' });
  const cards = await p.$$('#tray .cd'); await cards[0].tap(); await (await p.$$('#tray .cd'))[3].tap(); await p.waitForTimeout(200); await p.screenshot({ path: OUT + '/4-picked.png' });
  await p.tap('#readybtn'); await p.waitForTimeout(300);
  const c2 = await p.$$('#tray .cd'); await c2[1].tap(); await (await p.$$('#tray .cd'))[4].tap(); await p.tap('#readybtn');
  await p.waitForTimeout(2500); await p.screenshot({ path: OUT + '/5-turn.png' });
  console.log(await p.evaluate(() => JSON.stringify({ ask: G.ask && G.ask.h, phase: G.phase, round: G.round })));
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
