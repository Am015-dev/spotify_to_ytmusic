// W167 boss probe. In the page (DBG=qa/bossprobe.js for qa/streetsim.js): logs every boss attack, whether it hurt Kai, the opening after it and the phases.
// In node: node qa/bossprobe.js <streetsim JSONOUT file>  prints the boss numbers per bot (B1-B4 of benchmark/STREET-BAR.md).
if (typeof window !== 'undefined') (() => {
  let L = null, lastS = null; const WIND = ['wind', 'sb_throwW', 'sb_poundW', 'sb_leapW'];
  window.__dbgObs = (S) => {
    if (S !== lastS) { lastS = S; L = window.__dbgLog = { boss: null }; }
    const B = S.boss; if (!B) return;
    if (!L.boss) L.boss = { on: +S.time.toFixed(2), at: [], ph: [], end: null, h0: S.hurts, cur: null };
    const Bo = L.boss, t = S.time;
    if (B.state !== Bo.cur) { const a = Bo.at[Bo.at.length - 1];
      if (WIND.includes(B.state)) Bo.at.push({ a: B.state === 'wind' ? 'charge' : B.atk, t: +t.toFixed(2), hit: 0, open: 0 });
      if (Bo.cur === 'stun' && a) a.open = +(a.open + t - Bo.stT).toFixed(2);
      if (B.state === 'stun') Bo.stT = t; Bo.cur = B.state; }
    if (S.hurts > Bo.h0) { const src = (S.hlog || [])[S.hurts - 1] || ''; if (/bigheavy/.test(src) && Bo.at.length) { const a = Bo.at[Bo.at.length - 1]; a.hit++; (a.why = a.why || []).push(src + ' st=' + B.state + ' dx=' + Math.round(S.P.x - B.x) + ' py=' + Math.round(S.P.y) + ' dash=' + (S.P.dashIF > 0) + ' sT=' + B.sT.toFixed(2) + ' vy=' + Math.round(S.P.vy) + ' og=' + S.P.onGround); } Bo.h0 = S.hurts; }
    if (B.ph && Bo.ph[Bo.ph.length - 1] !== B.ph) Bo.ph.push(B.ph);
    if (B.dead && Bo.end == null) Bo.end = +t.toFixed(2);
  };
})();
else {
  const R = JSON.parse(require('fs').readFileSync(process.argv[2], 'utf8')), med = a => { if (!a.length) return '-'; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  for (const bot of [...new Set(R.map(r => r.bot))]) { const F = R.filter(r => r.bot === bot && r.dbg && r.dbg.boss && r.dbg.boss.end != null).map(r => r.dbg.boss);
    if (!F.length) { console.log(`INFO ${bot}: no finished boss fight`); continue; }
    const len = F.map(b => +(b.end - b.on).toFixed(1)), all = F.flatMap(b => b.at), by = {};
    for (const a of all) { const o = by[a.a] = by[a.a] || { n: 0, ok: 0 }; o.n++; if (!a.hit) o.ok++; }
    const ph3 = F.filter(b => b.ph.includes(3)), dist = F.map(b => new Set(b.at.map(a => a.a)).size), w = all.filter(a => a !== undefined);
    const opened = F.flatMap(b => b.at.slice(0, -1)), openOk = opened.filter(a => a.open >= 1).length;
    console.log(`INFO ${bot}: fights ${F.length}, length median ${med(len)} s (min ${Math.min(...len)} max ${Math.max(...len)}), attacks/fight ${med(F.map(b => b.at.length))}, distinct/fight median ${med(dist)} min ${Math.min(...dist)}, fights reaching phase 3 ${ph3.length} (all 3 phase notes ${ph3.filter(b => b.ph.join() === '1,2,3').length}), dodged ${Object.entries(by).map(([k, o]) => k + ' ' + (100 * o.ok / o.n).toFixed(0) + '% of ' + o.n).join(', ')}, opening >= 1 s after ${opened.length ? (100 * openOk / opened.length).toFixed(0) : '-'}% of attacks (median ${med(opened.map(a => a.open))} s)`);
  }
}
