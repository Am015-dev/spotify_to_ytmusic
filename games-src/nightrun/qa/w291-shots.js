// W291 critic shots: FLIGHT stage 1, a stepped bot keeps the ship alive; 8 random moments + the boss warning + the boss, phone and PC.
//   OUT=<dir> NODE_PATH=$(npm root -g) node games-src/nightrun/qa/w291-shots.js
const L = require('./lib.js'), { sleep } = L, OUT = process.env.OUT || '/tmp/w291/shots/crit';
require('fs').mkdirSync(OUT, { recursive: true });
const DEV = { phone: { W: 390, H: 763, touch: true }, pc: { W: 1440, H: 860, touch: false } };
(async () => {
  const b = await L.boot();
  for (const dn of (process.env.ONLY || 'phone,pc').split(',')) {
    const d = DEV[dn], p = await L.open(b.br, b.base, d.W, d.H, '?nomusic=1', 3, d.touch);
    await p.evaluate(() => { document.getElementById('focFlight').click(); }); for (let i = 0; i < 40; i++) { if (await p.evaluate(() => !!window.__mnr.G && !!window.__mnr.G.live)) break; await sleep(100); }
    await p.evaluate(() => window.__mnr.simOn(true));
    let rs = 7, rnd = () => (rs = (rs * 16807) % 2147483647) / 2147483647;
    const times = Array.from({ length: 8 }, () => 8 + rnd() * 100).sort((x, y) => x - y); let ti = 0, bossShot = 0, warnShot = 0;
    for (let n = 0; n < 40000 && (ti < 8 || !bossShot); n++) {
      const r = await p.evaluate(() => { const m = window.__mnr; for (let i = 0; i < 6; i++) { const G = m.G, P = m.P; P.hp = P.max; P.inv = 1; m.step(1 / 60); } m.render(); const G = m.G; return { t: G.t, boss: !!(G.boss && G.boss.x < 960), warn: !!(G.banner && G.banner.t > 0 && G.banner.warn), res: !!document.getElementById('stres') && !document.getElementById('stres').hidden }; });
      if (r.res) break;
      if (ti < 8 && r.t >= times[ti]) { await p.screenshot({ path: `${OUT}/${dn}-m${ti + 1}-t${r.t | 0}.png` }); ti++; }
      if (r.warn && !warnShot) { await p.screenshot({ path: `${OUT}/${dn}-warn.png` }); warnShot = 1; }
      if (r.boss && !bossShot) { for (let k = 0; k < 20; k++) await p.evaluate(() => { const m = window.__mnr; for (let i = 0; i < 6; i++) { m.P.hp = m.P.max; m.P.inv = 1; m.step(1 / 60); } m.render(); }); await p.screenshot({ path: `${OUT}/${dn}-boss.png` }); bossShot = 1; }
    }
    console.log(dn, 'shots', ti, 'warn', warnShot, 'boss', bossShot, 'errs', p.errs.length); await p.context().close();
  }
  await b.close(); process.exit(0);
})();
