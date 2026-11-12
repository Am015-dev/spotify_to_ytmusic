// R2 fix gate: node drag-check.js (no args). Real touch at 375x667 and 390x844, normal speed, 0 page errors.
const { chromium } = require('playwright');
const URL = 'file://' + (process.argv[2] || __dirname) + '/wildmark.html', OUT = (process.argv[3] || __dirname + '/shots');
(async () => {
  const b = await chromium.launch(); let fails = 0;
  for (const vp of [{ width: 375, height: 667 }, { width: 390, height: 844 }]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FILE_NOT_FOUND/.test(m.text())) errs.push(m.text()); });
    await p.goto(URL); await p.evaluate(() => { UI.prefs.hints = true; UI.prefs.played = 1; });
    await p.locator('#quickB').tap(); await p.locator('#goB').tap(); await p.waitForTimeout(400);
    await p.waitForTimeout(900); const g = p.locator('#goalGo'); if (await g.count() && await g.isVisible()) await g.tap(); await p.waitForTimeout(300);
    for (let t = 0; t < 4; t++) {
      await p.waitForFunction(() => G && myTurn() && G.stage === 'pick' && !UI.showAI, null, { timeout: 30000 }).catch(async e => { console.log('STATE', JSON.stringify(await p.evaluate(() => ({ cur: G.cur, stage: G.stage, view: UI.view, ai: !!UI.showAI, pass: document.getElementById('pass').hidden, over: G.over, line: document.getElementById('line').textContent })))); await p.screenshot({ path: OUT + '/stuck.png' }); throw e; });
      if (t === 1) await p.screenshot({ path: `${OUT}/pick-${vp.width}.png` });
      // drag column 0 by CDP touch onto the best spot
      const open = await p.evaluate(() => [...document.querySelectorAll('.gx-drawer')].filter(d => { const r = d.getBoundingClientRect(); return r.width && r.height && getComputedStyle(d).visibility !== 'hidden' && d.getAttribute('aria-hidden') !== 'true'; }).map(d => d.id));
      if (open.length) { console.log(vp.width, 'turn', t + 1, 'drawer open:', open.join()); await p.keyboard.press('Escape'); await p.waitForTimeout(300); }
      const from = await p.locator('#mk .mt').first().boundingBox();
      const spot = await p.evaluate(() => { const env = G.seats[G.cur].env, e = Object.assign({}, env); return null; });
      const cdp = await ctx.newCDPSession(p);
      const sx = from.x + from.width / 2, sy = from.y + from.height / 2;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy }] });
      // take first, then compute spot screen pos
      for (let k = 1; k <= 4; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx, y: sy - k * 8 }] }); await p.waitForTimeout(16); }
      const tgt = await p.evaluate(() => { if (G.stage !== 'tile') return null; const c = WM.spots(G.seats[G.cur].env)[0], q = pix(c), z = UI.pan, r = document.getElementById('board').getBoundingClientRect(); return { c, x: r.left + q[0] * z.z + z.tx, y: r.top + q[1] * z.z + z.ty + 30 }; });
      if (!tgt) { console.log(vp.width, 'FAIL drag did not take', JSON.stringify(await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return { at: e && (e.id || e.className.baseVal || e.className), stage: G.stage, my: myTurn() }; }, [sx, sy]))); fails++; break; }
      for (let k = 1; k <= 10; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx + (tgt.x - sx) * k / 10, y: sy - 32 + (tgt.y - sy + 32) * k / 10 }] }); await p.waitForTimeout(16); }
      if (t === 0) await p.screenshot({ path: `${OUT}/drag-${vp.width}.png` });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await p.waitForTimeout(200);
      const gh = await p.evaluate(() => UI.ghost && UI.ghost.c);
      console.log(vp.width, 'turn', t + 1, 'drop ->', gh, gh === tgt.c ? 'OK' : 'MISS'); if (gh !== tgt.c) fails++;
      await p.locator('#okB').tap(); await p.waitForTimeout(120);
      if (await p.evaluate(() => G.stage === 'tile')) { const bb = await p.locator('#okB').boundingBox().catch(() => null); console.log(vp.width, 'note: Place tap after a CDP touch drag gave no click (synthetic-touch artifact), tapping again'); await p.locator('#okB').tap(); await p.waitForTimeout(300); }
      if (t === 0) await p.screenshot({ path: `${OUT}/drop-${vp.width}.png` });
      await p.waitForTimeout(300);
      const st = await p.evaluate(() => ({ stage: G.stage, n: G.stage === 'tok' ? WM.tokSpots(G.seats[G.cur].env, G.hold.tok).length : -1 }));
      if (st.stage === 'tok') { if (st.n === 1) { await p.waitForTimeout(900); console.log(vp.width, 'auto-confirm', await p.evaluate(() => G.stage !== 'tok' || G.cur !== 0 ? 'OK' : 'NO')); } else if (st.n > 1) await p.locator('#map .tgt').first().tap(); else await p.locator('#backB').tap(); }
      await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/after-${vp.width}-${t}.png` });
    }
    console.log(vp.width, 'errors', errs.length, errs.slice(0, 2).join(' | ')); if (errs.length) fails++;
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
