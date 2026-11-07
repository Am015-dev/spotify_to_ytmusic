// Hot-seat with real taps: Quick game, 4 crew, 2 at this device; the pass screen must appear between the two humans and hide the hand;
// play one mission to a result. Phone. Usage: node hotseat-test.js <url>
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }), p = await ctx.newPage(); const errs = []; let fails = 0, passes = 0, leak = 0;
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.argv[2] + '?fast=1'); await p.waitForTimeout(400);
  const pt = async (s, i = 0) => { const bx = await p.locator(s).nth(i).boundingBox().catch(() => null); if (!bx) return false; await p.touchscreen.tap(bx.x + Math.min(10, bx.width / 2), bx.y + Math.min(25, bx.height / 2)); return true; };
  await pt('#quickB'); await pt('#segH button', 1); await pt('#segL button', 0); await pt('#startB');
  for (let i = 0; i < 1200; i++) {
    if (await p.evaluate(() => !!(G.result && UI.ended))) break;
    if (await p.locator('#pass.on').count()) { passes++; const v = await p.evaluate(() => { const r = $('#pass').getBoundingClientRect(); return r.width >= innerWidth && r.height >= innerHeight; }); if (!v) leak++; await pt('#passB'); continue; }
    if (await p.locator('.gxh-bub button:visible').count()) { await pt('.gxh-bub button'); continue; }
    if (await p.locator('#diveB:visible').count()) { await pt('#diveB'); continue; }
    if (await p.locator('#pool .tcard.legal').count()) { await pt('#pool .tcard.legal'); continue; }
    if (await p.locator('#askp.on .btn').count()) { await pt('#askp.on .btn'); continue; }
    if (await p.locator('#hand .cd.legal').count()) { const ok = await p.evaluate(() => sideToAct(G) === ME); if (!ok) leak++; await pt('#hand .cd.legal'); continue; }
    await p.waitForTimeout(60);
  }
  await p.screenshot({ path: 'shots/hot.png' }); console.log(await p.evaluate(() => render_game_to_text(G) + ' ME=' + ME + ' s=' + sideToAct(G) + ' hold=' + UI.hold + ' msg=' + $('#msg').textContent + ' pass=' + $('#pass').className));
  const r = await p.evaluate(() => ({ res: G.result, lv: UI.level, hum: UI.humans }));
  console.log('hot-seat', r.res ? 'PASS result ' + (r.res.ok ? 'won' : 'lost: ' + r.res.why) : 'FAIL no result', 'passes', passes, 'leaks', leak, 'level', r.lv, 'humans', JSON.stringify(r.hum), 'errors', errs.length, errs[0] || '');
  if (!r.res || passes < 1 || leak || errs.length) fails++;
  await b.close(); process.exit(fails ? 1 : 0);
})();
