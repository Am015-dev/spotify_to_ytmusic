// Screenshots at phone size for a quick look: node shot.js [outdir]  (title, board, after taking, card view, results)
const { chromium } = require('playwright'); const path = require('path');
const OUT = process.argv[2] || path.join(__dirname, 'proof');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(__dirname, 'meadowfold.html')); await p.waitForTimeout(600);
  await p.screenshot({ path: OUT + '/1-title.png' });
  await p.evaluate(() => { UI.setup = { mode: 'quick', ai: 'normal', side: 'A', spirits: false, np: 2 }; startFromSetup(); });
  await p.waitForTimeout(500); await p.screenshot({ path: OUT + '/2-board.png' });
  await p.tap('#central .pocket[data-pocket="0"]'); await p.waitForTimeout(300);
  await p.tap('#map .hx.glow'); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '/3-placing.png' });
  // fast-forward: computer plays both seats until near the end
  await p.evaluate(() => { UI.fast = true; G.seats[0].ai = 'normal'; G.seats[0].name = 'You'; });
  await p.evaluate(() => { while (G.turn.hand.length) act(E.moves().find(m => m.t === 'place')); act({ t: 'end' }); });
  await p.waitForTimeout(4000);
  await p.evaluate(() => { UI.fast = false; });
  await p.screenshot({ path: OUT + '/4-results.png' });
  await p.evaluate(() => { document.getElementById('rs').hidden = true; UI.view = 0; UI.tab = 'mine'; render(); });
  await p.screenshot({ path: OUT + '/5-endboard.png' });
  console.log('errors:', errs.slice(0, 5));
  await b.close();
})();
