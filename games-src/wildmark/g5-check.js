// G5 review gate: the default Play button (gentle rival) played to the result by touch at 390x844 and 375x667.
// Each turn taps only spots / tiles that are on screen and not covered (elementFromPoint), and records the smallest spot and token target.
// Result screen: totals strip on top (winner first), every text in the score sheet >= 14 px with contrast >= 4.5:1 on the panel.
// Usage: node g5-check.js   (shots in shots/g5-*.png)
const { chromium } = require('playwright');
const URL = 'file://' + __dirname + '/wildmark.html?fast=1';
(async () => {
  const b = await chromium.launch(); let fails = 0;
  for (const [name, vp] of [['390x844', { width: 390, height: 844 }], ['375x667', { width: 375, height: 667 }]].filter(x => !process.env.ONLY || x[0] === process.env.ONLY)) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    const tapEl = async (sel) => { const r = await p.evaluate(s => { const B = document.getElementById('board').getBoundingClientRect(); let best = null;
      document.querySelectorAll(s).forEach(e => { const q = e.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2; if (cx < B.left + 4 || cx > B.right - 4 || cy < B.top + 4 || cy > B.bottom - 4) return;
        const hit = document.elementFromPoint(cx, cy); if (!hit || !(hit === e || e.contains(hit) || hit.closest('[data-c]') === e.closest('[data-c]'))) return; if (!best || Math.random() < 0.3) best = { cx, cy, w: q.width, h: q.height, hit: (hit.id || hit.className.baseVal || hit.className) + '' }; });
      return best; }, sel); if (!r) return null; if (process.env.DBG) console.log(JSON.stringify(r)); await p.touchscreen.tap(r.cx, r.cy); return r; };
    let minSpot = 1e9, minTok = 1e9, noTap = 0;
    try {
      await p.goto(URL); await p.locator('#playB').tap();
      const lvl = await p.evaluate(() => G.seats[1].ai); if (lvl !== 'gentle') { fails++; console.log(name, 'FAIL default rival is', lvl); }
      for (let t = 0; t < 20; t++) {
        await p.waitForFunction(() => window.G && !G.over && !G.seats[G.cur].ai && G.stage === 'pick' && document.querySelector('#mk .mt:not([disabled])'), null, { timeout: 30000 });
        await p.locator('#mk .mt:not([disabled])').nth(t % 4).tap().catch(() => p.locator('#mk .mt:not([disabled])').first().tap());
        await p.waitForSelector('#map .spot');
        minSpot = Math.min(minSpot, await p.evaluate(() => { const B = document.getElementById('board').getBoundingClientRect(); let m = 1e9; document.querySelectorAll('#map .spot').forEach(e => { const q = e.getBoundingClientRect(); if (q.left > B.left && q.right < B.right && q.top > B.top && q.bottom < B.bottom) m = Math.min(m, q.width, q.height); }); return m; }));
        let r = await tapEl('#map .spot'); if (!r) { noTap++; await p.evaluate(() => { const c = WM.spots(G.seats[G.cur].env)[0]; onCell(c, true); }); }
        await p.waitForSelector('#okB'); await p.locator('#okB').tap();
        await p.waitForFunction(() => G.stage === 'tok' || G.stage === 'pick' || G.over);
        if (await p.evaluate(() => G.stage === 'tok')) {
          minTok = Math.min(minTok, await p.evaluate(() => { let m = 1e9; document.querySelectorAll('#map .tgt').forEach(e => { const q = e.getBoundingClientRect(); m = Math.min(m, q.width, q.height); }); return m; }));
          r = (await p.locator('#map .tgt').count()) ? await tapEl('#map .tgt') : null;
          if (!r) await p.locator('#backB').tap();
          await p.waitForTimeout(60); if (await p.evaluate(() => G.stage === 'tok')) await p.locator('#backB').tap();
        }
      }
      await p.waitForSelector('#againB', { timeout: 30000 }); await p.waitForTimeout(2500);
      await p.screenshot({ path: `shots/g5-result-${name}.png` });
      const rs = await p.evaluate(() => {
        const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
        const bg = 'rgb(18,32,25)', out = { small: 1e9, contrast: 1e9 };   // the panel colour (.rbox)
        document.querySelectorAll('#rs .st small, #rs .st td, #rs .st th, #rs .note, #rs .why').forEach(e => { const cs = getComputedStyle(e); if (!e.textContent.trim()) return; out.small = Math.min(out.small, parseFloat(cs.fontSize)); const a = lum(cs.color), b2 = lum(bg); out.contrast = Math.min(out.contrast, (Math.max(a, b2) + .05) / (Math.min(a, b2) + .05)); });
        const st = document.querySelector('#rs .stand'), h2 = document.querySelector('#rs .rbig');
        out.stand = st ? [...st.querySelectorAll('li')].map(l => l.textContent).join(' | ') : null; out.top = st ? st.getBoundingClientRect().top < window.innerHeight / 2 : false;
        out.winFirst = st ? +st.querySelector('li b').textContent === Math.max(...G.res.map(r => r.total)) : false; out.score = G.res.map(r => r.total).join('-'); return out;
      });
      const ok = rs.small >= 14 && rs.contrast >= 4.5 && rs.stand && rs.top && rs.winFirst && minSpot >= 44 && minTok >= 44 && !errs.length;
      if (!ok) fails++;
      console.log(name, ok ? 'PASS' : 'FAIL', 'score', rs.score, '| stand', rs.stand, '| result text min', rs.small + 'px contrast', rs.contrast.toFixed(1), '| min spot', minSpot.toFixed(0) + 'px, min token target', minTok.toFixed(0) + 'px | spots not on screen (panned) turns', noTap, '| errors', errs.length, errs.slice(0, 2).join(' | '));
    } catch (e) { fails++; console.log(name, 'FAIL', e.message.split('\n')[0], await p.evaluate(() => G && [G.seats[0].done, G.stage, !!UI.ghost, UI.prefs.hints, document.querySelector('.gx-drawer.on') ? 'drawer' : '', (()=>{const e=document.elementFromPoint(318,367); return e && (e.id||e.getAttribute('class'))})()].join())); await p.screenshot({ path: `shots/g5-fail-${name}.png` }); }
    await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAIL g5-check' : 'PASS g5-check'); process.exit(fails ? 1 : 0);
})();
