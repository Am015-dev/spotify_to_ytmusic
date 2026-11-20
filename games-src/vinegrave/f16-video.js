// F16 proof video: the first 3 minutes of a first real game by touch at 375x667 (title, 'New this round', one-tap play, the score line tapped, round card). node f16-video.js
const { chromium } = require('playwright'), serve = require('./serve.js'), fs = require('fs');
(async () => {
  const S = await serve(), b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, recordVideo: { dir: 'proof/vid', size: { width: 375, height: 667 } } });
  await ctx.addInitScript(() => { try { localStorage.setItem('vinegrave-prefs', JSON.stringify({ played: true })); localStorage.setItem('gxt-vinegrave', JSON.stringify({ done: true })); } catch (e) { } });
  const p = await ctx.newPage(), v = p.video();
  const tap = async sel => { const bb = await p.locator(sel).first().boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); };
  await p.goto(S.url); await p.waitForSelector('#start .tbtn'); await p.waitForTimeout(1500); await tap('#start .tbtn');
  await p.waitForSelector('#goal .tbtn'); await p.waitForTimeout(3500); await tap('#goal .tbtn');
  const t0 = Date.now(); let mv = 0, shown = false;
  while (Date.now() - t0 < 170000) {
    await p.waitForFunction(() => window.G && (G.phase === 'over' || myTurn() || (document.querySelector('#rcard') && !document.querySelector('#rcard').hidden)), null, { timeout: 20000 }).catch(() => { });
    if (await p.evaluate(() => G.phase === 'over')) break;
    if (await p.evaluate(() => { const r = document.querySelector('#rcard'); return r && !r.hidden; })) { await p.waitForTimeout(3000); await tap('#rcard .tbtn').catch(() => { }); continue; }
    if (await p.evaluate(() => !document.querySelector('#fx').hidden)) { await tap('#fx .fxcard').catch(() => { }); continue; }
    if (!(await p.evaluate(() => myTurn() && !UI.busy))) continue;
    if (mv === 4 && !shown) { shown = true; await tap('#whyline'); await p.waitForTimeout(4500); await tap('#ptsheet .tbtn'); await p.waitForTimeout(600); }
    if (await p.evaluate(() => { const q = document.querySelector('#qbox'); return !!(q && !q.hidden && q.querySelector('button')); })) { await tap('#qbox .glow, #qbox button'); await p.waitForTimeout(900); continue; }
    const s = await p.evaluate(() => ['.site.glow', '#hand .cd.glow', '#row .cd.glow', '#track.glow'].find(x => document.querySelector(x)) || null);
    if (!s) { if (await p.locator('#passbtn').count()) await tap('#passbtn'); else if (await p.locator('#qbox .btn').count()) await tap('#qbox .btn'); await p.waitForTimeout(500); continue; }
    await tap(s); mv++; await p.waitForTimeout(700); if (await p.locator('#gobtn').count()) await tap('#gobtn'); await p.waitForTimeout(900);
  }
  await ctx.close(); const path = await v.path(); fs.copyFileSync(path, 'proof/first-3min-375x667.webm'); fs.rmSync('proof/vid', { recursive: true, force: true }); await b.close(); process.exit(0);
})();
