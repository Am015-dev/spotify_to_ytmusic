// W662 HUD test: every window opens and closes by tap (X) and by a tap outside; the turn-order window opens by itself on your bid and
// closes after you bid; then a whole game is played through the HUD at machine speed (turbo). Phone 402x874 and PC 1366x768.
// usage: NODE_PATH=$(npm root -g) node games-src/ft/hud-test.js [base=http://localhost:8779]
const { turbo, tick, budget } = require('../scripts/turbo'); const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8779';
(async () => {
  const b = await chromium.launch({ executablePath: require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }); let fail = 0;
  for (const [mode, vp] of [['phone', { width: 402, height: 874 }], ['pc', { width: 1366, height: 768 }]]) {
    const t0 = Date.now(), stop = budget(60000, 'hud-test ' + mode), mob = mode === 'phone';
    const c = await b.newContext({ viewport: vp, hasTouch: mob, isMobile: mob, serviceWorkers: 'block' }); await turbo(c);
    const p = await c.newPage(); p.setDefaultTimeout(3000); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120) + (process.env.DBG ? ' @ ' + String(e.stack).split('\n').slice(1, 3).join(' ') : '')));
    const ok = (cond, msg) => { if (!cond) { fail++; console.log('FAIL ' + mode + ': ' + msg); } };
    const settle = async () => { await tick(p, 300); await p.waitForTimeout(30); };
    await p.goto(BASE + '/sands-of-qamar/?scn=sq-board'); await p.waitForFunction(() => typeof G !== 'undefined' && G && G.phase === 'bid' && !UI.modal, null, { timeout: 20000 }); await settle();
    ok(await p.evaluate(() => GX.open === 'bidd'), 'turn-order window opens by itself on your bid');
    await p.click('#bidd .gx-x'); await settle(); ok(await p.evaluate(() => !GX.open), 'turn-order X closes');
    // every window from the bar (or the menu): open by tap, close by X; open again, close by a tap outside
    const wins = ['plrd', 'djd', 'mktd', 'logd', 'rulesd', 'menud', 'refd'];
    for (const id of wins) {
      const open = async () => { const bar = await p.$(`.gx-bar [data-gx="${id}"]`); if (bar && await bar.isVisible()) await bar.click(); else { await p.click('.gx-bar [data-gx="menud"]'); await settle(); await p.click(`#menud [data-gx="${id}"]`); } await settle(); };
      await open(); ok(await p.evaluate(i => GX.open === i, id), id + ' opens by tap');
      const x = await p.$(`#${id} .gx-x`); const r = await x.boundingBox(); ok(r.width >= 44 && r.height >= 44, id + ' X >= 44 px (' + Math.round(r.width) + ')');
      await x.click(); await settle(); ok(await p.evaluate(() => !GX.open), id + ' closes by X');
      await open(); await p.mouse.click(mob ? 200 : 20, mob ? 30 : 400); await settle(); ok(await p.evaluate(() => !GX.open), id + ' closes by tap outside');
    }
    // bid through the window (open from the dock), it closes itself after the bid
    await p.click('#acts [data-gx="bidd"]'); await settle(); await p.click('#bidt .sp-b.glow'); await settle();
    ok(await p.evaluate(() => GX.open !== 'bidd' || (G.phase === 'bid' && !!me())), 'turn-order window closes after the bid');
    // the whole game through the HUD: bids by tapping spots, goods and djinns through the dock's window, the rest by the dock and the board
    let taps = 0, guard = 0, picks = 0;
    while (guard++ < 4000) {
      const s = await p.evaluate(() => G.over ? 'over' : !me() ? 'wait' : UI.modal ? 'modal' : G.phase === 'bid' ? 'bid' : (UI.pickMk.length || UI.pickDj.length) ? 'pick' : 'act');
      if (s === 'over') break; if (process.env.DBG && guard % 30 === 0) console.log(guard, s, await p.evaluate(() => [JSON.stringify(UI.pickDj), document.querySelectorAll('#djrow .glow').length, JSON.stringify(aiMove(G.cur)), JSON.stringify(validMoves(G.cur).slice(0,3)), G.round, G.phase, G.step, G.cur, GX.open, !!aiTimer, UI.modal].join(' ')), ((Date.now() - t0) / 1000).toFixed(1));
      if (s === 'wait') { await tick(p, 400); continue; }
      if (s === 'modal') { await p.evaluate(() => { UI.modal = null; render(); schedule(); }); continue; }
      if (s === 'bid') { if (!(await p.evaluate(() => GX.open === 'bidd'))) { await p.click('#acts [data-gx="bidd"]'); await settle(); } await p.click('#bidt .sp-b.glow, #bidt .sp-b'); taps++; await settle(); continue; }
      if (s === 'pick') { const pay = await p.$('#acts .arow.djpay .ab'); if (pay) { await pay.click(); taps++; picks++; await settle(); continue; } const btn = await p.$('#acts .arow.pick .ab'); if (btn) { if (!(await p.evaluate(() => GX.open === 'mktd' || GX.open === 'djd'))) { await btn.click(); await settle(); } const w = await p.evaluate(() => GX.open); const g = await p.$(`#${w} .glow:not(.sel)`); if (g) { await g.click(); taps++; picks++; await settle(); continue; } } }
      await p.evaluate(() => { if (GX.open && GX.open !== HUD.pin) GX.close(); const m = aiMove(G.cur); if (m) go(m); }); await tick(p, 200);
    }
    const res = await p.evaluate(() => ({ over: !!G.over, round: G.round, scores: G.pl.map(q => shownTotal(q)) }));
    ok(res.over, 'game reached the end'); ok(!errs.length, 'JS errors: ' + errs.join(' | '));
    console.log(`${mode}: game over=${res.over} rounds=${res.round} scores=${res.scores.join('/')} bid taps+picks=${taps} (window picks ${picks}) errors=${errs.length} real=${((Date.now() - t0) / 1000).toFixed(1)}s`);
    stop(); await c.close();
  }
  await b.close(); console.log(fail ? fail + ' FAILED' : 'ALL PASS'); process.exit(fail ? 1 : 0);
})();
