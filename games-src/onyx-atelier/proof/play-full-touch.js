// Full game by real touch (mouse on desktop size) at machine speed + screenshots of main screen and each panel + phone audit.
// Run: W=402 H=874 node proof/play-full-touch.js    (HTML must be built)
const { chromium } = require('playwright'); const path = require('path');
const D = __dirname, W = +(process.env.W || 402), H = +(process.env.H || 874), TOUCH = W < 800, TAG = W + 'x' + H;
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: W, height: H }, hasTouch: TOUCH, isMobile: TOUCH });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(D, '..', 'onyx-atelier.html')); await p.waitForTimeout(400);
  const shot = n => p.screenshot({ path: path.join(D, n + '-' + TAG + '.png') });
  const tap = async sel => { const r = await p.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
    if (!r) throw new Error('missing ' + sel); if (TOUCH) await p.touchscreen.tap(r.x, r.y); else await p.mouse.click(r.x, r.y); await p.waitForTimeout(25); };
  const audit = async label => p.evaluate(label => { const bad = [];
    document.querySelectorAll('button:not([disabled])').forEach(e => { const r = e.getBoundingClientRect(); if (!r.width || getComputedStyle(e).visibility === 'hidden') return;
      if (e.closest('#rival .cols')) return; if (r.width < 43.5 || r.height < 43.5) bad.push(label + ' tap ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + (e.id || e.className || e.getAttribute('aria-label'))); });
    document.querySelectorAll('body *').forEach(e => { if (!e.childNodes.length) return; let t = ''; e.childNodes.forEach(n => { if (n.nodeType === 3) t += n.textContent.trim(); }); if (!t) return; const cs = getComputedStyle(e), r = e.getBoundingClientRect();
      if (r.width && cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.fontSize) < 12.9 && !e.closest('svg,#coach')) bad.push(label + ' font ' + cs.fontSize + ' "' + t.slice(0, 20) + '"'); });
    return bad.slice(0, 12); }, label);
  await p.evaluate(() => { window.AIDELAY = 0; OA_TEST.newGame('normal', 5, 0); }); await p.waitForTimeout(400);
  const all = [...await audit('main')]; await shot('main');
  for (const [name, sel] of [['rules', '#rulesbtn'], ['log', '#logbtn'], ['you', '#me [data-panel]'], ['rival', '#rival [data-panel]'], ['patrons', '[data-pat]'], ['favours', '[data-info=fav]'], ['card', '.card[data-l="1"][data-i="0"]']]) {
    await tap(sel); await p.waitForTimeout(150); all.push(...await audit(name));
    const x = await p.evaluate(() => { const e = document.querySelector('[data-close]'); const r = e && e.getBoundingClientRect(); return r ? [r.width, r.height] : null; });
    if (!x || x[0] < 44 || x[1] < 44) all.push(name + ' X too small ' + x);
    await shot('panel-' + name);
    await p.mouse.click(5, 5); await p.waitForTimeout(80); // tap outside closes
    if (await p.evaluate(() => !!document.querySelector('#sheet,.modal'))) all.push(name + ' did not close on outside tap');
  }
  // full game
  await p.evaluate(() => { OA_TEST.newGame('normal', 7, 0); }); await p.waitForTimeout(200);
  const ready = () => p.evaluate(() => { const U = OA_TEST.U; return U.G.over || (U.G.turn === 0 && !U.busy); });
  let n = 0, overlap = [];
  while (n++ < 700) {
    for (let i = 0; i < 400 && !await ready(); i++) await p.waitForTimeout(10);
    const st = await p.evaluate(() => { const g = OA_TEST.U.G; return { over: g.over, seq: g.over ? [] : OA_TEST.AI.hint(g), pend: g.pend && g.pend.h }; });
    if (st.over) break; const m = st.seq[0]; if (process.env.DBG && n > 5) { const k = await p.evaluate(() => OA_TEST.U.G.n); if (k === global.__k) { global.__s = (global.__s||0)+1; if (global.__s === 4) { console.log('STALL', JSON.stringify(m), JSON.stringify(await p.evaluate(() => ({pend: OA_TEST.U.G.pend, mode: OA_TEST.U.mode, sel: OA_TEST.U.sel, busy: OA_TEST.U.busy, t: OA_TEST.U.G.pl[0].t})))); await shot('stall'); console.log(JSON.stringify(await p.evaluate(() => ['#bar','#rival','#pyr','#mid','#me','#app'].map(s => { const r = document.querySelector(s).getBoundingClientRect(); return s + ':' + Math.round(r.top) + '-' + Math.round(r.bottom); })))); } } else { global.__s = 0; global.__k = k; } }
    if (!m) { all.push('no move'); break; }
    if (m.t !== 'royal') await p.evaluate(() => { document.querySelectorAll('.modal,#sheet,#scrim').forEach(e => e.remove()); });
    const cell = k => '.cell[data-cell="' + k + '"]';
    if (m.t === 'take') { for (const k of m.cells) await tap(cell(k)); await tap('#takebtn'); }
    else if (m.t === 'buy') { if (m.res !== undefined) { await tap('#resbtn'); await tap('[data-r="' + m.res + '"]'); } else await tap('.card[data-l="' + m.l + '"][data-i="' + m.i + '"]'); await tap('#sheet [data-buy]'); }
    else if (m.t === 'reserve') { await tap(cell(m.gold)); await tap(m.deck ? '.card.back[data-deck="' + m.l + '"]' : '.card[data-l="' + m.l + '"][data-i="' + m.i + '"]'); if (await p.evaluate(() => !!document.querySelector('#sheet [data-res]'))) await tap('#sheet [data-res]'); }
    else if (m.t === 'fav') { await tap('[data-fav]'); await tap(cell(m.cell)); }
    else if (m.t === 'refill') await tap('#refillbtn');
    else if (m.t === 'tok') await tap(cell(m.cell));
    else if (m.t === 'steal') await tap('#rival .col[data-c="' + m.c + '"]');
    else if (m.t === 'disc' || m.t === 'wild') await tap('#me .col[data-c="' + m.c + '"]');
    else if (m.t === 'royal') { await p.waitForSelector('[data-pick="' + m.id + '"]'); await tap('[data-pick="' + m.id + '"]'); }
    else all.push('unhandled ' + m.t);
    await p.waitForTimeout(15);
  }
  const res = await p.evaluate(() => { const g = OA_TEST.U.G; return { over: g.over, n: g.n, pts: [0, 1].map(i => OA_TEST.E.points(g.pl[i])) }; });
  await p.waitForTimeout(1200); await shot('result');
  const vis = await p.evaluate(() => !!document.querySelector('[data-again]'));
  console.log(TAG, 'game', JSON.stringify(res), 'result shown', vis, 'moves', n, 'js errors', errs.length, errs.slice(0, 3).join(' | '));
  console.log('audit issues', all.length); all.forEach(x => console.log('  ', x));
  await b.close(); process.exit(res.over && vis && !errs.length && !all.length ? 0 : 1);
})();
