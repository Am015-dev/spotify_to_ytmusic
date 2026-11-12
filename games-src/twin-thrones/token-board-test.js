// Real game, real touch: build a green card that makes a science pair (tap card -> Build), then take the progress token by
// tapping the BOARD token row: the tokens glow, the first tap arms (Tap again), the second takes it. TW/TH env (default 375x667).
const { chromium } = require('playwright');
(async () => {
  const W = +(process.env.TW || 375), H = +(process.env.TH || 667), b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + require('path').resolve(process.argv[2] || 'twin-thrones.html') + '?seed=11'); await pg.waitForTimeout(600);
  const tap = async s => { const r = await pg.locator(s).first().boundingBox(); await pg.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await pg.waitForTimeout(400); };
  await tap('[data-start="1"]'); await tap('[data-goalgo]');
  await pg.evaluate(() => { window.AIDELAY = 0; TT_TEST.toPlay(0); }); await pg.waitForTimeout(800);
  // give seat 0 one green card whose symbol matches an available green card, and the coins to build it
  const target = await pg.evaluate(() => {
    const U = TT_TEST.U, E = TT_TEST.E, G = U.G, BY = TT_UI.BY;
    const av = E.available(G).find(c => BY[c.id].sci && BY[c.id].sci !== 'law');
    let cell = av; if (!cell) { cell = E.available(G)[0]; const g = Object.keys(BY).find(k => BY[k].sci === 'wheel' && BY[k].col === 'green' && !G.pyr.some(c => c.id === k)); cell.id = g; cell.up = true; }
    const sym = BY[cell.id].sci, twin = Object.keys(BY).find(k => k !== cell.id && BY[k].col === 'green' && BY[k].sci === sym && !G.pyr.some(c => c.id === k));
    G.players[0].cards.push(twin); G.players[0].coins = 30; TT_UI.render(); return cell.i;
  });
  await pg.waitForTimeout(300);
  await tap('#c' + target); await tap('#zoom [data-a="build"]');
  for (let k = 0; k < 60 && !(await pg.evaluate(() => TT_TEST.U.G.pend[0] && TT_TEST.U.G.pend[0].type === 'token' && TT_UI.canAct())); k++) await pg.waitForTimeout(150);
  await pg.waitForTimeout(300);
  const glow = await pg.locator('.tokrow .tok.pickable').count(), sheet = await pg.evaluate(() => document.querySelector('.gx-app').classList.contains('ttsheet'));
  const t0 = await pg.locator('.tokrow .tok.pickable').first().getAttribute('data-tok');
  await tap('.tokrow .tok.pickable >> nth=0');
  const armed = await pg.evaluate(() => TT_TEST.U.tokArm), armCls = await pg.locator('.tokrow .tok.arm').count(), dockArm = await pg.locator('.picker .tk.arm').count(), stillPend = await pg.evaluate(() => TT_TEST.U.G.pend.length);
  if (process.env.SHOT) await pg.screenshot({ path: process.env.SHOT });
  await tap('.tokrow .tok[data-tok="' + t0 + '"]'); await pg.waitForTimeout(600);
  const mine = await pg.evaluate(t => TT_TEST.U.G.players[0].tokens.includes(t), t0), sheetAfter = await pg.evaluate(() => document.querySelector('.gx-app').classList.contains('ttsheet'));
  const ok = glow >= 3 && sheet && armed === t0 && armCls === 1 && dockArm === 1 && stillPend > 0 && mine && !sheetAfter && !errs.length;
  console.log((ok ? 'PASS' : 'FAIL') + ' token-board ' + W + 'x' + H, JSON.stringify({ glow, sheet, armed, armCls, dockArm, mine, sheetAfter, errs }));
  await b.close(); process.exit(ok ? 0 : 1);
})();
