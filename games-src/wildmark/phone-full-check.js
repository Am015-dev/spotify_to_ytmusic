// R2 fix gate: node phone-full-check.js (no args). Real touch at 375x667 and 390x844, normal speed, 0 page errors.
const { chromium } = require('playwright');
const URL = 'file://' + (process.argv[2] || __dirname) + '/wildmark.html', OUT = (process.argv[3] || __dirname + '/shots');
(async () => {
  const b = await chromium.launch(); let fails = 0;
  await Promise.all([{ width: 375, height: 667 }, { width: 390, height: 844 }].map(async vp => {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FILE_NOT_FOUND/.test(m.text())) errs.push(m.text()); });
    const tap = s => p.locator(s).first().tap();
    try {
      await p.goto(URL); await p.evaluate(() => { UI.prefs.hints = true; UI.prefs.played = 1; });
      await tap('#quickB'); await tap('#goB'); await p.waitForTimeout(400);
      const g = p.locator('#goalGo'); if (await g.count() && await g.isVisible()) await g.tap();
      let cover = 0, autos = 0;
      for (let t = 0; t < 20; t++) {
        await p.waitForFunction(() => G && (G.over || (myTurn() && G.stage === 'pick' && !UI.showAI)), null, { timeout: 40000 });
        if (await p.evaluate(() => G.over)) break;
        // board covered? any overlay (pv, line, toast) over a placed tile's centre at pick time, after 3.4 s (verdict faded)
        await p.waitForTimeout(t % 5 === 0 ? 3400 : 50);
        if (t % 5 === 0) { const c = await p.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(), z = UI.pan, env = G.seats[0].env; let n = 0; Object.keys(env).forEach(k => { const q = pix(k), x = r.left + q[0] * z.z + z.tx, y = r.top + q[1] * z.z + z.ty; const el = document.elementFromPoint(x, y); if (el && !el.closest('#map')) n++; }); return n; }); cover += c; await p.screenshot({ path: `${OUT}/full-${vp.width}-t${t + 1}.png` }); }
        await tap('#mk .mt:not([disabled])'); await p.waitForSelector('#map .spot'); await tap('#map .spot'); await tap('#okB');
        await p.waitForTimeout(900);
        const st = await p.evaluate(() => myTurn() && G.stage === 'tok');
        if (st) { if (await p.locator('#map .tgt').count()) await tap('#map .tgt'); else await tap('#backB'); } else autos++;
      }
      await p.waitForSelector('#againB', { timeout: 40000 }); await p.screenshot({ path: `${OUT}/full-${vp.width}-result.png` });
      console.log(vp.width, 'PASS full game', await p.evaluate(() => G.res.map(r => r.total).join('/')), 'tiles covered at pick (5 samples):', cover, 'auto/skip turns:', autos, 'errors:', errs.length, errs.slice(0, 2).join(' | '));
      if (errs.length || cover) fails++;
    } catch (e) { console.log(vp.width, 'FAIL', String(e).slice(0, 200)); fails++; }
    await ctx.close();
  }));
  await b.close(); process.exit(fails ? 1 : 0);
})();
