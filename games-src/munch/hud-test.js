// HUD test (W665): a full scripted game at machine speed (turbo) + every top-bar window opens/closes by tap, X and tap-outside.
// usage: node games-src/munch/hud-test.js [phone|pc] [base=http://localhost:8779/doorkick-dungeon/]   (games served on :8779)
const { turbo, budget, tick } = require('../scripts/turbo'); const { chromium } = require('playwright'); const fs = require('fs');
const mode = process.argv[2] || 'pc', BASE = process.argv[3] || 'http://localhost:8779/doorkick-dungeon/', mob = mode === 'phone';
const stop = budget(60000, 'hud-test ' + mode); const t0 = Date.now(); let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m) } };
(async () => {
  const b = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  const c = await b.newContext({ viewport: mob ? { width: 402, height: 874 } : { width: 1366, height: 768 }, hasTouch: mob, isMobile: mob, serviceWorkers: 'block' }); await turbo(c);
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  // 1) windows: open by tap on the bar icon, close by X, reopen, close by tapping outside; never two open at once
  await p.goto(BASE + '?scn=dk-board'); await tick(p, 400);
  const ids = await p.evaluate(() => [...document.querySelectorAll('.gx-bar [data-gx]')].filter(e => e.offsetParent && e.dataset.gx.startsWith('dk')).map(e => e.dataset.gx));
  ok(ids.length >= 3, 'bar windows found: ' + ids);
  for (const id of ids) {
    for (const how of ['x', 'outside']) {
      await p.locator(`.gx-bar [data-gx="${id}"]`).first().click(); await tick(p, 100);
      const st = await p.evaluate(id => { const d = document.getElementById(id), x = d && d.querySelector('.gx-x'), r = x && x.getBoundingClientRect(), dr = d && d.getBoundingClientRect();
        return { on: !!d && d.classList.contains('on'), n: document.querySelectorAll('.gx-drawer.on').length, xw: r ? Math.min(r.width, r.height) : 0, title: d && (d.querySelector('h2') || {}).textContent, dr: dr && [dr.left, dr.top, dr.right, dr.bottom] } }, id);
      ok(st.on && st.n === 1, `${id} opens alone (on=${st.on} open=${st.n})`); ok(st.xw >= 44, `${id} X is ${st.xw}px`); ok(st.title, `${id} has a title`);
      if (how === 'x') await p.locator(`#${id} .gx-x`).click();
      else { const [l, t, r, bt] = st.dr, W = mob ? 402 : 1366, H = mob ? 874 : 768; const pt = l > 60 ? [20, H / 2] : r < W - 60 ? [W - 20, H / 2] : t > 80 ? [W / 2, 30] : [W / 2, H - 10]; await p.mouse.click(pt[0], pt[1]) }
      await tick(p, 100); ok(await p.evaluate(id => !document.getElementById(id).classList.contains('on') && !document.querySelector('.gx-drawer.on'), id), `${id} closes by ${how}`);
    }
  }
  ok(await p.evaluate(() => !document.querySelector('.gx-drawer.on')), 'no window auto-opened');
  // 2) a full game at machine speed (the computer seats are stepped directly instead of waiting on their think timer): the human taps the dock's main action when there is one, else makes the suggested move
  let taps = 0, moves = 0, ai = 0; const tEnd = Date.now() + 40000;
  while (Date.now() < tEnd) {
    const r = await p.evaluate(() => { if (!G || G.winner) return 'end'; if (!humanTurn()) { if (sideToAct() >= 0) { aiStep(); return 'ai' } return 'wait' } const me = sideToAct();
      const btn = [...document.querySelectorAll('#prompt .acts.main .btn.primary')].find(e => e.offsetParent && !e.disabled && e.getBoundingClientRect().height >= 44);
      if (btn && Math.random() < .5) { btn.click(); return 'tap' } const m = aiMove(me); if (!m) return 'stuck'; performMove(m, me); refresh(); return 'move' });
    if (r === 'end') break; if (r === 'tap') taps++; else if (r === 'move') moves++; else if (r === 'ai') ai++; else if (r === 'stuck') { ok(0, 'human has no move'); break } else if (r === 'wait') await tick(p, 50);
  }
  const win = await p.evaluate(() => G && G.winner != null ? (P(G.winner) || {}).nm || G.winner : null);
  ok(win != null, 'game reached a winner'); ok(errs.length === 0, 'JS errors: ' + errs.slice(0, 3).join(' | '));
  await b.close(); stop(); const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`hud-test ${mode}: windows=${ids.join(',')} taps=${taps} moves=${moves} ai=${ai} winner=${win} jsErrors=${errs.length} fails=${fail} time=${sec}s`); process.exit(fail ? 1 : 0);
})();
