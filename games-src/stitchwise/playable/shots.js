// First-minute shots: node playable/shots.js WxH prefix   (URL env = served page). Real taps only.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const [w, h] = (process.argv[2] || '390x763').split('x').map(Number), pre = process.argv[3] || 'b';
const OUT = path.join(__dirname, '..', 'shots', 'playable'); fs.mkdirSync(OUT, { recursive: true });
const URL = process.env.URL || 'http://localhost:8765/stitchwise/index.html';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const touch = w < 900;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const shot = n => pg.screenshot({ path: path.join(OUT, `${pre}-${w}-${n}.png`) });
  const click = async s => { const e = await pg.$(s); const bb = await e.boundingBox(); if (touch) await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await pg.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); };
  await pg.goto(URL); await pg.waitForTimeout(900); await shot('1title'); await click('[data-a=rules]'); await pg.waitForTimeout(600); await shot('1help'); await pg.reload(); await pg.waitForTimeout(700);
  // tutorial
  const tb = await pg.$("#start [data-a=start]"); if (tb) { await click("#start [data-a=start]"); await pg.waitForTimeout(1500); await shot("2coach1"); const c = await pg.$("#offers .offer.can"); if (c) { await click("#offers .offer.can"); await pg.waitForTimeout(500); await shot("2coach2"); } }
  // quick game
  await pg.goto(URL); await pg.evaluate(() => { localStorage.setItem('sw_seen', '1'); }); await pg.reload(); await pg.waitForTimeout(700);
  await click('[data-a=quick]'); await pg.waitForTimeout(300); const nc = await pg.$('text=Normal computer'); if (nc) { await nc.click(); await pg.waitForTimeout(300); }
  const st = await pg.$('text=Start the game'); if (st) { await st.click(); }
  await pg.waitForTimeout(500); await shot('3goal'); if (await pg.$('#goalcard')) await click('#goalcard [data-a=goalok]');
  await pg.waitForTimeout(1500); await shot('3first');
  // Advance, then catch rival turn
  await pg.waitForFunction(() => G && !UI.busy && isHuman(swWho(G)), null, { timeout: 20000 });
  await click('[data-a=adv]'); for (let i = 0; i < 40; i++) { await pg.waitForTimeout(150); if (await pg.evaluate(() => G && !isHuman(swWho(G)))) break; }
  await pg.waitForTimeout(500); await shot('4rival'); for (let i = 0; i < 60; i++) { await pg.waitForTimeout(100); if (await pg.evaluate(() => UI.peek >= 0)) break; } await pg.waitForTimeout(450); await shot('4rival2');
  await pg.waitForFunction(() => G && !UI.busy && isHuman(swWho(G)), null, { timeout: 30000 }); await pg.waitForTimeout(1300); await shot('5mine');
  const can = await pg.$('#offers .offer.can'); if (can) { await click('#offers .offer.can'); await pg.waitForTimeout(500); await shot('5picked'); }
  await pg.goto(URL.replace(/\?.*/, '') + '?scn=sw-result'); await pg.waitForTimeout(4000); await shot('6result');
  console.log('errors', JSON.stringify(errs)); await b.close();
})();
