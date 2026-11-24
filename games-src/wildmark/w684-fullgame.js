// W684 gate: one full quick game vs 1 computer ranger at machine speed (turbo), at 402x874 and 1366x768. Starts by tapping Play,
// then plays the human seat through the game's own handlers (take / act). Checks: result screen shown, 0 page errors, < 60 s each,
// auto-fit hex >= 72 px on every human tile step. Usage: NODE_PATH=$(npm root -g) node w684-fullgame.js [base url] [shots dir]
const { turbo, budget, tick } = require('../scripts/turbo'); const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8780/wildmark/', OUT = process.argv[3];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); let fail = 0;
  for (const mob of [true, false]) {
    const t0 = Date.now(), stop = budget(60000, 'w684 full game');
    const c = await b.newContext({ viewport: mob ? { width: 402, height: 874 } : { width: 1366, height: 768 }, hasTouch: mob, isMobile: mob, serviceWorkers: 'block' }); await turbo(c);
    const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)));
    await p.goto(BASE); await tick(p, 300);
    await p.locator('#playB').click(); await tick(p, 300);
    let minHex = 1e9, steps = 0, shot = false;
    while (steps++ < 4000) {
      const st = await p.evaluate(() => {
        if (!G) return 'nog'; if (G.over) return 'over'; if (!myTurn() || UI.aiRun) return 'wait';
        var ms = WM.moves(G).filter(function (m) { return m.t === 'take' || m.t === 'place' || m.t === 'tok' || m.t === 'back'; });
        if (G.stage === 'tok') { var tk = ms.filter(function (m) { return m.t === 'tok'; }); ms = tk.length ? tk : ms; }
        var m = ms[Math.floor(Math.random() * ms.length)], hex = G.stage === 'tile' ? 69.3 * UI.pan.z : 0;
        if (m.t === 'take') take(m); else act(m); return 'hex' + hex;
      });
      if (st === 'over') break;
      if (st.startsWith('hex') && +st.slice(3) > 0) minHex = Math.min(minHex, +st.slice(3));
      if (OUT && !shot && steps > 120) { shot = true; await p.screenshot({ path: `${OUT}/late-${mob ? 'phone' : 'pc'}.png` }); }
      await tick(p, st === 'wait' || st === 'nog' ? 400 : 120);
    }
    for (let k = 0; k < 40 && !(await p.evaluate(() => { var r = document.getElementById('rs'); return !!(r && !r.hidden); })); k++) await tick(p, 300);   // the result opens ~450 game-ms after the last move
    const res = await p.evaluate(() => { var r = document.getElementById('rs'); return G && G.over && r && !r.hidden ? 'result ' + G.res.map(function (x) { return x.total; }).join('-') : 'no result (stage ' + (G && G.stage) + ', cur ' + (G && G.cur) + ', over ' + (G && G.over) + ', aiRun ' + UI.aiRun + ', moves ' + (G && JSON.stringify(WM.moves(G).slice(0, 3))) + ')'; });
    if (OUT) await p.screenshot({ path: `${OUT}/result-${mob ? 'phone' : 'pc'}.png` });
    const sec = ((Date.now() - t0) / 1000).toFixed(1), ok = res.startsWith('result') && !errs.length && minHex >= 72;
    if (!ok) fail++;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${mob ? '402x874' : '1366x768'}: ${res}, ${sec} s, min auto-fit hex ${Math.round(minHex)} px, errors ${errs.length} ${errs.join(' | ')}`);
    stop(); await c.close();
  }
  await b.close(); process.exit(fail ? 1 : 0);
})();
