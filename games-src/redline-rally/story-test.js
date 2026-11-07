// Story mode through real DOM clicks (fast loop): open the map, play chapters 1 and 2 to the end (intro, race, result, outro), check progress is saved, back to the title.
const path = require('path'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
const STEP = () => {
  const vis = e => e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden', $ = s => document.querySelector(s), over = [...document.querySelectorAll('.gxc')].find(e => { const c = getComputedStyle(e); return e.getClientRects().length > 0 && c.visibility !== 'hidden' && +c.opacity > 0.5 && c.pointerEvents !== 'none'; });
  const gx_ = [...document.querySelectorAll('.gxc button, .gxc .gxc-btn')].filter(vis);
  const pick = re => gx_.find(b => re.test(b.textContent) && !/back|easier|retry|again|replay/i.test(b.textContent));
  if (over) { const b = pick(/start|race|let|go\b|continue|next|ok|begin|got|play/i) || gx_.find(b => /skip/i.test(b.textContent)) || gx_.find(b => /try again/i.test(b.textContent)); if (b) { b.click(); return 'gxc:' + b.textContent.trim().slice(0, 12); }  return 'gxc-none:' + [...document.querySelectorAll('.gxc')].map(e => e.className + '[' + [...e.querySelectorAll('button')].filter(vis).map(b => b.textContent.trim().slice(0, 14)).join('|') + ']').join(' ; '); }
  if (vis($('#slipY'))) { $('#slipY').click(); return 'slip'; }
  if ($('#goB') && vis($('#goB')) && !$('#game').hidden) { if (!$('#goB').disabled) { $('#goB').click(); return 'go'; } $('#sugB').click(); return 'sug'; }
  return 'idle';
};
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html'), query: '?fast=1' }); const b = await chromium.launch({ args: ['--no-sandbox'] }); let fails = 0;
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => localStorage.setItem('gxt-redline-rally', JSON.stringify({ done: 1 })));
    for (const chap of [0, 1]) {
      await page.evaluate(() => document.getElementById('storyB').click()); await page.waitForTimeout(300);
      const opened = await page.evaluate(i => { const n = [...document.querySelectorAll('.gxc-node:not(.locked)')]; const t = n[Math.min(i, n.length - 1)]; if (t) t.click(); return n.length; }, chap);
      ok(opened >= 1, name + ' chapter ' + (chap + 1) + ' on the map (' + opened + ' open)');
      let done = false, last = '';
      for (let i = 0; i < 1500 && !done; i++) {
        last = await page.evaluate(STEP); await page.waitForTimeout(last === 'idle' ? 120 : 40);
        if (i % 10 === 0) done = await page.evaluate(c => Object.keys(GXC.progress().ch).filter(k => GXC.progress().ch[k].beaten).length > c, chap);
      }
      ok(done, name + ' chapter ' + (chap + 1) + ' beaten and saved (last step ' + last + ')');
      for (let i = 0; i < 60; i++) {   // outro, map, Back, title
        const st = await page.evaluate(() => ({ t: !document.getElementById('title').hidden, ov: !!document.querySelector('.gxc-res-on,.gxc-scene-on,.gxc-map-on') }));
        if (st.t && !st.ov) break;
        await page.evaluate(() => { const v = e => e && e.offsetParent !== null; const bs = [...document.querySelectorAll('.gxc button')].filter(v); const b = bs.find(b => /skip|continue|next|ok/i.test(b.textContent)) || bs.find(b => /back/i.test(b.textContent)); if (b) b.click(); });
        await page.waitForTimeout(150);
      }
    }
    ok(errs.length === 0, name + ' no errors ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAIL story-test' : 'PASS story-test'); process.exit(fails ? 1 : 0);
})();
