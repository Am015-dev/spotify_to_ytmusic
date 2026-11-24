// node proof/record.js <html> <out-prefix> [video.webm|-] [w h touch]   plays a full 20-turn game by real touch at 402x874; shots at turn 1 and mid-game (8+ tiles)
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const { humanTurn } = require('../smoke.js');
(async () => {
  const [html, pre, vid] = process.argv.slice(2), w = +process.argv[5] || 402, h = +process.argv[6] || 874, touch = process.argv[7] !== '0';
  const tmp = path.join(path.dirname(pre), 'vtmp' + Date.now());
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 2, ...(vid && vid !== '-' ? { recordVideo: { dir: tmp, size: { width: w, height: h } } } : {}) });
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e)));
  const tap = s => touch ? p.locator(s).first().tap() : p.locator(s).first().click();
  await p.goto('file://' + path.resolve(html) + '?fast=1'); await p.waitForTimeout(700);
  await tap('#quickB'); await tap('#goB'); await p.waitForTimeout(1200);
  const st = p.locator('button:visible', { hasText: /^Start$/ }); if (await st.count()) { await st.first().tap().catch(() => { }); await p.waitForTimeout(900); }
  await p.screenshot({ path: pre + '-turn1.png' });
  let mid = 0;
  for (let t = 0; t < 20; t++) {
    await humanTurn(p, tap, true);
    if (!mid && (await p.evaluate(() => Object.keys(G.seats[0].env).length)) >= 9) {
      mid = 1; await p.waitForFunction(() => G.stage === 'pick' && !G.seats[G.cur].ai, null, { timeout: 30000 }).catch(() => { }); await p.waitForTimeout(1500);
      await p.screenshot({ path: pre + '-mid.png' });
      await tap('#mk .mt:not([disabled])'); await p.waitForTimeout(900); await p.screenshot({ path: pre + '-mid-spots.png' });
      await p.evaluate(() => undoTake()); await p.waitForTimeout(600);
    }
  }
  await p.waitForSelector('#againB', { timeout: 30000 }); await p.waitForTimeout(800); await p.screenshot({ path: pre + '-result.png' });
  console.log('PASS full game, errors', errs.length, errs.slice(0, 3), 'scores', await p.evaluate(() => G.res.map(r => r.total).join('/')));
  const v = p.video(); await ctx.close(); await b.close();
  if (v) { fs.copyFileSync(await v.path(), vid); fs.rmSync(tmp, { recursive: true, force: true }); }
})().catch(e => { console.log('FAIL', e.message.split('\n')[0]); process.exit(1); });
