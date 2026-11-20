// F15 proof: goal card, mid-game and round card at 375x667, and 1366x768 / 1920x1080 by mouse. Also reports clipped hand names and text under 12 px on PC.
// node f15-shots.js   (python3 build.py first)
const { chromium } = require('playwright'), serve = require('./serve.js'), fs = require('fs');
(async () => {
  const S = await serve(), b = await chromium.launch();
  for (const [W, H, touch, tag] of [[375, 667, true, '375x667'], [1366, 768, false, '1366x768'], [1920, 1080, false, '1920x1080']]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('vinegrave-prefs', JSON.stringify({ played: true })); localStorage.setItem('gxt-vinegrave', JSON.stringify({ done: true })); } catch (e) { } });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
    const click = async sel => { const e = p.locator(sel).first(); if (touch) { const bb = await e.boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); } else await e.click(); };
    await p.goto(S.url); await p.waitForSelector('#start .tbtn'); await click('#start .tbtn');
    await p.waitForSelector('#goal .tbtn'); await p.waitForTimeout(400); await p.screenshot({ path: `proof/f15-${tag}-1-howyouscore.png` }); await click('#goal .tbtn');
    await p.waitForTimeout(500); await p.screenshot({ path: `proof/f15-${tag}-2-board.png` });
    let shot = 0;
    for (let k = 0; k < 160 && shot < 2; k++) {
      await p.waitForFunction(() => window.G && (G.phase === 'over' || myTurn() || (document.querySelector('#rcard') && !document.querySelector('#rcard').hidden)), null, { timeout: 30000 }).catch(() => { });
      if (await p.evaluate(() => G.phase === 'over')) break;
      if (await p.evaluate(() => { const r = document.querySelector('#rcard'); return r && !r.hidden; })) { await p.screenshot({ path: `proof/f15-${tag}-3-roundcard.png` }); shot++; await click('#rcard .tbtn'); continue; }
      if (await p.evaluate(() => !document.querySelector('#fx').hidden)) { await click('#fx .fxcard').catch(() => { }); continue; }
      if (!(await p.evaluate(() => myTurn()))) continue;
      if (k === 6) await p.screenshot({ path: `proof/f15-${tag}-4-midgame.png` });
      const s = await p.evaluate(() => ['.site.glow', '#hand .cd.glow', '#row .cd.glow', '#track.glow'].find(x => document.querySelector(x)) || null);
      if (!s) { if (await p.locator('#passbtn').count()) await click('#passbtn'); else if (await p.locator('#qbox .btn').count()) await click('#qbox .btn'); continue; }
      await click(s); await p.waitForTimeout(250); if (await p.locator('#gobtn').count()) await click('#gobtn'); await p.waitForTimeout(250);
    }
    const rep = await p.evaluate(() => { const clipped = [...document.querySelectorAll('#hand .cd .cn')].filter(e => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1).map(e => e.textContent);
      const small = [...document.querySelectorAll('body *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && e.offsetParent && parseFloat(getComputedStyle(e).fontSize) < 12 && !e.closest('svg')).map(e => e.className + ':' + e.textContent.trim().slice(0, 14) + ':' + getComputedStyle(e).fontSize);
      return { clipped, small: small.slice(0, 8), innerW: innerWidth }; });
    console.log(tag, 'errors', errs.length, errs[0], JSON.stringify(rep)); await ctx.close();
  }
  await b.close(); S.close && S.close();
})();
