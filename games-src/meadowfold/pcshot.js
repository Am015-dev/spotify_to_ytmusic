// PC proof: mid-game at 1366x768 and 1920x1080 by mouse (your valley centre, rivals left, cards right). node pcshot.js -> proof/pc-*.png
const { chromium } = require('playwright'); const path = require('path');
const OUT = path.join(__dirname, 'proof');
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1366, 768], [1920, 1080]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + path.join(__dirname, 'meadowfold.html')); await p.waitForTimeout(400);
    await p.evaluate(() => { localStorage.clear(); UI.setup = { mode: 'quick', ai: 'easy', side: 'A', spirits: false, np: 2 }; startFromSetup(); clearTimeout(UI.aiT);
      for (let t = 0; t < 10; t++) AI.plan(G.cur ? 'easy' : 'normal').forEach(m => { if (E.legal(m)) E.apply(m); }); UI.busy = false; UI.view = 0; render(); });
    await p.mouse.click(...await p.evaluate(() => { const r = document.querySelector('#central .pocket:not([disabled])').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }));
    await p.waitForTimeout(300);
    await p.mouse.click(...await p.evaluate(() => { const r = document.querySelector('#map .hx.glow .cell').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }));
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${OUT}/pc-${w}x${h}.png` });
    console.log(w, errs); await p.close();
  }
  await b.close();
})();
