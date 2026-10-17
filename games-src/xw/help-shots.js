// Screenshots of the help kit at 390x763: a coach bubble, the bulb's suggestion (finger + why), a rules card.   NODE_PATH=/opt/node-tools/node_modules node help-shots.js
const PW = require('/opt/node22/lib/node_modules/playwright'), path = require('path');
const OUT = path.join(__dirname, 'playtest');
(async () => {
  const b = await PW.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const p = await ctx.newPage();
  await p.goto('file://' + path.resolve(process.env.FILE || 'nebula.html') + '?phone=1'); await p.waitForSelector('[data-start]'); await p.waitForTimeout(1200);
  await p.evaluate(() => { AIDELAY = 70; localStorage.clear(); GXH.reset(); });
  const ctr = async sel => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getClientRects().length); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel);
  const tap = async sel => { for (let i = 0; i < 30; i++) { const c = await ctr(sel); if (c) { await p.touchscreen.tap(c[0], c[1]); return true; } await p.waitForTimeout(150); } throw new Error('no ' + sel); };
  const calm = async () => { for (let i = 0; i < 40; i++) { if (await p.evaluate(() => !V3.ez && !BF.wave)) break; await p.waitForTimeout(100); } await p.waitForTimeout(500); };
  await p.tap('[data-start]'); await p.waitForTimeout(1500);
  await tap('[data-bf=brief]'); await p.waitForTimeout(1200);
  await p.waitForSelector('.gxh-bub.on[data-phase=planShip]'); await p.touchscreen.tap(40, 20); await p.waitForTimeout(300);   // dismiss the first bubble
  await tap('.bfring.need'); await calm();
  await p.waitForSelector('.gxh-bub.on[data-phase=planMove]'); await calm(); await p.screenshot({ path: path.join(OUT, 'help-coach-bubble.png') });
  await p.touchscreen.tap(40, 20); await p.waitForTimeout(300);
  await tap('#bulbbtn'); await p.waitForTimeout(600); await p.waitForSelector('.gxh-finger', { state: 'attached' }); await p.waitForTimeout(700); await p.screenshot({ path: path.join(OUT, 'help-bulb-suggestion.png') });
  await tap('.gxh-bub .gxh-link'); await p.waitForSelector('.gxh-rules'); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('.gxh-rules .gxh-next').click()); await p.waitForTimeout(300); await p.screenshot({ path: path.join(OUT, 'help-rules-card.png') });
  console.log('saved', OUT); await b.close();
})();
