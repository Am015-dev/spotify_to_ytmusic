// Plays the whole guided first game of Onyx Atelier ONLY by following the on-screen target (no fixed coordinates).
// At every bubble it asserts: the bubble is within 120 px of its target, does not overlap the target or any other
// glowing choice, the tap target is >= 44 px, and the bubble stays on screen. Writes the video next to this script.
// node proof/bubbles-proof.js [out.webm]     W=402 H=874 (touch)  or  W=1366 H=768 (mouse)     needs: python3 build.py
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const W = +process.env.W || 402, H = +process.env.H || 874, TOUCH = W < 800, TMP = path.join(__dirname, '_vid');
const OUT = process.argv[2] || path.join(__dirname, 'bubbles-' + W + 'x' + H + '.webm');
(async () => {
  fs.rmSync(TMP, { recursive: true, force: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: TOUCH, isMobile: TOUCH, deviceScaleFactor: 1, recordVideo: { dir: TMP, size: { width: W, height: H } } });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.join(__dirname, '..', 'onyx-atelier.html')); await pg.waitForTimeout(800);
  await pg.evaluate(() => { window.AIDELAY = 250; });
  await (TOUCH ? pg.tap('[data-t="learn"]') : pg.click('[data-t="learn"]')); await pg.waitForTimeout(700);
  const probe = () => pg.evaluate(() => {
    const co = document.querySelector('#coach'); if (!co) return { gone: true };
    const vis = getComputedStyle(co).visibility === 'visible'; if (!vis) return { hidden: true };
    const rc = e => { const r = e.getBoundingClientRect(); return { n: (e.className || e.id || '') + (e.dataset && (e.dataset.cell || e.dataset.id) || ''), l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const sels = OTUT.target() || [], tg = []; sels.forEach(q => document.querySelectorAll(q).forEach(e => { if (e.getBoundingClientRect().width) tg.push(rc(e)); }));
    const ch = []; (OTUT.steps[OTUT.stepNo()].info ? [] : document.querySelectorAll('.cell.glow, .card.glow, .favb.glow, #takebtn:not([disabled]), #sheet [data-buy]:not([disabled]), .patc')).forEach(e => { if (e.getBoundingClientRect().width) ch.push(rc(e)); });
    const f = document.querySelector('.finger'), nx = co.querySelector('[data-next]'); let tap = null;
    if (nx) tap = rc(nx); else if (f) { const r = f.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, el = document.elementFromPoint(x, y); const e2 = el && (el.closest('button,.cell,.card,.col,.patc') || el); tap = e2 ? rc(e2) : { x, y, l: x, t: y, r: x, b: y, w: 0, h: 0 }; }
    return { step: OTUT.stepNo(), key: OTUT.steps[OTUT.stepNo()].key, text: co.querySelector('.t').textContent, co: rc(co), tg, ch, tap, next: !!nx, arrow: ['arr-up', 'arr-down', 'arr-l', 'arr-r'].find(k => co.classList.contains(k)) || null, vw: innerWidth, vh: innerHeight };
  });
  const gap = (a, b) => Math.max(0, Math.max(a.l - b.r, b.l - a.r), Math.max(a.t - b.b, b.t - a.b));   // 0 when touching/overlapping on both axes
  const ov = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  const fails = [], seenKeys = new Set(), log = []; let last = '', same = 0, checks = 0, k = 0;
  while (k++ < 220) {
    const st = await probe();
    if (st.gone) break;
    if (st.hidden || !st.text) { await pg.waitForTimeout(250); continue; }
    const id = st.step + '|' + st.text;
    if (id !== last) {   // assert once per new bubble, after it has settled
      await pg.waitForTimeout(450); const s2 = await probe(); if (s2.gone) break; if (s2.hidden || !s2.text) continue;
      last = s2.step + '|' + s2.text; same = 0; seenKeys.add(s2.step); checks++;
      const tgU = s2.tg.reduce((a, r) => a ? { l: Math.min(a.l, r.l), t: Math.min(a.t, r.t), r: Math.max(a.r, r.r), b: Math.max(a.b, r.b) } : { l: r.l, t: r.t, r: r.r, b: r.b }, null);
      const bad = [];
      if (!tgU) bad.push('no target on screen');
      else {
        const g = gap(s2.co, tgU); if (g > 120) bad.push('bubble ' + Math.round(g) + ' px from target');
        s2.tg.forEach(r => { if (ov(s2.co, r)) bad.push('bubble covers its target'); });
        s2.ch.forEach(r => { if (ov(s2.co, r)) bad.push('bubble covers a choice ' + r.n + ' @' + Math.round(r.l) + ',' + Math.round(r.t) + ' bubble@' + Math.round(s2.co.l) + ',' + Math.round(s2.co.t) + ' ' + Math.round(s2.co.w) + 'x' + Math.round(s2.co.h)); });
      }
      if (!s2.arrow) bad.push('no arrow');
      if (s2.co.l < 0 || s2.co.r > s2.vw || s2.co.t < 0 || s2.co.b > s2.vh) bad.push('bubble off screen');
      if (s2.tap && (s2.tap.w < 44 || s2.tap.h < 44)) bad.push('tap target ' + Math.round(s2.tap.w) + 'x' + Math.round(s2.tap.h) + ' < 44');
      log.push((s2.step + 1) + '. [' + s2.key + '] ' + (bad.length ? 'FAIL ' + [...new Set(bad)].join('; ') : 'ok gap=' + Math.round(tgU ? gap(s2.co, tgU) : -1) + ' ' + s2.arrow) + ' | ' + s2.text.slice(0, 60));
      if (bad.length) console.log('DBG', JSON.stringify(await pg.evaluate(() => { const U = OA_TEST.U; return { pyr: U.G.pyr, lvl: OE.card(11).lvl, p0: U.G.pl[0].cards, p1: U.G.pl[1].cards, r0: U.G.pl[0].res, r1: U.G.pl[1].res, dk: U.G.decks.map(d => d.includes(11)), step: OTUT.stepNo(), card: U.tut.card, cells: U.tut.cells, mode: U.mode, pend: U.G.pend, can: document.querySelectorAll('.card.can').length, glow: document.querySelectorAll('.card.glow').length, ids: [...document.querySelectorAll('.card[data-id]')].map(e => e.dataset.id).join() }; })));
      if (bad.length) await pg.screenshot({ path: path.join(path.dirname(OUT), 'fail-' + s2.key + '.png') });
      bad.forEach(m => fails.push(s2.key + ': ' + m)); await pg.waitForTimeout(500);
    } else same++;
    const cur = await probe(); if (cur.gone) break;
    if (!cur.hidden && cur.tap) { const x = cur.tap.l + cur.tap.w / 2, y = cur.tap.t + cur.tap.h / 2; if (TOUCH) await pg.touchscreen.tap(x, y); else await pg.mouse.click(x, y); await pg.waitForTimeout(450); }
    else await pg.waitForTimeout(300);
    if (same > 25) { fails.push('STUCK at ' + last); break; }
  }
  await pg.waitForTimeout(1000);
  const end = await pg.evaluate(() => ({ coach: !!document.querySelector('#coach'), tut: !!OA_TEST.U.tut }));
  const vp = pg.video(); await ctx.close(); await b.close(); fs.copyFileSync(await vp.path(), OUT); fs.rmSync(TMP, { recursive: true, force: true });
  console.log(log.join('\n')); console.log('bubbles checked', checks, 'distinct steps', seenKeys.size, 'fails', fails.length, 'errors', errs.length ? errs : 'none', 'ended', JSON.stringify(end), 'video', OUT);
  fails.forEach(f => console.log('FAIL', f));
  process.exit(fails.length || errs.length || end.coach || end.tut ? 1 : 0);
})();
