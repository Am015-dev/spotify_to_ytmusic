// Real-input smoke: from the title tap Quick game > Start, play 3 turns by tapping (pair, spot, Place, token), force the end, reach the result screen.
// Phone portrait (touch) and PC (mouse). Usage: node smoke.js [page url]   (default: the local build, ?fast=1)
const { chromium } = require('playwright');
const EXE = require('fs').existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {};
// one human turn with real taps. smart = follow the normal computer's plan (pair, spot, rotation, token), else the first legal choice
async function humanTurn(p, tap, smart) {
  await p.waitForFunction(() => window.G && !G.over && !G.seats[G.cur].ai && G.stage === 'pick' && document.querySelector('#mk .mt:not([disabled])') && document.getElementById('pass').hidden, null, { timeout: 30000 });
  const plan = smart ? await p.evaluate(() => { const g = WM.clone(G); g.seats[g.cur].acorns = 0; return WM.AI.plan(g, 'normal'); }) : null;
  await tap(plan ? `#mk .mt[data-i="${plan.pick.i}"]` : '#mk .mt:not([disabled])'); await p.waitForSelector('#map .spot');
  await tap(plan ? `#map .spot[data-c="${plan.place.c}"]` : '#map .spot'); await p.waitForSelector('#okB');
  for (let k = 0; plan && k < 6 && await p.evaluate(r => UI.ghost && UI.ghost.rot !== r && G.hold.tile.t.length > 1, plan.place.rot); k++) await tap('#rotB');
  await tap('#okB');
  await p.waitForFunction(() => G.stage === 'tok' || G.stage === 'pick');
  if (plan) { if (plan.tokC) await tap(`#map [data-c="${plan.tokC}"]`); else await tap('#backB'); }
  else if (await p.locator('#map .tgt').count()) await tap('#map .tgt'); else await tap('#backB');
}
module.exports = { humanTurn, EXE };
if (require.main === module) (async () => {
  const url = process.argv[2] || 'file://' + __dirname + '/wildmark.html?fast=1', b = await chromium.launch(EXE); let fails = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(url); await p.waitForSelector('#quickB');
    const tap = s => touch ? p.locator(s).first().tap() : p.locator(s).first().click();
    await tap('#quickB'); await tap('#goB');
    for (let r = 0; r < 3; r++) { await humanTurn(p, tap); console.log(name, 'turn', r + 1, 'ok'); }
    await p.waitForFunction(() => !G.seats[G.cur].ai && G.stage === 'pick');
    await p.evaluate(() => { WM.forceEnd(G); step(); });
    await p.waitForSelector('#againB', { timeout: 15000 }).catch(() => { });
    const done = await p.locator('#againB').count(); await p.screenshot({ path: `shots/result-${name}.png` });
    console.log(name, done ? 'PASS reached result' : 'FAIL no result', 'errors:', errs.length, errs.slice(0, 2).join(' | ')); if (!done || errs.length) fails++;
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
