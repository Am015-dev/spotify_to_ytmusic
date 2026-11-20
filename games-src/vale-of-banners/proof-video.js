// Records the first 3 minutes at 375x667 (touch) to proof/first-3-min-375x667.webm: title, How to play (opens above the title card), a Quick game
// played by real taps at a person's pace (★ tile, Take, stored tile, glowing space, workers, End turn when it is still needed). node proof-video.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.join(__dirname, 'vale-of-banners.html'), OUT = path.join(__dirname, 'proof'), SECS = +(process.env.SECS || 180);
(async () => {
  const b = await chromium.launch(); const vd = path.join(OUT, '.rec'); fs.mkdirSync(vd, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, recordVideo: { dir: vd, size: { width: 375, height: 667 } } });
  const page = await ctx.newPage(), t0 = Date.now(); let taps = 0, turns = 0;
  await page.goto(URL); await page.evaluate(() => { localStorage.clear(); try { GXT.markDone('vale-of-banners'); } catch (e) { } }); await page.reload(); await page.waitForTimeout(1500);
  const find = sel => page.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (!r.width) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2; if (y < 0 || y > innerHeight) continue; const hit = document.elementFromPoint(x, y); if (hit && (hit === e || e.contains(hit))) return { x, y }; } return null; }, sel);
  const T = async (sel, ms) => { const p = await find(sel); if (!p) return false; await page.touchscreen.tap(p.x, p.y); taps++; await page.waitForTimeout(ms || 900); return true; };
  await T('#howB', 2500); await page.mouse.wheel(0, 300); await page.waitForTimeout(1200); await T('#rulesd .gx-x', 900);
  if (!(await page.evaluate(() => !document.getElementById('start').hidden && !document.querySelector('.gx-scrim.on')))) await page.keyboard.press('Escape');
  await T('#quickB', 1200); await T('#goB', 2500); await T('#goalB', 1500);
  let lastTurn = -1;
  while (Date.now() - t0 < SECS * 1000) {
    const st = await page.evaluate(() => ({ tv: !document.getElementById('tv').hidden, mine: !!(G && !G.over && G.seats[VB.actor(G)].human && !UI.busy), rs: !document.getElementById('rs').hidden, turn: G && G.turn }));
    if (st.rs) break;
    if (st.tv) { if (!(await T('#tv .acts .btn:not(.alt)', 1100))) await T('#tv .acts .btn', 900); continue; }
    if (await T('.gxh-bubble button, .gxh-coach button, .gxh-ok', 700)) continue;
    if (!st.mine) { await page.waitForTimeout(400); continue; }
    if (st.turn !== lastTurn) { lastTurn = st.turn; turns++; await page.waitForTimeout(900); }
    if (await T('#mk .tilebtn.bestt.glow', 1000)) continue;
    if (await T('#es .cell.best.glow, #es .cell.glow', 1200)) continue;
    if (await T('#store .tilebtn.glow', 1000)) continue;
    if (await T('#goods .gbtn.glow', 1000)) continue;
    if (await T('#endB', 1200)) continue;
    if (await T('#mk .stall:not(.lane) .tilebtn.glow', 1000)) continue;
    if (await T('#mk .stgoods.glow', 1000)) continue;
    if (await T('#tabs .tab.has', 900)) continue;
    if (await T('#acts .btn, #goods .wkc', 1000)) continue;
    await page.waitForTimeout(300);
  }
  const v = page.video(); await ctx.close(); const src = await v.path(); fs.renameSync(src, path.join(OUT, 'first-3-min-375x667.webm')); fs.rmSync(vd, { recursive: true, force: true });
  console.log('proof video: ' + Math.round((Date.now() - t0) / 1000) + ' s, ' + turns + ' of your turns, ' + taps + ' taps');
  await b.close();
})();
