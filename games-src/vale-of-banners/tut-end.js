// Coached first game, from fresh storage, at 390x763 and 1440x860: the 2 spotlit steps by tapping their centres (elementFromPoint = target),
// then free play choosing legal moves only through visible, uncovered UI, to the result. Asserts every coverage rule was explained by Odo during
// the game, in the final walk-through, or on the "Things you'll meet later" card; then "Play a real game" starts a real game. node tut-end.js
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.join(__dirname, 'vale-of-banners.html');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), page = await ctx.newPage(), errs = [], fails = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(URL); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);
    const tapXY = async (x, y) => { if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); };
    const find = sel => page.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const hit = document.elementFromPoint(x, y); if (hit && (hit === e || e.contains(hit))) return { x, y }; } return null; }, sel);
    const T = async (sel, ms) => { const p = await find(sel); if (!p) return false; await tapXY(p.x, p.y); await page.waitForTimeout(ms || 350); return true; };
    await T('#tutB', 900);
    const forced = [];
    for (let i = 0; i < 60; i++) {   // the spotlit steps
      const st = await page.evaluate(() => { if (!GXT.running()) return { done: true }; const s0 = GXT.state(), c = GXT.current(); if (!c || s0.phase !== 'show') return { wait: true };
        const t = c.target && c.target(); if (!t) return { wait: true }; const r = t.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y);
        return { id: c.id, x, y, ok: !!hit && (hit === t || t.contains(hit)), hit: hit ? (hit.id || hit.className) : 'none' }; });
      if (st.done) break; if (st.wait) { await page.waitForTimeout(250); continue; }
      if (forced[forced.length - 1] !== st.id) forced.push(st.id); if (!st.ok) fails.push(st.id + ' covered by ' + st.hit);
      await tapXY(st.x, st.y); await page.waitForTimeout(700);
    }
    if (forced.length > 2) fails.push('more than 2 forced steps: ' + forced.join(','));
    let stuck = 0, last = '', moves = 0;
    for (let i = 0; i < 4000; i++) {   // free play: any legal move, by UI only
      const st = await page.evaluate(() => ({ rs: !document.getElementById('rs').hidden, over: !!G.over, tv: !document.getElementById('tv').hidden, mine: !G.over && G.seats[VB.actor(G)].human, busy: UI.busy, k: G.turn + '/' + G.round + '/' + G.P[0].used + '/' + G.P[0].store.length + '/' + G.pend.length + '/' + UI.sel + '/' + UI.tab }));
      if (st.rs) break;
      if (st.over) { await T('#resB', 600); continue; }
      if (st.tv) { if (!(await T('#tv .acts .btn:not(.alt)', 450))) await T('#tv .acts .btn', 450); moves++; continue; }
      if (!st.mine || st.busy) { await page.waitForTimeout(250); continue; }
      if (st.k === last) stuck++; else { stuck = 0; last = st.k; } if (stuck > 30) { fails.push('stuck at ' + st.k); break; }
      if (await T('#es .cell.glow', 500)) continue;
      if (await T('#endB', 500)) continue;
      if (await T('#store .tilebtn.glow', 300)) continue;
      if (await T('#mk .stall:not(.lane) .tilebtn.glow, #mk .stgoods.glow, #goods .gbtn.glow, #bl-0.glow', 350)) continue;
      if (await T('#tabs .tab.has', 350)) continue;
      if (await T('#acts .btn', 450)) continue;
      await page.waitForTimeout(200);
    }
    const res = await page.evaluate(() => ({ rs: !document.getElementById('rs').hidden, keys: Object.keys(VSTORY.coach), seen: Object.keys(UI.seen || {}), later: UI.later || [], said: UI.coachLog || 0,
      walk: !!document.querySelector('#rs .walk'), laterCard: [...document.querySelectorAll('#rs h3')].some(h => /later/i.test(h.textContent)) }));
    if (!res.rs) fails.push('result not reached');
    const missing = res.keys.filter(k => !res.seen.includes(k) && !res.later.includes(k)); if (missing.length) fails.push('rules never explained: ' + missing.join(','));
    if (!res.walk) fails.push('no final score walk-through');
    await page.screenshot({ path: `shots/coach-${name}-result.png` });
    if (res.rs) { await T('#realB', 900); if (!(await page.evaluate(() => !!G && !G.over && UI.mode === 'quick'))) fails.push('real game did not start'); }
    if (errs.length) fails.push('console errors: ' + errs.slice(0, 2).join(' | '));
    const during = res.seen.filter(k => res.keys.includes(k)).length;
    console.log(`${fails.length ? 'FAIL' : 'PASS'} coached tutorial ${name} (${vp.width}x${vp.height}): forced ${forced.join(',')}, ${res.said} coach lines, rules explained in play ${during}/${res.keys.length}, on the later card ${res.later.length}${fails.length ? ' :: ' + fails.join('; ') : ''}`);
    bad += fails.length; await ctx.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
