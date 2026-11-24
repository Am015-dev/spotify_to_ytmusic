// Ochre Horizon balance sim (headless, engine + ai only). node sim-balance.js [games=300] [policy: good|naive|both] [rivalLevel=normal]
// Seat 0 / seat 1 alternate for the scripted policy. Prints a JSON summary line per policy and a table.
globalThis.OH_MAP = require('./src/map.js');
const OH = require('./src/engine.js'), AI = require('./src/ai.js');
const N = +process.argv[2] || 300, WHICH = process.argv[3] || 'both', RIVAL = process.argv[4] || 'normal';

function clone(G) { const l = G.log, e = G.ev; G.log = []; G.ev = []; const s = JSON.stringify(G); G.log = l; G.ev = e; const c = JSON.parse(s); c.log = []; c.ev = []; return c; }
// try a move on a clone, resolving placements greedily; return {dTR, spent} for player p
const PW = { mc: 1, steel: 1.8, ti: 2.6, plant: 1.6, energy: 1.2, heat: 0.7 };
function snap(p) {
  const P = OH.G.pl[p];
  let prod = 0; for (const r in PW) prod += P.prod[r] * PW[r];
  let awm = 0; ['cardVP', 'ehProd', 'lasting', 'edgeTiles'].forEach(m => { awm += OH.awardMetric(p, m); });
  return { sc: OH.score(p).total, res: P.mc + 1.8 * P.steel + 2.6 * P.ti + 1.6 * P.plant + 0.8 * P.heat, prod, act: OH.actionSources(p).length + OH.effects(p).length, awm };
}
// try a move on a clone, resolving placements greedily; gain in score-equivalents, spent in credit-equivalents
function probe(m, p) {
  const G0 = OH.G, log = G0.log, ev = G0.ev, a = snap(p);
  OH.G = clone(G0);
  let out = null;
  if (OH.performMove(m)) {
    let g = 0; while (OH.G.pending && g++ < 12) { const mv = OH.validMoves(); if (!mv.length) break; OH.performMove(AI.decide('normal') || mv[0]); }
    const b = snap(p), left = Math.max(2, 14 - OH.G.gen) / 2.5;
    out = { dTR: (b.sc - a.sc) + 0.5 * (b.prod - a.prod) * left + 1.2 * (b.act - a.act) * left + 0.6 * (b.awm - a.awm), spent: Math.max(0.5, a.res - b.res), dProd: 0 };
  }
  OH.G = G0; G0.log = log; G0.ev = ev;
  return out;
}
function isEngine(id) { const c = OH.card(id); if (!c) return false; if (c.type === 'active') return true; return (c.play || []).some(o => o.op === 'prod' && o.n > 0 && (o.r === 'mc' || o.r === 'steel' || o.r === 'ti')) || !!c.effect; }

const POL = {
  // setup / research / pending handled by AI for good; naive picks first thing
  good(p) {
    const G = OH.G, mv = OH.validMoves();
    if (G.pending) return AI.decide('normal');
    if (G.phase !== 'action') {
      if (G.phase === 'research') {
        const P = G.pl[p], ids = P.research.slice(), budget = Math.max(0, P.mc - 4);
        const pick = ids.filter(id => G.gen <= 3 ? isEngine(id) || OH.card(id).cost <= 12 : (OH.card(id).play || []).some(o => ['temp', 'oxy', 'ocean', 'green'].includes(o.op)) && OH.card(id).cost <= 20)
          .sort((a, b) => OH.card(a).cost - OH.card(b).cost);
        const out = []; pick.forEach(id => { if ((out.length + 1) * 3 <= budget && out.length < 3) out.push(id); });
        return { t: 'buy', ids: out };
      }
      return AI.decide('normal');
    }
    const P = G.pl[p];
    const mile = mv.find(m => m.t === 'mile'); if (mile) return mile;
    const cand = mv.filter(m => ['play', 'std', 'heat', 'green', 'act'].includes(m.t));
    if (G.gen <= 3) {
      const eng = cand.filter(m => m.t === 'play' && isEngine(m.id)).sort((a, b) => OH.card(a.id).cost - OH.card(b.id).cost);
      if (eng.length) return eng[0];
    }
    let best = null, br = 0;
    cand.forEach(m => {
      if (m.t === 'std' && (m.k === 'power' || (G.gen <= 3 && m.k !== 'city'))) return;
      const r = probe(m, p); if (!r) return;
      const gain = r.dTR + 0.8 * r.dProd * Math.max(1, (14 - G.gen) / 3);
      if (gain <= 0) return;
      const ratio = gain / r.spent; if (ratio > br) { br = ratio; best = m; }
    });
    if (best) return best;
    const lead = m => { const A = OH.MAP.AWARDS.find(a => a.k === m.k); return OH.awardMetric(p, A.m) - OH.awardMetric(1 - p, A.m); };
    const aw = mv.filter(m => m.t === 'award' && lead(m) >= 1).sort((a, b) => lead(b) - lead(a))[0];
    if (aw) return aw;
    return mv.find(m => m.t === 'pass');
  },
  naive(p) {
    const G = OH.G, mv = OH.validMoves();
    if (G.pending) return mv[0];
    if (G.phase === 'setup') { const pl = G.pl[p]; return { t: 'setup', corp: pl.offer.corps[0], buy: pl.offer.cards.slice(0, 3) }; }
    if (G.phase === 'research') { const P = G.pl[p]; return { t: 'buy', ids: P.mc >= 12 ? P.research.slice(0, 2) : [] }; }
    if (G.phase !== 'action') return mv[0];
    const plays = mv.filter(m => m.t === 'play');
    if (plays.length) return plays[Math.floor(OH.G.rs % plays.length)];   // pseudo-random, no evaluation
    const g = mv.find(m => m.t === 'green') || mv.find(m => m.t === 'heat'); if (g) return g;
    return mv.find(m => m.t === 'pass');
  }
};

function runOne(seed, pol, polSeat) {
  OH.newGame({ seed });
  const G = OH.G, dec = [0, 0], tot = [0, 0], fund = { mile: [0, 0], award: [0, 0] };
  let dead = 0, deadSell = 0, n = 0, endTurns = 0;
  const lvl = ['', ''];
  while (!OH.G.over && n++ < 8000) {
    const p = OH.sideToAct(); if (p < 0) break;
    if (OH.G.phase === 'action' && !OH.G.pending) {
      const mv = OH.validMoves().filter(m => m.t !== 'pass' && m.t !== 'end');
      if (!mv.length) dead++; else if (mv.every(m => m.t === 'sell')) deadSell++;
    }
    const m = p === polSeat ? POL[pol](p) : AI.decide(RIVAL);
    const inAction = OH.G.phase === 'action' && !OH.G.pending;
    if (!m || !OH.performMove(m)) return { err: JSON.stringify(m) + ' ' + OH.G.phase };
    tot[p]++; if (inAction) dec[p]++;
    if (m.t === 'mile') fund.mile[p]++; if (m.t === 'award') fund.award[p]++;
  }
  if (!OH.G.over) return { err: 'unfinished' };
  const maxed = G.temp >= 8 && G.oxy >= 14 && G.oceans >= 9;
  const f = G.final;
  return { win: G.winner === polSeat ? 1 : 0, gen: G.gen, dec: dec[polSeat], decR: dec[1 - polSeat], tot: tot[polSeat], maxed, dead, deadSell,
    trGap: f[polSeat].tr - f[1 - polSeat].tr, scGap: f[polSeat].total - f[1 - polSeat].total, mile: fund.mile[polSeat], mileR: fund.mile[1 - polSeat], award: fund.award[polSeat], awardR: fund.award[1 - polSeat],
    comp: ['tr','mile','award','green','city','cards'].map(k => f[polSeat][k] - f[1 - polSeat][k]), temp: G.temp, oxy: G.oxy, oc: G.oceans };
}
function run(pol) {
  const rs = []; let errs = 0;
  for (let g = 0; g < N; g++) { const r = runOne(2000 + g * 104729, pol, g % 2); if (r.err) { errs++; if (errs < 4) console.log('ERR', pol, g, r.err); } else rs.push(r); }
  const a = f => rs.reduce((s, r) => s + f(r), 0) / Math.max(1, rs.length);
  const seat = s => { const x = rs.filter((r, i) => i % 2 === s); return x.length ? (100 * x.reduce((q, r) => q + r.win, 0) / x.length).toFixed(0) : '-'; };
  const o = { policy: pol, games: rs.length, errs, winPct: +(100 * a(r => r.win)).toFixed(1), seat0Win: seat(0), seat1Win: seat(1), gens: +a(r => r.gen).toFixed(1),
    actionDecPerPlayer: +a(r => r.dec).toFixed(1), rivalActionDec: +a(r => r.decR).toFixed(1), totalMovesPerPlayer: +a(r => r.tot).toFixed(1),
    endMaxedPct: +(100 * a(r => r.maxed ? 1 : 0)).toFixed(1), endOtherPct: +(100 * a(r => r.maxed ? 0 : 1)).toFixed(1),
    deadStates: rs.reduce((s, r) => s + r.dead, 0), deadOnlySell: rs.reduce((s, r) => s + r.deadSell, 0), trGap: +a(r => r.trGap).toFixed(1), scoreGap: +a(r => r.scGap).toFixed(1),
    milePolicy: +a(r => r.mile).toFixed(2), mileRival: +a(r => r.mileR).toFixed(2), awardPolicy: +a(r => r.award).toFixed(2), awardRival: +a(r => r.awardR).toFixed(2),
    scoreDiffByComp: ['tr','mile','award','green','city','cards'].map((k, i) => k + ':' + a(r => r.comp[i]).toFixed(1)).join(' '),
    minGen: Math.min(...rs.map(r => r.gen)), maxGen: Math.max(...rs.map(r => r.gen)) };
  console.log(JSON.stringify(o));
}
const t0 = Date.now();
if (WHICH === 'good' || WHICH === 'both') run('good');
if (WHICH === 'naive' || WHICH === 'both') run('naive');
console.log('time', ((Date.now() - t0) / 1000).toFixed(0) + 's');
