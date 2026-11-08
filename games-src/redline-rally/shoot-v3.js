/* v3 shots: start lights, mid-race preview, spin-out, podium (phone 390x763 and pc 1440x860) from ?scn= states, saved as png then converted to webp.
   Usage: PW=../node_modules/playwright node shoot-v3.js  -> playable-shots/v3-<scene>-<size>.png (convert with python PIL) */
const path = require('path'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html') }), b = await chromium.launch({ args: ['--no-sandbox'] }); let errsAll = 0;
  for (const [n, vp, t] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    for (const [sc, id] of [['lights', 'rr-lights'], ['preview', 'rr-preview'], ['spin', 'rr-spin'], ['podium', 'rr-result']]) {
      const c = await b.newContext({ viewport: vp, hasTouch: t, isMobile: t, deviceScaleFactor: 1 }), p = await c.newPage(), errs = [];
      p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
      await p.addInitScript(() => { localStorage.setItem('gxt-redline-rally', JSON.stringify({ done: 1 })); localStorage.setItem('rr_seen', '1'); });
      await p.goto(url + (url.includes('?') ? '&' : '?') + 'scn=' + id, { waitUntil: 'load' }); await p.waitForTimeout(1500);
      await p.screenshot({ path: path.join(__dirname, 'playable-shots', `v3-${sc}-${n}.png`) });
      console.log((errs.length ? 'FAIL ' : 'PASS ') + n + ' ' + sc + (errs.length ? ' ' + errs[0] : '')); errsAll += errs.length; await c.close();
    }
  }
  await b.close(); process.exit(errsAll ? 1 : 0);
})();
