// Scenario lessons test (turbo, one run per size). node games-src/carc/game/lessons-test.js [sizes=402x874,1366x768]
// Asserts: picker lists every lesson; EVERY lesson is solved by its scripted solution with real taps (3 stars, no hint); a wrong move fails with
// a message and Retry restarts; the player can tap anything (board items are never under the card, Menu still opens); hint -> show ring never under
// the card; minimise/chip, drag remembered, close; progress saved; 0 JS errors. Contact sheet of every lesson start per size in carc/proof/.
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, '..', 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const LOG = m => { if (process.env.DBG) console.log(((Date.now() - T0) / 1000).toFixed(1) + 's ' + m); }, T0 = Date.now();
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = [];
async function run(b, W, H) {
  let top0 = 0, left0 = 0; const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m), shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { window.__rvlFast = true; try { localStorage.clear(); localStorage.setItem('rv_fast', '1'); } catch (e) { } });
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|ERR_FAILED|CORS|file:\/\//.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('file://' + path.join(__dirname, 'rampart.html'), { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__RVL && typeof beginGame === 'function' && typeof UI !== 'undefined', null, { timeout: 20000 });
  await p.evaluate(() => { window.__ev = []; __RVL.open(); addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); });
  await p.waitForFunction(() => window.GXST && GXST.state() && GXST.state().open, null, { timeout: 10000 });
  const st = () => p.evaluate(() => GXST.state());
  const tapEl = async (fn, arg, what) => {
    const pt = await p.evaluate(([fn, arg]) => { const e = (new Function('a', 'return (' + fn + ')(a)'))(arg); if (!e) return null; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u) || u.contains(e)) }; }, [fn.toString(), arg]);
    if (!pt) { note('nothing to tap: ' + what); return false; } if (!pt.ok) note('something covers ' + what);
    await p.touchscreen.tap(pt.x, pt.y); await sleep(160); return true;
  };
  const tap = sel => tapEl(s => [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8; }), sel, sel);
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live && myTurn('place') && document.querySelectorAll('#world .glow').length; }, id, { timeout: 15000 });
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 12000 }).then(() => true, () => false);
  // one real move: turn the tile to r, tap the square (touch: tap again on Place here), then the follower spot or Skip
  const place = async (m) => {
    for (let i = 0; i < 4 && (await p.evaluate(() => UI.rot)) !== m.r; i++) await tap('#htile');
    await tapEl(([x, y]) => document.querySelector('#world .glow[data-x="' + x + '"][data-y="' + y + '"]'), [m.x, m.y], 'glow ' + m.x + ',' + m.y);
    if (await p.evaluate(() => !!document.querySelector('#hplace'))) await tap('#hplace');
    await p.waitForFunction(() => !G || G.step !== 'place' || !myTurn(), null, { timeout: 8000 }).catch(async () => { note('tile did not go down'); LOG('place failed ' + JSON.stringify(m) + ' ' + JSON.stringify(await p.evaluate(() => ({ sel: UI.sel, rot: UI.rot, step: G && G.step, my: myTurn(), turn: G && G.turn, glows: [...document.querySelectorAll('#world .glow')].map(g => [g.dataset.x, g.dataset.y, getComputedStyle(g).visibility]), id: GXST.state().id, ph: GXST.state().phase, card: GXST.state().card, pos: GXST.state().pos, view: UI.view, bs: botSafe(), gr: [...document.querySelectorAll('#world .glow')].map(g => { const r = g.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; }) })))); });
    await sleep(200);
  };
  const fig = async (f) => {
    if (!(await p.evaluate(() => !!G && myTurn('fig')))) return;
    if (f === 'skip' || !f) { await tap('#hskip'); return; }
    await tapEl(f => { const l = __RVL.figL(f); return (UI.figs || []).find(e => e._m.l === l && e._m.k === 'f'); }, f, 'follower spot');
  };
  const solve = async id => {
    LOG('solve ' + id);
    const sp = await p.evaluate(id => __RVL.SPECS[id], id);
    if (sp.sol) { await place(sp.sol); await fig(sp.sol.fig); }
    else { for (let n = 0; n < 12 && (await st()).phase === 'play'; n++) {   // the short game: the game's own advisor picks for the player
      await p.waitForFunction(() => !G || G.over || myTurn('place') || GXST.state().phase !== 'play', null, { timeout: 15000 }).catch(() => { });
      if (!(await p.evaluate(() => !!G && !G.over && myTurn('place')))) { await sleep(200); continue; }
      const m = await p.evaluate(() => { const a = aiMove(0); return a && { x: a.x, y: a.y, r: a.r, fig: AIPLAN && AIPLAN.plan && AIPLAN.plan.fig }; });
      if (!m) break; await place(m);
      if (await p.evaluate(() => !!G && myTurn('fig'))) {
        const f = m.fig && m.fig.act === 'fig' ? m.fig : null;
        if (f) await tapEl(l => (UI.figs || []).find(e => e._m.l === l.l && e._m.k === l.k), f, 'advisor follower'); else await tap('#hskip'); } } }
    if (!(await phase('win', 25000))) { const s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ')'); }
  };
  const ids = await p.evaluate(() => __RVL.lessons.map(l => l.id));
  // 1) picker
  let s = await st();
  const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length);
  if (s.phase !== 'picker' || n !== ids.length || n < 6) note('picker shows ' + n + ' of ' + ids.length + ' lessons');
  await p.screenshot({ path: path.join(PROOF, 'rampart-lessons-' + tag + '-picker.png') });
  LOG('picker ok');
  // 2) wrong move on the first lesson fails with a message, Retry restarts
  await tap('.gxst-pick[data-id="fit"]'); await live('fit'); await sleep(500); shots.push(await p.screenshot({ type: 'jpeg', quality: 72 }));
  const bad = await p.evaluate(() => { const sol = __RVL.SPECS.fit.sol, g = UI.legal.filter(x => Math.abs(x.x - sol.x) + Math.abs(x.y - sol.y) > 1)[0]; return g && { x: g.x, y: g.y, r: g.r }; });
  await place(bad); await fig('skip');
  if (!(await phase('fail'))) note('a wrong move did not fail');
  s = await st(); if (!/\w{4}/.test(s.msg) || !/\S/.test(await p.textContent('.gxst-msg'))) note('fail has no message');
  await p.screenshot({ path: path.join(PROOF, 'rampart-lessons-' + tag + '-fail.png') });
  await tap('.gxst-ft .pri'); await live('fit');
  // 3) tap anything: nothing of the board is under the card; the menu opens while a lesson runs
  const covered = await p.evaluate(() => [...document.querySelectorAll('#world .glow, #htile, #seats .seat, #top button')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest('.gxst-card'); }).length);
  if (covered) note(covered + ' board items under the lesson card');
  const menuBtn = await p.evaluate(() => { const b = [...document.querySelectorAll('#top button')].find(e => /menu/i.test((e.getAttribute('aria-label') || '') + e.textContent) && e.offsetWidth > 8); return !!b; });
  if (menuBtn) { await tap('#top button[aria-label*="enu" i], #top button#menu'); const o = await p.evaluate(() => { const m = document.querySelector('#menu'); return !!m && getComputedStyle(m).display !== 'none' && m.getBoundingClientRect().width > 20; }); if (!o) note('Menu did not open mid-lesson'); await p.evaluate(() => { try { closeMenu(); } catch (e) { } }); }
  else note('no Menu button found to tap');
  LOG('step3 done');
  // 4) hint: nudge, then show (ring on the target, never under the card)
  await tap('.gxst-bulb'); await tap('.gxst-bulb'); s = await st();
  if (s.hint !== 2 || !s.target) note('show-me hint has no target'); if (s.overlap) note('card covers the hinted target');
  if (!(await p.$('.gxst-ring'))) note('no hint ring');
  await solve('fit'); s = await st(); if (s.stars !== 1) note('two hints should give 1 star, got ' + s.stars);
  LOG('step4 done');
  // 6) every other lesson via Next, solved with no hint (3 stars); claim also checks its own wrong move (skip) first
  for (let i = 1; i < ids.length; i++) {
    await tap('.gxst-ft .pri'); await live(ids[i]).catch(() => note(ids[i] + ' did not start'));
    await sleep(500); shots.push(await p.screenshot({ type: 'jpeg', quality: 72 }));
    if (ids[i] === 'claim') {
      await place(await p.evaluate(() => __RVL.SPECS.claim.sol)); await fig('skip');
      if (!(await phase('fail'))) note('claim: skipping the follower did not fail'); else if (!/no follower/.test((await st()).msg)) note('claim fail message: ' + (await st()).msg);
      await tap('.gxst-ft .pri'); await live('claim');
    }
    await solve(ids[i]); s = await st(); if (s.phase === 'win' && s.stars !== 3) note(ids[i] + ': clean solve gave ' + s.stars + ' stars');
  }
  await p.screenshot({ path: path.join(PROOF, 'rampart-lessons-' + tag + '-win.png') });
  s = await st(); if (Object.keys(s.best).length !== ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  // 5) minimise / chip / drag / remembered
  await tap('.gxst-hd .gxst-ib[aria-label="Minimise"]'); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
  await tap('.gxst-chip'); if ((await st()).min) note('chip did not restore');
  const hd = await p.evaluate(() => { const r = document.querySelector('.gxst-hd b').getBoundingClientRect(); return [r.left + 10, r.top + r.height / 2]; });
  const hd0 = (await st()).card; if (hd0) { top0 = hd0.top; left0 = hd0.left; }
  await p.mouse.move(hd[0], hd[1]); await p.mouse.down(); await p.mouse.move(hd[0] + 4, hd[1] + 30, { steps: 4 }); await p.mouse.move(hd[0] + 8, hd[1] + 60, { steps: 4 }); await p.mouse.up(); await sleep(300);
  if (!(await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('gxst-rampart-and-vine')).pos; } catch (e) { return null; } }))) note('drag position not saved');
  { const c0 = (await st()).card, dy = top0 - c0.top, dx = left0 - c0.left;   // drag it back to where it started, so later lessons see the default spot
    await p.mouse.move(hd[0] + 8, hd[1] + 60); await p.mouse.down(); await p.mouse.move(hd[0] + 8 + dx / 2, hd[1] + 60 + dy / 2, { steps: 4 }); await p.mouse.move(hd[0] + 8 + dx, hd[1] + 60 + dy, { steps: 4 }); await p.mouse.up(); await sleep(300); }
  LOG('step5 done');
  // 7) close; the old tutorial entry opens the picker again
  await tap('.gxst-hd .gxst-ib[aria-label="Close"]'); if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  await p.evaluate(() => tutStart()); await sleep(300); s = await st(); if (!s.open || s.phase !== 'picker') note('tutStart did not reopen the picker');
  if (await p.evaluate(() => !!localStorage.getItem(SAVE))) note('a lesson game was saved over the real game');
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win', 'close', 'picker'].forEach(t => { if (ev.indexOf(t + ':') < 0) note('no ' + t + ' event'); });
  const cols = phone ? 4 : 3, cw = phone ? 300 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((b, i) => '<figure><img src="data:image/jpeg;base64,' + b.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + ids[i] + '</figcaption></figure>').join('');
  const sp = await ctx.newPage(); await sp.setViewportSize({ width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 });
  await sp.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await sp.screenshot({ path: path.join(PROOF, 'rampart-lessons-' + tag + '-sheet.jpg'), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}
(async () => {
  const b = await PW.chromium.launch({ executablePath: process.env.PW_CHROME || undefined });
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
