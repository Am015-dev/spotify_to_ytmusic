// A newcomer plays by taps only (no engine calls to act): fresh storage, Skip the tutorial, a Quick game to the result, then Story stage 1
// from the title (Story -> map -> stage 1 -> its start buttons) to the result. Every tap goes to the centre of a visible element and
// elementFromPoint must hit it (not covered). Rival turns run at normal speed; the player taps the board to speed them up (a real feature).
// node tap-play.js [quick|story|both] [WxH]   (run python3 build.py first). Reads state only to know when to look again.
const { chromium } = require('playwright'), serve = require('./serve.js'), fs = require('fs');
const WHAT = process.argv[2] || 'both', [W, H] = (process.argv[3] || '390x763').split('x').map(Number);
(async () => {
  const S = await serve(), b = await chromium.launch({ args: ['--no-sandbox'], executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }); let fails = 0;
  const touch = W < 1000, ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), page = await ctx.newPage(), errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  let covered = 0;
  const tapEl = async loc => {   // tap the centre of a visible element; check it is the top element there
    const h = await loc.elementHandle({ timeout: 3000 }).catch(() => null); if (!h) return false;
    const r = await h.boundingBox(); if (!r || r.width < 2) return false;
    const x = r.x + r.width / 2, y = r.y + r.height / 2;
    const top = await page.evaluate(([el, x, y]) => { const e = document.elementFromPoint(x, y); return !!(e && (e === el || el.contains(e))); }, [h, x, y]);
    if (!top) { covered++; if (process.env.DBG) console.log('covered', await page.evaluate(([el, x, y]) => { const e = document.elementFromPoint(x, y); return (el.id || el.className) + ' <- ' + (e ? (e.id || e.className || e.tagName) : 'none'); }, [h, x, y])); return false; }
    if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); return true;
  };
  const vis = sel => page.locator(sel).filter({ visible: true });
  const playToResult = async label => {
    const t0 = Date.now(); let turns = 0, stuck = 0;
    while (Date.now() - t0 < 600000) {
      if (await vis('#rs .rplayers').count()) break;
      const st = await page.evaluate(() => ({ mine: !!(window.G && myTurn() && !UI.busy), over: !!(window.G && G.phase === 'over'), fx: !document.querySelector('#fx').hidden, pass: !document.querySelector('#pass').hidden }));
      if (st.fx) { await tapEl(vis('#fx .fxcard').first()); await page.waitForTimeout(150); continue; }
      if (st.over) { const sr = vis('#acts .btn.go'); if (await sr.count()) await tapEl(sr.first()); await page.waitForTimeout(400); continue; }
      if (await vis('#insp').count()) { await tapEl(vis('#insp .ix').first()); await page.waitForTimeout(200); continue; }
      if (!st.mine) { await tapEl(vis('#map').first()); await page.waitForTimeout(250); continue; }   // rival turn: tap to speed up
      // a question (exile / choose / free buy / free dig): tap its first glowing card or answer button, else Skip
      if (await vis('#qbox').count()) { const q = vis('#qbox .cd.glow, #qbox .btn.go'); if (await q.count()) await tapEl(q.first()); else await tapEl(vis('#qbox .btn').last()); await page.waitForTimeout(300); continue; }
      if (turns % 3 === 1) { const tb = vis('#vtabs button.has:not(.on)'); if (await tb.count()) { await tapEl(tb.first()); await page.waitForTimeout(250); } }   // phone: visit another tab that has a dot
      const g = vis('#map .site.glow, #row .cd.glow, #hand .cd.glow'), n = await g.count(); let done = false;
      for (let k = 0; k < Math.min(n, 4) && !done; k++) {
        const pick = g.nth((turns + k * 3) % n); if (!(await tapEl(pick))) continue;
        const go = vis('#insp .btn.go'); await go.first().waitFor({ timeout: 1500 }).catch(() => { });
        if (await go.count() && await tapEl(go.first())) done = true; else { const x = vis('#insp .ix'); if (await x.count()) await tapEl(x.first()); }
      }
      if (!done) { const p = vis('#acts .btn'); if (await p.count()) done = await tapEl(p.first()); }
      if (done) { turns++; stuck = 0; } else if (++stuck > 20) { console.log(label, 'FAIL stuck'); await page.screenshot({ path: '/tmp/claude-0/sh/stuck.png' }); return false; }
      await page.waitForTimeout(300);
    }
    const ok = await vis('#rs .rplayers').count() > 0; const txt = ok ? (await page.locator('#rs .win').textContent()) : '';
    console.log(label, ok ? 'PASS reached the result' : 'FAIL no result', 'after', turns, 'of my turns,', Math.round((Date.now() - t0) / 1000), 's:', txt.trim()); return ok;
  };
  await page.goto(S.url, { waitUntil: 'load' }); await vis('#start .tbtn').first().waitFor();
  // fresh storage: the primary is "Learn to play"; skip it with the visible Skip tutorial button
  await tapEl(vis('#start .tbtn').first()); await vis('.gxt-skip').first().waitFor({ timeout: 10000 }); await page.waitForTimeout(500);
  await tapEl(vis('.gxt-skip').first()); await page.waitForTimeout(800);
  for (let k = 0; k < 3; k++) { const e = vis('.gxt-end button.pri, .gxt-end [data-gxt-dlg="exit"]'); if (await e.count()) { await tapEl(e.first()); await page.waitForTimeout(600); } }
  if (WHAT !== 'story') {
    if (!(await page.evaluate(() => window.G && G.phase === 'play' && UI.mode !== 'tutorial'))) { await vis('#start .tbtn').first().waitFor({ timeout: 10000 }); const qb = page.locator('#start button:visible', { hasText: /^(Start a game|Play now|Play|Continue)/ }); console.log('title buttons:', (await page.locator('#start button:visible').allTextContents()).map(t => t.trim().slice(0, 18)).join(' | ')); await tapEl(qb.first()); }
    await page.waitForFunction(() => window.G && G.phase === 'play' && UI.mode !== 'tutorial', null, { timeout: 15000 });
    if (!(await playToResult('quick ' + W + 'x' + H))) fails++;
    await page.screenshot({ path: `/tmp/claude-0/sh/tap-quick-${W}.png` });
    await tapEl(vis('#rs [data-a="title"]').first()); await page.waitForTimeout(600);
  }
  if (WHAT !== 'quick') {
    if (await vis('#rs .rplayers').count()) { await tapEl(vis('#rs [data-a="title"]').first()); await page.waitForTimeout(500); }
    if (await page.evaluate(() => !!(window.G && G.phase === 'play'))) { await page.reload({ waitUntil: 'load' }); }
    await vis('#start .tbtn').first().waitFor({ timeout: 10000 });
    const story = vis('#start [data-a="story"]'); await tapEl(story.first()); await page.waitForTimeout(900);
    const node = vis('.gxc-node, .gxc [data-ch="c1"], .gxc [data-id="c1"]'); let ok = false;
    if (await node.count()) { await tapEl(node.first()); await page.waitForTimeout(700); }
    for (let k = 0; k < 8 && !ok; k++) {
      ok = await page.evaluate(() => !!(window.G && UI.camp && G.phase === 'play'));
      if (ok) break;
      const sk = vis('.gxc button', { hasText: /^(Skip|Play|Start|Begin|Next|Let|Go|Fight|Continue)/ });
      const sk2 = page.locator('.gxc button:visible', { hasText: /^(Skip|Play|Start|Begin|Next|Let|Go|Fight|Continue)/ });
      if (await sk2.count()) await tapEl(sk2.first()); await page.waitForTimeout(500);
    }
    if (!ok) { console.log('story FAIL could not start stage 1; visible buttons:', (await page.locator('button:visible').allTextContents()).slice(0, 20).join(' | ')); fails++; await page.screenshot({ path: '/tmp/claude-0/sh/story-fail.png' }); }
    else if (!(await playToResult('story stage 1 ' + W + 'x' + H))) fails++;
    else await page.screenshot({ path: `/tmp/claude-0/sh/tap-story-${W}.png` });
  }
  console.log(fails || errs.length ? 'FAIL' : 'PASS', 'tap-play', W + 'x' + H, 'console/page errors', errs.length, 'covered-target taps skipped', covered, errs.slice(0, 2).join(' | '));
  await b.close(); S.close(); process.exit(fails || errs.length ? 1 : 0);
})();
