// W650 gate: tutorial + practice game at machine speed, phone 402x874 (touch) and PC 1366x768 (mouse).
// Checks: screen map labels all shown, non-overlapping, tappable; a tap on a NON-highlighted thing works; window drag / minimise / close / ?;
// every lesson reached; no HUD overlaps; text >= 13px; buttons >= 44px; 0 JS errors; the practice game finishes. Shots -> proof/w650-*.png
// Usage: [WM_URL=...] node proof/tut-run.js
const { chromium } = require('playwright');
const URL = process.env.WM_URL || 'file://' + __dirname + '/../wildmark.html', OUT = __dirname + '/w650-';
const ov = (a, b) => a && b && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
(async () => {
  const br = await chromium.launch(); let allOk = true;
  for (const [name, vp, touch] of [['402x874', { width: 402, height: 874 }, true], ['1366x768', { width: 1366, height: 768 }, false]]) {
    const ctx = await br.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), p = await ctx.newPage(), errs = [], bad = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    const tapEl = async sel => { const l = p.locator(sel).first(); if (touch) await l.tap({ force: true }); else await l.click({ force: true }); };
    const tapXY = async (x, y) => { if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); };
    await p.goto(URL); await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.goto(URL); await p.waitForTimeout(700);
    await p.evaluate(() => { window.AIDELAY = 0; window.ANIM = false; });
    await p.evaluate(() => tutStart({})); await p.waitForTimeout(300);
    // 1. the screen map
    const hm = await p.evaluate(() => {
      const L = [...document.querySelectorAll('#hudmap .hmlab, #hudmap .hmhead')].map(e => e.getBoundingClientRect()), o = [];
      for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const a = L[i], b = L[j]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) o.push(i + 'x' + j); }
      const off = L.filter(r => r.left < 0 || r.right > innerWidth || r.top < 0 || r.bottom > innerHeight).length, small = L.filter(r => r.height < 44).length;
      return { n: WM_HUDMAP.n, want: WM_HUDMAP.want, o, off, small, dim: [...document.querySelectorAll('body *')].some(e => { const c = getComputedStyle(e); return c.position === 'fixed' && /rgba\(0, 0, 0, 0\.[3-9]/.test(c.backgroundColor) && e.getBoundingClientRect().width >= innerWidth - 2; }) };
    });
    if (!hm.n || hm.n !== hm.want) bad.push('screen map shows ' + hm.n + '/' + hm.want + ' labels'); if (hm.o.length) bad.push('screen map overlaps ' + hm.o.join(',')); if (hm.off) bad.push('screen map label off screen'); if (hm.small) bad.push('screen map tap target < 44'); if (hm.dim) bad.push('a dimming layer');
    await tapEl('#hudmap .hmlab >> nth=2'); await p.waitForTimeout(100);
    const said = await p.evaluate(() => document.querySelector('#hudmap .hmsay').textContent); if (/^Tap a label/.test(said)) bad.push('screen map label tap did nothing');
    await p.screenshot({ path: OUT + name + '-1-screenmap.png' });
    await tapEl('#hmNext'); await p.waitForTimeout(150);
    // 2. the floating window: shot, drag, minimise, close, ? reopens
    await p.screenshot({ path: OUT + name + '-2-lesson.png' });
    const w0 = await p.locator('#coachb .twh').boundingBox();
    if (touch) { await p.evaluate(() => { const h = document.querySelector('#coachb .twh'), r = h.getBoundingClientRect(), ev = (t, x, y) => h.dispatchEvent(new PointerEvent(t, { clientX: x, clientY: y, pointerId: 1, bubbles: true })); ev('pointerdown', r.left + 20, r.top + 20); ev('pointermove', r.left + 20, r.top + 220); ev('pointerup', r.left + 20, r.top + 220); }); }
    else { await p.mouse.move(w0.x + 20, w0.y + 20); await p.mouse.down(); await p.mouse.move(w0.x + 20, w0.y + 220, { steps: 4 }); await p.mouse.up(); }
    const w1 = await p.locator('#coachb .twh').boundingBox(); if (!(w1.y > w0.y + 100)) bad.push('window did not drag');
    await tapEl('#tutMin'); const mn = await p.evaluate(() => document.querySelector('#coachb').classList.contains('min')); if (!mn) bad.push('minimise failed'); await tapEl('#tutMin');
    await tapEl('#tutX'); const cl = await p.evaluate(() => document.querySelector('#coachb').hidden); if (!cl) bad.push('close failed');
    await tapEl('#tutQ'); await p.waitForTimeout(100); const re = await p.evaluate(() => !!document.querySelector('#hudmap')); if (!re) bad.push('? did not reopen the screen map'); await tapEl('#hmX');
    await p.evaluate(() => { UI.tutPos = null; render(); });
    const ck = await p.evaluate(() => !document.querySelector('#coachb').hidden); if (!ck) bad.push('lesson did not come back after ?');
    await tapEl('#tutList'); const li = await p.evaluate(() => document.querySelectorAll('#coachb .twlist li').length); if (li < 20) bad.push('checklist has ' + li); await tapEl('#tutList');
    // 3. play the guided game: tap the glowing thing (or Next); once, tap a NON-highlighted market column and assert it works
    let offTried = 0, lastI = -1, shots = 0, hudBad = new Set();
    for (let g = 0; g < 1500; g++) {
      const st = await p.evaluate(() => {
        const T = UI.tut, rs = !document.getElementById('rs').hidden; if (rs || !T) return { rs, end: !T };
        const s = T.steps[T.i] || {}, hl = [...document.querySelectorAll('.tuthl')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4; });
        let xy = null; if (hl.length) { const r = hl[0].getBoundingClientRect(); xy = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; const h = document.elementFromPoint(xy.x, xy.y); xy.ok = !!h && (hl[0] === h || hl[0].contains(h)); }
        const next = document.querySelector('#coachb:not([hidden]) #tutNext');
        const R = q => { const e = document.querySelector(q); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(e).display !== 'none' ? { left: r.left, right: r.right, top: r.top, bottom: r.bottom } : null; };
        const hud = {}; ['.gx-bar', '#cards', '#seats', '#terr', '#line', '#zoom', '#dock', '#coachb'].forEach(q => hud[q] = R(q));
        return { i: T.i, ok: s.ok || '', hl: s.hl || '', wait: !!s.wait, xy, next: !!next, my: myTurn(), stage: G.stage, hud };
      });
      if (st.rs || st.end) break;
      await p.evaluate(() => { try { if (document.querySelector('.gx-drawer.on')) GX.close(); } catch (e) { } });
      const H = st.hud, pairs = [['#coachb', '#line'], ['#coachb', '#dock'], ['#coachb', '.gx-bar'], ['#coachb', '#zoom'], ['#coachb', '#cards'], ['#cards', '#line'], ['#terr', '#line'], ['#zoom', '#dock'], ['#line', '#dock'], ['#cards', '#terr'], ['#seats', '#terr']];
      pairs.forEach(([a, b]) => { if (ov(H[a], H[b])) hudBad.add(a + '/' + b + '@' + st.i); });
      if (st.i !== lastI) { lastI = st.i; if ([3, 10, 20, 40].includes(st.i)) await p.screenshot({ path: OUT + name + '-3-step' + st.i + '.png' }); }
      if (!offTried && /^take:/.test(st.ok) && st.my && st.stage === 'pick') {
        offTried = 1; const other = (+st.ok.split(':')[1] + 1) % 4, box = await p.locator('#mk .mt[data-i="' + other + '"]').boundingBox();
        await tapXY(box.x + box.width / 2, box.y + box.height / 2); await p.waitForTimeout(80);
        const stg = await p.evaluate(() => G.stage); if (stg !== 'tile') bad.push('a tap on a non-highlighted pair was blocked'); else offTried = 2; continue;
      }
      if (st.wait) { await p.waitForTimeout(40); continue; }
      if (st.xy && st.xy.ok && st.my) { await tapXY(st.xy.x, st.xy.y); await p.waitForTimeout(40); continue; }
      if (st.next) { await tapEl('#tutNext'); await p.waitForTimeout(30); continue; }
      // nothing to tap (rival turn, or the suggestion is off screen): play the turn by machine
      if (st.my) await p.evaluate(() => { const m = WM.AI.choose(G); if (m.t === 'take' || m.t === 'free') take(m); else act(m); });
      await p.waitForTimeout(40);
    }
    await p.waitForTimeout(300);
    const res = await p.evaluate(() => ({ over: !!(G && G.over), rs: !document.getElementById('rs').hidden, again: (document.getElementById('againB') || {}).textContent, seen: window.WM_COACH ? WM_COACH.explained.length : 0 }));
    if (!res.over || !res.rs) bad.push('tutorial game did not finish'); if (res.seen < 20) bad.push('lessons reached ' + res.seen);
    await p.screenshot({ path: OUT + name + '-4-tutorial-result.png' });
    // 4. practice game, machine speed, to the end
    await tapEl('#againB'); await p.waitForTimeout(300);
    const pg = await p.evaluate(() => ({ turns: G.turns, mode: UI.mode })); if (pg.turns !== 20) bad.push('practice game has ' + pg.turns + ' turns');
    let shotMid = 0;
    for (let g = 0; g < 4000; g++) {
      const st = await p.evaluate(() => ({ over: G.over, my: myTurn(), done: G.seats[0].done, pass: !document.getElementById('pass').hidden }));
      if (st.over) break;
      if (st.done === 8 && !shotMid) { shotMid = 1; await p.evaluate(() => { fitView(true, true); }); await p.waitForTimeout(150); await p.screenshot({ path: OUT + name + '-5-mid-game.png' }); }
      if (st.my) await p.evaluate(() => { const m = WM.AI.choose(G); if (m.t === 'take' || m.t === 'free') take(m); else act(m); });
      else await p.evaluate(() => { try { document.getElementById('board').click(); } catch (e) { } });
      await p.waitForTimeout(25);
    }
    await p.waitForTimeout(400);
    const fin = await p.evaluate(() => ({ over: !!G.over, rs: !document.getElementById('rs').hidden, sc: G.res ? G.res.map(x => x.total).join('-') : '' }));
    if (!fin.over || !fin.rs) bad.push('practice game did not finish');
    await p.screenshot({ path: OUT + name + '-6-result.png' });
    // 5. readability: text >= 13 px and buttons >= 44 px on the play screen (a fresh quick game)
    const rd = await p.evaluate(() => {
      document.getElementById('rs').hidden = true; newGame({ np: 2, humans: 1, ai: 'gentle', turns: 20 }); render();
      const small = [], tiny = [];
      document.querySelectorAll('.gx-app *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || e.closest('svg')) return; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return;
        if ([...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs.fontSize) < 13) small.push((e.id || e.className || e.tagName) + ':' + cs.fontSize);
        if ((e.tagName === 'BUTTON' || e.getAttribute('role') === 'button') && (r.width < 43.5 || r.height < 43.5)) tiny.push((e.id || e.className || e.tagName) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); });
      return { small: [...new Set(small)].slice(0, 6), tiny: [...new Set(tiny)].slice(0, 6) };
    });
    if (rd.small.length) bad.push('text < 13px: ' + rd.small.join(' ')); if (rd.tiny.length) bad.push('buttons < 44px: ' + rd.tiny.join(' '));
    if (hudBad.size) bad.push('HUD overlaps: ' + [...hudBad].slice(0, 5).join(' '));
    if (offTried !== 2) bad.push('off-highlight tap not tested');
    const pass = !bad.length && !errs.length; if (!pass) allOk = false;
    console.log((pass ? 'PASS ' : 'FAIL ') + name + ': screen map ' + hm.n + ' labels, lessons ' + res.seen + ', off-highlight tap worked ' + (offTried === 2) + ', practice game ' + fin.sc +
      (bad.length ? ' | ISSUES ' + bad.join('; ') : '') + (errs.length ? ' | JS errors ' + errs.slice(0, 3).join(' | ') : ''));
    await ctx.close();
  }
  await br.close(); process.exit(allOk ? 0 : 1);
})();
