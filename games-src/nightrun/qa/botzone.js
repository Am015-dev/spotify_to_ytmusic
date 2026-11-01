// W301: what a player SEES that the bullet list does not hold: telegraphed boss zones (BMV.hz: bands, columns, beams incl. the whole swept sector, walls) and the arena rule
// (BPL.arena: slab, grid columns, ghost, zone ring). Runs inside the page (installed as window.__zg by addInitScript); returns a cost for each of the 7x7 cells the bots search
// (gx -range..range outer, gy inner, default step 30 range 90 = 7x7). Only boss fights: 0 elsewhere. Read-only.
module.exports = function zg(m, px, py, step, range) {
  step = step || 30; range = range || 90;
  const out = [], G = m.G, e = G.boss, t = G.t, H = 540;
  const zs = e && window.BMV && BMV.hz ? BMV.hz.filter(z => !z.mk && t < z.off && z.on - t <= 1.3) : [], pr = zs.map(z => ({ z, p: z.sw ? [0, 1, 2, 3, 4, 5, 6].map(i => ({ g: [z.x, z.y, z.a0 + (z.a1 - z.a0) * i / 6, 1400, z.w + 30] })) : BMV.prims(z, true) }));   // a sweeping beam: the whole sector until it is over
  const rams = e && window.BMV ? BMV.hz.filter(z => z.mk && z.s === 'safe' && z.bad && t < z.off + .95).map(z => [z.y, z.h / 2 + 34]) : [];   // the ram / charge marker: the row the boss will run along, until the run is over
  const bp = e && e.bp, ar = bp && bp.ar, S = bp && bp.arS, x1 = e ? e.x - e.r - 10 : 0;
  for (let gx = -range; gx <= range; gx += step) for (let gy = -range; gy <= range; gy += step) {
    const cx = px + gx, cy = py + gy; let c = 0;
    if (e) {
      for (const o of pr) { let d = 1e9; for (const q of o.p) d = Math.min(d, BMV.sd(q, cx, cy)); const lim = o.z.sw ? 100 : 26; if (d < lim) c += (lim - d) * (lim - d) * 40; }
      for (const r of rams) { const d = Math.abs(cy - r[0]); if (d < r[1]) c += (r[1] - d) * (r[1] - d) * 40; }
      if (ar && S) {
        if (ar === 'slab' && S.on && t < S.off && cx < x1 + 40 && (S.top ? cy < S.h + 34 : cy > H - S.h - 34)) c += 60000;
        if (ar === 'grid' && S.c && S.on && t < S.off + .1 && S.on - t < 1.3) for (const x of S.c) { const d = Math.abs(cx - x); if (d < 44) c += (44 - d) * (44 - d) * 40; }
        if (ar === 'ghost' && S.gx != null) { const d = Math.hypot(cx - S.gx, cy - S.gy); if (d < 60) c += (60 - d) * (60 - d) * 20; }
        if (ar === 'zone' && S.cx != null) { const d = Math.hypot(cx - S.cx, cy - S.cy); if (d > S.r - 30) c += (d - S.r + 30) * (d - S.r + 30) * 8; }
      }
    }
    out.push(c);
  }
  return out;
};
