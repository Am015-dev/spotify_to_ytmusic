// First-minute screens at phone + PC: title, tutorial steps 1-3, first turn, rival turn, result. node tests/firstmin-shots.js <url> <outdir>
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://127.0.0.1:8765/perch-and-plume/', OUT = process.argv[3] || 'shots/firstmin';
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  for (const [nm, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    const tap = async s => { const e = await p.$(s); if (!e) throw new Error('no ' + s); touch ? await e.tap() : await e.click(); };
    const shot = async n => p.screenshot({ path: `${OUT}/${nm}-${n}.png` });
    await p.goto(URL); await p.waitForTimeout(1200); await shot('1-title');
    // tutorial
    const tb = await p.$('[data-gxt-open]'); if (tb) { await tap('[data-gxt-open]'); await p.waitForTimeout(1500); await shot('2-tut1');
      for (let i = 2; i <= 3; i++) { const nx = await p.$('.gxt-next, .gxt button'); if (nx) { touch ? await nx.tap().catch(()=>{}) : await nx.click().catch(()=>{}); } await p.waitForTimeout(1200); await shot(`2-tut${i}`); } }
    // quick game vs computer
    await p.goto(URL); await p.evaluate(() => localStorage.setItem('pp-played', '1')); await p.goto(URL); await p.waitForTimeout(800);
    await tap('[data-t="quick"]'); await p.waitForTimeout(400); await tap('[data-go]'); await p.waitForTimeout(600); await shot('3-keep');
    await tap('#keepgo'); await p.waitForTimeout(2500); await shot('4-firstturn');
    await tap('.ract[data-h="2"]'); await p.waitForTimeout(700); await shot('5-action');
    const tr = await p.$('#tray .bc, #tray [data-i]'); if (tr) { touch ? await tr.tap() : await tr.click(); }
    for (let k = 0; k < 10; k++) { await p.waitForTimeout(450); await shot(`6-rival-${k}`); }
    await p.goto(URL + '?scn=pp-result'); await p.waitForTimeout(2500); await shot('7-result');
    console.log(nm, 'errors', errs.length, errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close();
})();
