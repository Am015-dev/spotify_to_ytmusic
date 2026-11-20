// F2 proof shots: node shots-f2.js <html> <outdir>  (tutorial start at 3 sizes, then a few turns)
const { chromium } = require('playwright'); const fs = require('fs');
const HTML = process.argv[2], OUT = process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
const SIZES = [[375, 553, 1], [375, 667, 1], [1366, 768, 0]];
(async () => {
  const b = await chromium.launch();
  for (const [w, h, touch] of SIZES) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: !!touch, isMobile: !!touch });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + HTML); await p.waitForTimeout(600);
    const clk = s => touch ? p.tap(s) : p.click(s);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } });
    await p.evaluate(() => WDUI.startTutorial()); await p.waitForTimeout(900);
    const tag = w + 'x' + h;
    for (let i = 0; i < 4 && await p.$('#inspx'); i++) { await p.screenshot({ path: `${OUT}/${tag}-1-lesson${i}.png` }); await clk('#inspx'); await p.waitForTimeout(300); }
    await p.screenshot({ path: `${OUT}/${tag}-2-select.png` });
    const sc = await p.evaluate(() => { const t = document.getElementById('tray'); return { sw: t.scrollWidth, cw: t.clientWidth, sh: t.scrollHeight, ch: t.clientHeight, prompt: document.getElementById('prompt').textContent }; });
    console.log(tag, JSON.stringify(sc), errs.join('|'));
    await ctx.close();
  }
  await b.close();
})();
