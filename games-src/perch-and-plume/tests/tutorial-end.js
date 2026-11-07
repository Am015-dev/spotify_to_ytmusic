// The coached first game, played to the end: start the tutorial from fresh storage, then play it by choosing legal moves through
// the UI (whatever glows; random among them, not a tap list), checking each tap target is uncovered. Asserts: no forced steps, the coach
// bubble never sits on a glowing target, every rule in TUTORIAL-COVERAGE.md was explained during the game or listed in "Things you'll
// meet later", the core rules were explained live, and the result screen walks the score rule by rule.   node tests/tutorial-end.js [phone|pc] [url]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const SIZE = process.argv[2] || 'phone', URL = process.argv[3] || 'http://127.0.0.1:8765/perch-and-plume/';
const VP = SIZE === 'pc' ? { width: 1440, height: 860 } : { width: 390, height: 763 }, TOUCH = SIZE !== 'pc';
const COVER = fs.readFileSync(path.join(__dirname, '..', 'TUTORIAL-COVERAGE.md'), 'utf8');
const RULES = [...new Set([...COVER.matchAll(/rule `([a-zA-Z]+)`/g)].map(m => m[1]))];
const CORE = ['welcome', 'food', 'feeder', 'chain', 'play', 'pay', 'eggs', 'nest', 'cards', 'tray', 'rival', 'goal', 'round', 'final', 'tie'];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: VP, hasTouch: TOUCH, isMobile: TOUCH });
  const p = await ctx.newPage(); const errs = []; let fails = 0, taps = 0, overlap = 0;
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + SIZE + ' ' + m); };
  const tapXY = async (x, y) => TOUCH ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
  await p.goto(URL); await p.waitForTimeout(1000);
  const open = await p.$('[data-gxt-open]'); ok(!!open, 'tutorial button on the title (fresh storage)');
  const r0 = await open.boundingBox(); await tapXY(r0.x + r0.width / 2, r0.y + r0.height / 2); await p.waitForTimeout(1200);
  // at most 2 guided taps for the very first action, then the end card's "Play on" and free play
  let nSteps = 0, gTaps = 0; const g0 = Date.now();
  while (Date.now() - g0 < 30000) {
    await p.waitForTimeout(250);
    const end = await p.$('.gxt-end .gxt-b.pri'); if (end && await end.isVisible()) { await end.click(); break; }
    const st = await p.evaluate(() => typeof GXT !== 'undefined' ? GXT.state() : { active: false }); if (!st.active) continue; nSteps = st.n;
    if (st.phase !== 'show' || !st.shown || !st.hole) continue;
    const cx = st.hole.cx != null ? st.hole.cx : st.hole.left + st.hole.width / 2, cy = st.hole.cy != null ? st.hole.cy : st.hole.top + st.hole.height / 2;
    const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && !e.closest('.gxt-top,.gxt-cell,.turnban,.reveal,#toast') ? 'ok' : 'covered'; }, [cx, cy]);
    if (hit !== 'ok') { ok(false, 'guided step ' + st.id + ' target covered'); break; }
    await tapXY(cx, cy); gTaps++; await p.waitForTimeout(400);
  }
  await p.waitForTimeout(600);
  ok(nSteps <= 2 && gTaps <= 3, `only the first action is guided (${nSteps} steps, ${gTaps} taps), then free play`);
  ok(await p.evaluate(() => UI.mode === 'tutfree' && COACH.on), 'the coached free game is running after the end card');
  let res = false, idle = Date.now(); const t1 = Date.now();
  while (Date.now() - t1 < 300000) {
    const h = await p.evaluateHandle(() => {
      const vis = e => { if (!e || e.hidden) return false; for (let x = e; x; x = x.parentElement) { if (x.hidden || getComputedStyle(x).display === 'none') return false; } return e.getBoundingClientRect().width > 0; };
      const q = s => [...document.querySelectorAll(s)].filter(vis);
      if (vis(document.getElementById('result'))) return 'result';
      if (q('.turnban,.reveal').length) return null;
      const pop = document.getElementById('pop'); if (vis(pop)) return pop.querySelector('[data-a="popx"]');
      const acts = q('#acts button'); const pg = acts.find(b => b.dataset.a === 'playgo'); if (pg) return pg;
      const g = q('.glow'); if (g.length) { const sl = g.find(e => e.matches('.slot')); if (sl) return sl; return g[Math.floor(Math.random() * g.length)]; }
      const mv = acts.filter(b => b.dataset.a === 'mv'); if (mv.length) return mv[Math.floor(Math.random() * mv.length)];
      return q('.bonc')[0] || null;
    });
    const v = await h.jsonValue().catch(() => undefined); if (v === 'result') { res = true; break; }
    overlap += await p.evaluate(() => { if (!document.querySelector('.coachb')) return 0; return [...document.querySelectorAll('.glow')].some(e => { const r = e.getBoundingClientRect(); if (!r.width || r.bottom < 0 || r.top > innerHeight) return false; const t = document.elementFromPoint(r.left + r.width / 2, Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2))); return !!(t && t.closest('.coachb')); }) ? 1 : 0; });
    const el = h.asElement();
    if (el) { await el.scrollIntoViewIfNeeded().catch(() => { }); const r = await el.boundingBox(); if (r) { const x = r.x + r.width / 2, y = r.y + Math.min(r.height / 2, 30);
      if (await el.evaluate((e, [x, y]) => { const t = document.elementFromPoint(x, y); return e.isConnected && !!t && (t === e || e.contains(t)); }, [x, y])) { await tapXY(x, y); taps++; idle = Date.now(); await p.waitForTimeout(150); continue; } } }
    if (Date.now() - idle > 25000) break;
    await p.waitForTimeout(200);
  }
  ok(res, `the coached game was played to the result screen by ${taps} free UI taps`);
  ok(overlap === 0, 'the coach bubble never sat on a glowing target (' + overlap + ' samples)');
  const st = await p.evaluate(() => ({ done: Object.keys(COACH.done), later: (document.querySelector('.later') || { dataset: {} }).dataset.later || '', walk: document.querySelectorAll('.walk li').length, all: coachRules() }));
  const later = st.later ? st.later.split(',') : [];
  const miss = RULES.filter(r => st.done.indexOf(r) < 0 && later.indexOf(r) < 0);
  ok(RULES.length >= 20 && miss.length === 0, `every coverage rule explained in play or listed under "Things you'll meet later" (${RULES.length} rules; live ${st.done.filter(r => RULES.includes(r)).length}, later ${later.length}${miss.length ? '; missing ' + miss.join(',') : ''})`);
  const coreMiss = CORE.filter(r => st.done.indexOf(r) < 0); ok(coreMiss.length === 0, 'core rules explained live' + (coreMiss.length ? ': missing ' + coreMiss.join(',') : ''));
  ok(RULES.every(r => st.all.includes(r)) && st.all.every(r => RULES.includes(r)), 'TUTORIAL-COVERAGE.md and the coach rule list match');
  ok(st.walk >= 7, 'the result screen walks the score rule by rule (' + st.walk + ' lines)');
  if (later.length) console.log('     later: ' + later.join(','));
  if (res) await p.screenshot({ path: `shots/tutorial-${SIZE}-result.png`, fullPage: true });
  ok(errs.length === 0, 'console errors ' + errs.length + ' ' + errs.slice(0, 2).join(' | '));
  await b.close(); process.exit(fails ? 1 : 0);
})();
