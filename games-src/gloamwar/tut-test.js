// Walks the tutorial with real taps at 375x667: Next buttons and the spotlit target of each step. Exit 1 if it stalls or the page throws.
// node tut-test.js [url] [videoDir]
const path = require('path'), { chromium } = require(path.join(__dirname, '..', 'node_modules', 'playwright'));
const url = process.argv[2] || 'file://' + path.join(__dirname, 'gloamwar.html'), vid = process.argv[3];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, recordVideo: vid ? { dir: vid, size: { width: 375, height: 667 } } : undefined });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(700);
  await p.evaluate(() => startTutorial()); await p.waitForTimeout(1200);
  const seen = []; let stall = 0, last = '';
  for (let i = 0; i < 120; i++) {
    const st = await p.evaluate(() => { const s = GXT.state && GXT.state(); return { active: GXT.active(), step: s && (s.step != null ? s.step : s.i), id: GXT.current && GXT.current() && GXT.current().id }; });
    if (!st.active) break;
    const id = String(st.id); if (id !== last) { seen.push(id); last = id; stall = 0; } else stall++;
    if (stall > 25) { console.log('STALL at', id); break; }
    const next = await p.$('.gxt-next'); if (next && await next.isVisible()) { await next.tap().catch(() => {}); await p.waitForTimeout(700); continue; }
    const end = await p.$('.gxt-b.pri'); if (end && await end.isVisible()) { await end.tap().catch(() => {}); await p.waitForTimeout(500); continue; }
    // tap the target the step points at
    const tgt = await p.evaluate(() => { const c = GXT.current && GXT.current(); if (!c || !c.target) return null; const e = c.target(); if (!e || !e.getBoundingClientRect) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    if (tgt) { await p.touchscreen.tap(tgt.x, tgt.y); await p.waitForTimeout(900); } else await p.waitForTimeout(500);
    // free-play bits inside the tutorial (army move): finish them like a player would
    const pend = await p.evaluate(() => G && G.pend && sideToAct(G) === 'D' && !UI.hold ? G.pend.h : null);
    if (pend === 'amove' || pend === 'recruit') { await p.evaluate(() => { const m = AI.move(G, 'normal'); apply(m); }); await p.waitForTimeout(600); }
  }
  const done = await p.evaluate(() => !GXT.active());
  console.log('tutorial steps seen:', seen.join(' > '), '| finished:', done, '| errors:', errs.length ? errs.slice(0, 3).join(' | ') : 'none');
  await ctx.close(); await b.close(); process.exit(done && !errs.length ? 0 : 1);
})();
