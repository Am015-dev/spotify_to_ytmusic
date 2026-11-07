// Tutorial to the end by tapping each spotlit element's centre, from fresh storage. node tut-end.js -> PASS/FAIL per size
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.join(__dirname, 'vale-of-banners.html');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), page = await ctx.newPage(), errs = [], fails = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(URL); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);
    const tapXY = async (x, y) => { if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); };
    const tapSel = async sel => { const r = await page.locator(sel).first().boundingBox(); if (!r) { fails.push('no ' + sel); return; } await tapXY(r.x + r.width / 2, r.y + r.height / 2); };
    await tapSel('#tutB'); await page.waitForTimeout(900);
    const ids = [];
    for (let i = 0; i < 12; i++) {
      const st = await page.evaluate(() => { const c = GXT.current(); if (!GXT.active() || !c) return { done: true };
        const t = c.target && c.target(); if (!t) return { id: c.id, none: true };
        const r = t.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y);
        return { id: c.id, x, y, wait: !!c.wait, ok: !!hit && (hit === t || t.contains(hit)), hit: hit ? (hit.id || hit.className) : 'none' }; });
      if (st.done) break; ids.push(st.id);
      if (st.none) { fails.push(st.id + ': no target'); break; }
      if (!st.ok) fails.push(st.id + ': centre covered by ' + st.hit);
      if (st.wait) await tapXY(st.x, st.y); else { const nx = page.locator('.gxt-next, .gxt-bubble button').first(); if (await nx.count()) await nx.tap ? (touch ? nx.tap() : nx.click()) : 0; }
      await page.waitForTimeout(1300);
    }
    const end = await page.evaluate(() => !!document.querySelector('.gxt-end [data-gxt-end="play"]'));
    if (!end) fails.push('end card not reached (steps ' + ids.join(',') + ')');
    else { await tapSel('.gxt-end [data-gxt-end="play"]'); await page.waitForTimeout(1200);
      const real = await page.evaluate(() => !!G && !G.over && UI.mode === 'quick' && document.getElementById('start').hidden && !GXT.running());
      if (!real) fails.push('real game did not start'); }
    // Skip works: fresh tutorial, tap Skip
    await page.evaluate(() => { localStorage.clear(); }); await page.reload(); await page.waitForTimeout(400); await tapSel('#tutB'); await page.waitForTimeout(700);
    await tapSel('.gxt-skip'); await page.waitForTimeout(600);
    if (await page.evaluate(() => GXT.running() || document.getElementById('start').hidden)) fails.push('skip did not return to title');
    if (errs.length) fails.push('console errors: ' + errs.slice(0, 2).join(' | '));
    console.log(`${fails.length ? 'FAIL' : 'PASS'} tutorial-to-end ${name} (${vp.width}x${vp.height}) steps ${ids.join(',')}${fails.length ? ' :: ' + fails.join('; ') : ''}`);
    bad += fails.length; await ctx.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
