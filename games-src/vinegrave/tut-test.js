// Tutorial-to-end test: fresh storage, tap "Learn to play", then for every step tap the spotlit element's centre (or Next) like a player.
// Asserts: elementFromPoint at each target centre is inside the target (not covered), every step advances, the end card shows and its
// button starts a real game. node tut-test.js [shotsDir]   (run python3 build.py first). Sizes: 390x763 touch and 1440x860 mouse.
const { chromium } = require('playwright'), serve = require('./serve.js'), fs = require('fs');
const OUT = process.argv[2] || null;
(async () => {
  const S = await serve(), b = await chromium.launch({ args: ['--no-sandbox'], executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }); let fails = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(S.url, { waitUntil: 'load' });
    const tapAt = async (x, y) => touch ? page.touchscreen.tap(x, y) : page.mouse.click(x, y);
    const shot = async n => { if (OUT) await page.screenshot({ path: `${OUT}/${n}-${name}.png` }); };
    await page.waitForSelector('#start .tbtn'); await page.waitForTimeout(400); await shot('a-title');
    const first = page.locator('#start .tbtn').first(); const lbl = (await first.textContent()).trim();
    const bb = await first.boundingBox(); await tapAt(bb.x + bb.width / 2, bb.y + bb.height / 2);
    let last = -1, steps = 0, ok = true, t0 = Date.now();
    while (Date.now() - t0 < 150000) {
      const st = await page.evaluate(() => window.GXT && GXT.state());
      if (!st || !st.active) { ok = false; console.log(name, 'FAIL tutorial not active'); break; }
      if (st.phase === 'end') break;
      if (!st.shown) { await page.waitForTimeout(150); continue; }
      if (st.i !== last) { last = st.i; steps++; if (steps <= 3 || st.id === 'turn') await shot('b-tut' + steps); }
      if (!st.wait) { const n = page.locator('.gxt-next'); await n.waitFor({ timeout: 4000 }); const r = await n.boundingBox(); await tapAt(r.x + r.width / 2, r.y + r.height / 2); }
      else {
        const h = st.hole; const hit = await page.evaluate(([x, y, i]) => { const e = document.elementFromPoint(x, y); const c = GXT.current(); const t = c && c.target && c.target(); return !!(t && t.contains && e && (t === e || t.contains(e))); }, [h.cx, h.cy]);
        if (!hit) { ok = false; console.log(name, 'FAIL step', st.id, 'target covered at centre'); }
        await tapAt(h.cx, h.cy);
      }
      await page.waitForFunction(i => { const s = GXT.state(); return !s.active || s.phase === 'end' || s.i !== i || !s.shown; }, st.i, { timeout: 25000 }).catch(() => { ok = false; console.log(name, 'FAIL step', st.id, 'did not advance'); });
      if (!ok) break;
    }
    const end = await page.locator('.gxt-end button.pri').first();
    if (ok && await end.count()) {
      await page.waitForTimeout(300); await shot('c-tutend');
      const r = await end.boundingBox(); await tapAt(r.x + r.width / 2, r.y + r.height / 2);
      const real = await page.waitForFunction(() => window.G && window.UI && UI.mode !== 'tutorial' && G.phase === 'play', null, { timeout: 15000 }).then(() => true).catch(() => false);
      if (!real) { ok = false; console.log(name, 'FAIL end card did not start a real game'); }
    } else if (ok) { ok = false; console.log(name, 'FAIL no end card'); }
    console.log(name, ok && !errs.length ? 'PASS' : 'FAIL', 'tutorial to end:', steps, 'steps, first button "' + lbl + '", errors', errs.length, errs.slice(0, 2).join(' | '));
    if (!ok || errs.length) fails++;
    await ctx.close();
  }
  await b.close(); S.close(); process.exit(fails ? 1 : 0);
})();
