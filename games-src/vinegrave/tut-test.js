// Coached-tutorial-to-end test (ADDENDUM 4): fresh storage, tap "Learn to play", do the 2 forced first steps by tapping the spotlit
// centre (elementFromPoint must be the target), then PLAY the coached game freely through the UI: tap any glowing site/card (any legal
// move, picked in rotation, not a scripted list), its action button, answer questions, use the tabs, pass when nothing glows. The rival
// is the real computer. Then the score walk-through (Next) and the end card, whose button must start a real game.
// Asserts: every coverage rule (V.STORY.coach ids = TUTORIAL-COVERAGE.md) was explained in the game or listed on the "meet later" card,
// at least 12 were explained in play, no console errors. node tut-test.js [shotsDir]   (python3 build.py first). Sizes 390x763, 1440x860.
const { chromium } = require('playwright'), serve = require('./serve.js'), fs = require('fs');
const OUT = process.argv[2] || null;
(async () => {
  const S = await serve(), b = await chromium.launch({ args: ['--no-sandbox'], executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }); let fails = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(S.url, { waitUntil: 'load' });
    const tapAt = async (x, y) => touch ? page.touchscreen.tap(x, y) : page.mouse.click(x, y);
    const shot = async n => { if (OUT) await page.screenshot({ path: `${OUT}/${n}-${name}.png` }); };
    const vis = sel => page.locator(sel).filter({ visible: true });
    const tapEl = async loc => { const h = await loc.elementHandle({ timeout: 2000 }).catch(() => null); if (!h) return false; const r = await h.boundingBox(); if (!r || r.width < 2) return false;
      const x = r.x + r.width / 2, y = r.y + r.height / 2; const top = await page.evaluate(([el, x, y]) => { const e = document.elementFromPoint(x, y); return !!(e && (e === el || el.contains(e))); }, [h, x, y]);
      if (!top) return false; await tapAt(x, y); return true; };
    await page.waitForSelector('#start .tbtn'); await page.waitForTimeout(400); await shot('a-title');
    const first = page.locator('#start .tbtn').first(); const lbl = (await first.textContent()).trim(); await tapEl(first);
    let ok = true, forced = 0, moves = 0, coachShots = 0; const t0 = Date.now();
    // 1) the forced first steps
    while (Date.now() - t0 < 60000) {
      if (await page.evaluate(() => !!UI.coachFree)) break;
      const st = await page.evaluate(() => window.GXT && GXT.state()); if (!st || !st.active) { await page.waitForTimeout(150); continue; }
      if (st.id === 'free' || !st.shown) { await page.waitForTimeout(150); continue; }
      const h = st.hole; const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const c = GXT.current(); const t = c && c.target && c.target(); return !!(t && t.contains && e && (t === e || t.contains(e))); }, [h.cx, h.cy]);
      if (!hit) { ok = false; console.log(name, 'FAIL forced step', st.id, 'target covered'); break; }
      await page.waitForTimeout(300); if (forced === 0) await shot('b-forced1'); forced++; await tapAt(h.cx, h.cy);
      await page.waitForFunction(i => GXT.state().i !== i || !GXT.state().shown, st.i, { timeout: 15000 }).catch(() => { ok = false; console.log(name, 'FAIL forced step', st.id, 'did not advance'); });
      if (!ok) break;
    }
    if (ok && forced > 2) { ok = false; console.log(name, 'FAIL more than 2 forced steps'); }
    // 2) free play to the end of the game
    while (ok && Date.now() - t0 < 600000) {
      const st = await page.evaluate(() => ({ id: UI.coachFree ? 'free' : 'done', mine: !!(window.G && myTurn() && !UI.busy), fx: !document.querySelector('#fx').hidden, over: !!(window.G && G.phase === 'over'), coach: !!document.querySelector('#coach.on') }));
      if (st.id !== 'free') break;
      if (process.env.DBG && Date.now() - (global.lastLog || 0) > 10000) { global.lastLog = Date.now(); console.log(name, 'live', JSON.stringify(st), moves, await page.evaluate(() => G.round + ' ' + VG.actor(G) + ' ' + JSON.stringify(VG.moves(G).map(m => m.t)).slice(0, 120))); await page.screenshot({ path: '/tmp/claude-0/sh/co/live.png' }); }
      if (st.coach && coachShots < 3) { coachShots++; await shot('c-coach' + coachShots); }
      if (st.fx) { await tapEl(vis('#fx .fxcard').first()); await page.waitForTimeout(150); continue; }
      if (st.over) { await page.waitForTimeout(300); continue; }
      if (await vis('#insp').count()) { await tapEl(vis('#insp .ix').first()); await page.waitForTimeout(150); continue; }
      if (!st.mine) { await tapEl(vis('#map').first()); await page.waitForTimeout(250); continue; }
      if (await vis('#qbox').count()) { const q = vis('#qbox .cd.glow, #qbox .btn.go'); if (await q.count()) await tapEl(q.first()); else await tapEl(vis('#qbox .btn').last()); await page.waitForTimeout(300); continue; }
      if (moves % 3 === 1) { const tb = vis('#vtabs button.has:not(.on)'); if (await tb.count()) { await tapEl(tb.first()); await page.waitForTimeout(200); } }
      if (moves % 4 === 2 && global.freeAt !== moves && await vis('#extra .tag').count()) { global.freeAt = moves; if (await tapEl(vis('#extra .tag').first())) { await vis('#insp .ibtns .btn').first().waitFor({ timeout: 1200 }).catch(() => { }); if (await vis('#insp .ibtns .btn').count()) await tapEl(vis('#insp .ibtns .btn').first()); await page.waitForTimeout(300); continue; } }
      const g = vis('#map .site.glow, #row .cd.glow, #hand .cd.glow'), n = await g.count(); let done = false;
      for (let k = 0; k < Math.min(n, 4) && !done; k++) {
        if (!(await tapEl(g.nth((moves + k * 2) % n)))) continue;
        const go = vis('#insp .btn.go'); await go.first().waitFor({ timeout: 1500 }).catch(() => { });
        if (await go.count() && await tapEl(go.first())) done = true; else if (await vis('#insp .ix').count()) await tapEl(vis('#insp .ix').first());
      }
      if (!done) { const p = vis('#acts .btn'); if (await p.count()) done = await tapEl(p.first()); }
      if (done) moves++; await page.waitForTimeout(300);
    }
    // 3) the score walk-through and the end card
    let walk = 0;
    await page.waitForFunction(() => window.GXT && GXT.running(), null, { timeout: 15000 }).catch(() => { ok = false; console.log(name, 'FAIL the score walk-through did not start'); });
    while (ok && Date.now() - t0 < 660000) {
      const st = await page.evaluate(() => window.GXT && GXT.state()); if (!st || !st.active || st.phase === 'end') break;
      if (!st.shown) { await page.waitForTimeout(150); continue; }
      if (st.id === 'score1') { await page.waitForTimeout(300); await shot('d-score1'); }
      const nb = vis('.gxt-next'); if (await nb.count()) { await tapEl(nb.first()); walk++; }
      await page.waitForFunction(i => { const s = GXT.state(); return !s.active || s.phase === 'end' || s.i !== i; }, st.i, { timeout: 10000 }).catch(() => { });
    }
    const rep = await page.evaluate(() => window.coachReport ? window.coachReport() : null);
    const end = page.locator('.gxt-end button.pri').first();
    if (ok && await end.count()) {
      await page.waitForTimeout(300); await shot('e-end');
      const card = await page.locator('.gxt-end').innerText();
      if (rep && rep.later.length && !/meet later/i.test(card)) { ok = false; console.log(name, 'FAIL end card does not list the rules met later'); }
      await tapEl(end);
      const real = await page.waitForFunction(() => window.G && UI.mode !== 'tutorial' && G.phase === 'play', null, { timeout: 15000 }).then(() => true).catch(() => false);
      if (!real) { ok = false; console.log(name, 'FAIL end card did not start a real game'); }
    } else if (ok) { ok = false; console.log(name, 'FAIL no end card'); }
    if (!rep || rep.seen.length + rep.later.length !== rep.all.length) { ok = false; console.log(name, 'FAIL coverage report incomplete'); }
    if (rep && rep.seen.length < 12) { ok = false; console.log(name, 'FAIL only', rep.seen.length, 'rules explained in play'); }
    console.log(name, ok && !errs.length ? 'PASS' : 'FAIL', `coached tutorial to end: first button "${lbl}", ${forced} forced steps, ${moves} free moves, score walk ${walk} steps, rules explained in play ${rep ? rep.seen.length : '?'}/${rep ? rep.all.length : '?'}, met later: ${rep ? rep.later.join(',') : '?'}, errors ${errs.length}`, errs.slice(0, 2).join(' | '));
    if (!ok || errs.length) fails++;
    await ctx.close();
  }
  await b.close(); S.close(); process.exit(fails ? 1 : 0);
})();
