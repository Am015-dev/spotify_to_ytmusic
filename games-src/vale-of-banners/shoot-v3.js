// v3 shots (turn flow + scoring preview): node shoot-v3.js [tag] -> playable-shots/<tag>-<size>-<scene>.webp (needs PIL via python3 for webp)
const { chromium } = require('playwright'); const path = require('path'); const { execSync } = require('child_process');
const URL = 'file://' + path.join(__dirname, 'vale-of-banners.html'); const TAG = process.argv[2] || 'v3';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    const shot = async n => { const f = path.join(__dirname, 'shots', `${TAG}-${name}-${n}.png`); await page.screenshot({ path: f }); execSync(`python3 -c "from PIL import Image;Image.open('${f}').save('${path.join(__dirname, 'playable-shots', TAG + '-' + name + '-' + n + '.webp')}',quality=72)"`); };
    const tap = async loc => { if (touch) await loc.tap(); else await loc.click(); };
    const until = async (fn, ms) => { for (let t = 0; t < ms; t += 100) { if (await page.evaluate(fn)) return true; await page.waitForTimeout(100); } return false; };
    await page.goto(URL); await page.evaluate(() => { localStorage.clear(); try { GXT.markDone('vale-of-banners'); } catch (e) { } }); await page.reload(); await page.waitForTimeout(500);
    await page.evaluate(() => startGame({ n: 2, ai: 'normal', seed: 5 }));
    await until(() => myTurn() && !UI.busy, 20000); await page.waitForTimeout(1800); await shot('1yourturn');
    // stack a buildable tile next to home so the build preview shows
    await page.evaluate(() => { const p = G.P[0]; const land = Object.keys(p.estate).map(Number); const cand = VB.CELLS.filter(c => !p.estate[c.i] && ['mine', 'ship', 'castle'].includes(c.col) && c.nb.some(n => p.estate[n]));
      const c = cand[0] || VB.CELLS.filter(c => !p.estate[c.i] && c.nb.some(n => p.estate[n]))[0]; p.store = [{ id: 'shot1', t: c.col === 'pas' || c.col === 'bld' || c.col === 'know' ? 'mine' : c.col }]; if (p.store[0].t !== c.col) p.store[0].t = 'mine';
      p.dice = [c.num, (c.num % 6) + 1]; p.used = [false, false]; render(); });
    await tap(page.locator('#st-0')); await page.waitForTimeout(500); await shot('2preview');
    const g = page.locator('#es .cell.glow').first(); if (await g.count()) { await tap(g); await page.waitForTimeout(1600); }
    // second die: market take or workers
    for (let k = 0; k < 6 && await page.evaluate(() => myTurn() && !(G.P[0].used[0] && G.P[0].used[1])); k++) {
      const mt = page.locator('#tab-market'); if (await mt.count() && await mt.isVisible()) { await tap(mt); await page.waitForTimeout(300); }
      if (k === 0) await shot('3market');
      const t = page.locator('#mk .tilebtn.glow').first(); if (await t.count()) { await tap(t); await page.waitForTimeout(400); const a = page.locator('#tv .acts .btn:not(.alt)').first(); if (await a.count()) await tap(a); await page.waitForTimeout(1400); continue; }
      const w = page.locator('#acts .btn.alt').first(); if (await w.count()) { await tap(w); await page.waitForTimeout(1200); }
    }
    const e = page.locator('#endB'); if (await e.count()) await tap(e);
    await until(() => document.querySelector('#beat.on'), 3000); await page.waitForTimeout(350); await shot('4turnover');
    await until(() => !document.querySelector('#beat.on') && !myTurn() && UI.cap, 8000); await page.waitForTimeout(300); await shot('5rival');
    await page.evaluate(() => { window.AUTO = setInterval(() => { if (document.querySelector('#beat.on.round')) return; if (myTurn() && !UI.busy) { const m = VB.validMoves(G); doMove(m.find(x => x.k === 'end') || m.find(x => x.k === 'workers') || m[0]); } }, 400); });
    if (await until(() => document.querySelector('#beat.on.round'), 45000)) { await page.evaluate(() => clearInterval(AUTO)); await page.waitForTimeout(350); await shot('6roundend'); } else bad++;
    await page.goto(URL + '?scn=vb-result'); await page.waitForTimeout(2500); await shot('7result');
    console.log(name, errs.length ? 'FAIL errors ' + errs.slice(0, 2).join(' | ') : 'PASS shots'); bad += errs.length; await ctx.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
