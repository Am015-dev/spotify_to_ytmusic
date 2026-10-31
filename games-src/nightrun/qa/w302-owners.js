// W302 draw-owner probe: FLIGHT stage 1 through the boss, live flags, stepped (x6 per frame, god mode). Counts, per device, every call made DURING
// render() into the render layers' globals (READ POL LIT LGB PCB DIET CALM COM BA PURL PB ...) and the old draw chain; HASH=1 prints a frame hash at
// 12 fixed moments (the before/after proof that a deleted layer drew nothing).  NODE_PATH=$(npm root -g) node games-src/nightrun/qa/w302-owners.js
//   env: ONLY=phone|pc  HASH=1  SHOTS=<dir> (a png at each hash moment)
const L = require('./lib.js'), { sleep } = L, crypto = require('crypto');
const DEV = { phone: { W: 390, H: 763, touch: true }, pc: { W: 1440, H: 860, touch: false } };
const GL = 'READ POL LIT LGB PCB DIET CALM COM BK BA PURL PB ART AH FXV EDG CUE DRAW SPR FOEART LEAK PW UIK'.split(' ');
const FN = 'drawEnemy drawPlayer drawHUD drawHUDP pkPaint gatePost drawBullets drawPB drawEB'.split(' ');
(async () => {
  const b = await L.boot();
  for (const dn of (process.env.ONLY || 'phone,pc').split(',')) {
    const d = DEV[dn], p = await L.open(b.br, b.base, d.W, d.H, '?nomusic=1', 3, d.touch);
    await p.evaluate(() => { document.getElementById('focFlight').click(); }); for (let i = 0; i < 40; i++) { if (await p.evaluate(() => !!window.__mnr.G && !!window.__mnr.G.live)) break; await sleep(100); }
    await p.evaluate(async ({ GL, FN }) => { const m = window.__mnr; for (const k in m.ART.ANIM.s) m.ART.anim(k); await new Promise(r => setTimeout(r, 5000));
      let sd = 12345; Math.random = () => (sd = (sd * 16807) % 2147483647) / 2147483647; let ck = 0; performance.now = () => ck; Date.now = () => 1.7e12 + ck; window.__ck = v => { ck = v; }; window.__sd = v => { sd = v; }; window.requestAnimationFrame = () => 0; m.god = true;
      const C = window.__C = {}; let inR = 0; window.__inR = () => inR;
      const wrap = (o, k, nm) => { const f = o[k]; if (typeof f !== 'function' || f.__w) return; const g = function () { if (inR) C[nm] = (C[nm] || 0) + 1; return f.apply(this, arguments); }; g.__w = 1; try { o[k] = g; } catch (e) {} };
      for (const n of GL) { const o = window[n]; if (!o || typeof o !== 'object') continue; for (const k of Object.keys(o)) { let dsc; try { dsc = Object.getOwnPropertyDescriptor(o, k); } catch (e) { continue; } if (dsc && dsc.value && typeof dsc.value === 'function') wrap(o, k, n + '.' + k); } }
      for (const n of FN) { try { const f = eval(n); if (typeof f !== 'function') continue; const g = function () { if (inR) C[n] = (C[n] || 0) + 1; return f.apply(this, arguments); }; eval(n + '=g'); } catch (e) {} }
      const r0 = m.render; m.render = function () { inR++; try { return r0.apply(this, arguments); } finally { inR--; } }; m.simOn(true); }, { GL, FN });
    let rs = 11, rnd = () => (rs = (rs * 16807) % 2147483647) / 2147483647; const hashAt = (process.env.AT || "6,15,24,33,42,51,60,69,78,87,96,105").split(",").map(Number), H = []; let hi = 0, frames = 0, boss = 0;
    for (let n = 0; n < 6000; n++) {
      const r = await p.evaluate(async ([n, hs]) => { const m = window.__mnr; window.__sd(1000 + n); for (let i = 0; i < 6; i++) { m.P.hp = m.P.max; m.P.inv = 1; m.step(1 / 60); } window.__ck(m.G.t * 1000); m.render(m.G.t, 1 / 60); const G = m.G; const u = hs && G.t >= hs ? document.querySelector('canvas').toDataURL() : null; return { u, t: G.t, boss: !!G.boss, res: !!document.getElementById('stres') && !document.getElementById('stres').hidden }; }, [n, process.env.HASH && hi < hashAt.length ? hashAt[hi] : 0]);
      frames++; if (r.boss) boss++; if (r.res || boss > 400 || (process.env.HASH && hi >= hashAt.length)) break;
      if (process.env.HASH && hi < hashAt.length && r.u) { const u = r.u; if (process.env.DUMP) require('fs').writeFileSync(`${process.env.DUMP}/${dn}-h${hi}.png`, Buffer.from(u.split(',')[1], 'base64')); H.push(hashAt[hi] + ':' + crypto.createHash('md5').update(u).digest('hex').slice(0, 8)); if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/${dn}-h${hi}.png` }); hi++; }
    }
    const C = await p.evaluate(() => window.__C), E = await p.evaluate(() => { const m = window.__mnr; return JSON.stringify({ t: m.G.t | 0, live: m.G.live, over: m.G.over, dead: m.G.dead, en: m.G.en.length, st: m.ST && m.ST.n, paused: typeof paused !== 'undefined' && paused }); });
    console.log(dn, 'END', E);
    console.log(dn, 'frames', frames, 'boss frames', boss, 'errs', p.errs.length, p.errs.slice(0, 2).join(' | ').slice(0, 300));
    console.log(dn, 'CALLS', Object.entries(C).sort().map(([k, v]) => k + '=' + v).join(' '));
    if (H.length) console.log(dn, 'HASH', H.join(' '));
    await p.context().close();
  }
  await b.close(); process.exit(0);
})();
