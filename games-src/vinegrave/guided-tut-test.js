// Guided first game (W490): taps only what the tutor highlights, from the title to the end card, at 390x844 and 375x667 (touch).
// Checks every rule step appears in order, each line is 12 words or fewer, the score walk runs, and there are 0 page errors.
// node guided-tut-test.js   (python3 build.py first)
const { chromium } = require('playwright'), serve = require('./serve.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const RULES = ['goal', 'g-play', 'g-play2', 'g-plane', 'g-plane2', 'g-disc', 'g-disc2', 'g-idol', 'g-shrine', 'g-beat', 'g-beat2', 'g-boon', 'g-boon2',
  'g-item', 'g-item2', 'g-art', 'g-art2', 'g-res', 'g-res2', 'g-note', 'g-note2', 'g-temple', 'g-temple2', 'g-pass', 'score1', 'score2', 'score3'];
(async () => {
  const S = await serve(), b = await chromium.launch(); let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  for (const [w, h] of [[390, 844], [375, 667]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); let errs = 0;
    p.on('pageerror', e => { errs++; console.log('  err', String(e).slice(0, 160)); });
    const tap = (x, y) => p.touchscreen.tap(x, y);
    const tapEl = async sel => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel); if (r) await tap(r.x, r.y); return !!r; };
    await p.goto(S.url); await p.waitForSelector('#start [data-a=tut]'); await sleep(500); await tapEl('#start [data-a=tut]');
    const seen = [], long = [], taps = {}, nextOnly = []; let ended = false; const t0 = Date.now();
    while (Date.now() - t0 < 150000) {
      const g = await p.evaluate(() => typeof GXT !== 'undefined' && GXT.running() ? GXT.state() : null);
      if (g && g.phase === 'end') { ended = true; break; }
      if (g && g.shown) {
        if (seen[seen.length - 1] !== g.id) { seen.push(g.id); const n = String(g.say).split(/\s+/).filter(Boolean).length; if (n > 12) long.push(g.id + ':' + n); }
        if (g.wait === null) { if (!nextOnly.includes(g.id)) nextOnly.push(g.id); await tapEl('.gxt-next'); } else if (g.hole) { const age = await p.evaluate(t => Date.now() - t, g.shownAt); if (age < 700) await sleep(700 - age);   /* a person never taps inside the tutor's 600 ms ghost-tap guard */
          taps[g.id] = (taps[g.id] || 0) + 1; await tap(g.hole.cx, g.hole.cy); await sleep(900); if (process.env.DBG) console.log('  tapped', g.id, JSON.stringify(await p.evaluate(() => { const s = GXT.state(); return [s.id, s.phase, s.shown, UI.sel]; }))); }
      }
      await sleep(450);
    }
    const order = RULES.filter(id => seen.includes(id)), miss = RULES.filter(id => !seen.includes(id));
    ok(!miss.length, `${w}x${h}: every rule step shown (${order.length}/${RULES.length})${miss.length ? ' missing ' + miss.join(',') : ''}`);
    ok(JSON.stringify(seen.filter(id => RULES.includes(id))) === JSON.stringify(order), `${w}x${h}: rule steps in teaching order`);
    ok(!long.length, `${w}x${h}: every tutor line has 12 words or fewer${long.length ? ' (' + long.join(', ') + ')' : ''}`);
    const dead = Object.keys(taps).filter(k => taps[k] > 1).map(k => k + ' x' + taps[k]);
    ok(!dead.length, `${w}x${h}: every highlighted target responds to one tap${dead.length ? ' (dead: ' + dead.join(', ') + ')' : ''}`);
    ok(ended, `${w}x${h}: reaches the end card by highlighted taps only (${Math.round((Date.now() - t0) / 1000)} s)`);
    ok(nextOnly.length <= 5, `${w}x${h}: at most 5 Next-only steps (${nextOnly.length}: ${nextOnly.join(',')})`);
    ok(nextOnly.length <= 5, `${w}x${h}: at most 5 Next-only steps (${nextOnly.length}: ${nextOnly.join(',')})`);
    ok(errs === 0, `${w}x${h}: no page errors (${errs})`);
    if (process.env.DBG) console.log('  seen', seen.join(' '));
    await ctx.close();
  }
  console.log(fails ? 'FAIL guided-tut-test ' + fails : 'PASS guided-tut-test'); await b.close(); S.close(); process.exit(fails ? 1 : 0);
})();
