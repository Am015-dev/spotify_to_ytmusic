// Quick game (mission 1) and Story stage 1 played to the result at 390x763 by tapping only visible, uncovered UI (no engine calls to act).
// Every tap point is checked with elementFromPoint first. Usage: node tools/ui-play.js <url>
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const b = await chromium.launch(); let fails = 0;
  const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url + '?fast=1'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('ds-played', '1'); }); await p.reload(); await p.waitForTimeout(700);
  let covered = 0, taps = 0;
  // tap a visible point of the element that is really on top there (cards overlap: try a few points)
  const tap = async (loc) => { const l = typeof loc === 'string' ? p.locator(loc).first() : loc; if (!(await l.count()) || !(await l.isVisible().catch(() => false))) return false;
    const h = await l.elementHandle(); const pt = await p.evaluate(e => { const r = e.getBoundingClientRect(); for (const [fx, fy] of [[.5, .5], [.3, .2], [.5, .15], [.8, .2], [.2, .5]]) { const x = r.left + r.width * fx, y = r.top + r.height * fy; const t = document.elementFromPoint(x, y); if (t && (t === e || e.contains(t))) return { x, y }; } return null; }, h);
    if (!pt) { covered++; return false; } await p.touchscreen.tap(pt.x, pt.y); taps++; return true; };
  const gxcBtn = async re => { const ls = p.locator('.gxc-btn:visible'); const n = await ls.count(); for (let i = 0; i < n; i++) { const t = (await ls.nth(i).innerText()).trim(); if (re.test(t)) { await tap(ls.nth(i)); return t; } } return null; };
  const act = async () => {
    if (await tap('.gxh-bub button:visible')) return true;
    if (await tap('#zoom.on #zrow .btn:last-child')) return true;
    if (await tap('#pool .tcard.legal')) return true;
    if (await tap('#diveB')) return true;
    if (await tap('#askp.on .btn.pri')) return true;
    if (await tap('#askp.on .btn')) return true;
    const leg = p.locator('#hand .cd.legal'); const n = await leg.count(); for (let i = n - 1; i >= 0; i--) if (await tap(leg.nth(i))) return true;
    if (await tap('#drone .mini.legal')) return true;
    return false; };
  const toResult = async () => { for (let i = 0; i < 1500; i++) { if (await p.locator('#res.on, .gxc-screen:visible').count() && await p.evaluate(() => !!(G && G.result && UI.ended))) return true; if (!(await act())) await p.waitForTimeout(80); } return false; };
  // 1) Quick game
  await tap('#quickB'); await p.waitForTimeout(300); await tap('#startB');
  const q = await toResult(); const qr = await p.evaluate(() => G.result && (G.result.ok ? 'won' : 'lost: ' + G.result.why)); await p.waitForTimeout(800);
  console.log('quick game', q ? 'PASS (' + qr + ')' : 'FAIL'); if (!q) fails++;
  // 2) Story stage 1 (the staged first dive)
  await p.evaluate(() => showTitle()); await p.waitForTimeout(300);   // back to title (Menu > Title does the same)
  await tap('#storyB'); await p.waitForTimeout(600); await tap('.gxc-node.next'); await p.waitForTimeout(300);
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(300); const t = await gxcBtn(/^(Play|Play again|Skip|Next|Fight)$/); if (!t && !(await p.locator('.gxc-screen:visible').count())) break; }
  let end = false; for (let i = 0; i < 400; i++) { await p.waitForTimeout(150); const st = await p.evaluate(() => { const s = GXT.state && GXT.state(); return !s ? 'off' : s.phase === 'end' ? 'end' : s.shown ? (s.wait || 'next') : 'wait'; });
    if (st === 'end') { end = true; break; } if (st === 'off') break; if (st === 'next') { await tap('.gxt-next'); continue; } if (st === 'tap') { const t = await p.evaluate(() => { const e = GXT.current().target(); if (!e) return null; e.setAttribute('data-tt', '1'); return 1; }); if (t) { await tap('[data-tt="1"]'); await p.evaluate(() => document.querySelectorAll('[data-tt]').forEach(e => e.removeAttribute('data-tt'))); } } }
  await p.waitForTimeout(700); await tap('.gxt-endc button, .gxt-dlg button'); await p.waitForTimeout(1200);
  for (let i = 0; i < 6; i++) { if (await p.locator('.gxc-node:visible').count()) break; await gxcBtn(/Continue|Map|Skip|Next/); await p.waitForTimeout(400); }
  const s1 = await p.evaluate(() => GXC.progress().ch.m1); const sok = end && s1 && s1.beaten;
  console.log('story stage 1', sok ? 'PASS' : 'FAIL', JSON.stringify(s1)); if (!sok) fails++;
  console.log('taps', taps, 'covered targets skipped', covered, 'errors', errs.length, errs[0] || ''); if (errs.length) fails++;
  await b.close(); console.log(fails ? 'UI-PLAY FAIL' : 'UI-PLAY PASS'); process.exit(fails ? 1 : 0);
})();
