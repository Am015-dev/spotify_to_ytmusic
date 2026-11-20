// Screenshot of a monster turn (its ability card in the dock) at 375x667: node monster-shot.js out.png
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage();
  await p.goto('file://' + path.resolve(__dirname, 'wickdeep.html')); await p.waitForTimeout(500);
  await p.evaluate(() => { CAMP = WDC.newCamp(['warden', 'ringer'], 0); WDUI.startScenario(2, { seed: 21 }); });
  await p.waitForTimeout(500);
  for (let i = 0; i < 600; i++) {
    const got = await p.evaluate(() => !!document.querySelector('.mcardv'));
    if (got) { await p.waitForTimeout(250); await p.screenshot({ path: process.argv[2] || 'monster.png' }); console.log('ok'); break; }
    await p.evaluate(() => { if (!UI.busy && G.ask) WDUI.doMove(WDAI.choose(G)); });
    await p.waitForTimeout(60);
  }
  await b.close();
})();
