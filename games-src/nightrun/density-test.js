#!/usr/bin/env node
// Density budget test (parts/density.js): the curve rises with the stage, caps hold, curtain columns keep a free gap, ?density=0 sends no curtain and is repeatable.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/density-test.js     (pass/fail lines only)
const PW = require(process.env.PW || 'playwright'), path = require('path'), cp = require('child_process');
const DIR = path.resolve(__dirname, '../../games/mainhattan-nightrun'), port = 8790 + (process.pid % 100);
const RUN = new Function('o', `
  const m = window.__mnr; let sd = o.seed >>> 0; const rnd = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = sd; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const rr = Math.random; Math.random = rnd; m.SET.diff = o.diff; m.applySet(); m.god = true; m.startStory(o.n); m.simOn(true);
  const s = []; let i = 0, mx = 0, vmax = 0, gap = 1e9, capBad = 0;
  while (m.running && m.G.t < o.t && !m.G.dead && !m.G.boss) { if (m.SH.active) m.SH.close(); if (i % 20 === 0) m.press('Fire'); if (i % 3 === 0) m.touchTo(300 + 200 * Math.sin(i / 50), 270 + 200 * Math.sin(i / 37));
    m.step(1 / 60); i++; const eb = m.G.eb;
    if (i % 6 === 0) { s.push(eb.length); mx = Math.max(mx, eb.length); if (eb.length > (o.diff === "hard" ? 35 : 25) + 6) capBad++;
      const dn = eb.filter(b => b.dn); for (let a = 0; a < dn.length; a++) for (let b = a + 1; b < dn.length; b++) if (Math.abs(dn[a].y - dn[b].y) < 20 && Math.abs(dn[a].x - dn[b].x) < gap) { gap = Math.abs(dn[a].x - dn[b].x); window.__gp = [dn[a].x, dn[a].y, dn[b].x, dn[b].y, dn[a].vy, dn[b].vy, dn[a].vx]; } }
    for (const b of eb) vmax = Math.max(vmax, Math.hypot(b.vx, b.vy)); }
  Math.random = rr; const r = { mean: s.reduce((a, b) => a + b, 0) / Math.max(1, s.length), mx, vmax, gap, capBad, cur: window.DENS.st.curtains, sig: s.join(","), gp: window.__gp }; m.abort(); m.god = false; return r;`);
(async () => {
  const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', DIR], { stdio: 'ignore' }); await new Promise(r => setTimeout(r, 800));
  const b = await PW.chromium.launch(); let fails = 0; const ck = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
  const run = async (q, o) => { const p = await b.newPage({ viewport: { width: 960, height: 540 } }); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1${q}`);
    await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 15000 }).catch(() => { });
    const r = await p.evaluate(`(${RUN.toString().replace(/^function anonymous\(o\s*\)\s*\{/, 'function(o){')})(${JSON.stringify(o)})`); await p.close(); return r; };
  const on = {}, off = {};
  for (const n of [3, 10, 30]) { on[n] = await run('', { n, seed: 5, diff: 'normal', t: 90 }); off[n] = await run('&density=0', { n, seed: 5, diff: 'normal', t: 90 }); }
  const e = await run('', { n: 30, seed: 5, diff: 'easy', t: 90 }), h = await run('', { n: 30, seed: 5, diff: 'hard', t: 90 });
  const off2 = await run('&density=0', { n: 30, seed: 5, diff: 'normal', t: 90 });
  ck(on[30].mean / on[3].mean >= 1.5, `curve: stage 30 / stage 3 = ${(on[30].mean / on[3].mean).toFixed(2)} (>= 1.5; means ${on[3].mean.toFixed(1)}, ${on[10].mean.toFixed(1)}, ${on[30].mean.toFixed(1)})`);
  ck(on[30].mean > off[30].mean && on[3].mean >= off[3].mean, `flag on is denser than off (st30 ${on[30].mean.toFixed(1)} vs ${off[30].mean.toFixed(1)})`);
  ck(on[30].capBad === 0 && on[3].capBad === 0, 'bullets on screen never above ebCap + 6');
  
  ck(on[3].gap >= 96 && on[30].gap >= 96, `curtain columns keep a free gap >= 96 px (min ${Math.min(on[3].gap, on[30].gap).toFixed(0)}; stage 10 scripts split and curve bullets themselves)`);
  ck(e.mean < on[30].mean && h.mean > e.mean, `Easy ${e.mean.toFixed(1)} < Normal ${on[30].mean.toFixed(1)}, Hard ${h.mean.toFixed(1)}`);
  ck(off[3].cur === 0 && off[30].cur === 0, 'density=0: no curtain');
  ck(Math.abs(off2.mean - off[30].mean) < .25 * off[30].mean + 1, `density=0: same load as the old build (${off[30].mean.toFixed(1)} vs ${off2.mean.toFixed(1)})`);
  ck(Math.max(on[3].vmax, on[10].vmax, on[30].vmax) <= Math.max(off[3].vmax, off[10].vmax, off[30].vmax) + .5, 'curtains add no speed over the old maximum');
  await b.close(); srv.kill(); console.log(fails ? `${fails} FAILED` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
