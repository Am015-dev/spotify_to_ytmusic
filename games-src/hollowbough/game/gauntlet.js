// AI-vs-AI games.   node gauntlet.js N [players=2] [levelA] [levelB] [seed0] [--solo diff]
// Reports errors, stalls, average turns/score, win split per seat, endings.
const HB = require('./src/engine.js'); require('./src/ai.js');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const N = +args[0] || 20, NP = +args[1] || 2, LA = args[2] || 'normal', LB = args[3] || LA, S0 = +args[4] || 1;
const soloArg = process.argv.indexOf('--solo'); const SOLO = soloArg >= 0 ? (+process.argv[soloArg + 1] || 1) : 0;
const MAXSTEPS = 4000;
let errors = 0, stalls = 0, done = 0, turns = 0, steps = 0, wins = new Array(NP).fill(0), ties = 0, scoreSum = new Array(NP).fill(0), solowins = 0, grimSum = 0;
const endings = {}; const t0 = Date.now(); const errMsgs = [];
let decMs = 0, decN = 0, decMax = 0;
const byLevel = {}, comp = { cards: 0, tokens: 0, bonus: 0, events: 0, journey: 0, city: 0, hand: 0, n: 0 };
for (let g = 0; g < N; g++) {
  const levels = []; for (let i = 0; i < NP; i++) levels.push(i % 2 === 0 ? LA : LB);
  const seat0 = (g % NP); // rotate which level sits in which seat when levels differ
  const pl = []; for (let i = 0; i < (SOLO ? 1 : NP); i++) pl.push({ name: 'S' + i, ai: levels[(i + seat0) % NP] });
  let G;
  try {
    G = HB.newGame({ players: pl, solo: SOLO ? { difficulty: SOLO } : null, seed: S0 * 1000 + g });
    let n = 0, last = '', same = 0;
    while (G.phase !== 'over' && n < MAXSTEPS) {
      const a = HB.actor(G);
      const ta = Date.now();
      const m = HB.AI.choose(G, a);
      const dt = Date.now() - ta; decMs += dt; decN++; if (dt > decMax) decMax = dt;
      const r = HB.apply(G, m);
      if (!r.ok) throw new Error('illegal AI move ' + JSON.stringify(m) + ' ' + r.error);
      n++;
      if (n % 25 === 0) { const e = HB.checkInvariants(G); if (e.length) throw new Error('invariant ' + e.join(';')); }
      const sig = G.turn + ':' + G.logN + ':' + (G.q ? G.q.kind : '') + ':' + G.players.map(p => p.hand.length + p.dep.length + p.city.length).join(',');
      if (sig === last) { if (++same > 60) { stalls++; errMsgs.push('stall seed ' + (S0 * 1000 + g)); break; } } else { same = 0; last = sig; }
    }
    if (G.phase !== 'over') { if (n >= MAXSTEPS) { stalls++; errMsgs.push('no end after ' + n + ' steps, seed ' + (S0 * 1000 + g)); } continue; }
    const e = HB.checkInvariants(G); if (e.length) throw new Error('final invariant ' + e.join(';'));
    done++; turns += G.turn; steps += n;
    const sc = G.over.scores; sc.forEach((s, i) => { scoreSum[i] += s.total; const lv = G.players[i].ai; const b = byLevel[lv] = byLevel[lv] || { games: 0, wins: 0, score: 0 }; b.games++; b.score += s.total; if (!SOLO && G.over.winner === i) b.wins++; for (const k of ['cards', 'tokens', 'bonus', 'events', 'journey']) comp[k] += s[k]; comp.city += G.players[i].city.length; comp.hand += G.players[i].hand.length; comp.n++; });
    if (SOLO) { if (G.over.win) solowins++; grimSum += G.over.grim.total; }
    else { if (G.over.tie) ties++; wins[G.over.winner]++; }
    const evs = G.players.reduce((a, p) => a + HB.score(G, p.seat).evCount, 0);
    const k = (G.players.every(p => p.season === 3) ? 'all reached autumn' : 'someone stopped early'); endings[k] = (endings[k] || 0) + 1;
  } catch (e) { errors++; errMsgs.push('seed ' + (S0 * 1000 + g) + ': ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); }
}
const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(JSON.stringify({ N, players: SOLO ? 'solo L' + SOLO : NP, levels: SOLO ? LA : (LA === LB ? LA : LA + '/' + LB + ' (rotating seats)'), done, errors, stalls, avgTurns: +(turns / Math.max(1, done)).toFixed(1), avgSteps: +(steps / Math.max(1, done)).toFixed(0), avgScore: scoreSum.map(s => +(s / Math.max(1, done)).toFixed(1)), winsBySeat: SOLO ? undefined : wins, winPct: SOLO ? undefined : wins.map(w => +(100 * w / Math.max(1, done)).toFixed(1)), ties: SOLO ? undefined : ties, soloWinPct: SOLO ? +(100 * solowins / Math.max(1, done)).toFixed(1) : undefined, avgGrim: SOLO ? +(grimSum / Math.max(1, done)).toFixed(1) : undefined, endings, byLevel: Object.fromEntries(Object.entries(byLevel).map(([k, b]) => [k, { winPct: +(100 * b.wins / b.games).toFixed(1), avgScore: +(b.score / b.games).toFixed(1) }])), perPlayerAvg: Object.fromEntries(Object.entries(comp).filter(([k]) => k !== 'n').map(([k, v]) => [k, +(v / Math.max(1, comp.n)).toFixed(1)])), secs: +secs, msPerDecision: +(decMs / Math.max(1, decN)).toFixed(2), maxDecisionMs: decMax }));
for (const m of errMsgs.slice(0, 8)) console.log('  ' + m);
process.exit(errors || stalls ? 1 : 0);
