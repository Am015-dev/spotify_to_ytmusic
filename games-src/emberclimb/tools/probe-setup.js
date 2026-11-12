// Setup screen fit probe: every hero card, both difficulty buttons and Start climb inside the viewport at the phone-check sizes.
// Run: node tools/probe-setup.js [outdir]
const { chromium } = require('playwright'), { serve } = require('./tap-lib');
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch(); let bad = 0;
  for (const [w, hgt] of [[390, 763], [375, 553], [844, 390], [375, 667]]) {
    const pg = await (await br.newContext({ viewport: { width: w, height: hgt }, hasTouch: true, isMobile: true })).newPage();
    await pg.goto(base); await pg.waitForSelector('#title'); await pg.evaluate(() => { UI.sub = 'quick'; UI.render(); });
    await pg.waitForTimeout(300);
    const r = await pg.evaluate(() => [...document.querySelectorAll('#title .hero, #title [data-diff], #play')].map(e => { const b = e.getBoundingClientRect(); return { t: e.innerText.split('\n')[0], ok: b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth, h: Math.round(b.height) }; }));
    const off = r.filter(x => !x.ok); if (off.length) bad++;
    console.log(w + 'x' + hgt, off.length ? 'OFF: ' + off.map(x => x.t).join(', ') : 'all ' + r.length + ' on screen', 'diff btn h', r.filter(x => /Gentle|Tabletop/.test(x.t)).map(x => x.h).join('/'));
    if (process.argv[2]) await pg.screenshot({ path: process.argv[2] + '/setup-' + w + 'x' + hgt + '.png' });
  }
  await br.close(); srv.close(); console.log(bad ? 'SETUP FIT FAIL' : 'SETUP FIT PASS'); process.exit(bad ? 1 : 0);
})();
