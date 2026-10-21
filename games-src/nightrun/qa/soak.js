#!/usr/bin/env node
// (b) soak: endless run at accelerated time (?sim=1, the page is stepped by hand: step(1/60) + render). GAME_S game seconds (default 600 = 10 min game time, wall cap WALL_S default 150).
// FAIL: JS heap (after gc) grows > 30% from the end of warmup (first 20%) to the end, or frame cost p95 of the last third > 1.3x the middle third (+1 ms), or a page error, or the run dies/stops.
const { boot, open, ok, done, sleep } = require('./lib');
const GAME_S = +process.env.GAME_S || 600, WALL_S = +process.env.WALL_S || 95;
(async () => {
  const B = await boot(['--js-flags=--expose-gc', '--enable-precise-memory-info']); const p = await open(B.br, B.base, 390, 763, '?sim=1');
  await p.evaluate(() => { __mnr.simOn(true); document.getElementById('startBtn').click(); });
  await p.waitForFunction(() => __mnr.running, null, { timeout: 8000 }).catch(() => { });
  ok('endless run starts', await p.evaluate(() => __mnr.running));
  const r = await p.evaluate(async ([GS, WS]) => {
    const m = __mnr, ft = [], heap = [], ev = { di: new Set(), boss: 0, pit: 0, deaths: 0 }; m.god = true; let T = 0, f = 0, bf = 0, t0 = performance.now(), nextH = 0, tt = 1000;
    const fin = () => { window.gc && window.gc(); return performance.memory ? performance.memory.usedJSHeapSize : 0; };
    while (T < GS && (performance.now() - t0) / 1000 < WS) {
      const a = performance.now();
      if (!m.running) { ev.deaths++; document.getElementById('startBtn').click(); m.simOn(true); m.god = true; if (!m.running) break; }
      if (m.SH.active) { ev.pit++; const b = document.getElementById('shGo'); if (b) b.click(); else m.SH.active = false; }
      m.touchTo(195 + 150 * Math.sin(T * .9), 380 + 220 * Math.sin(T * .37));
      m.step(1 / 60); T += 1 / 60; f++; tt += 16.7; if (f % 8 === 0) m.render(tt, 1 / 7.5);
      const G = m.G; if (G) { ev.di.add(G.di + ':' + (G.loop || 0)); if (G.boss) { ev.boss++; bf++; if (bf > 400 && bf % 30 === 0) m.killBoss(); } else bf = 0; }
      ft.push(performance.now() - a);
      if (T >= nextH) { await new Promise(r => setTimeout(r, 0)); heap.push([Math.round(T), fin()]); nextH += GS / 20; }
    }
    return { T, ft, heap, di: [...ev.di], boss: ev.boss, pit: ev.pit, deaths: ev.deaths, wall: (performance.now() - t0) / 1000 };
  }, [GAME_S, WALL_S]);
  const q = (a, k) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length * k)] || 0; };
  const n = r.ft.length, third = Math.floor(n / 3), mid = r.ft.slice(third, 2 * third), last = r.ft.slice(2 * third);
  const h = r.heap, hw = h[Math.min(h.length - 1, Math.floor(h.length * .2))], he = h.slice(-3).reduce((a, b) => a + b[1], 0) / Math.max(1, h.slice(-3).length);
  console.log(`  soak: ${r.T.toFixed(0)} game s in ${r.wall.toFixed(0)} s wall, ${n} steps, districts seen ${r.di.length} (${r.di.join(',')}), boss frames ${r.boss}, pit stops ${r.pit}, restarts ${r.deaths}; heap MB ${h.map(x => (x[1] / 1048576).toFixed(0)).join(' ')}`);
  ok('soak ran the planned game time', r.T >= GAME_S * .85, `${r.T.toFixed(0)} of ${GAME_S} game s in ${r.wall.toFixed(0)} s`);
  ok(`JS heap growth after warmup <= 30% (${(hw[1] / 1048576).toFixed(1)} -> ${(he / 1048576).toFixed(1)} MB)`, hw[1] > 0 && he <= hw[1] * 1.3, `${(he / hw[1] * 100 - 100).toFixed(0)}% growth`);
  ok(`frame cost p95 no regression (middle ${q(mid, .95).toFixed(2)} ms, last ${q(last, .95).toFixed(2)} ms)`, q(last, .95) <= q(mid, .95) * 1.3 + 1, '');
  ok('no page errors', !p.errs.length, p.errs[0]);
  await B.close(); done('soak');
})().catch(e => { console.log('FAIL soak crash :: ' + e.message); process.exit(1); });
