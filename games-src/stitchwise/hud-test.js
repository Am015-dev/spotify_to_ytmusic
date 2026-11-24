// HUD gate (W676): phone 402x874 and PC 1366x768 at machine speed (turbo.js): each window opens by tap, closes by its X and by a tap outside, never two at once;
// bar buttons >= 44 px and <= 5; then a full game is played to the result (advance by real tap, patches by the engine's move). 0 JS errors, < 60 s each.
// usage: node hud-test.js [url]   (default http://localhost:8780/stitchwise/)
const { chromium } = require('playwright'); const { turbo, budget, tick } = require('../scripts/turbo');
const URL0 = process.argv[2] || 'http://localhost:8780/stitchwise/';
(async () => {
  const b = await chromium.launch({ executablePath: require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }); let fail = 0;
  for (const [W, H, mob] of [[402, 874, true], [1366, 768, false]]) {
    const t0 = Date.now(), stop = budget(60000, 'hud ' + W);
    const c = await b.newContext({ viewport: { width: W, height: H }, isMobile: mob, hasTouch: mob }); await turbo(c);
    const p = await c.newPage(), errs = [], bad = []; p.on('pageerror', e => errs.push(e.message));
    const at = async (x, y) => { if (mob) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); await tick(p, 300); };
    const tap = async s => { const r = await p.locator(s).first().boundingBox(); if (!r) throw new Error('no ' + s); await at(r.x + r.width / 2, r.y + r.height / 2); };
    await p.goto(URL0 + '?scn=sw-board'); await tick(p, 800); await p.evaluate(() => { window.AIDELAY = 0; });
    const bar = await p.evaluate(() => [...document.querySelectorAll('header.gx-bar button')].map(e => { const r = e.getBoundingClientRect(); return [e.getAttribute('aria-label'), Math.round(r.width), Math.round(r.height), r.right <= innerWidth]; }));
    bar.forEach(x => { if (x[1] < 44 || x[2] < 44 || !x[3]) bad.push('bar button ' + x.join(' ')); }); if (bar.length > 5) bad.push('bar has ' + bar.length + ' buttons');
    const openN = () => p.evaluate(() => document.querySelectorAll('.gx-drawer.on').length);
    let wins = 0;
    for (const [sel, how] of [['[data-gx="patchd"]', 'x'], ['[data-gx="rulesd"]', 'out'], ['[data-gx="setd"]', 'x'], ['[data-gx="patchd"]', 'out'], ['#barchips .pstrip', 'x'], ['#barchips .pstrip', 'out']]) {
      await tap('header ' + sel); await p.waitForTimeout(80); const n = await openN(); if (n !== 1) bad.push(sel + ' open count ' + n); else wins++;
      if (how === 'x') { const xb = await p.evaluate(() => { const x = document.querySelector('.gx-drawer.on .gx-x'), r = x && x.getBoundingClientRect(); return r ? [r.width, r.height, r.x + r.width / 2, r.y + r.height / 2] : null; }); if (!xb || xb[0] < 44 || xb[1] < 44) bad.push(sel + ' X ' + JSON.stringify(xb)); if (xb) await at(xb[2], xb[3]); }
      else { const r = await p.evaluate(() => { const d = document.querySelector('.gx-drawer.on').getBoundingClientRect(); return d.left > 60 ? [20, innerHeight / 2] : [innerWidth / 2, Math.max(10, d.top - 20)]; }); await at(r[0], r[1]); }
      await p.waitForTimeout(80); const n2 = await openN(); if (n2 !== 0) bad.push(sel + ' still open after ' + how);
    }
    let moves = 0;
    for (let k = 0; k < 800 && !(await p.evaluate(() => G.over)); k++) {
      const my = await p.evaluate(() => !G.over && isHuman(swWho(G)) && !UI.busy && !UI.sel_busy);
      if (!my) { await tick(p, 200); continue; }
      const m = await p.evaluate(() => aiMove(G, 'normal'));
      if (m && m.t === 'adv') await tap('[data-a="adv"]'); else if (m) await p.evaluate(mv => act(mv), m); else await tap('[data-a="adv"]');
      moves++; await tick(p, 250);
    }
    const over = await p.evaluate(() => G.over); if (!over) bad.push('game did not finish');
    const secs = ((Date.now() - t0) / 1000).toFixed(1); stop();
    const ok = !bad.length && !errs.length; if (!ok) fail = 1;
    console.log((ok ? 'ok  ' : 'FAIL') + ` hud ${W}x${H} ${secs}s moves=${moves} windows=${wins} errors=${errs.length} ${bad.concat(errs).join('; ').slice(0, 500)}`);
    await c.close();
  }
  await b.close(); process.exit(fail);
})();
