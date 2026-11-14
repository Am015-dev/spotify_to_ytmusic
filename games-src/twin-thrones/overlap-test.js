// Overlap gate: walks every dock state at a phone size and fails on any overlap between the pyramid, the city rows,
// the dock and its buttons, on cut card names, on text under 14px, and on content outside the screen.
// Usage: TW=375 TH=667 node overlap-test.js [twin-thrones.html]   (default 375x667; run 390x844 too)
const { chromium } = require('playwright');
(async () => {
  const W = +(process.env.TW || 375), H = +(process.env.TH || 667), b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await pg.goto('file://' + require('path').resolve(process.argv[2] || 'twin-thrones.html') + '?seed=11'); await pg.waitForTimeout(600);
  const tap = async s => { const r = await pg.locator(s).first().boundingBox(); await pg.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await pg.waitForTimeout(350); };
  await tap('[data-start="1"]'); await tap('[data-goalgo]');
  const settle = async () => { for (let k = 0; k < 40 && !(await pg.evaluate(() => !TT_TEST.U.narr && !TT_TEST.U.busy)); k++) await pg.waitForTimeout(150); await pg.waitForTimeout(450); };
  const toAge = async (age, steps) => pg.evaluate(([age, steps]) => {
    window.AIDELAY = 0; const U = TT_TEST.U, E = TT_TEST.E; let k = 0;
    TT_TEST.toPlay(steps || 0);
    while (U.G.age < age && !U.G.over && k++ < 400) { const G = U.G; const M = E.validMoves(G); E.apply(G, M.find(m => m.t === 'discard') || M[0]); }
    TT_TEST.toPlay(0); return U.G.age;
  }, [age, steps]);
  const measure = name => pg.evaluate(([name, W, H]) => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const vis = e => { if (!e) return false; const s = getComputedStyle(e); const r = e.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 1 && r.height > 1; };
    const ov = (a, c) => Math.min(a.r, c.r) - Math.max(a.l, c.l) > 1 && Math.min(a.b, c.b) - Math.max(a.t, c.t) > 1;
    const bad = [];
    const cards = [...document.querySelectorAll('#pyr .card:not(.taken)')].filter(vis).map(R);
    const s0 = R(document.getElementById('s0')), s1 = R(document.getElementById('s1')), dk = R(document.getElementById('dock')), pyr = R(document.getElementById('pyr'));
    const sheet = document.querySelector('.gx-app.ttsheet');
    // pyramid cards stay inside the mat and off both cities and the dock (a sheet over the pyramid is allowed: it is the dock)
    cards.forEach((c, i) => {
      if (c.t < pyr.t - 2 || c.b > pyr.b + 2) bad.push('card ' + i + ' outside the mat');
      if (ov(c, s0)) bad.push('card ' + i + ' over your city'); if (ov(c, s1)) bad.push('card ' + i + ' over the rival city');
      if (!sheet && ov(c, dk)) bad.push('card ' + i + ' under the dock');
    });
    if (cards.length && pyr.h < 120) bad.push('pyramid squashed to ' + Math.round(pyr.h) + 'px');
    if (ov(dk, s0)) bad.push('dock over your city'); if (ov(dk, s1)) bad.push('dock over the rival city');
    // the lift (tapped card + Build/Sell/Wonder) stays off both cities and the dock
    const lift = document.querySelector('#zoom:not([hidden]) .lift');
    if (lift) { const l = R(lift); if (ov(l, s0)) bad.push('lift over your city'); if (ov(l, s1)) bad.push('lift over the rival city'); if (ov(l, dk)) bad.push('lift over the dock'); if (l.b > H || l.t < 0) bad.push('lift off screen'); }
    // every button: on screen, 44px+ tall, not covered by a floater or tooltip
    const btns = [...document.querySelectorAll('#acts button, #zoom .zb, #dock .gx-ibtn')].filter(vis);
    btns.forEach(e => { const r = R(e), t = (e.textContent || '').trim().slice(0, 14);
      if (r.b > H + 1 || r.t < -1 || r.l < -1 || r.r > W + 1) bad.push('button "' + t + '" off screen');
      if (r.h < 43) bad.push('button "' + t + '" ' + Math.round(r.h) + 'px tall');
      document.querySelectorAll('.pop-n, #toast.on, #toast.show').forEach(f => { if (vis(f) && getComputedStyle(f).opacity > 0.1 && ov(R(f), r)) bad.push('floater "' + f.textContent.slice(0, 16) + '" over "' + t + '"'); });
    });
    // buttons do not overlap each other
    for (let i = 0; i < btns.length; i++) for (let j = i + 1; j < btns.length; j++) if (ov(R(btns[i]), R(btns[j])) && !btns[i].contains(btns[j]) && !btns[j].contains(btns[i])) bad.push('buttons overlap: ' + btns[i].textContent.trim().slice(0, 10) + ' / ' + btns[j].textContent.trim().slice(0, 10));
    // uncovered card names are whole words, 14px+
    document.querySelectorAll('#pyr .card.av .nm, #zoom .nm').forEach(e => { if (!vis(e)) return; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 13.9) bad.push('name "' + e.textContent + '" ' + fs + 'px'); if (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2) bad.push('name cut "' + e.textContent + '" ' + e.clientWidth + '/' + e.scrollWidth + ' ' + e.className); });
    // dock and picker text 14px+
    document.querySelectorAll('#dock button, #dock #msg, #acts small, #acts b').forEach(e => { if (!vis(e) || !e.textContent.trim()) return; let fs = parseFloat(getComputedStyle(e).fontSize); if (!fs) fs = parseFloat(getComputedStyle(e, '::after').fontSize); if (fs < 13.9) bad.push('dock text "' + e.textContent.trim().slice(0, 12) + '" ' + fs + 'px'); });
    if (document.scrollingElement.scrollWidth > W + 1) bad.push('page scrolls sideways');
    return { name, bad: [...new Set(bad)], pyrH: Math.round(pyr.h), dockH: Math.round(dk.h), cards: cards.length };
  }, [name, W, H]);
  const out = []; const shot = async n => { if (process.env.SHOTS) await pg.screenshot({ path: process.env.SHOTS + '/ov-' + W + '-' + n + '.png' }); };
  const st = async (n, fn) => { await pg.evaluate(fn); await settle(); out.push(await measure(n)); await shot(n); };
  const render = 'TT_UI.render()';
  // 1 idle, Age I
  await toAge(1, 0); await settle(); out.push(await measure('idle-age1')); await shot('idle-age1');
  // 2 lift: a card you can pay for, and one you cannot
  await st('lift-ok', () => { const U = TT_TEST.U, E = TT_TEST.E, G = U.G; G.players[0].coins = 20; TT_UI.render(); const a = E.available(G)[0]; TT_TEST.select(a.i); });
  await st('lift-costly', () => { const U = TT_TEST.U, E = TT_TEST.E, G = U.G; TT_UI.closeZoom && TT_UI.closeZoom(); U.sel = null; G.players[0].coins = 0; TT_UI.render(); const BY = TT_UI.BY; const av = E.available(G); const a = av.find(c => E.buildInfo(G, 0, BY[c.id]).coins > 0) || av[0]; TT_TEST.select(a.i); });
  // 3 token pick from the board row (5 up) and from the library (3)
  await st('token-up', () => { const U = TT_TEST.U, G = U.G; U.sel = null; G.players[0].coins = 6; G.pend.unshift({ type: 'token', pl: 0, from: 'up' }); TT_UI.render(); });
  await st('token-armed', () => { const U = TT_TEST.U; U.tokArm = U.G.tokensUp[0]; TT_UI.render(); });
  await st('token-lib', () => { const U = TT_TEST.U, G = U.G; U.tokArm = null; G.pend.shift(); G.pend.unshift({ type: 'token', pl: 0, from: 'lib', list: G.tokensBox.slice(0, 3) }); TT_UI.render(); });
  await st('destroy', () => { const U = TT_TEST.U, G = U.G; G.pend.shift(); const l = G.players[1].cards.slice(0, 4); if (!l.length) l.push(G.pyr[0].id); G.pend.unshift({ type: 'destroy', pl: 0, list: l }); TT_UI.render(); });
  await st('revive', () => { const U = TT_TEST.U, G = U.G; G.pend.shift(); if (!G.discard.length) G.discard.push(G.pyr[0].id, G.pyr[1].id); G.pend.unshift({ type: 'revive', pl: 0 }); TT_UI.render(); });
  await st('clear', () => { const G = TT_TEST.U.G; G.pend = []; TT_UI.render(); });
  // 4 who starts, Age II (with a floater fired at the dock) and Age III
  for (const age of [2, 3]) {
    await toAge(age, 0); await settle(); out.push(await measure('idle-age' + age)); await shot('idle-age' + age);
    await st('who-starts-age' + age, () => { const U = TT_TEST.U, G = U.G; U.sel = null; G.pend.unshift({ type: 'first', pl: 0 }); TT_UI.render(); if (TT_TEST.pop) TT_TEST.pop('+3 Open Stage', 'pts'); });
    await pg.waitForTimeout(500); out.push(await measure('who-starts-age' + age + '-floater')); await shot('who-starts-age' + age + '-floater');
    await st('lift-age' + age, () => { const U = TT_TEST.U, E = TT_TEST.E, G = U.G; G.pend = []; TT_UI.render(); const a = E.available(G)[0]; TT_TEST.select(a.i); });
    await st('token-age' + age, () => { const U = TT_TEST.U, G = U.G; U.sel = null; TT_UI.closeZoom && TT_UI.closeZoom(); G.pend.unshift({ type: 'token', pl: 0, from: 'up' }); TT_UI.render(); });
    await pg.evaluate(() => { TT_TEST.U.G.pend = []; TT_UI.render(); });
  }
  const fails = out.filter(o => o.bad.length);
  out.forEach(o => console.log((o.bad.length ? 'FAIL ' : 'ok   ') + o.name.padEnd(26) + ' pyr ' + o.pyrH + ' dock ' + o.dockH + ' cards ' + o.cards + (o.bad.length ? '  ' + o.bad.slice(0, 6).join('; ') : '')));
  const ok = !fails.length && !errs.length && out.length >= 19;
  console.log((ok ? 'PASS' : 'FAIL') + ' overlap ' + W + 'x' + H + ' states ' + out.length + ' failing ' + fails.length + ' errors ' + errs.length + (errs.length ? ' ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); process.exit(ok ? 0 : 1);
})();
