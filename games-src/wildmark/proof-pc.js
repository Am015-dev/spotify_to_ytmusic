// PC proof (owner, F3): one mouse game at 1366x768 and 1920x1080 -> proof/pc-<size>-pick.png and -place.png (rival panel, valley, market).
// Usage: [WM_URL=file://.../copy.html] node proof-pc.js   (WM_URL: a copy next to games/wildmark/media so the art loads)
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', 'node_modules', 'playwright'));
const URL = process.env.WM_URL || 'file://' + path.join(__dirname, 'wildmark.html');
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1366, 768], [1920, 1080]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    await p.addInitScript(() => { try { localStorage.setItem('wm-prefs', JSON.stringify({ played: 1, offered: 1 })); } catch (e) { } });
    await p.goto(URL); await p.waitForSelector('#playB'); await p.waitForTimeout(800); await p.click('#playB'); await p.waitForTimeout(1200);
    if (await p.locator('#goalGo').isVisible()) await p.click('#goalGo');
    for (let t = 0; t < 9; t++) {   // nine turns by mouse: the best column, the best spot, the best ringed tile (or Place tile)
      await p.waitForFunction(() => G && !G.seats[G.cur].ai && G.stage === 'pick' && myTurn(), null, { timeout: 60000 }); await p.waitForTimeout(400);
      await p.click('#mk .pair.top .mt').catch(() => p.click('#mk .mt:not([disabled])'));
      const sp = await p.evaluate(() => { const env = G.seats[G.cur].env; let best = null, bv = -99; for (const c of WM.spots(env)) { const v = pvSpotBest(env, c); if (v > bv) { bv = v; best = c; } } const r = document.querySelector('#map polygon.spot[data-c="' + best + '"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      await p.mouse.click(sp[0], sp[1]); await p.waitForTimeout(500);
      if (t === 8) { await p.screenshot({ path: path.join(__dirname, 'proof', `pc-${w}x${h}-place.png`) }); }
      const tg = await p.evaluate(() => { const e = document.querySelector('#map g.tgt'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      if (tg) await p.mouse.click(tg[0], tg[1]); else { await p.click('#okB'); await p.waitForTimeout(300); if (await p.evaluate(() => G.stage === 'tok')) await p.click('#backB'); }
    }
    await p.waitForFunction(() => !!UI.aiHold, null, { timeout: 20000 }).catch(() => { }); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(__dirname, 'proof', `pc-${w}x${h}-rival.png`) });
    await p.waitForFunction(() => G && !G.seats[G.cur].ai && G.stage === 'pick' && myTurn(), null, { timeout: 60000 }); await p.waitForTimeout(1800);
    await p.screenshot({ path: path.join(__dirname, 'proof', `pc-${w}x${h}-pick.png`) });
    await p.close();
  }
  await b.close(); console.log('proof/pc-*.png written');
})();
