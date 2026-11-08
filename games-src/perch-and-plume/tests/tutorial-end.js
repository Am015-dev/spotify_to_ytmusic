// The guided first game, walked by touch to the end: fresh storage, tap "Play the tutorial", then tap ONLY the highlighted target
// (.tutpoint) of each step, checked uncovered with elementFromPoint. Asserts: every step of TUTORIAL-COVERAGE.md appears, in order,
// each with one sentence of 12 words or fewer and exactly one highlighted target; a tap elsewhere is blocked; no "learn later"
// list; the last step starts a real game. Shots: tut-<n>.png per step (SHOTS=dir).   node tests/tutorial-end.js [phone|small|pc] [url]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const SIZE = process.argv[2] || 'phone', URL = process.argv[3] || 'http://127.0.0.1:8765/perch-and-plume/';
const VP = SIZE === 'pc' ? { width: 1440, height: 860 } : SIZE === 'small' ? { width: 375, height: 667 } : { width: 390, height: 844 }, TOUCH = SIZE !== 'pc';
const SHOTS = process.env.SHOTS || '';
const COVER = fs.readFileSync(path.join(__dirname, '..', 'TUTORIAL-COVERAGE.md'), 'utf8');
const RULES = [...COVER.matchAll(/step `([a-zA-Z0-9]+)`/g)].map(m => m[1]);
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: VP, hasTouch: TOUCH, isMobile: TOUCH, deviceScaleFactor: SHOTS ? 2 : 1 });
  const p = await ctx.newPage(); const errs = []; let fails = 0, taps = 0;
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + SIZE + ' ' + m); };
  const tapXY = async (x, y) => TOUCH ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  await p.goto(URL); await p.waitForTimeout(1000);
  const open = await p.$('[data-gxt-open]'); ok(!!open, 'tutorial button on the title (fresh storage)');
  await open.scrollIntoViewIfNeeded(); const r0 = await open.boundingBox(); await tapXY(r0.x + r0.width / 2, r0.y + r0.height / 2);
  const seen = [], words = []; let pinkEgg = 0, tucked = 0, blocked = null, idle = Date.now(), real = false, later = false;
  let lastStep = null, lastAt = Date.now(); const lat = {};
  while (Date.now() - idle < 30000) {
    const st = await p.evaluate(() => {
      if (typeof UI === 'undefined' || !G) return { wait: 1 };
      if (UI.mode !== 'tutfree') return { mode: UI.mode };
      const b = document.querySelector('.coachb'), t = [...document.querySelectorAll('.tutpoint')];
      return { step: window.GXCOACH && GXCOACH.step, bub: b ? b.dataset.rule : null, txt: b ? b.querySelector('.saytx').childNodes[1].textContent : '', n: t.length, later: !!document.querySelector('.later') };
    });
    if (st.step && st.step !== lastStep) { lastStep = st.step; lastAt = Date.now(); }
    if (st.mode) { real = ['solo', 'vs', 'hot'].includes(st.mode) && await p.evaluate(() => G.rounds === 4 && !!document.querySelector('#keepgo')); break; }
    if (st.later) later = true;
    if (st.wait || !st.bub || st.n === 0 || st.bub !== st.step) { await p.waitForTimeout(200); continue; }
    if (seen[seen.length - 1] !== st.step) {
      lat[st.step] = Date.now() - lastAt; seen.push(st.step); words.push([st.step, st.txt.trim().split(/\s+/).length, st.n]);
      if (st.step === 'pink') pinkEgg = await p.evaluate(() => G.pl[1].board.flat().filter(b => b.id === TUT.ids.pk).reduce((a, b) => a + b.eggs, 0));
      if (st.step === 'cache') tucked = await p.evaluate(() => G.pl[0].board[0].reduce((a, b) => a + b.tuck + b.cache, 0));
      if (SHOTS) { await p.waitForTimeout(250); await p.screenshot({ path: path.join(SHOTS, 'tut-' + seen.length + '.png') }); }
    }
    const el = await p.$('.tutpoint'); if (!el) { await p.waitForTimeout(200); continue; } await el.scrollIntoViewIfNeeded().catch(() => { });
    const r = await el.boundingBox(); if (!r) { await p.waitForTimeout(200); continue; }
    const x = r.x + r.width / 2, y = r.y + Math.min(r.height / 2, 30);
    if (blocked === null && st.step === 'play') {   // a tap somewhere else must do nothing
      const before = await p.evaluate(() => GXCOACH.step + '|' + UI.pickBird + '|' + G.pl[0].cubes);
      const o = await p.$('.a4[data-k="cards"]'); const ro = o && await o.boundingBox();
      if (ro) { await tapXY(ro.x + ro.width / 2, ro.y + ro.height / 2); await p.waitForTimeout(300); }
      blocked = (await p.evaluate(() => GXCOACH.step + '|' + UI.pickBird + '|' + G.pl[0].cubes)) === before;
    }
    const top = await el.evaluate((e, [x, y]) => { const t = document.elementFromPoint(x, y); return !!t && (t === e || e.contains(t)); }, [x, y]);
    if (!top) { await p.screenshot({ path: 'shots/tut-covered.png' }); console.log('     covered target at step ' + st.step + ' by ' + await el.evaluate((e, [x, y]) => { const t = document.elementFromPoint(x, y); return t ? (t.id || t.className || t.tagName) + ' in ' + ((t.parentElement || {}).className || '') : 'none'; }, [x, y])); await p.waitForTimeout(300); continue; }
    await tapXY(x, y); taps++; idle = Date.now(); await p.waitForTimeout(350);
  }
  console.log('     steps: ' + seen.join(' > '));
  ok(real, `the last step starts a real 4-round game at its starting hand (${taps} taps)`);
  ok(JSON.stringify(seen) === JSON.stringify(RULES), `every rule step appears, in order (${seen.length}/${RULES.length})` + (seen.length !== RULES.length ? ' missing ' + RULES.filter(r => !seen.includes(r)).join(',') : ''));
  const long = words.filter(w => w[1] > 12), multi = words.filter(w => w[2] !== 1);
  const slow = ['white', 'cache', 'pink', 'food', 'eggs', 'cards', 'goalr'].filter(k => !(lat[k] <= 2000));   // a "see" step's marker shows within 2 s of the step starting, its power's own animation included (G4 review); goalr waits for Pip's last turn and shows a 'watch' line meanwhile
  ok(slow.length === 0, 'step markers appear within 2 s (R6: food, eggs, goalr waited 4-7 s): ' + ['white', 'cache', 'pink', 'food', 'eggs', 'cards', 'goalr'].map(k => k + ' ' + lat[k] + ' ms').join(', '));
  ok(long.length === 0, 'one sentence of 12 words or fewer per step' + (long.length ? ': ' + long.map(w => w[0] + '=' + w[1]).join(',') : ''));
  ok(multi.length === 0, 'exactly one highlighted tap per step' + (multi.length ? ': ' + multi.map(w => w[0] + '=' + w[2]).join(',') : ''));
  ok(blocked === true, 'a tap away from the highlighted target is blocked');
  ok(!later, 'no "learn later" list');
  ok(pinkEgg > 0, "Pip's pink bird really laid an egg on your lay-eggs turn (" + pinkEgg + ')');
  ok(tucked >= 2, 'the forest chain really tucked a card and stored food (' + tucked + ')');
  ok(errs.length === 0, 'console errors ' + errs.length + ' ' + errs.slice(0, 2).join(' | '));
  await b.close(); process.exit(fails ? 1 : 0);
})();
