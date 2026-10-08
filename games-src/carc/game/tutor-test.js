// Tutorial test: plays the staged tutorial through the REAL page with touch taps, doing exactly what every step asks.
//   cd games-src/carc/game/src && python3 build.py   then   NODE_PATH=/opt/node-tools/node_modules node ../tutor-test.js [sizes=390x763,375x553]     Exit code 1 on any problem.
// Runs per size: one clean run; at the first size also one run with rotations half way (portrait -> landscape -> portrait), a "leave and come back" run,
// a Skip run, and a fresh-profile Story run (Story -> tutorial as Chapter 0 -> "Start chapter 1" -> the chapter starts; the second Story tap goes to the chapter map).
// Checks per step: short text (say <= 20 words, title <= 4), bubble inside the screen and off the spotlight, the target visible, big enough and not covered by the kit,
// a wrong tap (outside the spotlight) does not advance and shakes the bubble, the right action advances, nothing stuck for 8 s, no page errors.
// At the end: the "You know the rules" card, a real game from it, the menu shows "Tutorial ✓", the staged game was never saved. Screenshots (390x763, clean run):
// ../playtest/tutor-early.png, tutor-mid.png, tutor-scoring.png, tutor-end.png.
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const URL = process.env.URL || 'file://' + path.join(__dirname, 'rampart.html');
const SIZES = (process.argv[2] || '390x763,375x553').split(',').map(s => s.split('x').map(Number));
const SHOTS = path.join(__dirname, '..', 'playtest');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const probs = []; const note = (tag, msg) => { if (probs.length < 60) probs.push(tag + ': ' + msg); else if (probs.length === 60) probs.push('... more'); };
const wc = t => String(t || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length;
const totals = { steps: 0, wrong: 0, runs: 0, ids: [] };
const once = new Set(); const guardOnce = id => { const k = id + '|' + (guardOnce.run || ''); if (once.has(k)) return false; once.add(k); return true; };
const centre = r => [r[0] + (r[2] - r[0]) / 2, r[1] + (r[3] - r[1]) / 2];

async function run(browser, W, H, mode) {
  const tag = W + 'x' + H + ' ' + mode; const t0 = Date.now();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: UA });
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note(tag, 'PAGE ERROR ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join('|')));
  p.on('console', m => { const t = m.text(); if (m.type() === 'warning' && /rejected|gxt/.test(t)) note(tag, 'console ' + t.slice(0, 200)); if (m.type() === 'error' && !/net::|Failed to load|favicon|fonts/.test(t)) note(tag, 'console error ' + t.slice(0, 160)); });
  await p.goto(URL); await sleep(700);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } });
  await p.reload(); await sleep(700);
  // first visit: the start card shows "New here? Learn in 5 minutes" as the FIRST option
  const first = await p.evaluate(() => { const b = document.querySelector('#modal .card button'); return b ? { t: b.textContent, gxt: b.hasAttribute('data-gxt-open') } : null; });
  if (!first || !first.gxt || !/New here/.test(first.t)) note(tag, 'first menu option is not "New here? Learn in 5 minutes": ' + JSON.stringify(first));
  // first-time players who tap Play are offered the tutorial (once)
  if (mode === 'clean' && W === SIZES[0][0]) {
    const pl = await p.evaluate(() => { const r = document.querySelector('[data-a=play]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await p.touchscreen.tap(pl[0], pl[1]); await sleep(300);
    const o = await p.evaluate(() => ({ learn: !!document.querySelector('[data-a=learn]'), go: !!document.querySelector('[data-a=go]'), g: typeof G !== 'undefined' && !!G && !!G.cur && !!document.querySelector('.glow') }));
    if (!o.learn || !o.go) note(tag, 'Play did not offer the tutorial to a first-time player ' + JSON.stringify(o));
    await p.evaluate(() => showStart()); await sleep(200);
  }
  const sel = mode === 'story' ? '[data-a=story]' : '[data-gxt-open]';
  const tb = await p.evaluate(s => { const b = document.querySelector('#modal ' + s); const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel);
  await p.touchscreen.tap(tb[0], tb[1]); await sleep(600);
  await p.evaluate(() => { UI.speed = 4; });
  const state = () => p.evaluate(() => GXT.state());
  const shot = async n => { if (W === 390 && H === 763 && mode === 'clean') { fs.mkdirSync(SHOTS, { recursive: true }); await p.screenshot({ path: path.join(SHOTS, 'tutor-' + n + '.png') }); } };
  let lastSig = '', lastT = Date.now(), rotated = 0, left = false, seenIds = [], shots = {};
  for (let guard = 0; guard < 4000; guard++) {
    const st = await state();
    if (!st.active) break;
    if (st.phase === 'end') break;
    const sig = [st.i, st.phase, st.count, st.shown].join('|');
    if (sig !== lastSig) { lastSig = sig; lastT = Date.now(); }
    else if (Date.now() - lastT > 8000) { note(tag, 'stuck for 8 s at step ' + st.i + ' ' + st.id + ' phase ' + st.phase + ' ' + JSON.stringify(await p.evaluate(() => ({ turn: G.turn, step: G.step, cur: G.cur && G.cur.p, rot: UI.rot, rots: UI.rots, glows: [...document.querySelectorAll('.glow')].map(g => g.dataset.x + ',' + g.dataset.y + (g.style.visibility === 'hidden' ? 'h' : '')), figs: (UI.figs || []).length }))));
      await p.screenshot({ path: '/tmp/claude-0/tutor_stuck_' + W + '_' + mode + '.png' }).catch(() => { }); break; }
    if (!st.shown) { await sleep(60); continue; }
    if (!seenIds.includes(st.id)) seenIds.push(st.id);
    const info = await p.evaluate(() => {
      const s = GXT.state(), v = { w: innerWidth, h: innerHeight };
      const b = document.querySelector('.gxt-bub'), nb = b && b.querySelector('.gxt-next');
      const q = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, w: r.width, h: r.height }; };
      const hole = s.hole; let cover = null, under = null;
      if (hole) { const el = document.elementFromPoint(hole.cx, hole.cy); under = el ? (el.closest('[data-help]') ? 'help:' + (el.className || el.tagName) : (el.id || (el.className && el.className.baseVal) || el.className || el.tagName)) : null; cover = !!(el && el.closest('[data-help]')); }
      const nbe = nb ? document.elementFromPoint((q(nb).left + q(nb).right) / 2, (q(nb).top + q(nb).bottom) / 2) : null;
      return { s, v, bub: q(b), next: q(nb), nextOk: !!(nbe && nb && (nbe === nb || nb.contains(nbe))), cover, under, title: b && b.querySelector('.gxh-tt') && b.querySelector('.gxh-tt').textContent, say: b && b.querySelector('.gxh-tx').textContent,
        hs: document.documentElement.scrollWidth > innerWidth + 1, skip: q(document.querySelector('.gxt-skip')), dots: document.querySelectorAll('.gxt-dots i').length,
        hasData: [...document.querySelectorAll('.gxt-bub,.gxt-cell,.gxt-top,.gxt-ring')].every(e => e.hasAttribute('data-help')),
        quiet: !document.querySelector('.gxh-bub:not(.gxt-bub)'), saved: !!localStorage.getItem('rv_save1'), turn: G.turn, score: G.pl.map(p => p.score) };
    });
    const s = info.s, id = s.id;
    totals.steps++;
    if (wc(info.say) > 20) note(tag, id + ': say over 20 words (' + wc(info.say) + ')');
    if (info.title && wc(info.title) > 4) note(tag, id + ': title over 4 words');
    if (!info.say) note(tag, id + ': empty text');
    if (info.hs) note(tag, id + ': page scrolls sideways');
    if (!info.hasData) note(tag, id + ': a tutorial element without data-help');
    if (!info.quiet) note(tag, id + ': a help-kit bubble shows during the tutorial');
    if (info.saved) note(tag, id + ': the staged game was saved');
    if (info.dots !== s.n) note(tag, id + ': progress dots ' + info.dots + ' vs steps ' + s.n);
    if (!info.skip) note(tag, id + ': no Skip tutorial button');
    const b = info.bub, V = info.v;
    if (!b) note(tag, id + ': no bubble'); else {
      if (b.left < -1 || b.top < -1 || b.right > V.w + 1 || b.bottom > V.h + 1) note(tag, id + ': bubble outside the screen ' + JSON.stringify(b));
      for (const h of s.holes) { if (b.left < h.left + h.width && b.right > h.left && b.top < h.top + h.height && b.bottom > h.top) note(tag, id + ': bubble covers the spotlight'); }
      if (info.skip && b.top < info.skip.bottom - 1 && b.left < info.skip.right && b.right > info.skip.left) note(tag, id + ': bubble covers the top strip');
    }
    const h = s.hole;
    if (!h) note(tag, id + ': no spotlight'); else {
      const vis = Math.max(0, Math.min(h.left + h.width, V.w) - Math.max(h.left, 0)) * Math.max(0, Math.min(h.top + h.height, V.h) - Math.max(h.top, 0));
      if (vis < 0.9 * h.width * h.height) note(tag, id + ': target not fully on screen');
      if (h.width < 24 || h.height < 24) note(tag, id + ': target smaller than a fingertip (' + Math.round(h.width) + 'x' + Math.round(h.height) + ')');
      if (s.wait && info.cover) note(tag, id + ': target covered by ' + info.under);
    }
    if (!s.wait) { if (!info.next || !info.nextOk) note(tag, id + ': the Next button is missing or covered'); }
    // screenshots at 390x763
    if (!shots[id]) {
      if (id === 'turn') { shots[id] = 1; await shot('early'); }
      if (id === 'fig_farmer') { shots[id] = 1; await shot('mid'); }
      if (id === 'road_done') { shots[id] = 1; await sleep(900); await shot('scoring'); }
    }
    // rotations
    if (mode === 'rotate' && rotated === 0 && s.id === 'place3') { rotated = 1; await p.setViewportSize({ width: H, height: W }); await p.evaluate(() => { dispatchEvent(new Event('resize')); dispatchEvent(new Event('orientationchange')); }); await sleep(900);
      const r = await state(); if (!r.shown || !r.hole) note(tag, 'after rotating to landscape the step is not on screen'); else await p.screenshot({ path: '/tmp/claude-0/tutor_rot_land.png' }); continue; }
    if (mode === 'rotate' && rotated === 1 && s.id === 'fig_town') { rotated = 2; await p.setViewportSize({ width: W, height: H }); await p.evaluate(() => { dispatchEvent(new Event('resize')); dispatchEvent(new Event('orientationchange')); }); await sleep(900);
      const r = await state(); if (!r.shown || !r.hole) note(tag, 'after rotating back the step is not on screen'); continue; }
    // a wrong tap: outside the spotlight (or on the highlighted thing of a Next step) must not advance and must shake the bubble
    const need = s.wait ? 'out' : 'in';
    const wp = await p.evaluate(([need]) => {
      const s = GXT.state(), V = { w: innerWidth, h: innerHeight }; const H = s.holes;
      const inside = (x, y) => H.some(r => x >= r.left - 2 && x <= r.left + r.width + 2 && y >= r.top - 2 && y <= r.top + r.height + 2);
      if (need === 'in') return { x: s.hole.cx, y: s.hole.cy };
      const b = s.bubble; const inB = (x, y) => b && x >= b.left - 10 && x <= b.right + 10 && y >= b.top - 10 && y <= b.bottom + 10;
      for (const [fx, fy] of [[.5, .5], [.15, .45], [.85, .45], [.5, .3], [.2, .7], [.8, .7], [.5, .62], [.1, .2], [.9, .2], [.5, .9]]) { const x = V.w * fx, y = V.h * fy; if (y > 40 && !inside(x, y) && !inB(x, y)) return { x, y }; } return null;
    }, [need]);
    if (wp && guardOnce(s.id) && !(need === 'in' && h && h.cy < 36)) {   // a Next step whose spotlight sits under the kit's top strip: nothing to shake there
      const before = await state(); await p.touchscreen.tap(wp.x, wp.y); await sleep(140); const after = await state(); totals.wrong++;
      if (after.i !== before.i || after.count !== before.count) note(tag, id + ': a wrong tap advanced the tutorial');
      if (after.wrongs <= before.wrongs) note(tag, id + ': a wrong tap did not shake the bubble');
      const hint = await p.evaluate(() => { const b = document.querySelector('.gxt-bub'); return b && b.classList.contains('gxt-shake') && b.querySelector('.gxh-tx').textContent; });
      if (!hint || !/Tap/.test(hint)) note(tag, id + ': wrong tap gave no "Tap ..." hint (' + hint + ')');
    }
    // "Skip tutorial": once, at step 4, tap it with a finger: everything goes away, the menu is back, the tutorial is not marked done
    if (mode === 'skip' && s.i >= 4) {
      const sk = info.skip; await p.touchscreen.tap((sk.left + sk.right) / 2, (sk.top + sk.bottom) / 2); await sleep(500);
      const o = await p.evaluate(() => ({ run: GXT.running(), dom: document.querySelectorAll('.gxt-cell,.gxt-bub,.gxt-top,.gxt-end').length, start: !!document.querySelector('#modal [data-a=play]'),
        btn: (document.querySelector('#modal [data-gxt-open] b') || {}).textContent, st: JSON.parse(localStorage.getItem('gxt-rampart-and-vine') || '{}'), saved: !!localStorage.getItem('rv_save1'), g: G }));
      if (o.run || o.dom) note(tag, 'Skip left tutorial elements on screen (' + o.dom + ')'); if (!o.start) note(tag, 'Skip did not return to the menu');
      if (/✓/.test(o.btn || '')) note(tag, 'a skipped tutorial shows Tutorial ✓'); if (o.st.done) note(tag, 'a skipped tutorial was marked done'); if (o.st.open) note(tag, 'a skipped tutorial is still "open"'); if (o.saved) note(tag, 'skip saved the staged game');
      if (/New here/.test(o.btn || '')) note(tag, 'after Skip the menu still says "New here?"');
      const n = await p.evaluate(() => { beginGame(); return !!G && !!G.cur && !UI.tut; }); if (!n) note(tag, 'no normal game after Skip');
      await sleep(500); const q = await p.evaluate(() => !!document.querySelector('.gxt-cell,.gxt-bub')); if (q) note(tag, 'tutorial elements in a normal game after Skip');
      totals.runs++; console.log(tag, 'done'); await ctx.close(); return;
    }
    // "leave and come back": once, at step 6, reload the page; the menu must offer restart or exit
    if (mode === 'leave' && !left && s.i >= 6) {
      left = true; await p.reload(); await sleep(900);
      const o = await p.evaluate(() => ({ t: (document.querySelector('#modal [data-gxt-open] b') || {}).textContent, active: GXT.active(), saved: !!localStorage.getItem('rv_save1') }));
      if (o.active) note(tag, 'tutorial still running after a reload'); if (o.saved) note(tag, 'a reload left a saved tutorial game');
      if (!/continue/.test(o.t || '')) note(tag, 'half-done tutorial button says: ' + o.t);
      const bb = await p.evaluate(() => { const b = document.querySelector('#modal [data-gxt-open]'); const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      await p.touchscreen.tap(bb[0], bb[1]); await sleep(300);
      const d = await p.evaluate(() => ({ dlg: !!document.querySelector('.gxt-end [data-gxt-dlg=restart]'), exit: !!document.querySelector('.gxt-end [data-gxt-dlg=exit]') }));
      if (!d.dlg || !d.exit) note(tag, 'reopening a half-done tutorial offered no restart/exit (' + JSON.stringify(d) + ')');
      else { const rb = await p.evaluate(() => { const b = document.querySelector('[data-gxt-dlg=restart]'); const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); await p.touchscreen.tap(rb[0], rb[1]); await sleep(700); await p.evaluate(() => { UI.speed = 4; });
        const r2 = await state(); if (!r2.active || r2.i !== 0) note(tag, 'restart did not start at step 0 (' + JSON.stringify({ a: r2.active, i: r2.i }) + ')'); lastSig = ''; lastT = Date.now(); seenIds = []; }
      continue;
    }
    // ---- do exactly what the step asks
    if (!s.wait) { const nx = info.next; await p.touchscreen.tap((nx.left + nx.right) / 2, (nx.top + nx.bottom) / 2); }
    else {
      const before = await state();
      await p.touchscreen.tap(h.cx, h.cy);
      const t1 = Date.now(); let moved = false;
      while (Date.now() - t1 < 1800) { await sleep(60); const a = await state(); if (a.i !== before.i || a.count !== before.count || a.phase !== 'show') { moved = true; break; } }
      if (!moved) { note(tag, id + ': tapping the target did not advance' + JSON.stringify({ hole: h, under: info.under })); await p.screenshot({ path: '/tmp/claude-0/tutor_dead_' + W + '_' + mode + '.png' }).catch(() => { }); break; }
    }
    await sleep(40);
  }
  // ---- the end
  const fin = await state();
  if (!fin.active || fin.phase !== 'end') note(tag, 'the tutorial did not reach the end card (' + JSON.stringify({ a: fin.active, ph: fin.phase, i: fin.i, id: fin.id }) + ') seen ' + seenIds.join(','));
  else {
    const sc = await p.evaluate(() => G.pl.map(q => q.score)); if (sc[0] !== 20 || sc[1] !== 2) note(tag, 'final scores ' + sc.join('-') + ', expected 20-2');
    if (seenIds.length !== fin.n) note(tag, 'saw ' + seenIds.length + ' of ' + fin.n + ' steps');
    await sleep(300);
    const e = await p.evaluate(() => { const c = document.querySelector('.gxt-end'); if (!c) return null; const r = c.querySelector('.gxt-endc').getBoundingClientRect(); return { t: c.querySelector('.gxt-et').textContent, x: c.querySelector('.gxt-ex').textContent, btns: [...c.querySelectorAll('[data-gxt-end]')].map(b => ({ t: b.textContent, k: b.dataset.gxtEnd, r: (() => { const q = b.getBoundingClientRect(); return [q.left, q.top, q.right, q.bottom, q.width, q.height]; })() })), inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }; });
    if (!e) note(tag, 'no end card'); else {
      if (!/know the rules/i.test(e.t)) note(tag, 'end card title: ' + e.t);
      if (!e.inside) note(tag, 'end card outside the screen');
      for (const b of e.btns) if (b.r[5] < 40) note(tag, 'end button too small: ' + b.t);
      await shot('end');
      if (mode === 'story') {
        const ks = e.btns.map(b => b.k).join(); if (ks !== 'chapter' || !/Start chapter 1/.test(e.btns[0].t)) note(tag, 'story prologue end card buttons: ' + JSON.stringify(e.btns.map(b => b.t)));
        else {
          const c = centre(e.btns[0].r); await p.touchscreen.tap(c[0], c[1]); await sleep(1000);
          let ok = false;
          for (let k = 0; k < 14; k++) {
            ok = await p.evaluate(() => !!UI.camp && !!G && !G.over && !UI.tut && !document.querySelector('.gxc:not([hidden])') && !!document.querySelector('.glow'));
            if (ok) break;
            const t = await p.evaluate(() => { const b = document.querySelector('.gxc-btn.go') || document.querySelector('.gxc-btn.ghost') || document.querySelector('.gxc-btn'); if (!b) return null; const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
            if (t) await p.touchscreen.tap(t[0], t[1]); await sleep(500);
          }
          if (!ok) note(tag, 'chapter 1 did not start after the tutorial ' + JSON.stringify(await p.evaluate(() => ({ camp: !!UI.camp, g: !!G, over: G && G.over, tut: UI.tut, gxc: [...document.querySelectorAll('.gxc')].map(e => e.className), btns: [...document.querySelectorAll('.gxc-btn')].map(b => b.textContent), glow: !!document.querySelector('.glow'), cells: document.querySelectorAll('.gxt-cell').length }))));
        }
        const st2 = await p.evaluate(() => JSON.parse(localStorage.getItem('gxt-rampart-and-vine') || '{}')); if (!st2.done) note(tag, 'prologue not remembered as done');
        // second time: Story goes straight to the chapter map; the chapter list has a Tutorial button
        await p.evaluate(() => { GXC.close(); UI.camp = null; showStart(); }); await sleep(300);
        const sb = await p.evaluate(() => { const b = document.querySelector('#modal [data-a=story]'); const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); await p.touchscreen.tap(sb[0], sb[1]); await sleep(600);
        const m = await p.evaluate(() => ({ run: GXT.running(), map: !!document.querySelector('.gxc-map-on,.gxc.on,.gxc'), rep: [...document.querySelectorAll('.gxc-head button, .gxc button')].some(b => /Tutorial/.test(b.textContent)) }));
        if (m.run) note(tag, 'a finished player was sent through the tutorial again'); if (!m.map) note(tag, 'Story did not open the chapter map after the tutorial'); if (!m.rep) note(tag, 'no "Tutorial" (replay) button in the chapter list');
      } else {
        const ks = e.btns.map(b => b.k).join(); if (ks !== 'play,story') note(tag, 'end card buttons: ' + ks);
        const play = e.btns.find(b => b.k === 'play'); const c = centre(play.r); await p.touchscreen.tap(c[0], c[1]); await sleep(500);
        const after = await p.evaluate(() => ({ run: GXT.running(), dom: document.querySelectorAll('.gxt-cell,.gxt-bub,.gxt-end,.gxt-top').length, start: !!document.querySelector('#modal [data-a=play]'),
          btn: (document.querySelector('#modal [data-gxt-open] b') || {}).textContent, st: JSON.parse(localStorage.getItem('gxt-rampart-and-vine') || '{}'), saved: !!localStorage.getItem('rv_save1'), cont: !!document.querySelector('#modal [data-a=cont]') }));
        if (after.run || after.dom) note(tag, 'tutorial elements left on screen after the end card (' + after.dom + ')');
        if (!after.start) note(tag, '"Play a real game" did not open the start card');
        if (!/✓/.test(after.btn || '')) note(tag, 'menu does not show Tutorial ✓ (' + after.btn + ')');
        if (!after.st.done) note(tag, 'tutorial not remembered as done');
        if (after.saved || after.cont) note(tag, 'the staged tutorial game was saved as a normal game');
        const n = await p.evaluate(() => { beginGame(); return !!G && !!G.cur && !UI.tut && G.order.length === 1 && G.total > 40; });
        if (!n) note(tag, 'a normal game did not start after the tutorial');
        else { await sleep(1000); const hb = await p.evaluate(() => !!document.querySelector('.gxt-bub,.gxt-cell')); if (hb) note(tag, 'tutorial elements in a normal game');
          await p.evaluate(() => openMenu()); const mn = await p.evaluate(() => (document.querySelector('#menu [data-gxt-open] b') || {}).textContent); if (!/Tutorial/.test(mn || '')) note(tag, 'in-game menu has no Tutorial entry: ' + mn); }
      }
    }
  }
  totals.runs++; totals.ids = seenIds.length > totals.ids.length ? seenIds : totals.ids;
  console.log(tag, 'done in', Math.round((Date.now() - t0) / 1000) + 's, steps seen', seenIds.length);
  await ctx.close();
}

(async () => {
  const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  const jobs = []; for (const [W, H] of SIZES) jobs.push([W, H, 'clean']);
  const [W0, H0] = SIZES[0]; for (const m of ['rotate', 'leave', 'skip', 'story']) jobs.push([W0, H0, m]); if (SIZES[1]) jobs.push([SIZES[1][0], SIZES[1][1], 'story']);
  const only = (process.env.MODES || '').split(',').filter(Boolean); if (only.length) for (let i = jobs.length - 1; i >= 0; i--) if (!only.includes(jobs[i][2])) jobs.splice(i, 1);
  for (const j of jobs) { guardOnce.run = j.join('x'); try { await run(b, ...j); } catch (e) { note(j.join(' '), 'CRASH ' + String(e.message).split('\n')[0]); } }
  await b.close();
  console.log('steps checked', totals.steps, 'wrong taps', totals.wrong, 'step ids', totals.ids.join(','));
  console.log(probs.length ? 'PROBLEMS ' + probs.length + '\n  ' + probs.join('\n  ') : 'PROBLEMS 0'); process.exit(probs.length ? 1 : 0);
})();
