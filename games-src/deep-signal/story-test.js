// Story stages 1-2 with real taps: map -> mission 1 (the tutorial) -> result -> map -> mission 2 played by taps -> result. Phone + PC.
// Usage: node story-test.js <url>
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const b = await chromium.launch(); let fails = 0;
  for (const [nm, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(url + '?fast=1'); await p.waitForTimeout(500);
    const pt = async (s, i = 0) => { const l = typeof s === 'string' ? p.locator(s).nth(i) : s; const bx = await l.boundingBox().catch(() => null); if (!bx) return false; const x = bx.x + Math.min(12, bx.width / 2), y = bx.y + Math.min(30, bx.height / 2); if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); return true; };
    const gxcBtn = async re => { const ls = p.locator('.gxc-btn:visible'); const n = await ls.count(); for (let i = 0; i < n; i++) { const t = (await ls.nth(i).innerText()).trim(); if (re.test(t)) { await pt(ls.nth(i)); return t; } } return null; };
    const through = async () => { for (let i = 0; i < 20; i++) { await p.waitForTimeout(300); const t = await gxcBtn(/^(Play|Play again|Skip|Next|Fight)$/); if (!t) { if (!(await p.locator('.gxc-screen:visible').count())) return true; } } return false; };
    const tut = async () => { for (let i = 0; i < 300; i++) { await p.waitForTimeout(150); const st = await p.evaluate(() => GXT.state().phase === 'end' ? 'end' : GXT.active() && GXT.current() ? GXT.current().id : 'off'); if (st === 'end') return true; if (st === 'off') return false;
      if (await p.locator('.gxt-next:visible').count()) { await pt('.gxt-next'); continue; } if (st === 'task') await pt('#pool .tcard'); if (st === 'lead') await pt('#hand .cd[data-c="c9"]'); } return false; };
    const play = async () => { for (let i = 0; i < 900; i++) { if (await p.evaluate(() => !!(G.result && UI.ended))) return p.evaluate(() => G.result.ok); 
        if (await p.locator('.gxh-bub button:visible').count()) { await pt('.gxh-bub button'); continue; }
        if (await p.locator('#pool .tcard.legal').count()) { await pt('#pool .tcard', await p.evaluate(() => AIX.draftPick(G, G.draftTurn))); continue; }
        if (await p.locator('#askp.on .btn').count()) { await pt('#askp.on .btn'); continue; }
        if (await p.locator('#hand .cd.legal').count()) { const c = await p.evaluate(() => AIX.choosePlay(G, G.turn, 'normal')); if (!(await pt(`#hand .cd.legal[data-c="${c}"]`))) await pt('#hand .cd.legal'); continue; }
        await p.waitForTimeout(80); } return null; };
    await pt('#storyB'); await p.waitForTimeout(500);
    await pt('.gxc-node.next'); await p.waitForTimeout(300); const ok1 = await through();
    const t1 = ok1 && await tut(); await p.waitForTimeout(700); await pt('.gxt-endc button, .gxt-dlg button'); await p.waitForTimeout(1200);
    await p.screenshot({ path: `shots/story-${nm}-1.png` });
    for (let i = 0; i < 6; i++) { if (await p.locator('.gxc-node:visible').count()) break; await gxcBtn(/Continue|Map|Skip|Next/); await p.waitForTimeout(400); }
    const s1 = await p.evaluate(() => GXC.progress().ch.m1); console.log(nm, 'story 1 (tutorial)', t1 && s1 && s1.beaten ? 'PASS' : 'FAIL', JSON.stringify(s1)); if (!(t1 && s1 && s1.beaten)) fails++;
    await pt('.gxc-node.next'); await p.waitForTimeout(300); const ok2 = await through(); const r2 = ok2 ? await play() : null;
    await p.waitForTimeout(2500); await p.screenshot({ path: `shots/story-${nm}-2.png` });
    for (let i = 0; i < 6; i++) { if (await p.locator('.gxc-node:visible').count()) break; await gxcBtn(/Continue|Map|Skip|Next/); await p.waitForTimeout(400); }
    const s2 = await p.evaluate(() => GXC.progress().ch.m2); console.log(nm, 'story 2', r2 == null ? 'FAIL no result' : 'PASS (' + (r2 ? 'won' : 'lost') + ')', JSON.stringify(s2), 'errors', errs.length, errs[0] || ''); if (r2 == null || !s2 || errs.length) fails++;
    await ctx.close();
  }
  await b.close(); console.log(fails ? 'STORY FAIL' : 'STORY PASS'); process.exit(fails ? 1 : 0);
})();
