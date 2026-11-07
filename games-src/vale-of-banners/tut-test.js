// tutorial + story 1-2 by real taps. node tut-test.js
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.join(__dirname, 'vale-of-banners.html');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let fails = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(URL); await page.waitForTimeout(400);
    const tap = async loc => { if (touch) await loc.tap(); else await loc.click(); };
    await tap(page.locator('#tutB')); await page.waitForTimeout(700);
    const steps = [];
    for (let i = 0; i < 14; i++) {
      const st = await page.evaluate(() => { try { const s = GXT.state(); return { act: GXT.active(), cur: GXT.current() && GXT.current().id }; } catch (e) { return { err: String(e) }; } });
      steps.push(st.cur || '-'); if (!st.act) break;
      if (i === 0) await page.screenshot({ path: `shots/tut-${name}-0.png` });
      const next = page.locator('.gxt-next, .gxt-bubble button').first();
      const cur = st.cur;
      const tgt = { take: '#mt-' + await page.evaluate(() => UI.tut.stall) + '-0', take2: '#tv .acts .btn', pick: '#st-0', cell: '#ec-' + await page.evaluate(() => UI.tut.cell), end: '#endB' }[cur];
      if (tgt) { await tap(page.locator(tgt).first()).catch(e => console.log('tap fail', cur, String(e).slice(0, 120))); }
      else if (await next.count()) await tap(next);
      await page.waitForTimeout(500);
      if (cur === 'cell') await page.screenshot({ path: `shots/tut-${name}-cell.png` });
    }
    await page.screenshot({ path: `shots/tut-${name}-end.png` });
    console.log(name, 'tutorial steps', steps.join(','), 'errors', errs.length, errs.slice(0, 2).join('|'));
    await ctx.close();
  }
  await b.close();
})();
