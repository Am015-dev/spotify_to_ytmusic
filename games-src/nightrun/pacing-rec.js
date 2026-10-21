// Recorder injected into the page (PRE of humanbot.js, see pacing-test.js). Per run: for every non-boss enemy its spawn time, when it came on screen, when it
// ended (killed or left alive), hits taken, time spent in the upper two thirds, mean speed; plus kills and the kill goal when the stage's song ended.
(() => {
  if (window.__recInit) return; window.__recInit = 1;
  let R = null;
  const reset = () => { R = { en: new Map(), done: [], killsAtEnd: null, kv: 0, maxOn: 0, onSum: 0, onN: 0, spawn: 0 }; };
  const W = 960, H = 540;   // hits = frames in which a foe's hull went down
  window.__rec = (m, i) => {
    if (i <= 1 || !R) reset();
    const G = m.G, t = G.t, seen = new Set(); let on = 0;
    for (const e of G.en) {
      if (e.type === 'boss' || e.mini) continue; seen.add(e);
      let r = R.en.get(e); if (!r) { r = { ty: e.type + (e.el ? '*' : ''), sp: t, in: -1, hits: 0, hp: e.hp, mx: e.max || e.hp, up: 0, x: e.x, d: 0, v: 0, n: 0 }; R.en.set(e, r); R.spawn++; }
      r.hits = e.phc || 0;
      const inside = e.x < W - 6 && e.x > -10 && e.y > -10 && e.y < H + 10;
      if (inside) { on += e.type === 'swarm' ? .34 : e.type === 'mine' ? .5 : 1; if (r.in < 0) r.in = t; if (e.y < H * 2 / 3) r.up += 1 / 60; }
      const dd = Math.hypot(e.x - r.x, e.y - (r.y == null ? e.y : r.y)); if (r.y != null && inside) { r.d += dd; r.n++; } r.x = e.x; r.y = e.y;
    }
    for (const [e, r] of R.en) if (!seen.has(e) && !r.fin) { r.fin = 1; r.zs = !!e.zs; r.end = t; r.killed = e.hp <= 0; if (r.in >= 0) R.done.push(r); }
    R.maxOn = Math.max(R.maxOn, on); R.onSum += on; R.onN++;
    if (R.killsAtEnd == null && G.dbar >= m.ST.len - .5) { R.killsAtEnd = G.kills; R.tEnd = t; }
    R.kv = m.ST.kv;
  };
  window.__recOut = (m) => {
    if (!R) return null; const q = a => { a = a.slice().sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : 0; };
    const d = R.done, dw = d.map(r => r.end - r.in), kd = d.filter(r => r.killed), lv = d.filter(r => !r.killed);
    const sp = {}; for (const r of d) if (r.n > 20) (sp[r.ty] = sp[r.ty] || []).push(r.d / (r.n / 60));
    const fast = d.filter(r => !/^(turret|gunship|gate|gtank|gturret|gwalker|mine)/.test(r.ty));
    return { spawns: R.spawn, done: d.length, dwell: dw, killed: kd.length, left: lv.length, hits: kd.filter(r => r.hits > 0).map(r => [r.ty, r.hits, r.mx]),
      up: fast.map(r => +r.up.toFixed(2)), upLeft: lv.filter(r => !r.zs && !/^(turret|gunship|gate|gtank|gturret|gwalker|mine)/.test(r.ty)).map(r => +r.up.toFixed(2)), upLeftT: lv.filter(r => !/^(turret|gunship|gate|gtank|gturret|gwalker|mine)/.test(r.ty)).map(r => [r.ty, +r.up.toFixed(1), +(r.end - r.in).toFixed(1)]), hullHits: kd.map(r => [r.ty, r.mx]), speed: Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, +q(v).toFixed(0)])), kv: R.kv, dph: window.PAC ? PAC.dph : 1, kills: m.G.kills, killsAtEnd: R.killsAtEnd, tEnd: R.tEnd, maxOn: +R.maxOn.toFixed(1), avgOn: R.onSum / Math.max(1, R.onN), len: m.ST.len, spb: m.BT.spb };
  };
})();
