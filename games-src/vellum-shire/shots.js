// Dev screenshots: node shots.js [outdir]  (phone sizes, real taps)
const { chromium } = require('playwright'); const path = require('path');
const OUT = process.argv[2] || '/tmp/vs-shots'; require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[375, 667], [375, 553], [844, 390]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + path.resolve(__dirname, 'vellum-shire.html'));
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${OUT}/${w}x${h}-0start.png` });
    await p.tap('[data-s="vs"]'); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${OUT}/${w}x${h}-1board.png` });
    await p.tap('[data-die="0"]'); await p.waitForTimeout(300);
    await p.screenshot({ path: `${OUT}/${w}x${h}-2die.png` });
    const t = await p.$('.tile.tgt'); if (t) { await t.tap(); await p.waitForTimeout(300); }
    await p.screenshot({ path: `${OUT}/${w}x${h}-3sel.png` });
    console.log(w, h, errs.slice(0, 5));
    await p.close();
  }
  await b.close();
})();
