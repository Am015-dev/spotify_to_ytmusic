// AI-vs-AI games.   node gauntlet.js N [players=3] [levelA=normal] [levelB=levelA] [seed0=1] [--sets=1|2|3|4|random] [--used]
// Seats alternate levelA/levelB (rotating which seat gets which, so seat bias cancels). Reports errors, stalls, scores, win split per seat
// (ties credited fractionally), win rate per level, game length in steps, explosion rate and decision times.
const CF = require('./src/engine.js'); require('./src/ai.js');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const opt = k => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : null; };
const N = +args[0] || 100, NP = +args[1] || 3, LA = args[2] || 'normal', LB = args[3] || LA, S0 = +args[4] || 1;
const setArg = opt('sets'); const setsList = setArg ? (setArg === 'random' ? ['random'] : [+setArg]) : [1, 2, 3, 4, 'random'];
let errors = 0, stalls = 0, done = 0, ties = 0, steps = 0, booms = 0, plays = 0;
const wins = new Array(NP).fill(0), score = new Array(NP).fill(0), byLevel = {}, bySet = {}, errMsgs = [], used = {};
let decMs = 0, decN = 0, decMax = 0, spoon = 0; const t0 = Date.now();
for (let g = 0; g < N; g++) {
  const off = g % NP, ai = []; for (let i = 0; i < NP; i++) ai.push((i + off) % 2 === 0 ? LA : LB);
  const seed = S0 * 100000 + g, sm = setsList[g % setsList.length];
  try {
    const G = CF.newGame({ players: NP, seed, ai, setMode: sm }); G.nolog = true; let st = 0, stall = 0;
    while (G.phase !== 'over') {
      const pend = CF.pending(G); let acted = 0;
      for (const s of pend) {
        const t = Date.now(); const m = CF.AI.choose(G, s); const dt = Date.now() - t; decMs += dt; decN++; if (dt > decMax) decMax = dt;
        if (!m) throw new Error('no move for seat ' + s + ' ' + G.phase);
        const mm = Object.assign({}, m); delete mm.label;
        const r = CF.apply(G, s, mm); if (!r.ok) throw new Error('illegal AI move ' + JSON.stringify(mm) + ' ' + r.error);
        acted++; st++;
      }
      if (!acted || st > 5000) { stalls++; errMsgs.push('stall seed ' + seed); break; }
      if (st % 25 === 0) { const e = CF.checkInvariants(G); if (e.length) throw new Error('invariant ' + e.join(';')); }
    }
    if (G.phase !== 'over') continue;
    const e = CF.checkInvariants(G); if (e.length) throw new Error('final invariant ' + e.join(';'));
    done++; steps += st; const w = G.winners; if (w.length > 1) ties++;
    const bs = bySet[sm] = bySet[sm] || { n: 0, score: 0 }; bs.n++;
    for (const i of w) { wins[i] += 1 / w.length; const b = byLevel[ai[i]] = byLevel[ai[i]] || { seats: 0, wins: 0, score: 0 }; b.wins += 1 / w.length; }
    for (let i = 0; i < NP; i++) { score[i] += G.players[i].vp; bs.score += G.players[i].vp; const b = byLevel[ai[i]] = byLevel[ai[i]] || { seats: 0, wins: 0, score: 0 }; b.seats++; b.score += G.players[i].vp; }
    for (const k of Object.keys(G.used)) used[k] = (used[k] || 0) + G.used[k];
    booms += G.used.explode || 0; plays += G.used.dieRound ? 0 : 0;
  } catch (e) { errors++; errMsgs.push('seed ' + seed + ': ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); }
}
const f = (x, d) => +(x / Math.max(1, d)).toFixed(1);
const out = { N, players: NP, levels: LA === LB ? LA : LA + '/' + LB + ' (seats rotate)', done, errors, stalls, ties, avgScoreBySeat: score.map(s => f(s, done)), winPctBySeat: wins.map(w => f(100 * w, done)),
  byLevel: Object.fromEntries(Object.entries(byLevel).map(([k, b]) => [k, { winPctPerSeat: f(100 * b.wins, b.seats), avgScore: f(b.score, b.seats), seats: b.seats }])),
  avgScoreBySet: Object.fromEntries(Object.entries(bySet).map(([k, b]) => [k, f(b.score, b.n * NP)])),
  stepsPerGame: f(steps, done), explosionsPerSeatGame: +(booms / Math.max(1, done * NP)).toFixed(2),
  secs: +((Date.now() - t0) / 1000).toFixed(1), msPerDecision: +(decMs / Math.max(1, decN)).toFixed(2), maxDecisionMs: decMax };
if (process.argv.includes('--used')) out.used = used;
console.log(JSON.stringify(out));
for (const m of errMsgs.slice(0, 8)) console.log('  ' + m);
process.exit(errors || stalls ? 1 : 0);
