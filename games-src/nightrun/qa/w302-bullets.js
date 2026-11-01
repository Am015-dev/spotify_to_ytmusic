// W302 bullet board: FLIGHT stage 1, t ~20 s, every enemy shot kind (orb, needle, rocket, mine, homing) placed in a row above the ship, rendered by the
// live owner (PB.ebul). One png per device; prints the drawn size of each kind in css px (bounding box of its non-backdrop pixels is left to the eye).
//   OUT=<dir> NODE_PATH=$(npm root -g) node games-src/nightrun/qa/w302-bullets.js
const L = require('./lib.js'), { sleep } = L, OUT = process.env.OUT || '/tmp/w302/bul';
require('fs').mkdirSync(OUT, { recursive: true });
const DEV = { phone: { W: 390, H: 763, touch: true }, pc: { W: 1440, H: 860, touch: false } };
(async () => {
  const b = await L.boot();
  for (const dn of (process.env.ONLY || 'phone,pc').split(',')) {
    const d = DEV[dn], p = await L.open(b.br, b.base, d.W, d.H, '?nomusic=1', 3, d.touch);
    await p.evaluate(() => { document.getElementById('focFlight').click(); }); for (let i = 0; i < 40; i++) { if (await p.evaluate(() => !!window.__mnr.G && !!window.__mnr.G.live)) break; await sleep(100); }
    const r = await p.evaluate(async () => { const m = window.__mnr; m.simOn(true); m.god = true; for (const k in m.ART.ANIM.s) m.ART.anim(k); await new Promise(r => setTimeout(r, 4000));
      for (let i = 0; i < 1200; i++) { m.P.hp = m.P.max; m.step(1 / 60); }
      const G = m.G, P = m.P, K = [{}, { k: 'n' }, { k: 'r' }, { k: 'm' }, { hm: 1 }], out = [];
      G.eb.length = 0; K.forEach((q, i) => { for (let j = 0; j < 2; j++) G.eb.push(Object.assign({ x: P.x + 150 + j * 90, y: P.y - 120 + i * 60, vx: -200, vy: 40, r: q.k === 'n' ? 3.2 : 5, t: 0 }, q)); });
      window.requestAnimationFrame = () => 0; m.render(G.t, 1 / 60); m.render(G.t, 1 / 60);
      const c = document.querySelector('canvas'), u = c.clientWidth / (m.rotMode ? 540 : 960); return { css: +u.toFixed(3), rot: m.rotMode, n: G.eb.length };
    });
    await sleep(200); await p.screenshot({ path: `${OUT}/${dn}-bullets.png` });
    console.log(dn, JSON.stringify(r), 'errs', p.errs.length, p.errs.slice(0, 2).join(' | ').slice(0, 200)); await p.context().close();
  }
  await b.close(); process.exit(0);
})();
