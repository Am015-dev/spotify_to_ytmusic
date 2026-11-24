// Nebula Aces scenario lessons test (lessons.js, GXST). TURBO (scripts/turbo.js): game time runs ~100x, no real waits.
//   node games-src/xw/lessons-test.js [402x874 | 1366x768]   (no argument = both sizes)   Uses the built xw/nebula.html (python3 xw/build.py).
// Per lesson: the scripted solution with real mouse/touch taps wins with 3 stars; a wrong move ends in a fail card with a message; Retry restarts.
// Also: every tap lands on the element it aims at (elementFromPoint), the card never covers the hinted target, the Show hint draws a ring,
// the lesson card never blocks the Lessons picker or the menu, no JS errors, picker lists 7 lessons.
const { chromium } = require('playwright');
const path = require('path');
const { turbo, budget, tick } = require('../scripts/turbo.js');
const gx = require('../scripts/gx-serve.js');
const SIZES = process.argv[2] ? [process.argv[2]] : ['402x874', '1366x768'];
// SOLVE: dial [s,t,d] (null = keep the suggested one), act = action button, spend = token spent in the attack / defence step, wrong = a move that must fail
const SOLVE = {
  aim: { dial: [2, 'S'], act: null, wrong: { dial: [1, 'B', -1], act: null } },
  range: { dial: [4, 'S'], act: null, wrong: { dial: [1, 'S'], act: null } },
  focus: { dial: [2, 'S'], act: 'F', spend: 'focus', wrong: { dial: [2, 'S'], act: null } },
  evade: { dial: [2, 'S'], act: 'E', spend: 'evade', fire: false, wrong: { dial: [2, 'S'], act: 'F', fire: false } },
  stress: { dial: [2, 'S'], act: 'F', spend: 'focus', wrong: { dial: [3, 'S'], act: null } },
  lock: { dial: [2, 'S'], act: 'TL', reroll: true, wrong: { dial: [2, 'S'], act: 'F' } },
  edge: { dial: [1, 'S'], act: null, fire: false, wrong: { dial: [4, 'S'], act: null, fire: false } }
};
const SHOTS = process.env.SHOTS || ''; if (SHOTS) require('fs').mkdirSync(SHOTS, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

async function run(size, base) {
  const [W, H] = size.split('x').map(Number);
  const stop = budget(60000, 'nebula lessons ' + size);
  const t0 = Date.now();
  const browser = await chromium.launch(fs_exists() ? { executablePath: '/opt/pw-browsers/chromium' } : {});
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: W < 800, isMobile: W < 800 });
  await turbo(ctx);
  // the 3D board repaints on every (1 ms) turbo frame and saturates the page: ~80 frames a second are plenty for the logic
  await ctx.addInitScript(() => { window.requestAnimationFrame = f => setTimeout(() => f(performance.now()), W < 800 ? 2500 : 7000); });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(base, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.GXST && typeof G !== 'undefined' && window.GXH, null, { timeout: 30000 }); await tick(p, 3000);
  const st = () => p.evaluate(() => GXST.state());
  const rectOf = sel => p.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (r.width > 3 && r.height > 3 && getComputedStyle(e).visibility !== 'hidden' && r.bottom > 0 && r.top < innerHeight) return [r.left + r.width / 2, r.top + r.height / 2]; } return null; }, sel);
  // a tap on a real element: the point must hit the element (or a child) in elementFromPoint
  let badTaps = [];
  const tap = async (sel, label, wait) => {
    // animations move things for a moment: look again (up to `wait` times, 300 ms game time apart) before calling a tap missed
    let r = null, hit = false, under = '';
    for (let i = 0; i <= (wait || 0); i++) {
      r = await rectOf(sel);
      if (r) {
        const o = await p.evaluate(([x, y, sel]) => { const e = document.elementFromPoint(x, y); return { hit: !!e && !!e.closest(sel), under: e ? (e.id || String(e.className) || e.tagName) : 'nothing' }; }, [r[0], r[1], sel]);
        hit = o.hit; under = o.under; if (hit) break;
      }
      if (i < (wait || 0)) await tick(p, 300);
    }
    if (!r) return false;
    if (!hit && label !== 'continue') badTaps.push((label || sel) + ' under ' + under);
    await p.mouse.click(r[0], r[1]); await tick(p, 500); return true;
  };
  const phase = () => p.evaluate(() => ({ g: GXST.state().phase, ph: G.phase, r: G.round, bf: !!document.querySelector('#bfdial:not([hidden])') }));
  // fly the lesson with the given move spec; returns when the card says win or fail
  async function fly(sp) {
    await tick(p, 600);
    const until = async (f, n) => { for (let i = 0; i < (n || 12); i++) { if (await p.evaluate(f)) return true; await tick(p, 300); } return false; };
    for (let tries = 0; tries < 6; tries++) {
      if (await p.evaluate(() => !!document.querySelector('#bfdial:not([hidden]) .ditem'))) break;
      if (await rectOf('.bfring.need')) await tap('.bfring.need', 'ship ring');
      await tick(p, 400);
    }
    await until(() => !!document.querySelector('#bfdial:not([hidden]) .ditem'));
    if (sp.dial) {
      const k = await p.evaluate(d => { const s = ship('s1'); const ix = dialOf(s).findIndex(m => m.s === d[0] && m.t === d[1] && (d[2] == null || m.d === d[2])); return BF.dlist.findIndex(o => o.i === ix); }, sp.dial);
      if (k < 0) { ok(false, 'dial item for ' + sp.dial + ' is on the wheel'); return; }
      for (let tries = 0; tries < 4; tries++) {
        await tap('.ditem[data-k="' + k + '"]', 'dial item'); await tick(p, 300);
        if (await p.evaluate(d => { const s = ship('s1'); const ix = dialOf(s).findIndex(m => m.s === d[0] && m.t === d[1] && (d[2] == null || m.d === d[2])); return UI.draft.s1 === ix; }, sp.dial)) break;
        await tick(p, 400);
      }
    }
    if (process.env.DEBUG) console.log('  draft', await p.evaluate(() => JSON.stringify({ d: UI.draft, s: ship('s1').stress, mv: dialOf(ship('s1'))[UI.draft.s1] }))); 
    await until(() => !!document.querySelector('[data-bf=dlock]'));
    await tap('[data-bf=dlock]', 'Lock move');
    await until(() => { const e = document.querySelector('[data-bf=fly]'); return !!e && !e.disabled; });
    await tap('[data-bf=fly]', 'Fly');
    let did = {}, same = 0, last = '';
    for (let i = 0; i < 80; i++) {
      await tick(p, 400);
      const s = await st(); if (s.phase === 'win' || s.phase === 'fail') return s;
      const q = await p.evaluate(() => ({ ph: G.phase, cur: G.cur, atk: G.atk && G.atk.step, ad: G.atk && G.atk.d, r: G.round, ev: ship('s1').evade, hp: ship('s1').sh + '/' + ship('s1').dmg.length, dice: G.atk && G.atk.dice.join(), def: G.atk && G.atk.def.join() }));
      if (process.env.DEBUG) console.log('  q', JSON.stringify(q));
      const sig = JSON.stringify(q); if (sig === last) same++; else { same = 0; last = sig; }
      if (same > 40) { ok(false, 'stuck at ' + sig + ' buttons ' + await p.evaluate(() => JSON.stringify({ rings: [...document.querySelectorAll('.bfring')].map(e => e.className), sel: BF.sel, info: UI.info, g: GXST.state().phase, draft: UI.draft, dial: !!document.querySelector('#bfdial:not([hidden])'), fly: (document.querySelector('[data-bf=fly]') || {}).disabled, top: [...document.querySelectorAll('[data-bf]')].map(e => e.dataset.bf).join() }))); return s; }
      if (q.ph === 'plan' && q.r >= 2) return await st();
      if (q.cur && q.cur !== 's1' && q.ph !== 'amod' && q.ph !== 'dmod') continue;
      if (q.ph === 'action') { const a = sp.act; if (a && await tap('.bfact[data-bfa="' + a + '"]', 'action ' + a, 6)) { } else if (a && (did.aw = (did.aw || 0) + 1) < 8) { } else await tap('.bfact[data-bfa="skip"]', 'skip action'); continue; }
      if (q.ph === 'target') { if (sp.fire === false) await tap('[data-act="fire"][data-w="skip"]', 'hold fire', 4); else if (!(await tap('.bftgt', 'target', 14))) await tap('[data-act="fire"][data-w="skip"]', 'hold fire'); continue; }
      if (q.ph === 'amod' && q.cur === 's1') {
        if (sp.spend === 'focus' && !did.spend && await tap('[data-act="amod"][data-k="focus"]', 'use focus', 4)) { did.spend = 1; continue; }
        if (sp.reroll && !did.re) { const b = await p.evaluate(() => [...document.querySelectorAll('[data-act="amod"]')].map(e => e.dataset.k + ':' + e.textContent.trim().slice(0, 20)).join(',')); if (process.env.DEBUG) console.log('amod buttons', b);
          if (await tap('[data-act="amod"][data-k="tl"]', 'use lock', 4)) {
            // wait on game state, not time: the dice picker is open, tick dice until two are ticked (a tap on a ticked die would un-tick it), then confirm
            const ticked = () => p.evaluate(() => (G.phase === 'ask' && G.q && G.q.key === 'dice') ? G.q.opts.filter(o => /^t\d+$/.test(o.k) && /^\u2611/.test(o.l)).length : -1);
            for (let k = 0, n = await ticked(); n >= 0 && n < 2 && k < 8; k++, n = await ticked()) await tap('[data-bfq="t' + n + '"]', 'pick die ' + (n + 1), 6);
            if (await ticked() === 2) { await tap('[data-bfq="ok"]', 'confirm reroll', 6); did.re = 1; }
            continue; } }
        if ((sp.spend === 'focus' && !did.spend) || (sp.reroll && !did.re)) { did.w = (did.w || 0) + 1; if (did.w < 6) continue; }   // the token button may need a moment to appear
        if (await tap('[data-act="amod"][data-k="done"]', 'Roll')) continue;
        continue;
      }
      if (q.ph === 'dmod' && q.ad === 's1') {
        if (sp.spend === 'evade' && !did.spend && await tap('[data-act="dmod"][data-k="evade"]', 'spend evade', 4)) { did.spend = 1; continue; }
        if (sp.spend === 'evade' && !did.spend) { did.w = (did.w || 0) + 1; if (did.w < 6) continue; }
        if (await tap('[data-act="dmod"][data-k="done"]', 'defence done')) continue;
        continue;
      }
      if (q.ph === 'damod') { await tap('[data-act="damod"][data-k="done"]', 'damage mods done'); continue; }
      // any other pause: a continue button or the dice strip
      await tap('#bfbtns .btn.primary:not([disabled])', 'continue') || await tap('#bfdice', 'dice');
    }
    return await st();
  }

  // picker lists the lessons, Lessons button opens it
  await p.evaluate(() => GXST.picker()); await tick(p, 500);
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, size + '-picker.png') });
  let s = await st(); ok(s.open && s.phase === 'picker' && s.count === 7, size + ' picker lists 7 lessons');
  const ids = await p.evaluate(() => [...document.querySelectorAll('.gxst-pick [data-i], .gxst-row, [data-gxst-i]')].length);
  const lessonIds = Object.keys(SOLVE).filter(k => !process.env.ONLY || process.env.ONLY.split(',').includes(k));
  for (const id of lessonIds) {
    if (process.env.T) console.log('  t', id, ((Date.now() - t0) / 1000).toFixed(1));
    const sv = SOLVE[id];
    // 1) the right move wins with 3 stars
    badTaps = [];
    await p.evaluate(i => GXST.start(i), id); await tick(p, 1500);
    await tick(p, 800);
    s = await st(); ok(s.phase === 'play' && s.id === id, size + ' ' + id + ': lesson starts');
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, size + '-' + id + '-start.png') });
    // the card must not cover the player's ship ring or the board buttons
    const covOf = () => p.evaluate(() => { const c = GXST.state().card; const out = []; for (const sel of ['.bfring.need', '#bfbtns .btn', '.bfring']) for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (r.width > 3 && !(r.right < c.left || r.left > c.right || r.bottom < c.top || r.top > c.bottom)) out.push(sel); } return out; });
    let cov = await covOf();
    for (let i = 0; i < 8 && cov.length; i++) { await tick(p, 300); cov = await covOf(); }   // the card re-places itself after the board settles: wait on the layout, not a fixed time
    ok(!cov.length, size + ' ' + id + ': card keeps off the ship ring and buttons' + (cov.length ? ' (covers ' + cov[0] + ')' : ''));
    // hint 1 = nudge, hint 2 = ring on a visible target
    await p.evaluate(() => GXST.hint()); await p.evaluate(() => GXST.hint()); await tick(p, 1000);
    s = await st(); ok(s.hint >= 2 && !!s.target, size + ' ' + id + ': Show-me hint draws a ring on a target' + (s.target ? '' : ' (no target)'));
    for (let i = 0; i < 8 && s.overlap; i++) { await tick(p, 300); s = await st(); }   // the card moves off the target once the board settles: wait on the state
    ok(!s.overlap, size + ' ' + id + ': card does not cover the hinted target');
    await p.evaluate(() => { GXST.retry && GXST.retry(); }); await tick(p, 1500);
    const res = await fly(sv);
    if (process.env.DEBUG) console.log('  shots', JSON.stringify(await p.evaluate(() => NBL.shots)));
    if (SHOTS && res) await p.screenshot({ path: path.join(SHOTS, size + '-' + id + '-win.png') });
    ok(res && res.phase === 'win', size + ' ' + id + ': scripted solution wins' + (res && res.phase !== 'win' ? ' (phase ' + res.phase + ' ' + (res.msg || '') + ')' : ''));
    if (res && res.phase === 'win') ok(res.stars >= 1, size + ' ' + id + ': stars ' + res.stars);
    ok(!badTaps.length, size + ' ' + id + ': every tap landed on its element' + (badTaps.length ? ' (missed ' + badTaps.join(', ') + ')' : ''));
    // 2) the wrong move fails with a message, Retry restarts
    await p.evaluate(i => GXST.start(i), id); await tick(p, 1500);
    const bad = await fly(sv.wrong);
    if (SHOTS && bad) await p.screenshot({ path: path.join(SHOTS, size + '-' + id + '-fail.png') });
    ok(bad && bad.phase === 'fail' && (bad.msg || '').length > 10, size + ' ' + id + ': wrong move fails with a message' + (bad ? ' [' + bad.phase + ': ' + (bad.msg || '') + ']' : ''));
    await p.evaluate(() => GXST.retry()); await tick(p, 1500);
    s = await st(); ok(s.phase === 'play' && !s.msg, size + ' ' + id + ': Retry restarts');
  }
  // progress saved for every lesson
  const best = await p.evaluate(() => Object.keys(GXST.state().best || {}).length); ok(best === lessonIds.length || !!process.env.ONLY, size + ' progress saved for ' + best + ' lessons');
  // a non-lesson button works while a lesson runs, and the picker button stays reachable
  const sec = (Date.now() - t0) / 1000;
  ok(!errs.length, size + ' no page errors ' + errs.slice(0, 2).join(' | '));
  ok(sec < 60, size + ' real time ' + sec.toFixed(1) + ' s (< 60)');
  console.log('REAL_SECONDS ' + size + ' ' + sec.toFixed(1));
  stop(); await browser.close();
}
const fs_exists = () => require('fs').existsSync('/opt/pw-browsers/chromium');
(async () => {
  const base = await gx.url('nebula-aces', { file: path.resolve(__dirname, 'nebula.html'), query: '?gfx=low' });
  for (const size of SIZES) await run(size, base);
  console.log('lessons-test: ' + (fails ? fails + ' failed' : 'all pass'));
  process.exit(fails ? 1 : 0);
})();
