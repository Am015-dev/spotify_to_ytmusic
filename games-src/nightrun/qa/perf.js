#!/usr/bin/env node
// (d) perf budget at 390x763 (stepped by hand, ?sim=1, so only game+draw cost is measured): per scenario frame cost (step + render) p95, objects per frame p95 (diet limit 64), canvas draw calls per frame p95.
// Limits (env): this headless box draws on a software canvas, 2-5x slower than a phone GPU, so the gate is loose: frame cost p50 <= P50_MS=33.4 (2 frames at 60 Hz), p95 <= FRAME_MS=100; objects p95 <= OBJ=80 (the diet target is 64: shown as 'over diet 64' in the line); CALLS=250 draw calls (measured ~100-135).
const { boot, open, ok, done, sleep } = require('./lib');
const P50_MS = +process.env.P50_MS || 33.4, FRAME_MS = +process.env.FRAME_MS || 100, OBJ = +process.env.OBJ || 80, CALLS = +process.env.CALLS || 250, FR = +process.env.FRAMES || 500;
const INIT = () => { window.__calls = 0; for (const P of [CanvasRenderingContext2D.prototype, window.OffscreenCanvasRenderingContext2D && OffscreenCanvasRenderingContext2D.prototype]) if (P) for (const k of ['drawImage', 'fill', 'stroke', 'fillRect', 'strokeRect', 'fillText', 'strokeText']) { const o = P[k]; P[k] = function () { window.__calls++; return o.apply(this, arguments); }; } };
const SC = [['endless', 'run'], ['stage-2', 2], ['stage-6', 6], ['stage-14', 14]];
(async () => {
  const B = await boot(); const out = [];
  for (const [name, how] of SC) {
    const p = await open(B.br, B.base, 390, 763, '?sim=1', { mnr_story: '{"stars":{},"snap":{},"all":true}', mnr_tut: '2', mnr_tutgift: '1' }, true, INIT);
    await p.evaluate(h => { const m = __mnr; m.simOn(true); if (h === 'run') document.getElementById('startBtn').click(); else m.startStory(h); m.god = true; }, how);
    await p.waitForFunction(() => __mnr.running, null, { timeout: 8000 }).catch(() => { });
    const r = await p.evaluate(async n => { const m = __mnr, ft = [], ob = [], dc = []; let tt = 1000, sd = 12345; Math.random = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      for (let f = 0; f < n; f++) { if (!m.running) break; if (m.SH.active) { const b = document.getElementById('shGo'); if (b) b.click(); }
        m.touchTo(195 + 150 * Math.sin(f / 50), 380 + 200 * Math.sin(f / 130)); const a = performance.now(); m.step(1 / 60); const c0 = window.__calls; tt += 16.7; m.render(tt, 1 / 60); ft.push(performance.now() - a); dc.push(window.__calls - c0);
        const G = m.G, A = m.ART; ob.push(G ? (G.en.length + G.eb.length + G.pb.length + G.pt.length + G.fl.length + (A.fx ? A.fx.length : 0)) : 0); if (f % 100 === 0) await new Promise(r => setTimeout(r, 0)); }
      return { ft, ob, dc }; }, FR);
    const q = (a, k) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length * k)] || 0; };
    const f95 = q(r.ft, .95), o95 = q(r.ob, .95), d95 = q(r.dc, .95);
    console.log(`  ${name}: ${r.ft.length} frames  frame p50 ${q(r.ft, .5).toFixed(1)} p95 ${f95.toFixed(1)} max ${Math.max(...r.ft).toFixed(0)} ms | objects p50 ${q(r.ob, .5)} p95 ${o95} max ${Math.max(...r.ob)} | draw calls p50 ${q(r.dc, .5)} p95 ${d95}`);
    ok(`${name}: ran ${FR} frames`, r.ft.length >= FR * .9, r.ft.length);
    ok(`${name}: frame cost p50 ${q(r.ft, .5).toFixed(1)} ms <= ${P50_MS}, p95 ${f95.toFixed(1)} ms <= ${FRAME_MS}`, f95 <= FRAME_MS && q(r.ft, .5) <= P50_MS);
    ok(`${name}: objects per frame p95 ${o95} <= ${OBJ}${o95 > 64 ? ' (over diet target 64)' : ''}`, o95 <= OBJ);
    ok(`${name}: draw calls per frame p95 ${d95} <= ${CALLS}`, d95 <= CALLS);
    ok(`${name}: no page errors`, !p.errs.length, p.errs[0]);
    await p.context().close();
  }
  await B.close(); done('perf');
})().catch(e => { console.log('FAIL perf crash :: ' + e.message); process.exit(1); });
