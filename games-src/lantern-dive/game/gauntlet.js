// All-computer crews.   node gauntlet.js N [players=4] [level=normal] [what=log:1-32] [seed0=1] [--att=5] [--timer]
// what: log:A-B (logbook dives A..B, games spread over them), job:A-B (single job-card practice dives for job cards A..B, 1-based),
//       deep:A-B (deep dive levels A..B), free:D (free dives of difficulty D).
// Every game is one dive played like a campaign: attempt 1, then (after a loss) same jobs again up to --att attempts, the distress flare
// from the 3rd (normal) / 2nd (hard) attempt. Reports first-attempt win %, cleared within 3 / within --att attempts, average attempts, errors,
// stalls (a game that stops making moves) and time per game.
const LD = require('./src/engine.js'); require('./src/ai.js');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flag = n => { const f = process.argv.find(a => a.startsWith('--' + n + '=')); return f ? f.split('=')[1] : null; };
const N = +args[0] || 40, NP = +args[1] || 4, LV = args[2] || 'normal', WHAT = args[3] || 'log:1-32', S0 = +args[4] || 1, MAXA = +flag('att') || 5, TIMER = process.argv.includes('--timer');
const [kind, rng] = WHAT.split(':'); const [A, B] = (rng || '1-32').split('-').map(Number);
let errors = 0, stalls = 0, games = 0, first = 0, c3 = 0, cAll = 0, attSum = 0, steps = 0, violations = 0; const errMsgs = [], whyF = {}; const t0 = Date.now();
const per = {};
for (let g = 0; g < N; g++) {
  const id = A + (g % (B - A + 1));
  const mission = kind === 'log' ? { kind: 'log', id } : kind === 'deep' ? { kind: 'deep', level: id } : kind === 'free' ? { kind: 'free', d: id } : { kind: 'free', d: 1, jobs: [id - 1] };
  const seed = S0 * 100000 + g;
  try {
    const G = LD.newGame({ players: NP, seed, mission, ai: Array(NP).fill(LV), timer: TIMER, forceJobs: kind === 'job' ? [id - 1] : null });
    let won = false, att = 0;
    for (att = 1; att <= MAXA; att++) {
      let guard = 0;
      while (G.phase !== 'over') {
        if (guard++ > 4000) { stalls++; errMsgs.push('stall seed ' + seed + ' ' + G.phase); break; }
        if (!LD.AI.step(G)) { stalls++; errMsgs.push('no AI move seed ' + seed + ' phase ' + G.phase); break; }
        steps++; if (guard % 25 === 0) { const e = LD.checkInvariants(G); if (e.length) throw new Error('invariant ' + e.join(';')); }
      }
      if (G.phase !== 'over') break;
      const e = LD.checkInvariants(G); if (e.length) throw new Error('final invariant ' + e.join(';'));
      if (G.result.ok) { won = true; break; }
      const k = G.result.why.replace(/[0-9]+/g, '#').slice(0, 70); whyF[k] = (whyF[k] || 0) + 1;
      if (att < MAXA) LD.nextAttempt(G, { same: true });
    }
    games++; const b = per[id] = per[id] || { n: 0, f: 0 }; b.n++;
    if (won) { cAll++; if (att <= 3) c3++; attSum += att; if (att === 1) { first++; b.f++; } } else attSum += MAXA;
  } catch (e) { errors++; errMsgs.push('seed ' + seed + ' mission ' + id + ': ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); }
}
const pc = (x, n) => +(100 * x / Math.max(1, n)).toFixed(1);
const out = { what: WHAT, players: NP, level: LV, timer: TIMER, games, errors, stalls, firstAttemptWinPct: pc(first, games), clearedWithin3Pct: pc(c3, games), ['clearedWithin' + MAXA + 'Pct']: pc(cAll, games), avgAttempts: +(attSum / Math.max(1, games)).toFixed(2), secs: +((Date.now() - t0) / 1000).toFixed(1), msPerGame: Math.round((Date.now() - t0) / Math.max(1, games)), steps };
if (process.argv.includes('--per')) out.perMission = Object.fromEntries(Object.entries(per).map(([k, v]) => [k, pc(v.f, v.n)]));
if (process.argv.includes('--why')) out.fails = whyF;
console.log(JSON.stringify(out));
for (const m of errMsgs.slice(0, 8)) console.log('  ' + m);
process.exit(errors || stalls ? 1 : 0);
