#!/usr/bin/env node
// W252 probe: cost of the grain + vignette overlay (ms per GRAIN.draw, frames per second) with ?grain=0 and ?grain=1 on the slowed phone profile
// (390x763, touch, 4x CPU) and on a PC 1440x860, plus one shot of each into SHOT=<dir>. PASS/FAIL + numbers only.
//   GAME_DIR=<dir with index.html> NODE_PATH=$(npm root -g) node qa/grain-probe.js     env: SHOT=<dir> SECS=6 STREET=1
const { boot, open, ok, done, sleep } = require('./lib');
(async () => {
  const b = await boot(), secs = +process.env.SECS || 6, out = {};
  for (const [nm, W, H, touch, thr] of [['phone', 390, 763, true, 4], ['pc', 1440, 860, false, 1]]) for (const g of [0, 1]) {
    const p = await open(b.br, b.base, W, H, '?all=1&nomusic=1&grain=' + g, 1, touch);
    const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: thr });
    await p.evaluate(() => { document.getElementById('startBtn').click(); }); await sleep(600);
    await p.evaluate(() => { __mnr.god = true; });
    const r = await p.evaluate(async secs => { const D = GRAIN.draw; let n = 0, ms = 0; GRAIN.draw = function () { const t = performance.now(); D.apply(this, arguments); ms += performance.now() - t; n++; };
      let f = 0, on = true; const tick = () => { f++; if (on) requestAnimationFrame(tick); }; requestAnimationFrame(tick); await new Promise(r => setTimeout(r, secs * 1000)); on = false; GRAIN.draw = D;
      return { fps: +(f / secs).toFixed(1), calls: n, msPer: n ? +(ms / n).toFixed(3) : 0, flag: !!RET.grain }; }, secs);
    out[nm + g] = r; console.log(nm, 'grain=' + g, JSON.stringify(r));
    if (process.env.SHOT) await p.screenshot({ path: `${process.env.SHOT}/grain${g}-${nm}.png` });
    ok(nm + ' no page errors g' + g, !p.errs.length, p.errs.join('|')); await p.context().close(); }
  for (const nm of ['phone', 'pc']) { const a = out[nm + 0], c = out[nm + 1];
    console.log(nm, 'ms/frame added', c.msPer, 'fps', a.fps, '->', c.fps, 'delta', (100 * (c.fps - a.fps) / a.fps).toFixed(1) + '%');
    ok(nm + ' added cost <= 0.8 ms', c.msPer <= .8, c.msPer); ok(nm + ' fps drop <= 5%', c.fps >= a.fps * .95, a.fps + '->' + c.fps); }
  await b.close(); done('grain-probe');
})();
