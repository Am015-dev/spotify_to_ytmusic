// hot-seat: 2 people on one device -> pass screens, each keeps a hand, turns alternate, hands stay hidden behind the pass screen
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('gns-prefs', JSON.stringify({ anim: 'fast', ai: 'fast' })); localStorage.setItem('gxh-perch-and-plume', '{"on":false,"seen":{}}'); } catch (e) { } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.argv[2] || 'file://' + require('path').join(__dirname, 'perch-and-plume.html')); await p.waitForTimeout(500);
  await p.tap('[data-t="quick"]'); await p.tap('[data-n="2"]'); await p.tap('[data-k="1:human"]'); await p.tap('[data-go]'); await p.waitForTimeout(400);
  const keep1 = await p.isVisible('#keepgo'); await p.tap('#keepgo'); await p.waitForTimeout(400);
  const pass1 = await p.isVisible('#passgo'); const handHidden = await p.evaluate(() => !document.getElementById('pass').hidden);
  await p.tap('#passgo'); await p.waitForTimeout(300); await p.tap('#keepgo'); await p.waitForTimeout(500);
  const pass2 = await p.isVisible('#passgo'); if (pass2) await p.tap('#passgo'); await p.waitForTimeout(300);
  // player 1 draws cards (wetland) then passes to player 2
  const v0 = await p.evaluate(() => UI.view);
  await p.tap('.ract[data-h="2"]'); await p.waitForTimeout(400);
  for (let k = 0; k < 6; k++) { const q = await p.evaluate(() => G.q && G.q.h); if (q === 'draw') await p.tap('#deckb'); else if (q) await p.tap('#acts .btn'); else break; await p.waitForTimeout(300); }
  await p.waitForTimeout(600);
  const pass3 = await p.isVisible('#passgo'); if (pass3) await p.tap('#passgo'); await p.waitForTimeout(300);
  const v1 = await p.evaluate(() => UI.view), cur = await p.evaluate(() => PP.sideToAct(G));
  const ok = keep1 && pass1 && handHidden && pass3 && v0 !== v1 && cur === v1 && !errs.length;
  console.log((ok ? 'PASS' : 'FAIL') + ' hot-seat: pass screens ' + [pass1, pass2, pass3] + ', view ' + v0 + '->' + v1 + ', to act ' + cur + ', errors ' + errs.length);
  await b.close(); process.exit(ok ? 0 : 1);
})();
