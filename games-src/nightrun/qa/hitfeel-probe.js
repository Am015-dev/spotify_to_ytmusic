// W169 probe (STREET-BAR-SCORE-2026-10-23.md appendix + hit-stop / recoil / Kai-knockback counters). Run: DBG=$PWD/games-src/nightrun/qa/hitfeel-probe.js GATE=0 RT=0 DUMP=out.json [Q="&hitfeel=1"] node games-src/nightrun/qa/streetsim.js; then python3 games-src/nightrun/qa/hitfeel-sum.py out.json
(() => {
  let L = null, lastS = null;
  const ATT = { rusher: ['crouch', 'lunge'], heavy: ['wind', 'charge'], bigheavy: ['wind', 'charge'], gunner: ['pop'] };
  window.__dbgObs = (S) => {
    if (S !== lastS) { lastS = S; L = window.__dbgLog = { hs: [], shakes: [], hitsN: 0, hitsFlinch: 0, hitsSpark: 0, hitsKb: 0, att: [0, 0, 0, 0, 0, 0, 0], attMax: 0, tele: [], unread: [], kb: [], boss: null, sz: null, prev: {} }; }
    const P = S.P, t = S.time, pv = L.prev;
    // F1 hit-stop: a new S.hs above last step's
    if (S.hs > (pv.hs || 0) + 1e-4) L.hs.push([+(S.hs * 1000).toFixed(0), +t.toFixed(2)]);
    // F2: landed hits = enemy flash just set to .08
    const fxN = S.fx.length;
    for (const e of S.E) { const f = e.flash || 0; if (f > .079 && (e._pf || 0) < .079 && !e.dead) { L.hitsN++; e._hitT = t; e._hitVx = e.vx; e._fx0 = pv.fxN; } e._pf = f; }
    // F3 shake: new shake value; was it a hit/kill/hurt this or last step?
    if (S.shake > (pv.shake || 0) + .01) L.shakes.push([+S.shake.toFixed(1), S.hurts !== pv.hurts || S.kills !== pv.kills ? 'hurt/kill' : S.E.some(e => e._hitT >= t - 2 / 60) ? 'hit' : 'other', S.P.w]);
    // F4 player knockback: displacement over the hurt
    if (S.hurts > (pv.hurts || 0)) L.kb.push({ x0: P.x, t0: t, src: (S.hlog || [])[S.hurts - 1] });
    for (const k of L.kb) if (k.d == null && t - k.t0 > .6) k.d = +Math.abs(P.x - k.x0).toFixed(0);
    // E1/E2: telegraph lengths and simultaneous attackers
    let n = 0;
    for (const e of S.E) { if (e.dead) continue; const a = ATT[e.id]; if (!a) continue; const st = e.state;
      const tel = (e.tele || 0) > 0 || st === a[0];
      if (tel) { if (e._tS == null) e._tS = t; } 
      const act = a.includes(st) || (e.tele || 0) > 0; if (act) n++;
      if (e._ps !== st) { // attack start
        if ((e.id === 'rusher' && st === 'lunge') || (e.heavy && st === 'charge')) { const d = e._tS == null ? 0 : t - e._tS; L.tele.push([e.id, st, +d.toFixed(2)]); e._lastTele = d; }
        if (!tel && st !== 'lunge' && st !== 'charge') e._tS = null;
        e._ps = st; }
      if (!tel && !(e.id === 'rusher' && st === 'lunge') && !(e.heavy && st === 'charge')) e._tS = null;
    }
    // gunner shots: tele running before each new bullet (charge mode has none)
    for (const b of S.eb) if (!b._seen) { b._seen = 1; let g = null; for (const e of S.E) if (!e.dead && e.id === b.src && (!g || Math.abs(e.x - b.x) < Math.abs(g.x - b.x))) g = e;
      if (g && g.id === 'gunner') { const d = g._gT0 == null ? 0 : t - g._gT0; L.tele.push(['gunner', g.state === 'charge' ? 'charge-shot' : g.state === 'pop' ? 'pop-shot' : 'open-shot', +d.toFixed(2)]); } }
    for (const e of S.E) if (e.id === 'gunner') { if ((e.tele || 0) > 0 || e.state === 'pop') { if (e._gT0 == null) e._gT0 = t; } else if (!S.eb.some(b => b.src === 'gunner' && b.life > 0 && t - (b._t || 0) < .05)) e._gT0 = null; }
    L.att[Math.min(6, n)]++; L.attMax = Math.max(L.attMax, n);
    // boss timeline
    const B = S.boss;
    if (B && !L.boss) L.boss = { on: +t.toFixed(2), hp0: B.hp, h: B.h, w: B.w, seq: [], hits: 0, hurtsBy: 0, dodged: 0, charges: 0, dmgBy: {}, windows: [], end: null, cur: null, adds: 0 };
    if (B && L.boss) { const Bo = L.boss;
      if (B.state !== Bo.cur) { if (Bo.cur) Bo.seq.push([Bo.cur, +(t - Bo.curT).toFixed(2)]); 
        if (Bo.cur === 'charge') { Bo.charges++; if (S.hurts === Bo.h0) Bo.dodged++; }
        if (B.state === 'charge') Bo.h0 = S.hurts;
        Bo.cur = B.state; Bo.curT = t; }
      if (B.hp < (pv.bhp == null ? B.hp : pv.bhp) - 1e-6) { const k = B.state; Bo.dmgBy[k] = +((Bo.dmgBy[k] || 0) + (pv.bhp - B.hp)).toFixed(2); }
      if (S.hurts > (pv.hurts || 0) && /bigheavy/.test((S.hlog || [])[S.hurts - 1] || '')) Bo.hurtsBy++;
      if (B.dead && Bo.end == null) Bo.end = +t.toFixed(2);
      pv.bhp = B.hp; }
    if (!L.sz) { const k = S.E.find(e => e.id === 'rusher'); if (k) L.sz = { kai: P.h, rusher: k.h }; }
    pv.hs = S.hs; pv.shake = S.shake; pv.hurts = S.hurts; pv.kills = S.kills; pv.fxN = fxN;
  };
})();
(() => {
  const o = window.__dbgObs; let lastS = null, pv = {};
  window.__dbgObs = (S) => {
    o(S); const L = window.__dbgLog, t = S.time;
    if (S !== lastS) { lastS = S; pv = {}; L.q = { hits: 0, kn: 0, knN: 0, hist: {}, byW: {}, kills: [], k35: [] }; }
    const Q = L.q, P = S.P;
    for (const e of S.E) { const f = e.flash || 0;
      if (f > .079 && (e._qf || 0) < .079 && !e.dead) { Q.hits++; const fr = Math.round(Math.max(S.hs, S.hf || 0) * 60); Q.hist[fr] = (Q.hist[fr] || 0) + 1;
        const w = P.w; (Q.byW[w] = Q.byW[w] || { n: 0, ok: 0 }).n++; if (fr >= 1 && fr <= 7) Q.byW[w].ok++;
        if (!e.boss && e._qx != null) { Q.knN++; if (e._kbt != null && t - e._kbt < 1.5 / 60) Q.kn++; } }
      e._qf = f; e._qx = e.x; }
    if (S.kills > (pv.kills || 0)) Q.kills.push(Math.round(Math.max(S.hs, S.hf || 0) * 60));
    if (S.hurts > (pv.hurts || 0)) pv.h = { x0: P.x, t0: t };
    if (pv.h && t - pv.h.t0 >= .35) { Q.k35.push(Math.round(Math.abs(P.x - pv.h.x0))); pv.h = null; }
    pv.kills = S.kills; pv.hurts = S.hurts;
  };
})();
