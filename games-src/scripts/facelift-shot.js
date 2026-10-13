// usage: node facelift-shot.js <html-file> <outdir> <tag> [playButtonRegex] [glowSelector]
// Title, a few moves, board and (if present) menu at 390x763 and 1280x800 -> <outdir>/facelift-<tag>-<view>-<w>.png
const { chromium } = require('playwright'); const fs = require('fs');
const [file, out, tag, btn = 'Play now|Play vs|Play|Quick', glow = '.glow:not([disabled]),.fglow'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => { const b = await chromium.launch();
  for (const [w, h, mob] of [[390, 763, true], [1280, 800, false]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mob, isMobile: mob });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + require('path').resolve(file)); await sleep(2200);
    const sh = n => p.screenshot({ path: `${out}/facelift-${tag}-${n}-${w}.png` });
    await sh('title');
    const play = p.locator('button:visible', { hasText: new RegExp(btn) }).first();
    if (await play.count()) { for (let k = 0; k < 3; k++) { const q = p.locator('button:visible', { hasText: new RegExp(btn) }).first(); if (await q.count()) { await q.click({ timeout: 3000 }).catch(() => {}); await sleep(1500); } } await sleep(1500);
      for (let i = 0; i < (+process.env.N||10); i++) { const g = p.locator(glow).first(); if (await g.count()) await g.click({ timeout: 800, force: true }).catch(() => {}); await sleep(600); }
      await sh('board');
      const m = p.locator('#menubtn,[data-gx="menud"],[data-gx="setd"],#menu').first();
      if (await m.count()) { await m.click({ timeout: 2000 }).catch(() => {}); await sleep(700); await sh('menu'); } }
    console.log(w, 'errors', errs.slice(0, 3)); await ctx.close(); }
  await b.close(); })();
