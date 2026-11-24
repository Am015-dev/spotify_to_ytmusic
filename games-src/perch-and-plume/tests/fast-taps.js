// Regression for the R106 stopper (random touch play "stuck on dead taps"): a tap on a DIFFERENT glowing target that lands
// less than 250 ms after the prompt changed must still count. Only a repeat tap on the same spot (a double tap) may be dropped.
//   node tests/fast-taps.js [url]   (375x667 touch)
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://127.0.0.1:8765/perch-and-plume/';
(async () => {
  const b = await chromium.launch(); let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('gns-prefs', JSON.stringify({ ai: 'fast' })); localStorage.setItem('pp-played', '1'); localStorage.setItem('pp-hints', '0'); } catch (e) { } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(800);
  for (const s of ['[data-t="quick"]', '[data-go]', '#keepgo']) { await p.locator(s).first().waitFor({ timeout: 10000 }); await p.locator(s).first().tap(); await p.waitForTimeout(500); }
  const ready = () => p.waitForFunction(() => myTurn() && !UI.busy && !G.q && !document.querySelector('.turnban,.reveal'), null, { timeout: 20000 });
  const tapSel = async sel => { if (sel === '.die[data-legal]') { await p.waitForSelector('.die[data-legal],#acts [data-a="mv"]', { timeout: 4000 }).catch(() => { }); if (!(await p.locator(sel).count())) sel = '#acts [data-a="mv"]'; } const bx = await p.locator(sel).first().boundingBox(); await p.touchscreen.tap(bx.x + bx.width / 2, bx.y + Math.min(bx.height / 2, 20)); };
  for (let round = 0; round < 6; round++) {   // draw birds -> tray card, 90 ms apart; then get food -> die, 90 ms apart
    await ready(); const h0 = await p.evaluate(() => G.pl[0].hand.length);
    await p.evaluate(() => document.querySelector('.ract[data-h="2"]').scrollIntoView({ block: 'nearest' })); await tapSel('.ract[data-h="2"]');
    await p.waitForFunction(() => G.q && G.q.h === 'draw', null, { timeout: 5000 }); await p.waitForTimeout(90);
    await tapSel('#tray [data-legal]');
    const took = await p.waitForFunction(h => G.pl[0].hand.length > h || !G.q, h0, { timeout: 1500 }).then(() => true).catch(() => false);
    ok(took, 'round ' + (round + 1) + ': a tray card tapped 90 ms after "Draw birds" is taken (not a dead tap)');
    await ready(); const f0 = await p.evaluate(() => G.pl[0].cubes);
    await tapSel('.ract[data-h="0"]');
    await p.waitForFunction(() => G.q && G.q.h === 'die', null, { timeout: 5000 }).catch(() => { }); await p.waitForTimeout(90);
    if (await p.evaluate(() => G.q && G.q.h === 'die')) { await tapSel('.die[data-legal]'); ok(await p.waitForFunction(() => !G.q || G.q.h !== 'die' || G.feeder.filter(Boolean).length < 5, null, { timeout: 1500 }).then(() => true).catch(() => false), 'round ' + (round + 1) + ': a die tapped 90 ms after "Get food" is taken'); }
    while (await p.evaluate(() => myTurn() && G.q)) { const hb = await p.evaluate(() => G.q.h); if (hb === 'die') await tapSel('.die[data-legal]'); else if (hb === 'draw') await tapSel('#deckb'); else if (hb === 'egg') await tapSel('.bc[data-a="bird"][data-legal]'); else await tapSel('#acts .btn'); await p.waitForTimeout(250); }
  }
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2).join(' | '));
  await b.close(); process.exit(fails ? 1 : 0);
})();
