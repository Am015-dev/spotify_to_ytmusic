// Lessons pill vs title + pc text size check: node thornbound/game/pill-test.js [402x874,1366x768] [menu,tb-board,story-scene,tb-zoom]
// For each size/screen: the Lessons pill (.gxst-q) rect must not intersect any title element (header h1, menu logo/tagline);
// at >= 1024px wide no text under 16px in the header title or the zoomed card (#ppop .pp-card svg text). Exit 1 on any failure.
const PW = (() => { try { return require('playwright'); } catch (e) { try { return require('../../../node_modules/playwright'); } catch (e2) { return require('/opt/node-tools/node_modules/playwright'); } } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'thornbound.html'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sizes = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const SCNS = (process.argv[3] || 'menu,tb-board,story-scene,tb-zoom').split(',');
(async () => {
  let b;
  try { b = await PW.chromium.launch({ executablePath: process.env.PW_CHROME || undefined }); }
  catch (e) { // pinned browser build missing: use whatever headless shell is installed
    const root = '/opt/pw-browsers', d = fs.existsSync(root) ? fs.readdirSync(root).filter(n => /^chromium_headless_shell-\d+$/.test(n)).sort().pop() : null;
    if (!d) throw e;
    b = await PW.chromium.launch({ executablePath: path.join(root, d, 'chrome-headless-shell-linux64', 'chrome-headless-shell') });
  }
  let bad = 0;
  for (const [W, H] of sizes) {
    const phone = W < 600;
    for (const scn of SCNS) {
      const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone });
      await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.goto('https://gns.test/?phone=' + (phone ? 1 : 0) + (scn === 'menu' ? '' : '&scn=' + scn), { waitUntil: 'load' }).catch(e => errs.push('goto ' + e.message));
      await sleep(3500);
      const res = await p.evaluate(() => {
        const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0 ? r : null; };
        const q = document.querySelector('.gxst-q'), qr = q && vis(q);
        const titles = [...document.querySelectorAll('.gx-bar h1,#start h1,.ttl h1,.ttl .tag,.ttl small')].map(e => ({ e, r: vis(e) })).filter(x => x.r);
        const hits = titles.filter(t => qr && !(qr.right <= t.r.left || qr.left >= t.r.right || qr.bottom <= t.r.top || qr.top >= t.r.bottom)).map(t => t.e.tagName + '.' + t.e.className + ' "' + t.e.textContent.trim().slice(0, 30) + '"');
        const h1 = document.querySelector('.gx-bar h1'), h1r = h1 && vis(h1);
        const clipped = h1r && h1.scrollWidth > h1.clientWidth + 1 ? 'h1 clipped ' + h1.scrollWidth + '>' + h1.clientWidth : '';
        const small = [];
        if (innerWidth >= 1024) {
          for (const e of document.querySelectorAll('.gx-bar h1,#ppop .pp-card text,#ppop .pp-card *')) {
            if (e.children.length) continue; const t = (e.textContent || '').trim(); if (!t || !vis(e) && !(e instanceof SVGElement)) continue;
            let px = parseFloat(getComputedStyle(e).fontSize);
            if (e instanceof SVGElement) { if (typeof e.getScreenCTM !== 'function') continue; const m = e.getScreenCTM(); if (!m) continue; px = parseFloat(e.getAttribute('font-size') || getComputedStyle(e).fontSize) * Math.hypot(m.a, m.b); }
            if (px < 15.95) small.push(px.toFixed(1) + 'px "' + t.slice(0, 20) + '"');
          }
        }
        const bar = document.querySelector('.gx-bar'), br = bar && bar.getBoundingClientRect();
        const over = br && bar.scrollWidth > bar.clientWidth + 1 ? 'bar overflows ' + bar.scrollWidth + '>' + bar.clientWidth : '';
        return { q: qr && [qr.left, qr.top, qr.right, qr.bottom].map(Math.round), hits, clipped, over, small, sw: document.documentElement.scrollWidth <= innerWidth + 1 ? '' : 'page h-scroll ' + document.documentElement.scrollWidth };
      });
      const fail = res.hits.length || res.clipped || res.over || res.small.length || res.sw || errs.length;
      console.log((fail ? 'FAIL ' : 'ok   ') + W + 'x' + H, scn, JSON.stringify(res), errs.length ? 'ERR ' + errs.join('|') : '');
      if (fail) bad++;
      await ctx.close();
    }
  }
  await b.close(); console.log(bad ? 'FAIL ' + bad : 'ALL OK'); process.exit(bad ? 1 : 0);
})();
