#!/usr/bin/env node
// (a) monkey test: SEED=n SECS=90: random taps / drags / keys across every menu and in play at 390x763.
// FAIL on: any page error, stuck screen (no state change for 20 s while input is sent), a visible enabled button that does nothing on every one of >=3 taps.
const { boot, open, ok, done, sleep } = require('./lib');
const SEED = +process.env.SEED || 1, SECS = +process.env.SECS || 90, W = 390, H = 763;
let s = SEED * 2654435761 >>> 0; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; const ri = n => Math.floor(rnd() * n);
const KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter', 'Escape', 'KeyZ', 'KeyX', 'Tab', 'KeyP', 'KeyM', 'Digit1', 'Digit2'];
const SIG = () => { const m = window.__mnr, vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none'; };
  let t = ''; for (const e of document.querySelectorAll('body *')) { if (e.children.length || !vis(e)) continue; const x = e.textContent; if (x && x.length < 60) t += x + '|'; }
  const g = m.G; return [t, m.running, m.paused, g && g.di, g && Math.floor((g.score || 0) / 50), m.ST && m.ST.on, m.SH && m.SH.active, Object.keys(localStorage).length, localStorage.getItem('mnr_bank'), document.querySelectorAll('.on,.open,.sel,.active').length, document.body.innerHTML.length].join('#'); };
(async () => {
  const B = await boot(); const p = await open(B.br, B.base, W, H, '?monkey=' + SEED);
  const noeff = {}, taps = {}; const t0 = Date.now(); let last = await p.evaluate(SIG), lastChange = Date.now(), n = 0, stuck = 0, stuckMsg = '';
  const pick = () => p.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none' && getComputedStyle(e).pointerEvents !== 'none'; };
    const L = [...document.querySelectorAll('button,[role=button],a[href],input,select,label,.card,.chk,.sl,[onclick]')].filter(vis).map(e => { const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); const dis = e.disabled || e.getAttribute('aria-disabled') === 'true' || /disabled|locked/.test(e.className + '');
      const grp = e.parentElement ? [...e.parentElement.children].filter(c => c.tagName === e.tagName).length : 1; return { grp, id: (e.id || e.tagName + ':' + (e.textContent || '').trim().slice(0, 18) + ':' + (e.className + '').slice(0, 20)), x: r.left + r.width / 2, y: r.top + r.height / 2, hit: !!top && (top === e || e.contains(top) || top.contains(e)), dis }; });
    return L; });
  while ((Date.now() - t0) / 1000 < SECS) {
    n++; const a = rnd(); let desc = '';
    try {
      if (a < .45) { const L = await pick(); if (L.length) { const b = L[ri(L.length)]; const before = await p.evaluate(SIG); await p.touchscreen.tap(b.x, b.y); await sleep(350); const after = await p.evaluate(SIG);
          if (b.hit && !b.dis && b.grp < 2) { taps[b.id] = (taps[b.id] || 0) + 1; if (before === after) noeff[b.id] = (noeff[b.id] || 0) + 1; else noeff[b.id] = -999; } } }
      else if (a < .65) await p.touchscreen.tap(rnd() * W, rnd() * H);
      else if (a < .85) { const x0 = rnd() * W, y0 = rnd() * H; await p.mouse.move(x0, y0); await p.mouse.down(); for (let i = 1; i <= 6; i++) { await p.mouse.move(x0 + (rnd() - .5) * 200 * i / 6, y0 + (rnd() - .5) * 300 * i / 6); await sleep(16); } await p.mouse.up(); }
      else { const k = KEYS[ri(KEYS.length)]; await p.keyboard.press(k); }
      if (rnd() < .06) await p.evaluate(() => { const b = document.getElementById('startBtn'); if (b && b.offsetParent && !window.__mnr.running) b.click(); });   // keep reaching play as well as menus
      if (rnd() < .05 && (await p.evaluate(() => window.__mnr.running))) { await p.evaluate(() => { window.__mnr.god = true; }); }
    } catch (e) { desc = 'input error ' + String(e.message).split('\n')[0]; }
    const now = await p.evaluate(SIG).catch(() => last);
    if (now !== last) { last = now; lastChange = Date.now(); } else if (Date.now() - lastChange > 20000) { stuck++; stuckMsg = 'no state change for 20 s with ' + n + ' inputs sent'; lastChange = Date.now(); }
    if (p.errs.length > 3 && n % 20 === 0) break;
  }
  ok(`seed ${SEED}: ${n} inputs in ${SECS} s, no page error`, !p.errs.length, p.errs.slice(0, 3).join(' | '));
  ok(`seed ${SEED}: never stuck (20 s without state change)`, !stuck, stuckMsg);
  const dead = Object.keys(noeff).filter(k => noeff[k] >= 3 && noeff[k] === taps[k]);
  ok(`seed ${SEED}: no button that always does nothing (${Object.keys(taps).length} buttons tapped)`, !dead.length, dead.slice(0, 8).join(' | '));
  if (dead.length) console.log('  DEAD ' + dead.join(' ;; '));
  ok(`seed ${SEED}: no failed request`, !p.bad.length, p.bad.slice(0, 4).join(' | '));
  await B.close(); done('monkey-' + SEED);
})().catch(e => { console.log('FAIL monkey crash :: ' + e.message); process.exit(1); });
