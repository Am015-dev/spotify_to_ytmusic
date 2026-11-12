// Full Quick game by touch, following the glow, at 390x844 and 375x667 (real animation speed, rival fast).
// BEST=1 (hints on, always tap the Best badge) or BEST=0.5 (a mixed newcomer: Best half the time) measures the hint by touch.
// Counts taps, dock scrolls (target not fully on screen when it is wanted) and dead taps (a glowing target whose tap changes
// nothing within 1 s). Every glowing target must answer its first tap.   node tests/touch-game.js [url] [maxScrolls]
const { chromium } = require('playwright');
const BESTP = +(process.env.BEST || 0), HINTS = BESTP > 0;
const URL = process.argv[2] || 'http://127.0.0.1:8765/perch-and-plume/', MAXS = +(process.argv[3] || 1);
(async () => {
  const b = await chromium.launch(); let fails = 0; const errs = [];
  const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
  for (const [w, h] of (process.env.SIZES || '390x844,375x667').split(',').map(x => x.split('x').map(Number))) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    await ctx.addInitScript((HINTS) => { try { localStorage.setItem('gns-prefs', JSON.stringify({ ai: 'fast' })); localStorage.setItem('pp-played', '1'); if (HINTS) localStorage.setItem('pp-hints', '1'); } catch (e) { } }, HINTS);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(URL); await p.waitForTimeout(800);
    for (const s of ['[data-t="quick"]', '[data-go]', '#keepgo']) { await p.locator(s).first().waitFor({ timeout: 10000 }); await p.locator(s).first().tap(); await p.waitForTimeout(500); }
    let taps = 0, scrolls = 0, dead = [], t0 = Date.now(), idle = Date.now();
    const sig = () => p.evaluate(() => JSON.stringify([G, UI.sel, UI.pend, UI.pickBird, UI.gsDie, UI.busy, !document.querySelector('#pop').hidden]).length + ':' + JSON.stringify([G.q, UI.sel, UI.pend, UI.pickBird, UI.gsDie, G.pl.map(x => [x.food, x.hand.length, x.board.map(r => r.length)])]));
    while (Date.now() - t0 < 600000) {
      const tgt = await p.evaluate((BESTP) => {
        const vis = e => e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
        if (!document.querySelector('#result').hidden) return 'result';
        if (document.querySelector('.turnban,.reveal') || UI.busy || !myTurn()) { const pg = document.querySelector('#passgo'); return pg && vis(pg) ? '#passgo' : null; }
        const pop = document.querySelector('#pop'); if (!pop.hidden) return '[data-a="popx"]';
        const go = document.querySelector('[data-a="playgo"]'); if (vis(go)) return '[data-a="playgo"]';
        const gl = [...document.querySelectorAll('.glow')].filter(vis);
        const onScr = e => { const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 24)); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && !!t && (t === e || e.contains(t)); };
        const pickOne = (all) => { const seen = all.filter(onScr), arr = seen.length ? seen : all; const e = arr[Math.floor(Math.random() * arr.length)];   // a newcomer taps a glowing thing they can see; a scroll is counted only when none is on screen
 e.setAttribute('data-tt', '1'); document.querySelectorAll('[data-tt]').forEach(x => x !== e && x.removeAttribute('data-tt')); return '[data-tt="1"]'; };
        if (BESTP && Math.random() < BESTP) { const bb = [...document.querySelectorAll('.bestb')].filter(vis).map(e => e.closest('.a4,.bc,.die,.slot,button,[data-a]')).filter(Boolean); if (bb.length) { (window.__nb = window.__nb || { best: 0, miss: {} }).best++; return pickOne(bb); } const m = typeof hintMove === 'function' ? hintMove() : null, k = (G.q ? G.q.h : 'main') + ':' + (m ? m.t : 'none') + (UI.sel != null ? ':sel' : '') + (UI.pend ? ':pend' : ''); (window.__nb = window.__nb || { best: 0, miss: {} }).miss[k] = (window.__nb.miss[k] || 0) + 1; }
        if (gl.length) { const s = gl.filter(e => e.matches('.slot')); if (s.length) return pickOne(s); return pickOne(gl); }
        if (document.querySelector('#act4') && !UI.pickBird) { const a = [...document.querySelectorAll('.a4:not([aria-disabled])')]; if (a.length) return pickOne(a); }
        const mv = [...document.querySelectorAll('#acts [data-a="mv"], #acts .bonc')].filter(vis); if (mv.length) return pickOne(mv);
        return null;
      }, BESTP);
      if (tgt === 'result') break;
      if (!tgt) { if (Date.now() - idle > 25000) { ok(false, `${w}x${h} stuck: nothing to tap for 25 s`); await p.screenshot({ path: 'shots/touch-stuck.png' }); break; } await p.waitForTimeout(150); continue; }
      const loc = p.locator(tgt).first();
      const inView = await loc.evaluate(e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && (() => { const t = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 24)); return !!t && (t === e || e.contains(t)); })(); }).catch(() => null);
      if (inView === null) continue;
      if (!inView) { scrolls++; if (process.env.WHY) console.log('     scroll for: ' + await loc.evaluate(e => { const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 24)); return (e.className + ' ' + (e.dataset.a || '') + ' ' + (e.textContent || '').trim().slice(0, 24) + ' @' + Math.round(r.top) + '-' + Math.round(r.bottom) + ' q=' + (G.q && G.q.h) + ' pick=' + UI.pickBird + ' sel=' + UI.sel + ' top=' + (t ? t.className || t.id : '-')); })); await loc.scrollIntoViewIfNeeded().catch(() => { }); await p.waitForTimeout(200); }
      const before = await sig(); const what = await loc.evaluate(e => (e.className || e.id || '') + ' ' + (e.textContent || '').trim().slice(0, 20)).catch(() => '');
      const box = await loc.boundingBox().catch(() => null); if (!box) continue;
      await p.touchscreen.tap(box.x + box.width / 2, box.y + Math.min(box.height / 2, 24)); taps++; idle = Date.now(); if (taps % 25 === 0) console.log(`     ${w}x${h} ... ${taps} taps, ${scrolls} scrolls, ${dead.length} dead, round ${await p.evaluate(() => G.round + 1)}`);
      const changed = await p.waitForFunction(s => { try { return (JSON.stringify([G, UI.sel, UI.pend, UI.pickBird, UI.gsDie, UI.busy, !document.querySelector('#pop').hidden]).length + ':' + JSON.stringify([G.q, UI.sel, UI.pend, UI.pickBird, UI.gsDie, G.pl.map(x => [x.food, x.hand.length, x.board.map(r => r.length)])])) !== s; } catch (e) { return true; } }, before, { timeout: 1000, polling: 30 }).then(() => true).catch(() => false);
      if (!changed && !/popx|passgo/.test(tgt)) dead.push(what);
      if (dead.length > 12) { console.log('     stuck on dead taps: ' + dead.slice(-3).join(' | ') + ' :: ' + await p.evaluate(() => JSON.stringify({ q: G.q && G.q.h, sel: UI.sel, pend: UI.pend, pick: UI.pickBird, hm: typeof hintMove === 'function' ? hintMove() : null, prompt: document.querySelector('#prompt').textContent }))); await p.screenshot({ path: 'shots/touch-dead.png' }); break; }
      await p.waitForTimeout(100);
    }
    const res = await p.evaluate(() => !document.querySelector('#result').hidden ? G.pl.map((x, i) => x.name + ' ' + G.final[i].total).join(' / ') + ' ' + document.querySelector('#result').innerText.replace(/\s+/g, ' ').slice(0, 80) : 'no result');
    console.log(`     ${w}x${h}: ${taps} taps, ${scrolls} scrolls, ${dead.length} dead taps, ${Math.round((Date.now() - t0) / 1000)} s; ${res}`);
    if (BESTP) console.log('     best taps / misses: ' + await p.evaluate(() => JSON.stringify(window.__nb || {})));
    ok(res !== 'no result', `${w}x${h} full game reaches the result`);
    ok(dead.length === 0, `${w}x${h} every glowing target answers its first tap (${dead.length} dead${dead.length ? ': ' + dead.slice(0, 3).join(' | ') : ''})`);
    ok(scrolls <= MAXS, `${w}x${h} dock scrolls ${scrolls} (target 0-${MAXS})`);
    await p.screenshot({ path: `shots/touch-${w}-result.png` });
    await ctx.close();
  }
  ok(errs.length === 0, 'console/page errors ' + errs.length + ' ' + errs.slice(0, 2).join(' | '));
  await b.close(); process.exit(fails ? 1 : 0);
})();
