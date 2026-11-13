// Target-size test: every tappable wire and name plate is at least 44x44 px in jobs 1-12 with 2-5 players at 375x667 and 390x844.
//   node target-size-test.js            (prints the smallest wire per job; fails on anything under 44)
// "Tappable" = every tile in #crew and #mine (any can become a target) plus every .plate and gear card (#gear .eqk). Tiles scrolled out of the crew area are scrolled in first.
const { chromium } = require('playwright');
const path = require('path');
const gx = require('../../scripts/gx-serve.js');
const FILE = path.resolve(__dirname, 'shortfuse.html');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MEASURE = `(() => {
  const m = { crewW: 1e9, crewH: 1e9, mineW: 1e9, mineH: 1e9, plateH: 1e9, hidden: 0, hscroll: document.documentElement.scrollWidth > innerWidth + 1 };
  const crew = document.getElementById('crew');
  for (const id of ['crew', 'mine']) for (const t of document.querySelectorAll('#' + id + ' .tile')) {
    const r = t.getBoundingClientRect(); m[id + 'W'] = Math.min(m[id + 'W'], Math.round(r.width)); m[id + 'H'] = Math.min(m[id + 'H'], Math.round(r.height));
  }
  for (const g of document.querySelectorAll('#gear .eqk')) { const r = g.getBoundingClientRect(); if (r.width > 3) m.plateH = Math.min(m.plateH, Math.round(r.height), Math.round(r.width)); }
  for (const p of document.querySelectorAll('#tb .plate')) { const r = p.getBoundingClientRect(); if (r.width > 3) m.plateH = Math.min(m.plateH, Math.round(r.height)); }
  // every tile can be brought fully into view and its centre hits itself
  for (const t of document.querySelectorAll('#tb .tile')) { t.scrollIntoView({ block: 'nearest' }); const r = t.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (!e || !(e === t || t.contains(e))) m.hidden++; }
  crew.scrollTop = 0; return m;
})()`;
(async () => {
  const URL = await gx.url('short-fuse', { file: FILE });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  let fails = 0;
  for (const [w, h] of [[375, 667], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
    await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
    await page.goto(URL); await sleep(900);
    for (let job = 1; job <= 12; job++) {
      const pl = await page.evaluate(`MISSIONS[${job}].pl`);
      const worst = { w: 1e9, h: 1e9, p: 1e9, txt: '' }; let hid = 0;
      for (const np of [2, 3, 4, 5]) {
        if (!pl.includes(np)) continue;
        for (const cap of np === 3 ? [0, 1] : [0]) {
          await page.evaluate(`AIDELAY=100;startJob({job:${job},np:${np},seats:['human','ai','ai','ai','ai'].slice(0,${np}),lv:'normal',names:DEFNAMES.slice(),chars:[],captain:${cap},seed:${job * 7 + np}});UI.brief=null;refresh()`);
          await sleep(350);
          const m = await page.evaluate(MEASURE);
          const mw = Math.min(m.crewW, m.mineW), mh = Math.min(m.crewH, m.mineH);
          if (mw < worst.w || mh < worst.h) worst.txt = np + 'p crew ' + m.crewW + 'x' + m.crewH + ' own ' + m.mineW + 'x' + m.mineH;
          worst.w = Math.min(worst.w, mw); worst.h = Math.min(worst.h, mh); worst.p = Math.min(worst.p, m.plateH); hid += m.hidden;
          if (m.hscroll) { fails++; console.log('FAIL hscroll', w + 'x' + h, 'job', job, np + 'p'); }
        }
      }
      const ok = worst.w >= 44 && worst.h >= 44 && worst.p >= 44 && !hid;
      if (!ok) fails++;
      console.log((ok ? 'ok   ' : 'FAIL ') + w + 'x' + h + ' job ' + job + ': min wire ' + worst.w + 'x' + worst.h + ' (' + worst.txt + '), plate/gear min ' + worst.p + (hid ? ', ' + hid + ' tiles not tappable' : ''));
    }
    if (errs.length) { fails++; console.log('FAIL page errors', errs.slice(0, 3).join(' | ')); }
    await ctx.close();
  }
  await browser.close();
  console.log('TARGETS ' + (fails ? 'FAIL (' + fails + ')' : 'PASS'));
  process.exit(fails ? 1 : 0);
})();
