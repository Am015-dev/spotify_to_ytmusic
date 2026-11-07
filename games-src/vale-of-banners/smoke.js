// Real-input smoke: from the title tap Quick game -> Start, play turns by tapping glowing things like a player, then force the end and reach the result.
// node smoke.js [url] ; FULL=1 plays the whole game by taps (no forced end). Phone portrait (touch) and PC (mouse).
const { chromium } = require('playwright'); const path = require('path');
const URL = process.argv[2] || 'file://' + path.join(__dirname, 'vale-of-banners.html') + '?fast=1';
const TURNS = process.env.FULL ? 999 : 3;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let fails = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['land', { width: 844, height: 390 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(400);
    const tap = async loc => { if (touch) await loc.tap(); else await loc.click(); };
    await tap(page.locator('#quickB')); await tap(page.locator('#goB'));
    let turns = 0, acts = 0, stuck = 0;
    while (turns < TURNS && acts < 4000) {
      const st = await page.evaluate(() => ({ over: G.over, mine: !G.over && G.seats[VB.actor(G)].human && !UI.busy, tv: !document.getElementById('tv').hidden, turn: G.turn }));
      if (st.over) break;
      if (st.tv) { const b1 = page.locator('#tv .acts .btn:not(.alt)'); if (await b1.count()) await tap(b1.first()); else await tap(page.locator('#tvClose')); acts++; continue; }
      if (!st.mine) { await page.waitForTimeout(30); stuck++; if (stuck > 3000) { console.log(name, 'FAIL waiting'); break; } continue; }
      stuck = 0;
      const order = ['#es .glow', '#endB', '#store .glow', '#mk .stgoods.glow', '#goods .glow', '#mk .tilebtn.glow', '#tabs .tab.has', '#acts .btn.alt'].map(x => x + ' >> visible=true');   // phone portrait: the market sits behind a tab
      let did = false;
      for (const sel of order) { const l = page.locator(sel); if (await l.count()) { const before = await page.evaluate(() => G.seq + ':' + UI.sel); await tap(l.first()); did = true; if (sel.startsWith('#endB')) turns++; acts++; await page.waitForTimeout(20); const after = await page.evaluate(() => G.seq + ':' + UI.sel + ':' + !document.getElementById('tv').hidden); if (sel === '#store .glow' && after.startsWith(before.split(':')[0]) && after.includes(':null:false')) { /* deselected */ } break; } }
      if (!did) { console.log(name, 'FAIL nothing to tap', await page.evaluate(() => VB.text(G))); fails++; break; }
      if (turns === 1 && acts < 40) await page.screenshot({ path: `shots/smoke-${name}-mid.png` });
    }
    if (!process.env.FULL) await page.evaluate(() => UI.forceEnd());
    await page.waitForSelector('#rs:not([hidden]) #again', { timeout: 30000 }).catch(() => { });
    const done = await page.locator('#rs:not([hidden]) #again').count(); await page.screenshot({ path: `shots/smoke-${name}-result.png` });
    const sc = await page.evaluate(() => G.P.map(p => p.vp).join('/') + ' over=' + G.over);
    console.log(name, done ? 'PASS reached result' : 'FAIL no result', 'turns', turns, 'taps', acts, 'scores', sc, 'errors:', errs.length, errs.slice(0, 2).join(' | ')); if (!done || errs.length) fails++;
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
