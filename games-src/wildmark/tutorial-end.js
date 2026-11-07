// Coached first game to the end, by real taps: fresh storage, open the tutorial from the title, then play ANY legal move through the UI
// (a random legal pair, a glowing spot, a glowing tile or Return) until the result screen. Each tap goes to the centre of a visible target and
// elementFromPoint there must be the target (Rowan's bubble never blocks play). At the end every rule in COACH_RULES (TUTORIAL-COVERAGE.md)
// must have been explained during the game or listed in "Things you will meet later". Phone 390x763 and PC 1440x860.
// Usage: node tutorial-end.js [page url] [seed]   (default: the local build)
const { chromium } = require('playwright');
const EXE = require('fs').existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {};
const URL = process.argv[2] || 'file://' + __dirname + '/wildmark.html';
let rnd = +(process.argv[3] || 7); const R = n => { rnd = (rnd * 16807) % 2147483647; return rnd % n; };
(async () => {
  const b = await chromium.launch(EXE); let allOk = true;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), p = await ctx.newPage(), errs = [], blocked = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await p.goto(URL); await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.goto(URL); await p.waitForTimeout(900);
    const first = p.locator('#start button').first(); if (touch) await first.tap(); else await first.click();
    // tap the centre of the i-th visible element matching sel, after checking nothing covers it
    const tapSel = async (sel, pick) => {
      const xy = await p.evaluate(([sel, pick]) => {
        const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && !e.disabled; });
        if (!els.length) return null; const e = els[pick % els.length], r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
        const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h) || h.closest(sel) === e) };
      }, [sel, pick]);
      if (!xy) return false; if (!xy.ok) blocked.push(sel);
      if (touch) await p.touchscreen.tap(xy.x, xy.y); else await p.mouse.click(xy.x, xy.y); await p.waitForTimeout(220); return true;
    };
    let turns = 0;
    for (let g = 0; g < 700; g++) {
      const st = await p.evaluate(() => ({ rs: !document.getElementById('rs').hidden, mine: !!window.G && myTurn(), stage: G && G.stage, mode: UI.mode, ghost: !!UI.ghost }));
      if (st.rs) break;
      if (!st.mine) { await p.waitForTimeout(350); continue; }
      if (st.stage === 'pick') { if (!(await tapSel('#mk .mt:not([disabled])', R(4)))) await p.waitForTimeout(200); }
      else if (st.stage === 'tile') { if (!st.ghost) await tapSel('#map .spot', R(9)); else { if (R(3) === 0) await tapSel('#rotB', 0); await tapSel('#okB', 0); } }
      else if (st.stage === 'tok') { const n = await p.locator('#map .tgt').count(); if (n && R(5)) await tapSel('#map .tgt', R(n)); else await tapSel('#backB', 0); turns++; }
    }
    await p.waitForTimeout(800);
    const res = await p.evaluate(() => ({ over: !!(window.G && G.over), rs: !document.getElementById('rs').hidden, cov: window.WM_COACH || null, rules: window.COACH_RULES, done: (() => { try { return GXT.isDone('wildmark'); } catch (e) { return false; } })(), final: !!document.querySelector('#rs .cfinal') }));
    const cov = res.cov || { explained: [], later: [] }, missing = (res.rules || []).filter(id => cov.explained.indexOf(id) < 0 && cov.later.indexOf(id) < 0);
    const pass = res.over && res.rs && res.final && res.done && !missing.length && !blocked.length && !errs.length;
    if (!pass) allOk = false;
    console.log((pass ? 'PASS' : 'FAIL') + ' coached-game-to-end ' + name + ': ' + turns + ' turns by legal UI taps, explained ' + cov.explained.length + '/' + (res.rules || []).length + ', listed for later ' + cov.later.length +
      (cov.later.length ? ' (' + cov.later.join(',') + ')' : '') + (missing.length ? ' MISSING ' + missing.join(',') : '') + (blocked.length ? ' BLOCKED ' + blocked.slice(0, 3).join(',') : '') + (errs.length ? ' errors ' + errs.slice(0, 2).join(' | ') : '') + ' walk-through ' + res.final + ' tutorial done ' + res.done);
    await ctx.close();
  }
  await b.close(); process.exit(allOk ? 0 : 1);
})();
