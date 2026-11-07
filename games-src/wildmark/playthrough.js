// Plays like a player with real taps: (1) a full 20-turn game to the result screen, (2) the tutorial start to finish, (3) Story chapters 1-2 started
// and played to the result (chapter 1 solo, chapter 2 vs Pip). Phone 390x763 (touch) and PC 1440x860 (mouse). node playthrough.js [rounds=1]
const { chromium } = require('playwright'); const { humanTurn, EXE } = require('./smoke.js');
const URL = 'file://' + __dirname + '/wildmark.html';
(async () => {
  const b = await chromium.launch(EXE), rounds = +(process.argv[2] || 1); let fails = 0; const log = (...a) => console.log(...a);
  for (let rr = 0; rr < rounds; rr++) for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    const tap = s => touch ? p.locator(s).first().tap() : p.locator(s).first().click();
    try {
      // 1) full game vs 2 rivals
      await p.goto(URL + '?fast=1'); await tap('#quickB'); await tap('.seg[data-k="opp"] .sg[data-v="2"]'); await tap('#goB');
      for (let t = 0; t < 20; t++) await humanTurn(p, tap);
      await p.waitForSelector('#againB', { timeout: 30000 }); await p.screenshot({ path: `shots/full-${name}.png` });
      log(name, 'PASS full game', await p.evaluate(() => G.res.map(r => r.total).join('/')));
      // 2) tutorial
      await tap('#titleB'); await p.waitForSelector('.gxt-menu'); await tap('.gxt-menu');
      let n = 0;
      for (; n < 80; n++) {
        const st = await p.evaluate(() => window.GXT ? GXT.state() : { active: false });
        if (!st.active) break;
        if (st.phase === 'end') break;
        if (st.phase !== 'show') { await p.waitForTimeout(250); continue; }
        if (!st.wait) { const nb = p.locator('.gxt-b.pri, .gxt-next').first(); if (await nb.count()) { touch ? await nb.tap() : await nb.click(); } await p.waitForTimeout(250); continue; }
        const hole = st.hole; if (!hole) { await p.waitForTimeout(250); continue; }
        if (touch) await p.touchscreen.tap(hole.cx, hole.cy); else await p.mouse.click(hole.cx, hole.cy);
        await p.waitForTimeout(300);
        if (n === 9) await p.screenshot({ path: `shots/tut-${name}.png` });
      }
      const ts = await p.evaluate(() => GXT.state());
      await p.screenshot({ path: `shots/tutend-${name}.png` });
      if (ts.phase === 'end' || !ts.active) log(name, 'PASS tutorial', n, 'actions'); else { fails++; log(name, 'FAIL tutorial stuck at', ts.id, ts.phase); }
      // leave the tutorial end screen with its first button (Play / Story)
      const eb = p.locator('.gxt-end .gxt-b').first(); if (await eb.count()) { touch ? await eb.tap() : await eb.click(); }
      // 3) story chapters 1 and 2
      for (const id of ['c1', 'c2']) {
        await p.evaluate(() => { UI.sv = 'title'; showTitle(); });
        await tap('#storyB'); await p.waitForTimeout(400);
        await p.screenshot({ path: `shots/map-${name}.png` });
        await p.evaluate(i => GXC.play(i), id); await p.waitForTimeout(300); await p.locator('.gxc button:visible').filter({ hasText: /skip|start|fight/i }).first().waitFor({ timeout: 5000 }).catch(() => {});
        for (let k = 0; k < 6; k++) { const s = p.locator('.gxc button:visible').filter({ hasText: /skip|start|play|begin|continue|let|fight/i }).first(); if (!(await s.count())) break; touch ? await s.tap() : await s.click(); await p.waitForTimeout(300); if (await p.evaluate(() => !!(window.G && UI.mode === 'camp' && document.querySelector('.gxc') == null || (window.G && UI.mode === 'camp' && G.seats[0].done === 0 && !document.querySelector('.gxc:not([hidden])'))))) break; }
        await p.waitForFunction(() => UI.mode === 'camp' && G && !G.over, null, { timeout: 10000 });
        await p.screenshot({ path: `shots/story-${id}-${name}.png` });
        for (let t = 0; t < 20; t++) await humanTurn(p, tap, true);
        await p.waitForSelector('#campCont', { timeout: 30000 }); await tap('#campCont'); await p.waitForTimeout(600);
        await p.screenshot({ path: `shots/story-${id}-res-${name}.png` });
        const pr = await p.evaluate(i => JSON.stringify(GXC.progress().ch[i] || {}), id);
        log(name, 'PASS story', id, 'score', await p.evaluate(() => G.res[0].total), pr);
        for (let k = 0; k < 4; k++) { const s = p.locator('.gxc button:visible').filter({ hasText: /continue|map|skip|back|ok/i }).first(); if (!(await s.count())) break; touch ? await s.tap() : await s.click(); await p.waitForTimeout(300); }
      }
    } catch (e) { fails++; log(name, 'FAIL', e.message.split('\n')[0]); await p.screenshot({ path: `shots/fail-${name}.png` }); }
    log(name, 'errors', errs.length, errs.slice(0, 3).join(' | ')); if (errs.length) fails++;
    await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAIL ' + fails : 'PASS playthrough'); process.exit(fails ? 1 : 0);
})();
