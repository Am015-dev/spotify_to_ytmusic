// Recorder injected into the page (PRE of humanbot.js, see stay-test.js). Per run: every foe that was on screen (not boss / mini boss / mine / gate):
// seconds on screen, killed or left alive, and the most foes on screen at one time.
(() => {
  if (window.__srInit) return; window.__srInit = 1;
  let R = null;
  const W = 960, H = 540;
  window.__rec = (m, i) => {
    if (i <= 1 || !R) R = { en: new Map(), done: [], maxOn: 0 };
    const G = m.G, t = G.t, seen = new Set(); let on = 0;
    for (const e of G.en) {
      if (e.type === 'boss' || e.mini || e.type === 'mine' || e.type === 'gate') continue; seen.add(e);
      let r = R.en.get(e); if (!r) { r = { ty: e.type, in: -1, end: -1 }; R.en.set(e, r); }
      const inside = e.x < W - 6 && e.x > -10 && e.y > -10 && e.y < H + 10;
      if (inside) { on++; if (r.in < 0) r.in = t; }
      r.last = t; r.hp = e.hp;
    }
    for (const [e, r] of R.en) if (!seen.has(e) && !r.fin) { r.fin = 1; r.end = t; r.killed = e.hp <= 0 || r.hp <= 0; if (r.in >= 0) R.done.push(r); }
    R.maxOn = Math.max(R.maxOn, on);
  };
  window.__recOut = (m) => R ? { dwell: R.done.map(r => +(r.end - r.in).toFixed(2)), killed: R.done.filter(r => r.killed).length, left: R.done.filter(r => !r.killed).length, maxOn: R.maxOn, leftTy: R.done.filter(r => !r.killed).map(r => r.ty) } : null;
})();
