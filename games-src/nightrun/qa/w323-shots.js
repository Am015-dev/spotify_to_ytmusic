#!/usr/bin/env node
// W323: GOLD strip / win / miss chips on phone and PC. Forces kills through the real WV.bty() path. OUT=dir NODE_PATH=$(npm root -g) node qa/w323-shots.js
const L = require('./lib.js'), { boot, open, ok, done, sleep } = L, OUT = process.env.OUT || '/tmp/w323'; require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await boot();
  for (const [W, H, touch] of [[390, 763, true], [1440, 860, false]]) {
    for (const mode of ['strip', 'win', 'far', 'slow']) {
      const p = await open(b.br, b.base, W, H, '?nomusic=1&sim=1', null, touch);
      await p.evaluate(() => { const m = __mnr; m.startStory(1); m.simOn(true); });
      const got = await p.evaluate(mode => { const m = __mnr; for (let i = 0; i < 6000; i++) { m.P.inv = 9; m.step(1 / 60); const B = WV.bt, q = B && B.live; if (q && q.sp >= q.k) { if (mode === 'strip') return 'strip'; if (mode === 'slow') { q.t0 -= 99; m.step(1 / 60); return 'slow'; } for (let j = 0; j < 40 && !q.end; j++) { for (const e of WV.st.foes) if (e.bq === q && e.hp > 0) { e.hp = -9; e._rwC = mode === 'win' ? m.G.t : 0; } WV.bty(); m.step(1 / 60); } return mode; } } return null; }, mode);
      await p.evaluate(() => { for (let i = 0; i < 8; i++) __mnr.step(1 / 60); });
      const t = await p.evaluate(() => { const c = __mnr.G.banner; return (c ? c.a + ' | ' + c.b : 'none') + ' log:' + JSON.stringify(WV.log.sqs.slice(-1)); });
      await p.evaluate(() => { __mnr.simOn(false); }); await sleep(120); console.log('errs', p.errs.join('|')); await p.screenshot({ path: `${OUT}/${mode}-${W}.png` }); console.log(`${W} ${mode}: ${got} :: ${t}`); await p.context().close();
    }
  }
  await b.close(); done('w323-shots');
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
