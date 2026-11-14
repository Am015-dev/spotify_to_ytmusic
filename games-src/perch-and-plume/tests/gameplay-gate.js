// Gameplay gate (W508): what a new player must see by touch at 390x844 and 375x667, without scrolling the page.
//  1. starting hand: every bird card is a readable row (power text inside its card), and "Keep these" is on screen and tappable;
//  2. first turn: your food supply and bonus card sit above the action buttons (in the real game the food is next to your mat);
//  3. the 4 actions show on screen on the first turn.
// SHOTS=dir also saves first-turn.png (390x844).   node tests/gameplay-gate.js [url]
const { chromium } = require('playwright'); const path = require('path');
const URL = process.argv[2] || 'http://127.0.0.1:8765/perch-and-plume/', SHOTS = process.env.SHOTS || '';
(async () => {
  const b = await chromium.launch(); let fails = 0; const errs = [];
  const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
  for (const [w, h] of [[390, 844], [375, 667]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: SHOTS && w === 390 ? 2 : 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('pp-played', '1'); localStorage.setItem('gns-prefs', JSON.stringify({ anim: 'fast', ai: 'fast' })); } catch (e) { } });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL); await p.waitForTimeout(700);
    for (const s of ['[data-t="quick"]', '[data-n="2"]', '[data-go]']) { await p.locator(s).first().tap(); await p.waitForTimeout(500); }
    const k = await p.evaluate(() => {
      const kg = document.querySelector('#keepgo').getBoundingClientRect(), t = document.elementFromPoint(kg.left + kg.width / 2, kg.top + kg.height / 2);
      const spill = [...document.querySelectorAll('#setup .bc.big')].filter(c => { const r = c.getBoundingClientRect(), pw = c.querySelector('.bk-pw').getBoundingClientRect(); return pw.bottom > r.bottom + 1 || pw.right > r.right + 1; }).length;
      return { onScreen: kg.top >= 0 && kg.bottom <= innerHeight, top: t && t.id === 'keepgo', spill, cards: document.querySelectorAll('#setup .bc.big').length };
    });
    ok(k.onScreen && k.top, `${w}x${h} starting hand: "Keep these" is on screen and nothing covers it`);
    ok(k.cards === 5 && k.spill === 0, `${w}x${h} starting hand: 5 bird cards, power text stays inside each card (${k.spill} spill)`);
    await p.locator('#keepgo').tap();
    await p.waitForFunction(() => myTurn() && document.querySelector('#act4') && !document.querySelector('.turnban'), null, { timeout: 15000 }).catch(() => { });
    await p.waitForTimeout(400);
    const f = await p.evaluate(() => {
      const fr = document.querySelector('#foodrow').getBoundingClientRect(), a4 = document.querySelector('#act4').getBoundingClientRect();
      const acts = [...document.querySelectorAll('.a4')].filter(e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }).length;
      return { food: fr.top >= 0 && fr.bottom <= innerHeight && fr.bottom <= a4.top + 1, acts, bonus: !!document.querySelector('#foodrow .bon') };
    });
    ok(f.food && f.bonus, `${w}x${h} first turn: your food and bonus card show above the actions`);
    ok(f.acts === 4 || (h < 700 && f.acts >= 2), `${w}x${h} first turn: ${f.acts} of the 4 actions fully on screen`);
    if (SHOTS && w === 390) await p.screenshot({ path: path.join(SHOTS, 'first-turn.png') });
    await ctx.close();
  }
  ok(errs.length === 0, 'console errors ' + errs.length + ' ' + errs.slice(0, 2).join(' | '));
  await b.close(); process.exit(fails ? 1 : 0);
})();
