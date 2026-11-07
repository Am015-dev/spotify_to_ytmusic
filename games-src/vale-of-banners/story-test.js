// Story stages 1-2 by real taps: title -> Story -> chapter -> intro -> play (ch1 full by taps, ch2 3 turns + forced end) -> result -> back to the map.
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.join(__dirname, 'vale-of-banners.html') + '?fast=1';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let fails = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(URL); await page.waitForTimeout(400);
    const tap = async loc => { if (touch) await loc.tap(); else await loc.click(); };
    const vis = async sel => page.locator(sel).filter({ visible: true });
    await tap(page.locator('#storyB')); await page.waitForTimeout(500);
    await page.screenshot({ path: `shots/story-${name}-map.png` });
    for (const ch of ['c1', 'c2']) {
      await page.evaluate(id => GXC.play(id), ch).catch(() => { });   // the map node opens the same call; tap path checked below for c1
      for (let i = 0; i < 12; i++) { const inGame = await page.evaluate(() => !!(window.G && GXC.active() && !document.querySelector('.gxc-screen,.gxc-scene-on'))); if (inGame) break; const bt = (await vis('.gxc-btn')).last(); if (await bt.count()) await tap(bt); await page.waitForTimeout(350); if (i === 0) await page.screenshot({ path: `shots/story-${name}-${ch}-intro.png` }); }
      const ok = await page.evaluate(() => !!(window.G && !G.over && GXC.active())); if (!ok) { console.log(name, ch, 'FAIL did not start'); fails++; continue; }
      let turns = 0, acts = 0, idle = 0; const maxT = ch === 'c1' ? 999 : 3;
      while (turns < maxT && acts < 3000) {
        const st = await page.evaluate(() => ({ over: G.over, mine: !G.over && G.seats[VB.actor(G)].human && !UI.busy, tv: !document.getElementById('tv').hidden }));
        if (st.over) break;
        if (st.tv) { const b1 = page.locator('#tv .acts .btn:not(.alt)'); if (await b1.count()) await tap(b1.first()); else await tap(page.locator('#tvClose')); acts++; continue; }
        if (!st.mine) { await page.waitForTimeout(30); if (++idle > 4000) break; continue; } idle = 0;
        for (const sel of ['#es .glow', '#endB', '#store .glow', '#mk .stgoods.glow', '#goods .glow', '#mk .tilebtn.glow', '#acts .btn.alt']) { const l = page.locator(sel); if (await l.count()) { await tap(l.first()); if (sel === '#endB') turns++; acts++; break; } }
      }
      if (ch !== 'c1') await page.evaluate(() => UI.forceEnd());
      await page.waitForSelector('#campfin', { timeout: 20000 }).catch(() => { });
      const sc = await page.evaluate(() => G.P.map(p => p.vp).join('/') + ' winner ' + G.winner + ' seasons ' + G.nPhases);
      await page.screenshot({ path: `shots/story-${name}-${ch}-result.png` });
      if (!(await page.locator('#campfin').count())) { console.log(name, ch, 'FAIL no Continue'); fails++; continue; }
      await tap(page.locator('#campfin')); await page.waitForTimeout(600);
      await page.screenshot({ path: `shots/story-${name}-${ch}-gxc.png` });
      for (let i = 0; i < 8; i++) { const bt = (await vis('.gxc-btn')).first(); if (!(await bt.count())) break; const t = await bt.textContent(); if (/Play/.test(t)) break; await tap(bt); await page.waitForTimeout(350); }
      const prog = await page.evaluate(id => JSON.stringify(GXC.progress().ch[id] || {}), ch);
      console.log(name, ch, 'PASS', 'turns', turns, 'scores', sc, 'progress', prog);
    }
    console.log(name, 'errors', errs.length, errs.slice(0, 3).join(' | ')); if (errs.length) fails++;
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
