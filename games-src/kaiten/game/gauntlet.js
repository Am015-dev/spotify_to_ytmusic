// AI-vs-AI games.   node gauntlet.js N [players=2] [levelA=normal] [levelB=levelA] [seed0=1]
// Seats alternate levelA/levelB (rotating which seat starts, so seat bias cancels). Reports errors, stalls, scores, win split per seat
// (ties credited fractionally) and win rate per level, decision times.
const KK = require('./src/engine.js'); require('./src/ai.js');
if (process.env.AIP) Object.assign(KK.AI.params, JSON.parse(process.env.AIP));
const args = process.argv.slice(2);
const N = +args[0] || 100, NP = +args[1] || 2, LA = args[2] || 'normal', LB = args[3] || LA, S0 = +args[4] || 1;
let errors = 0, stalls = 0, done = 0, ties = 0, turns = 0;
const wins = new Array(NP).fill(0), score = new Array(NP).fill(0), byLevel = {}, errMsgs = [], comp = { maki: 0, tempura: 0, sashimi: 0, dumpling: 0, nigiri: 0, wasabi: 0, pud: 0 };
let decMs = 0, decN = 0, decMax = 0; const t0 = Date.now();
const used = {};
for (let g = 0; g < N; g++) {
  const off = g % NP, ai = []; for (let i = 0; i < NP; i++) ai.push((i + off) % 2 === 0 ? LA : LB);
  const seed = S0 * 100000 + g;
  try {
    const G = KK.newGame({ players: NP, seed, ai }); let steps = 0;
    while (G.phase !== 'over') {
      let acted = 0;
      for (let s = 0; s < NP; s++) {
        if (G.players[s].picked) continue;
        const t = Date.now(); const m = KK.AI.choose(G, s); const dt = Date.now() - t; decMs += dt; decN++; if (dt > decMax) decMax = dt;
        if (!m) throw new Error('no move for seat ' + s);
        const r = KK.apply(G, s, m); if (!r.ok) throw new Error('illegal AI move ' + JSON.stringify(m) + ' ' + r.error);
        acted++; steps++;
      }
      if (!acted || steps > 400) { stalls++; errMsgs.push('stall seed ' + seed); break; }
      if (steps % 10 === 0) { const e = KK.checkInvariants(G); if (e.length) throw new Error('invariant ' + e.join(';')); }
    }
    if (G.phase !== 'over') continue;
    const e = KK.checkInvariants(G); if (e.length) throw new Error('final invariant ' + e.join(';'));
    done++; const w = G.winners; if (w.length > 1) ties++;
    for (const i of w) { wins[i] += 1 / w.length; const b = byLevel[ai[i]] = byLevel[ai[i]] || { seats: 0, wins: 0, score: 0 }; b.wins += 1 / w.length; }
    const S = KK.score(G);
    for (let i = 0; i < NP; i++) {
      score[i] += G.final.totals[i]; const b = byLevel[ai[i]] = byLevel[ai[i]] || { seats: 0, wins: 0, score: 0 }; b.seats++; b.score += G.final.totals[i];
      for (const r of S.rounds) for (const k of ['maki', 'tempura', 'sashimi', 'dumpling', 'nigiri', 'wasabi']) comp[k] += r.seats[i][k];
      comp.pud += S.pudding.pts[i];
    }
    for (const k of Object.keys(G.used)) used[k] = (used[k] || 0) + G.used[k];
  } catch (e) { errors++; errMsgs.push('seed ' + seed + ': ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); }
}
const f = (x, d) => +(x / Math.max(1, d)).toFixed(1);
const out = { N, players: NP, levels: LA === LB ? LA : LA + '/' + LB + ' (seats rotate)', done, errors, stalls, ties, avgScoreBySeat: score.map(s => f(s, done)), winPctBySeat: wins.map(w => f(100 * w, done)),
  byLevel: Object.fromEntries(Object.entries(byLevel).map(([k, b]) => [k, { winPctPerSeat: f(100 * b.wins, b.seats), gamesWonPct: f(100 * b.wins, done), avgScore: f(b.score, b.seats), seats: b.seats }])),
  avgPerSeatPerCategory: Object.fromEntries(Object.entries(comp).map(([k, v]) => [k, f(v, done * NP)])),
  secs: +((Date.now() - t0) / 1000).toFixed(1), msPerDecision: +(decMs / Math.max(1, decN)).toFixed(2), maxDecisionMs: decMax };
if (process.argv.includes('--used')) out.used = used;
console.log(JSON.stringify(out));
for (const m of errMsgs.slice(0, 8)) console.log('  ' + m);
process.exit(errors || stalls ? 1 : 0);
