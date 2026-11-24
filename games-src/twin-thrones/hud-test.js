// HUD gate (W664): at phone 402x874 and PC 1366x768, at machine speed (turbo.js): every top-bar window opens by tap and closes by
// its X and by a tap outside, never two at once; then a full game is played through the real UI to the result. 0 JS errors, < 60 s each.
// usage: node hud-test.js [url]   (default http://localhost:8779/twin-thrones/)
const { chromium } = require('playwright'); const { turbo, budget, tick } = require('../scripts/turbo');
const URL0 = process.argv[2] || 'http://localhost:8779/twin-thrones/';
(async () => {
  const b = await chromium.launch({ executablePath: require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }); let fail = 0;
  for (const [W, H, mob] of [[402, 874, true], [1366, 768, false]]) {
    const t0 = Date.now(), stop = budget(60000, 'hud ' + W);
    const c = await b.newContext({ viewport: { width: W, height: H }, isMobile: mob, hasTouch: mob }); await turbo(c);
    const p = await c.newPage(), errs = [], bad = []; p.on('pageerror', e => errs.push(e.message));
    const tap = async s => { const r = await p.locator(s).first().boundingBox(); if (!r) throw new Error('no ' + s); if (mob) await p.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); else await p.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await tick(p, 300); };
    await p.goto(URL0 + '?seed=11'); await tick(p, 500);
    await tap('[data-start="1"]'); if (await p.locator('[data-goalgo]').count()) await tap('[data-goalgo]');
    await p.evaluate(() => { window.AIDELAY = 0; }); await tick(p, 400);
    const bar = await p.evaluate(() => [...document.querySelectorAll('header.gx-bar button')].map(e => { const r = e.getBoundingClientRect(); return [e.getAttribute('aria-label'), Math.round(r.width), Math.round(r.height), r.right <= innerWidth]; }));
    bar.forEach(x => { if (x[1] < 44 || x[2] < 44 || !x[3]) bad.push('bar button ' + x.join(' ')); }); if (bar.length > 5) bad.push('bar has ' + bar.length + ' buttons');
    const openN = () => p.evaluate(() => document.querySelectorAll('.gx-drawer.on').length + (document.getElementById('peek') && !document.getElementById('peek').hidden ? 1 : 0));
    for (const [sel, how] of [['[aria-label="Rival city"]', 'x'], ['[aria-label="All cards"]', 'out'], ['[aria-label="Log"]', 'x'], ['[aria-label="How to play"]', 'out'], ['#menubtn', 'x'], ['[aria-label="Rival city"]', 'out'], ['#pts0', 'peek'], ['#pts1', 'peekout']]) {
      await tap('header ' + sel); await p.waitForTimeout(60); /* let the drawer finish its slide (real time) before measuring the X */ const n = await openN(); if (n !== 1) bad.push(sel + ' open count ' + n);
      if (how === 'x') { const xb = await p.evaluate(() => { const x = document.querySelector('.gx-drawer.on .gx-x'), r = x && x.getBoundingClientRect(); return r ? [r.width, r.height] : null; }); if (!xb || xb[0] < 44 || xb[1] < 44) bad.push(sel + ' X ' + JSON.stringify(xb)); if (xb) await tap('.gx-drawer.on .gx-x'); }
      else if (how === 'out') { const r = await p.evaluate(() => { const e = document.querySelector('.gx-drawer.on'); if (!e) return [8, innerHeight - 8]; const d = e.getBoundingClientRect(); return d.left > 60 ? [20, innerHeight / 2] : [innerWidth / 2, Math.max(10, d.top - 20)]; }); if (mob) await p.touchscreen.tap(r[0], r[1]); else await p.mouse.click(r[0], r[1]); await tick(p, 300); }
      else if (how === 'peek') await tap('[data-peekx]');
      else { if (mob) await p.touchscreen.tap(8, H - 8); else await p.mouse.click(8, H - 8); await tick(p, 300); }
      await p.waitForTimeout(60); const n2 = await openN(); if (n2 !== 0) bad.push(sel + ' still open after ' + how);
    }
    let moves = 0;
    for (let k = 0; k < 900 && !(await p.evaluate(() => TT_TEST.U.G.over)); k++) {
      const st = await p.evaluate(() => { const U = TT_TEST.U, G = U.G; return { me: !U.busy && !U.narr && !G.over && TT_TEST.E.sideToAct(G) === 0, pend: !!G.pend[0], draft: G.phase === 'draft' }; });
      if (!st.me) { await tick(p, 200); continue; }
      if (st.draft || st.pend) { await p.evaluate(() => TT_TEST.toPlay(0)); await tick(p, 200); if (st.pend) { const bt = p.locator('#acts .picker button, #tokrow .tok.pickable, #acts button'); if (await bt.count()) { await bt.first().click(); await tick(p, 150); if (await bt.count()) { await bt.first().click(); } } } await tick(p, 200); continue; }
      const cards = p.locator('#pyr .card.av:not(.dim)'); if (!(await cards.count())) { await tick(p, 200); continue; }
      await cards.first().click(); await tick(p, 150);
      const bl = p.locator('#zoom [data-a="build"]:not([aria-disabled="true"])');
      await ((await bl.count()) ? bl.first() : p.locator('#zoom [data-a="discard"]').first()).click(); moves++; await tick(p, 300);
    }
    const over = await p.evaluate(() => TT_TEST.U.G.over), resShown = await p.evaluate(() => !document.getElementById('res').hidden);
    if (!over) bad.push('game did not finish'); if (!resShown) bad.push('result screen not shown');
    const secs = ((Date.now() - t0) / 1000).toFixed(1); stop();
    const ok = !bad.length && !errs.length; if (!ok) fail = 1;
    console.log((ok ? 'ok  ' : 'FAIL') + ` hud ${W}x${H} ${secs}s moves=${moves} windows=8 errors=${errs.length} ${bad.concat(errs).join('; ').slice(0, 400)}`);
    await c.close();
  }
  await b.close(); process.exit(fail);
})();
