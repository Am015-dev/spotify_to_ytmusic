// W324: stage-1 boss arrival screenshot (stepped, god mode). env: ONLY=phone|pc|land  OUT=<dir>  PRE=name prefix   Prints PASS/FAIL lines.
const L = require('./lib.js'), { sleep } = L;
const DEV = { phone: { W: 390, H: 763, touch: true }, land: { W: 844, H: 390, touch: true }, pc: { W: 1440, H: 860, touch: false } };
(async () => {
  const b = await L.boot(); const out = process.env.OUT || '/tmp/w324', pre = process.env.PRE || 'a'; require('fs').mkdirSync(out, { recursive: true });
  for (const dn of (process.env.ONLY || 'phone,pc').split(',')) {
    const d = DEV[dn], p = await L.open(b.br, b.base, d.W, d.H, '?nomusic=1', 3, d.touch);
    await p.evaluate(() => { document.getElementById('focFlight').click(); }); for (let i = 0; i < 40; i++) { if (await p.evaluate(() => !!window.__mnr.G && !!window.__mnr.G.live)) break; await sleep(100); }
    await p.evaluate(async (JUMP) => { const m = window.__mnr; for (const k in m.ART.anim ? m.ART.ANIM.s : {}) m.ART.anim(k); await new Promise(r => setTimeout(r, 4000)); m.god = true; if (JUMP) m.G.dbar = m.ST.lead + 3; else m.bossNow(); }, !!process.env.JUMP);
    let info = null;
    for (let n = 0; n < 3000; n++) {
      info = await p.evaluate(() => { const m = window.__mnr, G = m.G; for (let i = 0; i < 6; i++) { m.P.hp = m.P.max; m.P.inv = 1; m.step(1 / 60); } return { boss: !!G.boss, x: G.boss && G.boss.x, t: G.t, W: m.W, nm: G.boss && G.boss.nm, en: G.en.length }; });
      if (n % 20 === 0) console.log(dn, JSON.stringify(info)); if (info.boss) { for (let k = 0; k < +(process.env.WAIT || 60); k++) await p.evaluate(() => { const m = window.__mnr; m.P.hp = m.P.max; m.step(1 / 60); }); break; }
    }
    await p.evaluate(() => window.__mnr.render(window.__mnr.G.t, 1 / 60)); await sleep(150);
    await p.screenshot({ path: `${out}/${pre}-${dn}-boss.png` });
    console.log(dn, 'boss', JSON.stringify(info));
    await p.close();
  }
  await b.br.close(); process.exit(0);
})();
