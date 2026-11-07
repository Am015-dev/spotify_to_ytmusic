// A Quick game and Story chapter 1 played to the result ONLY by tapping visible, uncovered UI (no engine calls to move).
// node play-ui.js [quick|story]  (390x763 touch). Rival turns: the script taps the top bar (tap-to-speed-up).
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.join(__dirname, 'vale-of-banners.html');
const only = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  for (const mode of ['quick', 'story']) {
    if (only && only !== mode) continue;
    const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }), page = await ctx.newPage(), errs = [], fails = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(URL); await page.evaluate(() => { localStorage.clear(); try { GXT.markDone('vale-of-banners'); } catch (e) { } }); await page.reload(); await page.waitForTimeout(500);
    // find the first visible + uncovered element for a selector; returns centre or null
    const find = sel => page.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const hit = document.elementFromPoint(x, y); if (hit && (hit === e || e.contains(hit))) return { x, y }; } return null; }, sel);
    const tapFirst = async sel => { const p = await find(sel); if (!p) return false; await page.touchscreen.tap(p.x, p.y); return true; };
    let taps = 0; const T = async (sel, ms) => { if (await tapFirst(sel)) { taps++; await page.waitForTimeout(ms || 350); return true; } return false; };
    if (mode === 'quick') { await T('#quickB'); await T('#goB', 600); }
    else { await T('#storyB', 600); await T('.gxc-node.open', 600);
      for (let i = 0; i < 30; i++) { if (await T('.gxc-btn.go, .gxc-btn:not(.ghost)', 600)) continue; if (await page.evaluate(() => !!(window.G && !G.over && UI.mode === 'story'))) break; await page.waitForTimeout(300); } }
    let started = await page.evaluate(() => !!window.G); if (!started) fails.push('game did not start by taps');
    let stuck = 0, last = '';
    for (let i = 0; started && i < 4000; i++) {
      const st = await page.evaluate(() => ({ over: !!G.over, rs: !document.getElementById('rs').hidden, tv: !document.getElementById('tv').hidden, mine: !G.over && G.seats[VB.actor(G)].human, busy: UI.busy, k: G.turn + '/' + G.phase + '/' + G.round + '/' + G.P[0].used + '/' + G.P[0].store.length + '/' + G.pend.length + '/' + UI.sel }));
      if (st.rs) break;
      if (st.over) { await T('#resB', 600); await page.waitForTimeout(600); continue; }
      if (st.tv) { if (!(await T('#tv .acts .btn:not(.alt)', 450))) await T('#tv .acts .btn', 450); continue; }
      if (await T('.gxh-bubble button, .gxh-coach button, .gxh-x', 300)) continue;
      if (!st.mine || st.busy) { await page.touchscreen.tap(100, 28); await page.waitForTimeout(250); continue; }
      if (st.k === last) stuck++; else { stuck = 0; last = st.k; } if (stuck > 25) { fails.push('stuck at ' + st.k); break; }
      if (await T('#es .cell.glow', 500)) continue;
      if (await T('#endB', 500)) continue;
      if (await T('#store .tilebtn.glow', 300)) continue;
      if (await T('#mk .stall:not(.lane) .tilebtn.glow', 350)) continue;
      if (await T('#mk .stgoods.glow, #goods .gbtn.glow', 350)) continue;
      if (await T('#tabs .tab.has', 400)) continue;
      if (await T('#acts .btn', 450)) continue;
      await page.waitForTimeout(200);
    }
    const res = await page.evaluate(() => ({ rs: !document.getElementById('rs').hidden, txt: (document.querySelector('#rs h2') || {}).textContent, vp: G && G.P.map(p => p.vp).join(' vs ') }));
    if (!res.rs) fails.push('result not reached');
    await page.screenshot({ path: `shots/play-${mode}-result.png` });
    if (errs.length) fails.push('console errors: ' + errs.slice(0, 2).join(' | '));
    console.log(`${fails.length ? 'FAIL' : 'PASS'} ${mode} by UI taps 390x763: ${taps} taps, result "${res.txt}" (${res.vp})${fails.length ? ' :: ' + fails.join('; ') : ''}`);
    bad += fails.length; await ctx.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
