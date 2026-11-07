// Hot-seat (2 players + 1 rival, pass screens), a boss chapter's twist, solo, and a screenshot of the scoring pop (bear pair lights up). Phone + PC.
const { chromium } = require('playwright'); const { humanTurn, EXE } = require('./smoke.js');
const URL = 'file://' + __dirname + '/wildmark.html';
(async () => {
  const b = await chromium.launch(EXE); let fails = 0; const ok = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) fails++; };
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    const tap = s => touch ? p.locator(s).first().tap() : p.locator(s).first().click();
    await p.goto(URL + '?fast=1'); await tap('#quickB'); await tap('.seg[data-k="humans"] .sg[data-v="2"]'); await tap('.seg[data-k="opp"] .sg[data-v="1"]'); await tap('#goB');
    for (let t = 0; t < 6; t++) { await p.waitForFunction(() => !document.getElementById('pass').hidden || (G.seats[G.cur].ai === null && G.stage === 'pick'), null, { timeout: 20000 }); if (await p.locator('#passB').isVisible()) { if (t === 1) await p.screenshot({ path: `shots/pass-${name}.png` }); await tap('#passB'); } const who = await p.evaluate(() => G.cur); await humanTurn(p, tap); ok(await p.evaluate(w => G.seats[w].done >= 1, who), name + ' hot-seat turn by seat ' + who); }
    ok(await p.evaluate(() => G.seats[0].done === 3 && G.seats[1].done === 3), name + ' hot-seat both humans played 3 turns');
    // boss twist
    const tw = await p.evaluate(() => { UI.fast = true; campStart(CAMPAIGN.chapters[2]); return [G.seats[1].acorns, G.seats[1].name, UI.mode]; });
    ok(tw[0] === 2 && tw[1] === 'Bram Hollowell' && tw[2] === 'camp', name + ' boss c3 twist: rival acorns ' + tw.join(','));
    const ss = await p.evaluate(() => { campStart(CAMPAIGN.chapters[6]); return [G.turns, G.np, G.supply.length]; });
    ok(ss[0] === 16 && ss[1] === 1, name + ' c7 short season ' + ss.join(','));
    const ns = await p.evaluate(() => { campStart(CAMPAIGN.chapters[7]); return G.opts.no3; }); ok(ns === true, name + ' c8 no-sweep');
    // scoring pop: the bear pair lights up
    await p.goto(URL + '?scn=wm-token'); await p.waitForFunction(() => window.GXSCN && GXSCN.ready, null, { timeout: 15000 }).catch(() => { });
    await p.waitForTimeout(500); await p.evaluate(() => { window.ANIM = true; UI.fast = false; });
    await tap('#map [data-c="2,0"]'); await p.waitForTimeout(350); await p.screenshot({ path: `shots/pop-${name}.png` });
    ok(await p.evaluate(() => WM.score(G.seats[0].env, 0).ani.bear === 4), name + ' bear pair scored 4');
    ok(errs.length === 0, name + ' no page errors ' + errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAIL ' + fails : 'PASS extra'); process.exit(fails ? 1 : 0);
})();
