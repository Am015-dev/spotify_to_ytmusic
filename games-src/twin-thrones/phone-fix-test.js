// Phone check: board-tap token pick (arm + confirm), no hidden dock overflow, disabled Build explains itself. TW/TH env.
const { chromium } = require('playwright');
(async () => {
  const W = +(process.env.TW || 390), H = +(process.env.TH || 844), b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + require('path').resolve(process.argv[2] || 'twin-thrones.html') + '?seed=11'); await pg.waitForTimeout(600);
  const tap = async s => { const r = await pg.locator(s).first().boundingBox(); await pg.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await pg.waitForTimeout(350); };
  await tap('[data-start="1"]'); await tap('[data-goalgo]');
  await pg.evaluate(() => { window.AIDELAY = 0; TT_TEST.toPlay(0); }); await pg.waitForTimeout(600);
  for (let k = 0; k < 40 && !(await pg.evaluate(() => !TT_TEST.U.narr && !TT_TEST.U.busy)); k++) await pg.waitForTimeout(150);
  // too costly: zero coins, pick a card that costs coins
  const costly = await pg.evaluate(() => { const G = TT_TEST.U.G; G.players[0].coins = 0; TT_TEST.U.sel = null; const M = TT_TEST.E.validMoves(G); const av = G.pyr.filter(c => c.avail || c.av); return 1; });
  const cards = await pg.locator('#pyr .card.av').count(); let why = 'n/a';
  for (let i = 0; i < cards; i++) { await pg.evaluate(() => TT_TEST.U.sel != null && TT_TEST.U.G && 0); await tap('#pyr .card.av >> nth=' + i); const off = await pg.locator('#zoom [data-a="build"][aria-disabled="true"]').count(); if (off) { await tap('#zoom [data-a="build"]'); why = await pg.locator('#toast').innerText(); break; } await pg.evaluate(() => document.querySelector('#zoom').dispatchEvent(new Event('click', { bubbles: true }))); await pg.waitForTimeout(200); }
  // token pick
  await pg.evaluate(() => { const G = TT_TEST.U.G; TT_TEST.U.sel = null; G.pend.unshift({ type: 'token', pl: 0, from: 'up' }); });
  await pg.evaluate(() => { try { TT_UI.render(); } catch (e) { } }); await pg.waitForTimeout(300);
  const info = await pg.evaluate(() => { const r = [...document.querySelectorAll('.picker .tk')].map(e => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right), Math.round(b.bottom)]; }); const pk = document.querySelector('.picker'); const pr = pk.getBoundingClientRect(); return { n: r.length, r, pb: Math.round(pr.bottom), vs: pk.scrollHeight > pk.clientHeight + 1, sw: pk && pk.scrollWidth > pk.clientWidth + 1, W: innerWidth, H: innerHeight }; });
  const t0 = await pg.evaluate(() => TT_TEST.U.G.tokensUp[0]);
  await tap('#tokens [data-tok], .tok[data-tok] >> nth=0'); const armed = await pg.evaluate(() => TT_TEST.U.tokArm); const pend1 = await pg.evaluate(() => TT_TEST.U.G.pend.length);
  await pg.screenshot({path: process.env.SHOT || '/tmp/claude-0/s.png'}); await tap('.tok[data-tok] >> nth=0'); await pg.waitForTimeout(500);
  const mine = await pg.evaluate(t => TT_TEST.U.G.players[0].tokens.includes(t), t0);
  await pg.evaluate(() => { TT_UI.U.tokArm = null; }); const ok = info.n >= 3 && !info.sw && info.pb <= H && !info.vs && info.r.every(x => x[0] >= 0 && x[1] <= W) && armed === t0 && pend1 > 0 && mine && /afford|need|coin|cost/i.test(why) && !errs.length;
  console.log((ok ? 'PASS' : 'FAIL') + ' phone-fix ' + W + 'x' + H, JSON.stringify({ info, armed, mine, why, errs }));
  await b.close(); process.exit(ok ? 0 : 1);
})();
