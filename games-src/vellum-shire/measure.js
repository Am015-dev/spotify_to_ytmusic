// Tap-target check: node measure.js [outdir]. Smallest box per kind at 375x667 and 375x553, normal and zoomed estate.
const { chromium } = require('playwright'); const path = require('path');
const OUT = process.argv[2] || '/tmp/vs-measure'; require('fs').mkdirSync(OUT, { recursive: true });
const URL = process.env.VS_URL || 'file://' + path.resolve(__dirname, 'vellum-shire.html');
(async () => {
  const b = await chromium.launch(); let bad = 0;
  for (const [w, h] of [[375, 667], [375, 553]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL); await p.waitForTimeout(600);
    await p.tap('[data-s="vs"]'); await p.waitForTimeout(1200);
    await p.evaluate(() => { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } });
    const m = () => p.evaluate(() => {
      const r = {}; const kinds = { hex: '[data-h]', stall: '[data-tile]', storage: '.sto', die: '.die', workers: '.wkb', silver: '.svb', goods: '.gstk', btn: '#acts .btn,.etab' };
      for (const k in kinds) { let mn = null; document.querySelectorAll(kinds[k]).forEach(e => { const q = e.getBoundingClientRect(); if (!q.width || getComputedStyle(e).display === 'none' || e.closest('[hidden]')) return; const v = Math.min(q.width, q.height); if (!mn || v < mn.v) mn = { v, s: Math.round(q.width) + 'x' + Math.round(q.height) }; }); r[k] = mn && mn.s; }
      let minFont = 99; document.querySelectorAll('#bd *,#dock *,.gx-bar *').forEach(e => { if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return; const q = e.getBoundingClientRect(); if (!q.width) return; minFont = Math.min(minFont, parseFloat(getComputedStyle(e).fontSize)); });
      r.minFont = minFont; r.zoomed = !!UI.zoomed; r.overflowX = document.documentElement.scrollWidth > innerWidth; return r;
    });
    const a = await m(); await p.screenshot({ path: `${OUT}/${w}x${h}-a.png` });
    await p.tap('[data-h="0"]').catch(() => { }); await p.waitForTimeout(400);
    const z = await m(); await p.screenshot({ path: `${OUT}/${w}x${h}-zoom.png` });
    console.log(w + 'x' + h, 'normal', JSON.stringify(a)); console.log(w + 'x' + h, 'zoomed', JSON.stringify(z), errs.slice(0, 3));
    await p.close();
  }
  await b.close();
})();
