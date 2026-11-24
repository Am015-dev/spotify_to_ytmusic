// W666 HUD gate: at phone 402x874 and PC 1366x768, machine speed (turbo.js), under 60 s each:
// every top-bar window opens by tap and closes by tap-outside and by its X (>= 44 px), the help bubble Next advances,
// then the computer plays the whole game out to a winner with 0 JS errors.
// usage: NODE_PATH=$(npm root -g) node games-src/kot/hud-test.js [base=http://localhost:8779]
const { turbo, budget, tick } = require('../scripts/turbo'); const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8779';
(async () => {
  const b = await chromium.launch({ executablePath: require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }); let fail = 0;
  for (const [mode, vp] of [['phone', { width: 402, height: 874 }], ['pc', { width: 1366, height: 768 }]]) {
    const t0 = Date.now(), stop = budget(60000, 'hud ' + mode), mob = mode === 'phone';
    const c = await b.newContext({ viewport: vp, hasTouch: mob, isMobile: mob, serviceWorkers: 'block' }); await turbo(c);
    const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)));
    const ok = (cond, msg) => { console.log((cond ? 'ok   ' : 'FAIL ') + mode + ' ' + msg); if (!cond) fail++; };
    await p.goto(BASE + '/crown-city-smash/?scn=cc-market'); await tick(p, 3000);
    // 1. windows: the bar buttons that are visible at this size (phone portrait keeps only the menu; its rows open the rest)
    const ids = await p.$$eval('header.gx-bar [data-gx^="dr-"]', bs => bs.filter(x => x.offsetParent && getComputedStyle(x).display !== 'none').map(x => x.dataset.gx));
    const want = mob ? ['dr-menu', 'dr-mons', 'dr-market', 'dr-log', 'dr-rules'] : ['dr-mons', 'dr-market', 'dr-log', 'dr-rules', 'dr-menu'];
    for (const id of want) {
      const viaBar = ids.includes(id);
      if (!viaBar) { await p.click('header.gx-bar [data-gx="dr-menu"]'); await tick(p, 300); await p.click(`#dr-menu [data-gx="${id}"]`); }
      else await p.click(`header.gx-bar [data-gx="${id}"]`);
      await tick(p, 400);
      if (mob && id === 'dr-market') { // phone: the shop is the board's own pop-up (ui-ph.js phPop), not a drawer
        const on = await p.evaluate(() => PHN.pop === 'shop'); ok(on, 'dr-market opens the phone shop pop-up');
        await p.mouse.click(200, 70); await tick(p, 300); ok(await p.evaluate(() => PHN.pop !== 'shop'), 'phone shop closes on tap outside'); continue; }
      const st = await p.evaluate(id => { const d = document.getElementById(id), x = d && d.querySelector('.gx-x'), r = x && x.getBoundingClientRect(); return { on: !!d && d.classList.contains('on'), n: document.querySelectorAll('.gx-drawer.on').length, xw: r ? Math.round(r.width) : 0, xh: r ? Math.round(r.height) : 0, title: d && d.querySelector('h2').textContent }; }, id);
      ok(st.on && st.n === 1 && st.xw >= 44 && st.xh >= 44 && st.title, `${id} on=${st.on} n=${st.n} opens (${viaBar ? 'bar' : 'menu'}), one window, title "${st.title}", X ${st.xw}x${st.xh}`);
      // tap outside: the scrim, at a point the window does not cover
      const pt = await p.evaluate(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.left > 60 ? { x: 20, y: innerHeight / 2 } : { x: innerWidth / 2, y: Math.max(10, r.top - 20) }; }, id);
      await p.mouse.click(pt.x, pt.y); await tick(p, 300);
      ok(await p.evaluate(id => !document.getElementById(id).classList.contains('on'), id), `${id} closes on tap outside`);
      if (viaBar) { await p.click(`header.gx-bar [data-gx="${id}"]`); await tick(p, 300); await p.click(`#${id} .gx-x`); await tick(p, 300);
        ok(await p.evaluate(id => !document.getElementById(id).classList.contains('on'), id), `${id} closes on X`); }
    }
    ok(await p.evaluate(() => !document.querySelector('.gx-drawer.on')), 'no window opens by itself after closing');
    if (!mob) {
      ok(await p.evaluate(() => GX.app.classList.contains('gx-dock-min') && document.querySelector('.gx-board').clientWidth >= 1300), 'side panel closed by default, board fills the width');
      await p.click('header.gx-bar .gx-pin'); await tick(p, 300);
      ok(await p.evaluate(() => !GX.app.classList.contains('gx-dock-min') && localStorage.getItem('ccs_pin') === '1'), 'pin opens the side panel and is remembered');
      await p.click('header.gx-bar .gx-pin'); await tick(p, 300);
      const ph = await p.evaluate(() => ({ a: (document.getElementById('bpcph') || {}).textContent, l: (document.getElementById('bpcln') || {}).textContent, fs: parseFloat(getComputedStyle(document.getElementById('bpcln')).fontSize) }));
      ok(ph.a && ph.l && ph.fs >= 13, `phase banner "${ph.a}" + prompt "${ph.l}" (${ph.fs}px)`);
      const bar = await p.$$eval('header.gx-bar .gx-ibtn', bs => bs.filter(x => x.offsetParent).map(x => { const r = x.getBoundingClientRect(); return Math.min(r.width, r.height); }));
      ok(bar.length >= 6 && bar.every(s => s >= 44), `top bar: ${bar.length} round icon buttons, all >= 44 px`);
    }
    // 2. help bubble: Next really advances (rules cards in the help kit)
    await p.evaluate(() => GXH.rules()); await tick(p, 300);
    const rt = () => p.evaluate(() => { const e = document.querySelector('.gxh-rt'); return e && e.offsetParent ? e.textContent : ''; });
    const h1 = await rt(); await p.click('.gxh-next'); await tick(p, 300); const h2 = await rt();
    const hb = h1 && h2 && h1 !== h2 ? `advanced: "${h1}" -> "${h2}"` : `stuck: "${h1}" -> "${h2}"`;
    ok(/^advanced/.test(hb), 'help Next ' + hb);
    await p.keyboard.press('Escape'); await p.evaluate(() => { try { if (window.GXH && GXH.close) GXH.close(); } catch (e) {} });
    // 3. the computer plays the whole game out (every seat), machine speed
    await p.evaluate(() => { G.pl.forEach(q => q.human = false); UI.choice = null; UI.intro = false; UI.paused = false; if (typeof render === 'function') render(); schedule(); });
    let w = null; for (let i = 0; i < 400 && !w; i++) { await tick(p, 2000); w = await p.evaluate(() => { if (G.winner) return G.winner; if (UI.choice && UI.choice.options && UI.choice.options[0]) { try { const o = document.querySelector('#choice [data-opt]'); if (o) o.click(); } catch (e) {} } try { schedule(); } catch (e) {} return null; }); }
    ok(!!w, 'full game played to a winner: ' + w);
    ok(errs.length === 0, 'JS errors: ' + errs.length + (errs.length ? ' ' + errs.slice(0, 3).join(' | ') : ''));
    const s = (Date.now() - t0) / 1000; ok(s < 60, `real time ${s.toFixed(1)} s`);
    await p.screenshot({ path: `/tmp/hud-${mode}-end.png` }); stop(); await c.close();
  }
  await b.close(); console.log(fail ? `HUD TEST: ${fail} FAIL` : 'HUD TEST: ALL PASS'); process.exit(fail ? 1 : 0);
})();
