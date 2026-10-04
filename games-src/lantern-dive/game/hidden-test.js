// Hidden information: no computer diver and no remote view may see what the seat must not see.   node hidden-test.js [games=30]
// 1. For states from real AI games, a POISONED copy (other divers' hands shuffled, the drone's face-down cards shuffled, secret predictions,
//    pending votes / passes, job-deck order, seed and rng changed) must give the same LD.stripView, the same netStrip and the same decision from
//    LD.AI.choose at every level. 2. A cheating control chooser (reads the real hands) must be caught by the same check.
const LD = require('./src/engine.js'); require('./src/ai.js'); const netStrip = require('./src/netstrip.js'); global.LD = LD;
const N = +process.argv[2] || 30; const D = LD.DATA;
function poison(G, seat) {
  const P = LD.clone(G); let r = 12345 + seat; const rnd = n => { r = (r * 1103515245 + 12345) & 0x7fffffff; return r % n; };
  const sh = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const others = P.players.filter(p => p.seat !== seat && !p.helper); const pool = sh(others.flatMap(p => p.hand));
  for (const p of others) { p.hand = pool.splice(0, p.hand.length).sort((a, b) => a - b); p.mem = { gave: { to: 0, c: rnd(36) }, got: { from: 1, c: rnd(36) } }; p.pingUsed = p.pingUsed; }
  const H = P.players.find(p => p.helper); if (H) { const bots = sh(H.stacks.map(s => s[1]).filter(x => x >= 0)); H.stacks.forEach(s => { if (s[1] >= 0) s[1] = bots.pop(); }); H.hand = H.stacks.flatMap(s => s.filter(x => x >= 0)); }
  P.tasks.forEach(t => { if (D.tasks[t.id].k === 'pred' && !D.tasks[t.id].open && t.owner >= 0 && LD.ctl(G, t.owner) !== seat && t.pn >= 0) t.pn = (t.pn + 1 + rnd(3)) % (G.ntr + 1); });
  if (P.as && P.as.votes) for (const k in P.as.votes) if (+k !== seat) P.as.votes[k] = rnd(P.np);
  if (P.pass && P.pass.give) for (const k in P.pass.give) if (+k !== seat) P.pass.give[k] = rnd(36);
  P.tdeck = sh(P.tdeck.slice()); P.tdisc = sh(P.tdisc.slice()); P.rng = 99991 + rnd(1000); P.seed = 77;
  return P;
}
let checks = 0, viewDiff = 0, netDiff = 0, decDiff = 0, leakDiff = 0, cheatCaught = 0, cheatTotal = 0;
function cheatChoose(G, seat) { // reads the real hands: chooses the card that the (unseen) next diver could not beat. Used only as a control.
  const mv = LD.moves(G, seat).filter(m => m.t === 'play'); if (!mv.length) return null;
  const T = G.trick; let best = mv[0], bs = -1;
  for (const m of mv) { let s = 0; const nx = G.players[(seat + 1) % G.np]; s = -nx.hand.filter(x => LD.suit(x) === LD.suit(m.c) && LD.val(x) > LD.val(m.c)).length; if (bs < 0 || s > bs) { bs = s; best = m; } }
  return best;
}
const t0 = Date.now();
for (let g = 0; g < N; g++) {
  const np = 2 + (g % 4), id = [1, 6, 7, 9, 11, 17, 20, 24, 26, 29][g % 10];
  const lv = ['easy', 'normal', 'hard'][g % 3];
  const G = LD.newGame({ players: np, seed: 500 + g, mission: { kind: 'log', id }, ai: Array(np).fill(lv) });
  G.players.forEach(p => { if (!p.helper) p.ai = lv; });
  let steps = 0;
  while (G.phase !== 'over' && steps++ < 600) {
    const pend = LD.pending(G);
    if (steps % 5 === 1 || G.phase === 'pass' || G.phase === 'predict') {
      for (const seat of (G.phase === 'play' || G.phase === 'assign' ? pend.slice(0, 1) : pend)) {
        const P = poison(G, seat); checks++;
        const a = JSON.stringify(LD.stripView(G, seat)), b = JSON.stringify(LD.stripView(P, seat)); if (a !== b) { viewDiff++; if (viewDiff < 3) { const A = JSON.parse(a), B = JSON.parse(b); const ks = Object.keys(A).filter(k => JSON.stringify(A[k]) !== JSON.stringify(B[k])); console.log('stripView differs for seat', seat, 'phase', G.phase, ks, ks.includes('players') ? A.players.map((p, i) => Object.keys(p).filter(k => JSON.stringify(p[k]) !== JSON.stringify(B.players[i][k]))) : ''); } }
        const n1 = JSON.stringify(netStrip(G, seat)), n2 = JSON.stringify(netStrip(P, seat)); if (n1 !== n2) netDiff++;
        if (G.players[seat] && !G.players[seat].helper) {
          // the stripped copy shows no other hand
          const V = LD.stripView(G, seat); for (const p of V.players) if (p.seat !== seat && !p.helper && p.hand.some(x => x >= 0)) leakDiff++; const Hh = V.players.find(p => p.helper); if (Hh && Hh.stacks.some(s => s[1] >= 0)) leakDiff++;
          for (const l of ['easy', 'normal', 'hard']) { if (l === 'hard' && steps % 15 !== 1) continue; const m1 = LD.AI.choose(G, seat, l), m2 = LD.AI.choose(P, seat, l); if (JSON.stringify(m1) !== JSON.stringify(m2)) { decDiff++; if (decDiff < 3) console.log('decision differs', l, G.phase, JSON.stringify(m1), JSON.stringify(m2)); } }
        }
        if (G.phase === 'play' && !G.players[seat].helper && G.players[seat].hand.length > 2 && G.trick.plays.length === 0) { cheatTotal++; const c1 = cheatChoose(G, seat), c2 = cheatChoose(P, seat); if (JSON.stringify(c1) !== JSON.stringify(c2)) cheatCaught++; }
      }
    }
    if (!LD.AI.step(G)) break;
  }
}
const res = { games: N, checks, strippedViewDiffs: viewDiff, netStripDiffs: netDiff, decisionDiffs: decDiff, leakedHands: leakDiff, controlCheaterCaught: cheatCaught + '/' + cheatTotal, secs: +((Date.now() - t0) / 1000).toFixed(1) };
console.log(JSON.stringify(res));
process.exit(viewDiff || netDiff || decDiff || leakDiff || (cheatTotal && !cheatCaught) ? 1 : 0);
